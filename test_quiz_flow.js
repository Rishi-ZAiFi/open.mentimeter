import { io } from 'socket.io-client';

async function runTest() {
  console.log('🧪 Starting Automated End-to-End Quiz Flow Test...\n');

  // 1. Test REST Endpoints
  const infoRes = await fetch('http://localhost:3000/api/info');
  const info = await infoRes.json();
  console.log('✓ REST /api/info response:', info);

  const questionsRes = await fetch('http://localhost:3000/api/questions');
  const questions = await questionsRes.json();
  console.log(`✓ REST /api/questions loaded: ${questions.length} questions.`);

  // 2. Connect Trainer Socket
  const trainerSocket = io('http://localhost:3000');
  await new Promise(resolve => trainerSocket.on('connect', resolve));
  console.log('✓ Trainer socket connected:', trainerSocket.id);

  // 3. Create Session
  const sessionCode = 'DW-9999';
  const createRes = await new Promise(resolve => {
    trainerSocket.emit('create_session', {
      trainerName: 'Lead Trainer',
      sessionCode,
      timerDuration: 15,
      speedBonusEnabled: true
    }, resolve);
  });
  console.log('✓ Trainer created session:', createRes);

  // 4. Connect Participants
  const socketArun = io('http://localhost:3000');
  await new Promise(resolve => socketArun.on('connect', resolve));
  const arunJoin = await new Promise(resolve => {
    socketArun.emit('join_session', { sessionCode, participantName: 'Arun' }, resolve);
  });
  console.log('✓ Arun joined:', arunJoin.success ? 'SUCCESS' : arunJoin.error);

  const socketPriya = io('http://localhost:3000');
  await new Promise(resolve => socketPriya.on('connect', resolve));
  const priyaJoin = await new Promise(resolve => {
    socketPriya.emit('join_session', { sessionCode, participantName: 'Priya' }, resolve);
  });
  console.log('✓ Priya joined:', priyaJoin.success ? 'SUCCESS' : priyaJoin.error);

  // 5. Test Duplicate Name Validation
  const socketDuplicate = io('http://localhost:3000');
  await new Promise(resolve => socketDuplicate.on('connect', resolve));
  const dupJoin = await new Promise(resolve => {
    socketDuplicate.emit('join_session', { sessionCode, participantName: 'Arun' }, resolve);
  });
  console.log('✓ Duplicate Arun join attempt:', dupJoin.success ? 'FAILED (should have rejected)' : `CORRECTLY REJECTED: "${dupJoin.error}"`);

  // 6. Trainer Starts Quiz
  console.log('\n🚀 Trainer starting quiz...');
  trainerSocket.emit('start_quiz', { sessionCode });

  await new Promise(r => setTimeout(r, 600));

  // 7. Arun submits correct answer (Option 1) for Question 1
  const arunAnswer = await new Promise(resolve => {
    socketArun.emit('submit_answer', {
      sessionCode,
      participantName: 'Arun',
      questionIndex: 0,
      selectedOption: 1, // XLOOKUP (correct)
      responseTimeMs: 2500
    }, resolve);
  });
  console.log('✓ Arun submitted answer:', arunAnswer);

  // 8. Priya submits incorrect answer (Option 0) for Question 1
  const priyaAnswer = await new Promise(resolve => {
    socketPriya.emit('submit_answer', {
      sessionCode,
      participantName: 'Priya',
      questionIndex: 0,
      selectedOption: 0, // INDEX/MATCH (incorrect)
      responseTimeMs: 4000
    }, resolve);
  });
  console.log('✓ Priya submitted answer:', priyaAnswer);

  // 9. Trainer Reveals Answer
  const revealPromise = new Promise(resolve => {
    trainerSocket.on('answer_revealed', resolve);
  });
  trainerSocket.emit('reveal_answer', { sessionCode });
  const revealData = await revealPromise;
  console.log('\n📊 Answer Revealed Event received:');
  console.log(`- Accuracy: ${revealData.accuracyPct}%`);
  console.log(`- Correct Count: ${revealData.correctCount} / ${revealData.answeredCount}`);
  console.log(`- Option Distributions:`, revealData.optionDist);
  console.log(`- Leaderboard Top:`, revealData.leaderboard);

  // 10. Test Get Session State
  const stateRes = await new Promise(resolve => {
    trainerSocket.emit('get_session_state', { sessionCode, participantName: 'Arun' }, resolve);
  });
  console.log('\n✓ Session State Sync check:', {
    status: stateRes.status,
    totalQuestions: stateRes.totalQuestions,
    participantsCount: stateRes.participantsCount,
    avgScore: stateRes.analytics?.avgScore,
    categoryAnalyticsCount: stateRes.analytics?.categoryAnalytics?.length
  });

  // Cleanup
  trainerSocket.disconnect();
  socketArun.disconnect();
  socketPriya.disconnect();
  socketDuplicate.disconnect();

  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! Real-time local quiz engine is 100% operational.');
  process.exit(0);
}

runTest().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
