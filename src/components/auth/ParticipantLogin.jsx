import React, { useState, useEffect } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { Smartphone, ArrowLeft, ArrowRight, AlertCircle, Hash, UserCheck, Phone, Sparkles } from 'lucide-react';

export default function ParticipantLogin({ onBack }) {
  const { joinSession, errorMessage, setErrorMessage } = useQuiz();
  const [sessionCode, setSessionCode] = useState('');
  const [phone, setPhone] = useState(() => localStorage.getItem('dw_participant_phone') || '');
  const [name, setName] = useState(() => localStorage.getItem('dw_participant_name') || '');
  const [knownStudent, setKnownStudent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check URL query parameters for code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    if (codeParam) {
      setSessionCode(codeParam.toUpperCase().trim());
    }
  }, []);

  // When phone changes, check if student profile already exists in local db
  useEffect(() => {
    const cleanPhone = phone.replace(/\D/g, '').trim();
    if (cleanPhone.length >= 6) {
      fetch(`/api/student/${cleanPhone}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.student) {
            setKnownStudent(data.student);
            if (!name.trim()) {
              setName(data.student.name);
            }
          } else {
            setKnownStudent(null);
          }
        })
        .catch(() => setKnownStudent(null));
    } else {
      setKnownStudent(null);
    }
  }, [phone]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sessionCode.trim() || !name.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    joinSession({
      code: sessionCode.trim().toUpperCase(),
      name: name.trim(),
      phone: phone.trim()
    }, (res) => {
      setIsSubmitting(false);
      if (res && res.success) {
        localStorage.setItem('dw_participant_phone', phone.trim());
      }
    });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 sm:py-16 animate-fade-in">
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to role selection</span>
      </button>

      {/* Card Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Join Quiz
            </h2>
            <p className="text-xs text-slate-400">
              Digi Warriors Live Examination Portal
            </p>
          </div>
        </div>

        {/* Welcome Back Banner for Returning Students */}
        {knownStudent && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-scale-in">
            <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div>
              <span className="font-bold">Welcome back, {knownStudent.name}!</span>
              <span className="block text-[11px] text-emerald-400/80">Account identified. Your scores will be linked to your profile.</span>
            </div>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-scale-in">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">
              {errorMessage}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Session Code Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-blue-400" />
              <span>Session Code</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., DW-4821"
              value={sessionCode}
              onChange={(e) => {
                setSessionCode(e.target.value.toUpperCase());
                if (errorMessage) setErrorMessage(null);
              }}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-base font-mono uppercase font-bold tracking-wider transition-all"
            />
          </div>

          {/* Mobile Number Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mobile Number</span>
            </label>
            <input
              type="tel"
              required
              placeholder="e.g., 9876543210"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-base font-mono font-bold tracking-wider transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Your mobile number acts as your unique student ID across all quiz days.
            </p>
          </div>

          {/* Participant Name Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Your Full Name</span>
            </label>
            <input
              type="text"
              required
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-base font-medium transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!sessionCode.trim() || !name.trim() || !phone.trim() || isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all duration-200 mt-6"
          >
            <span>{isSubmitting ? 'Joining Session...' : 'Join Quiz'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

      </div>

    </div>
  );
}
