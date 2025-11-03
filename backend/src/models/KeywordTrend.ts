import { Schema, model, InferSchemaType, Types } from 'mongoose';

const KeywordTrendSchema = new Schema({
  keyword: { type: String, required: true, index: true },
  year: { type: Number, required: true, index: true },
  count: { type: Number, default: 0 },
  papers: [{ type: Types.ObjectId, ref: 'papers', index: true }],
  growth_rate: { type: Number, default: 0 },
  created_at: { type: Date, default: () => new Date() },
  updated_at: { type: Date, default: () => new Date() }
});

KeywordTrendSchema.index({ keyword: 1, year: 1 }, { unique: true });

KeywordTrendSchema.pre('save', function(next) {
  this.set('updated_at', new Date());
  next();
});

export type KeywordTrend = InferSchemaType<typeof KeywordTrendSchema> & { _id: string };

export const KeywordTrendModel = model('keyword_trends', KeywordTrendSchema);


