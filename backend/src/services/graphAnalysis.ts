import { PaperModel } from '../models/Paper';
import { KeywordClusterModel } from '../models/KeywordCluster';
import { KeywordConnectionModel } from '../models/KeywordConnection';

interface GraphNode {
  id: string;
  label: string;
  cluster_id?: string;
}

interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  co_occurrence_count: number;
  papers: string[];
}

interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Graph Analysis Service - Builds connectivity graphs between keywords
 * Analyzes co-occurrence patterns and generates relationship networks
 */
export class GraphAnalysisService {
  /**
   * Find all keyword co-occurrences in papers
   * Returns pairs of keywords that appear together and their frequency
   */
  private async findCoOccurrences(): Promise<Map<string, { count: number; papers: string[] }>> {
    const papers = await PaperModel.find({}, { keywords: 1, _id: 1 });

    const coOccurrences = new Map<
      string,
      { count: number; papers: string[] }
    >();

    papers.forEach((paper: any) => {
      const keywords = paper.keywords || [];

      // For each pair of keywords in the paper
      for (let i = 0; i < keywords.length; i++) {
        for (let j = i + 1; j < keywords.length; j++) {
          const key1 = keywords[i];
          const key2 = keywords[j];

          // Ensure consistent ordering (alphabetical)
          const [source, target] = [key1, key2].sort();
          const edgeKey = `${source}||${target}`;

          if (!coOccurrences.has(edgeKey)) {
            coOccurrences.set(edgeKey, { count: 0, papers: [] });
          }

          const entry = coOccurrences.get(edgeKey)!;
          entry.count++;

          if (!entry.papers.includes(paper._id.toString())) {
            entry.papers.push(paper._id.toString());
          }
        }
      }
    });

    return coOccurrences;
  }

  /**
   * Build connectivity graph for a specific cluster
   * @param clusterId Cluster ID to build graph for
   */
  async buildClusterGraph(clusterId: string): Promise<Graph> {
    try {
      const cluster = await KeywordClusterModel.findOne({ cluster_id: clusterId });

      if (!cluster) {
        throw new Error(`Cluster ${clusterId} not found`);
      }

      const clusterKeywords = cluster.keywords;

      // Create nodes for all keywords in cluster
      const nodes: GraphNode[] = clusterKeywords.map((keyword) => ({
        id: keyword,
        label: keyword,
        cluster_id: clusterId
      }));

      // Find co-occurrences for keywords in this cluster
      const coOccurrences = await this.findCoOccurrences();

      // Build edges for keywords in this cluster
      const edges: GraphEdge[] = [];
      const edgeSet = new Set<string>();

      coOccurrences.forEach((value, key) => {
        const [source, target] = key.split('||');

        // Include edge only if both keywords are in this cluster
        if (clusterKeywords.includes(source) && clusterKeywords.includes(target)) {
          if (!edgeSet.has(key)) {
            edgeSet.add(key);

            // Normalize weight (0-1 scale)
            const maxCoOccurrence = Math.max(
              ...[...coOccurrences.values()].map((v) => v.count),
              1
            );
            const weight = value.count / maxCoOccurrence;

            // Categorize strength
            let strength: 'weak' | 'medium' | 'strong' = 'weak';
            if (weight > 0.66) strength = 'strong';
            else if (weight > 0.33) strength = 'medium';

            edges.push({
              source,
              target,
              weight,
              co_occurrence_count: value.count,
              papers: value.papers
            });

            // Save connection to database
            KeywordConnectionModel.findOneAndUpdate(
              { source_keyword: source, target_keyword: target },
              {
                source_keyword: source,
                target_keyword: target,
                co_occurrence_count: value.count,
                weight,
                papers: value.papers,
                cluster_id: clusterId,
                strength
              },
              { upsert: true }
            ).catch((err) => console.error('Error saving connection:', err));
          }
        }
      });

      return { nodes, edges };
    } catch (error) {
      console.error('Error building cluster graph:', error);
      throw error;
    }
  }

  /**
   * Build graphs for all clusters
   */
  async buildAllClusterGraphs(): Promise<Map<string, Graph>> {
    try {
      const clusters = await KeywordClusterModel.find({});
      const graphs = new Map<string, Graph>();

      for (const cluster of clusters) {
        const graph = await this.buildClusterGraph(cluster.cluster_id);
        graphs.set(cluster.cluster_id, graph);
      }

      return graphs;
    } catch (error) {
      console.error('Error building all cluster graphs:', error);
      throw error;
    }
  }

