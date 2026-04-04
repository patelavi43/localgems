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
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [backgroundImagePreview, setBackgroundImagePreview] = useState(null);

  const [form, setForm] = useState({
    skill_type: [], bio: '', experienceYears: '', experienceDesc: '',
    hourlyRate: '', city: '', country: '', languages: '', tags: '',
    instagram: '', youtube: '',
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
          instagram: p.contact_info?.instagram || '',
          youtube: p.contact_info?.youtube || '',
        });
        if (p.profilePhoto) setProfilePhotoPreview(p.profilePhoto);
        if (p.backgroundImage) setBackgroundImagePreview(p.backgroundImage);
      })
      .catch(() => {})
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

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePhoto(file);
    setProfilePhotoPreview(URL.createObjectURL(file));
  };

  const handleBackgroundImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBackgroundImage(file);
    setBackgroundImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.skill_type.length === 0) return toast.error('Select at least one skill');
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('skill_type', JSON.stringify(form.skill_type));
      formData.append('bio', form.bio);
      formData.append('experience', JSON.stringify({
        years: parseInt(form.experienceYears) || 0,
        description: form.experienceDesc,
      }));
      formData.append('hourlyRate', parseInt(form.hourlyRate) || 0);
      formData.append('location', JSON.stringify({ city: form.city, country: form.country }));
      formData.append('languages', JSON.stringify(form.languages.split(',').map(l => l.trim()).filter(Boolean)));
      formData.append('tags', JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)));
      formData.append('contact_info', JSON.stringify({ instagram: form.instagram, youtube: form.youtube }));
      if (profilePhoto) formData.append('profilePhoto', profilePhoto);
      if (backgroundImage) formData.append('backgroundImage', backgroundImage);

      const { data } = await talentAPI.createOrUpdate(formData);
      updateTalentProfile(data.data);
      toast.success('Profile saved!');
      navigate('/talent-dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="page-container flex justify-center py-20">
      <div className="w-12 h-12 rounded-full border-t-2 border-gem-400 animate-spin" />
    </div>
  );

  return (
    <div className="page-container max-w-2xl">
      <h1 className="section-title mb-8">Edit Talent Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Photos */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-white mb-1">Photos</h3>

          {/* Profile Photo */}
          <div>
            <label className="label text-xs">Profile Photo</label>
            <div className="flex items-center gap-4 mt-1">
              {profilePhotoPreview ? (
                <img
                  src={profilePhotoPreview}
                  alt="Profile Preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gem-500"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gem-800 border-2 border-gem-700 flex items-center justify-center text-gem-500 text-xs text-center">
                  No Photo
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  id="profilePhoto"
                  className="hidden"
                  onChange={handleProfilePhotoChange}
                />
                <label htmlFor="profilePhoto" className="btn-secondary text-xs px-4 py-2 cursor-pointer">
                  Choose Photo
                </label>
                <p className="text-gem-600 text-xs mt-1">JPG, PNG or WEBP. Max 5MB.</p>
              </div>
            </div>
          </div>

          {/* Background Image */}
          <div>
            <label className="label text-xs">Background Image</label>
            <div className="mt-1">
              {backgroundImagePreview ? (
                <img
                  src={backgroundImagePreview}
                  alt="Background Preview"
                  className="w-full h-32 object-cover rounded-lg border-2 border-gem-500 mb-2"
                />
              ) : (
                <div className="w-full h-32 rounded-lg bg-gem-800 border-2 border-dashed border-gem-700 flex items-center justify-center text-gem-500 text-sm mb-2">
                  No Background Image
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                id="backgroundImage"
                className="hidden"
                onChange={handleBackgroundImageChange}
              />
              <label htmlFor="backgroundImage" className="btn-secondary text-xs px-4 py-2 cursor-pointer">
                Choose Background Image
              </label>
              <p className="text-gem-600 text-xs mt-1">Recommended: 1280x400px. JPG, PNG or WEBP. Max 5MB.</p>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">Skills & Category *</h3>
          <div className="grid grid-cols-3 gap-2">
            {SKILL_TYPES.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={`py-2 px-3 rounded-lg text-sm border transition-all ${
                  form.skill_type.includes(skill)
                    ? 'bg-gem-600 border-gem-500 text-white'
                    : 'border-gem-700/50 text-gem-400 hover:border-gem-600 hover:text-gem-200'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* About You */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-white mb-1">About You</h3>
          <div>
            <label className="label">Bio</label>
            <textarea
              rows={4}
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              className="input-field resize-none text-sm"
              placeholder="Tell clients about yourself, your style, and what makes you special..."
              maxLength={1000}
            />
            <p className="text-gem-600 text-xs mt-1">{form.bio.length}/1000</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label text-xs">Years of Experience</label>
              <input
                type="number" min="0" max="50"
                value={form.experienceYears}
                onChange={e => setForm({ ...form, experienceYears: e.target.value })}
                className="input-field text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="label text-xs">Hourly Rate (₹)</label>
              <input
                type="number" min="0"
                value={form.hourlyRate}
                onChange={e => setForm({ ...form, hourlyRate: e.target.value })}
                className="input-field text-sm"
                placeholder="500"
              />
            </div>
          </div>
          <div>
            <label className="label text-xs">Experience Details</label>
            <textarea
              rows={2}
              value={form.experienceDesc}
              onChange={e => setForm({ ...form, experienceDesc: e.target.value })}
              className="input-field resize-none text-sm"
              placeholder="Highlight key achievements, events performed at, etc."
            />
          </div>
        </div>

        {/* Location & Contact */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-white mb-1">Location & Contact</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label text-xs">City</label>
              <input
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
                className="input-field text-sm"
                placeholder="Mumbai"
              />
            </div>
            <div>
              <label className="label text-xs">Country</label>
              <input
                value={form.country}
                onChange={e => setForm({ ...form, country: e.target.value })}
                className="input-field text-sm"
                placeholder="India"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label text-xs">Instagram</label>
              <input
                value={form.instagram}
                onChange={e => setForm({ ...form, instagram: e.target.value })}
                className="input-field text-sm"
                placeholder="@handle"
              />
            </div>
            <div>
              <label className="label text-xs">YouTube</label>
              <input
                value={form.youtube}
                onChange={e => setForm({ ...form, youtube: e.target.value })}
                className="input-field text-sm"
                placeholder="Channel name"
              />
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-white mb-1">Additional Info</h3>
          <div>
            <label className="label text-xs">Languages (comma separated)</label>
            <input
              value={form.languages}
              onChange={e => setForm({ ...form, languages: e.target.value })}
              className="input-field text-sm"
              placeholder="Hindi, English, Marathi"
            />
          </div>
          <div>
            <label className="label text-xs">Tags (comma separated)</label>
            <input
              value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })}
              className="input-field text-sm"
              placeholder="Wedding, Corporate, Classical, Bollywood"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

      </form>
    </div>
  );
}