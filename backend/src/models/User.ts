import { Schema, model, InferSchemaType } from 'mongoose';

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'analyst', 'reviewer'], default: 'analyst', index: true },
  created_at: { type: Date, default: () => new Date() },
  updated_at: { type: Date, default: () => new Date() }
});

UserSchema.pre('save', function(next) {
  this.set('updated_at', new Date());
  next();
});

export type User = InferSchemaType<typeof UserSchema> & { _id: string };

export const UserModel = model('users', UserSchema);


