async function testValidations() {
  console.log('Starting Validation Integration Tests...');

  // 1. Login as BTC
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'phamlam@shuttleops.vn', password: 'btc123' })
  });
  
  if (!loginRes.ok) {
    console.error('BTC Login failed:', await loginRes.json());
    process.exit(1);
  }
  
  const { data: { token } } = await loginRes.json();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  console.log('Logged in as BTC.');

  // Fetch players to get some IDs and genders
  const playersRes = await fetch('http://localhost:3000/api/people/players', { headers });
  const { data: players } = await playersRes.json();
  
  const malePlayer = players.find(p => p.gender === 'M');
  const femalePlayer = players.find(p => p.gender === 'F');
  
  console.log(`Male Player ID: ${malePlayer?.id} (${malePlayer?.name}), Female Player ID: ${femalePlayer?.id} (${femalePlayer?.name})`);

  // Fetch tournaments and events to get a Men's Singles (MS) event ID
  const tournamentsRes = await fetch('http://localhost:3000/api/tournaments', { headers });
  const { data: tournaments } = await tournamentsRes.json();
  const activeTourney = tournaments[0];
  
  const eventsRes = await fetch(`http://localhost:3000/api/tournaments/${activeTourney.id}/events`, { headers });
  const { data: events } = await eventsRes.json();
  
  const msEvent = events.find(e => e.category_code === 'MS');
  const wsEvent = events.find(e => e.category_code === 'WS');
  const mdEvent = events.find(e => e.category_code === 'MD');

  console.log(`MS Event ID: ${msEvent?.id}, WS Event ID: ${wsEvent?.id}, MD Event: ${mdEvent?.id}`);

  // Test 1: Register Female player in Men's Singles (should fail)
  if (msEvent && femalePlayer) {
    console.log('Testing gender validation (Female in Men\'s Singles)...');
    const regRes = await fetch(`http://localhost:3000/api/participation/events/${msEvent.id}/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ playerId: Number(femalePlayer.id) })
    });
    
    const regResult = await regRes.json();
    if (regRes.status === 400 && regResult.error?.code === 'GENDER_MISMATCH') {
      console.log('SUCCESS: Prevented Female player registering in Men\'s Singles.');
    } else {
      console.error('FAIL: Allowed Female in MS, or wrong status:', regRes.status, regResult);
    }
  }

  // Test 2: Register Male player in Women's Singles (should fail)
  if (wsEvent && malePlayer) {
    console.log('Testing gender validation (Male in Women\'s Singles)...');
    const regRes = await fetch(`http://localhost:3000/api/participation/events/${wsEvent.id}/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ playerId: Number(malePlayer.id) })
    });
    
    const regResult = await regRes.json();
    if (regRes.status === 400 && regResult.error?.code === 'GENDER_MISMATCH') {
      console.log('SUCCESS: Prevented Male player registering in Women\'s Singles.');
    } else {
      console.error('FAIL: Allowed Male in WS, or wrong status:', regRes.status, regResult);
    }
  }

  // Test 3: Register partner who is already registered (should fail)
  const malePlayers = players.filter(p => p.gender === 'M');
  if (mdEvent && malePlayers.length >= 3) {
    console.log('Testing duplicate partner validation...');
    const p1 = Number(malePlayers[0].id);
    const p2 = Number(malePlayers[1].id);
    const p3 = Number(malePlayers[2].id);

    // Clean up first just in case
    // We will attempt to register p1 with p2
    const firstReg = await fetch(`http://localhost:3000/api/participation/events/${mdEvent.id}/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ playerId: p1, partnerId: p2 })
    });
    const firstRegResult = await firstReg.json();
    console.log('First pair registration status:', firstReg.status);

    // Try registering p3 with p2 as partner (p2 is already in the event)
    const regRes = await fetch(`http://localhost:3000/api/participation/events/${mdEvent.id}/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ playerId: p3, partnerId: p2 })
    });
    
    const regResult = await regRes.json();
    if (regRes.status === 409 && regResult.error?.code === 'DUPLICATE_REGISTRATION') {
      console.log('SUCCESS: Prevented duplicate partner registration.');
    } else {
      console.error('FAIL: Allowed partner registered twice, or wrong status:', regRes.status, regResult);
    }
  }

  // 2. Login as Admin to test config
  const adminLoginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@shuttleops.vn', password: 'admin123' })
  });
  const { data: { token: adminToken } } = await adminLoginRes.json();
  const adminHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  };

  // Test 4: Get and Patch configurations
  console.log('Testing GET and PATCH configurations...');
  const getRes = await fetch('http://localhost:3000/api/config', { headers: adminHeaders });
  const getResult = await getRes.json();
  
  if (getRes.ok && getResult.data) {
    console.log('SUCCESS: Configs retrieved:', getResult.data);
    
    const patchRes = await fetch('http://localhost:3000/api/config', {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ system_name: 'ShuttleOps Elite Platform', maintenance_mode: 'true' })
    });
    
    const patchResult = await patchRes.json();
    if (patchRes.ok && patchResult.data?.system_name === 'ShuttleOps Elite Platform') {
      console.log('SUCCESS: Config patched and returned:', patchResult.data);
    } else {
      console.error('FAIL: Patch configs failed:', patchRes.status, patchResult);
    }
  } else {
    console.error('FAIL: GET configs failed:', getRes.status, getResult);
  }
}

testValidations().catch(console.error);
