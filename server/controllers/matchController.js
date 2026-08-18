import Match from '../models/Match.js';
import Tournament from '../models/Tournament.js';
import Standings from '../models/Standings.js';
import { broadcastScoreUpdate } from '../sockets/matchSocket.js';

// Helper to recalculate standings for a tournament
const recalculateTournamentStandings = async (tournamentId) => {
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament || (tournament.format !== 'ROUND_ROBIN' && tournament.format !== 'GROUP_KNOCKOUT')) {
    return;
  }

  // Fetch all completed matches with both teams defined
  const completedMatches = await Match.find({
    tournament: tournamentId,
    status: 'COMPLETED',
    'teamA.name': { $nin: ['TBD', 'BYE'] },
    'teamB.name': { $nin: ['TBD', 'BYE'] },
  });

  // Reset standings
  const allStandings = await Standings.find({ tournament: tournamentId });
  const standingsMap = {};

  allStandings.forEach((s) => {
    standingsMap[s.teamName] = {
      model: s,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      form: [],
    };
  });

  // Calculate from completed matches
  completedMatches.forEach((m) => {
    const teamAName = m.teamA?.name;
    const teamBName = m.teamB?.name;
    const scoreA = Number(m.scoreA?.current) || 0;
    const scoreB = Number(m.scoreB?.current) || 0;

    if (standingsMap[teamAName] && standingsMap[teamBName]) {
      const statsA = standingsMap[teamAName];
      const statsB = standingsMap[teamBName];

      statsA.played += 1;
      statsB.played += 1;
      statsA.goalsFor += scoreA;
      statsA.goalsAgainst += scoreB;
      statsB.goalsFor += scoreB;
      statsB.goalsAgainst += scoreA;

      if (scoreA > scoreB) {
        statsA.won += 1;
        statsA.points += 3;
        statsA.form.push('W');
        statsB.lost += 1;
        statsB.form.push('L');
      } else if (scoreB > scoreA) {
        statsB.won += 1;
        statsB.points += 3;
        statsB.form.push('W');
        statsA.lost += 1;
        statsA.form.push('L');
      } else {
        statsA.drawn += 1;
        statsB.drawn += 1;
        statsA.points += 1;
        statsB.points += 1;
        statsA.form.push('D');
        statsB.form.push('D');
      }

      statsA.goalDifference = statsA.goalsFor - statsA.goalsAgainst;
      statsB.goalDifference = statsB.goalsFor - statsB.goalsAgainst;
    }
  });

  // Save all standings
  await Promise.all(
    Object.values(standingsMap).map((item) => {
      item.model.played = item.played;
      item.model.won = item.won;
      item.model.drawn = item.drawn;
      item.model.lost = item.lost;
      item.model.points = item.points;
      item.model.goalsFor = item.goalsFor;
      item.model.goalsAgainst = item.goalsAgainst;
      item.model.goalDifference = item.goalDifference;
      item.model.form = item.form.slice(-5); // Last 5 results
      return item.model.save();
    })
  );
};

// @desc    Get all matches for a tournament
// @route   GET /api/matches/tournament/:tournamentId
export const getTournamentMatches = async (req, res, next) => {
  try {
    const matches = await Match.find({ tournament: req.params.tournamentId })
      .populate('teamA.registrationId')
      .populate('teamB.registrationId')
      .sort({ roundIndex: 1, matchNumber: 1 });

    const standings = await Standings.find({ tournament: req.params.tournamentId }).sort({
      group: 1,
      points: -1,
      goalDifference: -1,
      goalsFor: -1,
    });

    res.status(200).json({
      success: true,
      matches,
      standings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all live matches across Goa
// @route   GET /api/matches/live
export const getLiveMatches = async (req, res, next) => {
  try {
    const liveMatches = await Match.find({ status: 'LIVE' })
      .populate('tournament', 'name sport venue location bannerImage format')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: liveMatches.length,
      matches: liveMatches,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single match by ID
// @route   GET /api/matches/:id
export const getMatchById = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id).populate(
      'tournament',
      'name sport venue location organizer format rules'
    );

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found.',
      });
    }

    res.status(200).json({
      success: true,
      match,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update match score, status & live commentary (Organizer/Admin)
// @route   PUT /api/matches/:id/score
export const updateMatchScore = async (req, res, next) => {
  try {
    const { scoreA, scoreB, status, winner, summary, venueCourt } = req.body;

    const match = await Match.findById(req.params.id).populate('tournament');
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found.',
      });
    }

    // Verify organizer permissions
    const tournament = match.tournament;
    if (
      tournament.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update scores for this match.',
      });
    }

    // Update match scores
    if (scoreA !== undefined) {
      if (typeof scoreA === 'object') {
        match.scoreA = { ...match.scoreA.toObject(), ...scoreA };
      } else {
        match.scoreA.current = Number(scoreA);
        match.scoreA.display = String(scoreA);
      }
    }

    if (scoreB !== undefined) {
      if (typeof scoreB === 'object') {
        match.scoreB = { ...match.scoreB.toObject(), ...scoreB };
      } else {
        match.scoreB.current = Number(scoreB);
        match.scoreB.display = String(scoreB);
      }
    }

    if (status) {
      match.status = status;
    }

    if (summary !== undefined) {
      match.summary = summary;
    }

    if (venueCourt) {
      match.venueCourt = venueCourt;
    }

    // Handle Winner and Automatic Bracket Advancement
    if (status === 'COMPLETED') {
      let resolvedWinner = winner;

      if (!resolvedWinner || !resolvedWinner.name) {
        if (match.scoreA.current > match.scoreB.current) {
          resolvedWinner = match.teamA;
        } else if (match.scoreB.current > match.scoreA.current) {
          resolvedWinner = match.teamB;
        }
      }

      if (resolvedWinner) {
        match.winner = {
          name: resolvedWinner.name,
          registrationId: resolvedWinner.registrationId || null,
        };

        // Advance to next bracket match if knockout round
        if (match.nextMatchNumber && match.nextSlot) {
          const nextMatch = await Match.findOne({
            tournament: match.tournament._id,
            matchNumber: match.nextMatchNumber,
          });

          if (nextMatch) {
            if (match.nextSlot === 'teamA') {
              nextMatch.teamA = {
                name: resolvedWinner.name,
                registrationId: resolvedWinner.registrationId || null,
              };
            } else if (match.nextSlot === 'teamB') {
              nextMatch.teamB = {
                name: resolvedWinner.name,
                registrationId: resolvedWinner.registrationId || null,
              };
            }
            await nextMatch.save();
            broadcastScoreUpdate(nextMatch);
          }
        }
      }
    }

    await match.save();

    // Recalculate standings for leagues / groups
    if (match.status === 'COMPLETED') {
      await recalculateTournamentStandings(match.tournament._id);
    }

    // Broadcast live score update to all connected WebSockets
    broadcastScoreUpdate(match);

    res.status(200).json({
      success: true,
      message: 'Match score updated and broadcast in real-time!',
      match,
    });
  } catch (error) {
    next(error);
  }
};
