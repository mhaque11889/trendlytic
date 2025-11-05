"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackModel = void 0;
const mongoose_1 = require("mongoose");
const TrackSchema = new mongoose_1.Schema({
    name: { type: String, required: true, index: true },
    conferenceId: { type: mongoose_1.Types.ObjectId, ref: 'conferences', required: true, index: true },
    createdAt: { type: Date, default: () => new Date() },
    updatedAt: { type: Date, default: () => new Date() }
});
TrackSchema.pre('save', function (next) {
    this.set('updatedAt', new Date());
    next();
});
exports.TrackModel = (0, mongoose_1.model)('tracks', TrackSchema);
