import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  Trophy, 
  Target, 
  Phone, 
  Calendar, 
  ArrowUpRight, 
  X, 
  Sparkles,
  FileSpreadsheet,
  Layers
} from 'lucide-react';
import StudentProfileModal from '../profile/StudentProfileModal';

export default function StudentDirectory({ onClose }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (e) {
      console.error('Failed to fetch students:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.phone && s.phone.includes(search))
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-scale-in flex flex-col">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-2">
                <Users className="w-3.5 h-3.5" />
                <span>Cohort Management & Profiles</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Student Directory & Historical Tracking
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Track cumulative performance, growth graphs, and exam histories across all Digi Warriors sessions.
              </p>
            </div>

            {/* Master Export Button */}
            <a
              href="/api/export-master"
              download
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex-shrink-0"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Master Excel (.xlsx)</span>
            </a>
          </div>

          {/* Search Bar & Stats */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by student name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div className="text-xs text-slate-400 self-end sm:self-auto font-mono">
              Total Enrolled Students: <strong className="text-blue-400">{students.length}</strong>
            </div>
          </div>

          {/* Student List Grid / Table */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-400">Loading student profiles from local database...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl text-xs">
              No students found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
              {filtered.map((s, idx) => (
                <div
                  key={s.id || idx}
                  onClick={() => setSelectedStudent(s)}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-blue-500/50 hover:bg-slate-950 cursor-pointer transition-all duration-200 flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-base flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-sm truncate group-hover:text-blue-400 transition-colors">
                        {s.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>{s.phone || 'No phone'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right flex-shrink-0">
                    <div>
                      <div className="font-mono font-black text-sm text-blue-400">
                        {s.totalScore.toLocaleString()} pts
                      </div>
                      <div className="text-[11px] text-emerald-400 font-semibold">
                        {s.avgAccuracy}% Avg &bull; {s.totalQuizzes} Exam{s.totalQuizzes > 1 ? 's' : ''}
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {selectedStudent && (
        <StudentProfileModal
          phoneOrId={selectedStudent.id || selectedStudent.phone}
          currentName={selectedStudent.name}
          currentPhone={selectedStudent.phone}
          onClose={() => setSelectedStudent(null)}
          onProfileUpdated={() => {
            fetchStudents();
          }}
        />
      )}
    </>
  );
}
