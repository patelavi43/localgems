import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminVerifyTalentsPage() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getPendingTalents()
      .then(({ data }) => setPending(data.data))
      .catch(() => toast.error('Failed to load pending talents'))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (profileId, action) => {
    try {
      await adminAPI.verifyTalent(profileId, action);
      // Remove this talent from the pending list after action
      setPending((prev) => prev.filter((t) => t._id !== profileId));
      toast.success(`Talent ${action} successfully ✅`);
    } catch {
      toast.error('Action failed');
    }
  };

  if (loading) return (
    <div className="page-container flex justify-center py-20">
      <div className="w-12 h-12 rounded-full border-t-2 border-gem-400 animate-spin" />
    </div>
  );

  return (
    <div className="page-container max-w-4xl">
      <h1 className="section-title mb-6">
        Pending Talent Approvals
        <span className="ml-3 text-sm font-normal text-gem-400">
          ({pending.length} waiting)
        </span>
      </h1>

      {pending.length === 0 ? (
        <div className="card p-10 text-center text-gem-400">
          <p className="text-4xl mb-3">✅</p>
          <p>No pending talent approvals. All caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((talent) => (
            <div key={talent._id} className="card p-5 flex items-center gap-4">

              {/* Profile Photo */}
              <img
                src={talent.profilePhoto || talent.user_id?.profile_pic || '/default-avatar.png'}
                alt={talent.user_id?.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-gem-700 flex-shrink-0"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold">{talent.user_id?.name}</p>
                <p className="text-gem-400 text-sm">{talent.user_id?.email}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {talent.skill_type?.map((s) => (
                    <span key={s} className="text-xs bg-gem-800 text-gem-300 px-2 py-0.5 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-gem-500 text-xs mt-1">
                  📍 {talent.location?.city || '—'} · ₹{talent.hourlyRate}/hr · {talent.experience?.years || 0} yrs exp
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => handleAction(talent._id, 'approved')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => handleAction(talent._id, 'rejected')}
                  className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}