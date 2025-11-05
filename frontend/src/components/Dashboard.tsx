/// <reference types="vite/client" />
import { useEffect, useMemo, useState } from 'react';
import { TrendAnalysis } from './TrendAnalysis';
import { DataVisualization } from './DataVisualization';
import { Reports } from './Reports';
import { UserManagement } from './UserManagement';

const api = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [stats, setStats] = useState<any>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTrends, setShowTrends] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [me, setMe] = useState<{ email: string; name?: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [listModal, setListModal] = useState<null | { type: 'papers' | 'authors' | 'keywords' }>(null);

  function refetchStats() {
    fetch(`${api}/api/dashboard`).then(async (r) => setStats(await r.json())).catch(() => setStats(null));
  }

  useEffect(() => {
    refetchStats();
    const token = localStorage.getItem('authToken');
    if (token) {
      fetch(`${api}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(async (r) => (r.ok ? r.json() : null))
        .then((j) => setMe(j))
        .catch(() => setMe(null));
    }
  }, []);

  if (showTrends) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-yellow-400 flex items-center justify-center shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                    <polyline points="16 7 22 7 22 13"></polyline>
                  </svg>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Trendlytic</span>
              </div>
              <div className="flex gap-4 items-center">
                <button onClick={() => setShowTrends(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold transition-all duration-300">
                  ← Back
                </button>
                {me && (
                  <div className="text-right pr-4 border-r border-gray-200">
                    <div className="text-sm font-semibold text-gray-900">{me.name || 'Administrator'}</div>
                    <div className="text-xs text-gray-500">{me.email}</div>
                  </div>
                )}
                <button onClick={onLogout} className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
        <TrendAnalysis />
      </div>
    );
  }

  if (showVisualization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-yellow-400 flex items-center justify-center shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                    <polyline points="16 7 22 7 22 13"></polyline>
                  </svg>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Trendlytic</span>
              </div>
              <div className="flex gap-4 items-center">
                <button onClick={() => setShowVisualization(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold transition-all duration-300">
                  ← Back
                </button>
                {me && (
                  <div className="text-right pr-4 border-r border-gray-200">
                    <div className="text-sm font-semibold text-gray-900">{me.name || 'Administrator'}</div>
                    <div className="text-xs text-gray-500">{me.email}</div>
                  </div>
                )}
                <button onClick={onLogout} className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
        <DataVisualization />
      </div>
    );
  }

  if (showReports) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-yellow-400 flex items-center justify-center shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                    <polyline points="16 7 22 7 22 13"></polyline>
                  </svg>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Trendlytic</span>
              </div>
              <div className="flex gap-4 items-center">
                <button onClick={() => setShowReports(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold transition-all duration-300">
                  ← Back
                </button>
                {me && (
                  <div className="text-right pr-4 border-r border-gray-200">
                    <div className="text-sm font-semibold text-gray-900">{me.name || 'Administrator'}</div>
                    <div className="text-xs text-gray-500">{me.email}</div>
                  </div>
                )}
                <button onClick={onLogout} className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
        <Reports />
      </div>
    );
  }

  if (showUserManagement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-yellow-400 flex items-center justify-center shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                    <polyline points="16 7 22 7 22 13"></polyline>
                  </svg>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Trendlytic</span>
              </div>
              <div className="flex gap-4 items-center">
                <button onClick={() => setShowUserManagement(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold transition-all duration-300">
                  ← Back
                </button>
                {me && (
                  <div className="text-right pr-4 border-r border-gray-200">
                    <div className="text-sm font-semibold text-gray-900">{me.name || 'Administrator'}</div>
                    <div className="text-xs text-gray-500">{me.email}</div>
                  </div>
                )}
                <button onClick={onLogout} className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
        <UserManagement />
      </div>
    );
  }

  if (showReports) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-yellow-400 flex items-center justify-center shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                    <polyline points="16 7 22 7 22 13"></polyline>
                  </svg>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Trendlytic</span>
              </div>
              <div className="flex gap-4 items-center">
                <button onClick={() => setShowReports(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-semibold transition-all duration-300">
                  ← Back
                </button>
                {me && (
                  <div className="text-right pr-4 border-r border-gray-200">
                    <div className="text-sm font-semibold text-gray-900">{me.name || 'Administrator'}</div>
                    <div className="text-xs text-gray-500">{me.email}</div>
                  </div>
                )}
                <button onClick={onLogout} className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
        <Reports />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Modern Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-yellow-400 flex items-center justify-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                  <polyline points="16 7 22 7 22 13"></polyline>
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Trendlytic</span>
            </div>
            <div className="flex gap-4 items-center">
              {me && (
                <div className="text-right pr-4 border-r border-gray-200">
                  <div className="text-sm font-semibold text-gray-900">{me.name || 'Administrator'}</div>
                  <div className="text-xs text-gray-500">{me.email}</div>
                </div>
              )}
              <button onClick={onLogout} className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-pink-600 to-yellow-500 bg-clip-text text-transparent">Welcome to Trendlytic</span>
            </h1>
            <p className="text-lg text-gray-600">Select a module to start analyzing your research data</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <StatCard label="Total Papers" value={stats?.statistics?.total_papers ?? '—'} icon="📄" color="blue" onClickValue={() => setListModal({ type: 'papers' })} />
            <StatCard label="Total Authors" value={stats?.statistics?.total_authors ?? '—'} icon="👥" color="purple" onClickValue={() => setListModal({ type: 'authors' })} />
            <StatCard label="Total Keywords" value={stats?.statistics?.total_keywords ?? '—'} icon="🏷️" color="pink" onClickValue={() => setListModal({ type: 'keywords' })} />
          </div>

          {/* Module Grid */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {moduleCards.map((m) => (
                <ModuleCard
                  key={m.title}
                  title={m.title}
                  subtitle={m.subtitle}
                  color={m.color}
                  icon={m.icon}
                  onPrimary={
                    m.title === 'Data Ingestion'
                      ? () => setShowUpload(true)
                      : m.title === 'Trend Analysis'
                      ? () => setShowTrends(true)
                      : m.title === 'Visualization'
                      ? () => setShowVisualization(true)
                      : m.title === 'Reporting'
                      ? () => setShowReports(true)
                      : m.title === 'User Management'
                      ? () => setShowUserManagement(true)
                      : m.title === 'Settings'
                      ? () => setShowSettings(true)
                      : undefined
                  }
                  primaryText={m.title === 'Data Ingestion' ? 'Upload File' : m.title === 'Settings' ? 'Open Settings' : 'Open Module'}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={(summary: { inserted: number; skipped: number; total: number }) => {
            setShowUpload(false);
            setToast(`Imported ${summary.inserted} of ${summary.total} (${summary.skipped} skipped)`);
            refetchStats();
            setTimeout(() => setToast(null), 4000);
          }}
        />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onCleared={(what: string, cleared: Record<string, number>) => {
            setToast(`Cleared ${what}.${cleared.papers ? ` Papers: ${cleared.papers}.` : ''}${cleared.authors ? ` Authors: ${cleared.authors}.` : ''}${cleared.keywords ? ` Keywords: ${cleared.keywords}.` : ''}`);
            refetchStats();
            setTimeout(() => setToast(null), 4000);
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-4 rounded-xl shadow-2xl font-semibold animate-pulse">
          {toast}
        </div>
      )}

      {listModal && (
        <ListModal type={listModal.type} onClose={() => setListModal(null)} />
      )}
    </div>
  );
}

function ModuleCard({ title, subtitle, color, onPrimary, primaryText, icon }: { title: string; subtitle: string; color: string; onPrimary?: () => void; primaryText?: string; icon?: string }) {
  return (
    <div className="group relative bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-pink-300 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-yellow-50 opacity-0 group-hover:opacity-50 rounded-2xl transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="text-5xl mb-4">{icon}</div>
        <div className="inline-block px-3 py-1 bg-gradient-to-r from-pink-100 to-yellow-100 rounded-full mb-4">
          <span className="text-sm font-semibold bg-gradient-to-r from-pink-600 to-yellow-500 bg-clip-text text-transparent">{title}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">{subtitle}</p>
        <button onClick={onPrimary} className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-yellow-400 hover:from-pink-600 hover:to-yellow-500 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg transform group-hover:scale-105">
          {primaryText ?? 'Open Module'}
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, onClickValue, icon, color }: { label: string; value: any; onClickValue?: () => void; icon?: string; color?: string }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-rose-600',
    green: 'from-green-500 to-emerald-600'
  };
  
  const bgColor = color && colorClasses[color as keyof typeof colorClasses] ? colorClasses[color as keyof typeof colorClasses] : 'from-gray-500 to-gray-600';
  
  return (
    <div className={`relative bg-white rounded-2xl p-8 border-2 border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 ${onClickValue ? 'cursor-pointer hover:border-gray-300' : ''}`} onClick={onClickValue}>
      <div className={`absolute top-6 right-6 w-12 h-12 rounded-xl bg-gradient-to-br ${bgColor} flex items-center justify-center text-2xl shadow-md`}>
        {icon}
      </div>
      <div className="mb-6">
        <div className="text-gray-600 text-sm font-semibold">{label}</div>
      </div>
      <div className={`text-5xl font-bold ${onClickValue ? 'text-transparent bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text' : 'text-gray-900'}`}>
        {value}
      </div>
    </div>
  );
}

const moduleCards = [
  { title: 'Data Ingestion', subtitle: 'Import and process research data', color: 'linear-gradient(135deg,#60a5fa,#93c5fd)', icon: '📁' },
  { title: 'Trend Analysis', subtitle: 'Identify patterns and trends', color: 'linear-gradient(135deg,#34d399,#6ee7b7)', icon: '📈' },
  { title: 'Visualization', subtitle: 'Interactive data visualizations', color: 'linear-gradient(135deg,#fb923c,#fdba74)', icon: '📊' },
  { title: 'Reporting', subtitle: 'Generate comprehensive reports', color: 'linear-gradient(135deg,#a78bfa,#c4b5fd)', icon: '📋' },
  { title: 'User Management', subtitle: 'Manage team and permissions', color: 'linear-gradient(135deg,#f43f5e,#fb7185)', icon: '👥' },
  { title: 'Settings', subtitle: 'Configure system preferences', color: 'linear-gradient(135deg,#64748b,#94a3b8)', icon: '⚙️' },
];

 function UploadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (summary: { inserted: number; skipped: number; total: number }) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState<string>('');

  const required = useMemo(() => ['title','authors','year','keywords','conference'], []);

  async function upload() {
    if (!file) return setError('Please select a CSV/XLSX file');
    setError(null);
    setLoading(true);
    setLoadingLabel('Uploading file…');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${api}/api/import/upload`, { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || `Upload failed (${res.status})`);
      setPreview(json);
      setSummary(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
      setLoadingLabel('');
    }
  }

  async function processImport() {
    if (!file) return setError('Please select a file');
    setError(null);
    setLoading(true);
    setLoadingLabel('Importing file…');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${api}/api/import/process`, { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || `Process failed (${res.status})`);
      setSummary(json);
      onSuccess(json);
      // Close modal handled by parent via onSuccess
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
      setLoadingLabel('');
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 9999 }}>
      <div style={{ position: 'relative', background: 'white', padding: 24, borderRadius: 12, width: 720, maxHeight: '80vh', overflow: 'auto', zIndex: 10000 }}>
        <h3 style={{ marginTop: 0 }}>Upload Papers (CSV/XLSX)</h3>
        <p style={{ color: '#6b7280' }}>Required columns: title, authors, year, keywords, conference</p>
        <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white' }}>Close</button>
          <button onClick={upload} disabled={loading} style={{ padding: '8px 12px', borderRadius: 8, background: '#111827', color: 'white', border: 'none' }}>{loading && loadingLabel.startsWith('Uploading') ? 'Uploading…' : 'Upload & Preview'}</button>
          <button onClick={processImport} disabled={loading || !preview} style={{ padding: '8px 12px', borderRadius: 8, background: '#0ea5e9', color: 'white', border: 'none' }}>{loading && loadingLabel.startsWith('Importing') ? 'Processing…' : 'Process Import'}</button>
        </div>
        {error && <div style={{ color: '#ef4444', marginTop: 8 }}>{error}</div>}
        {preview && <PreviewTable preview={preview} />}
        {summary && (
          <div style={{ marginTop: 12, background: '#f0f9ff', border: '1px solid #bae6fd', padding: 12, borderRadius: 8 }}>
            Imported: {summary.inserted} | Skipped (duplicates): {summary.skipped} | Total Rows: {summary.total}
          </div>
        )}

        {loading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12 }}>
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 14, height: 14, border: '2px solid #0ea5e9', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.9s linear infinite' }} />
              <span style={{ color: '#0f172a', fontWeight: 500 }}>{loadingLabel || 'Working…'}</span>
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewTable({ preview }: { preview: any }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ color: '#6b7280', fontSize: 12 }}>Rows: {preview.totalRows} | Columns: {preview.columns?.join(', ')}</div>
      <div style={{ overflowX: 'auto', marginTop: 8 }}>
        <table cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              {preview.columns?.map((c: string) => (
                <th key={c} align="left" style={{ borderBottom: '1px solid #e5e7eb' }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.previewRows?.map((row: Record<string, any>, i: number) => (
              <tr key={i}>
                {preview.columns?.map((c: string) => (
                  <td key={c} style={{ borderBottom: '1px solid #f3f4f6' }}>{String(row[c] ?? '')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function SettingsModal({ onClose, onCleared }: { onClose: () => void; onCleared: (what: string, cleared: Record<string, number>) => void }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function clearTarget(target: 'papers' | 'authors' | 'keywords' | 'trends' | 'all') {
    const confirmMsg = target === 'all'
      ? 'This will delete ALL papers, authors, keywords, and trends. This action cannot be undone. Continue?'
      : target === 'trends'
      ? 'This will delete all trend data. Continue?'
      : `This will delete all ${target}. This action cannot be undone. Continue?`;
    if (!window.confirm(confirmMsg)) return;
    setError(null);
    setLoading(target);
    try {
      const res = await fetch(`${api}/api/admin/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || `Failed to clear (${res.status})`);
      onCleared(target, json.cleared || {});
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 9999 }}>
      <div style={{ position: 'relative', background: 'white', padding: 24, borderRadius: 12, width: 560, zIndex: 10000 }}>
        <h3 style={{ marginTop: 0 }}>Settings</h3>
        <p style={{ color: '#6b7280', marginTop: 0 }}>Maintenance actions. Use with caution.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 12 }}>
          <button onClick={() => clearTarget('papers')} disabled={!!loading} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white' }}>
            {loading === 'papers' ? 'Clearing Papers…' : 'Clear Papers'}
          </button>
          <button onClick={() => clearTarget('authors')} disabled={!!loading} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white' }}>
            {loading === 'authors' ? 'Clearing Authors…' : 'Clear Authors'}
          </button>
          <button onClick={() => clearTarget('keywords')} disabled={!!loading} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white' }}>
            {loading === 'keywords' ? 'Clearing Keywords…' : 'Clear Keywords'}
          </button>
          <button onClick={() => clearTarget('trends')} disabled={!!loading} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white' }}>
            {loading === 'trends' ? 'Clearing Trends…' : 'Clear Trends'}
          </button>
          <button onClick={() => clearTarget('all')} disabled={!!loading} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', color: '#991b1b', gridColumn: '1 / -1' }}>
            {loading === 'all' ? 'Clearing EVERYTHING…' : 'Clear All (Danger)'}
          </button>
        </div>

        {error && <div style={{ color: '#ef4444', marginTop: 12 }}>{error}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button onClick={onClose} disabled={!!loading} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white' }}>Close</button>
        </div>
      </div>
    </div>
  );
}

