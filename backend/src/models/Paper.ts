import { Schema, model, InferSchemaType } from 'mongoose';

const PaperSchema = new Schema({
  title: { type: String, required: true, index: true },
  authors: [{ type: String, required: true, index: true }],
  author_ids: [{ type: String, index: true }],
  year: { type: Number, required: true, index: true },
  conference: { type: String, required: true, index: true },
  file_link: { type: String },
  abstract: { type: String, index: 'text' },
  keywords: [{ type: String, required: true, index: true }],
  doi: { type: String },
  citations: { type: Number, default: 0 },
  publisher: { type: String },
  pages: { type: String },
  volume: { type: String },
  issue: { type: String },
  dedupe_key: { type: String, unique: true, index: true },
  created_at: { type: Date, default: () => new Date() },
  updated_at: { type: Date, default: () => new Date() }
});

PaperSchema.pre('save', function(next) {
  const title = (this.get('title') as string | undefined)?.trim().toLowerCase() || '';
  const conference = (this.get('conference') as string | undefined)?.trim().toLowerCase() || '';
  const year = this.get('year');
  this.set('dedupe_key', `${title}|${year}|${conference}`);
  this.set('updated_at', new Date());
  next();
});

export type Paper = InferSchemaType<typeof PaperSchema> & { _id: string };

export const PaperModel = model('papers', PaperSchema);


