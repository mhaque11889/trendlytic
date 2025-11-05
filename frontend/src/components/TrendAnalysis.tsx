import { useEffect, useState, useMemo } from 'react';

const api = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

interface TrendData {
  keyword: string;
  year: number;
  count: number;
  papers: string[];
}

interface TrendAnalysis {
  keyword: string;
  data: TrendData[];
  growth_rate: number;
  yoy_change: number;
  trend_type: 'emerging' | 'stable' | 'declining';
  total_papers: number;
  latest_count: number;
}

interface Insights {
  total_topics: number;
  total_data_points: number;
  emerging_trends: Array<{
    keyword: string;
    growth_rate: number;
    papers: number;
    latest_count: number;
  }>;
  declining_trends: Array<{
    keyword: string;
    growth_rate: number;
    papers: number;
    latest_count: number;
  }>;
  stable_trends: Array<{
    keyword: string;
    growth_rate: number;
    papers: number;
    latest_count: number;
  }>;
}

export function TrendAnalysis() {
  const [trends, setTrends] = useState<TrendAnalysis[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [years, setYears] = useState<{ min_year: number; max_year: number; available_years: number[] } | null>(null);
  const [startYear, setStartYear] = useState<number>(2020);
  const [endYear, setEndYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [showPopulating, setShowPopulating] = useState(false);
  const [populateLoading, setPopulateLoading] = useState(false);

  // Fetch available years
  useEffect(() => {
    fetch(`${api}/api/trends/years/range`)
      .then(r => r.json())
      .then(data => {
        setYears(data);
        setStartYear(data.min_year || 2020);
        setEndYear(data.max_year || new Date().getFullYear());
      })
      .catch(e => console.error('Failed to fetch years:', e));
  }, []);

  // Fetch trends
  useEffect(() => {
    if (!years) return;
    
    setLoading(true);
    fetch(`${api}/api/trends?startYear=${startYear}&endYear=${endYear}`)
      .then(r => r.json())
      .then(data => {
        setTrends(data.trends || []);
        setInsights(data.insights || null);
      })
      .catch(e => {
        console.error('Failed to fetch trends:', e);
        setTrends([]);
        setInsights(null);
      })
      .finally(() => setLoading(false));
  }, [startYear, endYear, years]);

  // Populate trends from papers
  async function handlePopulateTrends() {
    setPopulateLoading(true);
    try {
      const res = await fetch(`${api}/api/trends/populate`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setShowPopulating(false);
        // Refetch trends
        const trendsRes = await fetch(`${api}/api/trends?startYear=${startYear}&endYear=${endYear}`);
        const trendsData = await trendsRes.json();
        setTrends(trendsData.trends || []);
        setInsights(trendsData.insights || null);
      }
    } catch (e) {
      console.error('Failed to populate trends:', e);
    } finally {
      setPopulateLoading(false);
    }
  }

  const chartData = useMemo(() => {
    if (!selectedKeyword || !trends) return null;
    const trend = trends.find(t => t.keyword === selectedKeyword);
    if (!trend) return null;
    return trend;
  }, [selectedKeyword, trends]);

  const topEmergingKeywords = useMemo(
    () => insights?.emerging_trends.slice(0, 5) || [],
    [insights]
  );

  const topDecliningKeywords = useMemo(
    () => insights?.declining_trends.slice(0, 5) || [],
    [insights]
  );

  return (
    <div style={{ padding: 24, background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 600 }}>Trend Analysis</h1>
            <p style={{ color: '#6b7280', margin: 0 }}>Identify patterns and emerging trends in your research</p>
          </div>
          <button
            onClick={() => setShowPopulating(true)}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500
            }}
          >
            + Add Trend Data
          </button>
        </div>

        {/* Populate Modal */}
        {showPopulating && (
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
              maxWidth: 400
            }}>
              <h3 style={{ marginTop: 0 }}>Populate Trend Data</h3>
              <p style={{ color: '#6b7280' }}>
                This will analyze all imported papers and populate keyword trends by year. This may take a moment.
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowPopulating(false)}
                  disabled={populateLoading}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    background: 'white',
                    borderRadius: 8,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePopulateTrends}
                  disabled={populateLoading}
                  style={{
                    padding: '8px 12px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    cursor: populateLoading ? 'not-allowed' : 'pointer',
                    opacity: populateLoading ? 0.6 : 1
                  }}
                >
                  {populateLoading ? 'Populating...' : 'Populate Now'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{
          background: 'white',
          padding: 16,
          borderRadius: 12,
          border: '1px solid #e5e7eb',
          marginBottom: 24,
          display: 'flex',
          gap: 16,
          alignItems: 'flex-end'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
              Start Year
            </label>
            <select
              value={startYear}
              onChange={e => setStartYear(parseInt(e.target.value))}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #d1d5db',
                fontSize: 14,
                fontFamily: 'inherit'
              }}
            >
              {years?.available_years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
              End Year
            </label>
            <select
              value={endYear}
              onChange={e => setEndYear(parseInt(e.target.value))}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #d1d5db',
                fontSize: 14,
                fontFamily: 'inherit'
              }}
            >
              {years?.available_years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            {loading ? 'Loading...' : `${insights?.total_data_points || 0} data points`}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
            Loading trends...
          </div>
        ) : insights && insights.total_topics === 0 ? (
          <div style={{
            background: 'white',
            padding: 40,
            borderRadius: 12,
            border: '1px solid #e5e7eb',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <p>No trend data yet. Import papers and click "Add Trend Data" to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Main Chart Area */}
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{
                background: 'white',
                padding: 24,
                borderRadius: 12,
                border: '1px solid #e5e7eb'
              }}>
                <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 600 }}>Trend Overview</h2>
                
                {chartData ? (
                  <TrendChart trend={chartData} />
                ) : (
                  <div style={{
                    height: 300,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6b7280'
                  }}>
                    Select a keyword to view trend
                  </div>
                )}

                {/* Keyword List for Selection */}
                <div style={{ marginTop: 24 }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                    Select Keyword
                  </label>
                  <select
                    value={selectedKeyword || ''}
                    onChange={e => setSelectedKeyword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #d1d5db',
                      fontSize: 14,
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="">-- Choose a keyword --</option>
                    {trends.map(t => (
                      <option key={t.keyword} value={t.keyword}>
                        {t.keyword} ({t.total_papers} papers, {Math.round(t.growth_rate)}% growth)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Analysis Period Info */}
            <div style={{
              background: 'white',
              padding: 24,
              borderRadius: 12,
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ margin: '0 0 16px' }}>Analysis Period</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Start Date</div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>Jan 1, {startYear}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>End Date</div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>Dec 31, {endYear}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Data Points</div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{insights?.total_data_points || 0}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Topics</div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{insights?.total_topics || 0}</div>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div style={{
              background: '#f0f9ff',
              padding: 24,
              borderRadius: 12,
              border: '1px solid #bfdbfe'
            }}>
              <h3 style={{ margin: '0 0 16px', color: '#1e40af' }}>Insights</h3>
              <ul style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 8, color: '#1e40af' }}>
                <li>Total topics tracked: <strong>{insights?.total_topics || 0}</strong></li>
                <li>Total data points: <strong>{insights?.total_data_points || 0}</strong></li>
                <li>Emerging trends: <strong>{topEmergingKeywords.length}</strong></li>
                <li>Declining trends: <strong>{topDecliningKeywords.length}</strong></li>
                <li>Track trends across {endYear - startYear + 1} year(s)</li>
              </ul>
            </div>

            {/* Emerging Trends */}
            {topEmergingKeywords.length > 0 && (
              <div style={{
                background: 'white',
                padding: 24,
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                borderLeft: '4px solid #10b981'
              }}>
                <h3 style={{ margin: '0 0 16px', color: '#047857' }}>🚀 Emerging Trends</h3>
                <div style={{ display: 'grid', gap: 12 }}>
                  {topEmergingKeywords.map((t, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedKeyword(t.keyword)}
                      style={{
                        padding: 12,
                        background: '#f0fdf4',
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#dcfce7')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#f0fdf4')}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#065f46' }}>{t.keyword}</div>
                          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                            {t.papers} papers
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: '#10b981'
                          }}>
                            +{Math.round(t.growth_rate)}%
                          </div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>growth</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Declining Trends */}
            {topDecliningKeywords.length > 0 && (
              <div style={{
                background: 'white',
                padding: 24,
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                borderLeft: '4px solid #ef4444'
              }}>
                <h3 style={{ margin: '0 0 16px', color: '#7f1d1d' }}>📉 Declining Trends</h3>
                <div style={{ display: 'grid', gap: 12 }}>
                  {topDecliningKeywords.map((t, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedKeyword(t.keyword)}
                      style={{
                        padding: 12,
                        background: '#fef2f2',
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fee2e2')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#fef2f2')}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#7f1d1d' }}>{t.keyword}</div>
                          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                            {t.papers} papers
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            fontSize: 16,
                            fontWeight: 700,
                            color: '#ef4444'
                          }}>
                            {Math.round(t.growth_rate)}%
                          </div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>decline</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Trends Table */}
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{
                background: 'white',
                padding: 24,
                borderRadius: 12,
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ margin: '0 0 16px' }}>All Trend Data ({trends.length})</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    fontSize: 14,
                    borderCollapse: 'collapse'
                  }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ textAlign: 'left', padding: '12px 0', fontWeight: 600, color: '#6b7280' }}>Keyword</th>
                        <th style={{ textAlign: 'right', padding: '12px 0', fontWeight: 600, color: '#6b7280' }}>Papers</th>
                        <th style={{ textAlign: 'right', padding: '12px 0', fontWeight: 600, color: '#6b7280' }}>Growth Rate</th>
                        <th style={{ textAlign: 'right', padding: '12px 0', fontWeight: 600, color: '#6b7280' }}>YoY Change</th>
                        <th style={{ textAlign: 'center', padding: '12px 0', fontWeight: 600, color: '#6b7280' }}>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trends.slice(0, 20).map((t, i) => (
                        <tr
                          key={i}
                          onClick={() => setSelectedKeyword(t.keyword)}
                          style={{
                            borderBottom: '1px solid #f3f4f6',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <td style={{ padding: '12px 0', fontWeight: 500 }}>{t.keyword}</td>
                          <td style={{ textAlign: 'right', padding: '12px 0' }}>{t.total_papers}</td>
                          <td style={{ textAlign: 'right', padding: '12px 0' }}>
                            <span style={{
                              color: t.growth_rate > 0 ? '#10b981' : t.growth_rate < 0 ? '#ef4444' : '#6b7280',
                              fontWeight: 600
                            }}>
                              {t.growth_rate > 0 ? '+' : ''}{Math.round(t.growth_rate)}%
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', padding: '12px 0' }}>
                            <span style={{
                              color: t.yoy_change > 0 ? '#10b981' : t.yoy_change < 0 ? '#ef4444' : '#6b7280'
                            }}>
                              {t.yoy_change > 0 ? '+' : ''}{Math.round(t.yoy_change)}%
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', padding: '12px 0' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 600,
                              background:
                                t.trend_type === 'emerging'
                                  ? '#d1fae5'
                                  : t.trend_type === 'declining'
                                  ? '#fee2e2'
                                  : '#f3f4f6',
                              color:
                                t.trend_type === 'emerging'
                                  ? '#065f46'
                                  : t.trend_type === 'declining'
                                  ? '#7f1d1d'
                                  : '#374151'
                            }}>
                              {t.trend_type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {trends.length > 20 && (
                  <div style={{ marginTop: 12, fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
                    Showing 20 of {trends.length} trends
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Simple chart component to visualize trend data
 */
function TrendChart({ trend }: { trend: TrendAnalysis }) {
  const maxCount = Math.max(...trend.data.map(d => d.count));
  const minYear = Math.min(...trend.data.map(d => d.year));
  const maxYear = Math.max(...trend.data.map(d => d.year));
  const yearSpan = maxYear - minYear || 1;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ margin: '0 0 8px' }}>{trend.keyword}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Total Papers</div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{trend.total_papers}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Growth Rate</div>
            <div style={{
              fontSize: 18,
              fontWeight: 600,
              color: trend.growth_rate > 0 ? '#10b981' : trend.growth_rate < 0 ? '#ef4444' : '#6b7280'
            }}>
              {trend.growth_rate > 0 ? '+' : ''}{Math.round(trend.growth_rate)}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>YoY Change</div>
            <div style={{
              fontSize: 18,
              fontWeight: 600,
              color: trend.yoy_change > 0 ? '#10b981' : trend.yoy_change < 0 ? '#ef4444' : '#6b7280'
            }}>
              {trend.yoy_change > 0 ? '+' : ''}{Math.round(trend.yoy_change)}%
            </div>
          </div>
        </div>
      </div>

      {/* Simple bar chart */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 200 }}>
        {trend.data.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center' }}>
            <div
              style={{
                height: maxCount > 0 ? (d.count / maxCount) * 150 : 0,
                background: 'linear-gradient(180deg, #3b82f6, #60a5fa)',
                borderRadius: '4px 4px 0 0',
                marginBottom: 8,
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              title={`${d.year}: ${d.count} papers`}
              onMouseEnter={e => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.opacity = '1';
              }}
            />
            <div style={{ fontSize: 12, fontWeight: 500 }}>{d.year}</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>{d.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
