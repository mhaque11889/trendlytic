"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeGraphModel = void 0;
const mongoose_1 = require("mongoose");
const KnowledgeGraphSchema = new mongoose_1.Schema({
    name: { type: String, required: true }, // Name of the knowledge graph
    description: { type: String },
    version: { type: String, default: '1.0' },
    // Nodes in the graph
    nodes: [{
            id: { type: String, required: true },
            label: { type: String, required: true },
            type: { type: String, enum: ['keyword', 'cluster', 'theme'], default: 'keyword' },
            cluster_id: { type: String },
            properties: { type: Map, of: mongoose_1.Schema.Types.Mixed }
        }],
    // Edges in the graph
    edges: [{
            source: { type: String, required: true },
            target: { type: String, required: true },
            weight: { type: Number, default: 1 },
            type: { type: String, enum: ['co-occurrence', 'hierarchy', 'related'], default: 'co-occurrence' },
            properties: { type: Map, of: mongoose_1.Schema.Types.Mixed }
        }],
    // Graph statistics
    statistics: {
        node_count: { type: Number, default: 0 },
        edge_count: { type: Number, default: 0 },
        density: { type: Number }, // Edge count / possible edges
        average_degree: { type: Number },
        clustering_coefficient: { type: Number },
        components: { type: Number } // Number of connected components
    },
    // Graph algorithms results
    analysis: {
        central_nodes: [{
                node_id: { type: String },
                betweenness_centrality: { type: Number },
                closeness_centrality: { type: Number },
                degree_centrality: { type: Number }
            }],
        communities: [{
                community_id: { type: String },
                nodes: [{ type: String }],
                size: { type: Number }
            }],
        hub_nodes: [{ type: String }] // High-degree nodes (hubs in the network)
    },
    // Metadata
    source_clusters: [{ type: String }], // Cluster IDs used to build this graph
    year_range: {
        start: { type: Number },
        end: { type: Number }
    },
    created_at: { type: Date, default: () => new Date() },
    updated_at: { type: Date, default: () => new Date() }
});
KnowledgeGraphSchema.pre('save', function (next) {
    this.set('updated_at', new Date());
    next();
});
exports.KnowledgeGraphModel = (0, mongoose_1.model)('knowledge_graphs', KnowledgeGraphSchema);
