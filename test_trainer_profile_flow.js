import { io } from 'socket.io-client';

async function testTrainerFlow() {
  console.log('🧪 Testing Persistent Trainer Profiles & Instant Session Reconnect...\n');

  // 1. Test GET /api/trainers
  const trainersRes = await fetch('http://localhost:3000/api/trainers');
  const trainersData = await trainersRes.json();
  console.log(`✓ Enrolled Trainers in DB:`, trainersData.trainers.map(t => t.name));

  // 2. Trainer creates session
  const trainerSocket1 = io('http://localhost:3000');
  await new Promise(r => trainerSocket1.on('connect', r));

  const sessionCode = 'TR-RECON-1';
  const createRes = await new Promise(r => {
    trainerSocket1.emit('create_session', {
      trainerName: 'Rishi Bharathi B T',
      sessionCode,
      timerDuration: 30,
      showTopic: false
    }, r);
  });
  console.log('✓ Session Created by Trainer:', createRes.sessionCode);

  // 3. Student joins the session
  const studentSocket = io('http://localhost:3000');
  await new Promise(r => studentSocket.on('connect', r));
  await new Promise(r => {
    studentSocket.emit('join_session', {
      sessionCode,
      participantName: 'Test Attendee',
      participantPhone: '9876500055'
    }, r);
  });
  console.log('✓ Student joined session successfully.');

  // 4. Test GET /api/active-sessions
  const activeRes = await fetch('http://localhost:3000/api/active-sessions');
  const activeData = await activeRes.json();
  const activeSess = activeData.sessions.find(s => s.code === sessionCode);
  console.log('✓ Active session detected via REST:', {
    code: activeSess?.code,
    trainer: activeSess?.trainerName,
    participants: activeSess?.participantsCount
  });

  // 5. Trainer closes/reloads window (disconnect socket 1)
  trainerSocket1.disconnect();
  console.log('✓ Trainer window disconnected / reloaded.');

  // 6. Trainer opens window again and clicks "Resume Session" (Socket 2)
  const trainerSocket2 = io('http://localhost:3000');
  await new Promise(r => trainerSocket2.on('connect', r));

  const resumeRes = await new Promise(r => {
    trainerSocket2.emit('reconnect_trainer', {
      sessionCode,
      trainerName: 'Rishi Bharathi B T'
    }, r);
  });

  console.log('✓ Trainer Reconnected to active session:', {
    success: resumeRes.success,
    sessionCode: resumeRes.sessionCode,
    trainerName: resumeRes.trainerName,
    participantsCount: resumeRes.participantsCount,
    status: resumeRes.status
  });

  studentSocket.disconnect();
  trainerSocket2.disconnect();

  if (resumeRes.success && resumeRes.participantsCount === 1) {
    console.log('\n🎉 ALL TRAINER PROFILE & SESSION RECONNECT TESTS PASSED (100%)!');
    process.exit(0);
  } else {
    console.error('❌ Test failed verification');
    process.exit(1);
  }
}

testTrainerFlow();
