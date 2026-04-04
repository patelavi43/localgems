import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { bookingAPI, reviewAPI } from '../../services/api';
import { BookingStatusBadge, PaymentStatusBadge } from '../../components/booking/BookingStatusBadge';
import StarRating from '../../components/common/StarRating';
import { useLang } from '../../context/LanguageContext';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 0, review_text: '' });
  const { t } = useLang();
  const [submitting, setSubmitting] = useState(false);

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

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await bookingAPI.updateStatus(id, { status: 'Canceled', cancellationReason: 'Canceled by client' });
      toast.success('Booking canceled');
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to cancel'); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (reviewForm.rating === 0) return toast.error('Please select a rating');
    setSubmitting(true);
    try {
      await reviewAPI.create({ booking_id: reviewModal.bookingId, ...reviewForm });
      toast.success('Review submitted!');
      setReviewModal(null);
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit review'); }
    finally { setSubmitting(false); }
  };

  const STATUS_FILTERS = ['', 'Pending', 'Confirmed', 'Completed', 'Canceled'];

  return (
    <div className="page-container max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title">{t.bookings.myBookings}</h1>
        <Link to="/talent" className="btn-primary text-sm">Find Talent</Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 bg-gem-900/40 p-1 rounded-xl mb-6 overflow-x-auto">
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${filter === s ? 'bg-gem-700 text-white' : 'text-gem-400 hover:text-gem-200'}`}
          >
            {s ? s : t.bookings.all}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="card h-28 animate-pulse" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-gem-300 text-xl font-display">{t.bookings.noBookings}</p>
          <p className="text-gem-500 mt-2">{t.bookings.noBookingsHint}</p>
          <Link to="/talent" className="btn-primary mt-6 inline-block">{t.bookings.exploreTalent}</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => {
            const talent = booking.talent_id;
            const talentUser = talent?.user_id;
            const canCancel = ['Pending', 'Confirmed'].includes(booking.status);
            const canReview = booking.status === 'Completed' && !booking.reviewId;

            return (
              <div key={booking._id} className="card p-5 hover:border-gem-700/50 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <img
                    src={talentUser?.profile_pic || `https://api.dicebear.com/7.x/personas/svg?seed=${talentUser?.name}`}
                    alt={talentUser?.name}
                    className="w-12 h-12 rounded-xl object-cover border border-gem-700/50 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-white">{talentUser?.name}</p>
                        <p className="text-gem-400 text-sm">{talent?.skill_type?.join(', ')}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <BookingStatusBadge status={booking.status} />
                        {booking.paymentStatus !== 'Unpaid' && (
                          <PaymentStatusBadge status={booking.paymentStatus} />
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-gem-500 text-xs">{t.bookings.eventDate}</p>
                        <p className="text-gem-200">{format(new Date(booking.event_date), 'MMM d, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-gem-500 text-xs">{t.bookings.time}</p>
                        <p className="text-gem-200">{booking.startTime}{booking.endTime ? ` – ${booking.endTime}` : ''}</p>
                      </div>
                      <div>
                        <p className="text-gem-500 text-xs">{t.bookings.price}</p>
                        <p className="text-gem-200">₹{(booking.agreedPrice || 0).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    {booking.notes && <p className="text-gem-500 text-xs mt-2 italic">"{booking.notes}"</p>}
                  </div>
                </div>
                {/* Actions */}
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gem-800/40">
                  <Link to={`/bookings/${booking._id}`} className="btn-ghost text-xs">{t.bookings.viewDetails}</Link>
                  {canReview && (
                    <button onClick={() => { setReviewModal({ bookingId: booking._id, talentId: talent?._id }); setReviewForm({ rating: 0, review_text: '' }); }} className="btn-primary text-xs">
                      ⭐ Leave Review
                    </button>
                  )}
                  {booking.reviewId && <span className="text-gem-500 text-xs py-2">{t.bookings.reviewed}</span>}
                  {canCancel && (
                    <button onClick={() => handleCancel(booking._id)} className="text-red-400 hover:text-red-300 text-xs px-3 py-2 rounded-lg hover:bg-red-900/20 transition-colors">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="card w-full max-w-md animate-in">
            <div className="flex items-center justify-between p-5 border-b border-gem-800/40">
              <h2 className="font-display text-xl font-bold text-white">Leave a Review</h2>
              <button onClick={() => setReviewModal(null)} className="text-gem-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleReview} className="p-5 space-y-4">
              <div>
                <label className="label">Your Rating *</label>
                <div className="flex justify-center py-2">
                  <StarRating rating={reviewForm.rating} size="lg" interactive onChange={r => setReviewForm({...reviewForm, rating: r})} />
                </div>
                <p className="text-center text-gem-400 text-sm">
                  {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][reviewForm.rating] || 'Click to rate'}
                </p>
              </div>
              <div>
                <label className="label">Review (optional)</label>
                <textarea rows={4} value={reviewForm.review_text} onChange={e => setReviewForm({...reviewForm, review_text: e.target.value})} className="input-field resize-none text-sm" placeholder="Share your experience..." />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setReviewModal(null)} className="btn-secondary flex-1">{t.bookings.cancel}</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-60">
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
