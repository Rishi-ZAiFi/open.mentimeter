/**
 * Generates and triggers download of CSV files for Quiz Results
 */

export function exportParticipantsCsv(sessionCode, leaderboard = [], questionsCount = 20) {
  if (!leaderboard || leaderboard.length === 0) {
    alert('No participant data available to export.');
    return;
  }

  const headers = [
    'Rank',
    'Participant Name',
    'Total Score',
    'Accuracy (%)',
    'Questions Answered',
    'Total Questions',
    'Correct Answers',
    'Incorrect Answers',
    'Unanswered',
    'Avg Response Time (sec)'
  ];

  const rows = leaderboard.map((p, idx) => {
    const answersObj = p.answers || {};
    const answersList = Object.values(answersObj);
    const answeredCount = answersList.length;
    const correctCount = answersList.filter(a => a.isCorrect).length;
    const incorrectCount = answeredCount - correctCount;
    const unansweredCount = Math.max(0, questionsCount - answeredCount);
    const accuracy = questionsCount > 0 ? Math.round((correctCount / questionsCount) * 100) : 0;
    
    const times = answersList.map(a => a.responseTimeMs || 0).filter(t => t > 0);
    const avgResponseTimeSec = times.length > 0 
      ? (times.reduce((a, b) => a + b, 0) / times.length / 1000).toFixed(2)
      : '0.00';

    return [
      p.currentRank || (idx + 1),
      `"${(p.name || '').replace(/"/g, '""')}"`,
      p.score || 0,
      `${accuracy}%`,
      answeredCount,
      questionsCount,
      correctCount,
      incorrectCount,
      unansweredCount,
      avgResponseTimeSec
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `DigiWarriors_${sessionCode || 'Quiz'}_Participants_Summary.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportQuestionsCsv(sessionCode, questionAnalytics = []) {
  if (!questionAnalytics || questionAnalytics.length === 0) {
    alert('No question analytics available to export.');
    return;
  }

  const headers = [
    'Question #',
    'Question Text',
    'Category',
    'Difficulty',
    'Correct Answer Option',
    'Accuracy (%)',
    'Correct Count',
    'Incorrect Count',
    'Not Answered',
    'Option A (%)',
    'Option B (%)',
    'Option C (%)',
    'Option D (%)',
    'Avg Response Time (sec)',
    'Explanation'
  ];

  const optionLetters = ['A', 'B', 'C', 'D'];

  const rows = questionAnalytics.map((q, idx) => {
    const qNum = idx + 1;
    const correctLetter = optionLetters[q.correctAnswer] || 'A';
    const optDist = q.optionDist || [];
    const optA = optDist[0] ? `${optDist[0].pct}% (${optDist[0].count})` : '0%';
    const optB = optDist[1] ? `${optDist[1].pct}% (${optDist[1].count})` : '0%';
    const optC = optDist[2] ? `${optDist[2].pct}% (${optDist[2].count})` : '0%';
    const optD = optDist[3] ? `${optDist[3].pct}% (${optDist[3].count})` : '0%';
    const avgSec = q.avgResponseTimeMs ? (q.avgResponseTimeMs / 1000).toFixed(2) : '0.00';

    return [
      qNum,
      `"${(q.question || '').replace(/"/g, '""')}"`,
      `"${(q.category || 'General').replace(/"/g, '""')}"`,
      `"${q.difficulty || 'Medium'}"`,
      correctLetter,
      `${q.accuracyPct || 0}%`,
      q.correctCount || 0,
      q.incorrectCount || 0,
      q.notAnsweredCount || 0,
      `"${optA}"`,
      `"${optB}"`,
      `"${optC}"`,
      `"${optD}"`,
      avgSec,
      `"${(q.explanation || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `DigiWarriors_${sessionCode || 'Quiz'}_Questions_Breakdown.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