function ListModal({ type, onClose }: { type: 'papers' | 'authors' | 'keywords'; onClose: () => void }) {
  const [items, setItems] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 50;
  useEffect(() => {
    setItems(null);
    setError(null);
    fetch(`${api}/api/admin/list?type=${type}&page=${page}&pageSize=${pageSize}`)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j?.message || 'Failed to load');
        setItems(j.items || []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [type, page]);

  const title = type === 'papers' ? 'Papers' : type === 'authors' ? 'Authors' : 'Keywords';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 9999 }}>
      <div style={{ background: 'white', padding: 20, borderRadius: 12, width: 900, maxHeight: '80vh', overflow: 'auto', zIndex: 10000 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white' }}>Close</button>
        </div>
        {error && <div style={{ color: '#ef4444', marginTop: 10 }}>{error}</div>}
        {!items && !error && <div style={{ marginTop: 10, color: '#6b7280' }}>Loading…</div>}

        {items && type === 'papers' && (
          <div style={{ marginTop: 10, overflowX: 'auto' }}>
            <table cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th align="left" style={{ borderBottom: '1px solid #e5e7eb' }}>Title</th>
                  <th align="left" style={{ borderBottom: '1px solid #e5e7eb' }}>Year</th>
                  <th align="left" style={{ borderBottom: '1px solid #e5e7eb' }}>Conference</th>
                  <th align="left" style={{ borderBottom: '1px solid #e5e7eb' }}>Authors</th>
                  <th align="left" style={{ borderBottom: '1px solid #e5e7eb' }}>Keywords</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p._id}>
                    <td style={{ borderBottom: '1px solid #f3f4f6' }}>{p.title}</td>
                    <td style={{ borderBottom: '1px solid #f3f4f6' }}>{p.year}</td>
                    <td style={{ borderBottom: '1px solid #f3f4f6' }}>{p.conference}</td>
                    <td style={{ borderBottom: '1px solid #f3f4f6' }}>{Array.isArray(p.authors) ? p.authors.join('; ') : ''}</td>
                    <td style={{ borderBottom: '1px solid #f3f4f6' }}>{Array.isArray(p.keywords) ? p.keywords.join(', ') : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {items && type === 'authors' && (
          <div style={{ marginTop: 10, overflowX: 'auto' }}>
            <table cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th align="left" style={{ borderBottom: '1px solid #e5e7eb' }}>Name</th>
                  <th align="left" style={{ borderBottom: '1px solid #e5e7eb' }}>External ID</th>
                  <th align="left" style={{ borderBottom: '1px solid #e5e7eb' }}>Papers</th>
                  <th align="left" style={{ borderBottom: '1px solid #e5e7eb' }}>Affiliation</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a._id}>
                    <td style={{ borderBottom: '1px solid #f3f4f6' }}>{a.name || '—'}</td>
                    <td style={{ borderBottom: '1px solid #f3f4f6' }}>{a.external_id || '—'}</td>
                    <td style={{ borderBottom: '1px solid #f3f4f6' }}>{a.papers_count ?? 0}</td>
                    <td style={{ borderBottom: '1px solid #f3f4f6' }}>{a.affiliation || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {items && type === 'keywords' && (
          <div style={{ marginTop: 10, overflowX: 'auto' }}>
            <table cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th align="left" style={{ borderBottom: '1px solid #e5e7eb' }}>Keyword</th>
                  <th align="left" style={{ borderBottom: '1px solid #e5e7eb' }}>Count</th>
                </tr>
              </thead>
              <tbody>
                {items.map((k) => (
                  <tr key={k._id}>
                    <td style={{ borderBottom: '1px solid #f3f4f6' }}>{k.keyword}</td>
                    <td style={{ borderBottom: '1px solid #f3f4f6' }}>{k.count ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white' }}>Prev</button>
          <div style={{ color: '#6b7280' }}>Page {page}</div>
          <button onClick={() => setPage((p) => p + 1)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white' }}>Next</button>
        </div>
      </div>
    </div>
  );
}

