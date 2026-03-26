import { Link } from 'react-router-dom';
import { useLang } from '../../context/LanguageContext';

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="border-t border-gem-800/40 bg-gem-950/80 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <p className="font-display text-lg font-bold text-white mb-2">LocalGems</p>
            <p className="text-gem-400 text-sm leading-relaxed">{t.footer.tagline}</p>
          </div>
          <div>
            <p className="text-gem-300 font-medium text-sm mb-3">{t.footer.discover}</p>
            <div className="space-y-2">
              <Link to="/talent" className="block text-sm text-gem-500 hover:text-gem-300 transition-colors">{t.footer.findTalent}</Link>
              <Link to="/events" className="block text-sm text-gem-500 hover:text-gem-300 transition-colors">{t.footer.browseEvents}</Link>
            </div>
          </div>
          <div>
            <p className="text-gem-300 font-medium text-sm mb-3">{t.footer.forTalent}</p>
            <div className="space-y-2">
              <Link to="/register" className="block text-sm text-gem-500 hover:text-gem-300 transition-colors">{t.footer.joinAsTalent}</Link>
              <Link to="/talent-dashboard" className="block text-sm text-gem-500 hover:text-gem-300 transition-colors">{t.footer.dashboard}</Link>
            </div>
          </div>
          <div>
            <p className="text-gem-300 font-medium text-sm mb-3">{t.footer.company}</p>
            <div className="space-y-2">
              {[t.footer.about, t.footer.privacy, t.footer.terms].map(label => (
                <span key={label} className="block text-sm text-gem-500 cursor-pointer hover:text-gem-300 transition-colors">{label}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-gem-800/40 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gem-600 text-xs">© {new Date().getFullYear()} LocalGems. {t.footer.rights}</p>
          <p className="text-gem-600 text-xs">{t.footer.builtWith}</p>
        </div>
      </div>
    </footer>
  );
}
