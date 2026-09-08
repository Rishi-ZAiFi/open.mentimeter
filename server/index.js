import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import * as XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"]
  }
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper to detect local LAN IP
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalIpAddress();

// Load initial questions
let defaultQuestions = [];
try {
  const questionsPath = path.join(__dirname, '../public/questions.json');
  if (fs.existsSync(questionsPath)) {
    defaultQuestions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
  } else {
    const srcQuestionsPath = path.join(__dirname, '../src/data/questions.json');
    if (fs.existsSync(srcQuestionsPath)) {
      defaultQuestions = JSON.parse(fs.readFileSync(srcQuestionsPath, 'utf8'));
    }
  }
} catch (e) {
  console.error('Error loading default questions:', e);
}

// In-Memory Sessions Store (live running sessions)
const sessions = new Map();

// Helper to calculate scores, rankings and deltas
function updateSessionRankings(session) {
  const sorted = [...session.participants].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aTimes = Object.values(a.answers).map(ans => ans.responseTimeMs || 30000);
    const bTimes = Object.values(b.answers).map(ans => ans.responseTimeMs || 30000);
    const aAvg = aTimes.length ? aTimes.reduce((s, v) => s + v, 0) / aTimes.length : 999999;
    const bAvg = bTimes.length ? bTimes.reduce((s, v) => s + v, 0) / bTimes.length : 999999;
    return aAvg - bAvg;
  });

  sorted.forEach((participant, idx) => {
    const newRank = idx + 1;
    participant.previousRank = participant.currentRank || newRank;
    participant.currentRank = newRank;
    participant.rankDelta = participant.previousRank - newRank;
  });
}

// Helper to compute session analytics
function calculateSessionAnalytics(session) {
  const totalQuestions = session.questions.length;
  const totalParticipants = session.participants.length;

  const questionAnalytics = session.questions.map((q, qIndex) => {
    let answeredCount = 0;
    let correctCount = 0;
    const optionCounts = [0, 0, 0, 0];
    let totalResponseTime = 0;

    session.participants.forEach(p => {
      const ans = p.answers[qIndex];
      if (ans && ans.selectedOption !== null && ans.selectedOption !== undefined) {
        answeredCount++;
        if (ans.selectedOption >= 0 && ans.selectedOption < 4) {
          optionCounts[ans.selectedOption]++;
        }
        if (ans.isCorrect) correctCount++;
        totalResponseTime += (ans.responseTimeMs || 0);
      }
    });

    const notAnsweredCount = totalParticipants - answeredCount;
    const accuracyPct = totalParticipants > 0 ? Math.round((correctCount / totalParticipants) * 100) : 0;
    const avgResponseTimeMs = answeredCount > 0 ? Math.round(totalResponseTime / answeredCount) : 0;

    const optionDist = optionCounts.map(count => ({
      count,
      pct: totalParticipants > 0 ? Math.round((count / totalParticipants) * 100) : 0
    }));

    return {
      questionId: q.id,
      questionIndex: qIndex,
      question: q.question,
      category: q.category || 'General',
      difficulty: q.difficulty || 'Medium',
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      totalParticipants,
      answeredCount,
      notAnsweredCount,
      correctCount,
      incorrectCount: answeredCount - correctCount,
      accuracyPct,
      avgResponseTimeMs,
      optionCounts,
      optionDist
    };
  });

  // Category analytics
  const categoriesMap = {};
  questionAnalytics.forEach(qa => {
    const cat = qa.category || 'General';
    if (!categoriesMap[cat]) {
      categoriesMap[cat] = {
        category: cat,
        totalQuestions: 0,
        totalAttempts: 0,
        totalCorrect: 0
      };
    }
    categoriesMap[cat].totalQuestions++;
    categoriesMap[cat].totalAttempts += qa.totalParticipants;
    categoriesMap[cat].totalCorrect += qa.correctCount;
  });

  const categoryAnalytics = Object.values(categoriesMap).map(cat => ({
    category: cat.category,
    totalQuestions: cat.totalQuestions,
    accuracyPct: cat.totalAttempts > 0 ? Math.round((cat.totalCorrect / cat.totalAttempts) * 100) : 0
  })).sort((a, b) => a.accuracyPct - b.accuracyPct);

  // Summary Metrics
  const scores = session.participants.map(p => p.score);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
  const minScore = scores.length > 0 ? Math.min(...scores) : 0;

  const totalPossibleAnswers = totalParticipants * totalQuestions;
  let totalCorrectOverall = 0;
  session.participants.forEach(p => {
    Object.values(p.answers).forEach(a => {
      if (a.isCorrect) totalCorrectOverall++;
    });
  });
  const avgAccuracy = totalPossibleAnswers > 0 ? Math.round((totalCorrectOverall / totalPossibleAnswers) * 100) : 0;

  return {
    totalQuestions,
    totalParticipants,
    avgScore,
    maxScore,
    minScore,
    avgAccuracy,
    questionAnalytics,
    categoryAnalytics,
    leaderboard: session.participants.map(p => ({
      id: p.id,
      studentId: p.studentId,
      phone: p.phone,
      name: p.name,
      score: p.score,
      currentRank: p.currentRank,
      previousRank: p.previousRank,
      rankDelta: p.rankDelta,
      connected: p.connected,
      answersCount: Object.keys(p.answers).length,
      answers: p.answers
    }))
  };
}

