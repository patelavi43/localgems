import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { bookingAPI } from '../../services/api';
import { BookingStatusBadge, PaymentStatusBadge } from '../../components/booking/BookingStatusBadge';

export default function TalentBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = filter ? { status: filter } : {};
      const { data } = await bookingAPI.getMyBookings(params);
      setBookings(data.data);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [filter]);

  const handleStatusUpdate = async (id, status) => {
    setUpdating(id);
    try {
      await bookingAPI.updateStatus(id, { status });
      toast.success(`Booking ${status.toLowerCase()}!`);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setUpdating(null); }
  };

  return (
    <div className="page-container max-w-4xl">
      <h1 className="section-title mb-8">Booking Requests</h1>

      <div className="flex gap-1 bg-gem-900/40 p-1 rounded-xl mb-6 overflow-x-auto">
        {['', 'Pending', 'Confirmed', 'Completed', 'Canceled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${filter === s ? 'bg-gem-700 text-white' : 'text-gem-400 hover:text-gem-200'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="card h-32 animate-pulse" />)}</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gem-300 text-xl font-display">No bookings {filter ? `with status "${filter}"` : 'yet'}</p>
          <p className="text-gem-500 mt-2">Complete your profile to start getting discovered</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => {
            const client = booking.user_id;
            const isUpdating = updating === booking._id;

            return (
              <div key={booking._id} className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <img
                    src={client?.profile_pic || `https://api.dicebear.com/7.x/personas/svg?seed=${client?.name}`}
                    alt={client?.name}
                    className="w-12 h-12 rounded-xl object-cover border border-gem-700/50 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-white">{client?.name}</p>
                        <p className="text-gem-400 text-xs">{client?.email}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <BookingStatusBadge status={booking.status} />
                        <PaymentStatusBadge status={booking.paymentStatus} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-3">
                      <div>
                        <p className="text-gem-500 text-xs">Event Date</p>
                        <p className="text-gem-200">{booking.event_date ? format(new Date(booking.event_date), 'MMM d, yyyy') : '—'}</p>
                      </div>
                      <div>
                        <p className="text-gem-500 text-xs">Time</p>
                        <p className="text-gem-200">{booking.startTime}{booking.endTime ? ` – ${booking.endTime}` : ''}</p>
                      </div>
                      <div>
                        <p className="text-gem-500 text-xs">Event Type</p>
                        <p className="text-gem-200">{booking.eventType || '—'}</p>
                      </div>
                      <div>
                        <p className="text-gem-500 text-xs">Price</p>
                        <p className="text-gem-200 font-semibold">₹{(booking.agreedPrice || 0).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    {booking.venue?.name && (
                      <p className="text-gem-500 text-xs mb-2">📍 {booking.venue.name}{booking.venue.city ? `, ${booking.venue.city}` : ''}</p>
                    )}
                    {booking.notes && (
                      <p className="text-gem-500 text-xs italic">"{booking.notes}"</p>
                    )}
                  </div>
                </div>

                {/* Action buttons based on status */}
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gem-800/40">
                  {booking.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'Confirmed')}
                        disabled={isUpdating}
                        className="btn-primary text-xs disabled:opacity-60"
                      >
                        ✓ Accept
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'Canceled')}
                        disabled={isUpdating}
                        className="text-red-400 hover:text-red-300 text-xs px-3 py-2 rounded-lg hover:bg-red-900/20 transition-colors disabled:opacity-60"
                      >
                        ✕ Decline
                      </button>
                    </>
                  )}
                  {booking.status === 'Confirmed' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'Completed')}
                        disabled={isUpdating}
                        className="btn-primary text-xs disabled:opacity-60"
                      >
                        ✓ Mark Completed
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'Canceled')}
                        disabled={isUpdating}
                        className="text-red-400 hover:text-red-300 text-xs px-3 py-2 rounded-lg hover:bg-red-900/20 transition-colors disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {isUpdating && <span className="text-gem-500 text-xs py-2 animate-pulse">Updating...</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
