import React, { useEffect, useState } from 'react';

function fetchAllowedDomains(token) {
  return fetch('/api/admin/allowed-domains', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
}

function addAllowedDomain(domain, token) {
  return fetch('/api/admin/allowed-domains', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ domain })
  }).then(r => r.json());
}

function deleteAllowedDomain(id, token) {
  return fetch(`/api/admin/allowed-domains/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
}

export default function AdminAllowedDomains({ token }) {
  const [domains, setDomains] = useState([]);
  const [newDomain, setNewDomain] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAllowedDomains(token);
      setDomains(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Failed to load domains');
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    if (!newDomain.trim()) return;
    const res = await addAllowedDomain(newDomain.trim(), token);
    if (res.msg && res.msg.toLowerCase().includes('already')) {
      setError('Domain already exists');
    } else if (res.domain) {
      setNewDomain('');
      load();
    } else {
      setError(res.msg || 'Failed to add domain');
    }
  };

  const handleDelete = async (id) => {
    setError('');
    await deleteAllowedDomain(id, token);
    load();
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Allowed Domains Admin</h2>
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          value={newDomain}
          onChange={e => setNewDomain(e.target.value)}
          placeholder="Add domain (e.g. example.com)"
          style={{ flex: 1 }}
        />
        <button type="submit">Add</button>
      </form>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {loading ? <div>Loading...</div> : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {domains.map(d => (
            <li key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span>{d.domain}</span>
              <button onClick={() => handleDelete(d.id)} style={{ color: 'red' }}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