  /**
   * Get connectivity graph for a cluster
   */
  async getClusterGraph(clusterId: string): Promise<Graph> {
    try {
      const cluster = await KeywordClusterModel.findOne({ cluster_id: clusterId });

      if (!cluster) {
        throw new Error(`Cluster ${clusterId} not found`);
      }

      const nodes: GraphNode[] = cluster.keywords.map((keyword) => ({
        id: keyword,
        label: keyword,
        cluster_id: clusterId
      }));

      const connections = await KeywordConnectionModel.find({
        cluster_id: clusterId
      });

      const edges: GraphEdge[] = connections.map((conn: any) => ({
        source: conn.source_keyword,
        target: conn.target_keyword,
        weight: conn.weight,
        co_occurrence_count: conn.co_occurrence_count,
        papers: conn.papers
      }));

      return { nodes, edges };
    } catch (error) {
      console.error('Error retrieving cluster graph:', error);
      throw error;
    }
  }

  /**
   * Calculate graph statistics
   */
  calculateGraphStatistics(graph: Graph): {
    node_count: number;
    edge_count: number;
    density: number;
    average_degree: number;
  } {
    const nodeCount = graph.nodes.length;
    const edgeCount = graph.edges.length;

    // Density = actual edges / possible edges
    const possibleEdges = (nodeCount * (nodeCount - 1)) / 2;
    const density = possibleEdges > 0 ? edgeCount / possibleEdges : 0;

    // Average degree
    const degrees = new Map<string, number>();
    graph.nodes.forEach((node) => degrees.set(node.id, 0));

    graph.edges.forEach((edge) => {
      degrees.set(edge.source, (degrees.get(edge.source) || 0) + 1);
      degrees.set(edge.target, (degrees.get(edge.target) || 0) + 1);
    });

    const totalDegree = [...degrees.values()].reduce((a, b) => a + b, 0);
    const averageDegree = nodeCount > 0 ? totalDegree / nodeCount : 0;

    return {
      node_count: nodeCount,
      edge_count: edgeCount,
      density: Math.round(density * 10000) / 10000,
      average_degree: Math.round(averageDegree * 100) / 100
    };
  }

  /**
   * Find central (hub) nodes in a graph
   * Nodes with highest degree (most connections)
   */
  findCentralNodes(graph: Graph, topN: number = 5): GraphNode[] {
    const degrees = new Map<string, number>();

    graph.nodes.forEach((node) => degrees.set(node.id, 0));

    graph.edges.forEach((edge) => {
      degrees.set(edge.source, (degrees.get(edge.source) || 0) + 1);
      degrees.set(edge.target, (degrees.get(edge.target) || 0) + 1);
    });

    return graph.nodes
      .sort((a, b) => (degrees.get(b.id) || 0) - (degrees.get(a.id) || 0))
      .slice(0, topN);
  }

  /**
   * Find strongly connected components (communities) using DFS
   */
  findCommunities(graph: Graph): GraphNode[][] {
    const adjacency = new Map<string, string[]>();

    graph.nodes.forEach((node) => adjacency.set(node.id, []));

    graph.edges.forEach((edge) => {
      adjacency.get(edge.source)?.push(edge.target);
      adjacency.get(edge.target)?.push(edge.source);
    });

    const visited = new Set<string>();
    const communities: GraphNode[][] = [];

    const dfs = (nodeId: string, community: Set<string>) => {
      visited.add(nodeId);
      community.add(nodeId);

      const neighbors = adjacency.get(nodeId) || [];
      neighbors.forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          dfs(neighbor, community);
        }
      });
    };

    graph.nodes.forEach((node) => {
      if (!visited.has(node.id)) {
        const community = new Set<string>();
        dfs(node.id, community);
        const communityNodes = graph.nodes.filter((n) => community.has(n.id));
        communities.push(communityNodes);
      }
    });

    return communities;
  }

  /**
   * Clear all connections (for re-analysis)
   */
  async clearConnections(): Promise<void> {
    await KeywordConnectionModel.deleteMany({});
  }
}

export const graphAnalysisService = new GraphAnalysisService();
