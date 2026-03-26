import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Client', phone: '', city: '', country: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register({
        name: form.name, email: form.email, password: form.password, role: form.role, phone: form.phone,
        location: { city: form.city, country: form.country || 'India' },
      });
      toast.success(`Welcome to LocalGems, ${data.user.name}!`);
      navigate(data.user.role === 'TalentProvider' ? '/talent-profile/edit' : '/', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-3xl font-bold text-white hover:text-gem-300 transition-colors">LocalGems</Link>
          <p className="text-gem-400 mt-2">{t.auth.registerTitle}</p>
        </div>
        <div className="card p-8">
          <div className="grid grid-cols-2 gap-3 mb-6">
            {['Client', 'TalentProvider'].map(role => (
              <button key={role} type="button" onClick={() => setForm({...form, role})}
                className={`p-4 rounded-xl border-2 transition-all text-left ${form.role === role ? 'border-gem-500 bg-gem-900/60' : 'border-gem-800/50 hover:border-gem-700'}`}>
                <div className="text-2xl mb-1">{role === 'Client' ? '🎪' : '⭐'}</div>
                <p className="text-white text-sm font-medium">{role === 'Client' ? t.auth.needTalent : t.auth.iAmTalent}</p>
                <p className="text-gem-500 text-xs mt-0.5">{role === 'Client' ? t.auth.bookPerformers : t.auth.getDiscovered}</p>
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">{t.auth.fullName} *</label>
              <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" placeholder={t.auth.fullNamePlaceholder} />
            </div>
            <div>
              <label className="label">{t.auth.emailLabel} *</label>
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" placeholder={t.auth.emailPlaceholder} />
            </div>
            <div>
              <label className="label">{t.auth.passwordLabel} *</label>
              <input type="password" required minLength={6} value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input-field" placeholder={t.auth.passwordPlaceholder} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-xs">{t.auth.phone}</label>
                <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field text-sm" placeholder={t.auth.phonePlaceholder} />
              </div>
              <div>
                <label className="label text-xs">{t.auth.city}</label>
                <input type="text" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="input-field text-sm" placeholder={t.auth.cityPlaceholder} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
              {loading ? t.auth.creatingAccount : (form.role === 'TalentProvider' ? t.auth.createTalentBtn : t.auth.createClientBtn)}
            </button>
          </form>
          <div className="mt-5 pt-5 border-t border-gem-800/40 text-center">
            <p className="text-gem-400 text-sm">
              {t.auth.alreadyHaveAccount}{' '}
              <Link to="/login" className="text-gem-300 hover:text-white underline underline-offset-2 transition-colors">{t.nav.signIn}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
