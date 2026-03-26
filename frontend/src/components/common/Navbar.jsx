import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const GemIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <polygon points="14,2 26,10 26,18 14,26 2,18 2,10" fill="url(#g1)" stroke="#a82ed4" strokeWidth="1"/>
    <polygon points="14,6 22,12 22,16 14,22 6,16 6,12" fill="url(#g2)" opacity="0.7"/>
    <defs>
      <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c44df0"/><stop offset="100%" stopColor="#3e0950"/>
      </linearGradient>
      <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f3d0fe"/><stop offset="100%" stopColor="#a82ed4"/>
      </linearGradient>
    </defs>
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setDropOpen(false); };

  const navLinks = user?.role === 'Admin'
    ? [{ to: '/admin', label: t.nav.dashboard }, { to: '/admin/users', label: t.nav.users }]
    : user?.role === 'TalentProvider'
    ? [{ to: '/talent-dashboard', label: t.nav.dashboard }, { to: '/talent-bookings', label: t.nav.bookings }, { to: '/talent-availability', label: t.nav.availability }]
    : [{ to: '/talent', label: t.nav.findTalent }, { to: '/events', label: t.nav.events }, ...(user ? [{ to: '/bookings', label: t.nav.myBookings }, { to: '/chat', label: t.nav.messages }] : [])];

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <nav className="sticky top-0 z-40 bg-gem-950/90 backdrop-blur-xl border-b border-gem-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <GemIcon />
            <span className="font-display text-xl font-bold text-white group-hover:text-gem-300 transition-colors">LocalGems</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(to) ? 'bg-gem-800/60 text-gem-200' : 'text-gem-400 hover:text-white hover:bg-gem-900/50'}`}>
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            {user ? (
              <div className="relative">
                <button onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2.5 bg-gem-900/60 hover:bg-gem-800/60 border border-gem-700/50 rounded-lg px-3 py-2 transition-all duration-200">
                  <div className="w-7 h-7 rounded-full bg-gem-gradient flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                    {user.profile_pic ? <img src={user.profile_pic} alt={user.name} className="w-full h-full object-cover" /> : user.name[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm text-gem-200 font-medium max-w-[100px] truncate">{user.name}</span>
                  <svg className={`w-4 h-4 text-gem-400 transition-transform ${dropOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropOpen && (
                  <div className="absolute right-0 mt-2 w-52 card shadow-xl shadow-black/40 py-1 animate-in">
                    <div className="px-4 py-2 border-b border-gem-800/60">
                      <p className="text-sm font-medium text-white truncate">{user.name}</p>
                      <p className="text-xs text-gem-500 truncate">{user.email}</p>
                      <span className="badge-purple mt-1 text-xs">{user.role}</span>
                    </div>
                    {user.role === 'TalentProvider' && (
                      <Link to="/talent-profile/edit" onClick={() => setDropOpen(false)} className="block px-4 py-2 text-sm text-gem-300 hover:text-white hover:bg-gem-800/50 transition-colors">
                        {t.nav.editProfile}
                      </Link>
                    )}
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors">
                      {t.nav.signOut}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm hidden sm:block">{t.nav.signIn}</Link>
                <Link to="/register" className="btn-primary text-sm">{t.nav.getStarted}</Link>
              </div>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gem-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-3 pt-1 space-y-1 border-t border-gem-800/40 mt-1 animate-in">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gem-300 hover:text-white hover:bg-gem-800/50 transition-colors">
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
      {dropOpen && <div className="fixed inset-0 z-[-1]" onClick={() => setDropOpen(false)} />}
    </nav>
  );
}
