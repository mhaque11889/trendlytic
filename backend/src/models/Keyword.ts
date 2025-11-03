import { Schema, model, InferSchemaType, Types } from 'mongoose';

const KeywordSchema = new Schema({
  keyword: { type: String, required: true, unique: true, index: true },
  normalized_keyword: { type: String, index: true },
  count: { type: Number, default: 0 },
  synonyms: [{ type: String }],
  category: { type: String },
  papers: [{ type: Types.ObjectId, ref: 'papers', index: true }],
  created_at: { type: Date, default: () => new Date() },
  updated_at: { type: Date, default: () => new Date() }
});

KeywordSchema.pre('save', function(next) {
  this.set('updated_at', new Date());
  next();
});

export type Keyword = InferSchemaType<typeof KeywordSchema> & { _id: string };

export const KeywordModel = model('keywords', KeywordSchema);


