import { Schema, model, InferSchemaType } from 'mongoose';

const ConferenceSchema = new Schema({
  name: { type: String, required: true, index: true },
  acronym: { type: String, required: true, unique: true, index: true },
  description: { type: String },
  years_held: [{ type: Number }],
  total_papers: { type: Number, default: 0 },
  website: { type: String },
  location: { type: String },
  created_at: { type: Date, default: () => new Date() },
  updated_at: { type: Date, default: () => new Date() }
});

ConferenceSchema.pre('save', function(next) {
  this.set('updated_at', new Date());
  next();
});

export type Conference = InferSchemaType<typeof ConferenceSchema> & { _id: string };

export const ConferenceModel = model('conferences', ConferenceSchema);


