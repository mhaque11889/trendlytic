"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRouter = void 0;
const express_1 = require("express");
const Paper_1 = require("../models/Paper");
const Author_1 = require("../models/Author");
const Keyword_1 = require("../models/Keyword");
const Conference_1 = require("../models/Conference");
exports.dashboardRouter = (0, express_1.Router)();
exports.dashboardRouter.get('/', async (_req, res) => {
    const [total_papers, total_authors, total_keywords, total_conferences] = await Promise.all([
        Paper_1.PaperModel.estimatedDocumentCount(),
        Author_1.AuthorModel.estimatedDocumentCount(),
        Keyword_1.KeywordModel.estimatedDocumentCount(),
        Conference_1.ConferenceModel.estimatedDocumentCount()
    ]);
    const yearAgg = await Paper_1.PaperModel.aggregate([
        { $group: { _id: '$year', count: { $sum: 1 } } },
        { $project: { _id: 0, year: '$_id', count: 1 } },
        { $sort: { year: 1 } }
    ]);
    const year_range = yearAgg.length
        ? { min: yearAgg[0].year, max: yearAgg[yearAgg.length - 1].year }
        : { min: null, max: null };
    const top_keywords = await Paper_1.PaperModel.aggregate([
        { $unwind: '$keywords' },
        { $group: { _id: '$keywords', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, keyword: '$_id', count: 1 } }
    ]);
    const recent_papers = await Paper_1.PaperModel.find({}, { title: 1, authors: 1, year: 1 })
        .sort({ created_at: -1 })
        .limit(10)
        .lean();
    // Get unique authors per year
    const authors_per_year = await Paper_1.PaperModel.aggregate([
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
