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
}

export function DataVisualization() {
  const [stats, setStats] = useState<PaperStats | null>(null);
  const [topKeywords, setTopKeywords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${api}/api/dashboard`)
      .then(r => r.json())
      .then(data => {
        console.log('Dashboard data:', data);
        setStats(data.statistics || null);
        setTopKeywords(data.top_keywords || []);
      })
      .catch(e => {
        console.error('Failed to fetch stats:', e);
        setStats(null);
        setTopKeywords([]);
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
      <div style={{ padding: 24, background: '#f8fafc', minHeight: '100vh', textAlign: 'center', color: '#6b7280' }}>
        Loading visualizations...
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 600 }}>Data Visualization</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Interactive charts and visual insights</p>
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Pie Chart - Keyword Distribution */}
          <div
            id="chart-pie"
            style={{
              background: 'white',
              padding: 24,
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Keyword Distribution</h2>
              <div style={{ width: 20, height: 20, opacity: 0.5 }}>⊙</div>
            </div>
            <PieChart data={chartData?.pieData || []} />
          </div>

          {/* Line Chart - Trend Over Time */}
          <div
            id="chart-line"
            style={{
              background: 'white',
              padding: 24,
              borderRadius: 12,
              border: '1px solid #e5e7eb'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Trend Over Time</h2>
              <div style={{ width: 20, height: 20, opacity: 0.5 }}>⛶</div>
            </div>
            <LineChart data={chartData?.yearData || []} />
          </div>

          {/* Bar Chart - Category Comparison */}
          <div
            id="chart-bar"
            style={{
              background: 'white',
              padding: 24,
              borderRadius: 12,
              border: '1px solid #e5e7eb'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Category Comparison</h2>
              <div style={{ width: 20, height: 20, opacity: 0.5 }}>⊟</div>
            </div>
            <BarChart data={chartData?.categories || []} />
          </div>

          {/* Horizontal Bar Chart - Monthly Activity */}
          <div
            id="chart-authors"
            style={{
              background: 'white',
              padding: 24,
              borderRadius: 12,
              border: '1px solid #e5e7eb'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Authors Per Year</h2>
              <div style={{ width: 20, height: 20, opacity: 0.5 }}>⊟</div>
            </div>
            <AuthorsPerYearChart data={chartData?.monthlyData || []} />
          </div>
        </div>

        {/* Export Section */}
        <div style={{
          background: 'white',
          padding: 24,
          borderRadius: 12,
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600 }}>Export Visualizations</h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>Download charts in various formats</p>
            </div>
            <button
              onClick={() => setShowExportModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                borderRadius: 8,
                background: '#0ea5e9',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0284c7')}
              onMouseLeave={e => (e.currentTarget.style.background = '#0ea5e9')}
            >
              <span>↓</span>
              Export Chart
            </button>
          </div>
        </div>

        {/* Export Modal */}
        {showExportModal && (
          <ExportModal
            onClose={() => setShowExportModal(false)}
            charts={[
              { id: 'pie', name: 'Keyword Distribution' },
              { id: 'line', name: 'Trend Over Time' },
              { id: 'bar', name: 'Category Comparison' },
              { id: 'authors', name: 'Authors Per Year' }
            ]}
          />
        )}

        {/* Statistics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 }}>
          <StatBox label="Total Papers" value={stats?.total_papers ?? 0} />
          <StatBox label="Total Authors" value={stats?.total_authors ?? 0} />
          <StatBox label="Total Keywords" value={stats?.total_keywords ?? 0} />
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

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      background: 'white',
      padding: 16,
      borderRadius: 12,
      border: '1px solid #e5e7eb',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{value}</div>
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
