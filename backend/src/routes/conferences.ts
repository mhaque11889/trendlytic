import { Router } from 'express';
import { ConferenceModel } from '../models/Conference';

export const conferencesRouter = Router();

conferencesRouter.get('/', async (req, res) => {
  const { q, year, page = '1', pageSize = '20' } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};
  if (q) filter.name = { $regex: q, $options: 'i' };
  if (year) filter.year = Number(year);

  const pageNum = Math.max(1, Number(page) || 1);
  const sizeNum = Math.min(100, Math.max(1, Number(pageSize) || 20));

  const [items, total] = await Promise.all([
    ConferenceModel.find(filter)
      .sort({ year: -1, name: 1 })
      .skip((pageNum - 1) * sizeNum)
      .limit(sizeNum),
    ConferenceModel.countDocuments(filter)
  ]);

  res.json({ items, page: pageNum, pageSize: sizeNum, total });
});

conferencesRouter.get('/:id', async (req, res) => {
  const item = await ConferenceModel.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
});

conferencesRouter.post('/', async (req, res) => {
  const doc = await ConferenceModel.create(req.body);
  res.status(201).json(doc);
});

conferencesRouter.put('/:id', async (req, res) => {
  const doc = await ConferenceModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
});

conferencesRouter.delete('/:id', async (req, res) => {
  const result = await ConferenceModel.findByIdAndDelete(req.params.id);
  if (!result) return res.status(404).json({ message: 'Not found' });
  res.status(204).send();
});


