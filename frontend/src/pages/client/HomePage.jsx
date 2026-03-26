import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLang } from '../../context/LanguageContext';

const USD_TO_INR = 83;
const SKILL_TYPES = ['Singer', 'Dancer', 'Musician', 'Actor', 'Comedian', 'Athlete', 'Teacher', 'Photographer', 'DJ', 'Speaker', 'Chef', 'Magician'];
const SKILL_EMOJIS = { Singer:'🎤', Dancer:'💃', Musician:'🎸', Actor:'🎭', Comedian:'😄', Athlete:'🏅', Teacher:'📚', Photographer:'📷', DJ:'🎧', Magician:'🪄', Speaker:'🎙️', 'Fitness Trainer':'💪', Chef:'👨‍🍳' };

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [search, setSearch] = useState({ skill_type: '', location: '', budget: '' });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.skill_type) params.set('skill_type', search.skill_type);
    if (search.location) params.set('location', search.location);
    if (search.budget) params.set('budgetMax', Math.round(parseFloat(search.budget) / USD_TO_INR));
    navigate(`/talent?${params.toString()}`);
  };

  const STATS = [
    { label: t.home.stats.talent, value: '2,400+' },
    { label: t.home.stats.events, value: '18,000+' },
    { label: t.home.stats.clients, value: '9,200+' },
    { label: t.home.stats.cities, value: '120+' },
  ];

  return (
    <div>
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-gem-700/10 blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-gem-600/8 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-gem-900/60 border border-gem-700/50 rounded-full px-4 py-1.5 mb-6 animate-in">
              <span className="w-2 h-2 rounded-full bg-gem-400 animate-pulse" />
              <span className="text-gem-300 text-sm">{t.home.badge}</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-white leading-tight mb-6 slide-in">
              {t.home.title1}{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gem-400 to-gem-200">{t.home.titleHighlight}</span>{' '}
              {t.home.title2}
            </h1>
            <p className="text-gem-300 text-xl leading-relaxed mb-10 font-light max-w-2xl">{t.home.subtitle}</p>
            <form onSubmit={handleSearch} className="bg-gem-900/60 backdrop-blur-sm border border-gem-700/50 rounded-2xl p-4 shadow-2xl shadow-black/40">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="label text-xs">{t.home.skillLabel}</label>
                  <select value={search.skill_type} onChange={(e) => setSearch({...search, skill_type: e.target.value})} className="input-field text-sm">
                    <option value="">{t.home.skillPlaceholder}</option>
                    {SKILL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label text-xs">{t.home.locationLabel}</label>
                  <input type="text" placeholder={t.home.locationPlaceholder} value={search.location} onChange={(e) => setSearch({...search, location: e.target.value})} className="input-field text-sm" />
                </div>
                <div>
                  <label className="label text-xs">{t.home.budgetLabel}</label>
                  <input type="number" placeholder={t.home.budgetPlaceholder} value={search.budget} onChange={(e) => setSearch({...search, budget: e.target.value})} className="input-field text-sm" min="0" />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full mt-3 py-3">{t.home.searchBtn}</button>
            </form>
          </div>
        </div>
      </section>

      <section className="border-y border-gem-800/40 bg-gem-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map(({ label, value }) => (
              <div key={label}>
                <p className="text-3xl font-display font-bold text-gem-300">{value}</p>
                <p className="text-gem-500 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">{t.home.browseTitle}</h2>
            <p className="section-subtitle">{t.home.browseSubtitle}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {SKILL_TYPES.map((skill) => (
              <Link key={skill} to={`/talent?skill_type=${skill}`} className="card-hover p-5 text-center group">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gem-gradient flex items-center justify-center text-xl">{SKILL_EMOJIS[skill] || '✨'}</div>
                <p className="text-white font-medium text-sm group-hover:text-gem-200 transition-colors">{skill}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-gem-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">{t.home.howTitle}</h2>
            <p className="section-subtitle">{t.home.howSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {t.home.steps.map(({ title, desc }, i) => (
              <div key={i} className="relative">
                <div className="card p-6">
                  <div className="font-display text-5xl font-bold text-gem-900/80 mb-4 select-none">0{i+1}</div>
                  <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
                  <p className="text-gem-400 text-sm leading-relaxed">{desc}</p>
                </div>
                {i < 2 && <div className="hidden md:block absolute top-1/2 -right-4 text-gem-700 text-2xl z-10">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-gem-800/40">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="card p-12 bg-gem-gradient relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, #c44df0 0%, transparent 50%), radial-gradient(circle at 70% 30%, #e9a8fd 0%, transparent 50%)' }} />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">{t.home.ctaTitle}</h2>
              <p className="text-gem-100/80 text-lg mb-8 font-light">{t.home.ctaSubtitle}</p>
              <Link to="/register" className="inline-block bg-white text-gem-900 font-semibold px-8 py-3.5 rounded-xl hover:bg-gem-50 transition-colors shadow-lg">{t.home.ctaBtn}</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
