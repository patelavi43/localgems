import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const { data } = await adminAPI.getUsers(params);
      setUsers(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await adminAPI.toggleUser(id);
      toast.success(data.message);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: !u.isActive } : u));
    } catch { toast.error('Update failed'); }
  };

  const ROLE_COLORS = {
    Admin: 'bg-red-900/40 text-red-300 border-red-700/50',
    Client: 'bg-blue-900/40 text-blue-300 border-blue-700/50',
    TalentProvider: 'bg-gem-900/40 text-gem-300 border-gem-700/50',
  };

  return (
    <div className="page-container">
      <h1 className="section-title mb-8">User Management</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field text-sm flex-1"
          />
          <button type="submit" className="btn-primary text-sm px-4">Search</button>
        </form>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} className="input-field text-sm w-auto">
          <option value="">All Roles</option>
          <option value="Client">Client</option>
          <option value="TalentProvider">TalentProvider</option>
          <option value="Admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="card h-16 animate-pulse" />)}</div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gem-800/40">
                    <th className="text-left px-5 py-3 text-gem-400 font-medium">User</th>
                    <th className="text-left px-5 py-3 text-gem-400 font-medium">Role</th>
                    <th className="text-left px-5 py-3 text-gem-400 font-medium hidden sm:table-cell">Location</th>
                    <th className="text-left px-5 py-3 text-gem-400 font-medium hidden md:table-cell">Joined</th>
                    <th className="text-left px-5 py-3 text-gem-400 font-medium">Status</th>
                    <th className="text-right px-5 py-3 text-gem-400 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gem-800/40">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-gem-900/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gem-gradient flex items-center justify-center text-xs font-bold text-white flex-shrink-0 overflow-hidden">
                            {u.profile_pic ? <img src={u.profile_pic} alt={u.name} className="w-full h-full object-cover" /> : u.name?.[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-medium truncate">{u.name}</p>
                            <p className="text-gem-500 text-xs truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`badge border text-xs ${ROLE_COLORS[u.role] || 'badge-purple'}`}>{u.role}</span>
                      </td>
                      <td className="px-5 py-3 text-gem-400 hidden sm:table-cell">
                        {u.location?.city || '—'}
                      </td>
                      <td className="px-5 py-3 text-gem-500 text-xs hidden md:table-cell">
                        {u.created_at ? format(new Date(u.created_at), 'MMM d, yyyy') : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`badge border text-xs ${u.isActive ? 'bg-emerald-900/30 text-emerald-400 border-emerald-700/40' : 'bg-red-900/30 text-red-400 border-red-700/40'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleToggle(u._id)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${u.isActive ? 'border-red-700/50 text-red-400 hover:bg-red-900/20' : 'border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/20'}`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-sm disabled:opacity-40">← Prev</button>
              <span className="text-gem-400 text-sm">Page {page} of {pagination.pages}</span>
              <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
