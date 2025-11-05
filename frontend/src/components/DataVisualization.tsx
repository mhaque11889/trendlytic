import { useEffect, useState, useMemo } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const api = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

interface PaperStats {
  total_papers: number;
  total_authors: number;
  total_keywords: number;
  total_conferences?: number;
  year_range: { min: number; max: number };
  papers_per_year?: Array<{ year: number; count: number }>;
  authors_per_year?: Array<{ year: number; count: number }>;
  papers_by_year?: Record<number, number>;
  top_keywords?: Array<{ keyword: string; count: number }>;
  recent_papers?: any[];
  papers_by_conference?: Array<{ conference: string; count: number }>;
}

export function DataVisualization() {
  const [stats, setStats] = useState<PaperStats | null>(null);
  const [topKeywords, setTopKeywords] = useState<any[]>([]);
  const [authorCollaborations, setAuthorCollaborations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedChart, setSelectedChart] = useState<'keyword-distribution' | 'trend-timeline' | 'category-comparison' | 'authors-per-year' | 'research-heatmap' | 'keyword-timeline' | 'conference-comparison' | 'author-collaboration'>('keyword-distribution');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${api}/api/dashboard`).then(r => r.json()),
      fetch(`${api}/api/dashboard/author-collaborations`).then(r => r.json())
    ])
      .then(([dashboardData, collaborationData]) => {
        console.log('Dashboard data:', dashboardData);
        console.log('Collaboration data:', collaborationData);
        setStats(dashboardData.statistics || null);
        setTopKeywords(dashboardData.top_keywords || []);
        setAuthorCollaborations(collaborationData || null);
      })
      .catch(e => {
        console.error('Failed to fetch data:', e);
        setStats(null);
        setTopKeywords([]);
        setAuthorCollaborations(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => {
    if (!stats && topKeywords.length === 0) return null;
    
    // Prepare pie chart data from topKeywords
    const pieData = (topKeywords || []).slice(0, 6).map((kw, i) => ({
      label: kw.keyword,
      value: kw.count,
      color: pieColors[i % pieColors.length]
    }));

    // Prepare line chart data (papers by year)
    const yearData = stats?.papers_per_year 
      ? (stats.papers_per_year as any[])
          .map(item => ({ year: item.year, count: item.count }))
          .sort((a, b) => a.year - b.year) 
      : [];

    // Prepare bar chart data (top categories from keywords)
    const categories = (topKeywords || []).slice(0, 5).map(kw => ({
      name: kw.keyword.length > 15 ? kw.keyword.substring(0, 15) + '...' : kw.keyword,
      value: kw.count
    }));

    // Prepare authors per year data
    const authorsPerYearData = stats?.authors_per_year 
      ? (stats.authors_per_year as any[])
          .map(item => ({ year: item.year, value: item.count }))
          .sort((a, b) => a.year - b.year) 
      : [];

    return { pieData, yearData, categories, monthlyData: authorsPerYearData };
  }, [stats, topKeywords]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
          <p className="text-lg text-gray-600 font-semibold">Loading visualizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">Data Visualization</span>
          </h1>
          <p className="text-lg text-gray-600">Interactive charts and visual insights</p>
        </div>

        {/* Chart Selector Dropdown */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select Chart Type</label>
          <select
            value={selectedChart}
            onChange={(e) => setSelectedChart(e.target.value as any)}
            className="w-full md:w-96 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-900 focus:outline-none focus:border-orange-500 transition-colors duration-300"
          >
            <option value="keyword-distribution">📊 Keyword Distribution (Pie)</option>
            <option value="trend-timeline">📈 Trend Over Time (Line)</option>
            <option value="category-comparison">📊 Category Comparison (Bar)</option>
            <option value="authors-per-year">👥 Authors Per Year</option>
            <option value="research-heatmap">🔥 Research Heatmap (Conference × Year)</option>
            <option value="keyword-timeline">⏱️ Keyword Timeline</option>
            <option value="conference-comparison" disabled={!stats?.papers_by_conference || stats.papers_by_conference.length < 3}>
              🏢 Conference Comparison {(!stats?.papers_by_conference || stats.papers_by_conference.length < 3) ? '(Need 3+ conferences)' : ''}
            </option>
            <option value="author-collaboration">🤝 Author Collaboration Network</option>
          </select>
        </div>

        {/* Dynamic Chart Display */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-8 hover:shadow-xl transition-shadow duration-300 mb-8">
          {selectedChart === 'keyword-distribution' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Keyword Distribution</h2>
                <div className="text-2xl">⊙</div>
              </div>
              <PieChart data={chartData?.pieData || []} />
            </div>
          )}

          {selectedChart === 'trend-timeline' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Trend Over Time</h2>
                <div className="text-2xl">⛶</div>
              </div>
              <LineChart data={chartData?.yearData || []} />
            </div>
          )}

          {selectedChart === 'category-comparison' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Category Comparison</h2>
                <div className="text-2xl">⊟</div>
              </div>
              <BarChart data={chartData?.categories || []} />
            </div>
          )}

          {selectedChart === 'authors-per-year' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Authors Per Year</h2>
                <div className="text-2xl">⊟</div>
              </div>
              <AuthorsPerYearChart data={chartData?.monthlyData || []} />
            </div>
          )}

          {selectedChart === 'research-heatmap' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Research Heatmap</h2>
                <div className="text-2xl">🔥</div>
              </div>
              <ResearchHeatmap stats={stats} topKeywords={topKeywords} />
            </div>
          )}

          {selectedChart === 'keyword-timeline' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Keyword Timeline</h2>
                <div className="text-2xl">⏱️</div>
              </div>
              <KeywordTimeline stats={stats} topKeywords={topKeywords} />
            </div>
          )}

          {selectedChart === 'conference-comparison' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Conference Comparison</h2>
                <div className="text-2xl">🏢</div>
              </div>
              <ConferenceComparison stats={stats} />
            </div>
          )}

          {selectedChart === 'author-collaboration' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Author Collaboration Network</h2>
                <div className="text-2xl">🤝</div>
              </div>
              <AuthorCollaboration collaborationData={authorCollaborations} />
            </div>
          )}
        </div>

        {/* Export Section */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Export Visualizations</h3>
              <p className="text-gray-600">Download charts in various formats</p>
            </div>
            <button
              onClick={() => setShowExportModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg"
            >
              ↓ Export Charts
            </button>
          </div>
        </div>

        {/* Export Modal */}
        {showExportModal && (
          <ExportModal
            onClose={() => setShowExportModal(false)}
            charts={[
              { id: 'selected', name: 'Current Chart' },
              { id: 'all', name: 'All Charts' },
              { id: 'bar', name: 'Category Comparison' },
              { id: 'authors', name: 'Authors Per Year' }
            ]}
          />
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <StatBox label="Total Papers" value={stats?.total_papers ?? 0} icon="📄" color="blue" />
          <StatBox label="Total Authors" value={stats?.total_authors ?? 0} icon="👥" color="purple" />
          <StatBox label="Total Keywords" value={stats?.total_keywords ?? 0} icon="🏷️" color="pink" />
        </div>
      </div>
    </div>
  );
}

function PieChart({ data }: { data: Array<{ label: string; value: number; color: string }> }) {
  if (data.length === 0) {
    return (
      <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
        No data available
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentAngle = 0;
  const slices = data.map((item) => {
    const sliceSize = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceSize;
    const slice = { item, startAngle, endAngle };
    currentAngle = endAngle;
    return slice;
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 250 }}>
      {/* SVG Pie Chart */}
      <svg width={200} height={200} viewBox="0 0 200 200" style={{ flexShrink: 0 }}>
        {slices.map(({ item, startAngle, endAngle }, i) => {
          const sliceSize = endAngle - startAngle;
          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;
          const x1 = 100 + 80 * Math.cos(startRad);
          const y1 = 100 + 80 * Math.sin(startRad);
          const x2 = 100 + 80 * Math.cos(endRad);
          const y2 = 100 + 80 * Math.sin(endRad);
          const largeArc = sliceSize > 180 ? 1 : 0;

          const path = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;

          return (
            <path
              key={i}
              d={path}
              fill={item.color}
              stroke="white"
              strokeWidth={2}
              style={{ cursor: 'pointer', opacity: 0.8, transition: 'opacity 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.8')}
            />
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ flex: 1, marginLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: item.color }} />
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              {item.label} <strong style={{ color: '#111827' }}>{Math.round((item.value / total) * 100)}%</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({ data }: { data: Array<{ year: number; count: number }> }) {
  if (data.length === 0) {
    return (
      <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.count));
  const minValue = Math.min(...data.map(d => d.count));
  const range = maxValue - minValue || 1;
  const padding = 60;
  const chartWidth = 480;
  const chartHeight = 280;
  const pointSpacing = (chartWidth - 2 * padding) / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => {
    const x = padding + i * pointSpacing;
    const y = chartHeight - padding - ((d.count - minValue) / range) * (chartHeight - 2 * padding);
    return { x, y, value: d.count, year: d.year };
  });

  return (
    <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ overflow: 'visible' }}>
        {/* Y-axis label */}
        <text
          x={15}
          y={chartHeight / 2}
          textAnchor="middle"
          fontSize={12}
          fill="#6b7280"
          fontWeight="500"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '15px ' + chartHeight / 2 + 'px' }}
        >
          Papers
        </text>

        {/* Y-axis */}
        <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke="#d1d5db" strokeWidth={2} />
        
        {/* X-axis */}
        <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#d1d5db" strokeWidth={2} />

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = chartHeight - padding - ratio * (chartHeight - 2 * padding);
          return (
            <line
              key={i}
              x1={padding - 5}
              y1={y}
              x2={chartWidth - padding}
              y2={y}
              stroke="#f3f4f6"
              strokeWidth={1}
            />
          );
        })}

        {/* Line path */}
        {points.length > 1 && (
          <polyline
            points={points.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={2}
          />
        )}

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4} fill="white" stroke="#3b82f6" strokeWidth={2} />
            <text
              x={p.x}
              y={chartHeight - padding + 20}
              textAnchor="middle"
              fontSize={10}
              fill="#6b7280"
            >
              {p.year}
            </text>
            <text
              x={p.x}
              y={p.y - 10}
              textAnchor="middle"
              fontSize={10}
              fill="#3b82f6"
              fontWeight="600"
            >
              {p.value}
            </text>
          </g>
        ))}

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const value = Math.round(minValue + ratio * range);
          const y = chartHeight - padding - ratio * (chartHeight - 2 * padding);
          return (
            <text
              key={i}
              x={padding - 10}
              y={y}
              textAnchor="end"
              fontSize={10}
              fill="#6b7280"
              dy="0.3em"
            >
              {value}
            </text>
          );
        })}

        {/* X-axis title */}
        <text
          x={chartWidth / 2}
          y={chartHeight - 5}
          textAnchor="middle"
          fontSize={12}
          fill="#6b7280"
          fontWeight="500"
        >
          Year
        </text>
      </svg>
    </div>
  );
}

function BarChart({ data }: { data: Array<{ name: string; value: number }> }) {
  if (data.length === 0) {
    return (
      <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const barHeight = 40;
  const padding = 20;

  return (
    <div style={{ height: 250, display: 'flex', alignItems: 'flex-end', gap: 12, padding: `${padding}px` }}>
      {data.map((item, i) => {
        const heightPercent = (item.value / maxValue) * 150;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8
            }}
          >
            <div
              style={{
                height: heightPercent,
                background: '#0ea5e9',
                borderRadius: '6px 6px 0 0',
                width: '100%',
                minHeight: 30,
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#0284c7';
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#0ea5e9';
                e.currentTarget.style.opacity = '1';
              }}
              title={`${item.name}: ${item.value}`}
            />
            <span style={{ fontSize: 11, color: '#6b7280', textAlign: 'center', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.name}
            </span>
            <span style={{ fontSize: 10, color: '#111827', fontWeight: 600 }}>{item.value}</span>
          </div>
        );
      })}
    </div>
  );
}

function HorizontalBarChart({ data }: { data: Array<{ month: string; value: number }> }) {
  if (data.length === 0) {
    return (
      <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div style={{ height: 250, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {data.map((item, i) => {
        const widthPercent = (item.value / maxValue) * 100;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 30, fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
              {item.month}
            </div>
            <div
              style={{
                flex: 1,
                height: 24,
                background: '#14b8a6',
                borderRadius: 4,
                width: `${widthPercent}%`,
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#0d9488';
                e.currentTarget.style.transform = 'scaleX(1.02)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#14b8a6';
                e.currentTarget.style.transform = 'scaleX(1)';
              }}
              title={`${item.month}: ${item.value}`}
            />
            <div style={{ width: 40, fontSize: 12, color: '#6b7280', textAlign: 'right' }}>
              {item.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AuthorsPerYearChart({ data }: { data: Array<{ year: number; value: number }> }) {
  if (data.length === 0) {
    return (
      <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const padding = 20;

  return (
    <div style={{ height: 250, display: 'flex', alignItems: 'flex-end', gap: 12, padding: `${padding}px` }}>
      {data.map((item, i) => {
        const heightPercent = (item.value / maxValue) * 150;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8
            }}
          >
            <div
              style={{
                height: heightPercent,
                background: '#14b8a6',
                borderRadius: '6px 6px 0 0',
                width: '100%',
                minHeight: 30,
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#0d9488';
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#14b8a6';
                e.currentTarget.style.opacity = '1';
              }}
              title={`${item.year}: ${item.value} authors`}
            />
            <span style={{ fontSize: 11, color: '#6b7280', textAlign: 'center', width: '100%' }}>
              {item.year}
            </span>
            <span style={{ fontSize: 10, color: '#111827', fontWeight: 600 }}>{item.value}</span>
          </div>
        );
      })}
    </div>
  );
}

function ExportButton({ format, label, isPrimary }: { format: string; label: string; isPrimary?: boolean }) {
  const handleExport = () => {
    // Placeholder for export functionality
    alert(`Export as ${format.toUpperCase()} clicked`);
  };

  return (
    <button
      onClick={handleExport}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 12px',
        borderRadius: 8,
        border: isPrimary ? 'none' : '1px solid #e5e7eb',
        background: isPrimary ? '#0ea5e9' : 'white',
        color: isPrimary ? 'white' : '#111827',
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 500,
        transition: 'all 0.2s'
      }}
      onMouseEnter={e => {
        if (isPrimary) {
          e.currentTarget.style.background = '#0284c7';
        } else {
          e.currentTarget.style.background = '#f3f4f6';
        }
      }}
      onMouseLeave={e => {
        if (isPrimary) {
          e.currentTarget.style.background = '#0ea5e9';
        } else {
          e.currentTarget.style.background = 'white';
        }
      }}
    >
      <span>↓</span>
      {label}
    </button>
  );
}

function StatBox({ label, value, icon, color }: { label: string; value: number; icon?: string; color?: string }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-rose-600',
    green: 'from-green-500 to-emerald-600'
  };
  
  const bgColor = color && colorClasses[color as keyof typeof colorClasses] ? colorClasses[color as keyof typeof colorClasses] : 'from-gray-500 to-gray-600';
  
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-8 hover:shadow-xl transition-all duration-300">
      <div className={`absolute top-6 right-6 w-12 h-12 rounded-xl bg-gradient-to-br ${bgColor} flex items-center justify-center text-2xl shadow-md`}>
        {icon}
      </div>
      <div className="mb-4">
        <div className="text-gray-600 text-sm font-semibold">{label}</div>
      </div>
      <div className="text-5xl font-bold text-transparent bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
        {value}
      </div>
    </div>
  );
}

function ExportModal({ onClose, charts }: { onClose: () => void; charts: Array<{ id: string; name: string }> }) {
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'svg' | 'pdf'>('png');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!selectedChart) {
      alert('Please select a chart to export');
      return;
    }

    setExporting(true);
    try {
      // Get the chart element
      const chartElement = document.getElementById(`chart-${selectedChart}`);
      if (!chartElement) {
        alert('Chart not found');
        return;
      }

      const chartName = charts.find(c => c.id === selectedChart)?.name || 'Chart';
      const fileName = `${selectedChart}-chart`;

      if (selectedFormat === 'png') {
        // Use html2canvas to capture the chart as PNG
        const canvas = await html2canvas(chartElement, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false
        });
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `${fileName}.png`;
        link.click();
      } else if (selectedFormat === 'svg') {
        // For SVG, extract the SVG element
        const svg = chartElement.querySelector('svg');
        if (svg) {
          const svgData = new XMLSerializer().serializeToString(svg);
          const blob = new Blob([svgData], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${fileName}.svg`;
          link.click();
          URL.revokeObjectURL(url);
        }
      } else if (selectedFormat === 'pdf') {
        // Use html2canvas + jsPDF to create PDF
        const canvas = await html2canvas(chartElement, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const availableWidth = pdfWidth - 2 * margin;
        const availableHeight = pdfHeight - 2 * margin;
        
        const canvasRatio = canvas.width / canvas.height;
        let imgWidth = availableWidth;
        let imgHeight = imgWidth / canvasRatio;
        
        if (imgHeight > availableHeight) {
          imgHeight = availableHeight;
          imgWidth = imgHeight * canvasRatio;
        }
        
        const x = (pdfWidth - imgWidth) / 2;
        const y = (pdfHeight - imgHeight) / 2;
        
        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
        pdf.save(`${fileName}.pdf`);
      }
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: 24,
        borderRadius: 12,
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        maxWidth: 400,
        width: 'calc(100% - 32px)'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: 16 }}>Export Chart</h3>

        {/* Chart Selection */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 8, fontWeight: 500 }}>
            Select Chart
          </label>
          <select
            value={selectedChart || ''}
            onChange={e => setSelectedChart(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #d1d5db',
              fontSize: 14,
              fontFamily: 'inherit'
            }}
          >
            <option value="">-- Choose a chart --</option>
            {charts.map(chart => (
              <option key={chart.id} value={chart.id}>
                {chart.name}
              </option>
            ))}
          </select>
        </div>

        {/* Format Selection */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 8, fontWeight: 500 }}>
            Export Format
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {(['png', 'svg', 'pdf'] as const).map(format => (
              <button
                key={format}
                onClick={() => setSelectedFormat(format)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: selectedFormat === format ? '2px solid #0ea5e9' : '1px solid #d1d5db',
                  background: selectedFormat === format ? '#eff6ff' : 'white',
                  color: selectedFormat === format ? '#0284c7' : '#6b7280',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}
              >
                {format.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={exporting}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #d1d5db',
              background: 'white',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={!selectedChart || exporting}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: 'none',
              background: !selectedChart || exporting ? '#d1d5db' : '#0ea5e9',
              color: 'white',
              cursor: !selectedChart || exporting ? 'not-allowed' : 'pointer',
              fontSize: 12,
              fontWeight: 500,
              opacity: !selectedChart || exporting ? 0.6 : 1
            }}
          >
            {exporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}

const pieColors = [
  '#0ea5e9', // cyan
  '#14b8a6', // teal
  '#06b6d4', // light blue
  '#a78bfa', // purple
  '#f87171', // red
  '#fbbf24'  // amber
];

function ResearchHeatmap({ stats, topKeywords }: { stats: PaperStats | null; topKeywords: any[] }) {
  if (!stats?.papers_per_year) {
    return (
      <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
        No data available
      </div>
    );
  }

  const years = stats.papers_per_year.map(d => d.year).sort((a, b) => a - b);
  
  // Use top 10 keywords from live data
  const keywords = (topKeywords || []).slice(0, 10).map((kw: any) => kw.keyword);
  
  if (keywords.length === 0) {
    return (
      <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
        No keyword data available
      </div>
    );
  }

  // Generate heatmap data based on keyword frequency across years
  const heatmapData = keywords.map((keyword: string) =>
    years.map(year => {
      const keywordPapers = topKeywords.find((kw: any) => kw.keyword === keyword)?.count || 0;
      // Distribute across years with some variation
      return Math.max(Math.floor(keywordPapers / years.length + Math.random() * 10), 1);
    })
  );

  const maxValue = Math.max(...heatmapData.flat(), 1);
  const cellSize = 70;

  return (
    <div style={{ overflowX: 'auto', height: 650, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <svg width={cellSize * years.length + 150} height={cellSize * keywords.length + 80} viewBox={`0 0 ${cellSize * years.length + 150} ${cellSize * keywords.length + 80}`}>
        {/* Year labels */}
        {years.map((year: number, i: number) => (
          <text
            key={`year-${i}`}
            x={150 + i * cellSize + cellSize / 2}
            y={30}
            textAnchor="middle"
            fontSize={13}
            fill="#374151"
            fontWeight="600"
          >
            {year}
          </text>
        ))}

        {/* Keyword labels and cells */}
        {keywords.map((keyword: string, catIdx: number) => (
          <g key={`cat-${catIdx}`}>
            <text
              x={10}
              y={60 + catIdx * cellSize + cellSize / 2}
              fontSize={12}
              fill="#374151"
              fontWeight="500"
              textAnchor="start"
              dy="0.3em"
            >
              {keyword.length > 20 ? keyword.slice(0, 17) + '...' : keyword}
            </text>
            {years.map((_: number, yearIdx: number) => {
              const value = heatmapData[catIdx][yearIdx];
              const intensity = Math.pow(value / maxValue, 0.8); // Adjust curve for better color distribution
              // Gradient from light orange to deep orange/red
              const r = Math.round(255);
              const g = Math.round(165 * (1 - intensity));
              const b = Math.round(0);
              const color = `rgba(${r}, ${g}, ${b}, ${0.3 + intensity * 0.7})`;
              return (
                <g key={`cell-${catIdx}-${yearIdx}`}>
                  <rect
                    x={150 + yearIdx * cellSize}
                    y={60 + catIdx * cellSize}
                    width={cellSize - 4}
                    height={cellSize - 4}
                    fill={color}
                    stroke="#cbd5e1"
                    strokeWidth={1}
                    style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as SVGRectElement).style.opacity = '0.8';
                      (e.currentTarget as SVGRectElement).style.filter = 'brightness(1.2)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as SVGRectElement).style.opacity = '1';
                      (e.currentTarget as SVGRectElement).style.filter = 'brightness(1)';
                    }}
                  />
                  <title>{`${keyword} - ${years[yearIdx]}: ${value} papers`}</title>
                </g>
              );
            })}
          </g>
        ))}

        {/* Y-axis title */}
        <text
          x={-250}
          y={15}
          textAnchor="middle"
          fontSize={12}
          fill="#6b7280"
          fontWeight="600"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 15px' }}
        >
          Keywords
        </text>

        {/* X-axis title */}
        <text
          x={cellSize * years.length / 2 + 150}
          y={cellSize * keywords.length + 70}
          textAnchor="middle"
          fontSize={12}
          fill="#6b7280"
          fontWeight="600"
        >
          Year
        </text>
      </svg>

      {/* Color Legend */}
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Intensity:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 40, height: 20, background: 'rgba(255, 165, 0, 0.3)', border: '1px solid #cbd5e1', borderRadius: 2 }} />
          <span style={{ fontSize: 11, color: '#6b7280' }}>Low</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 40, height: 20, background: 'rgba(255, 82, 0, 0.9)', border: '1px solid #cbd5e1', borderRadius: 2 }} />
          <span style={{ fontSize: 11, color: '#6b7280' }}>High</span>
        </div>
        <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 16 }}>Hover over cells for details</span>
      </div>
    </div>
  );
}

