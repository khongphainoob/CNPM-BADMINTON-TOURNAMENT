import 'dotenv/config';

async function runTest() {
  console.log('Starting Hotfix Verification Test (Revert completion on undo)...');

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
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  console.log('Logged in as BTC.');

  // 2. Fetch matches to find our active tournament and MS event
  const tournamentsRes = await fetch('http://localhost:3000/api/tournaments', { headers });
  const { data: tournaments } = await tournamentsRes.json();
  const activeTourney = tournaments.find(t => t.code === 'VNBAD-2026-03');
  const eventsRes = await fetch(`http://localhost:3000/api/tournaments/${activeTourney.id}/events`, { headers });
  const { data: events } = await eventsRes.json();
  const msEvent = events.find(e => e.category_code === 'MS');

  // Fetch matches
  const matchesRes = await fetch(`http://localhost:3000/api/competition/matches?eventId=${msEvent.id}&limit=100`, { headers });
  const { data: matches } = await matchesRes.json();
  
  // Find a match with a next_match_id so we can test advancement revert
  const testMatch = matches.find(m => m.next_match_id !== null && m.status === 'upcoming');
  if (!testMatch) {
    console.error('No match with next_match_id found.');
    process.exit(1);
  }

  console.log(`Using Match ID: ${testMatch.id}, Next Match: ${testMatch.next_match_id}`);

  // 3. Start the match
  console.log('Starting match...');
  await fetch(`http://localhost:3000/api/competition/matches/${testMatch.id}/start`, { method: 'PATCH', headers });

  // Add set scores to complete set 1
  console.log('Completing set 1 (win for A)...');
  let res = await fetch(`http://localhost:3000/api/competition/matches/${testMatch.id}/sets`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ setNo: 1, scoreA: 21, scoreB: 15 })
  });
  console.log('Set 1 response:', res.status, await res.json());

  res = await fetch(`http://localhost:3000/api/competition/matches/${testMatch.id}/score-events`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ setNo: 1, scorer: 'A', prevScoreA: 20, prevScoreB: 15, causedSetEnd: true })
  });
  console.log('Score-event 1 response:', res.status, await res.json());

  // Add set scores to complete set 2 (match point)
  console.log('Gaining match point in set 2...');
  res = await fetch(`http://localhost:3000/api/competition/matches/${testMatch.id}/sets`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ setNo: 2, scoreA: 21, scoreB: 18 })
  });
  console.log('Set 2 response:', res.status, await res.json());

  res = await fetch(`http://localhost:3000/api/competition/matches/${testMatch.id}/score-events`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ setNo: 2, scorer: 'A', prevScoreA: 20, prevScoreB: 18, causedSetEnd: true })
  });
  console.log('Score-event 2 response:', res.status, await res.json());

  // Complete the match
  console.log('Completing match...');
  res = await fetch(`http://localhost:3000/api/competition/matches/${testMatch.id}/complete`, { method: 'PATCH', headers });
  console.log('Complete match response:', res.status, await res.json());

  // Verify next match has the advanced winner
  let nextMatchRes = await fetch(`http://localhost:3000/api/competition/matches/${testMatch.next_match_id}`, { headers });
  let { data: nextMatch } = await nextMatchRes.json();
  const nextMatchSide = testMatch.next_match_side;
  let hasWinnerAdvanced = nextMatch.participants.some(p => p.side === nextMatchSide);
  if (!hasWinnerAdvanced) {
    console.error('FAIL: Winner did not advance.');
    process.exit(1);
  }
  console.log('SUCCESS: Winner advanced to next match.');

  // 4. Perform Undo
  console.log('Undoing last score...');
  const undoRes = await fetch(`http://localhost:3000/api/competition/matches/${testMatch.id}/undo`, { method: 'POST', headers });
  if (!undoRes.ok) {
    console.error('Undo failed:', await undoRes.json());
    process.exit(1);
  }

  // 5. Verify match status is reverted to 'live' and winner advanced is deleted
  const matchDetailsRes = await fetch(`http://localhost:3000/api/competition/matches/${testMatch.id}`, { headers });
  const { data: matchDetails } = await matchDetailsRes.json();
  
  console.log(`Match status after undo: ${matchDetails.status} (expected: live)`);
  console.log(`Match winner_side after undo: ${matchDetails.winner_side} (expected: null)`);

  nextMatchRes = await fetch(`http://localhost:3000/api/competition/matches/${testMatch.next_match_id}`, { headers });
  nextMatch = (await nextMatchRes.json()).data;
  hasWinnerAdvanced = nextMatch.participants.some(p => p.side === nextMatchSide);

  console.log(`Next match has winner side ${nextMatchSide} participant: ${hasWinnerAdvanced ? 'YES' : 'NO'} (expected: NO)`);

  const currentSet = matchDetails.sets.find(s => s.set_no === 2);
  console.log(`Set 2 score after undo: ${currentSet?.score_a}-${currentSet?.score_b} (expected: 20-18)`);

  if (matchDetails.status === 'live' && matchDetails.winner_side === null && !hasWinnerAdvanced && currentSet?.score_a === 20 && currentSet?.score_b === 18) {
    console.log('SUCCESS: Match completion reverted, advanced winner deleted, and score restored successfully!');
    console.log('All Hotfix Tests Passed!');
  } else {
    console.error('FAIL: State was not correctly reverted after undo.');
    process.exit(1);
  }
}

runTest().catch(console.error);
