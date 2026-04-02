// TalentDashboardPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { talentAPI, bookingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StarRating from '../../components/common/StarRating';
import { BookingStatusBadge } from '../../components/booking/BookingStatusBadge';

export default function TalentDashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      talentAPI.getMyProfile().catch(() => ({ data: { data: null } })),
      bookingAPI.getMyBookings({ limit: 5 }),
    ]).then(([pRes, bRes]) => {
      setProfile(pRes.data.data);
      setRecentBookings(bRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container flex justify-center py-20"><div className="w-12 h-12 rounded-full border-t-2 border-gem-400 animate-spin" /></div>;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title">Talent Dashboard</h1>
        <Link to="/talent-profile/edit" className="btn-primary text-sm">{profile ? 'Edit Profile' : 'Create Profile'}</Link>
      </div>

      {!profile && (
        <div className="card p-8 text-center mb-6 border-dashed border-gem-700/50">
          <div className="text-5xl mb-4">🌟</div>
          <h3 className="font-display text-xl text-white mb-2">Complete Your Profile</h3>
          <p className="text-gem-400 text-sm mb-5">Create your talent profile to start receiving bookings and getting discovered by clients.</p>
          <Link to="/talent-profile/edit" className="btn-primary">Create Profile</Link>
        </div>
      )}

      {profile && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Avg Rating', value: (profile.rating?.average || 0).toFixed(1), icon: '⭐' },
            { label: 'Total Reviews', value: profile.rating?.count || 0, icon: '💬' },
            { label: 'Total Bookings', value: profile.totalBookings || 0, icon: '📅' },
            { label: 'Hourly Rate', value: `₹${(profile.hourlyRate || 0).toLocaleString('en-IN')}`, icon: '💰' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="card p-5 text-center">
              <div className="text-3xl mb-2">{icon}</div>
              <p className="text-2xl font-display font-bold text-white">{value}</p>
              <p className="text-gem-400 text-xs">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Bookings</h3>
            <Link to="/talent-bookings" className="text-gem-400 hover:text-gem-300 text-xs">View all →</Link>
          </div>
          {recentBookings.length === 0 ? (
            <p className="text-gem-500 text-sm text-center py-6">No bookings yet</p>
          ) : recentBookings.map(b => (
            <div key={b._id} className="flex items-center gap-3 py-3 border-b border-gem-800/40 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{b.user_id?.name}</p>
                <p className="text-gem-400 text-xs">{b.event_date ? format(new Date(b.event_date), 'MMM d') : ''} · {b.eventType || 'Event'}</p>
              </div>
              <BookingStatusBadge status={b.status} />
            </div>
          ))}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Quick Actions</h3>
          </div>
          <div className="space-y-3">
            {[
              { to: '/talent-profile/edit', icon: '✏️', label: 'Edit Profile', desc: 'Update skills, bio and portfolio' },
              { to: '/talent-availability', icon: '📆', label: 'Manage Availability', desc: 'Add or remove time slots' },
              { to: '/talent-bookings', icon: '📋', label: 'View Bookings', desc: 'Accept, reject or complete bookings' },
              { to: '/events', icon: '🎯', label: 'Browse Events', desc: 'Apply to open event requests' },
            ].map(({ to, icon, label, desc }) => (
              <Link key={to} to={to} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gem-800/30 transition-colors group">
                <span className="text-2xl">{icon}</span>
                <div>
                  <p className="text-white text-sm font-medium group-hover:text-gem-200 transition-colors">{label}</p>
                  <p className="text-gem-500 text-xs">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
