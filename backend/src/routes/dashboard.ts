import { Router } from 'express';
import { PaperModel } from '../models/Paper';
import { AuthorModel } from '../models/Author';
import { KeywordModel } from '../models/Keyword';
import { ConferenceModel } from '../models/Conference';

export const dashboardRouter = Router();

dashboardRouter.get('/', async (_req, res) => {
  const [total_papers, total_authors, total_keywords, total_conferences] = await Promise.all([
    PaperModel.estimatedDocumentCount(),
    AuthorModel.estimatedDocumentCount(),
    KeywordModel.estimatedDocumentCount(),
    ConferenceModel.estimatedDocumentCount()
  ]);

  const yearAgg = await PaperModel.aggregate([
    { $group: { _id: '$year', count: { $sum: 1 } } },
    { $project: { _id: 0, year: '$_id', count: 1 } },
    { $sort: { year: 1 } }
  ]);

  const year_range = yearAgg.length
    ? { min: yearAgg[0].year, max: yearAgg[yearAgg.length - 1].year }
    : { min: null, max: null };

  const top_keywords = await PaperModel.aggregate([
    { $unwind: '$keywords' },
    { $group: { _id: '$keywords', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    { $project: { _id: 0, keyword: '$_id', count: 1 } }
  ]);

  const recent_papers = await PaperModel.find({}, { title: 1, authors: 1, year: 1 })
    .sort({ created_at: -1 })
    .limit(10)
    .lean();

  // Get unique authors per year
  const authors_per_year = await PaperModel.aggregate([
    { $unwind: '$author_ids' },
    { $group: { _id: { year: '$year', author: '$author_ids' } } },
    { $group: { _id: '$_id.year', count: { $sum: 1 } } },
    { $project: { _id: 0, year: '$_id', count: 1 } },
    { $sort: { year: 1 } }
  ]);

  res.json({
    statistics: {
      total_papers,
      total_authors,
      total_keywords,
      total_conferences,
      year_range,
      papers_per_year: yearAgg,
      authors_per_year: authors_per_year
    },
    recent_activity: recent_papers,
    top_keywords,
    quick_stats: { total_papers, total_authors }
  });
});

dashboardRouter.get('/author-collaborations', async (_req, res) => {
  try {
    // Get all papers with author information
    const papers = await PaperModel.find({}, { authors: 1, author_ids: 1, title: 1, year: 1 }).lean();

    // Build collaboration graph
    const collaborationMap = new Map<string, Map<string, { papers: number; strength: number; paperId: string[] }>>();
    const authorPaperCount = new Map<string, number>();

    papers.forEach(paper => {
      const authorIds = paper.author_ids || [];
      
      // Count papers per author
      authorIds.forEach(id => {
        authorPaperCount.set(id, (authorPaperCount.get(id) || 0) + 1);
      });

      // Create collaboration edges for each pair of authors
      for (let i = 0; i < authorIds.length; i++) {
        for (let j = i + 1; j < authorIds.length; j++) {
          const id1 = authorIds[i];
          const id2 = authorIds[j];
          const key = id1 < id2 ? `${id1}|${id2}` : `${id2}|${id1}`;

          if (!collaborationMap.has(key)) {
            collaborationMap.set(key, new Map());
          }

          const collab = collaborationMap.get(key)!;
          const existing = collab.get('data') || { papers: 0, strength: 0, paperId: [] };
          existing.papers += 1;
          existing.paperId.push(paper._id?.toString() || '');
          collab.set('data', existing);
        }
      }
    });

    // Get author names
    const authorIds = Array.from(authorPaperCount.keys());
    const authors = await AuthorModel.find({ external_id: { $in: authorIds } }, { external_id: 1, name: 1 }).lean();
    const authorMap = new Map(authors.map(a => [a.external_id!, a.name || a.external_id || '']));

    // Build collaboration data
    const collaborations: Array<{ author1: string; author2: string; papers: number; strength: number }> = [];
    collaborationMap.forEach((_, key) => {
      const [id1, id2] = key.split('|');
      const data = collaborationMap.get(key)?.get('data');
      if (data) {
        const name1 = String(authorMap.get(id1) || id1);
        const name2 = String(authorMap.get(id2) || id2);
        const strength = Math.min(data.papers / 20, 1); // Normalize strength
        collaborations.push({
          author1: name1,
          author2: name2,
          papers: data.papers,
          strength
        });
      }
    });

    // Sort by papers count and get top collaborations
    const topCollaborations = collaborations.sort((a, b) => b.papers - a.papers).slice(0, 10);

    // Get top collaborators (authors with most collaborations)
    const collaboratorStats = new Map<string, { collaborations: number; papers: number }>();
    collaborations.forEach(collab => {
      collaboratorStats.set(collab.author1, {
        collaborations: (collaboratorStats.get(collab.author1)?.collaborations || 0) + 1,
        papers: (collaboratorStats.get(collab.author1)?.papers || 0) + collab.papers
      });
      collaboratorStats.set(collab.author2, {
        collaborations: (collaboratorStats.get(collab.author2)?.collaborations || 0) + 1,
        papers: (collaboratorStats.get(collab.author2)?.papers || 0) + collab.papers
      });
    });

    const topAuthors = Array.from(collaboratorStats.entries())
      .map(([name, stats]) => ({
        name,
        collaborations: stats.collaborations,
        papers: authorPaperCount.get(name.split('|')[0]) || stats.papers
      }))
      .sort((a, b) => b.papers - a.papers)
      .slice(0, 5);

    res.json({
      active_collaborations: topCollaborations,
      top_collaborators: topAuthors,
      total_collaborations: collaborations.length
    });
  } catch (error) {
    console.error('Error fetching author collaborations:', error);
    res.status(500).json({ error: 'Failed to fetch collaborations' });
  }
});


