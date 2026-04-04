import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { talentAPI } from '../../services/api';
import TalentCard from '../../components/talent/TalentCard';
import { useLang } from '../../context/LanguageContext';

const SKILL_TYPES = ['Singer', 'Dancer', 'Musician', 'Actor', 'Comedian', 'Athlete', 'Teacher', 'Photographer', 'Videographer', 'Chef', 'DJ', 'Magician', 'Speaker', 'Fitness Trainer'];
const SORT_OPTIONS = [
  { value: '-rating.average', label: 'Top Rated' },
  { value: '-totalBookings', label: 'Most Booked' },
  { value: 'hourlyRate', label: 'Price: Low → High' },
  { value: '-hourlyRate', label: 'Price: High → Low' },
  { value: '-created_at', label: 'Newest' },
];

export default function TalentListPage() {
  const { t } = useLang();
  const [searchParams] = useSearchParams();
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // appliedFilters = what was last searched (sent to API)
  const [appliedFilters, setAppliedFilters] = useState({
    skill_type: searchParams.get('skill_type') || '',
    location: searchParams.get('location') || '',
    ratingMin: '',
    budgetMin: '',
    budgetMax: '',
    sort: '-rating.average',
    page: 1,
  });

  // draftFilters = what the user is currently typing/selecting (NOT sent to API yet)
  const [draftFilters, setDraftFilters] = useState({
    skill_type: searchParams.get('skill_type') || '',
    location: searchParams.get('location') || '',
    ratingMin: '',
    budgetMin: '',  // in INR
    budgetMax: '',  // in INR
  });

  // Only fetch when appliedFilters changes (i.e. user clicked Apply)
  const fetchTalents = useCallback(async () => {
    setLoading(true);
    try {
      // Convert INR budget back to USD for the API
      const params = {
        ...appliedFilters,
        budgetMin: appliedFilters.budgetMin || '',
        budgetMax: appliedFilters.budgetMax || '',
      };
      const cleanParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== '' && v !== null));
      const { data } = await talentAPI.search(cleanParams);
      setTalents(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => { fetchTalents(); }, [fetchTalents]);

  // Update draft only — does NOT trigger any API call
  const updateDraft = (key, value) => setDraftFilters(f => ({ ...f, [key]: value }));

  // Apply button — commit draft to applied, which triggers fetch
  const applyFilters = () => {
    setAppliedFilters({
      skill_type: draftFilters.skill_type,
      location: draftFilters.location,
      ratingMin: draftFilters.ratingMin,
      budgetMin: draftFilters.budgetMin,
      budgetMax: draftFilters.budgetMax,
      sort: appliedFilters.sort,
      page: 1,
    });
    setSidebarOpen(false);
  };

  // Sort changes apply instantly (no need to click Apply for sort)
  const updateSort = (sort) => setAppliedFilters(f => ({ ...f, sort, page: 1 }));

  // Clear everything
  const resetFilters = () => {
    const empty = { skill_type: '', location: '', ratingMin: '', budgetMin: '', budgetMax: '' };
    setDraftFilters(empty);
    setAppliedFilters({ ...empty, sort: appliedFilters.sort, page: 1 });
  };

  // Count how many filters are active
  const activeCount = [draftFilters.skill_type, draftFilters.location, draftFilters.ratingMin, draftFilters.budgetMin, draftFilters.budgetMax].filter(Boolean).length;

  const FilterPanel = () => (
    <div className="space-y-5">
      {/* Skill Type */}
      <div>
        <label className="label">{t.talent.skillType}</label>
        <select
          value={draftFilters.skill_type}
          onChange={(e) => updateDraft('skill_type', e.target.value)}
          className="input-field text-sm"
        >
          <option value="">{t.talent.allCategories}</option>
          {SKILL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Location */}
      <div>
        <label className="label">{t.talent.location}</label>
        <input
          type="text"
          placeholder={t.talent.locationPlaceholder}
          value={draftFilters.location}
          onChange={(e) => updateDraft('location', e.target.value)}
          className="input-field text-sm"
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
        />
      </div>

      {/* Min Rating */}
      <div>
        <label className="label">{t.talent.minRating}</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(r => (
            <button
              key={r}
              type="button"
              onClick={() => updateDraft('ratingMin', draftFilters.ratingMin == r ? '' : r)}
              className={`flex-1 py-2 rounded-lg text-sm border transition-all ${
                draftFilters.ratingMin == r
                  ? 'bg-gem-600 border-gem-500 text-white'
                  : 'border-gem-700/50 text-gem-400 hover:border-gem-600 hover:text-gem-200'
              }`}
            >
              {r}★
            </button>
          ))}
        </div>
      </div>

      {/* Budget in INR */}
      <div>
        <label className="label">{t.talent.budget}</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder={t.talent.minBudget}
            value={draftFilters.budgetMin}
            onChange={(e) => updateDraft('budgetMin', e.target.value)}
            className="input-field text-sm"
            min="0"
          />
          <input
            type="number"
            placeholder={t.talent.maxBudget}
            value={draftFilters.budgetMax}
            onChange={(e) => updateDraft('budgetMax', e.target.value)}
            className="input-field text-sm"
            min="0"
          />
        </div>
        <p className="text-gem-600 text-xs mt-1.5">{t.talent.budgetHint}</p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={resetFilters}
          className="btn-secondary flex-1 text-sm py-2"
        >
          Clear
        </button>
        <button
          onClick={applyFilters}
          className="btn-primary flex-1 text-sm py-2"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">{t.talent.pageTitle}</h1>
          {!loading && <p className="text-gem-400 text-sm mt-1">{pagination.total || 0} {t.talent.found}</p>}
        </div>
        <div className="flex items-center gap-3">
          <select value={appliedFilters.sort} onChange={(e) => updateSort(e.target.value)} className="input-field text-sm w-auto py-2">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => setSidebarOpen(true)} className="btn-secondary text-sm md:hidden">
            {t.talent.filters}{activeCount > 0 ? ` (${activeCount})` : ''}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar — desktop */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="card p-5 sticky top-24">
            <h3 className="font-semibold text-white mb-4">{t.talent.filters}</h3>
            <FilterPanel />
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-72 bg-gem-950 border-l border-gem-800/40 p-5 overflow-y-auto animate-slide-in-right">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-white">{t.talent.filters}</h3>
                <button onClick={() => setSidebarOpen(false)} className="text-gem-400 hover:text-white">✕</button>
              </div>
              <FilterPanel />
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="card h-80 animate-pulse">
                  <div className="h-48 bg-gem-800/40 rounded-t-xl" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gem-800/40 rounded w-3/4" />
                    <div className="h-3 bg-gem-800/40 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : talents.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gem-300 text-xl font-display">{t.talent.noFound}</p>
              <p className="text-gem-500 mt-2">{t.talent.noFoundHint}</p>
              <button onClick={resetFilters} className="btn-primary mt-6">{t.talent.resetBtn}</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {talents.map((t) => <TalentCard key={t._id} talent={t} />)}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button disabled={appliedFilters.page === 1} onClick={() => setAppliedFilters(f => ({ ...f, page: f.page - 1 }))}
                    className="btn-secondary text-sm disabled:opacity-40 disabled:cursor-not-allowed">← Prev</button>
                  <span className="text-gem-400 text-sm px-4">Page {appliedFilters.page} of {pagination.pages}</span>
                  <button disabled={appliedFilters.page >= pagination.pages} onClick={() => setAppliedFilters(f => ({ ...f, page: f.page + 1 }))}
                    className="btn-secondary text-sm disabled:opacity-40 disabled:cursor-not-allowed">Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
