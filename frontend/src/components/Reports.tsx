import { useEffect, useState } from 'react';
import { GraphVisualization } from './GraphVisualization';

const api = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

interface Cluster {
  cluster_id: string;
  name: string;
  theme: string;
  keywords: string[];
  size: number;
  papers_count: number;
  confidence: number;
  paper_titles?: string[];
}

interface GraphNode {
  id: string;
  label: string;
  cluster_id?: string;
}

interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  co_occurrence_count?: number;
}

interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface GraphStatistics {
  node_count: number;
  edge_count: number;
  density: number;
  average_degree: number;
}

interface ReportStatus {
  clusters_generated: boolean;
  clusters_count: number;
  connectivity_graphs_generated: boolean;
  connections_count: number;
  knowledge_graph_generated: boolean;
  knowledge_graph_count: number;
}

export function Reports() {
  const [status, setStatus] = useState<ReportStatus | null>(null);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [clusterGraph, setClusterGraph] = useState<Graph | null>(null);
  const [graphStats, setGraphStats] = useState<GraphStatistics | null>(null);
  const [knowledgeGraph, setKnowledgeGraph] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'clusters' | 'graphs' | 'knowledge'>('overview');
  const [keywordLimit, setKeywordLimit] = useState(50);

  // Tailwind CSS styles (will be injected)
  const styles = `
    .reports-container { font-family: Inter, system-ui, sans-serif; min-height: 100vh; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px; }
    .reports-header { max-width: 1400px; margin: 0 auto; margin-bottom: 32px; }
    .reports-header h1 { font-size: 36px; font-weight: 700; color: white; margin-bottom: 8px; }
    .reports-header p { color: #cbd5e1; font-size: 14px; margin: 0; }
    .reports-header-actions { display: flex; gap: 16px; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .btn-generate { padding: 12px 24px; background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 16px; transition: opacity 0.3s; }
    .btn-generate:hover:not(:disabled) { opacity: 0.9; }
    .btn-generate:disabled { opacity: 0.5; cursor: not-allowed; }
    .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; max-width: 1400px; margin-left: auto; margin-right: auto; }
    .status-card { background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(71, 85, 105, 0.5); border-radius: 12px; padding: 20px; backdrop-filter: blur(10px); }
    .status-card-label { font-size: 13px; color: #94a3b8; margin-bottom: 8px; font-weight: 500; }
    .status-card-value { font-size: 28px; font-weight: 700; color: #3b82f6; margin-bottom: 8px; }
    .status-card-status { font-size: 12px; color: #64748b; }
    .status-card-status.success { color: #10b981; }
    .status-card-status.pending { color: #f59e0b; }
    .tabs-container { max-width: 1400px; margin: 0 auto; display: flex; gap: 8px; border-bottom: 1px solid rgba(71, 85, 105, 0.3); margin-bottom: 32px; }
    .tab-button { padding: 12px 24px; background: none; border: none; color: #94a3b8; font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.3s; font-size: 14px; }
    .tab-button:hover { color: #cbd5e1; }
    .tab-button.active { color: #3b82f6; border-bottom-color: #3b82f6; }
    .content-area { max-width: 1400px; margin: 0 auto; }
  `;

  // Fetch current status
  const fetchStatus = async () => {
    try {
      const response = await fetch(`${api}/api/reports/status`);
      const data = await response.json();
      setStatus(data.status);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  // Fetch all clusters
  const fetchClusters = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${api}/api/reports/clusters`);
      const data = await response.json();
      setClusters(data.clusters || []);
    } catch (error) {
      console.error('Error fetching clusters:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cluster graph
  const fetchClusterGraph = async (clusterId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${api}/api/reports/clusters/${clusterId}`);
      const data = await response.json();
      
      if (data.success) {
        setClusterGraph(data.graph);
        setGraphStats(data.statistics);
      }
    } catch (error) {
      console.error('Error fetching cluster graph:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch knowledge graph
  const fetchKnowledgeGraph = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${api}/api/reports/knowledge-graph`);
      const data = await response.json();
      
      if (data.success) {
        setKnowledgeGraph(data.graph);
      }
    } catch (error) {
      console.error('Error fetching knowledge graph:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate all reports
  const generateAllReports = async () => {
    try {
      setGenerating(true);
      const response = await fetch(`${api}/api/reports/generate-all?numberOfClusters=10&keywordLimit=${keywordLimit}`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Reports generated successfully!');
        // Add a small delay to ensure data is persisted
        setTimeout(async () => {
          await fetchStatus();
          await fetchClusters();
          await fetchKnowledgeGraph();
        }, 1000);
      } else {
        alert('Error generating reports: ' + data.message);
      }
    } catch (error) {
      console.error('Error generating reports:', error);
      alert('Error generating reports');
    } finally {
      setGenerating(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh', background: '#f8f9fa', paddingTop: '32px', paddingBottom: '32px', paddingLeft: '32px', paddingRight: '32px' }}>
      <style>{`
        .reports-btn-generate { padding: '12px 24px', background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '16px', transition: 'opacity 0.3s' }
        .reports-btn-generate:hover { opacity: 0.9 }
        .reports-btn-generate:disabled { opacity: 0.5, cursor: 'not-allowed' }
      `}</style>
      
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '36px', fontWeight: '700', color: '#1a202c', marginBottom: '8px' }}>Research Reports</h1>
              <p style={{ color: '#718096', fontSize: '14px', margin: 0 }}>Thematic clustering, connectivity analysis, and knowledge graphs</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ color: '#4a5568', fontSize: '14px', fontWeight: '500' }}>Keywords to analyze:</label>
                <select
                  value={keywordLimit}
                  onChange={(e) => setKeywordLimit(parseInt(e.target.value))}
                  disabled={generating}
                  style={{
                    padding: '8px 12px',
                    background: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    color: '#4a5568',
                    cursor: generating ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    opacity: generating ? 0.5 : 1
                  }}
                >
                  <option value={20}>First 20</option>
                  <option value={50}>First 50</option>
                  <option value={100}>First 100</option>
                  <option value={200}>First 200</option>
                  <option value={500}>First 500</option>
                  <option value={999999}>All Keywords</option>
                </select>
              </div>
              <button
                onClick={generateAllReports}
                disabled={generating}
                style={{ 
                  padding: '12px 24px', 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: generating ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '16px',
                  opacity: generating ? '0.5' : '1',
                  transition: 'opacity 0.3s'
                }}
              >
                {generating ? 'Generating...' : '🚀 Generate All Reports'}
              </button>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        {status && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '13px', color: '#718096', marginBottom: '8px', fontWeight: '500' }}>Clusters</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#3b82f6', marginBottom: '8px' }}>{status.clusters_count}</div>
              <div style={{ fontSize: '12px', color: status.clusters_generated ? '#10b981' : '#a0aec0' }}>
                {status.clusters_generated ? '✓ Generated' : '○ Not generated'}
              </div>
            </div>

            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '13px', color: '#718096', marginBottom: '8px', fontWeight: '500' }}>Connections</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981', marginBottom: '8px' }}>{status.connections_count}</div>
              <div style={{ fontSize: '12px', color: status.connectivity_graphs_generated ? '#10b981' : '#a0aec0' }}>
                {status.connectivity_graphs_generated ? '✓ Generated' : '○ Not generated'}
              </div>
            </div>

            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '13px', color: '#718096', marginBottom: '8px', fontWeight: '500' }}>Knowledge Graph</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#a855f7', marginBottom: '8px' }}>{status.knowledge_graph_count}</div>
              <div style={{ fontSize: '12px', color: status.knowledge_graph_generated ? '#10b981' : '#a0aec0' }}>
                {status.knowledge_graph_generated ? '✓ Generated' : '○ Not generated'}
              </div>
            </div>

            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '13px', color: '#718096', marginBottom: '8px', fontWeight: '500' }}>Pipeline</div>
              <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: status.clusters_generated && status.connectivity_graphs_generated && status.knowledge_graph_generated ? '#10b981' : '#f59e0b' }}>
                {status.clusters_generated && status.connectivity_graphs_generated && status.knowledge_graph_generated ? '✓ Complete' : '⟳ Pending'}
              </div>
              <div style={{ fontSize: '12px', color: '#a0aec0' }}>All stages</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '32px' }}>
          {(['overview', 'clusters', 'graphs', 'knowledge'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === 'clusters' && clusters.length === 0) fetchClusters();
                if (tab === 'knowledge' && !knowledgeGraph) fetchKnowledgeGraph();
              }}
              style={{
                padding: '12px 24px',
                background: 'none',
                border: 'none',
                color: activeTab === tab ? '#3b82f6' : '#a0aec0',
                fontWeight: '600',
                cursor: 'pointer',
                borderBottom: activeTab === tab ? '3px solid #3b82f6' : '3px solid transparent',
                transition: 'all 0.3s',
                fontSize: '14px'
              }}
            >
              {tab === 'overview' && '📊 Overview'}
              {tab === 'clusters' && '🎯 Thematic Clusters'}
              {tab === 'graphs' && '🔗 Connectivity Graphs'}
              {tab === 'knowledge' && '🧠 Knowledge Graph'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab status={status} />
        )}

        {activeTab === 'clusters' && (
          <ClustersTab
            clusters={clusters}
            loading={loading}
            onFetchClusters={fetchClusters}
            onSelectCluster={(id) => {
              setSelectedCluster(id);
              fetchClusterGraph(id);
            }}
            selectedCluster={selectedCluster}
            clusterGraph={clusterGraph}
            graphStats={graphStats}
          />
        )}

        {activeTab === 'graphs' && (
          <GraphsTab
            clusters={clusters}
            selectedCluster={selectedCluster}
            onSelectCluster={(id) => {
              setSelectedCluster(id);
              fetchClusterGraph(id);
            }}
            clusterGraph={clusterGraph}
            graphStats={graphStats}
            loading={loading}
            onFetchClusters={fetchClusters}
          />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeGraphTab
            graph={knowledgeGraph}
            loading={loading}
            onRefresh={fetchKnowledgeGraph}
          />
        )}
      </div>
    </div>
  );
}

function OverviewTab({ status }: { status: ReportStatus | null }) {
  return (
    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white', marginBottom: '24px' }}>🎯 Report Generation Pipeline</h2>

      <div>
        {/* Stage 1: Clustering */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            background: status?.clusters_generated ? '#10b981' : '#64748b',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            1
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>Thematic Clustering</h3>
            <p style={{ color: '#4a5568', fontSize: '14px', marginBottom: '8px' }}>Groups keywords thematically using K-means clustering algorithm</p>
            <div style={{ fontSize: '14px', color: status?.clusters_generated ? '#10b981' : '#94a3b8' }}>
              {status?.clusters_generated ? `✓ ${status.clusters_count} clusters generated` : '○ Not yet generated'}
            </div>
          </div>
        </div>

        {/* Stage 2: Connectivity Graphs */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            background: status?.connectivity_graphs_generated ? '#10b981' : '#64748b',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            2
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>Connectivity Graphs</h3>
            <p style={{ color: '#4a5568', fontSize: '14px', marginBottom: '8px' }}>Analyzes co-occurrence patterns between keywords within each cluster</p>
            <div style={{ fontSize: '14px', color: status?.connectivity_graphs_generated ? '#10b981' : '#94a3b8' }}>
              {status?.connectivity_graphs_generated ? `✓ ${status.connections_count} connections detected` : '○ Not yet generated'}
            </div>
          </div>
        </div>

        {/* Stage 3: Knowledge Graph */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            background: status?.knowledge_graph_generated ? '#10b981' : '#64748b',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            3
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>Unified Knowledge Graph</h3>
            <p style={{ color: '#4a5568', fontSize: '14px', marginBottom: '8px' }}>Merges all cluster graphs into comprehensive network with graph algorithms</p>
            <div style={{ fontSize: '14px', color: status?.knowledge_graph_generated ? '#10b981' : '#94a3b8' }}>
              {status?.knowledge_graph_generated ? '✓ Knowledge graph generated' : '○ Not yet generated'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClustersTab({
  clusters,
  loading,
  onFetchClusters,
  onSelectCluster,
  selectedCluster,
  clusterGraph,
  graphStats
}: {
  clusters: Cluster[];
  loading: boolean;
  onFetchClusters: () => void;
  onSelectCluster: (id: string) => void;
  selectedCluster: string | null;
  clusterGraph: Graph | null;
  graphStats: GraphStatistics | null;
}) {
  useEffect(() => {
    if (clusters.length === 0) {
      onFetchClusters();
    }
  }, []);

  const selectedClusterData = clusters.find(c => c.cluster_id === selectedCluster);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header with cluster count */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'white', margin: 0 }}>🎯 Thematic Clusters Overview</h2>
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px' }}>
          <div style={{ fontSize: '12px', color: '#718096' }}>Total Clusters</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6' }}>{clusters.length}</div>
        </div>
      </div>

      {/* Clusters Table */}
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ color: '#718096', padding: '24px', textAlign: 'center' }}>Loading clusters...</div>
        ) : clusters.length === 0 ? (
          <div style={{ color: '#718096', fontSize: '14px', padding: '24px', textAlign: 'center' }}>No clusters found. Generate reports first.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#1e293b', borderBottom: '2px solid rgba(71, 85, 105, 0.5)' }}>
                  <th style={{ padding: '16px', textAlign: 'left', color: '#93c5fd', fontWeight: '600', width: '10%' }}>Cluster</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: '#93c5fd', fontWeight: '600', width: '35%' }}>Top Keywords</th>
                  <th style={{ padding: '16px', textAlign: 'left', color: '#93c5fd', fontWeight: '600', width: '55%' }}>Sample Paper Titles</th>
                </tr>
              </thead>
              <tbody>
                {clusters.map((cluster, idx) => (
                  <tr
                    key={cluster.cluster_id}
                    onClick={() => onSelectCluster(cluster.cluster_id)}
                    style={{
                      background: selectedCluster === cluster.cluster_id ? 'rgba(59, 130, 246, 0.15)' : idx % 2 === 0 ? 'transparent' : 'rgba(30, 41, 59, 0.5)',
                      borderBottom: '1px solid rgba(71, 85, 105, 0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: selectedCluster === cluster.cluster_id ? '2px solid #3b82f6' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = selectedCluster === cluster.cluster_id ? 'rgba(59, 130, 246, 0.15)' : idx % 2 === 0 ? 'transparent' : 'rgba(30, 41, 59, 0.5)';
                    }}
                  >
                    <td style={{ padding: '16px', color: '#4a5568', fontWeight: '600' }}>
                      <div style={{ fontSize: '16px', color: '#3b82f6' }}>{cluster.cluster_id}</div>
                    </td>
                    <td style={{ padding: '16px', color: '#4a5568', maxHeight: '100px', overflowY: 'auto' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {cluster.keywords.slice(0, 15).map((kw, i) => (
                          <span
                            key={i}
                            style={{
                              padding: '3px 8px',
                              background: 'rgba(59, 130, 246, 0.2)',
                              color: '#93c5fd',
                              borderRadius: '4px',
                              fontSize: '12px',
                              border: '1px solid rgba(59, 130, 246, 0.3)'
                            }}
                          >
                            {kw}
                          </span>
                        ))}
                        {cluster.keywords.length > 15 && (
                          <span style={{ color: '#718096', fontSize: '12px', padding: '3px 8px' }}>
                            +{cluster.keywords.length - 15} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#4a5568', maxHeight: '100px', overflowY: 'auto' }}>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#4a5568', fontSize: '13px' }}>
                        {cluster.paper_titles && cluster.paper_titles.length > 0 ? (
                          <>
                            {cluster.paper_titles.slice(0, 5).map((title, i) => (
                              <li key={i} style={{ marginBottom: '6px', lineHeight: '1.4' }}>
                                {title}
                              </li>
                            ))}
                            {cluster.paper_titles.length > 5 && (
                              <li style={{ color: '#718096', marginTop: '6px' }}>
                                ... and {cluster.paper_titles.length - 5} more papers
                              </li>
                            )}
                          </>
                        ) : (
                          <li style={{ color: '#718096' }}>No papers found for this cluster</li>
                        )}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Cluster Details */}
      {selectedCluster && selectedClusterData && clusterGraph ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '16px', maxHeight: '500px' }}>
          {/* Left: Graph Visualization */}
          <GraphVisualization graph={clusterGraph} />

          {/* Right: Cluster Details Sidebar */}
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Cluster Title */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
                {selectedClusterData.name}
              </h3>
              <p style={{ color: '#4a5568', fontSize: '12px', margin: 0 }}>{selectedClusterData.theme}</p>
            </div>

            {/* Statistics Grid */}
            {graphStats && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ background: '#475569', borderRadius: '8px', padding: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#718096' }}>Nodes</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#60a5fa' }}>{graphStats.node_count}</div>
                </div>
                <div style={{ background: '#475569', borderRadius: '8px', padding: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#718096' }}>Edges</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#10b981' }}>{graphStats.edge_count}</div>
                </div>
                <div style={{ background: '#475569', borderRadius: '8px', padding: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#718096' }}>Density</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#a855f7' }}>{(graphStats.density * 100).toFixed(1)}%</div>
                </div>
                <div style={{ background: '#475569', borderRadius: '8px', padding: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#718096' }}>Avg Deg</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#eab308' }}>{graphStats.average_degree.toFixed(1)}</div>
                </div>
              </div>
            )}

            {/* Top Keywords */}
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>Top Keywords</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '250px', overflowY: 'auto' }}>
                {clusterGraph.nodes.slice(0, 8).map((node) => (
                  <span
                    key={node.id}
                    style={{
                      padding: '4px 8px',
                      background: 'rgba(59, 130, 246, 0.2)',
                      color: '#93c5fd',
                      borderRadius: '6px',
                      fontSize: '11px',
                      border: '1px solid rgba(59, 130, 246, 0.5)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={node.label}
                  >
                    • {node.label}
                  </span>
                ))}
                {clusterGraph.nodes.length > 8 && (
                  <div style={{ fontSize: '10px', color: '#718096', textAlign: 'center', paddingTop: '4px' }}>
                    +{clusterGraph.nodes.length - 8} more
                  </div>
                )}
              </div>
            </div>

            {/* Top Connections */}
            {clusterGraph.edges.length > 0 && (
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>Top Connections</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '250px', overflowY: 'auto' }}>
                  {clusterGraph.edges
                    .sort((a, b) => (b.weight || 0) - (a.weight || 0))
                    .slice(0, 5)
                    .map((edge, idx) => (
                      <div key={idx} style={{ background: '#475569', borderRadius: '6px', padding: '6px', fontSize: '10px' }}>
                        <div style={{ color: '#4a5568', marginBottom: '2px' }}>
                          <span style={{ color: '#93c5fd', fontWeight: '600' }}>{edge.source}</span>
                          <span style={{ color: '#64748b', margin: '0 4px' }}>↔</span>
                          <span style={{ color: '#86efac', fontWeight: '600' }}>{edge.target}</span>
                        </div>
                        <div style={{ color: '#eab308', fontWeight: '600' }}>
                          {edge.co_occurrence_count || Math.round((edge.weight || 0) * 100)} co-occurrences
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function GraphsTab({
  clusters,
  selectedCluster,
  onSelectCluster,
  clusterGraph,
  graphStats,
  loading,
  onFetchClusters
}: {
  clusters: Cluster[];
  selectedCluster: string | null;
  onSelectCluster: (id: string) => void;
  clusterGraph: Graph | null;
  graphStats: GraphStatistics | null;
  loading: boolean;
  onFetchClusters: () => void;
}) {
  useEffect(() => {
    if (clusters.length === 0) {
      onFetchClusters();
    }
  }, []);

  const selectedClusterData = clusters.find(c => c.cluster_id === selectedCluster);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header with cluster selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '14px', color: '#718096', marginBottom: '8px', display: 'block' }}>Select Cluster</label>
          {loading ? (
            <div style={{ color: '#718096', padding: '12px' }}>Loading...</div>
          ) : clusters.length === 0 ? (
            <div style={{ color: '#718096', fontSize: '14px', padding: '12px' }}>No clusters found. Generate reports first.</div>
          ) : (
            <select
              value={selectedCluster || ''}
              onChange={(e) => onSelectCluster(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                background: '#475569',
                color: 'white',
                border: '1px solid #64748b',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              <option value="">-- Select a cluster --</option>
              {clusters.map((cluster) => (
                <option key={cluster.cluster_id} value={cluster.cluster_id}>
                  {cluster.name} ({cluster.size} keywords)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Summary Stats */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', minWidth: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>Total Clusters</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>{clusters.length}</div>
        </div>
      </div>

      {/* Full-width Graph */}
      {selectedCluster && clusterGraph ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Graph with full width */}
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', minHeight: '600px' }}>
            <GraphVisualization graph={clusterGraph} />
          </div>

          {/* Details below graph */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '16px' }}>
            {/* Left: Cluster Info and Statistics */}
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Cluster Title */}
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
                  {selectedClusterData?.name}
                </h3>
                <p style={{ color: '#4a5568', fontSize: '14px', margin: 0 }}>{selectedClusterData?.theme}</p>
              </div>

              {/* Statistics Grid */}
              {graphStats && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                  <div style={{ background: '#475569', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#718096' }}>Nodes</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#60a5fa' }}>{graphStats.node_count}</div>
                  </div>
                  <div style={{ background: '#475569', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#718096' }}>Edges</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>{graphStats.edge_count}</div>
                  </div>
                  <div style={{ background: '#475569', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#718096' }}>Density</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#a855f7' }}>{(graphStats.density * 100).toFixed(1)}%</div>
                  </div>
                  <div style={{ background: '#475569', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '12px', color: '#718096' }}>Avg Degree</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#eab308' }}>{graphStats.average_degree.toFixed(1)}</div>
                  </div>
                </div>
              )}

              {/* Keywords */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '12px' }}>Keywords in Cluster ({clusterGraph.nodes.length})</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                  {clusterGraph.nodes.map((node) => (
                    <span
                      key={node.id}
                      style={{
                        padding: '6px 12px',
                        background: 'rgba(59, 130, 246, 0.2)',
                        color: '#93c5fd',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        border: '1px solid rgba(59, 130, 246, 0.5)'
                      }}
                    >
                      {node.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Top Connections */}
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', overflowY: 'auto' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '12px' }}>Top Connections</h4>
              {clusterGraph.edges.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {clusterGraph.edges
                    .sort((a, b) => (b.weight || 0) - (a.weight || 0))
                    .slice(0, 10)
                    .map((edge, idx) => (
                      <div key={idx} style={{ background: '#475569', borderRadius: '8px', padding: '10px', fontSize: '12px' }}>
                        <div style={{ color: '#4a5568', marginBottom: '4px' }}>
                          <span style={{ color: '#93c5fd', fontWeight: '600' }}>{edge.source}</span>
                          <span style={{ color: '#64748b', margin: '0 4px' }}>↔</span>
                          <span style={{ color: '#86efac', fontWeight: '600' }}>{edge.target}</span>
                        </div>
                        <div style={{ color: '#eab308', fontWeight: '600', fontSize: '11px' }}>
                          {edge.co_occurrence_count || Math.round((edge.weight || 0) * 100)} co-occurrences
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div style={{ color: '#718096', fontSize: '12px' }}>No connections found</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '48px', textAlign: 'center', color: '#718096', minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Select a cluster from the dropdown to view its connectivity graph
        </div>
      )}
    </div>
  );
}

function KnowledgeGraphTab({
  graph,
  loading,
  onRefresh
}: {
  graph: any;
  loading: boolean;
  onRefresh: () => void;
}) {
  useEffect(() => {
    if (!graph) {
      onRefresh();
    }
  }, []);

  return (
    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'white' }}>🧠 Unified Knowledge Graph</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            borderRadius: '8px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s ease',
            fontSize: '14px',
            opacity: loading ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.background = '#2563eb';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.background = '#3b82f6';
          }}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div style={{ color: '#718096' }}>Loading knowledge graph...</div>
      ) : !graph ? (
        <div style={{ color: '#718096' }}>Knowledge graph not found. Generate reports first.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Graph Visualization */}
          {graph.nodes && graph.edges && (
            <GraphVisualization
              graph={{
                nodes: graph.nodes,
                edges: graph.edges
              }}
            />
          )}

          {/* Statistics */}
          {graph.statistics && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#475569', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>Total Nodes</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#60a5fa' }}>{graph.statistics.node_count}</div>
              </div>
              <div style={{ background: '#475569', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>Total Edges</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>{graph.statistics.edge_count}</div>
              </div>
              <div style={{ background: '#475569', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>Density</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#a855f7' }}>{(graph.statistics.density * 100).toFixed(1)}%</div>
              </div>
              <div style={{ background: '#475569', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>Avg Degree</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#eab308' }}>{graph.statistics.average_degree?.toFixed(1) || 'N/A'}</div>
              </div>
              <div style={{ background: '#475569', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: '#718096', marginBottom: '4px' }}>Components</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#ec4899' }}>{graph.statistics.components || 'N/A'}</div>
              </div>
            </div>
          )}

          {/* Hub Nodes */}
          {graph.analysis?.hub_nodes && graph.analysis.hub_nodes.length > 0 && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '12px' }}>🌟 Hub Nodes (Central Keywords)</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {graph.analysis.hub_nodes.slice(0, 10).map((nodeId: string, idx: number) => (
                  <span
                    key={idx}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(59, 130, 246, 0.3)',
                      color: '#93c5fd',
                      borderRadius: '9999px',
                      fontSize: '14px',
                      border: '1px solid rgba(59, 130, 246, 0.5)',
                      fontWeight: '600'
                    }}
                  >
                    {nodeId}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Communities */}
          {graph.analysis?.communities && graph.analysis.communities.length > 0 && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '12px' }}>🔗 Detected Communities ({graph.analysis.communities.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '192px', overflowY: 'auto' }}>
                {graph.analysis.communities.slice(0, 5).map((community: any, idx: number) => (
                  <div key={idx} style={{ background: '#475569', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>
                      Community {idx + 1} ({community.nodes.length} nodes)
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {community.nodes.slice(0, 8).map((nodeId: string, nIdx: number) => (
                        <span
                          key={nIdx}
                          style={{
                            padding: '4px 8px',
                            background: '#3f4651',
                            color: '#4a5568',
                            borderRadius: '6px',
                            fontSize: '12px'
                          }}
                        >
                          {nodeId}
                        </span>
                      ))}
                      {community.nodes.length > 8 && (
                        <span style={{
                          padding: '4px 8px',
                          background: '#3f4651',
                          color: '#718096',
                          fontSize: '12px'
                        }}>
                          +{community.nodes.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Central Nodes */}
          {graph.analysis?.central_nodes && graph.analysis.central_nodes.length > 0 && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '12px' }}>📊 Most Central Nodes</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '192px', overflowY: 'auto' }}>
                {graph.analysis.central_nodes.slice(0, 5).map((node: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#475569', borderRadius: '8px', padding: '12px', fontSize: '14px' }}>
                    <span style={{ fontWeight: '600', color: 'white' }}>{node.node_id}</span>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                      <span style={{ color: '#93c5fd' }}>
                        Degree: {(node.degree_centrality || 0).toFixed(2)}
                      </span>
                      <span style={{ color: '#86efac' }}>
                        Between: {(node.betweenness_centrality || 0).toFixed(2)}
                      </span>
                      <span style={{ color: '#fbbf24' }}>
                        Close: {(node.closeness_centrality || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
