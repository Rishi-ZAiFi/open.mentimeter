import { io } from 'socket.io-client';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

async function generateExamExcel() {
  console.log('📊 Connecting to live server to extract exam results for DW-7764...');

  const socket = io('http://localhost:3000');
  await new Promise(resolve => socket.on('connect', resolve));
  console.log('✓ Connected to server with socket ID:', socket.id);

  const sessionCode = 'DW-7764';

  const sessionState = await new Promise((resolve) => {
    socket.emit('get_session_state', { sessionCode, role: 'trainer' }, resolve);
  });

  if (!sessionState || !sessionState.success) {
    console.error('Failed to get session state:', sessionState);
    process.exit(1);
  }

  const { trainerName, totalQuestions, participants, analytics } = sessionState;
  const questionAnalytics = analytics?.questionAnalytics || [];
  const categoryAnalytics = analytics?.categoryAnalytics || [];
  const leaderboard = analytics?.leaderboard || [];

  console.log(`✓ Retrieved session state: Trainer "${trainerName}", ${participants.length} participants, ${totalQuestions} questions.`);

  const optionLetters = ['A', 'B', 'C', 'D'];

  // ==========================================
  // SHEET 1: PARTICIPANT MARKS & RANKINGS
  // ==========================================
  const sheet1Data = leaderboard.map((p, idx) => {
    const answersObj = p.answers || {};
    const answersList = Object.values(answersObj);
    const answeredCount = answersList.length;
    const correctCount = answersList.filter(a => a.isCorrect).length;
    const incorrectCount = answeredCount - correctCount;
    const unansweredCount = Math.max(0, totalQuestions - answeredCount);
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    
    let totalBase = 0;
    let totalSpeed = 0;
    const times = [];

    answersList.forEach(a => {
      totalBase += (a.basePoints || (a.isCorrect ? 100 : 0));
      totalSpeed += (a.speedBonus || 0);
      if (a.responseTimeMs) times.push(a.responseTimeMs);
    });

    const avgTimeSec = times.length > 0 ? (times.reduce((a, b) => a + b, 0) / times.length / 1000).toFixed(2) : '0.00';

    return {
      'Rank': p.currentRank || (idx + 1),
      'Participant Name': p.name,
      'Total Score (Marks)': p.score || 0,
      'Accuracy (%)': `${accuracy}%`,
      'Correct Answers': correctCount,
      'Incorrect Answers': incorrectCount,
      'Unanswered': unansweredCount,
      'Base Score': totalBase,
      'Speed Bonus': totalSpeed,
      'Avg Response Time (s)': Number(avgTimeSec),
      'Total Questions': totalQuestions
    };
  });

  // ==========================================
  // SHEET 2: EXAM QUESTIONS & ANSWER KEY
  // ==========================================
  const sheet2Data = questionAnalytics.map((q, idx) => {
    const qNum = idx + 1;
    const correctLetter = optionLetters[q.correctAnswer] || 'A';
    const optDist = q.optionDist || [];
    const optA = optDist[0] ? `${optDist[0].pct}% (${optDist[0].count})` : '0%';
    const optB = optDist[1] ? `${optDist[1].pct}% (${optDist[1].count})` : '0%';
    const optC = optDist[2] ? `${optDist[2].pct}% (${optDist[2].count})` : '0%';
    const optD = optDist[3] ? `${optDist[3].pct}% (${optDist[3].count})` : '0%';
    const avgSec = q.avgResponseTimeMs ? (q.avgResponseTimeMs / 1000).toFixed(2) : '0.00';

    return {
      'Question #': qNum,
      'Question Text': q.question,
      'Category': q.category || 'General',
      'Difficulty': q.difficulty || 'Medium',
      'Correct Option': correctLetter,
      'Correct Answer Text': q.options ? q.options[q.correctAnswer] : '',
      'Class Accuracy (%)': `${q.accuracyPct || 0}%`,
      'Correct Count': q.correctCount || 0,
      'Incorrect Count': q.incorrectCount || 0,
      'Option A %': optA,
      'Option B %': optB,
      'Option C %': optC,
      'Option D %': optD,
      'Avg Time (s)': Number(avgSec),
      'Explanation & Learning Notes': q.explanation || ''
    };
  });

  // ==========================================
  // SHEET 3: PARTICIPANT ANSWERS MATRIX (Q1 to Q20)
  // ==========================================
  const sheet3Data = leaderboard.map((p, idx) => {
    const row = {
      'Rank': p.currentRank || (idx + 1),
      'Participant Name': p.name,
      'Total Marks': p.score || 0
    };

    for (let qIdx = 0; qIdx < totalQuestions; qIdx++) {
      const ans = p.answers ? p.answers[qIdx] : null;
      if (ans && ans.selectedOption !== null && ans.selectedOption !== undefined) {
        const letter = optionLetters[ans.selectedOption] || '-';
        const mark = ans.isCorrect ? `✓ (${letter})` : `✗ (${letter})`;
        row[`Q${qIdx + 1}`] = mark;
      } else {
        row[`Q${qIdx + 1}`] = '- (Unanswered)';
      }
    }

    return row;
  });

  // ==========================================
  // SHEET 4: CATEGORY PERFORMANCE ANALYSIS
  // ==========================================
  const sheet4Data = categoryAnalytics.map(c => ({
    'Category Name': c.category,
    'Total Questions in Category': c.totalQuestions,
    'Cohort Accuracy (%)': `${c.accuracyPct}%`,
    'Cohort Mastery Level': c.accuracyPct >= 80 ? 'Mastered (High)' : c.accuracyPct >= 65 ? 'Proficient (Good)' : 'Needs Improvement'
  }));

  // Create Excel Workbook
  const workbook = XLSX.utils.book_new();

  const ws1 = XLSX.utils.json_to_sheet(sheet1Data);
  const ws2 = XLSX.utils.json_to_sheet(sheet2Data);
  const ws3 = XLSX.utils.json_to_sheet(sheet3Data);
  const ws4 = XLSX.utils.json_to_sheet(sheet4Data);

  // Set column widths
  ws1['!cols'] = [{ wch: 6 }, { wch: 25 }, { wch: 18 }, { wch: 14 }, { wch: 15 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 15 }];
  ws2['!cols'] = [{ wch: 10 }, { wch: 60 }, { wch: 18 }, { wch: 12 }, { wch: 14 }, { wch: 35 }, { wch: 16 }, { wch: 14 }, { wch: 15 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 60 }];
  ws3['!cols'] = [{ wch: 6 }, { wch: 25 }, { wch: 12 }, ...Array(totalQuestions).fill({ wch: 10 })];
  ws4['!cols'] = [{ wch: 25 }, { wch: 28 }, { wch: 20 }, { wch: 22 }];

  XLSX.utils.book_append_sheet(workbook, ws1, 'Participant Marks & Rankings');
  XLSX.utils.book_append_sheet(workbook, ws2, 'Exam Questions & Answer Key');
  XLSX.utils.book_append_sheet(workbook, ws3, 'Student Response Matrix');
  XLSX.utils.book_append_sheet(workbook, ws4, 'Category Analysis');

  const fileName = `Digi_Warriors_Exam_Results_${sessionCode}.xlsx`;
  const filePath = path.join(process.cwd(), fileName);

  XLSX.writeFile(workbook, filePath);
  console.log(`\n🎉 EXCEL WORKBOOK GENERATED SUCCESSFULLY!\nSaved to: ${filePath}`);

  // Also save CSV copies
  const csvParticipants = XLSX.utils.sheet_to_csv(ws1);
  fs.writeFileSync(path.join(process.cwd(), `Digi_Warriors_Marks_${sessionCode}.csv`), csvParticipants);

  const csvQuestions = XLSX.utils.sheet_to_csv(ws2);
  fs.writeFileSync(path.join(process.cwd(), `Digi_Warriors_Questions_${sessionCode}.csv`), csvQuestions);

  const csvMatrix = XLSX.utils.sheet_to_csv(ws3);
  fs.writeFileSync(path.join(process.cwd(), `Digi_Warriors_Student_Responses_${sessionCode}.csv`), csvMatrix);

  console.log('✓ CSV reports also exported for quick preview.');

  socket.disconnect();
  process.exit(0);
}

generateExamExcel().catch(err => {
  console.error('Export error:', err);
  process.exit(1);
});
