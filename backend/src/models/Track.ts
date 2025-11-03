import { Schema, model, InferSchemaType, Types } from 'mongoose';

const TrackSchema = new Schema({
  name: { type: String, required: true, index: true },
  conferenceId: { type: Types.ObjectId, ref: 'conferences', required: true, index: true },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() }
});

TrackSchema.pre('save', function(next) {
  this.set('updatedAt', new Date());
  next();
});

export type Track = InferSchemaType<typeof TrackSchema> & { _id: string };

export const TrackModel = model('tracks', TrackSchema);


