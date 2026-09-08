import React, { useState, useMemo } from 'react';
import { socket } from '../../services/socket';
import { soundEngine } from '../../services/soundEffects';
import { 
  MessageSquare, 
  ThumbsUp, 
  CheckCircle2, 
  Trash2, 
  Send, 
  X, 
  Sparkles, 
  User, 
  HelpCircle,
  Eye
} from 'lucide-react';

export default function QAWallModal({
  isOpen,
  onClose,
  qaQuestions = [],
  sessionCode,
  isTrainer = false,
  participantName = '',
  participantPhone = ''
}) {
  const [newQuestionText, setNewQuestionText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [filterMode, setFilterMode] = useState('popular'); // 'popular' | 'recent' | 'unanswered'

  if (!isOpen) return null;

  const sortedQuestions = useMemo(() => {
    let list = [...(qaQuestions || [])];

    if (filterMode === 'unanswered') {
      list = list.filter(q => !q.answered);
    }

    if (filterMode === 'popular') {
      return list.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0) || b.timestamp - a.timestamp);
    } else {
      return list.sort((a, b) => b.timestamp - a.timestamp);
    }
  }, [qaQuestions, filterMode]);

  const handlePostQuestion = (e) => {
    e.preventDefault();
    if (!newQuestionText.trim() || !sessionCode) return;

    soundEngine.playPop();
    socket.emit('post_qa_question', {
      sessionCode,
      text: newQuestionText.trim(),
      authorName: isAnonymous ? 'Anonymous' : (participantName || 'Participant'),
      authorPhone: participantPhone,
      isAnonymous
    });

    setNewQuestionText('');
  };

  const handleUpvote = (questionId) => {
    if (!sessionCode) return;
    soundEngine.playPop();
    socket.emit('upvote_qa_question', {
      sessionCode,
      questionId,
      userPhone: participantPhone || participantName
    });
  };

  const handleToggleAnswered = (questionId, currentStatus) => {
    if (!isTrainer || !sessionCode) return;
    socket.emit('mark_qa_answered', {
      sessionCode,
      questionId,
      answered: !currentStatus
    });
  };

  const handleDelete = (questionId) => {
    if (!isTrainer || !sessionCode) return;
    socket.emit('delete_qa_question', {
      sessionCode,
      questionId
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Audience Q&A & Doubt Wall</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                  {qaQuestions.length}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Ask doubts, upvote the best questions, and clear technical concepts live.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterMode('popular')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterMode === 'popular'
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              🔥 Most Upvoted
            </button>
            <button
              onClick={() => setFilterMode('recent')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterMode === 'recent'
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              ⏱️ Most Recent
            </button>
            <button
              onClick={() => setFilterMode('unanswered')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterMode === 'unanswered'
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200'
              }`}
            >
              ❓ Unanswered Only
            </button>
          </div>

          {isTrainer && (
            <span className="text-[11px] text-amber-400 font-medium">
              Presenter Moderation Active
            </span>
          )}
        </div>

        {/* Question List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {sortedQuestions.length === 0 ? (
            <div className="py-12 text-center">
              <HelpCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-300">No questions posted yet</p>
              <p className="text-xs text-slate-500 mt-1">Be the first to submit a question or doubt below!</p>
            </div>
          ) : (
            sortedQuestions.map((q) => {
              const hasUpvoted = q.upvotedBy?.includes(participantPhone || participantName);

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                    q.answered
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-950/80 border-slate-800 hover:border-purple-500/40'
                  }`}
                >
                  {/* Upvote Button */}
                  <button
                    onClick={() => handleUpvote(q.id)}
                    className={`flex flex-col items-center justify-center w-12 py-2 rounded-xl border transition-all flex-shrink-0 ${
                      hasUpvoted
                        ? 'bg-purple-600/30 border-purple-500 text-purple-300 ring-1 ring-purple-500/50'
                        : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-purple-300 hover:border-purple-500/40'
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 mb-0.5 ${hasUpvoted ? 'fill-current text-purple-400' : ''}`} />
                    <span className="text-xs font-mono font-bold">{q.upvotes || 0}</span>
                  </button>

                  {/* Question Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{q.authorName || 'Participant'}</span>
                        {q.isAnonymous && <span className="text-[10px] text-slate-400">(Anon)</span>}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(q.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className={`text-sm text-slate-100 font-medium leading-relaxed ${q.answered ? 'line-through text-slate-400' : ''}`}>
                      {q.text}
                    </p>

                    {/* Trainer Controls */}
                    {isTrainer && (
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/60 text-xs">
                        <button
                          onClick={() => handleToggleAnswered(q.id, q.answered)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                            q.answered
                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{q.answered ? 'Mark Unanswered' : 'Mark as Answered'}</span>
                        </button>

                        <button
                          onClick={() => handleDelete(q.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Participant Question Submit Bar */}
        <form onSubmit={handlePostQuestion} className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              required
              placeholder="Ask a technical doubt or question to the class..."
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm font-medium focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={!newQuestionText.trim()}
              className="px-4 sm:px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-purple-500/20 transition-all flex-shrink-0"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-300">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-0"
              />
              <span>Post anonymously</span>
            </label>
            <span>Live class feed</span>
          </div>
        </form>

      </div>
    </div>
  );
}