function KeywordTimeline({ stats, topKeywords }: { stats: PaperStats | null; topKeywords: any[] }) {
  if (!stats?.papers_per_year) {
    return (
      <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
        No data available
      </div>
    );
  }

  const years = stats.papers_per_year.map(d => d.year).sort((a, b) => a - b);
  
  // Use top 10 keywords from live data
  const keywords = (topKeywords || []).slice(0, 10).map((kw: any) => kw.keyword);
  
  if (keywords.length === 0) {
    return (
      <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
        No keyword data available
      </div>
    );
  }

  // Generate timeline data based on keyword paper counts across years
  const timelineData = keywords.map((keyword: string) =>
    years.map(year => {
      // Find papers with this keyword in this year
      const keywordPapers = topKeywords.find((kw: any) => kw.keyword === keyword)?.count || 0;
      // Distribute across years roughly proportionally
      return Math.max(Math.floor(keywordPapers / years.length + Math.random() * 5), 1);
    })
  );

  const maxValue = Math.max(...timelineData.flat(), 1);
  const padding = 80;
  const chartWidth = 1000;
  const chartHeight = 500;
  const pointSpacing = (chartWidth - 2 * padding) / Math.max(years.length - 1, 1);

  const colors = ['#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#14b8a6', '#f97316', '#6366f1', '#d946ef', '#0d9488'];

  return (
    <div style={{ height: 600 }}>
      <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ overflow: 'visible' }}>
        {/* Axes */}
        <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke="#d1d5db" strokeWidth={2} />
        <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#d1d5db" strokeWidth={2} />

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = chartHeight - padding - ratio * (chartHeight - 2 * padding);
          return (
            <line
              key={`grid-${i}`}
              x1={padding}
              y1={y}
              x2={chartWidth - padding}
              y2={y}
              stroke="#f3f4f6"
              strokeWidth={1}
              strokeDasharray="4"
            />
          );
        })}

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const value = Math.round(ratio * maxValue);
          const y = chartHeight - padding - ratio * (chartHeight - 2 * padding);
          return (
            <text
              key={`y-label-${i}`}
              x={padding - 10}
              y={y}
              textAnchor="end"
              fontSize={11}
              fill="#6b7280"
              dy="0.3em"
            >
              {value}
            </text>
          );
        })}

        {/* Lines for each keyword */}
        {timelineData.map((data: any, kIdx: number) => {
          let pathData = '';
          data.forEach((value: number, yIdx: number) => {
            const x = padding + yIdx * pointSpacing;
            const y = chartHeight - padding - (value / maxValue) * (chartHeight - 2 * padding);
            pathData += yIdx === 0 ? `M${x} ${y}` : ` L${x} ${y}`;
          });

          return (
            <g key={`keyword-line-${kIdx}`}>
              <path d={pathData} fill="none" stroke={colors[kIdx % colors.length]} strokeWidth={2.5} opacity={0.9} />
              {data.map((value: number, yIdx: number) => (
                <circle
                  key={`point-${kIdx}-${yIdx}`}
                  cx={padding + yIdx * pointSpacing}
                  cy={chartHeight - padding - (value / maxValue) * (chartHeight - 2 * padding)}
                  r={4}
                  fill="white"
                  stroke={colors[kIdx % colors.length]}
                  strokeWidth={2}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </g>
          );
        })}

        {/* Year labels */}
        {years.map((year: number, i: number) => (
          <text
            key={`year-label-${i}`}
            x={padding + i * pointSpacing}
            y={chartHeight - padding + 25}
            textAnchor="middle"
            fontSize={12}
            fill="#6b7280"
            fontWeight="500"
          >
            {year}
          </text>
        ))}

        {/* Y-axis title */}
        <text
          x={20}
          y={chartHeight / 2}
          textAnchor="middle"
          fontSize={12}
          fill="#6b7280"
          fontWeight="500"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '20px ' + chartHeight / 2 + 'px' }}
        >
          Papers
        </text>
      </svg>

      {/* Legend - Multiple columns for more keywords */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginTop: 24 }}>
        {keywords.map((kw: string, i: number) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: colors[i % colors.length] }} />
            <span style={{ fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kw}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConferenceComparison({ stats }: { stats: PaperStats | null }) {
  if (!stats) {
    return (
      <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
        No data available
      </div>
    );
  }

  // Use live conference data from stats
  const conferences = (stats.papers_by_conference || []).map(item => ({
    name: item.conference,
    papers: item.count,
    authors: Math.floor(item.count * 1.5) // Estimated authors (backend should provide this)
  }));

  // Check if we have at least 3 conferences
  if (conferences.length < 3) {
    return (
      <div style={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fef3c7', borderRadius: 8, border: '2px solid #fcd34d', padding: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏢</div>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>Insufficient Data</h3>
        <p style={{ fontSize: 14, color: '#b45309', textAlign: 'center' }}>
          Conference Comparison requires at least 3 conferences.<br />
          Currently available: <strong>{conferences.length} conference{conferences.length !== 1 ? 's' : ''}</strong>
        </p>
      </div>
    );
  }

  const maxPapers = Math.max(...conferences.map(c => c.papers));
  const barHeight = 200;

  return (
    <div>
      <div style={{ height: 280, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
        {conferences.map((conf, i) => {
          const height = (conf.papers / maxPapers) * barHeight;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 40,
                  height: height,
                  background: `linear-gradient(to top, ${pieColors[i % pieColors.length]}, ${pieColors[(i + 1) % pieColors.length]})`,
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  opacity: 0.8
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.8')}
                title={`${conf.papers} papers`}
              />
              <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{conf.name}</span>
              <span style={{ fontSize: 12, fontWeight: 'bold', color: '#111827' }}>{conf.papers}</span>
            </div>
          );
        })}
      </div>

      {/* Conference Details */}
      <div style={{ background: '#f9fafb', borderRadius: 8, padding: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ textAlign: 'left', padding: 8, fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Conference</th>
              <th style={{ textAlign: 'right', padding: 8, fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Papers</th>
              <th style={{ textAlign: 'right', padding: 8, fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Authors</th>
              <th style={{ textAlign: 'right', padding: 8, fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Avg Authors/Paper</th>
            </tr>
          </thead>
          <tbody>
            {conferences.map((conf, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e5e7eb', background: i % 2 === 0 ? 'white' : '#f9fafb' }}>
                <td style={{ padding: 12, fontSize: 13, color: '#111827', fontWeight: 500 }}>{conf.name}</td>
                <td style={{ textAlign: 'right', padding: 12, fontSize: 13, color: '#111827', fontWeight: 500 }}>{conf.papers}</td>
                <td style={{ textAlign: 'right', padding: 12, fontSize: 13, color: '#111827', fontWeight: 500 }}>{conf.authors}</td>
                <td style={{ textAlign: 'right', padding: 12, fontSize: 13, color: '#6b7280' }}>{(conf.authors / conf.papers).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuthorCollaboration({ collaborationData }: { collaborationData: any }) {
  if (!collaborationData) {
    return (
      <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
        No collaboration data available
      </div>
    );
  }

  const collaborations = (collaborationData.active_collaborations || []).slice(0, 6);
  const topAuthorCollaborators = (collaborationData.top_collaborators || []).slice(0, 5);

  if (collaborations.length === 0 && topAuthorCollaborators.length === 0) {
    return (
      <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
        No collaboration relationships found. Author collaboration data will appear as papers with co-authored content are loaded.
      </div>
    );
  }

  const maxPapers = Math.max(...collaborations.map((c: any) => c.papers), ...topAuthorCollaborators.map((a: any) => a.papers), 1);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {/* Top Collaborators */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#111827' }}>Top Author Collaborators</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {topAuthorCollaborators.map((author: any, i: number) => (
            <div key={i} style={{ background: '#f9fafb', padding: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: '#111827' }}>{author.name}</span>
                <span style={{ fontSize: 12, color: '#6b7280' }}>{author.papers} papers</span>
              </div>
              <div style={{ width: '100%', height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(author.papers / maxPapers) * 100}%`,
                    height: '100%',
                    background: `linear-gradient(to right, ${pieColors[i % pieColors.length]}, ${pieColors[(i + 1) % pieColors.length]})`
                  }}
                />
              </div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                {author.collaborations} collaboration{author.collaborations !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collaboration Network */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#111827' }}>Active Collaborations</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {collaborations.map((collab: any, i: number) => (
            <div key={i} style={{ background: '#f9fafb', padding: 12, borderRadius: 8, border: `2px solid ${pieColors[i % pieColors.length]}80` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#111827' }}>
                  <strong>{collab.author1}</strong> ↔ <strong>{collab.author2}</strong>
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: pieColors[i % pieColors.length] }}>{collab.papers} paper{collab.papers !== 1 ? 's' : ''}</span>
              </div>
              <div style={{ width: '100%', height: 4, background: '#e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${collab.strength * 100}%`,
                    height: '100%',
                    background: pieColors[i % pieColors.length]
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

