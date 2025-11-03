import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const { email, password, name, role } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ message: 'email and password required' });
  const existing = await UserModel.findOne({ email });
  if (existing) return res.status(409).json({ message: 'email already exists' });
  const password_hash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ email, name, role: role ?? 'admin', password_hash });
  res.status(201).json({ _id: user._id, email: user.email, role: user.role, name: user.name });
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ message: 'email and password required' });
  const user = await UserModel.findOne({ email });
  if (!user) return res.status(401).json({ message: 'invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ message: 'invalid credentials' });
  const token = jwt.sign({ sub: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { _id: user._id, email: user.email, role: user.role, name: user.name } });
});

authRouter.get('/me', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ message: 'missing token' });
  const token = auth.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    const user = await UserModel.findById(payload.sub).lean();
    if (!user) return res.status(404).json({ message: 'user not found' });
    res.json({ _id: user._id, email: user.email, role: user.role, name: user.name });
  } catch {
    return res.status(401).json({ message: 'invalid token' });
  }
});


