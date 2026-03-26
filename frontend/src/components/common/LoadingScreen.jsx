import { useLang } from '../../context/LanguageContext';

export default function LoadingScreen() {
  const { t } = useLang();
  return (
    <div className="fixed inset-0 bg-gem-950 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 relative">
          <div className="absolute inset-0 rounded-full border-2 border-gem-700 opacity-30" />
          <div className="absolute inset-0 rounded-full border-t-2 border-gem-400 animate-spin" />
          <div className="absolute inset-3 rounded-full bg-gem-gradient opacity-80 animate-pulse-slow" />
        </div>
        <p className="font-display text-xl text-gem-300 tracking-wide">LocalGems</p>
        <p className="text-gem-500 text-sm mt-1 font-body">{t.common.loading}</p>
      </div>
    </div>
  );
}
