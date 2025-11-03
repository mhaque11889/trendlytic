import { useEffect, useState } from 'react';
import { fetchConferences, type Conference } from '../api/client';

export function ConferencesList() {
  const [items, setItems] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConferences()
      .then(setItems)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading conferences…</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div>
      <h2>Conferences</h2>
      {items.length === 0 ? (
        <p>No conferences yet.</p>
      ) : (
        <table cellPadding={8} style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th align="left">Year</th>
              <th align="left">Name</th>
              <th align="left">Acronym</th>
              <th align="left">Location</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c._id}>
                <td>{c.year}</td>
                <td>{c.name}</td>
                <td>{c.acronym ?? '-'}</td>
                <td>{c.location ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}


