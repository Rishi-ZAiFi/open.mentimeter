import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { socket } from '../services/socket';
import { soundFX } from '../services/soundEffects';
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
  
  // Real-time Mentimeter-inspired interaction state
  const [reactions, setReactions] = useState([]);
  const [qaQuestions, setQaQuestions] = useState([]);
  const [wordCloudWords, setWordCloudWords] = useState([]);
  
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

        if (res.qaQuestions) {
          setQaQuestions(res.qaQuestions);
        }

        if (res.wordCloudWords) {
          setWordCloudWords(res.wordCloudWords);
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

    const handleTimerTick = ({ timeRemaining: tr }) => {
      setTimeRemaining(tr);
      if (tr <= 5 && tr > 0) {
        soundFX.playHurry();
      }
    };

    const handleTrainerQuestion = (data) => {
      setCurrentQuestion(data);
      setQuestionState('active');
      setWordCloudWords([]);
    };

    const handleParticipantQuestion = (data) => {
      setCurrentQuestion(data);
      setQuestionState('active');
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setLastAnswerResult(null);
      setQuestionStartTime(Date.now());
      setWordCloudWords([]);
    };

    const handleQuestionChanged = ({ currentQuestionIndex: idx, totalQuestions: total }) => {
      setCurrentQuestionIndex(idx);
      setTotalQuestions(total);
      setQuestionState('active');
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setLastAnswerResult(null);
      setRevealData(null);
      setWordCloudWords([]);
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
      soundFX.playCorrect();
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    };

    const handleDisplayLeaderboard = (data) => {
      setLeaderboard(data.leaderboard || []);
      soundFX.playDrumroll();
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
      soundFX.playFanfare();
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
      setWordCloudWords([]);
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

    const handleReactionReceived = (reaction) => {
      setReactions(prev => [...prev.slice(-40), reaction]);
    };

    const handleQAUpdated = ({ qaQuestions: qa }) => {
      setQaQuestions(qa || []);
    };

    const handleWordCloudUpdated = ({ words }) => {
      setWordCloudWords(words || []);
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
    socket.on('reaction_received', handleReactionReceived);
    socket.on('qa_questions_updated', handleQAUpdated);
    socket.on('word_cloud_updated', handleWordCloudUpdated);

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
      socket.off('reaction_received', handleReactionReceived);
      socket.off('qa_questions_updated', handleQAUpdated);
      socket.off('word_cloud_updated', handleWordCloudUpdated);
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

  const reconnectTrainer = useCallback(({ code, name }, callback) => {
    setErrorMessage(null);
    const cleanCode = (code || '').toUpperCase().trim();
    const cleanName = (name || '').trim();

    socket.emit('reconnect_trainer', {
      sessionCode: cleanCode,
      trainerName: cleanName
    }, (res) => {
      if (res && res.success) {
        setSessionCode(cleanCode);
        setTrainerName(res.trainerName || cleanName);
        setRole('trainer');
        setSessionStatus(res.status || 'ready');
        setCurrentQuestionIndex(res.currentQuestionIndex || 0);
        setQuestionState(res.questionState || 'active');
        setTimerDuration(res.timerDuration || 30);
        setTimeRemaining(res.timeRemaining || 30);
        setSpeedBonusEnabled(res.speedBonusEnabled !== undefined ? res.speedBonusEnabled : true);
        setShowTopic(res.showTopic !== undefined ? res.showTopic : false);
        setTotalQuestions(res.totalQuestions || 20);
        if (res.participants) setParticipants(res.participants);
        if (res.currentQuestion) setCurrentQuestion(res.currentQuestion);
        if (res.liveAnswerCount) setLiveAnswerCount(res.liveAnswerCount);
        if (res.analytics) {
          setAnalytics(res.analytics);
          setLeaderboard(res.analytics.leaderboard || []);
        }
        if (callback) callback(res);
      } else {
        setErrorMessage(res?.error || 'Unable to reconnect to session');
        if (callback) callback(res);
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

  const sendReaction = useCallback((emoji) => {
    if (!sessionCode || !emoji) return;
    socket.emit('send_reaction', {
      sessionCode,
      emoji,
      senderName: participantName || trainerName || 'Anonymous'
    });
  }, [sessionCode, participantName, trainerName]);

  const submitQAQuestion = useCallback((text) => {
    return new Promise((resolve) => {
      if (!sessionCode || !text) return resolve(false);
      socket.emit('submit_qa_question', {
        sessionCode,
        text,
        authorName: participantName || trainerName || 'Anonymous',
        authorPhone: participantPhone || ''
      }, (res) => {
        resolve(res && res.success);
      });
    });
  }, [sessionCode, participantName, participantPhone, trainerName]);

  const upvoteQAQuestion = useCallback((questionId) => {
    if (!sessionCode || !questionId) return;
    socket.emit('upvote_qa_question', {
      sessionCode,
      questionId,
      userPhone: participantPhone || ''
    });
  }, [sessionCode, participantPhone]);

  const toggleQAAnswered = useCallback((questionId) => {
    if (!sessionCode || !questionId) return;
    socket.emit('toggle_qa_answered', {
      sessionCode,
      questionId
    });
  }, [sessionCode]);

  const submitWordCloud = useCallback((word) => {
    return new Promise((resolve) => {
      if (!sessionCode || !word) return resolve(false);
      socket.emit('submit_word_cloud', {
        sessionCode,
        word,
        questionIndex: currentQuestionIndex,
        participantPhone: participantPhone || ''
      }, (res) => {
        resolve(res && res.success);
      });
    });
  }, [sessionCode, currentQuestionIndex, participantPhone]);

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
      reactions,
      qaQuestions,
      wordCloudWords,
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
      reconnectTrainer,
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
      sendReaction,
      submitQAQuestion,
      upvoteQAQuestion,
      toggleQAAnswered,
      submitWordCloud,
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
