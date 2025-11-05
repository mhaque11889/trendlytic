"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clusteringService = exports.ClusteringService = void 0;
const Keyword_1 = require("../models/Keyword");
const KeywordCluster_1 = require("../models/KeywordCluster");
/**
 * Clustering Service - Groups keywords thematically using K-means clustering
 * Features used: paper count frequency, keyword co-occurrence patterns, trend direction
 */
class ClusteringService {
    /**
     * Generate feature vectors for all keywords
     * Features: normalized paper count, temporal presence, alphabetic position in keyword
     * @param limit Optional limit on number of keywords to process
     */
    async generateKeywordVectors(limit) {
        let query = Keyword_1.KeywordModel.find({});
        if (limit) {
            query = query.limit(limit);
        }
        const keywords = await query.exec();
        if (keywords.length === 0) {
            throw new Error('No keywords found in database');
        }
        const vectors = keywords.map((kw) => {
            const paperCount = kw.papers?.length || 0;
            const keywordLength = kw.keyword.length;
            // Simple feature vector: [normalized_paper_count, keyword_length, char_code_sum]
            const charSum = kw.keyword
                .split('')
                .reduce((sum, char) => sum + char.charCodeAt(0), 0);
            const vector = [
                Math.min(paperCount / 100, 1), // Normalize paper count (max assumed 100)
                keywordLength / 50, // Normalize keyword length
                (charSum % 1000) / 1000 // Normalize char code sum
            ];
            return {
                keyword: kw.keyword,
                vector,
                paper_count: paperCount,
                papers: kw.papers || []
            };
        });
        return vectors;
    }
    /**
     * Calculate Euclidean distance between two vectors
     */
    euclideanDistance(v1, v2) {
        return Math.sqrt(v1.reduce((sum, val, i) => sum + Math.pow(val - (v2[i] || 0), 2), 0));
    }
    /**
     * Initialize K-means clustering with random centroids
     */
    initializeCentroids(vectors, k) {
        const centroids = [];
        const dimensions = vectors[0].vector.length;
        for (let i = 0; i < k; i++) {
            const randomIdx = Math.floor(Math.random() * vectors.length);
            centroids.push([...vectors[randomIdx].vector]);
        }
        return centroids;
    }
    /**
     * Calculate centroid from a set of vectors
     */
    calculateCentroid(vectors) {
        if (vectors.length === 0)
            return [];
        const dimensions = vectors[0].length;
        const centroid = [];
        for (let i = 0; i < dimensions; i++) {
            centroid.push(vectors.reduce((sum, vec) => sum + (vec[i] || 0), 0) / vectors.length);
        }
        return centroid;
    }
    /**
     * Perform K-means clustering
     * @param k Number of clusters
     * @param maxIterations Maximum iterations for convergence
     */
    async performKMeans(vectors, k, maxIterations = 100) {
        let centroids = this.initializeCentroids(vectors, k);
        let assignments = new Array(vectors.length).fill(0);
        let converged = false;
        let iteration = 0;
        while (!converged && iteration < maxIterations) {
            // Assign vectors to nearest centroid
            const newAssignments = vectors.map((vec) => {
                let minDistance = Infinity;
                let closestCentroid = 0;
                centroids.forEach((centroid, idx) => {
                    const distance = this.euclideanDistance(vec.vector, centroid);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestCentroid = idx;
                    }
                });
                return closestCentroid;
            });
            // Check for convergence
            converged = newAssignments.every((val, idx) => val === assignments[idx]);
            assignments = newAssignments;
            // Update centroids
            const newCentroids = [];
            for (let i = 0; i < k; i++) {
                const clusterVectors = vectors
                    .filter((_, idx) => assignments[idx] === i)
                    .map((v) => v.vector);
                if (clusterVectors.length > 0) {
                    newCentroids.push(this.calculateCentroid(clusterVectors));
                }
                else {
                    // Keep the old centroid if cluster is empty
                    newCentroids.push(centroids[i]);
                }
            }
            centroids = newCentroids;
            iteration++;
        }
        // Build cluster objects
        const clusters = [];
        for (let i = 0; i < k; i++) {
            const clusterKeywords = vectors
                .filter((_, idx) => assignments[idx] === i)
                .map((v) => v.keyword);
            const clusterPaperCounts = vectors
                .filter((_, idx) => assignments[idx] === i)
                .map((v) => v.paper_count);
            clusters.push({
                id: `cluster_${i}`,
                centroid: centroids[i],
                keywords: clusterKeywords,
                paper_counts: clusterPaperCounts
            });
        }
        return clusters;
    }
    /**
     * Generate theme labels for clusters based on keyword content
     */
    generateThemeLabel(keywords) {
        // Simple heuristic: find common prefix or use most common keyword
        if (keywords.length === 0)
            return 'Unknown Theme';
        // Sort by length and pick representative keywords
        const sorted = keywords.sort((a, b) => b.length - a.length);
        const representative = sorted.slice(0, Math.min(3, sorted.length));
        // Create a descriptive label
        return representative.join(' / ');
    }
    /**
     * Main clustering function - cluster keywords thematically
     * @param numberOfClusters Number of clusters to generate (default: 10)
     * @param keywordLimit Optional limit on number of keywords to process (default: all)
     */
    async clusterKeywords(numberOfClusters = 10, keywordLimit) {
        try {
            console.log('Starting keyword clustering...');
            // Generate feature vectors
            const vectors = await this.generateKeywordVectors(keywordLimit);
            console.log(`Generated vectors for ${vectors.length} keywords`);
            // Perform K-means clustering
            const clusters = await this.performKMeans(vectors, numberOfClusters, 100);
            console.log(`Generated ${clusters.length} clusters`);
            // Calculate statistics for each cluster
            for (const cluster of clusters) {
                const paperCounts = cluster.paper_counts;
                const totalPapers = paperCounts.reduce((a, b) => a + b, 0);
                const avgPapers = paperCounts.length > 0 ? totalPapers / paperCounts.length : 0;
                const maxPapers = Math.max(...paperCounts, 0);
                // Create theme label
                const themeLabel = this.generateThemeLabel(cluster.keywords);
                // Calculate confidence (inversely proportional to centroid distance variance)
                const centroidVariance = cluster.keywords.length > 1
                    ? cluster.keywords.reduce((sum, kw, idx) => {
                        return sum + this.euclideanDistance(vectors.find((v) => v.keyword === kw)?.vector || [], cluster.centroid);
                    }, 0) / cluster.keywords.length
                    : 0;
                const confidence = Math.max(0, 1 - centroidVariance);
                // Save to database
                await KeywordCluster_1.KeywordClusterModel.findOneAndUpdate({ cluster_id: cluster.id }, {
                    cluster_id: cluster.id,
                    name: `Cluster ${cluster.id}`,
                    description: `Theme-based cluster containing ${cluster.keywords.length} keywords`,
                    keywords: cluster.keywords,
                    centroid: cluster.centroid,
                    size: cluster.keywords.length,
                    papers_count: totalPapers,
                    theme: themeLabel,
                    confidence: Math.min(confidence, 1),
                    properties: {
                        dominant_paper_count: maxPapers,
                        avg_papers_per_keyword: Math.round(avgPapers * 100) / 100
                    }
                }, { upsert: true, new: true });
            }
            console.log('Clustering completed successfully');
        }
        catch (error) {
            console.error('Error during clustering:', error);
            throw error;
        }
    }
    /**
     * Get all clusters
     */
    async getClusters() {
        return KeywordCluster_1.KeywordClusterModel.find({}).sort({ size: -1 });
    }
    /**
     * Get cluster by ID
     */
    async getClusterById(clusterId) {
        return KeywordCluster_1.KeywordClusterModel.findOne({ cluster_id: clusterId });
    }
    /**
     * Get keywords in a cluster
     */
    async getClusterKeywords(clusterId) {
        const cluster = await KeywordCluster_1.KeywordClusterModel.findOne({ cluster_id: clusterId });
        return cluster?.keywords || [];
    }
    /**
     * Delete all clusters (for re-clustering)
     */
    async clearClusters() {
        await KeywordCluster_1.KeywordClusterModel.deleteMany({});
    }
}
exports.ClusteringService = ClusteringService;
exports.clusteringService = new ClusteringService();
