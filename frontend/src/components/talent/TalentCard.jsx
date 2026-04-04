import { Link } from 'react-router-dom';
import StarRating from '../common/StarRating';

const formatINR = (amount) =>
  (amount || 0).toLocaleString('en-IN');
const USD_TO_INR = 83;
const toINR = (usd) => (usd * USD_TO_INR).toLocaleString('en-IN');

const SKILL_COLORS = {
  Singer: 'bg-pink-900/40 text-pink-300 border-pink-700/40',
  Dancer: 'bg-purple-900/40 text-purple-300 border-purple-700/40',
  Musician: 'bg-blue-900/40 text-blue-300 border-blue-700/40',
  Actor: 'bg-orange-900/40 text-orange-300 border-orange-700/40',
  Comedian: 'bg-yellow-900/40 text-yellow-300 border-yellow-700/40',
  Athlete: 'bg-green-900/40 text-green-300 border-green-700/40',
  Teacher: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/40',
  Photographer: 'bg-rose-900/40 text-rose-300 border-rose-700/40',
  DJ: 'bg-indigo-900/40 text-indigo-300 border-indigo-700/40',
  default: 'bg-gem-900/40 text-gem-300 border-gem-700/40',
};

export default function TalentCard({ talent }) {
  const user = talent.user_id;

  // ✅ FIX: Check profilePhoto (TalentProfile field) first, then user.profile_pic, then dicebear fallback
  const avatar = talent.profilePhoto
    || user?.profile_pic
    || `https://api.dicebear.com/7.x/personas/svg?seed=${user?.name || talent._id}`;

  const primarySkill = talent.skill_type?.[0] || 'Other';
  const skillColor = SKILL_COLORS[primarySkill] || SKILL_COLORS.default;

  return (
    <Link to={`/talent/${talent._id}`} className="block group">
      <div className="card-hover p-0 overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:shadow-gem-900/40 group-hover:-translate-y-1">
        {/* Portfolio preview / background image / avatar area */}
        <div className="relative h-48 bg-gradient-to-br from-gem-900 to-gem-950 overflow-hidden">
          {/* ✅ FIX: Show backgroundImage if available, else portfolio, else plain gradient */}
          {talent.backgroundImage ? (
            <img
              src={talent.backgroundImage}
              alt="background"
              className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
            />
          ) : talent.portfolio?.[0]?.mediaUrl ? (
            <img
              src={talent.portfolio[0].mediaUrl}
              alt={talent.portfolio[0].title}
              className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gem-700/50">
                <img src={avatar} alt={user?.name} className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-gem-950 via-gem-950/20 to-transparent" />

          {/* Verified badge */}
          {talent.isVerified && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-gem-900/80 backdrop-blur-sm border border-gem-600/50 rounded-full px-2 py-0.5">
              <svg className="w-3 h-3 text-gem-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gem-300 text-xs">Verified</span>
            </div>
          )}

          {/* ✅ FIX: Price badge — no * 83, just raw INR value */}
          <div className="absolute bottom-3 right-3">
            <span className="bg-gem-950/90 backdrop-blur-sm text-gem-200 text-sm font-medium px-2.5 py-1 rounded-lg border border-gem-700/50">
              ₹{formatINR(talent.hourlyRate)}<span className="text-gem-500 text-xs">/hr</span>
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* ✅ FIX: Use resolved avatar (profilePhoto → profile_pic → dicebear) */}
            <img
              src={avatar}
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-gem-700/50 flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white text-sm truncate group-hover:text-gem-200 transition-colors">
                {user?.name || 'Unknown Talent'}
              </p>
              <p className="text-gem-500 text-xs truncate">
                {talent.location?.city}{talent.location?.city && talent.location?.country ? ', ' : ''}{talent.location?.country}
              </p>
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {talent.skill_type?.slice(0, 3).map((skill) => (
              <span key={skill} className={`badge border text-xs ${SKILL_COLORS[skill] || SKILL_COLORS.default}`}>
                {skill}
              </span>
            ))}
            {talent.skill_type?.length > 3 && (
              <span className="badge-purple text-xs">+{talent.skill_type.length - 3}</span>
            )}
          </div>

          {/* Rating & bookings */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gem-800/40">
            <div className="flex items-center gap-1.5">
              <StarRating rating={talent.rating?.average || 0} size="sm" />
              <span className="text-gem-300 text-xs font-medium">{(talent.rating?.average || 0).toFixed(1)}</span>
              <span className="text-gem-600 text-xs">({talent.rating?.count || 0})</span>
            </div>
            <span className="text-gem-500 text-xs">{talent.totalBookings || 0} bookings</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
