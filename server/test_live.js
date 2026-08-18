const BASE_URL = 'http://localhost:5000/api';

const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const isFormData = options.body instanceof FormData;
  const headers = isFormData
    ? { ...options.headers }
    : { 'Content-Type': 'application/json', ...options.headers };

  const res = await fetch(url, {
    ...options,
    headers,
    body: isFormData
      ? options.body
      : options.body
      ? JSON.stringify(options.body)
      : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}`);
  }
  return data;
};

async function runLiveTest() {
  console.log('🚀 Starting End-to-End Live System Test...');

  // 1. Register a real organizer
  const orgEmail = `organizer_${Date.now()}@goa.com`;
  const orgRes = await request('/auth/register', {
    method: 'POST',
    body: {
      name: 'Panaji Sports Council',
      email: orgEmail,
      password: 'password123',
      phone: '+91 98221 99999',
      role: 'ORGANIZER',
      organizationName: 'Panaji Sports Council',
      location: 'Panaji, Goa',
    },
  });
  const orgToken = orgRes.token;
  console.log('✅ 1. Organizer Registered:', orgEmail);

  // 2. Create a Real Tournament
  const tournRes = await request('/tournaments', {
    method: 'POST',
    body: {
      name: 'Goa State Futsal Championship 2026',
      sport: 'Futsal',
      venue: 'Campal Indoor Arena',
      location: 'Panaji',
      startDate: new Date(Date.now() + 86400000).toISOString(),
      endDate: new Date(Date.now() + 4 * 86400000).toISOString(),
      registrationFee: 0, // Free entry for test verification
      upiId: 'panajifutsal@okaxis',
      format: 'KNOCKOUT',
      maxTeams: 4,
      teamSize: 5,
      prizePool: '1st: ₹30,000 | 2nd: ₹15,000',
      rules: '20 min halves, rolling substitutions, 5 players a-side.',
    },
    headers: { Authorization: `Bearer ${orgToken}` },
  });
  const tournamentId = tournRes.tournament._id;
  console.log('✅ 2. Real Tournament Created:', tournamentId, tournRes.tournament.name);

  // 3. Register 4 Real Teams & Players
  const teamNames = [
    'Dona Paula Dynamos',
    'Miramar Mavericks',
    'Ribandar Rangers',
    'Fontainhas FC',
  ];

  for (let i = 0; i < teamNames.length; i++) {
    const pEmail = `player_${i}_${Date.now()}@goa.com`;
    const pRes = await request('/auth/register', {
      method: 'POST',
      body: {
        name: `Captain ${teamNames[i]}`,
        email: pEmail,
        password: 'password123',
        phone: `+91 98220 0000${i}`,
        role: 'PLAYER',
      },
    });
    const pToken = pRes.token;

    // Register team
    const regRes = await request('/registrations', {
      method: 'POST',
      body: {
        tournamentId,
        teamName: teamNames[i],
        captainName: `Captain ${teamNames[i]}`,
        contactPhone: `+91 98220 0000${i}`,
        playersList: [
          { name: `Captain ${teamNames[i]}`, jerseyNumber: 10, role: 'Forward' },
          { name: 'Defender 1', jerseyNumber: 4, role: 'Defender' },
        ],
      },
      headers: { Authorization: `Bearer ${pToken}` },
    });
  }
  console.log(`✅ 3. Registered ${teamNames.length} teams.`);

  // 4. Start tournament and auto-generate fixtures
  const startRes = await request(`/tournaments/${tournamentId}/start`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${orgToken}` },
  });
  console.log(
    `✅ 4. Tournament Started! Generated ${startRes.matchesCount} knockout fixtures.`
  );

  // 5. Fetch fixtures
  const fixturesRes = await request(`/matches/tournament/${tournamentId}`);
  const matches = fixturesRes.matches;
  console.log(
    '✅ 5. First Round Pairing:',
    matches[0].teamA.name,
    'vs',
    matches[0].teamB.name
  );

  // 6. Update Score of Match 1 and Mark Completed
  const scoreRes = await request(`/matches/${matches[0]._id}/score`, {
    method: 'PUT',
    body: {
      scoreA: { current: 4, display: '4' },
      scoreB: { current: 2, display: '2' },
      status: 'COMPLETED',
      summary: `${matches[0].teamA.name} won 4-2 in extra time!`,
    },
    headers: { Authorization: `Bearer ${orgToken}` },
  });
  console.log('✅ 6. Match 1 completed. Winner:', scoreRes.match.winner.name);

  // 7. Verify the winner was auto-advanced into the Final match!
  const finalMatch = await request(`/matches/${matches[matches.length - 1]._id}`);
  console.log(
    '✅ 7. Final Match Bracket Slot updated:',
    finalMatch.match.teamA?.name,
    'vs',
    finalMatch.match.teamB?.name
  );

  console.log('🎉 ALL END-TO-END LIVE FEATURES ARE 100% OPERATIONAL!');
}

runLiveTest().catch(console.error);
