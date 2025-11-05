"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conferencesRouter = void 0;
const express_1 = require("express");
const Conference_1 = require("../models/Conference");
exports.conferencesRouter = (0, express_1.Router)();
exports.conferencesRouter.get('/', async (req, res) => {
    const { q, year, page = '1', pageSize = '20' } = req.query;
    const filter = {};
    if (q)
        filter.name = { $regex: q, $options: 'i' };
    if (year)
        filter.year = Number(year);
    const pageNum = Math.max(1, Number(page) || 1);
    const sizeNum = Math.min(100, Math.max(1, Number(pageSize) || 20));
    const [items, total] = await Promise.all([
        Conference_1.ConferenceModel.find(filter)
            .sort({ year: -1, name: 1 })
            .skip((pageNum - 1) * sizeNum)
            .limit(sizeNum),
        Conference_1.ConferenceModel.countDocuments(filter)
    ]);
    res.json({ items, page: pageNum, pageSize: sizeNum, total });
});
exports.conferencesRouter.get('/:id', async (req, res) => {
    const item = await Conference_1.ConferenceModel.findById(req.params.id);
    if (!item)
        return res.status(404).json({ message: 'Not found' });
    res.json(item);
});
exports.conferencesRouter.post('/', async (req, res) => {
    const doc = await Conference_1.ConferenceModel.create(req.body);
    res.status(201).json(doc);
});
exports.conferencesRouter.put('/:id', async (req, res) => {
    const doc = await Conference_1.ConferenceModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc)
        return res.status(404).json({ message: 'Not found' });
    res.json(doc);
});
exports.conferencesRouter.delete('/:id', async (req, res) => {
    const result = await Conference_1.ConferenceModel.findByIdAndDelete(req.params.id);
    if (!result)
        return res.status(404).json({ message: 'Not found' });
    res.status(204).send();
});
