import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { socket } from '../services/socket';
import defaultQuestionsData from '../data/questions.json';

const QuizContext = createContext();

export function QuizProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem('dw_role') || null);
  const [trainerName, setTrainerName] = useState(() => localStorage.getItem('dw_trainer_name') || '');
  const [participantName, setParticipantName] = useState(() => localStorage.getItem('dw_participant_name') || '');
  const [participantPhone, setParticipantPhone] = useState(() => localStorage.getItem('dw_participant_phone') || '');
  const [sessionCode, setSessionCode] = useState(() => localStorage.getItem('dw_session_code') || '');
  
  const [sessionStatus, setSessionStatus] = useState('ready'); // 'ready' | 'running' | 'paused' | 'finished'
  const [timerDuration, setTimerDuration] = useState(30);
  const [speedBonusEnabled, setSpeedBonusEnabled] = useState(true);
  const [showTopic, setShowTopic] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(defaultQuestionsData.length);
  const [questionState, setQuestionState] = useState('active'); // 'active' | 'revealed' | 'closed'
  
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  // Participant-specific state
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [lastAnswerResult, setLastAnswerResult] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  
  // Live reveal data
  const [revealData, setRevealData] = useState(null);
  const [liveAnswerCount, setLiveAnswerCount] = useState({ answeredCount: 0, totalParticipants: 0 });
  
  // Server connection info
  const [connected, setConnected] = useState(socket.connected);
  const [serverInfo, setServerInfo] = useState({ ip: 'localhost', joinUrl: window.location.origin });
  const [errorMessage, setErrorMessage] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    if (role) localStorage.setItem('dw_role', role);
    else localStorage.removeItem('dw_role');
  }, [role]);

  useEffect(() => {
    if (trainerName) localStorage.setItem('dw_trainer_name', trainerName);
    if (participantName) localStorage.setItem('dw_participant_name', participantName);
    if (participantPhone) localStorage.setItem('dw_participant_phone', participantPhone);
    if (sessionCode) localStorage.setItem('dw_session_code', sessionCode);
  }, [trainerName, participantName, participantPhone, sessionCode]);

  // Fetch initial server info
  useEffect(() => {
    fetch('/api/info')
      .then(res => res.json())
      .then(data => {
        if (data && data.serverIp) {
          setServerInfo({
            ip: data.serverIp,
            joinUrl: `http://${data.serverIp}:${data.port || 3000}`
          });
        }
      })
      .catch(() => {
        setServerInfo({
          ip: window.location.hostname,
          joinUrl: window.location.origin
        });
      });
  }, []);

  // Sync Session on Connection & Reload
  const syncStateWithServer = useCallback(() => {
    if (!sessionCode) return;

    socket.emit('get_session_state', { sessionCode, participantName, participantPhone, role }, (res) => {
      if (res && res.success) {
        setSessionStatus(res.status);
        setCurrentQuestionIndex(res.currentQuestionIndex);
        setQuestionState(res.questionState);
        setTimerDuration(res.timerDuration);
        setTimeRemaining(res.timeRemaining ?? res.timerDuration);
        setSpeedBonusEnabled(res.speedBonusEnabled);
        setTotalQuestions(res.totalQuestions);
        
        if (res.showTopic !== undefined) {
          setShowTopic(res.showTopic);
        }

        if (res.participants) {
          setParticipants(res.participants);
        }

        if (res.currentQuestion) {
          setCurrentQuestion(res.currentQuestion);
        }

        if (res.liveAnswerCount) {
          setLiveAnswerCount(res.liveAnswerCount);
        }

        if (res.analytics) {
          setAnalytics(res.analytics);
          setLeaderboard(res.analytics.leaderboard || []);
        }

        if (res.revealData) {
          setRevealData(res.revealData);
        }

        if (res.selectedOption !== undefined && res.selectedOption !== null) {
          setSelectedOption(res.selectedOption);
          setIsAnswerSubmitted(true);
        }

        if (res.lastAnswerResult) {
          setLastAnswerResult(res.lastAnswerResult);
        }
      }
    });
  }, [sessionCode, participantName, participantPhone, role]);

  // Listen to Socket events
  useEffect(() => {
    const handleConnect = () => {
      setConnected(true);
      syncStateWithServer();
    };

    const handleDisconnect = () => setConnected(false);

    const handleParticipantsUpdated = ({ participants: pList }) => {
      if (pList) {
        setParticipants(pList);
      }
    };

    const handleQuizStarted = (data) => {
      setSessionStatus('running');
      setCurrentQuestionIndex(data.currentQuestionIndex || 0);
      setTotalQuestions(data.totalQuestions || 20);
      setTimerDuration(data.timerDuration || 30);
      setTimeRemaining(data.timerDuration || 30);
      setQuestionState('active');
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setLastAnswerResult(null);
      setRevealData(null);
      setQuestionStartTime(Date.now());
      if (data.question) {
        setCurrentQuestion(data.question);
      }
    };

    const handleTimerTick = ({ timeRemaining: t }) => {
      setTimeRemaining(t);
    };

    const handleTrainerQuestion = (q) => {
      setCurrentQuestion(q);
      setCurrentQuestionIndex(q.index);
      setTotalQuestions(q.total);
      setQuestionState('active');
      setRevealData(null);
      setLiveAnswerCount({ answeredCount: 0, totalParticipants: participants.length });
    };

    const handleParticipantQuestion = (q) => {
      setCurrentQuestion(q);
      setCurrentQuestionIndex(q.index);
      setTotalQuestions(q.total);
      setQuestionState('active');
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setLastAnswerResult(null);
      setRevealData(null);
      setQuestionStartTime(Date.now());
    };

    const handleQuestionChanged = ({ currentQuestionIndex: idx, totalQuestions: total }) => {
      setCurrentQuestionIndex(idx);
      setTotalQuestions(total);
      setQuestionState('active');
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setLastAnswerResult(null);
      setRevealData(null);
    };

    const handleLiveAnswerCount = (data) => {
      setLiveAnswerCount({
        answeredCount: data.answeredCount,
        totalParticipants: data.totalParticipants
      });
    };

    const handleAnswerRevealed = (data) => {
      setQuestionState('revealed');
      setRevealData(data);
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    };

    const handleDisplayLeaderboard = (data) => {
      setLeaderboard(data.leaderboard || []);
    };

    const handleQuizPaused = () => {
      setSessionStatus('paused');
    };

    const handleQuizResumed = () => {
      setSessionStatus('running');
    };

    const handleQuizFinished = (data) => {
      setSessionStatus('finished');
      setQuestionState('closed');
      if (data.analytics) setAnalytics(data.analytics);
      if (data.leaderboard) setLeaderboard(data.leaderboard);
    };

    const handleQuizRestarted = (data) => {
      setSessionStatus('ready');
      setCurrentQuestionIndex(0);
      setQuestionState('active');
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setLastAnswerResult(null);
      setRevealData(null);
      setAnalytics(null);
      setLeaderboard([]);
      if (data.participants) {
        setParticipants(data.participants);
      }
    };

    const handleSessionsCleared = () => {
      resetToHome();
    };

    const handleTopicVisibilityChanged = ({ showTopic: st }) => {
      setShowTopic(st);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('participants_updated', handleParticipantsUpdated);
    socket.on('quiz_started', handleQuizStarted);
    socket.on('timer_tick', handleTimerTick);
    socket.on('trainer_question', handleTrainerQuestion);
    socket.on('participant_question', handleParticipantQuestion);
    socket.on('question_changed', handleQuestionChanged);
    socket.on('live_answer_count', handleLiveAnswerCount);
    socket.on('answer_revealed', handleAnswerRevealed);
    socket.on('display_leaderboard', handleDisplayLeaderboard);
    socket.on('quiz_paused', handleQuizPaused);
    socket.on('quiz_resumed', handleQuizResumed);
    socket.on('quiz_finished', handleQuizFinished);
    socket.on('quiz_restarted', handleQuizRestarted);
    socket.on('sessions_cleared', handleSessionsCleared);
    socket.on('topic_visibility_changed', handleTopicVisibilityChanged);

    if (socket.connected) {
      syncStateWithServer();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('participants_updated', handleParticipantsUpdated);
      socket.off('quiz_started', handleQuizStarted);
      socket.off('timer_tick', handleTimerTick);
      socket.off('trainer_question', handleTrainerQuestion);
      socket.off('participant_question', handleParticipantQuestion);
      socket.off('question_changed', handleQuestionChanged);
      socket.off('live_answer_count', handleLiveAnswerCount);
      socket.off('answer_revealed', handleAnswerRevealed);
      socket.off('display_leaderboard', handleDisplayLeaderboard);
      socket.off('quiz_paused', handleQuizPaused);
      socket.off('quiz_resumed', handleQuizResumed);
      socket.off('quiz_finished', handleQuizFinished);
      socket.off('quiz_restarted', handleQuizRestarted);
      socket.off('sessions_cleared', handleSessionsCleared);
      socket.off('topic_visibility_changed', handleTopicVisibilityChanged);
    };
  }, [sessionCode, participantName, participantPhone, role, syncStateWithServer]);

  // Actions
  const createSession = useCallback(({ name, timer, speedBonus, showTopic, customQuestions }, callback) => {
    setErrorMessage(null);
    setTrainerName(name);
    setTimerDuration(timer);
    setSpeedBonusEnabled(speedBonus);
    setShowTopic(showTopic !== undefined ? showTopic : false);

    socket.emit('create_session', {
      trainerName: name,
      timerDuration: timer,
      speedBonusEnabled: speedBonus,
      showTopic: showTopic !== undefined ? showTopic : false,
      customQuestions
    }, (res) => {
      if (res && res.success) {
        setSessionCode(res.sessionCode);
        setRole('trainer');
        setParticipants([]);
        if (callback) callback(res);
      } else {
        setErrorMessage(res?.error || 'Failed to create session');
      }
    });
  }, []);

  const toggleTopicVisibility = useCallback(() => {
    if (!sessionCode) return;
    socket.emit('toggle_topic_visibility', { sessionCode });
  }, [sessionCode]);

  const joinSession = useCallback(({ code, name, phone }, callback) => {
    setErrorMessage(null);
    const cleanCode = (code || '').toUpperCase().trim();
    const cleanName = (name || '').trim();
    const cleanPhone = (phone || '').replace(/\D/g, '').trim();

    socket.emit('join_session', {
      sessionCode: cleanCode,
      participantName: cleanName,
      participantPhone: cleanPhone
    }, (res) => {
      if (res && res.success) {
        setSessionCode(cleanCode);
        setParticipantName(cleanName);
        setParticipantPhone(cleanPhone);
        setRole('participant');
        setSessionStatus(res.sessionStatus || 'ready');
        setTotalQuestions(res.totalQuestions || 20);
        setCurrentQuestionIndex(res.currentQuestionIndex || 0);
        setQuestionState(res.questionState || 'active');
        if (res.participants) setParticipants(res.participants);
        if (res.currentQuestion) setCurrentQuestion(res.currentQuestion);
        if (res.selectedOption !== undefined && res.selectedOption !== null) {
          setSelectedOption(res.selectedOption);
          setIsAnswerSubmitted(true);
        }
        if (callback) callback(res);
      } else {
        setErrorMessage(res?.error || 'Unable to join session');
        if (callback) callback(res);
      }
    });
  }, []);

  const startQuiz = useCallback(() => {
    if (!sessionCode) return;
    socket.emit('start_quiz', { sessionCode });
  }, [sessionCode]);

  const submitAnswer = useCallback((optionIndex) => {
    if (isAnswerSubmitted || questionState !== 'active') return;

    setSelectedOption(optionIndex);
    setIsAnswerSubmitted(true);

    const responseTimeMs = questionStartTime ? (Date.now() - questionStartTime) : 0;

    socket.emit('submit_answer', {
      sessionCode,
      participantName,
      participantPhone,
      questionIndex: currentQuestionIndex,
      selectedOption: optionIndex,
      responseTimeMs
    }, (res) => {
      if (res && res.success) {
        setLastAnswerResult(res);
      }
    });
  }, [isAnswerSubmitted, questionState, sessionCode, participantName, participantPhone, currentQuestionIndex, questionStartTime]);

  const revealAnswer = useCallback(() => {
    if (!sessionCode) return;
    socket.emit('reveal_answer', { sessionCode });
  }, [sessionCode]);

  const showLeaderboard = useCallback(() => {
    if (!sessionCode) return;
    socket.emit('show_leaderboard', { sessionCode });
  }, [sessionCode]);

  const nextQuestion = useCallback(() => {
    if (!sessionCode) return;
    socket.emit('next_question', { sessionCode });
  }, [sessionCode]);

  const jumpToQuestion = useCallback((qIndex) => {
    if (!sessionCode) return;
    socket.emit('jump_to_question', { sessionCode, questionIndex: qIndex });
  }, [sessionCode]);

  const pauseQuiz = useCallback(() => {
    if (!sessionCode) return;
    socket.emit('pause_quiz', { sessionCode });
  }, [sessionCode]);

  const resumeQuiz = useCallback(() => {
    if (!sessionCode) return;
    socket.emit('resume_quiz', { sessionCode });
  }, [sessionCode]);

  const restartQuiz = useCallback(() => {
    if (!sessionCode) return;
    socket.emit('restart_quiz', { sessionCode });
  }, [sessionCode]);

  const resetToHome = useCallback(() => {
    setRole(null);
    setTrainerName('');
    setParticipantName('');
    setParticipantPhone('');
    setSessionCode('');
    setSessionStatus('ready');
    setCurrentQuestion(null);
    setParticipants([]);
    setLeaderboard([]);
    setAnalytics(null);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setLastAnswerResult(null);
    setRevealData(null);
    localStorage.removeItem('dw_role');
    localStorage.removeItem('dw_trainer_name');
    localStorage.removeItem('dw_participant_name');
    localStorage.removeItem('dw_participant_phone');
    localStorage.removeItem('dw_session_code');
  }, []);

  const clearDatabase = useCallback(async () => {
    try {
      await fetch('/api/reset', { method: 'POST' });
      resetToHome();
    } catch (e) {
      console.error('Failed to clear database:', e);
    }
  }, [resetToHome]);

  return (
    <QuizContext.Provider value={{
      role,
      setRole,
      trainerName,
      participantName,
      setParticipantName,
      participantPhone,
      setParticipantPhone,
      sessionCode,
      sessionStatus,
      timerDuration,
      speedBonusEnabled,
      showTopic,
      setShowTopic,
      timeRemaining,
      currentQuestionIndex,
      totalQuestions,
      questionState,
      currentQuestion,
      participants,
      leaderboard,
      analytics,
      selectedOption,
      isAnswerSubmitted,
      lastAnswerResult,
      revealData,
      liveAnswerCount,
      connected,
      serverInfo,
      errorMessage,
      setErrorMessage,
      createSession,
      joinSession,
      startQuiz,
      submitAnswer,
      revealAnswer,
      showLeaderboard,
      nextQuestion,
      jumpToQuestion,
      pauseQuiz,
      resumeQuiz,
      restartQuiz,
      toggleTopicVisibility,
      resetToHome,
      clearDatabase
    }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used within a QuizProvider');
  return ctx;
}
