import { Router } from 'express';
import multer from 'multer';
import Papa from 'papaparse';
import xlsx from 'xlsx';
import { PaperModel } from '../models/Paper';
import { AuthorModel } from '../models/Author';
import { KeywordModel } from '../models/Keyword';

export const importRouter = Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

function normalizeHeader(h: string) {
  return h?.toString().trim().toLowerCase();
}

function parseBufferToRows(originalname: string, buffer: Buffer): any[] {
  const name = originalname.toLowerCase();
  if (name.endsWith('.csv')) {
    const text = buffer.toString('utf8');
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
    if (parsed.errors?.length) throw new Error(parsed.errors[0].message);
    return parsed.data as any[];
  } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    const wb = xlsx.read(buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    return xlsx.utils.sheet_to_json(ws, { defval: '' }) as any[];
  }
  throw new Error('Unsupported file type. Use CSV or XLSX.');
}

function normalizeRows(rows: any[]): any[] {
  return rows.map((r) => {
    const out: Record<string, any> = {};
    for (const k of Object.keys(r)) out[normalizeHeader(k)] = r[k];
    return out;
  });
}

importRouter.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'file is required' });
  try {
    const raw = parseBufferToRows(req.file.originalname, req.file.buffer);
    const normalized = normalizeRows(raw);
    const columns = Object.keys(normalized[0] || []);
    const required = ['title','authors','year','keywords','conference'];
    const missing = required.filter((r) => !columns.includes(r));
    if (missing.length) return res.status(400).json({ message: `Missing required columns: ${missing.join(', ')}` });
    const previewRows = normalized.slice(0, 10);
    return res.json({ totalRows: normalized.length, columns, previewRows });
  } catch (e: any) {
    return res.status(400).json({ message: e?.message || 'Failed to parse file' });
  }
});

importRouter.post('/process', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'file is required' });
  try {
    const raw = parseBufferToRows(req.file.originalname, req.file.buffer);
    const normalized = normalizeRows(raw);
    const columns = Object.keys(normalized[0] || []);
    const required = ['title','authors','year','keywords','conference'];
    const missing = required.filter((r) => !columns.includes(r));
    if (missing.length) return res.status(400).json({ message: `Missing required columns: ${missing.join(', ')}` });

    // Prepare bulk upserts with dedupe key
    // Try to detect author IDs column dynamically (e.g., 'author ids', 'author id', 'authors id', 'author(s) id')
    const authorIdKey = columns.find((c) => /author.*id/.test(c));
    const ops = [] as Array<any>;
    let rowsSkipped = 0;
    for (const r of normalized) {
      try {
        const title = String(r.title ?? '').trim();
        const yearRaw = r.year;
        const year = Number(yearRaw);
        const conference = String(r.conference ?? '').trim();
        const authors = (Array.isArray(r.authors) ? r.authors : String(r.authors ?? '').split(/;\s*/))
          .map((a: any) => String(a).trim())
          .filter(Boolean);
        const keywords = (Array.isArray(r.keywords) ? r.keywords : String(r.keywords ?? '').split(/[,;]\s*/))
          .map((k: any) => String(k).trim())
          .filter(Boolean);
        const author_ids = authorIdKey ? String(r[authorIdKey] ?? '').split(/;\s*/).map((id) => String(id).trim()).filter(Boolean) : [];

        if (!title || !conference || Number.isNaN(year) || !authors.length || !keywords.length) {
          rowsSkipped += 1;
          continue;
        }

        const dedupe_key = `${title.toLowerCase()}|${year}|${conference.toLowerCase()}`;
        const doc: any = {
          title,
          year,
          conference,
          authors,
          author_ids,
          keywords,
          abstract: r.abstract ?? '',
          file_link: r.file_link ?? r.filelink ?? r.link ?? '',
          doi: r.doi ?? '',
          citations: Number(r.citations ?? 0) || 0,
          publisher: r.publisher ?? '',
          pages: r.pages ?? '',
          volume: r.volume ?? '',
          issue: r.issue ?? '',
          dedupe_key
        };
        ops.push({
          updateOne: {
            filter: { dedupe_key },
            update: { $setOnInsert: doc },
            upsert: true
          }
        } as const);
      } catch {
        rowsSkipped += 1;
      }
    }

    const result = await PaperModel.bulkWrite(ops, { ordered: false });
    const inserted = result.upsertedCount ?? 0;
    const matched = result.matchedCount ?? 0;

    // Aggregate unique authors and keywords from this file and upsert them
    const authorCounts = new Map<string, number>();
    const authorMeta = new Map<string, { name?: string }>();
    const keywordCounts = new Map<string, number>();
    let mismatchedAuthorCounts = 0;

    const authorIdKey2 = columns.find((c) => /author.*id/.test(c));
    for (const r of normalized) {
      const authors = Array.isArray(r.authors)
        ? r.authors
        : String(r.authors ?? '')
            .split(/;\s*/)
            .filter(Boolean);
      const author_ids = authorIdKey2 ? String(r[authorIdKey2] ?? '').split(/;\s*/).filter(Boolean) : [];
      const keywords = Array.isArray(r.keywords)
        ? r.keywords
        : String(r.keywords ?? '')
            .split(/[,;]\s*/)
            .filter(Boolean);

      if (authorIdKey2 && author_ids.length && author_ids.length !== authors.length) {
        mismatchedAuthorCounts += 1;
      }

      for (let i = 0; i < authors.length; i++) {
        const a = authors[i];
        const extId = author_ids[i];
        const name = String(a).trim();
        if (!name && !extId) continue; // skip invalid author entry
        const key = extId ? `id:${extId}` : `name:${name}`;
        authorCounts.set(key, (authorCounts.get(key) || 0) + 1);
        if (!authorMeta.has(key)) authorMeta.set(key, { name: name || undefined });
      }
      for (const k of keywords) {
        const kw = String(k).trim();
        if (!kw) continue;
        keywordCounts.set(kw, (keywordCounts.get(kw) || 0) + 1);
      }
    }

    const authorOps = Array.from(authorCounts.entries()).map(([key, count]) => {
      if (key.startsWith('id:')) {
        const external_id = key.slice(3);
        return {
          updateOne: {
            filter: { external_id },
            update: { $setOnInsert: { external_id, name: authorMeta.get(key)?.name }, $inc: { papers_count: count } },
            upsert: true
          }
        } as const;
      }
      const name = key.slice(5);
      return {
        updateOne: {
          filter: { name },
          update: { $setOnInsert: { name }, $inc: { papers_count: count } },
          upsert: true
        }
      } as const;
    });

    const keywordOps = Array.from(keywordCounts.entries()).map(([keyword, count]) => ({
      updateOne: {
        filter: { keyword },
        update: { $setOnInsert: { keyword, normalized_keyword: keyword.toLowerCase() }, $inc: { count } },
        upsert: true
      }
    } as const));

    if (authorOps.length) await AuthorModel.bulkWrite(authorOps, { ordered: false });
    if (keywordOps.length) await KeywordModel.bulkWrite(keywordOps, { ordered: false });

    return res.json({ inserted, skipped: matched, total: ops.length, rows_skipped: rowsSkipped, warnings: { mismatched_author_counts: mismatchedAuthorCounts } });
  } catch (e: any) {
    return res.status(400).json({ message: e?.message || 'Failed to process import' });
  }
});


