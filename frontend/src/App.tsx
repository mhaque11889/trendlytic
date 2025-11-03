import { useEffect, useState } from 'react';
import { ConferencesList } from './components/ConferencesList';
import { Dashboard } from './components/Dashboard';

export function App() {
  const [apiStatus, setApiStatus] = useState<string>('checking...');
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const url = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
    fetch(`${url}/health`).then(async (r) => {
      const json = await r.json();
      setApiStatus(json.ok ? 'online' : 'offline');
    }).catch(() => setApiStatus('offline'));
  }, []);

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  if (token) {
    return <Dashboard onLogout={() => { localStorage.removeItem('authToken'); location.reload(); }} />;
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#3b82f6,#06b6d4)' }} />
          <strong style={{ fontSize: 18 }}>Trendlytic</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 12, color: apiStatus === 'online' ? '#10b981' : '#ef4444' }}>API: {apiStatus}</span>
          <button onClick={() => setShowLogin(true)} style={{ padding: '8px 14px', borderRadius: 8, background: '#111827', color: 'white', border: 'none' }}>
            Login
          </button>
        </div>
      </header>
      <main style={{ flex: 1 }}>
        <section style={{ padding: '56px 24px', background: 'linear-gradient(180deg,#f8fafc,#ffffff)' }}>
          <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
            <div>
              <h1 style={{ fontSize: 36, margin: 0 }}>Manage, Analyze, and Visualize Conference Papers</h1>
              <p style={{ color: '#4b5563', marginTop: 12 }}>Keyword trends, authors, conferences, and more — all in one place.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
              <div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Papers</div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>—</div>
              </div>
              <div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Authors</div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>—</div>
              </div>
              <div style={{ padding: 16, border: '1px solid #e5e7eb', borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Keywords</div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>—</div>
              </div>
            </div>
          </div>
        </section>
        <section style={{ padding: '24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <ConferencesList />
          </div>
        </section>
      </main>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}

function LoginModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('admin@trendlytic.local');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const api = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${api}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = json?.message || `Login failed (${res.status})`;
        throw new Error(msg);
      }
      localStorage.setItem('authToken', json.token);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'white', padding: 24, borderRadius: 12, width: 360, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0 }}>Login</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          <label>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Email</div>
            <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e5e7eb' }} />
          </label>
          <label>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Password</div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e5e7eb' }} />
          </label>
          {error && <div style={{ color: '#ef4444', fontSize: 12 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white' }}>Cancel</button>
            <button onClick={submit} disabled={loading} style={{ padding: '8px 12px', borderRadius: 8, background: '#111827', color: 'white', border: 'none' }}>{loading ? 'Signing in…' : 'Sign in'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}


