import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const toINR = (amount) => (amount || 0).toLocaleString('en-IN');
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { talentAPI, reviewAPI, bookingAPI, chatAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StarRating from '../../components/common/StarRating';

export default function TalentProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [talent, setTalent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [bookingModal, setBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({ event_date: '', startTime: '', endTime: '', eventType: '', venueName: '', venueCity: '', agreedPrice: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([talentAPI.getById(id), reviewAPI.getTalentReviews(id)])
      .then(([talentRes, reviewRes]) => {
        setTalent(talentRes.data.data);
        setReviews(reviewRes.data.data);
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChat = async () => {
    if (!user) return navigate('/login');
    try {
      const { data } = await chatAPI.startConversation(talent.user_id._id);
      navigate(`/chat/${data.data._id}`);
    } catch { toast.error('Could not start conversation'); }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setSubmitting(true);
    try {
      await bookingAPI.create({
        talent_id: id,
        event_date: bookingForm.event_date,
        startTime: bookingForm.startTime,
        endTime: bookingForm.endTime,
        eventType: bookingForm.eventType,
        venue: { name: bookingForm.venueName, city: bookingForm.venueCity },
        agreedPrice: parseFloat(bookingForm.agreedPrice) || talent.hourlyRate,
        notes: bookingForm.notes,
      });
      toast.success('Booking request sent!');
      setBookingModal(false);
      navigate('/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="page-container flex justify-center py-20">
      <div className="w-12 h-12 rounded-full border-t-2 border-gem-400 animate-spin" />
    </div>
  );
  if (!talent) return <div className="page-container text-center py-20 text-gem-400">Talent not found</div>;

  const talentUser = talent.user_id;
  const avatar = talent.profilePhoto
  || talentUser?.profile_pic
  || `https://api.dicebear.com/7.x/personas/svg?seed=${talentUser?.name}`;

  return (
    <div className="page-container max-w-5xl">
      {/* Hero card */}
      <div className="card overflow-hidden mb-6">
        {/* Cover image / portfolio first item */}
        <div className="relative h-48 sm:h-64 bg-gradient-to-br from-gem-900 to-gem-950">
          {talent.backgroundImage ? (
  <img src={talent.backgroundImage} alt="" className="w-full h-full object-cover opacity-60" />
) : talent.portfolio?.[0]?.mediaUrl ? (
  <img src={talent.portfolio[0].mediaUrl} alt="" className="w-full h-full object-cover opacity-50" />
) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-gem-950 via-gem-950/30 to-transparent" />
        </div>

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 relative">
            <img src={avatar} alt={talentUser?.name} className="w-24 h-24 rounded-2xl object-cover border-4 border-gem-800 shadow-xl flex-shrink-0" />
            <div className="flex-1 min-w-0 sm:pb-2">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-display font-bold text-white">{talentUser?.name}</h1>
                {talent.isVerified && (
                  <span className="badge-purple text-xs">✓ Verified</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {talent.skill_type.map(s => <span key={s} className="badge-purple text-xs">{s}</span>)}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gem-400">
                {talent.location?.city && <span>📍 {talent.location.city}, {talent.location.country}</span>}
                <span>⏱ {talent.experience?.years}+ years exp.</span>
                <div className="flex items-center gap-1.5">
                  <StarRating rating={talent.rating?.average} size="sm" />
                  <span className="text-gem-200 font-medium">{(talent.rating?.average || 0).toFixed(1)}</span>
                  <span className="text-gem-500">({talent.rating?.count} reviews)</span>
                </div>
              </div>
            </div>
            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              {user?.role === 'Client' && (
                <>
                  <button onClick={handleChat} className="btn-secondary text-sm">💬 Message</button>
                  <button onClick={() => setBookingModal(true)} className="btn-primary text-sm">Book Now</button>
                </>
              )}
              {!user && (
                <Link to="/login" className="btn-primary text-sm">Login to Book</Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Tabs */}
          <div className="flex gap-1 bg-gem-900/40 p-1 rounded-xl">
            {['about', 'portfolio', 'reviews', 'availability'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-gem-700 text-white' : 'text-gem-400 hover:text-gem-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* About tab */}
          {activeTab === 'about' && (
            <div className="card p-6 space-y-5 animate-in">
              {talent.bio && (
                <div>
                  <h3 className="font-semibold text-white mb-2">About</h3>
                  <p className="text-gem-300 leading-relaxed text-sm">{talent.bio}</p>
                </div>
              )}
              {talent.experience?.description && (
                <div>
                  <h3 className="font-semibold text-white mb-2">Experience</h3>
                  <p className="text-gem-300 text-sm leading-relaxed">{talent.experience.description}</p>
                </div>
              )}
              {talent.languages?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-white mb-2">Languages</h3>
                  <div className="flex gap-2 flex-wrap">
                    {talent.languages.map(l => <span key={l} className="badge-purple">{l}</span>)}
                  </div>
                </div>
              )}
              {talent.tags?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-white mb-2">Tags</h3>
                  <div className="flex gap-2 flex-wrap">
                    {talent.tags.map(t => <span key={t} className="text-xs text-gem-400 bg-gem-900/60 px-2 py-1 rounded-full border border-gem-800/50">#{t}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Portfolio tab */}
          {activeTab === 'portfolio' && (
            <div className="card p-6 animate-in">
              {talent.portfolio?.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {talent.portfolio.map((item) => (
                    <div key={item._id} className="group rounded-xl overflow-hidden bg-gem-900/40 border border-gem-800/40">
                      <div className="aspect-video overflow-hidden">
                        <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="p-3">
                        <p className="text-white text-sm font-medium">{item.title}</p>
                        {item.description && <p className="text-gem-400 text-xs mt-0.5 line-clamp-2">{item.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gem-500 text-center py-8">No portfolio items yet</p>
              )}
            </div>
          )}

          {/* Reviews tab */}
          {activeTab === 'reviews' && (
            <div className="card p-6 space-y-4 animate-in">
              {reviews.length === 0 ? (
                <p className="text-gem-500 text-center py-8">No reviews yet — be the first!</p>
              ) : reviews.map((review) => (
                <div key={review._id} className="border-b border-gem-800/40 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-start gap-3">
                    <img
                      src={review.user_id?.profile_pic || `https://api.dicebear.com/7.x/personas/svg?seed=${review.user_id?.name}`}
                      alt={review.user_id?.name}
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-white text-sm font-medium">{review.user_id?.name}</p>
                        <p className="text-gem-600 text-xs">{format(new Date(review.created_at), 'MMM d, yyyy')}</p>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                      {review.review_text && <p className="text-gem-300 text-sm mt-1.5 leading-relaxed">{review.review_text}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Availability tab */}
          {activeTab === 'availability' && (
            <div className="card p-6 animate-in">
              {talent.availability?.filter(s => !s.isBooked).length > 0 ? (
                <div className="space-y-2">
                  <p className="text-gem-300 text-sm mb-4">Available time slots:</p>
                  {talent.availability.filter(s => !s.isBooked).map((slot) => (
                    <div key={slot._id} className="flex items-center justify-between bg-gem-900/40 border border-gem-800/40 rounded-lg px-4 py-3">
                      <span className="text-white text-sm">{format(new Date(slot.date), 'EEEE, MMMM d, yyyy')}</span>
                      <span className="text-gem-300 text-sm">{slot.startTime} – {slot.endTime}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gem-500 text-center py-8">No availability slots added yet</p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="card p-5">
            <div className="text-center mb-4">
              <p className="text-3xl font-display font-bold text-white">₹{toINR(talent.hourlyRate)}</p>
              <p className="text-gem-400 text-sm">per hour</p>
            </div>
            {user?.role === 'Client' ? (
              <button onClick={() => setBookingModal(true)} className="btn-primary w-full mb-2">Book Now</button>
            ) : !user ? (
              <Link to="/login" className="btn-primary w-full block text-center mb-2">Login to Book</Link>
            ) : null}
            {user?.role === 'Client' && (
              <button onClick={handleChat} className="btn-secondary w-full text-sm">Send Message</button>
            )}
          </div>

          {/* Contact info */}
          {(talent.contact_info?.website || talent.contact_info?.instagram) && (
            <div className="card p-5">
              <h3 className="font-semibold text-white mb-3 text-sm">Contact</h3>
              <div className="space-y-2">
                {talent.contact_info.website && (
                  <a href={talent.contact_info.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gem-300 hover:text-gem-100 text-sm transition-colors">
                    🌐 <span className="truncate">{talent.contact_info.website}</span>
                  </a>
                )}
                {talent.contact_info.instagram && (
                  <p className="flex items-center gap-2 text-gem-300 text-sm">
                    📸 {talent.contact_info.instagram}
                  </p>
                )}
                {talent.contact_info.youtube && (
                  <p className="flex items-center gap-2 text-gem-300 text-sm">
                    ▶️ {talent.contact_info.youtube}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {bookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in">
            <div className="flex items-center justify-between p-5 border-b border-gem-800/40">
              <h2 className="font-display text-xl font-bold text-white">Book {talentUser?.name}</h2>
              <button onClick={() => setBookingModal(false)} className="text-gem-400 hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={handleBook} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Event Date *</label>
                  <input type="date" required value={bookingForm.event_date} onChange={e => setBookingForm({...bookingForm, event_date: e.target.value})} min={new Date().toISOString().split('T')[0]} className="input-field text-sm" />
                </div>
                <div>
                  <label className="label text-xs">Start Time *</label>
                  <input type="time" required value={bookingForm.startTime} onChange={e => setBookingForm({...bookingForm, startTime: e.target.value})} className="input-field text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">End Time</label>
                  <input type="time" value={bookingForm.endTime} onChange={e => setBookingForm({...bookingForm, endTime: e.target.value})} className="input-field text-sm" />
                </div>
                <div>
                  <label className="label text-xs">Event Type</label>
                  <input type="text" placeholder="Wedding, Birthday..." value={bookingForm.eventType} onChange={e => setBookingForm({...bookingForm, eventType: e.target.value})} className="input-field text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Venue Name</label>
                  <input type="text" placeholder="Venue or address" value={bookingForm.venueName} onChange={e => setBookingForm({...bookingForm, venueName: e.target.value})} className="input-field text-sm" />
                </div>
                <div>
                  <label className="label text-xs">City</label>
                  <input type="text" placeholder="Event city" value={bookingForm.venueCity} onChange={e => setBookingForm({...bookingForm, venueCity: e.target.value})} className="input-field text-sm" />
                </div>
              </div>
              <div>
                <label className="label text-xs">Agreed Price (₹{toINR(talent.hourlyRate)}/hr default)</label>
                <input type="number" placeholder={toINR(talent.hourlyRate)} value={bookingForm.agreedPrice} onChange={e => setBookingForm({...bookingForm, agreedPrice: e.target.value})} className="input-field text-sm" min="0" />
              </div>
              <div>
                <label className="label text-xs">Notes / Special Requests</label>
                <textarea rows={3} value={bookingForm.notes} onChange={e => setBookingForm({...bookingForm, notes: e.target.value})} className="input-field text-sm resize-none" placeholder="Any special requirements..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setBookingModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-60">
                  {submitting ? 'Sending...' : 'Send Booking Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
