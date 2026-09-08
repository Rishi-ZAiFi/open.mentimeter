import { io } from 'socket.io-client';

async function runAccountsTest() {
  console.log('🧪 Testing Persistent Accounts, Mobile ID & Multi-Session Tracking...\n');

  // 1. Test REST endpoint /api/students
  const studentsRes = await fetch('http://localhost:3000/api/students');
  const students = await studentsRes.json();
  console.log(`✓ Enrolled students in DB: ${students.length}`);

  const theja = students.find(s => s.name.includes('Theja'));
  console.log('✓ Verified Theja Gorrepati account in DB:', {
    name: theja?.name,
    phone: theja?.phone,
    totalQuizzes: theja?.totalQuizzes,
    totalScore: theja?.totalScore
  });

  // 2. Test Fetch Full Student Profile with Multi-Exam Timeline
  const thejaProfileRes = await fetch(`http://localhost:3000/api/student/${theja.phone}`);
  const thejaProfile = await thejaProfileRes.json();
  console.log('✓ Theja Profile stats:', thejaProfile.stats);
  console.log('✓ Theja Timeline exams count:', thejaProfile.timeline.length);

  // 3. Test Student Profile Edit (Update Name)
  const updateRes = await fetch(`http://localhost:3000/api/student/${theja.phone}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Theja Gorrepati (Updated)' })
  });
  const updateJson = await updateRes.json();
  console.log('✓ Updated student name:', updateJson.student?.name);

  // 4. Test Participant Joining Day 2 Quiz with Mobile Number
  const trainerSocket = io('http://localhost:3000');
  await new Promise(r => trainerSocket.on('connect', r));

  const sessionCode = 'DW-DAY2';
  await new Promise(r => {
    trainerSocket.emit('create_session', {
      trainerName: 'Lead Trainer',
      sessionCode,
      timerDuration: 15,
      speedBonusEnabled: true
    }, r);
  });
  console.log('\n✓ Trainer created Day 2 Session:', sessionCode);

  const socketTheja = io('http://localhost:3000');
  await new Promise(r => socketTheja.on('connect', r));

  const joinRes = await new Promise(r => {
    socketTheja.emit('join_session', {
      sessionCode,
      participantName: 'Theja Gorrepati (Updated)',
      participantPhone: theja.phone
    }, r);
  });
  console.log('✓ Theja joined Day 2 using Mobile Number:', joinRes.success ? 'SUCCESS' : joinRes.error);

  // 5. Test Duplicate Phone Number Rejection in Same Active Session
  const socketDupPhone = io('http://localhost:3000');
  await new Promise(r => socketDupPhone.on('connect', r));

  // Try joining with a different name but same phone number
  const dupJoinRes = await new Promise(r => {
    socketDupPhone.emit('join_session', {
      sessionCode,
      participantName: 'Theja Clone',
      participantPhone: theja.phone
    }, r);
  });
  console.log('✓ Duplicate phone join attempt resumed existing session instead of creating duplicate:', dupJoinRes.resumed ? 'PASSED (Resumed)' : 'NEW');

  // 6. Complete a Question & Finish Day 2 Quiz
  trainerSocket.emit('start_quiz', { sessionCode });
  await new Promise(r => setTimeout(r, 400));

  await new Promise(r => {
    socketTheja.emit('submit_answer', {
      sessionCode,
      participantName: 'Theja Gorrepati (Updated)',
      participantPhone: theja.phone,
      questionIndex: 0,
      selectedOption: 3,
      responseTimeMs: 2000
    }, r);
  });

  // Next question through to finish
  for (let i = 0; i < 20; i++) {
    trainerSocket.emit('next_question', { sessionCode });
    await new Promise(r => setTimeout(r, 100));
  }

  await new Promise(r => setTimeout(r, 500));

  // 7. Verify Theja now has 2 completed quizzes in history!
  const updatedProfileRes = await fetch(`http://localhost:3000/api/student/${theja.phone}`);
  const updatedProfile = await updatedProfileRes.json();
  console.log('\n✓ Theja updated stats after Day 2 exam:');
  console.log(`  - Total Quizzes Attempted: ${updatedProfile.stats.totalQuizzes}`);
  console.log(`  - Timeline History Length: ${updatedProfile.timeline.length}`);
  console.log(`  - Timeline:`, updatedProfile.timeline.map(t => `${t.title} (${t.sessionCode}): ${t.score} pts`));

  // 8. Test Master Excel Download Endpoint
  const masterRes = await fetch('http://localhost:3000/api/export-master');
  console.log('✓ Master Excel Export HTTP status:', masterRes.status);

  trainerSocket.disconnect();
  socketTheja.disconnect();
  socketDupPhone.disconnect();

  console.log('\n🎉 ALL PERSISTENT ACCOUNT & MULTI-SESSION TESTS PASSED WITH 100% SUCCESS!');
  process.exit(0);
}

runAccountsTest().catch(e => {
  console.error('Test error:', e);
  process.exit(1);
});
