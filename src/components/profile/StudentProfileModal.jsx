import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar, 
  Award, 
  Edit3, 
  CheckCircle2, 
  Layers, 
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import EditProfileModal from './EditProfileModal';

export default function StudentProfileModal({ phoneOrId, currentName, currentPhone, onClose, onProfileUpdated }) {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [error, setError] = useState('');

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const identifier = phoneOrId || currentPhone || currentName;
      if (!identifier) {
        throw new Error('No student identifier available.');
      }
      const res = await fetch(`/api/student/${encodeURIComponent(identifier)}`);
      if (!res.ok) {
        // If not found yet, synthesize local profile
        setProfileData({
          student: {
            name: currentName || 'Participant',
            phone: currentPhone || 'Not Registered',
            createdAt: new Date().toISOString()
          },
          stats: {
            totalQuizzes: 0,
            totalScore: 0,
            avgAccuracy: 0,
            bestRank: null
          },
          timeline: [],
          categoryPerformance: [],
          examHistory: []
        });
      } else {
        const data = await res.json();
        setProfileData(data);
      }
    } catch (err) {
      setError(err.message || 'Unable to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [phoneOrId, currentPhone, currentName]);

  const handleSaveProfile = async (updatedData) => {
    const identifier = profileData?.student?.id || profileData?.student?.phone || currentPhone || currentName;
    const res = await fetch(`/api/student/${encodeURIComponent(identifier)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    if (!res.ok) {
      const errJson = await res.json();
      throw new Error(errJson.error || 'Failed to update profile');
    }
    const json = await res.json();
    if (onProfileUpdated) onProfileUpdated(json.student);
    await loadProfile();
  };

  const student = profileData?.student;
  const stats = profileData?.stats;
  const timeline = profileData?.timeline || [];
  const categoryPerformance = profileData?.categoryPerformance || [];
  const examHistory = profileData?.examHistory || [];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl animate-scale-in">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-400">Loading student analytics...</p>
            </div>
          ) : (
            <div>
              
              {/* Profile Header Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    {student?.name?.charAt(0)?.toUpperCase() || 'P'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black text-white">
                        {student?.name}
                      </h2>
                      <button
                        onClick={() => setShowEdit(true)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Edit Name & Mobile Number"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        {student?.phone || 'No phone registered'}
                      </span>
                      {student?.createdAt && (
                        <span>&bull; Joined {student.createdAt.split('T')[0]}</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowEdit(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors self-start sm:self-auto"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Edit Profile</span>
                </button>
              </div>

              {/* Lifetime KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] sm:text-[11px] uppercase font-bold text-slate-400">Total Exams</span>
                  <div className="font-mono text-xl sm:text-2xl font-black text-white mt-1">
                    {stats?.totalQuizzes || 0}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] sm:text-[11px] uppercase font-bold text-slate-400">Lifetime Marks</span>
                  <div className="font-mono text-xl sm:text-2xl font-black text-blue-400 mt-1">
                    {(stats?.totalScore || 0).toLocaleString()}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] sm:text-[11px] uppercase font-bold text-slate-400">Overall Accuracy</span>
                  <div className="font-mono text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                    {stats?.avgAccuracy || 0}%
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] sm:text-[11px] uppercase font-bold text-slate-400">Best Rank</span>
                  <div className="font-mono text-xl sm:text-2xl font-black text-amber-400 mt-1">
                    {stats?.bestRank ? `#${stats.bestRank}` : '-'}
                  </div>
                </div>
              </div>

              {/* Graphical Performance Progression Chart across Quizzes */}
              {timeline.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        Multi-Exam Score Progression Over Time
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {timeline.length} exam session{timeline.length > 1 ? 's' : ''} recorded
                    </span>
                  </div>

                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeline}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="title" stroke="#64748b" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                          formatter={(val, name) => [val, name === 'score' ? 'Marks Earned' : name]}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={{ fill: '#3b82f6', r: 5 }}
                          activeDot={{ r: 7, fill: '#60a5fa' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Category Mastery Breakdown (if available) */}
              {categoryPerformance.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Technical Category Mastery
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categoryPerformance.map((cat, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                        <div className="flex items-center justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-200">{cat.category}</span>
                          <span className="font-mono text-blue-400">{cat.accuracy}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              cat.accuracy >= 80 ? 'bg-emerald-500' : cat.accuracy >= 65 ? 'bg-blue-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${cat.accuracy}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exam History List */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>Exam History Records ({examHistory.length})</span>
                </h3>

                {examHistory.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                    No past exam records found yet. Complete your first quiz to build your profile history!
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {examHistory.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">
                              {ex.quizTitle || `Assessment ${idx + 1}`}
                            </span>
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {ex.sessionCode}
                            </span>
                          </div>
                          <div className="text-slate-400 mt-0.5">
                            Date: {ex.date} &bull; {ex.totalQuestions || 20} Questions
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <div className="font-mono font-black text-sm text-blue-400">
                              {(ex.score || 0).toLocaleString()} pts
                            </div>
                            <div className="text-[11px] text-emerald-400 font-semibold">
                              {ex.accuracy}% Accuracy (Rank #{ex.rank || idx + 1})
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>

      {showEdit && (
        <EditProfileModal
          currentName={student?.name}
          currentPhone={student?.phone}
          onSave={handleSaveProfile}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  );
}
