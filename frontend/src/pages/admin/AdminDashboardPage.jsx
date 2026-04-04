import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { adminAPI } from '../../services/api';
import StarRating from '../../components/common/StarRating';
import { BookingStatusBadge } from '../../components/booking/BookingStatusBadge';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAnalytics()
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-container flex justify-center py-20">
      <div className="w-12 h-12 rounded-full border-t-2 border-gem-400 animate-spin" />
    </div>
  );

  const { summary, popularCategories, recentBookings, recentReviews, bookingsByStatus, monthlyBookings } = data || {};

  const summaryCards = [
    { label: 'Total Users', value: summary?.totalUsers || 0, icon: '👥', color: 'from-blue-900/50 to-blue-950' },
    { label: 'Talent Providers', value: summary?.totalTalents || 0, icon: '⭐', color: 'from-gem-900/50 to-gem-950' },
    { label: 'Total Bookings', value: summary?.totalBookings || 0, icon: '📅', color: 'from-emerald-900/50 to-emerald-950' },
    { label: 'Revenue Generated', value: `₹${(summary?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: '💰', color: 'from-yellow-900/50 to-yellow-950' },
  ];

  const STATUS_COLORS = { Pending: '#fbbf24', Confirmed: '#60a5fa', Completed: '#34d399', Canceled: '#f87171' };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title">Admin Dashboard</h1>
        <div className="flex gap-3">
          <Link to="/admin/verify-talents" className="btn-primary text-sm">
            ✅ Verify Talents
          </Link>
          <Link to="/admin/users" className="btn-secondary text-sm">Manage Users</Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map(({ label, value, icon, color }) => (
          <div key={label} className={`card p-5 bg-gradient-to-br ${color}`}>
            <div className="text-3xl mb-2">{icon}</div>
            <p className="text-2xl font-display font-bold text-white">{value}</p>
            <p className="text-gem-400 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Popular categories */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">Popular Categories</h3>
          <div className="space-y-3">
            {(popularCategories || []).slice(0, 8).map((cat, i) => {
              const maxCount = popularCategories[0]?.count || 1;
              const pct = Math.round((cat.count / maxCount) * 100);
              return (
                <div key={cat._id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gem-300 text-xs">{cat._id}</span>
                    <span className="text-gem-500 text-xs">{cat.count} talent</span>
                  </div>
                  <div className="h-1.5 bg-gem-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gem-gradient rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bookings by status donut */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">Bookings by Status</h3>
          <div className="space-y-3">
            {(bookingsByStatus || []).map(({ _id: status, count }) => (
              <div key={status} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[status] || '#8b22ae' }} />
                <span className="text-gem-300 text-sm flex-1">{status}</span>
                <span className="text-white font-semibold text-sm">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly bookings bar chart (pure CSS) */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">Monthly Bookings</h3>
          <div className="flex items-end gap-1 h-32">
            {(monthlyBookings || []).slice(-8).map((m, i) => {
              const maxCount = Math.max(...(monthlyBookings || []).map(x => x.count), 1);
              const heightPct = (m.count / maxCount) * 100;
              const monthLabel = `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m._id.month - 1]}`;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-gem-600 text-xs">{m.count}</span>
                  <div className="w-full rounded-t-sm bg-gem-gradient transition-all" style={{ height: `${heightPct}%` }} title={`${monthLabel}: ${m.count}`} />
                  <span className="text-gem-600 text-xs">{monthLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent bookings */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            {(recentBookings || []).map(b => (
              <div key={b._id} className="flex items-center gap-3 py-2 border-b border-gem-800/40 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{b.user_id?.name} → {b.talent_id?.user_id?.name}</p>
                  <p className="text-gem-500 text-xs">{b.event_date ? format(new Date(b.event_date), 'MMM d, yyyy') : ''}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-gem-300 text-xs">₹{(b.agreedPrice || 0).toLocaleString('en-IN')}</span>
                  <BookingStatusBadge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent reviews */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">Recent Reviews</h3>
          <div className="space-y-3">
            {(recentReviews || []).map(r => (
              <div key={r._id} className="py-2 border-b border-gem-800/40 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white text-sm">{r.user_id?.name}</p>
                  <StarRating rating={r.rating} size="sm" />
                </div>
                <p className="text-gem-400 text-xs">for {r.talent_id?.user_id?.name}</p>
                {r.review_text && <p className="text-gem-500 text-xs mt-1 italic line-clamp-1">"{r.review_text}"</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