// REST API Endpoints
app.get('/api/info', (req, res) => {
  res.json({
    status: 'ok',
    serverIp: localIp,
    port: PORT,
    activeSessions: sessions.size,
    joinUrl: `http://${localIp}:${PORT}`
  });
});

app.get('/api/questions', (req, res) => {
  res.json(defaultQuestions);
});

app.post('/api/questions', (req, res) => {
  try {
    const { questions } = req.body;
    if (Array.isArray(questions) && questions.length > 0) {
      defaultQuestions = questions;
      res.json({ success: true, count: questions.length });
    } else {
      res.status(400).json({ error: 'Invalid questions array' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trainer Profile & Active Sessions Endpoints
app.get('/api/trainers', (req, res) => {
  res.json({ success: true, trainers: db.getAllTrainers() });
});

app.get('/api/active-sessions', (req, res) => {
  const active = [];
  sessions.forEach((s) => {
    active.push({
      code: s.code,
      trainerName: s.trainerName,
      status: s.status,
      participantsCount: s.participants ? s.participants.length : 0,
      currentQuestionIndex: s.currentQuestionIndex || 0,
      totalQuestions: s.questions ? s.questions.length : 20,
      timerDuration: s.timerDuration || 30,
      showTopic: s.showTopic || false,
      speedBonusEnabled: s.speedBonusEnabled !== undefined ? s.speedBonusEnabled : true
    });
  });
  res.json({ success: true, sessions: active });
});

// Student Profile Endpoints
app.get('/api/students', (req, res) => {
  res.json(db.getAllStudents());
});

app.get('/api/student/:phoneOrId', (req, res) => {
  const profile = db.getStudentFullProfile(req.params.phoneOrId);
  if (!profile) {
    return res.status(404).json({ error: 'Student profile not found' });
  }
  res.json(profile);
});

app.put('/api/student/:phoneOrId', (req, res) => {
  const updated = db.updateStudentProfile(req.params.phoneOrId, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Student not found' });
  }

  // Also update live sessions if participant is currently active
  sessions.forEach(session => {
    const p = session.participants.find(x => x.phone === updated.phone || x.studentId === updated.id);
    if (p) {
      if (req.body.name) p.name = req.body.name.trim();
      io.to(session.code).emit('participants_updated', {
        participants: session.participants.map(item => ({ id: item.id, name: item.name, score: item.score, rank: item.currentRank, phone: item.phone, connected: item.connected })),
        count: session.participants.length
      });
    }
  });

  res.json({ success: true, student: updated });
});

// Master Multi-Exam Excel Export Endpoint
app.get('/api/export-master', (req, res) => {
  try {
    const students = db.getAllStudents();
    const wb = XLSX.utils.book_new();

    // Sheet 1: Master Student Directory & Cumulative Performance
    const sheet1Data = students.map((s, idx) => ({
      'S.No': idx + 1,
      'Student ID': s.id,
      'Student Name': s.name,
      'Mobile Number': s.phone,
      'Total Quizzes Attempted': s.totalQuizzes,
      'Cumulative Score (Marks)': s.totalScore,
      'Average Accuracy (%)': `${s.avgAccuracy}%`,
      'Last Quiz Date': s.lastExamDate || '-'
    }));

    // Sheet 2: All Exam Results Log
    const sheet2Data = db.data.examResults.map((er, idx) => ({
      'Record ID': er.id,
      'Date': er.date,
      'Session Code': er.sessionCode,
      'Quiz Title': er.quizTitle,
      'Student Name': er.studentName,
      'Mobile Number': er.studentPhone,
      'Score (Marks)': er.score,
      'Accuracy (%)': `${er.accuracy}%`,
      'Rank in Quiz': er.rank,
      'Total Questions': er.totalQuestions,
      'Correct Answers': er.correctAnswers
    }));

    // Sheet 3: Sessions Log
    const sheet3Data = db.data.sessions.map((sess, idx) => ({
      'Session ID': sess.id,
      'Session Code': sess.code,
      'Date': sess.date,
      'Trainer Name': sess.trainerName,
      'Total Questions': sess.totalQuestions,
      'Participants Count': sess.totalParticipants,
      'Cohort Average Score': sess.avgScore,
      'Cohort Average Accuracy': `${sess.avgAccuracy}%`
    }));

    const ws1 = XLSX.utils.json_to_sheet(sheet1Data);
    const ws2 = XLSX.utils.json_to_sheet(sheet2Data);
    const ws3 = XLSX.utils.json_to_sheet(sheet3Data);

    ws1['!cols'] = [{ wch: 6 }, { wch: 15 }, { wch: 25 }, { wch: 18 }, { wch: 24 }, { wch: 24 }, { wch: 20 }, { wch: 16 }];
    ws2['!cols'] = [{ wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 30 }, { wch: 25 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 14 }];
    ws3['!cols'] = [{ wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 25 }, { wch: 15 }, { wch: 18 }, { wch: 20 }, { wch: 22 }];

    XLSX.utils.book_append_sheet(wb, ws1, 'Student Directory');
    XLSX.utils.book_append_sheet(wb, ws2, 'All Exams Record Log');
    XLSX.utils.book_append_sheet(wb, ws3, 'Completed Sessions');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="Digi_Warriors_Master_Analytics_Database.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear all active sessions (Reset DB)
app.post('/api/reset', (req, res) => {
  sessions.forEach(s => {
    if (s.timerInterval) clearInterval(s.timerInterval);
  });
  sessions.clear();
  io.emit('sessions_cleared');
  console.log('[DB Reset] All active live quiz sessions cleared.');
  res.json({ success: true, message: 'All live quiz sessions cleared successfully.' });
});

// Socket.io Real-time Event Handling
io.on('connection', (socket) => {

  // Trainer creates a session
  socket.on('create_session', ({ trainerName, sessionCode, timerDuration = 30, speedBonusEnabled = true, showTopic = false, customQuestions = null }, callback) => {
    try {
      const code = (sessionCode || `DW-${Math.floor(1000 + Math.random() * 9000)}`).toUpperCase();
      const questionSet = (customQuestions && customQuestions.length > 0) ? customQuestions : defaultQuestions;

      const newSession = {
        code,
        trainerName: trainerName || 'Trainer',
        trainerSocketId: socket.id,
        status: 'ready',
        timerDuration: Number(timerDuration) || 30,
        speedBonusEnabled: Boolean(speedBonusEnabled),
        showTopic: Boolean(showTopic),
        currentQuestionIndex: 0,
        questionState: 'active',
        questionStartTime: null,
        timeRemaining: Number(timerDuration) || 30,
        timerInterval: null,
        questions: questionSet,
        participants: [],
        completedQuestions: []
      };

      sessions.set(code, newSession);
      socket.join(code);

      db.createOrUpdateTrainer(newSession.trainerName, { sessionCode: code });

      console.log(`[Session Created] Code: ${code} by ${newSession.trainerName} with ${questionSet.length} questions (ShowTopic: ${newSession.showTopic})`);

      if (callback) {
        callback({
          success: true,
          sessionCode: code,
          localIp,
          port: PORT,
          joinUrl: `http://${localIp}:${PORT}`,
          session: {
            code,
            trainerName: newSession.trainerName,
            status: newSession.status,
            timerDuration: newSession.timerDuration,
            speedBonusEnabled: newSession.speedBonusEnabled,
            showTopic: newSession.showTopic,
            totalQuestions: newSession.questions.length,
            participantsCount: 0,
            participants: []
          }
        });
      }
    } catch (e) {
      if (callback) callback({ success: false, error: e.message });
    }
  });

  // Trainer reconnects to an existing active session
  socket.on('reconnect_trainer', ({ sessionCode, trainerName }, callback) => {
    try {
      const code = (sessionCode || '').toUpperCase().trim();
      const session = sessions.get(code);
      if (!session) {
        return callback && callback({ success: false, error: 'Session not found or is no longer active.' });
      }

      session.trainerSocketId = socket.id;
      if (trainerName && trainerName.trim()) {
        session.trainerName = trainerName.trim();
        db.createOrUpdateTrainer(session.trainerName, { sessionCode: code });
      }
      socket.join(code);

      console.log(`[Trainer Reconnected] Session ${code} reconnected by trainer: ${session.trainerName}`);

      const analytics = calculateSessionAnalytics(session);
      const currQ = session.questions[session.currentQuestionIndex];

      let answeredCount = 0;
      session.participants.forEach(p => {
        if (p.answers[session.currentQuestionIndex] !== undefined) answeredCount++;
      });

      const participantList = session.participants.map(p => ({
        id: p.id,
        name: p.name,
        phone: p.phone,
        score: p.score,
        rank: p.currentRank,
        connected: p.connected
      }));

      const payload = {
        success: true,
        sessionCode: code,
        trainerName: session.trainerName,
        status: session.status,
        currentQuestionIndex: session.currentQuestionIndex,
        questionState: session.questionState,
        timeRemaining: session.timeRemaining,
        timerDuration: session.timerDuration,
        speedBonusEnabled: session.speedBonusEnabled,
        showTopic: session.showTopic !== undefined ? session.showTopic : false,
        totalQuestions: session.questions.length,
        participantsCount: session.participants.length,
        participants: participantList,
        completedQuestions: session.completedQuestions,
        currentQuestion: currQ ? { index: session.currentQuestionIndex, total: session.questions.length, ...currQ } : null,
        liveAnswerCount: {
          answeredCount,
          totalParticipants: session.participants.length
        },
        analytics
      };

      if (callback) callback(payload);
    } catch (e) {
      if (callback) callback({ success: false, error: e.message });
    }
  });

  // Trainer toggles topic / category visibility live
  socket.on('toggle_topic_visibility', ({ sessionCode }, callback) => {
    const session = sessions.get(sessionCode);
    if (!session) {
      if (callback) callback({ success: false, error: 'Session not found' });
      return;
    }

    session.showTopic = !session.showTopic;
    console.log(`[Topic Toggle] Session ${sessionCode} showTopic is now: ${session.showTopic}`);

    io.to(session.code).emit('topic_visibility_changed', {
      showTopic: session.showTopic
    });

    if (callback) {
      callback({ success: true, showTopic: session.showTopic });
    }
  });

  // Participant joins a session with phone and name
  socket.on('join_session', ({ sessionCode, participantName, participantPhone }, callback) => {
    try {
      const code = (sessionCode || '').toUpperCase().trim();
      const name = (participantName || '').trim();
      const phone = (participantPhone || '').replace(/\D/g, '').trim();

      if (!code || (!name && !phone)) {
        return callback && callback({ success: false, error: 'Session code, name, and mobile number are required.' });
      }

      const session = sessions.get(code);
      if (!session) {
        return callback && callback({ success: false, error: 'Session not found. Please check the code.' });
      }

      // Check DB for persistent student account
      let student = null;
      if (phone) {
        student = db.findStudentByPhone(phone);
      }
      if (!student && name) {
        student = db.findStudentByName(name);
      }

      // If student account exists, sync name/phone
      const effectiveName = name || (student ? student.name : 'Participant');
      const effectivePhone = phone || (student ? student.phone : `98765${Math.floor(10000 + Math.random() * 90000)}`);

      if (!student) {
        student = db.createOrUpdateStudent(effectivePhone, effectiveName);
      } else {
        if (name && student.name !== name) {
          student = db.createOrUpdateStudent(effectivePhone, effectiveName);
        }
      }

      // Prevent duplicate phone number in the same active session
      let existing = session.participants.find(p => 
        (p.phone && p.phone === effectivePhone) || 
        (p.name.toLowerCase() === effectiveName.toLowerCase())
      );

      if (existing) {
        // Resume session for this participant
        existing.connected = true;
        existing.socketId = socket.id;
        if (effectivePhone) existing.phone = effectivePhone;
        if (effectiveName) existing.name = effectiveName;
        socket.join(code);

        io.to(code).emit('participants_updated', {
          participants: session.participants.map(p => ({ id: p.id, name: p.name, phone: p.phone, score: p.score, rank: p.currentRank, connected: p.connected })),
          count: session.participants.length
        });

        const q = session.questions[session.currentQuestionIndex];
        const participantQuestion = q ? {
          index: session.currentQuestionIndex,
          total: session.questions.length,
          id: q.id,
          question: q.question,
          options: q.options,
          difficulty: q.difficulty,
          category: q.category
        } : null;

        const myAns = existing.answers[session.currentQuestionIndex];

        return callback && callback({
          success: true,
          resumed: true,
          sessionCode: code,
          student,
          participant: existing,
          sessionStatus: session.status,
          currentQuestionIndex: session.currentQuestionIndex,
          currentQuestion: participantQuestion,
          questionState: session.questionState,
          timeRemaining: session.timeRemaining,
          timerDuration: session.timerDuration,
          speedBonusEnabled: session.speedBonusEnabled,
          totalQuestions: session.questions.length,
          participants: session.participants.map(p => ({ id: p.id, name: p.name, phone: p.phone, score: p.score, rank: p.currentRank, connected: p.connected })),
          selectedOption: myAns ? myAns.selectedOption : null,
          isAnswerSubmitted: Boolean(myAns)
        });
      }

      // New participant in this active session
      const newParticipant = {
        id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        studentId: student.id,
        phone: effectivePhone,
        name: effectiveName,
        score: 0,
        previousRank: session.participants.length + 1,
        currentRank: session.participants.length + 1,
        rankDelta: 0,
        connected: true,
        socketId: socket.id,
        answers: {}
      };

      session.participants.push(newParticipant);
      updateSessionRankings(session);
      socket.join(code);

      console.log(`[Participant Joined] ${effectiveName} (${effectivePhone}) joined session ${code} (Total: ${session.participants.length})`);

      const participantList = session.participants.map(p => ({ id: p.id, name: p.name, phone: p.phone, score: p.score, rank: p.currentRank, connected: p.connected }));

      io.to(code).emit('participants_updated', {
        participants: participantList,
        count: session.participants.length
      });

      if (callback) {
        callback({
          success: true,
          sessionCode: code,
          student,
          participant: newParticipant,
          sessionStatus: session.status,
          currentQuestionIndex: session.currentQuestionIndex,
          questionState: session.questionState,
          timeRemaining: session.timeRemaining,
          timerDuration: session.timerDuration,
          speedBonusEnabled: session.speedBonusEnabled,
          totalQuestions: session.questions.length,
          participants: participantList
        });
      }
    } catch (e) {
      if (callback) callback({ success: false, error: e.message });
    }
  });

  // Trainer starts the quiz
  socket.on('start_quiz', ({ sessionCode }) => {
    const session = sessions.get(sessionCode);
    if (!session) return;

    session.status = 'running';
    session.currentQuestionIndex = 0;
    session.questionState = 'active';
    session.questionStartTime = Date.now();
    session.timeRemaining = session.timerDuration;

    startTimer(session);

    const q = session.questions[0];
    const participantQuestion = {
      index: 0,
      total: session.questions.length,
      id: q.id,
      question: q.question,
      options: q.options,
      difficulty: q.difficulty,
      category: q.category
    };

    const trainerQuestion = {
      index: 0,
      total: session.questions.length,
      ...q
    };

    io.to(session.code).emit('quiz_started', {
      sessionStatus: 'running',
      currentQuestionIndex: 0,
      totalQuestions: session.questions.length,
      timerDuration: session.timerDuration,
      question: participantQuestion
    });

    socket.emit('trainer_question', trainerQuestion);
    socket.to(session.code).emit('participant_question', participantQuestion);
  });

  // Timer runner
  function startTimer(session) {
    if (session.timerInterval) clearInterval(session.timerInterval);
    if (session.timerDuration <= 0) return;

    session.timeRemaining = session.timerDuration;

    session.timerInterval = setInterval(() => {
      if (session.status === 'paused') return;

      session.timeRemaining--;
      io.to(session.code).emit('timer_tick', { timeRemaining: session.timeRemaining });

      if (session.timeRemaining <= 0) {
        clearInterval(session.timerInterval);
        session.timerInterval = null;
        autoCloseQuestion(session);
      }
    }, 1000);
  }

  function autoCloseQuestion(session) {
    session.questionState = 'revealed';
    updateSessionRankings(session);

    const analytics = calculateSessionAnalytics(session);
    const currQA = analytics.questionAnalytics[session.currentQuestionIndex];
    const q = session.questions[session.currentQuestionIndex];

    io.to(session.code).emit('answer_revealed', {
      questionIndex: session.currentQuestionIndex,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      optionDist: currQA.optionDist,
      answeredCount: currQA.answeredCount,
      notAnsweredCount: currQA.notAnsweredCount,
      correctCount: currQA.correctCount,
      accuracyPct: currQA.accuracyPct,
      leaderboard: analytics.leaderboard.slice(0, 10)
    });
  }

  // Participant submits an answer
  socket.on('submit_answer', ({ sessionCode, participantName, participantPhone, questionIndex, selectedOption, responseTimeMs }, callback) => {
    const session = sessions.get(sessionCode);
    if (!session) return callback && callback({ success: false, error: 'Session not found' });

    if (session.questionState !== 'active') {
      return callback && callback({ success: false, error: 'Question is already closed.' });
    }

    const participant = session.participants.find(p => 
      (participantPhone && p.phone === participantPhone) ||
      (p.name.toLowerCase() === (participantName || '').toLowerCase())
    );
    if (!participant) return callback && callback({ success: false, error: 'Participant not found' });

    if (participant.answers[questionIndex] !== undefined) {
      return callback && callback({ success: false, error: 'Answer already submitted.' });
    }

    const q = session.questions[questionIndex];
    const isCorrect = (selectedOption === q.correctAnswer);

    let basePoints = isCorrect ? 100 : 0;
    let speedBonus = 0;

    if (isCorrect && session.speedBonusEnabled && session.timerDuration > 0) {
      const timeUsedSec = Math.min(session.timerDuration, (responseTimeMs || 0) / 1000);
      const remainingRatio = Math.max(0, (session.timerDuration - timeUsedSec) / session.timerDuration);
      speedBonus = Math.round(remainingRatio * 50);
    }

    const pointsEarned = basePoints + speedBonus;
    participant.score += pointsEarned;

    participant.answers[questionIndex] = {
      selectedOption,
      isCorrect,
      responseTimeMs: responseTimeMs || 0,
      pointsEarned,
      basePoints,
      speedBonus
    };

    updateSessionRankings(session);

    let answeredCount = 0;
    session.participants.forEach(p => {
      if (p.answers[questionIndex] !== undefined) answeredCount++;
    });

    io.to(session.code).emit('live_answer_count', {
      questionIndex,
      answeredCount,
      totalParticipants: session.participants.length
    });

    if (callback) {
      callback({
        success: true,
        selectedOption,
        pointsEarned,
        basePoints,
        speedBonus,
        currentScore: participant.score
      });
    }

    if (answeredCount === session.participants.length && session.participants.length > 0) {
      io.to(session.code).emit('all_participants_answered', { questionIndex });
    }
  });

  // Trainer manually reveals the answer
  socket.on('reveal_answer', ({ sessionCode }) => {
    const session = sessions.get(sessionCode);
    if (!session) return;

    if (session.timerInterval) {
      clearInterval(session.timerInterval);
      session.timerInterval = null;
    }

    autoCloseQuestion(session);
  });

  // Trainer shows Leaderboard
  socket.on('show_leaderboard', ({ sessionCode }) => {
    const session = sessions.get(sessionCode);
    if (!session) return;

    updateSessionRankings(session);
    const analytics = calculateSessionAnalytics(session);

    io.to(session.code).emit('display_leaderboard', {
      leaderboard: analytics.leaderboard.slice(0, 10),
      allParticipants: analytics.leaderboard
    });
  });

  // Trainer proceeds to Next Question
  socket.on('next_question', ({ sessionCode }) => {
    const session = sessions.get(sessionCode);
    if (!session) return;

    if (!session.completedQuestions.includes(session.currentQuestionIndex)) {
      session.completedQuestions.push(session.currentQuestionIndex);
    }

    const nextIndex = session.currentQuestionIndex + 1;

    if (nextIndex >= session.questions.length) {
      session.status = 'finished';
      session.questionState = 'closed';
      if (session.timerInterval) clearInterval(session.timerInterval);

      updateSessionRankings(session);
      const finalAnalytics = calculateSessionAnalytics(session);

      console.log(`[Quiz Finished] Session ${sessionCode} completed. Recording in permanent DB...`);

      // Permanently record completed exam in db.json!
      db.recordCompletedExam(sessionCode, session, finalAnalytics);

      io.to(session.code).emit('quiz_finished', {
        analytics: finalAnalytics,
        leaderboard: session.participants.sort((a, b) => b.score - a.score)
      });
    } else {
      session.currentQuestionIndex = nextIndex;
      session.questionState = 'active';
      session.questionStartTime = Date.now();
      session.timeRemaining = session.timerDuration;

      startTimer(session);

      const q = session.questions[nextIndex];
      const participantQuestion = {
        index: nextIndex,
        total: session.questions.length,
        id: q.id,
        question: q.question,
        options: q.options,
        difficulty: q.difficulty,
        category: q.category
      };

      const trainerQuestion = {
        index: nextIndex,
        total: session.questions.length,
        ...q
      };

      io.to(session.code).emit('question_changed', {
        currentQuestionIndex: nextIndex,
        totalQuestions: session.questions.length
      });

      io.to(session.trainerSocketId).emit('trainer_question', trainerQuestion);
      socket.to(session.code).emit('participant_question', participantQuestion);
    }
  });

  // Trainer jumps directly to a specific question
  socket.on('jump_to_question', ({ sessionCode, questionIndex }) => {
    const session = sessions.get(sessionCode);
    if (!session) return;
    if (questionIndex < 0 || questionIndex >= session.questions.length) return;

    session.currentQuestionIndex = questionIndex;
    session.questionState = 'active';
    session.questionStartTime = Date.now();
    session.timeRemaining = session.timerDuration;

    startTimer(session);

    const q = session.questions[questionIndex];
    const participantQuestion = {
      index: questionIndex,
      total: session.questions.length,
      id: q.id,
      question: q.question,
      options: q.options,
      difficulty: q.difficulty,
      category: q.category
    };

    const trainerQuestion = {
      index: questionIndex,
      total: session.questions.length,
      ...q
    };

    io.to(session.code).emit('question_changed', {
      currentQuestionIndex: questionIndex,
      totalQuestions: session.questions.length
    });

    io.to(session.trainerSocketId).emit('trainer_question', trainerQuestion);
    socket.to(session.code).emit('participant_question', participantQuestion);
  });

  // Pause quiz
  socket.on('pause_quiz', ({ sessionCode }) => {
    const session = sessions.get(sessionCode);
    if (!session) return;

    session.status = 'paused';
    io.to(session.code).emit('quiz_paused', { message: 'Quiz paused by trainer.' });
  });

  // Resume quiz
  socket.on('resume_quiz', ({ sessionCode }) => {
    const session = sessions.get(sessionCode);
    if (!session) return;

    session.status = 'running';
    io.to(session.code).emit('quiz_resumed');
  });

  // Reset / Restart session
  socket.on('restart_quiz', ({ sessionCode }) => {
    const session = sessions.get(sessionCode);
    if (!session) return;

    if (session.timerInterval) clearInterval(session.timerInterval);

    session.status = 'ready';
    session.currentQuestionIndex = 0;
    session.questionState = 'active';
    session.completedQuestions = [];

    session.participants.forEach(p => {
      p.score = 0;
      p.previousRank = 1;
      p.currentRank = 1;
      p.rankDelta = 0;
      p.answers = {};
    });

    const participantList = session.participants.map(p => ({ id: p.id, name: p.name, phone: p.phone, score: p.score, rank: p.currentRank, connected: p.connected }));

    io.to(session.code).emit('quiz_restarted', {
      sessionStatus: 'ready',
      participantsCount: session.participants.length,
      participants: participantList
    });
  });

  // Request live session state
  socket.on('get_session_state', ({ sessionCode, participantName, participantPhone, role }, callback) => {
    const code = (sessionCode || '').toUpperCase().trim();
    const session = sessions.get(code);
    if (!session) return callback && callback({ success: false, error: 'Session not active' });

    socket.join(code);

    if (role === 'trainer') {
      session.trainerSocketId = socket.id;
    }

    let participantObj = null;
    if (participantPhone || participantName) {
      const p = session.participants.find(x => 
        (participantPhone && x.phone === participantPhone) ||
        (participantName && x.name.toLowerCase() === participantName.toLowerCase())
      );
      if (p) {
        p.connected = true;
        p.socketId = socket.id;
        participantObj = p;
      }
    }

    const participantList = session.participants.map(p => ({
      id: p.id,
      name: p.name,
      phone: p.phone,
      score: p.score,
      rank: p.currentRank,
      connected: p.connected
    }));

    io.to(code).emit('participants_updated', {
      participants: participantList,
      count: session.participants.length
    });

    const isTrainer = (role === 'trainer' || socket.id === session.trainerSocketId);
    const analytics = calculateSessionAnalytics(session);
    const currQ = session.questions[session.currentQuestionIndex];

    let answeredCount = 0;
    session.participants.forEach(p => {
      if (p.answers[session.currentQuestionIndex] !== undefined) answeredCount++;
    });

    const payload = {
      success: true,
      isTrainer,
      sessionCode: session.code,
      trainerName: session.trainerName,
      status: session.status,
      currentQuestionIndex: session.currentQuestionIndex,
      questionState: session.questionState,
      timeRemaining: session.timeRemaining,
      timerDuration: session.timerDuration,
      speedBonusEnabled: session.speedBonusEnabled,
      showTopic: session.showTopic !== undefined ? session.showTopic : false,
      totalQuestions: session.questions.length,
      participantsCount: session.participants.length,
      participants: participantList,
      completedQuestions: session.completedQuestions,
      liveAnswerCount: {
        answeredCount,
        totalParticipants: session.participants.length
      },
      analytics
    };

    if (currQ) {
      if (isTrainer) {
        payload.currentQuestion = { index: session.currentQuestionIndex, total: session.questions.length, ...currQ };
      } else {
        payload.currentQuestion = {
          index: session.currentQuestionIndex,
          total: session.questions.length,
          id: currQ.id,
          question: currQ.question,
          options: currQ.options,
          difficulty: currQ.difficulty,
          category: currQ.category
        };
      }
    }

    if (participantObj) {
      payload.participant = participantObj;
      const ans = participantObj.answers[session.currentQuestionIndex];
      if (ans) {
        payload.selectedOption = ans.selectedOption;
        payload.isAnswerSubmitted = true;
        payload.lastAnswerResult = ans;
      }
    }

    if (session.questionState === 'revealed' && currQ) {
      const currQA = analytics.questionAnalytics[session.currentQuestionIndex];
      payload.revealData = {
        questionIndex: session.currentQuestionIndex,
        correctAnswer: currQ.correctAnswer,
        explanation: currQ.explanation,
        optionDist: currQA.optionDist,
        answeredCount: currQA.answeredCount,
        notAnsweredCount: currQA.notAnsweredCount,
        correctCount: currQA.correctCount,
        accuracyPct: currQA.accuracyPct,
        leaderboard: analytics.leaderboard.slice(0, 10)
      };
    }

    if (callback) callback(payload);
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    sessions.forEach(session => {
      const p = session.participants.find(x => x.socketId === socket.id);
      if (p) {
        p.connected = false;
        io.to(session.code).emit('participants_updated', {
          participants: session.participants.map(item => ({ id: item.id, name: item.name, phone: item.phone, score: item.score, rank: item.currentRank, connected: item.connected })),
          count: session.participants.length
        });
      }
    });
  });
});

// Serve frontend build if dist folder exists
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`  DIGI WARRIORS LOCAL-FIRST QUIZ ENGINE RUNNING!       `);
  console.log(`  Local URL:        http://localhost:${PORT}           `);
  console.log(`  Wi-Fi/LAN Join:   http://${localIp}:${PORT}          `);
  console.log(`=======================================================`);
});
