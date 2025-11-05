import { Router, Request, Response } from 'express';
import { KeywordTrendModel } from '../models/KeywordTrend';
import { KeywordModel } from '../models/Keyword';
import { PaperModel } from '../models/Paper';

export const trendsRouter = Router();

interface TrendData {
  keyword: string;
  year: number;
  count: number;
  papers: string[];
}

interface TrendAnalysis {
  keyword: string;
  data: TrendData[];
  growth_rate: number;
  yoy_change: number;
  trend_type: 'emerging' | 'stable' | 'declining';
  total_papers: number;
  latest_count: number;
}

/**
 * GET /api/trends
 * Get trend analysis for keywords over time
 * Query params: startYear, endYear, minPapers (default 1)
 */
trendsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const startYear = parseInt(req.query.startYear as string) || 2020;
    const endYear = parseInt(req.query.endYear as string) || new Date().getFullYear();
    const minPapers = parseInt(req.query.minPapers as string) || 1;

    // Get all keyword trends in the year range
    const trends = await KeywordTrendModel.find({
      year: { $gte: startYear, $lte: endYear }
    }).sort({ year: 1 });

    if (!trends || trends.length === 0) {
      return res.json({
        trends: [],
        insights: {
          total_topics: 0,
          total_data_points: 0,
          emerging_trends: [],
          declining_trends: [],
          stable_trends: []
        },
        years: { start: startYear, end: endYear }
      });
    }

    // Group trends by keyword
    const keywordMap = new Map<string, TrendData[]>();
    trends.forEach((t: any) => {
      if (!keywordMap.has(t.keyword)) {
        keywordMap.set(t.keyword, []);
      }
      keywordMap.get(t.keyword)!.push({
        keyword: t.keyword,
        year: t.year,
        count: t.count,
        papers: t.papers || []
      });
    });

    // Analyze each keyword
    const analyses: TrendAnalysis[] = [];
    keywordMap.forEach((data: TrendData[], keyword: string) => {
      const totalPapers = data.reduce((sum, d) => sum + d.count, 0);
      
      // Filter by minimum papers threshold
      if (totalPapers < minPapers) return;

      // Calculate growth rate (from first to last year)
      const firstCount = data[0].count;
      const lastCount = data[data.length - 1].count;
      const growthRate = firstCount > 0 ? ((lastCount - firstCount) / firstCount) * 100 : 0;

      // Calculate year-over-year change
      const yoyChange = data.length > 1 
        ? ((data[data.length - 1].count - data[data.length - 2].count) / Math.max(data[data.length - 2].count, 1)) * 100
        : 0;

      // Determine trend type
      let trendType: 'emerging' | 'stable' | 'declining';
      if (growthRate > 15) {
        trendType = 'emerging';
      } else if (growthRate < -15) {
        trendType = 'declining';
      } else {
        trendType = 'stable';
      }

      analyses.push({
        keyword,
        data,
        growth_rate: Math.round(growthRate * 100) / 100,
        yoy_change: Math.round(yoyChange * 100) / 100,
        trend_type: trendType,
        total_papers: totalPapers,
        latest_count: lastCount
      });
    });

    // Sort by growth rate descending
    analyses.sort((a, b) => b.growth_rate - a.growth_rate);

    // Categorize insights
    const emerging = analyses.filter(a => a.trend_type === 'emerging').slice(0, 10);
    const declining = analyses.filter(a => a.trend_type === 'declining').slice(0, 10);
    const stable = analyses.filter(a => a.trend_type === 'stable').slice(0, 10);

    res.json({
      trends: analyses,
      insights: {
        total_topics: analyses.length,
        total_data_points: trends.length,
        emerging_trends: emerging.map(t => ({
          keyword: t.keyword,
          growth_rate: t.growth_rate,
          papers: t.total_papers,
          latest_count: t.latest_count
        })),
        declining_trends: declining.map(t => ({
          keyword: t.keyword,
          growth_rate: t.growth_rate,
          papers: t.total_papers,
          latest_count: t.latest_count
        })),
        stable_trends: stable.map(t => ({
          keyword: t.keyword,
          growth_rate: t.growth_rate,
          papers: t.total_papers,
          latest_count: t.latest_count
        }))
      },
      years: { start: startYear, end: endYear }
    });
  } catch (error) {
    console.error('Trends fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch trends', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * GET /api/trends/keyword/:keyword
 * Get detailed trend data for a specific keyword
 */
trendsRouter.get('/keyword/:keyword', async (req: Request, res: Response) => {
  try {
    const keyword = req.params.keyword;
    const startYear = parseInt(req.query.startYear as string) || 2020;
    const endYear = parseInt(req.query.endYear as string) || new Date().getFullYear();

    const trends = await KeywordTrendModel.find({
      keyword: { $regex: keyword, $options: 'i' },
      year: { $gte: startYear, $lte: endYear }
    }).sort({ year: 1 }).populate('papers');

    if (!trends || trends.length === 0) {
      return res.json({ keyword, data: [], error: 'No data found' });
    }

    const totalPapers = trends.reduce((sum: number, t: any) => sum + (t.count as number), 0);
    const firstCount = (trends[0].count as number);
    const lastCount = (trends[trends.length - 1].count as number);
    const growthRate = firstCount > 0 ? ((lastCount - firstCount) / firstCount) * 100 : 0;

    res.json({
      keyword: trends[0].keyword,
      data: trends.map(t => ({
        year: t.year,
        count: t.count,
        papers: t.papers || []
      })),
      statistics: {
        total_papers: totalPapers,
        average_per_year: Math.round(totalPapers / trends.length),
        growth_rate: Math.round(growthRate * 100) / 100,
        min_year: trends[0].year,
        max_year: trends[trends.length - 1].year
      }
    });
  } catch (error) {
    console.error('Keyword trend fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch keyword trend', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * GET /api/trends/years
 * Get available year range in the database
 */
trendsRouter.get('/years/range', async (req: Request, res: Response) => {
  try {
    const years = await PaperModel.distinct('year');
    const sortedYears = years.sort((a: number, b: number) => a - b);

    res.json({
      min_year: sortedYears[0],
      max_year: sortedYears[sortedYears.length - 1],
      available_years: sortedYears
    });
  } catch (error) {
    console.error('Years fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch year range', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * POST /api/trends/populate
 * Populate KeywordTrend collection from existing papers and keywords
 * This should be called after importing data
 */
trendsRouter.post('/populate', async (req: Request, res: Response) => {
  try {
    const papers = await PaperModel.find().populate('keywords');
    const keywordsByYear = new Map<string, Map<number, { count: number; papers: string[] }>>();

    // Group papers by keyword and year
    papers.forEach((paper: any) => {
      if (!paper.keywords || paper.keywords.length === 0) return;
      
      paper.keywords.forEach((kw: any) => {
        const keywordName = kw.keyword || kw;
        if (!keywordsByYear.has(keywordName)) {
          keywordsByYear.set(keywordName, new Map());
        }

        const yearMap = keywordsByYear.get(keywordName)!;
        const key = `${paper.year}`;
        
        if (!yearMap.has(paper.year)) {
          yearMap.set(paper.year, { count: 0, papers: [] });
        }

        const entry = yearMap.get(paper.year)!;
        entry.count += 1;
        entry.papers.push(paper._id.toString());
      });
    });

    // Upsert into KeywordTrend
    let upserted = 0;
    for (const [keyword, yearMap] of keywordsByYear) {
      for (const [year, { count, papers }] of yearMap) {
        await KeywordTrendModel.updateOne(
          { keyword, year },
          { keyword, year, count, papers: [...new Set(papers)] },
          { upsert: true }
        );
        upserted++;
      }
    }

    res.json({ success: true, message: `Populated ${upserted} trend records`, upserted });
  } catch (error) {
    console.error('Populate trends error:', error);
    res.status(500).json({ error: 'Failed to populate trends', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});
