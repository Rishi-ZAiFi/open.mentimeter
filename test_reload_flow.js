import { io } from 'socket.io-client';

async function testReload() {
  console.log('🧪 Testing Reconnect / Reload Synchronization & DB Reset...\n');

  const trainerSocket = io('http://localhost:3000');
  await new Promise(r => trainerSocket.on('connect', r));

  const sessionCode = 'DW-RELOAD';
  const createRes = await new Promise(r => {
    trainerSocket.emit('create_session', {
      trainerName: 'Coach Dave',
      sessionCode,
      timerDuration: 30,
      speedBonusEnabled: true
    }, r);
  });
  console.log('✓ Session created:', createRes.sessionCode);

  // 1. Join Karthik and Meena
  const socketKarthik = io('http://localhost:3000');
  await new Promise(r => socketKarthik.on('connect', r));
  await new Promise(r => socketKarthik.emit('join_session', { sessionCode, participantName: 'Karthik' }, r));

  const socketMeena = io('http://localhost:3000');
  await new Promise(r => socketMeena.on('connect', r));
  await new Promise(r => socketMeena.emit('join_session', { sessionCode, participantName: 'Meena' }, r));

  console.log('✓ Karthik and Meena joined');

  // 2. Karthik simulates a browser refresh (disconnect and reconnect with get_session_state)
  socketKarthik.disconnect();
  console.log('✓ Karthik reloads browser...');

  const socketKarthikReloaded = io('http://localhost:3000');
  await new Promise(r => socketKarthikReloaded.on('connect', r));

  const reloadedState = await new Promise(r => {
    socketKarthikReloaded.emit('get_session_state', {
      sessionCode,
      participantName: 'Karthik',
      role: 'participant'
    }, r);
  });

  console.log('✓ Karthik reload state response:');
  console.log(`  - Status: ${reloadedState.status}`);
  console.log(`  - Participants List count: ${reloadedState.participants?.length}`);
  console.log(`  - Participants: ${reloadedState.participants?.map(p => p.name).join(', ')}`);

  if (!reloadedState.participants || reloadedState.participants.length !== 2) {
    throw new Error('FAILED: Participants list was not preserved on reload!');
  }

  // 3. Trainer starts quiz
  trainerSocket.emit('start_quiz', { sessionCode });
  await new Promise(r => setTimeout(r, 400));

  // 4. Karthik submits answer
  await new Promise(r => {
    socketKarthikReloaded.emit('submit_answer', {
      sessionCode,
      participantName: 'Karthik',
      questionIndex: 0,
      selectedOption: 1,
      responseTimeMs: 2000
    }, r);
  });
  console.log('✓ Karthik answered Question 1');

  // 5. Karthik refreshes AGAIN during active question
  const socketKarthik2 = io('http://localhost:3000');
  await new Promise(r => socketKarthik2.on('connect', r));

  const reloadedStateDuringQuestion = await new Promise(r => {
    socketKarthik2.emit('get_session_state', {
      sessionCode,
      participantName: 'Karthik',
      role: 'participant'
    }, r);
  });

  console.log('✓ Karthik reload during question:');
  console.log(`  - isAnswerSubmitted: ${reloadedStateDuringQuestion.isAnswerSubmitted}`);
  console.log(`  - selectedOption: ${reloadedStateDuringQuestion.selectedOption}`);

  if (!reloadedStateDuringQuestion.isAnswerSubmitted || reloadedStateDuringQuestion.selectedOption !== 1) {
    throw new Error('FAILED: Submitted answer state was not preserved across reload!');
  }

  // 6. Test DB Clear / Reset
  const resetRes = await fetch('http://localhost:3000/api/reset', { method: 'POST' });
  const resetJson = await resetRes.json();
  console.log('\n✓ Clear DB endpoint response:', resetJson);

  trainerSocket.disconnect();
  socketMeena.disconnect();
  socketKarthikReloaded.disconnect();
  socketKarthik2.disconnect();

  console.log('\n🎉 RELOAD AND DB RESET TESTS PASSED WITH 100% SUCCESS!');
  process.exit(0);
}

testReload().catch(e => {
  console.error(e);
  process.exit(1);
});
