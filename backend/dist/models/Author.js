"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorModel = void 0;
const mongoose_1 = require("mongoose");
const AuthorSchema = new mongoose_1.Schema({
    external_id: { type: String, unique: true, sparse: true, index: true },
    name: { type: String, index: true },
    email: { type: String },
    affiliation: { type: String },
    h_index: { type: Number, default: 0 },
    total_citations: { type: Number, default: 0 },
    papers_count: { type: Number, default: 0 },
    papers: [{ type: mongoose_1.Types.ObjectId, ref: 'papers', index: true }],
    created_at: { type: Date, default: () => new Date() },
    updated_at: { type: Date, default: () => new Date() }
});
AuthorSchema.pre('save', function (next) {
    this.set('updated_at', new Date());
    next();
});
exports.AuthorModel = (0, mongoose_1.model)('authors', AuthorSchema);
