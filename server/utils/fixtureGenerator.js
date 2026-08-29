/**
 * Smart Tournament Engine & Generator
 * Generates single-elimination knockout brackets, round-robin leagues, and group+knockout stages.
 */

// Helper to shuffle array for fair random seeding
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Next power of 2 for bracket size
const getNextPowerOf2 = (n) => {
  let p = 1;
  while (p < n) {
    p *= 2;
  }
  return Math.max(p, 2);
};

// Get round name based on remaining teams / round index
const getKnockoutRoundName = (teamsInRound, totalRounds, currentRoundIndex) => {
  if (currentRoundIndex === totalRounds) return 'Final';
  if (currentRoundIndex === totalRounds - 1) return 'Semi-Finals';
  if (currentRoundIndex === totalRounds - 2) return 'Quarter-Finals';
  if (teamsInRound === 16) return 'Round of 16';
  if (teamsInRound === 32) return 'Round of 32';
  return `Round ${currentRoundIndex}`;
};

/**
 * Generates a full single-elimination knockout bracket with linked advancement
 */
export const generateKnockoutFixtures = (tournamentId, verifiedTeams, startDate = new Date()) => {
  if (!verifiedTeams || verifiedTeams.length < 2) {
    throw new Error('At least 2 verified teams are required to generate knockout fixtures.');
  }

  const seededTeams = shuffleArray(verifiedTeams);
  const n = seededTeams.length;
  const bracketSize = getNextPowerOf2(n);
  const totalRounds = Math.log2(bracketSize);

  const matches = [];
  let matchCounter = 1;

  const roundMatches = [];

  // Round 1 pairings
  const r1MatchesCount = bracketSize / 2;
  const r1Matches = [];

  // Team slots array with byes
  const slots = [];
  for (let i = 0; i < bracketSize; i++) {
    if (i < n) {
      slots.push({
        name: seededTeams[i].teamName,
        registrationId: seededTeams[i]._id,
      });
    } else {
      slots.push({
        name: 'BYE',
        registrationId: null,
      });
    }
  }

  // First round match creation
  const baseTime = new Date(startDate).getTime();
  let timeOffsetHours = 0;

  for (let i = 0; i < r1MatchesCount; i++) {
    const teamA = slots[i * 2];
    const teamB = slots[i * 2 + 1];

    const matchObj = {
      tournament: tournamentId,
      matchNumber: matchCounter++,
      round: getKnockoutRoundName(bracketSize, totalRounds, 1),
      roundIndex: 1,
      teamA: teamA || { name: 'TBD' },
      teamB: teamB || { name: 'TBD' },
      status: 'SCHEDULED',
      scoreA: { current: 0, display: '0', detail: {} },
      scoreB: { current: 0, display: '0', detail: {} },
      startTime: new Date(baseTime + timeOffsetHours * 3600 * 1000),
      venueCourt: `Court ${(i % 4) + 1}`,
      nextMatchNumber: null,
      nextSlot: null,
    };

    // If one of the teams is BYE, auto-resolve match
    if (teamB && teamB.name === 'BYE' && teamA && teamA.name !== 'BYE') {
      matchObj.status = 'COMPLETED';
      matchObj.winner = teamA;
      matchObj.summary = `${teamA.name} advanced via Bye`;
    } else if (teamA && teamA.name === 'BYE' && teamB && teamB.name !== 'BYE') {
      matchObj.status = 'COMPLETED';
      matchObj.winner = teamB;
      matchObj.summary = `${teamB.name} advanced via Bye`;
    }

    r1Matches.push(matchObj);
    timeOffsetHours += 2;
  }
  roundMatches.push(r1Matches);

  // Subsequent rounds (Quarterfinals, Semis, Final)
  let prevRoundMatches = r1Matches;
  for (let r = 2; r <= totalRounds; r++) {
    const currRoundCount = prevRoundMatches.length / 2;
    const currMatches = [];
    const teamsInThisRound = currRoundCount * 2;

    for (let i = 0; i < currRoundCount; i++) {
      const matchObj = {
        tournament: tournamentId,
        matchNumber: matchCounter++,
        round: getKnockoutRoundName(teamsInThisRound, totalRounds, r),
        roundIndex: r,
        teamA: { name: 'TBD', registrationId: null },
        teamB: { name: 'TBD', registrationId: null },
        status: 'SCHEDULED',
        scoreA: { current: 0, display: '0', detail: {} },
        scoreB: { current: 0, display: '0', detail: {} },
        startTime: new Date(baseTime + timeOffsetHours * 3600 * 1000),
        venueCourt: `Main Arena`,
        nextMatchNumber: null,
        nextSlot: null,
      };

      // Link previous round matches to feed into this match
      const prevMatch1 = prevRoundMatches[i * 2];
      const prevMatch2 = prevRoundMatches[i * 2 + 1];

      prevMatch1.nextMatchNumber = matchObj.matchNumber;
      prevMatch1.nextSlot = 'teamA';

      prevMatch2.nextMatchNumber = matchObj.matchNumber;
      prevMatch2.nextSlot = 'teamB';

      // If previous matches were auto-won via Bye, populate immediately
      if (prevMatch1.winner && prevMatch1.winner.name) {
        matchObj.teamA = prevMatch1.winner;
      }
      if (prevMatch2.winner && prevMatch2.winner.name) {
        matchObj.teamB = prevMatch2.winner;
      }

      currMatches.push(matchObj);
      timeOffsetHours += 2.5;
    }

    roundMatches.push(currMatches);
    prevRoundMatches = currMatches;
  }

  // Flatten all matches
  const allMatches = roundMatches.flat();
  return allMatches;
};

