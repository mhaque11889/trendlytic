import { useState, useEffect } from 'react';

const api = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'analyst' | 'reviewer';
  created_at: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: '', name: '', password: '', role: 'analyst' });
  const [firstUserId, setFirstUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${api}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
        if (data.users.length > 0) {
          // First user is the one created first
          setFirstUserId(data.users[0]._id);
        }
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.email) {
      setError('Email is required');
      return;
    }
    if (!editingId && !formData.password) {
      setError('Password is required for new users');
      return;
    }

    const token = localStorage.getItem('authToken');
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${api}/api/admin/users/${editingId}` : `${api}/api/admin/users`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        fetchUsers();
        setShowModal(false);
        setEditingId(null);
        setFormData({ email: '', name: '', password: '', role: 'analyst' });
      } else {
        setError(data.message || 'Operation failed');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Operation failed');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch(`${api}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        fetchUsers();
      } else {
        setError(data.message || 'Failed to delete user');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete user');
    }
  }

  function openAddModal() {
    setEditingId(null);
    setFormData({ email: '', name: '', password: '', role: 'analyst' });
    setShowModal(true);
  }

  function openEditModal(user: User) {
    setEditingId(user._id);
    setFormData({ email: user.email, name: user.name, password: '', role: user.role });
    setShowModal(true);
  }

  const isFirstUser = (userId: string) => userId === firstUserId;

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh', background: '#f8fafc', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>User Management</h1>
          <p style={{ color: '#6b7280', marginTop: 0 }}>Manage team members and their permissions</p>
        </div>

        {/* Add User Button */}
        <button
          onClick={openAddModal}
          style={{
            marginBottom: '24px',
            padding: '10px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          + Add New User
        </button>

        {/* Users Table */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>Loading users...</div>
          ) : users.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>No users found</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#111827', fontSize: '14px' }}>Email</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#111827', fontSize: '14px' }}>Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#111827', fontSize: '14px' }}>Role</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#111827', fontSize: '14px' }}>Created</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600', color: '#111827', fontSize: '14px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={user._id} style={{ borderBottom: idx === users.length - 1 ? 'none' : '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 16px', color: '#111827', fontSize: '14px' }}>
                      {user.email}
                      {isFirstUser(user._id) && (
                        <span style={{ marginLeft: '8px', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                          ADMIN
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#111827', fontSize: '14px' }}>{user.name}</td>
                    <td style={{ padding: '12px 16px', color: '#111827', fontSize: '14px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500',
                        background: user.role === 'admin' ? '#dbeafe' : user.role === 'analyst' ? '#dcfce7' : '#fef3c7',
                        color: user.role === 'admin' ? '#1e40af' : user.role === 'analyst' ? '#166534' : '#92400e'
                      }}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '14px' }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => openEditModal(user)}
                        style={{
                          padding: '6px 12px',
                          background: '#e0e7ff',
                          color: '#3730a3',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                          marginRight: '8px'
                        }}
                      >
                        Edit
                      </button>
                      {!isFirstUser(user._id) && (
                        <button
                          onClick={() => handleDelete(user._id)}
                          style={{
                            padding: '6px 12px',
                            background: '#fee2e2',
                            color: '#991b1b',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500'
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {error && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: '8px',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: '0 0 16px', color: '#111827', fontSize: '20px', fontWeight: '700' }}>
              {editingId ? 'Edit User' : 'Add New User'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '6px' }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!!editingId}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    background: editingId ? '#f9fafb' : 'white',
                    opacity: editingId ? 0.6 : 1
                  }}
                />
              </div>

              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '6px' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '6px' }}>
                  Password {editingId ? '(leave blank to keep current)' : '*'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Role */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#111827', marginBottom: '6px' }}>
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="analyst">Analyst</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 16px',
                    background: '#e5e7eb',
                    color: '#111827',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 16px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px'
                  }}
                >
                  {editingId ? 'Update User' : 'Add User'}
                </button>
              </div>
            </form>

            {error && (
              <div style={{
                marginTop: '16px',
                padding: '10px 12px',
                background: '#fee2e2',
                color: '#991b1b',
                borderRadius: '6px',
                fontSize: '13px',
                border: '1px solid #fecaca'
              }}>
                {error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
