"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post('/register', async (req, res) => {
    const { email, password, name, role } = req.body ?? {};
    if (!email || !password)
        return res.status(400).json({ message: 'email and password required' });
    const existing = await User_1.UserModel.findOne({ email });
    if (existing)
        return res.status(409).json({ message: 'email already exists' });
    const password_hash = await bcryptjs_1.default.hash(password, 10);
    const user = await User_1.UserModel.create({ email, name, role: role ?? 'admin', password_hash });
    res.status(201).json({ _id: user._id, email: user.email, role: user.role, name: user.name });
});
exports.authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!email || !password)
        return res.status(400).json({ message: 'email and password required' });
    const user = await User_1.UserModel.findOne({ email });
    if (!user)
        return res.status(401).json({ message: 'invalid credentials' });
    const ok = await bcryptjs_1.default.compare(password, user.password_hash);
    if (!ok)
        return res.status(401).json({ message: 'invalid credentials' });
    const token = jsonwebtoken_1.default.sign({ sub: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { _id: user._id, email: user.email, role: user.role, name: user.name } });
});
exports.authRouter.get('/me', async (req, res) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer '))
        return res.status(401).json({ message: 'missing token' });
    const token = auth.slice('Bearer '.length);
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await User_1.UserModel.findById(payload.sub).lean();
        if (!user)
            return res.status(404).json({ message: 'user not found' });
        res.json({ _id: user._id, email: user.email, role: user.role, name: user.name });
    }
    catch {
        return res.status(401).json({ message: 'invalid token' });
    }
});