/**
 * Generates Round Robin fixtures (all teams play against each other)
 */
export const generateRoundRobinFixtures = (tournamentId, verifiedTeams, startDate = new Date()) => {
  if (!verifiedTeams || verifiedTeams.length < 2) {
    throw new Error('At least 2 verified teams are required for Round Robin league.');
  }

  const teams = [...verifiedTeams];
  const isOdd = teams.length % 2 !== 0;
  if (isOdd) {
    teams.push({ _id: null, teamName: 'BYE' });
  }

  const numTeams = teams.length;
  const numRounds = numTeams - 1;
  const matchesPerRound = numTeams / 2;
  const matches = [];
  let matchNumber = 1;
  const baseTime = new Date(startDate).getTime();
  let timeOffsetHours = 0;

  for (let round = 0; round < numRounds; round++) {
    for (let i = 0; i < matchesPerRound; i++) {
      const teamAIdx = (round + i) % (numTeams - 1);
      let teamBIdx = (numTeams - 1 - i + round) % (numTeams - 1);

      if (i === 0) {
        teamBIdx = numTeams - 1;
      }

      const teamA = teams[teamAIdx];
      const teamB = teams[teamBIdx];

      if (teamA.teamName === 'BYE' || teamB.teamName === 'BYE') {
        continue;
      }

      matches.push({
        tournament: tournamentId,
        matchNumber: matchNumber++,
        round: `Matchday ${round + 1}`,
        roundIndex: round + 1,
        teamA: {
          name: teamA.teamName,
          registrationId: teamA._id,
        },
        teamB: {
          name: teamB.teamName,
          registrationId: teamB._id,
        },
        status: 'SCHEDULED',
        scoreA: { current: 0, display: '0', detail: {} },
        scoreB: { current: 0, display: '0', detail: {} },
        startTime: new Date(baseTime + timeOffsetHours * 3600 * 1000),
        venueCourt: `Pitch ${(i % 3) + 1}`,
      });

      timeOffsetHours += 1.5;
    }
    timeOffsetHours += 4;
  }

  return matches;
};

/**
 * Generates ONLY Group Stage Fixtures (Group A, Group B, etc.) without premature knockout placeholders.
 */
export const generateGroupStageFixtures = (tournamentId, verifiedTeams, startDate = new Date(), numGroups = 2) => {
  if (!verifiedTeams || verifiedTeams.length < 4) {
    throw new Error('At least 4 verified teams are required for Group Stage.');
  }

  const seeded = shuffleArray(verifiedTeams);
  const groups = {};
  const groupLetters = ['Group A', 'Group B', 'Group C', 'Group D'];

  for (let i = 0; i < numGroups; i++) {
    groups[groupLetters[i]] = [];
  }

  seeded.forEach((team, idx) => {
    const gIndex = idx % numGroups;
    groups[groupLetters[gIndex]].push(team);
  });

  const matches = [];
  let matchNumber = 1;

  for (const [groupName, groupTeams] of Object.entries(groups)) {
    const groupMatches = generateRoundRobinFixtures(tournamentId, groupTeams, startDate);
    groupMatches.forEach((m) => {
      m.matchNumber = matchNumber++;
      m.group = groupName;
      m.round = `${groupName} - ${m.round}`;
      matches.push(m);
    });
  }

  return matches;
};

