"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeywordModel = void 0;
const mongoose_1 = require("mongoose");
const KeywordSchema = new mongoose_1.Schema({
    keyword: { type: String, required: true, unique: true, index: true },
    normalized_keyword: { type: String, index: true },
    count: { type: Number, default: 0 },
    synonyms: [{ type: String }],
    category: { type: String },
    papers: [{ type: mongoose_1.Types.ObjectId, ref: 'papers', index: true }],
    created_at: { type: Date, default: () => new Date() },
    updated_at: { type: Date, default: () => new Date() }
});
KeywordSchema.pre('save', function (next) {
    this.set('updated_at', new Date());
    next();
});
exports.KeywordModel = (0, mongoose_1.model)('keywords', KeywordSchema);
