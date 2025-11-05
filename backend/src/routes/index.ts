import { Router } from 'express';
import { conferencesRouter } from './conferences';
import { dashboardRouter } from './dashboard';
import { authRouter } from './auth';
import { importRouter } from './import';
import { adminRouter } from './admin';
import { trendsRouter } from './trends';
import { reportsRouter } from './reports';

export const router = Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'trendlytic-backend' });
});

router.use('/api/conferences', conferencesRouter);
router.use('/api/dashboard', dashboardRouter);
router.use('/api/auth', authRouter);
router.use('/api/import', importRouter);
router.use('/api/admin', adminRouter);
router.use('/api/trends', trendsRouter);
router.use('/api/reports', reportsRouter);


