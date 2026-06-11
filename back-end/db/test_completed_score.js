import 'dotenv/config';

async function runTest() {
  console.log('Starting Release 1.1.0 Verification Test (Prevent scoring on completed matches)...');

  // 1. Login
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'phamlam@shuttleops.vn', password: 'btc123' })
  });

  if (!loginRes.ok) {
    console.error('Login failed:', await loginRes.json());
    process.exit(1);
  }

  const { data: { token } } = await loginRes.json();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  console.log('Logged in as BTC.');

  // 2. Fetch matches to find a completed one, or complete an upcoming one
  const tournamentsRes = await fetch('http://localhost:3000/api/tournaments', { headers });
  const { data: tournaments } = await tournamentsRes.json();
  const activeTourney = tournaments.find(t => t.code === 'VNBAD-2026-03') || tournaments[0];
  console.log('Active Tourney:', activeTourney);

  const eventsRes = await fetch(`http://localhost:3000/api/tournaments/${activeTourney.id}/events`, { headers });
  const { data: events } = await eventsRes.json();
  console.log('Events:', events);
  const msEvent = events.find(e => e.category_code === 'MS' || e.categoryCode === 'MS');
  console.log('MS Event:', msEvent);

  let matchesRes = await fetch(`http://localhost:3000/api/competition/matches?eventId=${msEvent.id}&limit=100`, { headers });
  let { data: matches } = await matchesRes.json();
  console.log('Matches list:', matches);

  if (matches.length === 0) {
    console.log('No matches generated yet. Generating draw first...');
    const drawRes = await fetch(`http://localhost:3000/api/competition/events/${msEvent.id}/draw`, {
      method: 'POST',
      headers
    });
    console.log('Draw response status:', drawRes.status);
    matchesRes = await fetch(`http://localhost:3000/api/competition/matches?eventId=${msEvent.id}&limit=100`, { headers });
    const resData = await matchesRes.json();
    matches = resData.data;
  }

  let completedMatch = matches.find(m => m.status === 'completed');

  if (!completedMatch) {
    console.log('No completed match found. Finding a match to complete...');
    const targetMatch = matches.find(m => m.status === 'live' || m.status === 'upcoming') || matches[0];
    if (!targetMatch) {
      console.error('No matches found to test.');
      process.exit(1);
    }
    
    if (targetMatch.status === 'upcoming') {
      // Start it
      await fetch(`http://localhost:3000/api/competition/matches/${targetMatch.id}/start`, { method: 'PATCH', headers });
    }
    
    // Add set scores to complete it
    await fetch(`http://localhost:3000/api/competition/matches/${targetMatch.id}/sets`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ setNo: 1, scoreA: 21, scoreB: 15 })
    });
    await fetch(`http://localhost:3000/api/competition/matches/${targetMatch.id}/sets`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ setNo: 2, scoreA: 21, scoreB: 18 })
    });
    // Complete it
    const compRes = await fetch(`http://localhost:3000/api/competition/matches/${targetMatch.id}/complete`, { method: 'PATCH', headers });
    const compData = await compRes.json();
    completedMatch = compData.data;
  }

  console.log(`Testing completed Match ID: ${completedMatch.id}`);

  // 3. Try adding set score to completed match (should fail with 400)
  console.log('Testing adding set score to completed match...');
  const setScoreRes = await fetch(`http://localhost:3000/api/competition/matches/${completedMatch.id}/sets`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ setNo: 3, scoreA: 21, scoreB: 19 })
  });

  const setScoreData = await setScoreRes.json();
  if (setScoreRes.status === 400 && setScoreData.error?.code === 'MATCH_ALREADY_COMPLETED') {
    console.log('SUCCESS: Prevented adding set score to completed match.');
  } else {
    console.error('FAIL: Allowed adding set score, or wrong status:', setScoreRes.status, setScoreData);
    process.exit(1);
  }

  // 4. Try adding score event to completed match (should fail with 400)
  console.log('Testing adding score event to completed match...');
  const scoreEventRes = await fetch(`http://localhost:3000/api/competition/matches/${completedMatch.id}/score-events`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ setNo: 1, scorer: 'A', prevScoreA: 0, prevScoreB: 0 })
  });

  const scoreEventData = await scoreEventRes.json();
  if (scoreEventRes.status === 400 && scoreEventData.error?.code === 'MATCH_ALREADY_COMPLETED') {
    console.log('SUCCESS: Prevented logging score event to completed match.');
  } else {
    console.error('FAIL: Allowed logging score event, or wrong status:', scoreEventRes.status, scoreEventData);
    process.exit(1);
  }

  console.log('All Release 1.1.0 Verification Tests Passed!');
}

runTest().catch(console.error);
