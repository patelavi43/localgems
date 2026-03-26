import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { eventAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [applyModal, setApplyModal] = useState(null);
  const [form, setForm] = useState({ title: '', skill_needed: [], event_date: '', description: '', budgetMin: '', budgetMax: '' });
  const [applyForm, setApplyForm] = useState({ message: '', proposedPrice: '' });

  const SKILL_TYPES = ['Singer', 'Dancer', 'Musician', 'Actor', 'Comedian', 'Athlete', 'Teacher', 'Photographer', 'DJ', 'Speaker'];

  useEffect(() => {
    eventAPI.getAll({ status: 'Open' })
      .then(({ data }) => setEvents(data.data))
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await eventAPI.create({ ...form, budget: { min: parseFloat(form.budgetMin) || 0, max: parseFloat(form.budgetMax) || 0 } });
      toast.success('Event posted!');
      setCreateModal(false);
      const { data } = await eventAPI.getAll({ status: 'Open' });
      setEvents(data.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create event'); }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await eventAPI.apply(applyModal, { ...applyForm, proposedPrice: parseFloat(applyForm.proposedPrice) });
      toast.success('Application submitted!');
      setApplyModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to apply'); }
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">Event Requests</h1>
          <p className="text-gem-400 text-sm mt-1">Clients looking for talent for upcoming events</p>
        </div>
        {user?.role === 'Client' && (
          <button onClick={() => setCreateModal(true)} className="btn-primary">Post Event</button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="card h-40 animate-pulse" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-gem-400">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-xl font-display">No open events</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map(ev => (
            <div key={ev._id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-white font-semibold">{ev.title}</h3>
                <span className="badge-green text-xs">{ev.status}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {ev.skill_needed?.map(s => <span key={s} className="badge-purple text-xs">{s}</span>)}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gem-400 mb-3">
                <span>📅 {ev.event_date ? format(new Date(ev.event_date), 'MMM d, yyyy') : 'TBD'}</span>
                <span>💰 ${ev.budget?.min}–${ev.budget?.max}</span>
                {ev.venue?.city && <span>📍 {ev.venue.city}</span>}
                <span>👥 {ev.applicants?.length || 0} applicants</span>
              </div>
              {ev.description && <p className="text-gem-400 text-xs line-clamp-2 mb-3">{ev.description}</p>}
              {user?.role === 'TalentProvider' && (
                <button onClick={() => setApplyModal(ev._id)} className="btn-primary text-xs w-full">Apply Now</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in">
            <div className="flex items-center justify-between p-5 border-b border-gem-800/40">
              <h2 className="font-display text-xl font-bold text-white">Post Event Request</h2>
              <button onClick={() => setCreateModal(false)} className="text-gem-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="label">Event Title *</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field text-sm" placeholder="e.g. Wedding Reception Entertainment" />
              </div>
              <div>
                <label className="label">Skills Needed *</label>
                <div className="grid grid-cols-3 gap-2">
                  {SKILL_TYPES.map(s => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.skill_needed.includes(s)} onChange={e => setForm({...form, skill_needed: e.target.checked ? [...form.skill_needed, s] : form.skill_needed.filter(x => x !== s)})} className="rounded" />
                      <span className="text-gem-300 text-xs">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Event Date *</label>
                  <input type="date" required value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} className="input-field text-sm" min={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="label text-xs">बजट सीमा (₹)</label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min" value={form.budgetMin} onChange={e => setForm({...form, budgetMin: e.target.value})} className="input-field text-sm" min="0" />
                    <input type="number" placeholder="Max" value={form.budgetMax} onChange={e => setForm({...form, budgetMax: e.target.value})} className="input-field text-sm" min="0" />
                  </div>
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field text-sm resize-none" placeholder="Tell talent what you need..." />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setCreateModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Post Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {applyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="card w-full max-w-md animate-in">
            <div className="flex items-center justify-between p-5 border-b border-gem-800/40">
              <h2 className="font-display text-xl font-bold text-white">Apply to Event</h2>
              <button onClick={() => setApplyModal(null)} className="text-gem-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleApply} className="p-5 space-y-4">
              <div>
                <label className="label">Your Message</label>
                <textarea rows={4} value={applyForm.message} onChange={e => setApplyForm({...applyForm, message: e.target.value})} className="input-field text-sm resize-none" placeholder="Introduce yourself and explain why you're the right fit..." />
              </div>
              <div>
                <label className="label">प्रस्तावित मूल्य (₹)</label>
                <input type="number" value={applyForm.proposedPrice} onChange={e => setApplyForm({...applyForm, proposedPrice: e.target.value})} className="input-field text-sm" placeholder="Your quote" min="0" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setApplyModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
