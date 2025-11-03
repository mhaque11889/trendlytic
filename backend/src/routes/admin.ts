import { Router } from 'express';
import { PaperModel } from '../models/Paper';
import { AuthorModel } from '../models/Author';
import { KeywordModel } from '../models/Keyword';

export const adminRouter = Router();

adminRouter.post('/clear', async (req, res) => {
  try {
    const target = String(req.body?.target || '').toLowerCase();
    const valid = ['papers','authors','keywords','all'];
    if (!valid.includes(target)) return res.status(400).json({ message: `target must be one of: ${valid.join(', ')}` });

    const results: Record<string, number> = {};

    if (target === 'papers' || target === 'all') {
      const r = await PaperModel.deleteMany({});
      results.papers = r.deletedCount || 0;
    }
    if (target === 'authors' || target === 'all') {
      const r = await AuthorModel.deleteMany({});
      results.authors = r.deletedCount || 0;
    }
    if (target === 'keywords' || target === 'all') {
      const r = await KeywordModel.deleteMany({});
      results.keywords = r.deletedCount || 0;
    }

    return res.json({ ok: true, cleared: results });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || 'Failed to clear collections' });
  }
});

adminRouter.get('/list', async (req, res) => {
  try {
    const type = String(req.query.type || '').toLowerCase();
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(200, Math.max(1, Number(req.query.pageSize || 50)));
    const skip = (page - 1) * pageSize;

    if (!['papers','authors','keywords'].includes(type)) {
      return res.status(400).json({ message: 'type must be one of papers, authors, keywords' });
    }

    if (type === 'papers') {
      const [items, total] = await Promise.all([
        PaperModel.find({}, { title: 1, year: 1, conference: 1, authors: 1, author_ids: 1, keywords: 1 })
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(pageSize)
          .lean(),
        PaperModel.estimatedDocumentCount()
      ]);
      return res.json({ items, total, page, pageSize });
    }

    if (type === 'authors') {
      const [items, total] = await Promise.all([
        AuthorModel.find({}, { name: 1, external_id: 1, papers_count: 1, total_citations: 1, affiliation: 1 })
          .sort({ papers_count: -1, name: 1 })
          .skip(skip)
          .limit(pageSize)
          .lean(),
        AuthorModel.estimatedDocumentCount()
      ]);
      return res.json({ items, total, page, pageSize });
    }

    // keywords
    const [items, total] = await Promise.all([
      KeywordModel.find({}, { keyword: 1, normalized_keyword: 1, count: 1 })
        .sort({ count: -1, keyword: 1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      KeywordModel.estimatedDocumentCount()
    ]);
    return res.json({ items, total, page, pageSize });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || 'Failed to list items' });
  }
});


