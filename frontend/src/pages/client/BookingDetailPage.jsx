// BookingDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { bookingAPI } from '../../services/api';
import { BookingStatusBadge, PaymentStatusBadge } from '../../components/booking/BookingStatusBadge';

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingAPI.getById(id)
      .then(({ data }) => setBooking(data.data))
      .catch(() => { toast.error('Booking not found'); navigate('/bookings'); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-container flex justify-center py-20"><div className="w-12 h-12 rounded-full border-t-2 border-gem-400 animate-spin" /></div>;
  if (!booking) return null;

  const talent = booking.talent_id;
  const talentUser = talent?.user_id;
  const client = booking.user_id;

  return (
    <div className="page-container max-w-2xl">
      <button onClick={() => navigate(-1)} className="btn-ghost text-sm mb-6">← Back</button>
      <div className="card p-6 space-y-5">
        <div className="flex items-start justify-between">
          <h1 className="section-title text-2xl">Booking Details</h1>
          <div className="flex gap-2">
            <BookingStatusBadge status={booking.status} />
            <PaymentStatusBadge status={booking.paymentStatus} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            ['Client', client?.name],
            ['Talent', talentUser?.name],
            ['Event Date', booking.event_date ? format(new Date(booking.event_date), 'MMMM d, yyyy') : 'N/A'],
            ['Time', `${booking.startTime}${booking.endTime ? ` – ${booking.endTime}` : ''}`],
            ['Event Type', booking.eventType || 'Not specified'],
            ['Venue', booking.venue?.name ? `${booking.venue.name}, ${booking.venue.city}` : 'Not specified'],
            ['Agreed Price', `₹${(booking.agreedPrice * 83).toLocaleString('en-IN')}`],
            ['Created', format(new Date(booking.created_at), 'MMM d, yyyy')],
          ].map(([label, value]) => (
            <div key={label} className="bg-gem-900/30 rounded-lg p-3">
              <p className="text-gem-500 text-xs mb-0.5">{label}</p>
              <p className="text-white text-sm">{value || '—'}</p>
            </div>
          ))}
        </div>

        {booking.notes && (
          <div className="bg-gem-900/30 rounded-lg p-3">
            <p className="text-gem-500 text-xs mb-1">Notes</p>
            <p className="text-gem-300 text-sm italic">"{booking.notes}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
