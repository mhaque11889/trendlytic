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


