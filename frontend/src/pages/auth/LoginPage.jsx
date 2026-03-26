import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form);
      toast.success(`Welcome back, ${data.user.name}!`);
      const redirect = data.user.role === 'Admin' ? '/admin' : data.user.role === 'TalentProvider' ? '/talent-dashboard' : from;
      navigate(redirect, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-3xl font-bold text-white hover:text-gem-300 transition-colors">LocalGems</Link>
          <p className="text-gem-400 mt-2">{t.auth.loginTitle}</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">{t.auth.emailLabel}</label>
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" placeholder={t.auth.emailPlaceholder} autoFocus />
            </div>
            <div>
              <label className="label">{t.auth.passwordLabel}</label>
              <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input-field" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 disabled:opacity-60">
              {loading ? t.auth.signingIn : t.auth.signInBtn}
            </button>
          </form>
          <div className="mt-5 pt-5 border-t border-gem-800/40 text-center">
            <p className="text-gem-400 text-sm">
              {t.auth.noAccount}{' '}
              <Link to="/register" className="text-gem-300 hover:text-white underline underline-offset-2 transition-colors">{t.auth.createOne}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
