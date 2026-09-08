import React, { useState } from 'react';
import { useQuiz } from '../../context/QuizContext';
import { MessageSquare, ThumbsUp, CheckCircle, X, Send, User } from 'lucide-react';

export default function QAModal({ isOpen, onClose }) {
  const { qaQuestions = [], submitQAQuestion, upvoteQAQuestion, toggleQAAnswered, role, participantName } = useQuiz();
  const [questionText, setQuestionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unanswered' | 'answered'

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    setIsSubmitting(true);
    await submitQAQuestion(questionText.trim());
    setQuestionText('');
    setIsSubmitting(false);
  };

  const filteredQuestions = qaQuestions.filter(q => {
    if (activeTab === 'unanswered') return !q.answered;
    if (activeTab === 'answered') return q.answered;
    return true;
  }).sort((a, b) => {
    // Sort unanswered first, then by upvotes desc
    if (a.answered !== b.answered) return a.answered ? 1 : -1;
    return (b.upvotes || 0) - (a.upvotes || 0);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-lg">Live Audience Q&A</h3>
              <p className="text-xs text-slate-400">Ask questions and upvote peer inquiries</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-800 bg-slate-950/30 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({qaQuestions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('unanswered')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'unanswered' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Unanswered ({qaQuestions.filter(q => !q.answered).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('answered')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'answered' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Answered ({qaQuestions.filter(q => q.answered).length})
          </button>
        </div>

        {/* Question List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredQuestions.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40 stroke-1" />
              <p className="text-sm font-medium">No questions here yet!</p>
              <p className="text-xs text-slate-600 mt-1">Be the first to submit a question below.</p>
            </div>
          ) : (
            filteredQuestions.map((q) => (
              <div
                key={q.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  q.answered
                    ? 'bg-slate-950/40 border-slate-800/80 opacity-75'
                    : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1.5">
                    <p className={`text-sm leading-relaxed ${q.answered ? 'text-slate-400 line-through' : 'text-slate-100 font-medium'}`}>
                      {q.text}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-400">
                        <User className="w-3 h-3" />
                        {q.authorName || 'Anonymous'}
                      </span>
                      <span>•</span>
                      <span>{new Date(q.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {q.answered && (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold ml-1">
                          <CheckCircle className="w-3 h-3" /> Answered
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions (Upvote or Trainer Answer toggle) */}
                  <div className="flex flex-col items-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => upvoteQAQuestion(q.id)}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-700/60 hover:bg-blue-600/30 text-slate-300 hover:text-blue-300 rounded-lg text-xs font-semibold border border-slate-600/50 transition-all active:scale-95"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{q.upvotes || 0}</span>
                    </button>

                    {role === 'trainer' && (
                      <button
                        type="button"
                        onClick={() => toggleQAAnswered(q.id)}
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded transition-colors ${
                          q.answered
                            ? 'text-slate-400 hover:text-slate-200'
                            : 'text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-500/30'
                        }`}
                      >
                        {q.answered ? 'Mark Unanswered' : 'Mark Answered'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-3.5 border-t border-slate-800 bg-slate-900/90 flex gap-2">
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Type your question here..."
            maxLength={250}
            className="flex-1 bg-slate-950 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!questionText.trim() || isSubmitting}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
