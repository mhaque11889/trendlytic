import express, { Application } from 'express';
import cors from 'cors';
import { router as rootRouter } from './routes/index';

export function createApp(): Application {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '2mb' }));

  app.use('/', rootRouter);

  return app;
}

