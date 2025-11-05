"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.knowledgeGraphService = exports.KnowledgeGraphService = void 0;
const KnowledgeGraph_1 = require("../models/KnowledgeGraph");
const KeywordCluster_1 = require("../models/KeywordCluster");
const KeywordConnection_1 = require("../models/KeywordConnection");
/**
 * Knowledge Graph Service - Unifies all cluster graphs into a comprehensive knowledge graph
 * Applies graph algorithms and analyzes the overall network
 */
class KnowledgeGraphService {
    /**
     * Build unified knowledge graph from all clusters
     */
    async buildUnifiedKnowledgeGraph() {
        try {
            console.log('Building unified knowledge graph...');
            // Get all clusters
            const clusters = await KeywordCluster_1.KeywordClusterModel.find({});
            if (clusters.length === 0) {
                throw new Error('No clusters found. Please run clustering first.');
            }
            const nodes = [];
            const edges = [];
            const nodeSet = new Set();
            const edgeSet = new Set();
            // Step 1: Add keyword nodes and edges from each cluster graph
            for (const cluster of clusters) {
                // Add keyword nodes
                cluster.keywords.forEach((keyword) => {
                    if (!nodeSet.has(keyword)) {
                        nodeSet.add(keyword);
                        nodes.push({
                            id: keyword,
                            label: keyword,
                            type: 'keyword',
                            cluster_id: cluster.cluster_id,
                            properties: {
                                cluster: cluster.name,
                                theme: cluster.theme
                            }
                        });
                    }
                });
                // Add cluster node
                const clusterId = `cluster_${cluster.cluster_id}`;
                if (!nodeSet.has(clusterId)) {
                    nodeSet.add(clusterId);
                    nodes.push({
                        id: clusterId,
                        label: (cluster.name || cluster.theme || 'Unknown'),
                        type: 'cluster',
                        properties: {
                            size: cluster.size,
                            confidence: cluster.confidence,
                            theme: cluster.theme
                        }
                    });
                }
                // Add edges between keywords in cluster and cluster node (hierarchy)
                cluster.keywords.forEach((keyword) => {
                    const edgeKey = `${keyword}-->${clusterId}`;
                    if (!edgeSet.has(edgeKey)) {
                        edgeSet.add(edgeKey);
                        edges.push({
                            source: keyword,
                            target: clusterId,
                            weight: 1,
                            type: 'hierarchy'
                        });
                    }
                });
            }
            // Step 2: Add co-occurrence edges
            const connections = await KeywordConnection_1.KeywordConnectionModel.find({});
            connections.forEach((conn) => {
                const edgeKey = `${conn.source_keyword}-->${conn.target_keyword}`;
                if (!edgeSet.has(edgeKey)) {
                    edgeSet.add(edgeKey);
                    edges.push({
                        source: conn.source_keyword,
                        target: conn.target_keyword,
                        weight: conn.weight,
                        type: 'co-occurrence',
                        properties: {
                            co_occurrence_count: conn.co_occurrence_count,
                            strength: conn.strength
                        }
                    });
                }
            });
            console.log(`Knowledge graph: ${nodes.length} nodes, ${edges.length} edges`);
            // Step 3: Calculate graph statistics
            const statistics = this.calculateGraphStatistics(nodes, edges);
            // Step 4: Apply graph algorithms
            const centralityScores = this.calculateCentrality(nodes, edges);
            const communities = this.detectCommunities(nodes, edges);
            const hubNodes = this.findHubNodes(nodes, edges, 10);
            // Step 5: Save to database
            const knowledgeGraph = new KnowledgeGraph_1.KnowledgeGraphModel({
                name: 'Unified Research Knowledge Graph',
                description: 'Unified knowledge graph combining all thematic clusters and keyword relationships',
                version: '1.0',
                nodes,
                edges,
                statistics,
                analysis: {
                    central_nodes: centralityScores.slice(0, 10),
                    communities: communities.map((nodes, idx) => ({
                        community_id: `community_${idx}`,
                        nodes: nodes.map((n) => n.id),
                        size: nodes.length
                    })),
                    hub_nodes: hubNodes.map((n) => n.id)
                },
                source_clusters: clusters.map((c) => c.cluster_id),
                year_range: {
                    start: 2020,
                    end: new Date().getFullYear()
                }
            });
            await knowledgeGraph.save();
            console.log('Knowledge graph saved successfully');
        }
        catch (error) {
            console.error('Error building knowledge graph:', error);
            throw error;
        }
    }
    /**
     * Calculate graph statistics
     */
    calculateGraphStatistics(nodes, edges) {
        const nodeCount = nodes.length;
        const edgeCount = edges.length;
        // Density
        const possibleEdges = (nodeCount * (nodeCount - 1)) / 2;
        const density = possibleEdges > 0 ? edgeCount / possibleEdges : 0;
        // Average degree
        const degrees = new Map();
        nodes.forEach((node) => degrees.set(node.id, 0));
        edges.forEach((edge) => {
            degrees.set(edge.source, (degrees.get(edge.source) || 0) + 1);
            degrees.set(edge.target, (degrees.get(edge.target) || 0) + 1);
        });
        const totalDegree = [...degrees.values()].reduce((a, b) => a + b, 0);
        const averageDegree = nodeCount > 0 ? totalDegree / nodeCount : 0;
        // Clustering coefficient (local)
        let clusteringCoeff = 0;
        let nodeCount_cc = 0;
        nodes.forEach((node) => {
            const neighbors = new Set();
            edges.forEach((edge) => {
                if (edge.source === node.id)
                    neighbors.add(edge.target);
                if (edge.target === node.id)
                    neighbors.add(edge.source);
            });
            if (neighbors.size > 1) {
                let triangles = 0;
                const neighborList = [...neighbors];
                for (let i = 0; i < neighborList.length; i++) {
                    for (let j = i + 1; j < neighborList.length; j++) {
                        const edge = edges.find((e) => (e.source === neighborList[i] && e.target === neighborList[j]) ||
                            (e.source === neighborList[j] && e.target === neighborList[i]));
                        if (edge)
                            triangles++;
                    }
                }
                const possibleTriangles = (neighbors.size * (neighbors.size - 1)) / 2;
                clusteringCoeff += possibleTriangles > 0 ? triangles / possibleTriangles : 0;
                nodeCount_cc++;
            }
        });
        clusteringCoeff = nodeCount_cc > 0 ? clusteringCoeff / nodeCount_cc : 0;
        // Number of connected components
        const components = this.countConnectedComponents(nodes, edges);
        return {
            node_count: nodeCount,
            edge_count: edgeCount,
            density: Math.round(density * 10000) / 10000,
            average_degree: Math.round(averageDegree * 100) / 100,
            clustering_coefficient: Math.round(clusteringCoeff * 10000) / 10000,
            components
        };
    }
    /**
     * Calculate centrality measures for nodes
     */
    calculateCentrality(nodes, edges) {
        const degrees = new Map();
        const betweenness = new Map();
        // Degree centrality
        nodes.forEach((node) => degrees.set(node.id, 0));
        edges.forEach((edge) => {
            degrees.set(edge.source, (degrees.get(edge.source) || 0) + 1);
            degrees.set(edge.target, (degrees.get(edge.target) || 0) + 1);
        });
        const maxDegree = Math.max(...[...degrees.values()], 1);
        const degreeCentrality = new Map();
        degrees.forEach((degree, nodeId) => {
            degreeCentrality.set(nodeId, degree / maxDegree);
        });
        // Betweenness centrality (simplified - BFS distance sum)
        nodes.forEach((node) => {
            let betweennessScore = 0;
            // Simple approximation: count paths that would pass through this node
            for (const source of nodes) {
                if (source.id === node.id)
                    continue;
                const distances = this.bfsDistances(source.id, nodes, edges);
                betweennessScore += distances.get(node.id) || 0;
            }
            betweenness.set(node.id, betweennessScore);
        });
        const maxBetweenness = Math.max(...[...betweenness.values()], 1);
        const betweennessCentrality = new Map();
        betweenness.forEach((score, nodeId) => {
            betweennessCentrality.set(nodeId, score / maxBetweenness);
        });
        // Closeness centrality (average distance to all other nodes)
        const closenessCentrality = new Map();
        nodes.forEach((node) => {
            const distances = this.bfsDistances(node.id, nodes, edges);
            const validDistances = [...distances.values()].filter((d) => d < Infinity);
            const avgDistance = validDistances.length > 0
                ? validDistances.reduce((a, b) => a + b, 0) / validDistances.length
                : 0;
            closenessCentrality.set(node.id, avgDistance > 0 ? 1 / avgDistance : 0);
        });
        // Combine scores
        const scores = nodes
            .map((node) => ({
            node_id: node.id,
            betweenness_centrality: betweennessCentrality.get(node.id) || 0,
            closeness_centrality: closenessCentrality.get(node.id) || 0,
            degree_centrality: degreeCentrality.get(node.id) || 0
        }))
            .sort((a, b) => (b.degree_centrality + b.betweenness_centrality) - (a.degree_centrality + a.betweenness_centrality));
        return scores;
    }
    /**
     * Detect communities using connected components and modularity
     */
    detectCommunities(nodes, edges) {
        const adjacency = new Map();
        nodes.forEach((node) => adjacency.set(node.id, []));
        edges.forEach((edge) => {
            adjacency.get(edge.source)?.push(edge.target);
            adjacency.get(edge.target)?.push(edge.source);
        });
        const visited = new Set();
        const communities = [];
        const dfs = (nodeId, community) => {
            visited.add(nodeId);
            community.add(nodeId);
            const neighbors = adjacency.get(nodeId) || [];
            neighbors.forEach((neighbor) => {
                if (!visited.has(neighbor)) {
                    dfs(neighbor, community);
                }
            });
        };
        nodes.forEach((node) => {
            if (!visited.has(node.id)) {
                const community = new Set();
                dfs(node.id, community);
                const communityNodes = nodes.filter((n) => community.has(n.id));
                communities.push(communityNodes);
            }
        });
        return communities;
    }
    /**
     * Find hub nodes (high degree nodes)
     */
    findHubNodes(nodes, edges, topN) {
        const degrees = new Map();
        nodes.forEach((node) => degrees.set(node.id, 0));
        edges.forEach((edge) => {
            degrees.set(edge.source, (degrees.get(edge.source) || 0) + 1);
            degrees.set(edge.target, (degrees.get(edge.target) || 0) + 1);
        });
        return nodes
            .sort((a, b) => (degrees.get(b.id) || 0) - (degrees.get(a.id) || 0))
            .slice(0, topN);
    }
    /**
     * BFS to calculate shortest distances
     */
    bfsDistances(startId, nodes, edges) {
        const distances = new Map();
        nodes.forEach((node) => distances.set(node.id, Infinity));
        distances.set(startId, 0);
        const queue = [startId];
        while (queue.length > 0) {
            const current = queue.shift();
            const currentDist = distances.get(current);
            edges.forEach((edge) => {
                let neighbor = null;
                if (edge.source === current)
                    neighbor = edge.target;
                else if (edge.target === current)
                    neighbor = edge.source;
                if (neighbor) {
                    const neighborDist = distances.get(neighbor);
                    if (currentDist + 1 < neighborDist) {
                        distances.set(neighbor, currentDist + 1);
                        queue.push(neighbor);
                    }
                }
            });
        }
        return distances;
    }
    /**
     * Count connected components
     */
    countConnectedComponents(nodes, edges) {
        const adjacency = new Map();
        nodes.forEach((node) => adjacency.set(node.id, []));
        edges.forEach((edge) => {
            adjacency.get(edge.source)?.push(edge.target);
            adjacency.get(edge.target)?.push(edge.source);
        });
        const visited = new Set();
        let componentCount = 0;
        const dfs = (nodeId) => {
            visited.add(nodeId);
            const neighbors = adjacency.get(nodeId) || [];
            neighbors.forEach((neighbor) => {
                if (!visited.has(neighbor)) {
                    dfs(neighbor);
                }
            });
        };
        nodes.forEach((node) => {
            if (!visited.has(node.id)) {
                dfs(node.id);
                componentCount++;
            }
        });
        return componentCount;
    }
    /**
     * Get the unified knowledge graph
     */
    async getKnowledgeGraph() {
        const graphs = await KnowledgeGraph_1.KnowledgeGraphModel.find({}).sort({ created_at: -1 });
        return graphs.length > 0 ? graphs[0] : null;
    }
    /**
     * Clear knowledge graphs (for regeneration)
     */
    async clearKnowledgeGraphs() {
        await KnowledgeGraph_1.KnowledgeGraphModel.deleteMany({});
    }
}
exports.KnowledgeGraphService = KnowledgeGraphService;
exports.knowledgeGraphService = new KnowledgeGraphService();
