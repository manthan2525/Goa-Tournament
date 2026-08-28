/**
 * Helper utilities for evaluating Fixture Warnings and Confirmation Levels.
 */

export const isTournamentStarted = (tournament) => {
  if (!tournament) return false;
  if (tournament.status === "ONGOING" || tournament.status === "COMPLETED") return true;
  if (tournament.startDate) {
    const start = new Date(tournament.startDate).getTime();
    const now = Date.now();
    return start <= now;
  }
  return false;
};

export const getFixtureEditWarning = (match, tournament) => {
  const started = isTournamentStarted(tournament);
  const isLive = match?.status === "LIVE";
  const isCompleted = match?.status === "COMPLETED";
  const hasBracketImpact = Boolean(match?.nextMatchNumber || match?.nextSlot);

  if (isLive) {
    return {
      title: "🔴 LIVE MATCH WARNING",
      level: "CRITICAL",
      details: [
        "This match is currently LIVE!",
        "Changing teams, fixture, or schedule while live may cause incorrect live-score data.",
        "Live spectators will see immediate updates via WebSockets.",
      ],
      confirmText: "Continue Editing Live Match",
    };
  }

  if (isCompleted) {
    return {
      title: "⚠️ Completed Match Warning",
      level: "HIGH",
      details: [
        "This match has already been completed.",
        "Changing this fixture may affect final score, match results, bracket progression, and standings.",
        "Please verify historical records after saving.",
      ],
      confirmText: "Continue Editing Completed Match",
    };
  }

  if (hasBracketImpact) {
    return {
      title: "⚠️ Bracket Impact Warning",
      level: "HIGH",
      details: [
        "This fixture is connected to the tournament knockout bracket.",
        "Changing it may affect the next round and team progression.",
        "Please verify the bracket after making this change.",
      ],
      confirmText: "Continue Editing Bracket Fixture",
    };
  }

  if (started) {
    return {
      title: "⚠️ Tournament Already Started",
      level: "NORMAL",
      details: [
        "This tournament has already started.",
        "Changing this fixture may affect match schedules, live scores, match results, brackets, and team progression.",
      ],
      confirmText: "Continue Editing Fixture",
    };
  }

  return null; // No warning required before tournament starts
};

export const getFixtureDeleteWarning = (match, tournament) => {
  const started = isTournamentStarted(tournament);
  const isLive = match?.status === "LIVE";
  const isCompleted = match?.status === "COMPLETED";
  const hasBracketImpact = Boolean(match?.nextMatchNumber || match?.nextSlot);

  if (isLive) {
    return {
      title: "🔴 Delete Live Match?",
      level: "CRITICAL",
      details: [
        "This match is currently LIVE!",
        "Deleting this fixture will disrupt ongoing live scores, match tracking, and spectator streams.",
        "This action cannot be undone.",
      ],
      confirmText: "Delete Live Fixture",
    };
  }

  if (isCompleted) {
    return {
      title: "⚠️ Delete Completed Match?",
      level: "HIGH",
      details: [
        "This match is completed.",
        "Deleting this fixture will remove match results, scores, and standings records.",
        "This action cannot be undone.",
      ],
      confirmText: "Delete Completed Match",
    };
  }

  if (hasBracketImpact) {
    return {
      title: "⚠️ Delete Bracket Fixture?",
      level: "HIGH",
      details: [
        "This fixture is connected to the tournament bracket.",
        "Deleting it will break team progression into the next round.",
        "Please verify the bracket after deleting.",
      ],
      confirmText: "Delete Bracket Fixture",
    };
  }

  if (started) {
    return {
      title: "⚠️ Delete Fixture?",
      level: "NORMAL",
      details: [
        "This tournament has already started.",
        "Deleting this fixture may permanently affect match results, live scores, brackets, and team progression.",
      ],
      confirmText: "Delete Fixture",
    };
  }

  return {
    title: "Delete Fixture Match?",
    level: "NORMAL",
    details: ["Are you sure you want to delete this fixture match?"],
    confirmText: "Delete Fixture",
  };
};

export const getFixtureCreateWarning = (tournament) => {
  if (isTournamentStarted(tournament)) {
    return {
      title: "⚠️ Tournament Already Started",
      level: "NORMAL",
      details: [
        "You are adding a new fixture to a tournament that has already started.",
        "This may affect the existing tournament schedule and brackets.",
      ],
      confirmText: "Continue Creating Fixture",
    };
  }
  return null;
};

export const getRegenerateWarning = (tournament) => {
  if (isTournamentStarted(tournament)) {
    return {
      title: "🔴 WARNING — Regenerate Fixtures",
      level: "CRITICAL",
      details: [
        "This tournament has already started.",
        "Regenerating automatic fixtures may change or replace existing matches.",
        "This can affect live matches, completed results, brackets, team progression, and standings.",
        "This action can have major consequences.",
      ],
      confirmText: "Yes, Regenerate Fixtures",
    };
  }
  return null;
};

export const getSwitchMethodWarning = (tournament, currentMethod, newMethod) => {
  if (isTournamentStarted(tournament)) {
    return {
      title: "⚠️ Change Fixture Method?",
      level: "NORMAL",
      details: [
        "This tournament has already started.",
        "Changing the fixture method may affect existing fixtures, results, brackets, and team progression.",
        `Current method: ${currentMethod}`,
        `New method: ${newMethod}`,
      ],
      confirmText: "Continue Changing Method",
    };
  }
  return null;
};
