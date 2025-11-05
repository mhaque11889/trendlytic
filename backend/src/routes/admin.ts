import { Router } from 'express';
import { PaperModel } from '../models/Paper';
import { AuthorModel } from '../models/Author';
import { KeywordModel } from '../models/Keyword';
import { KeywordTrendModel } from '../models/KeywordTrend';
import { UserModel } from '../models/User';
import bcrypt from 'bcryptjs';

export const adminRouter = Router();

adminRouter.post('/clear', async (req, res) => {
  try {
    const target = String(req.body?.target || '').toLowerCase();
    const valid = ['papers','authors','keywords','trends','all'];
    if (!valid.includes(target)) return res.status(400).json({ message: `target must be one of: ${valid.join(', ')}` });

    const results: Record<string, number> = {};

    if (target === 'papers' || target === 'all') {
      const r = await PaperModel.deleteMany({});
      results.papers = r.deletedCount || 0;
    }
    if (target === 'authors' || target === 'all') {
      const r = await AuthorModel.deleteMany({});
      results.authors = r.deletedCount || 0;
    }
    if (target === 'keywords' || target === 'all') {
      const r = await KeywordModel.deleteMany({});
      results.keywords = r.deletedCount || 0;
    }
    if (target === 'trends' || target === 'all') {
      const r = await KeywordTrendModel.deleteMany({});
      results.trends = r.deletedCount || 0;
    }

    return res.json({ ok: true, cleared: results });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || 'Failed to clear collections' });
  }
});

adminRouter.get('/list', async (req, res) => {
  try {
    const type = String(req.query.type || '').toLowerCase();
    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(200, Math.max(1, Number(req.query.pageSize || 50)));
    const skip = (page - 1) * pageSize;

    if (!['papers','authors','keywords'].includes(type)) {
      return res.status(400).json({ message: 'type must be one of papers, authors, keywords' });
    }

    if (type === 'papers') {
      const [items, total] = await Promise.all([
        PaperModel.find({}, { title: 1, year: 1, conference: 1, authors: 1, author_ids: 1, keywords: 1 })
          .sort({ created_at: -1 })
          .skip(skip)
          .limit(pageSize)
          .lean(),
        PaperModel.estimatedDocumentCount()
      ]);
      return res.json({ items, total, page, pageSize });
    }

    if (type === 'authors') {
      const [items, total] = await Promise.all([
        AuthorModel.find({}, { name: 1, external_id: 1, papers_count: 1, total_citations: 1, affiliation: 1 })
          .sort({ papers_count: -1, name: 1 })
          .skip(skip)
          .limit(pageSize)
          .lean(),
        AuthorModel.estimatedDocumentCount()
      ]);
      return res.json({ items, total, page, pageSize });
    }

    // keywords
    const [items, total] = await Promise.all([
      KeywordModel.find({}, { keyword: 1, normalized_keyword: 1, count: 1 })
        .sort({ count: -1, keyword: 1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      KeywordModel.estimatedDocumentCount()
    ]);
    return res.json({ items, total, page, pageSize });
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || 'Failed to list items' });
  }
});

// USER MANAGEMENT ENDPOINTS

// Get all users
adminRouter.get('/users', async (req, res) => {
  try {
    const users = await UserModel.find({}, { password_hash: 0 }).sort({ created_at: 1 }).lean();
    return res.json({ success: true, users });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e?.message || 'Failed to fetch users' });
  }
});

// Create new user
adminRouter.post('/users', async (req, res) => {
  try {
    const { email, name, password, role } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Check if user already exists
    const existing = await UserModel.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create new user
    const user = new UserModel({
      email,
      name: name || email.split('@')[0],
      password_hash,
      role: role || 'analyst'
    });

    await user.save();

    // Return user without password
    const userObj = user.toObject();
    delete (userObj as any).password_hash;
    
    return res.json({ success: true, user: userObj });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e?.message || 'Failed to create user' });
  }
});

// Update user
adminRouter.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, password } = req.body;

    // Find user
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Don't allow editing the first/admin user
    const isFirstUser = await UserModel.findOne().sort({ created_at: 1 });
    if (isFirstUser?._id.toString() === id) {
      return res.status(403).json({ success: false, message: 'Cannot edit the first admin user' });
    }

    // Update fields
    if (name) user.name = name;
    if (role) user.role = role;
    if (password) {
      user.password_hash = await bcrypt.hash(password, 10);
    }

    await user.save();

    // Return user without password
    const userObj = user.toObject();
    delete (userObj as any).password_hash;
    
    return res.json({ success: true, user: userObj });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e?.message || 'Failed to update user' });
  }
});

// Delete user
adminRouter.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find user
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Don't allow deleting the first/admin user
    const isFirstUser = await UserModel.findOne().sort({ created_at: 1 });
    if (isFirstUser?._id.toString() === id) {
      return res.status(403).json({ success: false, message: 'Cannot delete the first admin user' });
    }

    await UserModel.deleteOne({ _id: id });
    
    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e?.message || 'Failed to delete user' });
  }
});

