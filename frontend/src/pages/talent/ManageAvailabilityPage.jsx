// ManageAvailabilityPage.jsx
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { talentAPI } from '../../services/api';

export default function ManageAvailabilityPage() {
  const [profile, setProfile] = useState(null);
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState({ date: '', startTime: '09:00', endTime: '17:00' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    talentAPI.getMyProfile()
      .then(({ data }) => {
        setProfile(data.data);
        setSlots(data.data.availability || []);
      })
      .catch(() => toast.error('Load failed'))
      .finally(() => setLoading(false));
  }, []);

  const addSlot = () => {
    if (!newSlot.date) return toast.error('Select a date');
    const exists = slots.some(s => format(new Date(s.date), 'yyyy-MM-dd') === newSlot.date && s.startTime === newSlot.startTime);
    if (exists) return toast.error('Slot already exists');
    setSlots(prev => [...prev, { date: new Date(newSlot.date), startTime: newSlot.startTime, endTime: newSlot.endTime, isBooked: false }]);
    setNewSlot({ date: '', startTime: '09:00', endTime: '17:00' });
  };

  const removeSlot = (idx) => setSlots(prev => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!profile) return toast.error('No profile found');
    setSaving(true);
    try {
      await talentAPI.updateAvailability(profile._id, slots);
      toast.success('Availability updated!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="page-container flex justify-center py-20"><div className="w-12 h-12 rounded-full border-t-2 border-gem-400 animate-spin" /></div>;

  return (
    <div className="page-container max-w-2xl">
      <h1 className="section-title mb-8">Manage Availability</h1>
      <div className="card p-5 mb-5">
        <h3 className="font-semibold text-white mb-4">Add New Slot</h3>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label className="label text-xs">Date *</label>
            <input type="date" value={newSlot.date} onChange={e => setNewSlot({...newSlot, date: e.target.value})} className="input-field text-sm" min={new Date().toISOString().split('T')[0]} />
          </div>
          <div>
            <label className="label text-xs">Start Time</label>
            <input type="time" value={newSlot.startTime} onChange={e => setNewSlot({...newSlot, startTime: e.target.value})} className="input-field text-sm" />
          </div>
          <div>
            <label className="label text-xs">End Time</label>
            <input type="time" value={newSlot.endTime} onChange={e => setNewSlot({...newSlot, endTime: e.target.value})} className="input-field text-sm" />
          </div>
        </div>
        <button onClick={addSlot} className="btn-secondary text-sm">+ Add Slot</button>
      </div>

      <div className="card p-5 mb-5">
        <h3 className="font-semibold text-white mb-4">Your Slots ({slots.length})</h3>
        {slots.length === 0 ? (
          <p className="text-gem-500 text-sm text-center py-4">No slots added yet</p>
        ) : (
          <div className="space-y-2">
            {slots.map((slot, i) => (
              <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-lg border ${slot.isBooked ? 'border-yellow-700/40 bg-yellow-900/10' : 'border-gem-800/40 bg-gem-900/30'}`}>
                <div>
                  <p className="text-white text-sm">{format(new Date(slot.date), 'EEE, MMM d, yyyy')}</p>
                  <p className="text-gem-400 text-xs">{slot.startTime} – {slot.endTime}</p>
                </div>
                <div className="flex items-center gap-2">
                  {slot.isBooked && <span className="badge-gold text-xs">Booked</span>}
                  {!slot.isBooked && (
                    <button onClick={() => removeSlot(i)} className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-900/20 transition-colors">Remove</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={handleSave} disabled={saving} className="btn-primary w-full disabled:opacity-60">
        {saving ? 'Saving...' : 'Save Availability'}
      </button>
    </div>
  );
}
