import React, { useState } from 'react';
import { Cloud, Send, CheckCircle } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';

export default function WordCloudInput({ question }) {
  const { submitWordCloud, isAnswerSubmitted } = useQuiz();
  const [word, setWord] = useState('');
  const [submittedWords, setSubmittedWords] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanWord = word.trim();
    if (!cleanWord || isSubmitting) return;

    setIsSubmitting(true);
    await submitWordCloud(cleanWord);
    setSubmittedWords(prev => [...prev, cleanWord]);
    setWord('');
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {/* Question Heading */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center shadow-xl backdrop-blur-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-3 border border-blue-500/20">
          <Cloud className="w-3.5 h-3.5" /> Word Cloud Activity
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100 leading-snug">
          {question?.question || 'What is your immediate takeaway or keyword?'}
        </h2>
        <p className="text-xs text-slate-400 mt-2">Submit one or more words to build the live cohort cloud</p>
      </div>

      {/* Input Form */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Enter a Word or Short Phrase
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="e.g. Dynamic, VLOOKUP, Automation..."
                maxLength={35}
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 outline-none text-base"
              />
              <button
                type="submit"
                disabled={!word.trim() || isSubmitting}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Submit</span>
              </button>
            </div>
          </div>
        </form>

        {/* Submitted Words Pill List */}
        {submittedWords.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mb-2.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Your Submissions:
            </span>
            <div className="flex flex-wrap gap-2">
              {submittedWords.map((w, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-full text-xs font-semibold animate-scale-up"
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
