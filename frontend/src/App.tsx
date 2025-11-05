import { useEffect, useState } from 'react';
import { ConferencesList } from './components/ConferencesList';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';

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
    <div>
      <LandingPage onLogin={() => setShowLogin(true)} />
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 9999 }}>
      <div style={{ background: 'white', padding: 24, borderRadius: 12, width: 360, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', position: 'relative', zIndex: 10000 }}>
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