/**
 * Generates Knockout Finals Stage from completed Group Stage Standings.
 * Picks top teams from each group (e.g. 1st Group A vs 2nd Group B, 1st Group B vs 2nd Group A).
 */
export const generateKnockoutFromGroupStandings = (tournamentId, standingsRecords, startDate = new Date(), startMatchNumber = 100) => {
  const grouped = {};
  standingsRecords.forEach((s) => {
    const grp = s.group || 'Group A';
    if (!grouped[grp]) grouped[grp] = [];
    grouped[grp].push(s);
  });

  // Sort each group: points DESC, goalDifference DESC, goalsFor DESC
  Object.keys(grouped).forEach((grp) => {
    grouped[grp].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
  });

  const groupKeys = Object.keys(grouped).sort();
  const matches = [];
  let matchNumber = startMatchNumber;
  const baseTime = new Date(startDate).getTime();

  if (groupKeys.length >= 2) {
    const winnerA = grouped[groupKeys[0]]?.[0];
    const runnerA = grouped[groupKeys[0]]?.[1];
    const winnerB = grouped[groupKeys[1]]?.[0];
    const runnerB = grouped[groupKeys[1]]?.[1];

    const semi1MatchNum = matchNumber++;
    const semi2MatchNum = matchNumber++;
    const finalMatchNum = matchNumber++;

    const semiFinal1 = {
      tournament: tournamentId,
      matchNumber: semi1MatchNum,
      round: 'Semi-Final 1',
      roundIndex: 10,
      teamA: {
        name: winnerA ? winnerA.teamName : `Winner ${groupKeys[0]}`,
        registrationId: winnerA?.registration || null,
      },
      teamB: {
        name: runnerB ? runnerB.teamName : `Runner-up ${groupKeys[1]}`,
        registrationId: runnerB?.registration || null,
      },
      status: 'SCHEDULED',
      scoreA: { current: 0, display: '0', detail: {} },
      scoreB: { current: 0, display: '0', detail: {} },
      startTime: new Date(baseTime + 24 * 3600 * 1000),
      venueCourt: 'Main Stadium',
      nextMatchNumber: finalMatchNum,
      nextSlot: 'teamA',
    };

    const semiFinal2 = {
      tournament: tournamentId,
      matchNumber: semi2MatchNum,
      round: 'Semi-Final 2',
      roundIndex: 10,
      teamA: {
        name: winnerB ? winnerB.teamName : `Winner ${groupKeys[1]}`,
        registrationId: winnerB?.registration || null,
      },
      teamB: {
        name: runnerA ? runnerA.teamName : `Runner-up ${groupKeys[0]}`,
        registrationId: runnerA?.registration || null,
      },
      status: 'SCHEDULED',
      scoreA: { current: 0, display: '0', detail: {} },
      scoreB: { current: 0, display: '0', detail: {} },
      startTime: new Date(baseTime + 27 * 3600 * 1000),
      venueCourt: 'Main Stadium',
      nextMatchNumber: finalMatchNum,
      nextSlot: 'teamB',
    };

    const finalMatch = {
      tournament: tournamentId,
      matchNumber: finalMatchNum,
      round: 'Final',
      roundIndex: 11,
      teamA: { name: 'Winner SF1', registrationId: null },
      teamB: { name: 'Winner SF2', registrationId: null },
      status: 'SCHEDULED',
      scoreA: { current: 0, display: '0', detail: {} },
      scoreB: { current: 0, display: '0', detail: {} },
      startTime: new Date(baseTime + 48 * 3600 * 1000),
      venueCourt: 'Championship Arena',
    };

    matches.push(semiFinal1, semiFinal2, finalMatch);
  }

  return matches;
};

/**
 * Legacy wrapper for Group + Knockout
 */
export const generateGroupKnockoutFixtures = (tournamentId, verifiedTeams, startDate = new Date(), numGroups = 2) => {
  return generateGroupStageFixtures(tournamentId, verifiedTeams, startDate, numGroups);
};
