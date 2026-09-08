import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

// Default initial database schema
const defaultDb = {
  students: [],
  sessions: [],
  examResults: []
};

class Database {
  constructor() {
    this.data = defaultDb;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf8');
        this.data = JSON.parse(raw);
      } else {
        this.data = defaultDb;
        this.seedDay1Data();
        this.save();
      }
    } catch (e) {
      console.error('Error loading database, initializing new db:', e);
      this.data = defaultDb;
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving database:', e);
    }
  }

  // Pre-seed Day 1 examination (Session DW-7764) participants so history is immediately available
  seedDay1Data() {
    const day1Students = [
      { name: "Theja Gorrepati", score: 2647, accuracy: 95, correct: 19, rank: 1, phone: "9876500001" },
      { name: "Charishma Barla", score: 2638, accuracy: 95, correct: 19, rank: 2, phone: "9876500002" },
      { name: "Velmurugan", score: 2593, accuracy: 100, correct: 20, rank: 3, phone: "9876500003" },
      { name: "Avinash.G", score: 2579, accuracy: 95, correct: 19, rank: 4, phone: "9876500004" },
      { name: "Anumandhiram", score: 2576, accuracy: 100, correct: 20, rank: 5, phone: "9876500005" },
      { name: "Shri Darshan C", score: 2565, accuracy: 95, correct: 19, rank: 6, phone: "9876500006" },
      { name: "PRADEEPA P", score: 2553, accuracy: 100, correct: 20, rank: 7, phone: "9876500007" },
      { name: "Thirumoorithy. P", score: 2516, accuracy: 95, correct: 19, rank: 8, phone: "9876500008" },
      { name: "D Premkumar", score: 2485, accuracy: 95, correct: 19, rank: 9, phone: "9876500009" },
      { name: "T. Nishanthkumar", score: 2484, accuracy: 95, correct: 19, rank: 10, phone: "9876500010" },
      { name: "Suresh R", score: 2478, accuracy: 95, correct: 19, rank: 11, phone: "9876500011" },
      { name: "S.Naveen Abishek", score: 2379, accuracy: 90, correct: 18, rank: 12, phone: "9876500012" },
      { name: "Abhishek V", score: 2278, accuracy: 85, correct: 17, rank: 13, phone: "9876500013" },
      { name: "Anil Kumar", score: 2246, accuracy: 85, correct: 17, rank: 14, phone: "9876500014" },
      { name: "ROHIT", score: 2245, accuracy: 85, correct: 17, rank: 15, phone: "9876500015" },
      { name: "Parameswaran", score: 2229, accuracy: 85, correct: 17, rank: 16, phone: "9876500016" },
      { name: "Bhavesh patni", score: 2187, accuracy: 85, correct: 17, rank: 17, phone: "9876500017" },
      { name: "Natarajan PM", score: 2175, accuracy: 85, correct: 17, rank: 18, phone: "9876500018" },
      { name: "Saravana Kumar T", score: 2076, accuracy: 80, correct: 16, rank: 19, phone: "9876500019" },
      { name: "Sundar", score: 2026, accuracy: 75, correct: 15, rank: 20, phone: "9876500020" },
      { name: "Venkadesh", score: 2011, accuracy: 85, correct: 17, rank: 21, phone: "9876500021" },
      { name: "Sabarinathan", score: 1933, accuracy: 70, correct: 14, rank: 22, phone: "9876500022" }
    ];

    const sessionRecord = {
      id: "sess-DW-7764",
      code: "DW-7764",
      title: "Course 1 — Day 1 Assessment",
      trainerName: "Rishi Bharathi B T",
      date: new Date().toISOString().split('T')[0],
      totalQuestions: 20,
      totalParticipants: 22,
      avgScore: 2359,
      avgAccuracy: 90
    };
    this.data.sessions.push(sessionRecord);

    day1Students.forEach((st, idx) => {
      const studentId = `stu-${1000 + idx}`;
      const examRecord = {
        id: `res-DW-7764-${idx + 1}`,
        studentId,
        studentPhone: st.phone,
        studentName: st.name,
        sessionCode: "DW-7764",
        quizTitle: "Course 1 — Day 1 Assessment",
        date: sessionRecord.date,
        totalQuestions: 20,
        correctAnswers: st.correct,
        score: st.score,
        accuracy: st.accuracy,
        rank: st.rank
      };

      this.data.examResults.push(examRecord);

      const studentObj = {
        id: studentId,
        phone: st.phone,
        name: st.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalQuizzes: 1,
        totalScore: st.score,
        avgAccuracy: st.accuracy,
        history: [examRecord]
      };

      this.data.students.push(studentObj);
    });
  }

  // --- Student Operations ---
  findStudentByPhone(phone) {
    if (!phone) return null;
    const cleanPhone = phone.replace(/\D/g, '');
    return this.data.students.find(s => s.phone.replace(/\D/g, '') === cleanPhone) || null;
  }

  findStudentByName(name) {
    if (!name) return null;
    return this.data.students.find(s => s.name.toLowerCase().trim() === name.toLowerCase().trim()) || null;
  }

  createOrUpdateStudent(phone, name) {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const cleanName = (name || '').trim();

    let student = this.findStudentByPhone(cleanPhone);
    if (!student && cleanName) {
      // Check if student exists by name without phone
      student = this.findStudentByName(cleanName);
      if (student && !student.phone) {
        student.phone = cleanPhone;
      }
    }

    if (!student) {
      student = {
        id: `stu-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        phone: cleanPhone,
        name: cleanName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalQuizzes: 0,
        totalScore: 0,
        avgAccuracy: 0,
        history: []
      };
      this.data.students.push(student);
    } else {
      if (cleanName && student.name !== cleanName) {
        student.name = cleanName;
        student.updatedAt = new Date().toISOString();
      }
      if (cleanPhone && (!student.phone || student.phone.length < 5)) {
        student.phone = cleanPhone;
      }
    }

    this.save();
    return student;
  }

  updateStudentProfile(phoneOrId, { name, phone, department, bio }) {
    let student = this.data.students.find(s => s.id === phoneOrId || s.phone === phoneOrId);
    if (!student) return null;

    if (name) student.name = name.trim();
    if (phone) student.phone = phone.replace(/\D/g, '');
    if (department !== undefined) student.department = department;
    if (bio !== undefined) student.bio = bio;
    student.updatedAt = new Date().toISOString();

    // Update studentName across their exam results
    this.data.examResults.forEach(er => {
      if (er.studentId === student.id || er.studentPhone === student.phone) {
        if (name) er.studentName = name.trim();
      }
    });

    this.save();
    return student;
  }

  getAllStudents() {
    return this.data.students.map(s => {
      const studentExams = this.data.examResults.filter(er => er.studentId === s.id || er.studentPhone === s.phone);
      const totalScore = studentExams.reduce((sum, e) => sum + (e.score || 0), 0);
      const avgAcc = studentExams.length > 0 ? Math.round(studentExams.reduce((sum, e) => sum + (e.accuracy || 0), 0) / studentExams.length) : 0;

      return {
        id: s.id,
        phone: s.phone,
        name: s.name,
        totalQuizzes: studentExams.length,
        totalScore,
        avgAccuracy: avgAcc,
        lastExamDate: studentExams.length > 0 ? studentExams[studentExams.length - 1].date : null,
        history: studentExams
      };
    });
  }

  getStudentFullProfile(phoneOrId) {
    let student = this.data.students.find(s => s.id === phoneOrId || s.phone === phoneOrId);
    if (!student && phoneOrId) {
      const clean = String(phoneOrId).replace(/\D/g, '');
      student = this.data.students.find(s => s.phone.replace(/\D/g, '') === clean);
    }
    if (!student) return null;

    const studentExams = this.data.examResults.filter(er => er.studentId === student.id || er.studentPhone === student.phone);
    const totalScore = studentExams.reduce((sum, e) => sum + (e.score || 0), 0);
    const avgAccuracy = studentExams.length > 0 ? Math.round(studentExams.reduce((sum, e) => sum + (e.accuracy || 0), 0) / studentExams.length) : 0;

    // Build timeline progression data for charts
    const timelineData = studentExams.map((ex, idx) => ({
      examIndex: idx + 1,
      title: ex.quizTitle || `Quiz ${idx + 1}`,
      sessionCode: ex.sessionCode,
      date: ex.date,
      score: ex.score,
      accuracy: ex.accuracy,
      rank: ex.rank,
      totalQuestions: ex.totalQuestions
    }));

    // Aggregate category performance across all exams
    const categoryAgg = {};
    studentExams.forEach(ex => {
      if (Array.isArray(ex.answersDetail)) {
        ex.answersDetail.forEach(ans => {
          const cat = ans.category || 'General';
          if (!categoryAgg[cat]) {
            categoryAgg[cat] = { category: cat, totalAttempts: 0, correctCount: 0 };
          }
          categoryAgg[cat].totalAttempts++;
          if (ans.isCorrect) categoryAgg[cat].correctCount++;
        });
      }
    });

    const categoryPerformance = Object.values(categoryAgg).map(c => ({
      category: c.category,
      accuracy: c.totalAttempts > 0 ? Math.round((c.correctCount / c.totalAttempts) * 100) : 0,
      totalAttempts: c.totalAttempts
    }));

    return {
      student: {
        id: student.id,
        phone: student.phone,
        name: student.name,
        department: student.department || '',
        createdAt: student.createdAt,
        updatedAt: student.updatedAt
      },
      stats: {
        totalQuizzes: studentExams.length,
        totalScore,
        avgAccuracy,
        bestRank: studentExams.length > 0 ? Math.min(...studentExams.map(e => e.rank || 99)) : null
      },
      timeline: timelineData,
      categoryPerformance,
      examHistory: studentExams
    };
  }

  // --- Session & Exam Result Operations ---
  recordCompletedExam(sessionCode, sessionData, analytics) {
    const sessionRecord = {
      id: `sess-${sessionCode}-${Date.now()}`,
      code: sessionCode,
      title: sessionData.title || "Digi Warriors Technical Assessment",
      trainerName: sessionData.trainerName || "Trainer",
      date: new Date().toISOString().split('T')[0],
      totalQuestions: sessionData.questions?.length || 20,
      totalParticipants: sessionData.participants?.length || 0,
      avgScore: analytics?.avgScore || 0,
      avgAccuracy: analytics?.avgAccuracy || 0
    };

    this.data.sessions.push(sessionRecord);

    const questionsList = sessionData.questions || [];

    sessionData.participants.forEach((p, idx) => {
      let student = this.findStudentByPhone(p.phone) || this.findStudentByName(p.name);
      if (!student) {
        student = this.createOrUpdateStudent(p.phone || `98765${Math.floor(10000 + Math.random() * 90000)}`, p.name);
      }

      const answersObj = p.answers || {};
      const answeredCount = Object.keys(answersObj).length;
      const correctCount = Object.values(answersObj).filter(a => a.isCorrect).length;
      const accuracy = sessionRecord.totalQuestions > 0 ? Math.round((correctCount / sessionRecord.totalQuestions) * 100) : 0;

      const detailedAnswers = Object.entries(answersObj).map(([qIdx, ans]) => {
        const q = questionsList[Number(qIdx)] || {};
        return {
          questionIndex: Number(qIdx),
          questionId: q.id,
          question: q.question,
          category: q.category || 'General',
          selectedOption: ans.selectedOption,
          isCorrect: ans.isCorrect,
          pointsEarned: ans.pointsEarned,
          responseTimeMs: ans.responseTimeMs
        };
      });

      const examRecord = {
        id: `res-${sessionCode}-${student.id}-${Date.now()}`,
        studentId: student.id,
        studentPhone: student.phone || p.phone,
        studentName: student.name,
        sessionCode: sessionCode,
        quizTitle: sessionRecord.title,
        date: sessionRecord.date,
        totalQuestions: sessionRecord.totalQuestions,
        correctAnswers: correctCount,
        score: p.score,
        accuracy,
        rank: p.currentRank || (idx + 1),
        answersDetail: detailedAnswers
      };

      this.data.examResults.push(examRecord);
    });

    this.save();
    console.log(`[DB] Saved completed exam session ${sessionCode} with ${sessionData.participants.length} participant records.`);
  }
}

export const db = new Database();
