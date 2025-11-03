import { Schema, model, InferSchemaType, Types } from 'mongoose';

const AuthorSchema = new Schema({
  external_id: { type: String, unique: true, sparse: true, index: true },
  name: { type: String, index: true },
  email: { type: String },
  affiliation: { type: String },
  h_index: { type: Number, default: 0 },
  total_citations: { type: Number, default: 0 },
  papers_count: { type: Number, default: 0 },
  papers: [{ type: Types.ObjectId, ref: 'papers', index: true }],
  created_at: { type: Date, default: () => new Date() },
  updated_at: { type: Date, default: () => new Date() }
});

AuthorSchema.pre('save', function(next) {
  this.set('updated_at', new Date());
  next();
});

export type Author = InferSchemaType<typeof AuthorSchema> & { _id: string };

export const AuthorModel = model('authors', AuthorSchema);


