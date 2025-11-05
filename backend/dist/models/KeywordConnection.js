"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeywordConnectionModel = void 0;
const mongoose_1 = require("mongoose");
const KeywordConnectionSchema = new mongoose_1.Schema({
    source_keyword: { type: String, required: true, index: true },
    target_keyword: { type: String, required: true, index: true },
    co_occurrence_count: { type: Number, required: true, default: 1 }, // How many papers contain both keywords
    weight: { type: Number, default: 0 }, // Normalized weight (0-1)
    papers: [{ type: String }], // Paper IDs where they co-occur
    cluster_id: { type: String, index: true }, // Which cluster this connection belongs to
    strength: { type: String, enum: ['weak', 'medium', 'strong'], default: 'weak' }, // Qualitative strength
    created_at: { type: Date, default: () => new Date() },
    updated_at: { type: Date, default: () => new Date() }
});
// Ensure unique connections (no duplicate edges)
KeywordConnectionSchema.index({ source_keyword: 1, target_keyword: 1 }, { unique: true });
KeywordConnectionSchema.pre('save', function (next) {
    this.set('updated_at', new Date());
    next();
});
exports.KeywordConnectionModel = (0, mongoose_1.model)('keyword_connections', KeywordConnectionSchema);
