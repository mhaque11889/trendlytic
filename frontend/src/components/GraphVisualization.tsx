import { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network/standalone';

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

interface SelectedNodeInfo {
  id: string;
  label: string;
  cluster_id?: string;
  connections: string[];
  degree: number;
}

export function GraphVisualization({
  graph,
  onNodeClick
}: {
  graph: Graph | null;
  onNodeClick?: (node: SelectedNodeInfo) => void;
}) {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstance = useRef<Network | null>(null);
  const [selectedNode, setSelectedNode] = useState<SelectedNodeInfo | null>(null);

  useEffect(() => {
    if (!graph || !networkRef.current) return;

    // Prepare nodes
    const nodesArray = graph.nodes.map((node) => ({
      id: node.id,
      label: node.label,
      title: `${node.label}\n(${node.cluster_id || 'unknown'})`,
      color: {
        background: '#3b82f6',
        border: '#1e40af',
        highlight: {
          background: '#60a5fa',
          border: '#1e40af'
        }
      },
      font: {
        size: 12,
        color: 'white'
      },
      borderWidth: 2,
      shadow: true,
      physics: true
    }));

    // Prepare edges
    const edgesArray = graph.edges.map((edge) => ({
      from: edge.source,
      to: edge.target,
      value: (edge.co_occurrence_count || 1) * 2,
      title: `Weight: ${(edge.weight || 0).toFixed(2)}\nCo-occurrence: ${edge.co_occurrence_count || 0}`,
      color: {
        color: 'rgba(107, 114, 128, 0.5)',
        highlight: 'rgba(59, 130, 246, 0.8)'
      },
      physics: true,
      smooth: {
        type: 'continuous'
      }
    }));

    const data: any = {
      nodes: nodesArray,
      edges: edgesArray
    };

    const options: any = {
      physics: {
        enabled: true,
        forceAtlas2Based: {
          gravitationalConstant: -50,
          centralGravity: 0.005,
          springLength: 200,
          springConstant: 0.08
        },
        maxVelocity: 50,
        solver: 'forceAtlas2Based',
        timestep: 0.35,
        stabilization: {
          iterations: 150
        }
      },
      nodes: {
        scaling: {
          min: 10,
          max: 40
        },
        margin: { top: 10, right: 10, bottom: 10, left: 10 }
      },
      edges: {
        scaling: {
          min: 0.5,
          max: 3
        }
      },
      interaction: {
        hover: true,
        navigationButtons: true,
        keyboard: true,
        zoomView: true,
        dragView: true
      },
      layout: {
        randomSeed: 42
      }
    };

    if (networkInstance.current) {
      networkInstance.current.destroy();
    }

    networkInstance.current = new Network(networkRef.current, data, options);

    // Handle node clicks
    const handleNodeClick = (event: any) => {
      if (event.nodes.length > 0) {
        const nodeId = event.nodes[0];
        const node = nodesArray.find(n => n.id === nodeId);
        
        // Find connected nodes
        const connections = edgesArray
          .filter(e => e.from === nodeId || e.to === nodeId)
          .map(e => e.from === nodeId ? e.to : e.from);

        const selectedNodeInfo: SelectedNodeInfo = {
          id: nodeId,
          label: node?.label || nodeId,
          cluster_id: node?.title?.split('\n')[1]?.replace('(', '').replace(')', ''),
          connections: connections,
          degree: connections.length
        };

        setSelectedNode(selectedNodeInfo);
        onNodeClick?.(selectedNodeInfo);

        // Highlight connected nodes
        const connectedNodeIds = [nodeId, ...connections];
        const updatedNodes = nodesArray.map((n: any) => ({
          ...n,
          color: connectedNodeIds.includes(n.id)
            ? {
                background: '#60a5fa',
                border: '#1e40af',
                highlight: { background: '#60a5fa', border: '#1e40af' }
              }
            : {
                background: '#9ca3af',
                border: '#6b7280',
                highlight: { background: '#60a5fa', border: '#1e40af' }
              }
        }));
        data.nodes = updatedNodes;
        networkInstance.current?.setData(data);
      } else {
        // Reset all nodes
        const resetNodes = nodesArray.map((n: any) => ({
          ...n,
          color: {
            background: '#3b82f6',
            border: '#1e40af',
            highlight: { background: '#60a5fa', border: '#1e40af' }
          }
        }));
        data.nodes = resetNodes;
        networkInstance.current?.setData(data);
        setSelectedNode(null);
      }
    };

    networkInstance.current.on('click', handleNodeClick);

    return () => {
      if (networkInstance.current) {
        networkInstance.current.off('click', handleNodeClick);
      }
    };
  }, [graph, onNodeClick]);

  return (
    <div style={{ display: 'flex', height: '600px', gap: '16px', background: 'rgba(30, 41, 59, 0.8)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(71, 85, 105, 0.5)' }}>
      {/* Graph Container */}
      <div
        ref={networkRef}
        style={{
          flex: 1,
          borderRadius: '8px',
          background: '#0f172a',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          position: 'relative'
        }}
      />

      {/* Side Panel with Node Info */}
      <div style={{
        width: '300px',
        overflowY: 'auto',
        borderRadius: '8px',
        background: 'rgba(15, 23, 42, 0.5)',
        padding: '16px',
        border: '1px solid rgba(71, 85, 105, 0.3)'
      }}>
        {selectedNode ? (
          <>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'white', marginBottom: '12px', wordBreak: 'break-word' }}>
              {selectedNode.label}
            </h3>

            {selectedNode.cluster_id && (
              <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>Cluster</div>
                <div style={{ fontSize: '14px', color: '#93c5fd', fontWeight: '600' }}>
                  {selectedNode.cluster_id}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Connections</div>
              <div style={{ fontSize: '20px', color: '#86efac', fontWeight: '700' }}>
                {selectedNode.degree}
              </div>
            </div>

            {selectedNode.connections.length > 0 && (
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>Connected Keywords</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '300px', overflowY: 'auto' }}>
                  {selectedNode.connections.slice(0, 20).map((conn, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px',
                        background: 'rgba(59, 130, 246, 0.2)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#93c5fd',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        wordBreak: 'break-word'
                      }}
                    >
                      {conn}
                    </div>
                  ))}
                  {selectedNode.connections.length > 20 && (
                    <div style={{ padding: '8px', fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                      +{selectedNode.connections.length - 20} more connections
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ color: '#94a3b8', textAlign: 'center', paddingTop: '40px' }}>
            <div style={{ fontSize: '13px' }}>Click on a node to view details</div>
          </div>
        )}
      </div>
    </div>
  );
}
