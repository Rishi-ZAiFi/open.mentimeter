import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { Presentation, Clock, Zap, ArrowLeft, ArrowRight, Upload, CheckCircle2, FileText, AlertCircle, Tag } from 'lucide-react';
import defaultQuestions from '../../data/questions.json';

export default function TrainerLogin({ onBack }) {
  const { createSession, errorMessage } = useQuiz();
  const [name, setName] = useState('');
  const [timerDuration, setTimerDuration] = useState(30);
  const [speedBonus, setSpeedBonus] = useState(true);
  const [showTopic, setShowTopic] = useState(false);
  const [customQuestions, setCustomQuestions] = useState(null);
  const [customFileName, setCustomFileName] = useState('');
  const [fileError, setFileError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerOptions = [
    { label: '15 sec', value: 15 },
    { label: '30 sec (Default)', value: 30 },
    { label: '45 sec', value: 45 },
    { label: '60 sec', value: 60 },
    { label: 'No timer', value: 0 },
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          throw new Error('Question file must contain a non-empty array of questions.');
        }
        // Basic schema check
        const first = parsed[0];
        if (!first.question || !Array.isArray(first.options) || first.correctAnswer === undefined) {
          throw new Error('Invalid question format. Each item must have question, options[], and correctAnswer.');
        }

        setCustomQuestions(parsed);
        setCustomFileName(file.name);
      } catch (err) {
        setFileError(err.message || 'Failed to parse questions JSON.');
        setCustomQuestions(null);
        setCustomFileName('');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    createSession({
      name: name.trim(),
      timer: timerDuration,
      speedBonus,
      showTopic,
      customQuestions
    }, () => {
      setIsSubmitting(false);
    });
  };

  const questionCount = customQuestions ? customQuestions.length : defaultQuestions.length;

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-16 animate-fade-in">
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to role selection</span>
      </button>

      {/* Card Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Presentation className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Trainer Setup
            </h2>
            <p className="text-xs text-slate-400">
              Configure session parameters and launch your live examination.
            </p>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Trainer Name Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Trainer Name
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g., Coach Dave / Lead Instructor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-medium transition-all"
            />
          </div>

          {/* Question Timer Configuration */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Question Timer</span>
              </label>
              <span className="text-[11px] text-slate-400">Default: 30s</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {timerOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTimerDuration(opt.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                    timerDuration === opt.value
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                      : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Speed Scoring Toggle */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Speed Bonus Scoring</div>
                <div className="text-[11px] text-slate-400">
                  Awards up to +50 bonus points for faster correct responses
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={speedBonus}
                onChange={(e) => setSpeedBonus(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Show Topic / Category Toggle */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Show Topic / Category on Questions</div>
                <div className="text-[11px] text-slate-400">
                  {showTopic ? 'Topic badges visible on screen' : 'Hidden by default to avoid giving category hints'}
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showTopic}
                onChange={(e) => setShowTopic(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Question Bank Info & Custom Uploader */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Question Bank</span>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {questionCount} Questions Loaded
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-3">
              {customQuestions 
                ? `Using custom file: ${customFileName}` 
                : 'Using Digi Warriors Course 1 – Day 1 question bank.'}
            </p>

            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-dashed border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white text-xs cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>{customQuestions ? 'Replace Custom JSON' : 'Upload Custom questions.json'}</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {customQuestions && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomQuestions(null);
                    setCustomFileName('');
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-xs text-rose-400 transition-colors"
                >
                  Reset to Default
                </button>
              )}
            </div>

            {fileError && (
              <p className="text-[11px] text-rose-400 mt-2 font-medium">
                {fileError}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all duration-200"
          >
            <span>{isSubmitting ? 'Creating Session...' : 'Continue to Trainer Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

      </div>

    </div>
  );
}
