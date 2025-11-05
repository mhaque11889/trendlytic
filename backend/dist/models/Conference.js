"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConferenceModel = void 0;
const mongoose_1 = require("mongoose");
const ConferenceSchema = new mongoose_1.Schema({
    name: { type: String, required: true, index: true },
    acronym: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    years_held: [{ type: Number }],
    total_papers: { type: Number, default: 0 },
    website: { type: String },
    location: { type: String },
    created_at: { type: Date, default: () => new Date() },
    updated_at: { type: Date, default: () => new Date() }
});
ConferenceSchema.pre('save', function (next) {
    this.set('updated_at', new Date());
    next();
});
exports.ConferenceModel = (0, mongoose_1.model)('conferences', ConferenceSchema);
