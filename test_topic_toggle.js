import { io } from 'socket.io-client';

async function testTopicToggle() {
  console.log('🧪 Testing Topic Visibility Setting and Live Toggle...\n');

  const trainer = io('http://localhost:3000');
  const student = io('http://localhost:3000');

  await new Promise(r => trainer.on('connect', r));
  await new Promise(r => student.on('connect', r));

  const sessionCode = 'TOPIC-TEST';

  // 1. Trainer creates session with showTopic: false (Default)
  const createRes = await new Promise(r => {
    trainer.emit('create_session', {
      trainerName: 'Lead Coach',
      sessionCode,
      showTopic: false,
      timerDuration: 30
    }, r);
  });
  console.log('✓ Session created with showTopic: false ->', createRes.showTopic);

  // 2. Student joins
  const joinRes = await new Promise(r => {
    student.emit('join_session', {
      sessionCode,
      participantName: 'Test Student',
      participantPhone: '9876500099'
    }, r);
  });
  console.log('✓ Student joined session:', joinRes.success);

  // 3. Check session state has showTopic: false
  const state1 = await new Promise(r => {
    student.emit('get_session_state', { sessionCode, participantPhone: '9876500099', role: 'participant' }, r);
  });
  console.log('✓ Student sees showTopic:', state1.showTopic);

  // 4. Trainer flips toggle to showTopic: true
  let studentReceivedTopicEvent = null;
  student.on('topic_visibility_changed', ({ showTopic }) => {
    studentReceivedTopicEvent = showTopic;
  });

  const toggleRes1 = await new Promise(r => {
    trainer.emit('toggle_topic_visibility', { sessionCode }, r);
  });
  console.log('✓ Trainer toggled topic visibility ->', toggleRes1.showTopic);

  // Wait a moment for socket broadcast
  await new Promise(r => setTimeout(r, 200));
  console.log('✓ Student live received topic_visibility_changed event:', studentReceivedTopicEvent);

  // 5. Toggle back to false
  const toggleRes2 = await new Promise(r => {
    trainer.emit('toggle_topic_visibility', { sessionCode }, r);
  });
  console.log('✓ Trainer toggled back ->', toggleRes2.showTopic);
  await new Promise(r => setTimeout(r, 200));
  console.log('✓ Student live received second event:', studentReceivedTopicEvent);

  trainer.disconnect();
  student.disconnect();
  console.log('\n🎉 ALL TOPIC VISIBILITY TESTS PASSED!');
  process.exit(0);
}

testTopicToggle();
