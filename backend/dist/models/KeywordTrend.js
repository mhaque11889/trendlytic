"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeywordTrendModel = void 0;
const mongoose_1 = require("mongoose");
const KeywordTrendSchema = new mongoose_1.Schema({
    keyword: { type: String, required: true, index: true },
    year: { type: Number, required: true, index: true },
    count: { type: Number, default: 0 },
    papers: [{ type: mongoose_1.Types.ObjectId, ref: 'papers', index: true }],
    growth_rate: { type: Number, default: 0 },
    created_at: { type: Date, default: () => new Date() },
    updated_at: { type: Date, default: () => new Date() }
});
KeywordTrendSchema.index({ keyword: 1, year: 1 }, { unique: true });
KeywordTrendSchema.pre('save', function (next) {
    this.set('updated_at', new Date());
    next();
});
exports.KeywordTrendModel = (0, mongoose_1.model)('keyword_trends', KeywordTrendSchema);
