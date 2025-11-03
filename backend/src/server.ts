import 'dotenv/config';
import { createApp } from './app';
import { connectToDatabase } from './db/connection';
import { AuthorModel } from './models/Author';

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

async function bootstrap(): Promise<void> {
  await connectToDatabase();
  // Ensure legacy unique index on authors.name is removed to allow multiple papers per author
  try {
    await AuthorModel.collection.dropIndex('name_1');
  } catch {
    // ignore if it doesn't exist
  }
  try {
    await AuthorModel.syncIndexes();
  } catch {
    // ignore
  }
  const app = createApp();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal startup error', err);
  process.exit(1);
});

