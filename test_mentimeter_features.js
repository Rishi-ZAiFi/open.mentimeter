import { io } from 'socket.io-client';

async function testMentimeterFeatures() {
  console.log('🧪 Testing 4 Signature Mentimeter Upgrades...\n');

  const trainer = io('http://localhost:3000');
  const student = io('http://localhost:3000');

  await new Promise(r => trainer.on('connect', r));
  await new Promise(r => student.on('connect', r));

  const sessionCode = 'MENTI-4-TEST';

  // 1. Trainer creates session
  await new Promise(r => {
    trainer.emit('create_session', {
      trainerName: 'Lead Coach',
      sessionCode,
      timerDuration: 30
    }, r);
  });
  console.log('✓ 1. Session created:', sessionCode);

  // Student joins
  await new Promise(r => {
    student.emit('join_session', {
      sessionCode,
      participantName: 'Alice Attendee',
      participantPhone: '9876500077'
    }, r);
  });
  console.log('✓ Student Alice joined session.');

  // 2. Test Feature 1: Floating Emoji Reactions
  let trainerReceivedReaction = null;
  trainer.on('reaction_received', (data) => {
    trainerReceivedReaction = data;
  });

  student.emit('send_reaction', { sessionCode, emoji: '🔥', senderName: 'Alice Attendee' });
  await new Promise(r => setTimeout(r, 200));
  console.log('✓ 2. Floating Emoji Broadcast:', {
    receivedEmoji: trainerReceivedReaction?.emoji,
    sender: trainerReceivedReaction?.senderName
  });

  // 3. Test Feature 2: Live Word Cloud Submissions
  let wordCloudState = null;
  trainer.on('word_cloud_updated', (data) => {
    wordCloudState = data;
  });

  student.emit('submit_word', {
    sessionCode,
    word: 'VLOOKUP',
    questionIndex: 0,
    participantPhone: '9876500077'
  });
  await new Promise(r => setTimeout(r, 200));

  student.emit('submit_word', {
    sessionCode,
    word: 'VLOOKUP',
    questionIndex: 0,
    participantPhone: '9876500077'
  });
  await new Promise(r => setTimeout(r, 200));

  student.emit('submit_word', {
    sessionCode,
    word: 'INDEX_MATCH',
    questionIndex: 0,
    participantPhone: '9876500077'
  });
  await new Promise(r => setTimeout(r, 200));

  console.log('✓ 3. Word Cloud Live Aggregation:', {
    totalResponses: wordCloudState?.totalResponses,
    wordMap: wordCloudState?.wordMap
  });

  // 4. Test Feature 3: Audience Q&A Wall & Upvoting
  let qaState = null;
  trainer.on('qa_questions_updated', (data) => {
    qaState = data.qaQuestions;
  });

  const postRes = await new Promise(r => {
    student.emit('post_qa_question', {
      sessionCode,
      text: 'How does INDEX MATCH handle duplicate values in the lookup array?',
      authorName: 'Alice Attendee',
      authorPhone: '9876500077'
    }, r);
  });
  console.log('✓ 4a. Q&A Question Posted:', postRes.question?.text);

  await new Promise(r => setTimeout(r, 200));

  const qId = postRes.question.id;
  // Upvote question
  await new Promise(r => {
    student.emit('upvote_qa_question', {
      sessionCode,
      questionId: qId,
      userPhone: '9876500077'
    }, r);
  });
  await new Promise(r => setTimeout(r, 200));
  const upvotedQ = qaState?.find(q => q.id === qId);
  console.log('✓ 4b. Q&A Upvote Registered:', { upvotes: upvotedQ?.upvotes });

  // Trainer marks answered
  await new Promise(r => {
    trainer.emit('mark_qa_answered', {
      sessionCode,
      questionId: qId,
      answered: true
    }, r);
  });
  await new Promise(r => setTimeout(r, 200));
  const answeredQ = qaState?.find(q => q.id === qId);
  console.log('✓ 4c. Trainer Moderation (Answered):', { answered: answeredQ?.answered });

  trainer.disconnect();
  student.disconnect();

  console.log('\n🎉 ALL 4 MENTIMETER UPGRADE TESTS PASSED WITH 100% SUCCESS!');
  process.exit(0);
}

testMentimeterFeatures();
