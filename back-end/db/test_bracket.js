import 'dotenv/config';

async function runTest() {
  console.log('Starting Bracket and Auto-Advancement Integration Test...');

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

  console.log('Logged in successfully.');

  // 2. Fetch tournaments to find our event ID
  const tournamentsRes = await fetch('http://localhost:3000/api/tournaments', { headers });
  const { data: tournaments } = await tournamentsRes.json();
  const activeTourney = tournaments.find(t => t.code === 'VNBAD-2026-03');
  
  if (!activeTourney) {
    console.error('Tournament VNBAD-2026-03 not found.');
    process.exit(1);
  }

  // Get details of active tournament events
  const eventsRes = await fetch(`http://localhost:3000/api/tournaments/${activeTourney.id}/events`, { headers });
  const { data: events } = await eventsRes.json();
  
  const msEvent = events.find(e => e.category_code === 'MS' || e.categoryCode === 'MS');
  if (!msEvent) {
    console.error('Event MS not found in tournament.');
    process.exit(1);
  }

  console.log(`Found MS Event ID: ${msEvent.id}`);

  // 3. Generate Draw
  console.log('Generating draw (bốc thăm)...');
  const drawRes = await fetch(`http://localhost:3000/api/competition/events/${msEvent.id}/draw`, {
    method: 'POST',
    headers
  });

  if (!drawRes.ok) {
    console.error('Generate draw failed:', await drawRes.json());
    process.exit(1);
  }

  const { data: drawData } = await drawRes.json();
  console.log('Draw generated:', drawData);

  // 4. Fetch matches and verify bracket links
  const matchesRes = await fetch(`http://localhost:3000/api/competition/matches?eventId=${msEvent.id}&limit=100`, { headers });
  const { data: matches } = await matchesRes.json();

  console.log(`Total matches generated: ${matches.length}`);
  
  // Verify next_match_id and next_match_side links
  const hasLinks = matches.some(m => m.next_match_id !== null);
  console.log(`Has bracket links (next_match_id): ${hasLinks ? 'YES' : 'NO'}`);
  
  if (!hasLinks) {
    console.error('FAIL: Bracket links are missing!');
    process.exit(1);
  }

  // Find a match in Round 1
  for (const m of matches) {
    console.log(`Match ID: ${m.id}, Code: ${m.code}, Round: ${m.round}, Status: ${m.status}, NextMatch: ${m.next_match_id} (Side ${m.next_match_side})`);
  }

  const upcomingMatch = matches.find(m => m.status === 'upcoming' && m.round !== 'Chung kết' && m.round !== 'Bán kết');
  const testMatch = upcomingMatch || matches.find(m => m.status === 'upcoming');
  if (!testMatch) {
    console.error('No upcoming matches found to test.');
    process.exit(0);
  }

  console.log(`Testing with Match ID: ${testMatch.id} (${testMatch.round})`);
  
  // Fetch details of this match to find players
  const matchDetailsRes = await fetch(`http://localhost:3000/api/competition/matches/${testMatch.id}`, { headers });
  const { data: matchDetails } = await matchDetailsRes.json();
  
  console.log('Match participants:', matchDetails.participants);
  if (matchDetails.participants.length < 2) {
    console.error('FAIL: Match does not have 2 participants.');
    process.exit(1);
  }

  // 5. Start the match
  console.log('Starting match...');
  const startRes = await fetch(`http://localhost:3000/api/competition/matches/${testMatch.id}/start`, {
    method: 'PATCH',
    headers
  });
  if (!startRes.ok) {
    console.error('Start match failed:', await startRes.json());
    process.exit(1);
  }
  console.log('Match started.');

  // 6. Post set scores (2 sets won by Side A)
  console.log('Posting set scores...');
  const set1Res = await fetch(`http://localhost:3000/api/competition/matches/${testMatch.id}/sets`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ setNo: 1, scoreA: 21, scoreB: 15 })
  });
  const set2Res = await fetch(`http://localhost:3000/api/competition/matches/${testMatch.id}/sets`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ setNo: 2, scoreA: 21, scoreB: 18 })
  });

  if (!set1Res.ok || !set2Res.ok) {
    console.error('Post sets failed:', await set1Res.json(), await set2Res.json());
    process.exit(1);
  }

  // 7. Complete the match
  console.log('Completing match...');
  const completeRes = await fetch(`http://localhost:3000/api/competition/matches/${testMatch.id}/complete`, {
    method: 'PATCH',
    headers
  });
  if (!completeRes.ok) {
    console.error('Complete match failed:', await completeRes.json());
    process.exit(1);
  }
  const { data: completedData } = await completeRes.json();
  console.log('Completed Match Result:', completedData);

  // 8. Verify winner auto-advancement
  const nextMatchId = testMatch.next_match_id;
  const nextMatchSide = testMatch.next_match_side;
  console.log(`Verifying advancement to Match ID: ${nextMatchId} (Side: ${nextMatchSide})`);

  const nextMatchRes = await fetch(`http://localhost:3000/api/competition/matches/${nextMatchId}`, { headers });
  const { data: nextMatch } = await nextMatchRes.json();
  
  console.log('Next match participants after advancement:', nextMatch.participants);
  
  const hasWinnerAdvanced = nextMatch.participants.some(p => p.side === nextMatchSide);
  if (hasWinnerAdvanced) {
    console.log('SUCCESS: Winning player has successfully advanced to the next round match!');
  } else {
    console.error('FAIL: Winner did not advance.');
    process.exit(1);
  }

  console.log('E2E Bracket & Auto-Advancement Test Passed!');
}

runTest().catch(console.error);
