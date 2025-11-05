import { Router, Request, Response } from 'express';
import { clusteringService } from '../services/clustering';
import { graphAnalysisService } from '../services/graphAnalysis';
import { knowledgeGraphService } from '../services/knowledgeGraph';
import { KeywordClusterModel } from '../models/KeywordCluster';
import { KeywordConnectionModel } from '../models/KeywordConnection';
import { KnowledgeGraphModel } from '../models/KnowledgeGraph';
import { PaperModel } from '../models/Paper';

export const reportsRouter = Router();

/**
 * POST /api/reports/cluster
 * Generate clusters for keywords
 * Query param: numberOfClusters (default: 10)
 */
reportsRouter.post('/cluster', async (req: Request, res: Response) => {
  try {
    const numberOfClusters = req.query.numberOfClusters
      ? parseInt(req.query.numberOfClusters as string)
      : 10;

    // Clear existing clusters
    await clusteringService.clearClusters();

    // Run clustering
    await clusteringService.clusterKeywords(numberOfClusters);

    const clusters = await clusteringService.getClusters();

    res.json({
      success: true,
      message: `Successfully generated ${clusters.length} clusters`,
      clusters_count: clusters.length,
      clusters
    });
  } catch (error) {
    console.error('Error during clustering:', error);
    res.status(500).json({
      success: false,
      message: 'Error during clustering',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/reports/clusters
 * Get all clusters with their keywords and papers
 */
reportsRouter.get('/clusters', async (req: Request, res: Response) => {
  try {
    const clusters = await KeywordClusterModel.find({}).sort({ size: -1 });

    // Fetch papers for each cluster
    const clustersWithPapers = await Promise.all(
      clusters.map(async (cluster) => {
        // Find papers that contain any of the cluster's keywords
        const papers = await PaperModel.find({
          keywords: { $in: cluster.keywords }
        })
          .select('title')
          .limit(10); // Limit to first 10 papers per cluster

        return {
          ...cluster.toObject(),
          paper_titles: papers.map(p => p.title)
        };
      })
    );

    res.json({
      success: true,
      clusters_count: clustersWithPapers.length,
      clusters: clustersWithPapers
    });
  } catch (error) {
    console.error('Error fetching clusters:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching clusters',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/reports/clusters/:clusterId
 * Get a specific cluster with its connectivity graph
 */
reportsRouter.get('/clusters/:clusterId', async (req: Request, res: Response) => {
  try {
    const { clusterId } = req.params;

    const cluster = await KeywordClusterModel.findOne({ cluster_id: clusterId });

    if (!cluster) {
      return res.status(404).json({
        success: false,
        message: `Cluster ${clusterId} not found`
      });
    }

    // Get the graph for this cluster
    const graph = await graphAnalysisService.getClusterGraph(clusterId);
    const statistics = graphAnalysisService.calculateGraphStatistics(graph);
    const centralNodes = graphAnalysisService.findCentralNodes(graph, 5);
    const communities = graphAnalysisService.findCommunities(graph);

    res.json({
      success: true,
      cluster,
      graph,
      statistics,
      central_nodes: centralNodes,
      communities: communities.map((nodes, idx) => ({
        id: `community_${idx}`,
        nodes: nodes.map((n) => n.id),
        size: nodes.length
      }))
    });
  } catch (error) {
    console.error('Error fetching cluster:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cluster',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/reports/connectivity-graphs
 * Build connectivity graphs for all clusters
 */
reportsRouter.post('/connectivity-graphs', async (req: Request, res: Response) => {
  try {
    // Clear existing connections
    await graphAnalysisService.clearConnections();

    // Build graphs for all clusters
    const graphs = await graphAnalysisService.buildAllClusterGraphs();

    res.json({
      success: true,
      message: `Generated connectivity graphs for ${graphs.size} clusters`,
      graphs_count: graphs.size
    });
  } catch (error) {
    console.error('Error building connectivity graphs:', error);
    res.status(500).json({
      success: false,
      message: 'Error building connectivity graphs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/reports/connectivity-graphs/:clusterId
 * Get connectivity graph for a specific cluster
 */
reportsRouter.get('/connectivity-graphs/:clusterId', async (req: Request, res: Response) => {
  try {
    const { clusterId } = req.params;

    const graph = await graphAnalysisService.getClusterGraph(clusterId);
    const statistics = graphAnalysisService.calculateGraphStatistics(graph);

    res.json({
      success: true,
      graph,
      statistics
    });
  } catch (error) {
    console.error('Error fetching connectivity graph:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching connectivity graph',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/reports/connections
 * Get all keyword connections
 * Query params: limit, skip, cluster_id
 */
reportsRouter.get('/connections', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;
    const clusterId = req.query.cluster_id as string | undefined;

    const query = clusterId ? { cluster_id: clusterId } : {};

    const connections = await KeywordConnectionModel.find(query)
      .sort({ co_occurrence_count: -1 })
      .skip(skip)
      .limit(limit);

    const total = await KeywordConnectionModel.countDocuments(query);

    res.json({
      success: true,
      connections_count: connections.length,
      total,
      connections
    });
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching connections',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/reports/knowledge-graph
 * Build unified knowledge graph from all clusters
 */
reportsRouter.post('/knowledge-graph', async (req: Request, res: Response) => {
  try {
    // Clear existing knowledge graphs
    await knowledgeGraphService.clearKnowledgeGraphs();

    // Build unified knowledge graph
    await knowledgeGraphService.buildUnifiedKnowledgeGraph();

    const graph = await knowledgeGraphService.getKnowledgeGraph();

    res.json({
      success: true,
      message: 'Successfully built unified knowledge graph',
      graph
    });
  } catch (error) {
    console.error('Error building knowledge graph:', error);
    res.status(500).json({
      success: false,
      message: 'Error building knowledge graph',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/reports/knowledge-graph
 * Get the unified knowledge graph
 */
reportsRouter.get('/knowledge-graph', async (req: Request, res: Response) => {
  try {
    const graph = await knowledgeGraphService.getKnowledgeGraph();

    if (!graph) {
      return res.status(404).json({
        success: false,
        message: 'Knowledge graph not found. Please generate it first.'
      });
    }

    res.json({
      success: true,
      graph
    });
  } catch (error) {
    console.error('Error fetching knowledge graph:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching knowledge graph',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/reports/generate-all
 * Complete pipeline: cluster -> build graphs -> build knowledge graph
 * Query params: numberOfClusters (default: 10), keywordLimit (optional: limit keywords to analyze)
 */
reportsRouter.post('/generate-all', async (req: Request, res: Response) => {
  try {
    console.log('Starting complete report generation pipeline...');

    // Step 1: Cluster keywords
    console.log('Step 1: Clustering keywords...');
    const numberOfClusters = req.query.numberOfClusters
      ? parseInt(req.query.numberOfClusters as string)
      : 10;
    const keywordLimit = req.query.keywordLimit
      ? parseInt(req.query.keywordLimit as string)
      : undefined;

    await clusteringService.clearClusters();
    await clusteringService.clusterKeywords(numberOfClusters, keywordLimit);
    const clusters = await clusteringService.getClusters();
    console.log(`Generated ${clusters.length} clusters`);

    // Step 2: Build connectivity graphs
    console.log('Step 2: Building connectivity graphs...');
    await graphAnalysisService.clearConnections();
    await graphAnalysisService.buildAllClusterGraphs();
    console.log('Connectivity graphs built');

    // Step 3: Build unified knowledge graph
    console.log('Step 3: Building unified knowledge graph...');
    await knowledgeGraphService.clearKnowledgeGraphs();
    await knowledgeGraphService.buildUnifiedKnowledgeGraph();
    const knowledgeGraph = await knowledgeGraphService.getKnowledgeGraph();
    console.log('Knowledge graph built');

    res.json({
      success: true,
      message: 'Complete report generation pipeline finished successfully',
      results: {
        clusters_count: clusters.length,
        knowledge_graph: knowledgeGraph
      }
    });
  } catch (error) {
    console.error('Error in report generation pipeline:', error);
    res.status(500).json({
      success: false,
      message: 'Error in report generation pipeline',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/reports/status
 * Get current status of clustering/graph generation
 */
reportsRouter.get('/status', async (req: Request, res: Response) => {
  try {
    const clustersCount = await KeywordClusterModel.countDocuments({});
    const connectionsCount = await KeywordConnectionModel.countDocuments({});
    const knowledgeGraphs = await KnowledgeGraphModel.countDocuments({});

    res.json({
      success: true,
      status: {
        clusters_generated: clustersCount > 0,
        clusters_count: clustersCount,
        connectivity_graphs_generated: connectionsCount > 0,
        connections_count: connectionsCount,
        knowledge_graph_generated: knowledgeGraphs > 0,
        knowledge_graph_count: knowledgeGraphs
      }
    });
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/reports/clear-all
 * Clear all generated reports (clusters, graphs, knowledge graphs)
 */
reportsRouter.delete('/clear-all', async (req: Request, res: Response) => {
  try {
    await clusteringService.clearClusters();
    await graphAnalysisService.clearConnections();
    await knowledgeGraphService.clearKnowledgeGraphs();

    res.json({
      success: true,
      message: 'All reports cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing reports',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
