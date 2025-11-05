import { Schema, model, InferSchemaType, Types } from 'mongoose';

const KeywordClusterSchema = new Schema({
  cluster_id: { type: String, required: true, index: true },
  name: { type: String, required: true }, // Theme/topic name
  description: { type: String },
  keywords: [{ type: String, required: true }], // Keywords in this cluster
  centroid: [{ type: Number }], // Centroid for K-means clustering
  size: { type: Number, default: 0 }, // Number of keywords in cluster
  papers_count: { type: Number, default: 0 }, // Total papers associated with this cluster
  theme: { type: String }, // Human-readable theme label
  confidence: { type: Number, default: 0 }, // Clustering confidence score (0-1)
  properties: {
    dominant_paper_count: { type: Number }, // Most common paper count
    avg_papers_per_keyword: { type: Number },
    emergence_year: { type: Number } // Year this cluster first appeared
  },
  created_at: { type: Date, default: () => new Date() },
  updated_at: { type: Date, default: () => new Date() }
});

KeywordClusterSchema.pre('save', function(next) {
  this.set('updated_at', new Date());
  next();
});

export type KeywordCluster = InferSchemaType<typeof KeywordClusterSchema> & { _id: string };

export const KeywordClusterModel = model('keyword_clusters', KeywordClusterSchema);
