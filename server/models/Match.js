import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'TBD',
    },
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
      default: null,
    },
  },
  { _id: false }
);

const matchScoreSchema = new mongoose.Schema(
  {
    current: {
      type: Number,
      default: 0,
    },
    display: {
      type: String,
      default: '0',
    },
    detail: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

const matchSchema = new mongoose.Schema(
  {
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true,
    },
    round: {
      type: String,
      required: true,
      default: 'Round 1',
    },
    roundIndex: {
      type: Number,
      default: 1,
    },
    matchNumber: {
      type: Number,
      required: true,
    },
    group: {
      type: String,
      default: null,
    },
    teamA: {
      type: participantSchema,
      required: true,
      default: () => ({ name: 'TBD' }),
    },
    teamB: {
      type: participantSchema,
      required: true,
      default: () => ({ name: 'TBD' }),
    },
    scoreA: {
      type: matchScoreSchema,
      default: () => ({ current: 0, display: '0', detail: {} }),
    },
    scoreB: {
      type: matchScoreSchema,
      default: () => ({ current: 0, display: '0', detail: {} }),
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'LIVE', 'COMPLETED', 'ABANDONED'],
      default: 'SCHEDULED',
    },
    winner: {
      name: { type: String, default: null },
      registrationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Registration',
        default: null,
      },
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    venueCourt: {
      type: String,
      default: 'Main Arena',
    },
    summary: {
      type: String,
      default: '',
    },
    nextMatchNumber: {
      type: Number,
      default: null,
    },
    nextSlot: {
      type: String,
      enum: ['teamA', 'teamB', null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Match = mongoose.model('Match', matchSchema);
export default Match;
