"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'analyst', 'reviewer'], default: 'analyst', index: true },
    created_at: { type: Date, default: () => new Date() },
    updated_at: { type: Date, default: () => new Date() }
});
UserSchema.pre('save', function (next) {
    this.set('updated_at', new Date());
    next();
});
exports.UserModel = (0, mongoose_1.model)('users', UserSchema);
