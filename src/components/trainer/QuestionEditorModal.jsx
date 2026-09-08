import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  Download, 
  Upload, 
  X, 
  CheckCircle2, 
  FileText, 
  Cloud, 
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export default function QuestionEditorModal({
  isOpen,
  onClose,
  initialQuestions = [],
  onSaveQuestions
}) {
  const [questions, setQuestions] = useState(() => {
    return initialQuestions && initialQuestions.length > 0 ? JSON.parse(JSON.stringify(initialQuestions)) : [
      {
        id: 1,
        type: 'mcq',
        question: 'What is the primary function of the INDEX-MATCH formula combination in Excel?',
        options: [
          'To perform two-way dynamic lookups with superior flexibility over VLOOKUP',
          'To calculate the mathematical average of a filtered range',
          'To concatenate text strings from multiple disjoint cells',
          'To create 3D pivot charts automatically'
        ],
        correctAnswer: 0,
        category: 'Lookup & Reference',
        difficulty: 'Advanced',
        explanation: 'INDEX-MATCH allows lookups in any direction and does not break when columns are inserted or deleted.'
      }
    ];
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const currentQ = questions[selectedIndex] || questions[0];

  const handleUpdateCurrentQ = (field, value) => {
    setQuestions(prev => {
      const next = [...prev];
      next[selectedIndex] = { ...next[selectedIndex], [field]: value };
      return next;
    });
  };

  const handleUpdateOption = (optIdx, text) => {
    setQuestions(prev => {
      const next = [...prev];
      const opts = [...(next[selectedIndex].options || [])];
      opts[optIdx] = text;
      next[selectedIndex] = { ...next[selectedIndex], options: opts };
      return next;
    });
  };

  const handleAddOption = () => {
    setQuestions(prev => {
      const next = [...prev];
      const opts = [...(next[selectedIndex].options || []), `Option ${(next[selectedIndex].options || []).length + 1}`];
      next[selectedIndex] = { ...next[selectedIndex], options: opts };
      return next;
    });
  };

  const handleRemoveOption = (optIdx) => {
    setQuestions(prev => {
      const next = [...prev];
      const opts = (next[selectedIndex].options || []).filter((_, i) => i !== optIdx);
      let corr = next[selectedIndex].correctAnswer || 0;
      if (corr >= opts.length) corr = Math.max(0, opts.length - 1);
      next[selectedIndex] = { ...next[selectedIndex], options: opts, correctAnswer: corr };
      return next;
    });
  };

  const handleAddQuestion = (type = 'mcq') => {
    const newId = questions.length > 0 ? Math.max(...questions.map(q => q.id || 0)) + 1 : 1;
    const newQuestion = type === 'wordcloud' ? {
      id: newId,
      type: 'wordcloud',
      question: 'In one word, what was the most valuable concept you learned today?',
      category: 'Reflection',
      difficulty: 'Easy',
      explanation: 'Live collaborative word cloud submission.'
    } : {
      id: newId,
      type: 'mcq',
      question: 'New Question Prompt...',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      category: 'General',
      difficulty: 'Medium',
      explanation: 'Explanation for correct answer.'
    };

    setQuestions(prev => [...prev, newQuestion]);
    setSelectedIndex(questions.length);
  };

  const handleDuplicate = (idx) => {
    const target = questions[idx];
    const newId = Math.max(...questions.map(q => q.id || 0)) + 1;
    const cloned = { ...JSON.parse(JSON.stringify(target)), id: newId };
    setQuestions(prev => {
      const next = [...prev];
      next.splice(idx + 1, 0, cloned);
      return next;
    });
    setSelectedIndex(idx + 1);
  };

  const handleDelete = (idx) => {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== idx));
    setSelectedIndex(prev => (prev >= idx && prev > 0 ? prev - 1 : 0));
  };

  const handleMove = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    setQuestions(prev => {
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
    setSelectedIndex(targetIdx);
  };

  const handleSaveAndApply = () => {
    if (onSaveQuestions) {
      onSaveQuestions(questions);
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `digi_warriors_questions_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Visual Question Bank & Slide Editor</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
                  {questions.length} Items
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Design Multiple-Choice Questions (MCQs), Polls, and Live Word Clouds.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
              title="Download JSON File"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export JSON</span>
            </button>

            <button
              onClick={handleSaveAndApply}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saveSuccess ? 'Saved!' : 'Save & Apply'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body: Sidebar Question List + Form Editor */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Sidebar: Question List */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/50 flex flex-col h-48 md:h-auto overflow-hidden flex-shrink-0">
            
            {/* Add Action Buttons */}
            <div className="p-3 border-b border-slate-800/80 grid grid-cols-2 gap-2 bg-slate-950">
              <button
                onClick={() => handleAddQuestion('mcq')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 text-xs font-bold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add MCQ</span>
              </button>
              <button
                onClick={() => handleAddQuestion('wordcloud')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-sky-600/20 text-sky-300 border border-sky-500/30 hover:bg-sky-600/30 text-xs font-bold transition-colors"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>+ Word Cloud</span>
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {questions.map((q, idx) => {
                const isSelected = idx === selectedIndex;
                const isWordCloud = q.type === 'wordcloud';

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedIndex(idx)}
                    className={`group p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500/60 text-white shadow-sm ring-1 ring-blue-500/30'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-[11px] flex-shrink-0 ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="truncate">{q.question || 'Empty question prompt...'}</span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isWordCloud ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isWordCloud ? 'Cloud' : 'MCQ'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Area: Form Editor */}
          {currentQ && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
              
              {/* Top Controls: Reorder & Delete */}
              <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Question #{selectedIndex + 1} of {questions.length}
                  </span>
                  
                  {/* Question Type Selector */}
                  <select
                    value={currentQ.type || 'mcq'}
                    onChange={(e) => handleUpdateCurrentQ('type', e.target.value)}
                    className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="mcq">Multiple Choice (MCQ)</option>
                    <option value="wordcloud">Live Word Cloud</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleMove(selectedIndex, -1)}
                    disabled={selectedIndex === 0}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(selectedIndex, 1)}
                    disabled={selectedIndex === questions.length - 1}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(selectedIndex)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors ml-1"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(selectedIndex)}
                    disabled={questions.length <= 1}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-30 text-rose-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Text Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Question Prompt / Text
                </label>
                <textarea
                  rows={3}
                  value={currentQ.question || ''}
                  onChange={(e) => handleUpdateCurrentQ('question', e.target.value)}
                  placeholder="Type your question or prompt here..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-semibold"
                />
              </div>

              {/* MCQ Options List (If MCQ) */}
              {currentQ.type !== 'wordcloud' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Answer Choices & Correct Answer Indicator
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Click the radio circle on the left to mark correct answer
                    </span>
                  </div>

                  <div className="space-y-3">
                    {(currentQ.options || []).map((opt, optIdx) => {
                      const isCorrect = currentQ.correctAnswer === optIdx;

                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                            isCorrect 
                              ? 'bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/30' 
                              : 'bg-slate-950 border-slate-800'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`correct_${selectedIndex}`}
                            checked={isCorrect}
                            onChange={() => handleUpdateCurrentQ('correctAnswer', optIdx)}
                            className="w-4 h-4 text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500 cursor-pointer"
                          />

                          <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">
                            {String.fromCharCode(65 + optIdx)}
                          </span>

                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleUpdateOption(optIdx, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + optIdx)} text...`}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-blue-500"
                          />

                          {(currentQ.options || []).length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(optIdx)}
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {(currentQ.options || []).length < 6 && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="mt-3 flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-bold px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Another Option</span>
                    </button>
                  )}
                </div>
              )}

              {/* Word Cloud Explanatory Card (If Word Cloud) */}
              {currentQ.type === 'wordcloud' && (
                <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/30 text-xs text-sky-200 flex items-start gap-3">
                  <Cloud className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block mb-1">Live Word Cloud Mode</strong>
                    Participants will see an input field on their phone to submit 1-3 words. The presenter screen dynamically animates the crowd submissions into a live word cloud with font sizes scaled to frequency.
                  </div>
                </div>
              )}

              {/* Category, Difficulty & Explanation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Category / Topic
                  </label>
                  <input
                    type="text"
                    value={currentQ.category || ''}
                    onChange={(e) => handleUpdateCurrentQ('category', e.target.value)}
                    placeholder="e.g., Lookup Functions, Pivot Tables"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Difficulty Level
                  </label>
                  <select
                    value={currentQ.difficulty || 'Medium'}
                    onChange={(e) => handleUpdateCurrentQ('difficulty', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-blue-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Explanation Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Answer Explanation (Shown when Answer is Revealed)
                </label>
                <textarea
                  rows={2}
                  value={currentQ.explanation || ''}
                  onChange={(e) => handleUpdateCurrentQ('explanation', e.target.value)}
                  placeholder="Add context, formulas, or key takeaway notes..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
