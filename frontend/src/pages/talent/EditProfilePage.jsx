import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { talentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SKILL_TYPES = ['Singer', 'Dancer', 'Musician', 'Actor', 'Comedian', 'Athlete', 'Teacher', 'Photographer', 'Videographer', 'Chef', 'DJ', 'Magician', 'Speaker', 'Fitness Trainer', 'Other'];

export default function EditProfilePage() {
  const { updateTalentProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    skill_type: [], bio: '', experienceYears: '', experienceDesc: '',
    hourlyRate: '', city: '', country: '', languages: '', tags: '',
    website: '', instagram: '', youtube: '',
    portfolioTitle: '', portfolioUrl: '', portfolioDesc: '',
  });

  useEffect(() => {
    talentAPI.getMyProfile()
      .then(({ data }) => {
        const p = data.data;
        setForm({
          skill_type: p.skill_type || [],
          bio: p.bio || '',
          experienceYears: p.experience?.years || '',
          experienceDesc: p.experience?.description || '',
          hourlyRate: p.hourlyRate || '',
          city: p.location?.city || '',
          country: p.location?.country || '',
          languages: p.languages?.join(', ') || '',
          tags: p.tags?.join(', ') || '',
          website: p.contact_info?.website || '',
          instagram: p.contact_info?.instagram || '',
          youtube: p.contact_info?.youtube || '',
          portfolioTitle: '', portfolioUrl: '', portfolioDesc: '',
        });
      })
      .catch(() => {}) // No profile yet is fine
      .finally(() => setLoading(false));
  }, []);

  const toggleSkill = (skill) => {
    setForm(f => ({
      ...f,
      skill_type: f.skill_type.includes(skill)
        ? f.skill_type.filter(s => s !== skill)
        : [...f.skill_type, skill],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.skill_type.length === 0) return toast.error('Select at least one skill');
    setSaving(true);
    try {
      const { data } = await talentAPI.createOrUpdate({
        skill_type: form.skill_type,
        bio: form.bio,
        experience: { years: parseInt(form.experienceYears) || 0, description: form.experienceDesc },
        hourlyRate: parseFloat(form.hourlyRate) || 0,
        location: { city: form.city, country: form.country },
        languages: form.languages.split(',').map(l => l.trim()).filter(Boolean),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        contact_info: { website: form.website, instagram: form.instagram, youtube: form.youtube },
      });
      updateTalentProfile(data.data);
      toast.success('Profile saved!');
      navigate('/talent-dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="page-container flex justify-center py-20"><div className="w-12 h-12 rounded-full border-t-2 border-gem-400 animate-spin" /></div>;

  return (
    <div className="page-container max-w-2xl">
      <h1 className="section-title mb-8">Edit Talent Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Skills */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">Skills & Category *</h3>
          <div className="grid grid-cols-3 gap-2">
            {SKILL_TYPES.map(skill => (
              <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                className={`py-2 px-3 rounded-lg text-sm border transition-all ${form.skill_type.includes(skill) ? 'bg-gem-600 border-gem-500 text-white' : 'border-gem-700/50 text-gem-400 hover:border-gem-600 hover:text-gem-200'}`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Bio & Experience */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-white mb-1">About You</h3>
          <div>
            <label className="label">Bio</label>
            <textarea rows={4} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="input-field resize-none text-sm" placeholder="Tell clients about yourself, your style, and what makes you special..." maxLength={1000} />
            <p className="text-gem-600 text-xs mt-1">{form.bio.length}/1000</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label text-xs">Years of Experience</label>
              <input type="number" min="0" max="50" value={form.experienceYears} onChange={e => setForm({...form, experienceYears: e.target.value})} className="input-field text-sm" placeholder="0" />
            </div>
            <div>
              <label className="label text-xs">प्रति घंटा दर (₹)</label>
              <input type="number" min="0" value={form.hourlyRate} onChange={e => setForm({...form, hourlyRate: e.target.value})} className="input-field text-sm" placeholder="8300" />
            </div>
          </div>
          <div>
            <label className="label text-xs">Experience Details</label>
            <textarea rows={2} value={form.experienceDesc} onChange={e => setForm({...form, experienceDesc: e.target.value})} className="input-field resize-none text-sm" placeholder="Highlight key achievements, events performed at, etc." />
          </div>
        </div>

        {/* Location */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-white mb-1">Location & Contact</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label text-xs">City</label>
              <input value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="input-field text-sm" placeholder="मुंबई" />
            </div>
            <div>
              <label className="label text-xs">Country</label>
              <input value={form.country} onChange={e => setForm({...form, country: e.target.value})} className="input-field text-sm" placeholder="भारत" />
            </div>
          </div>
          <div>
            <label className="label text-xs">Website</label>
            <input value={form.website} onChange={e => setForm({...form, website: e.target.value})} className="input-field text-sm" placeholder="https://yourwebsite.com" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label text-xs">Instagram</label>
              <input value={form.instagram} onChange={e => setForm({...form, instagram: e.target.value})} className="input-field text-sm" placeholder="@handle" />
            </div>
            <div>
              <label className="label text-xs">YouTube</label>
              <input value={form.youtube} onChange={e => setForm({...form, youtube: e.target.value})} className="input-field text-sm" placeholder="Channel name" />
            </div>
          </div>
        </div>

        {/* Extra */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-white mb-1">Additional Info</h3>
          <div>
            <label className="label text-xs">Languages (comma separated)</label>
            <input value={form.languages} onChange={e => setForm({...form, languages: e.target.value})} className="input-field text-sm" placeholder="हिन्दी, English, मराठी" />
          </div>
          <div>
            <label className="label text-xs">Tags (comma separated)</label>
            <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} className="input-field text-sm" placeholder="शादी, कॉर्पोरेट, क्लासिकल, बॉलीवुड" />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
