import mongoose from 'mongoose';

const standingsSchema = new mongoose.Schema(
  {
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true,
    },
    group: {
      type: String,
      default: 'Overall',
    },
    teamName: {
      type: String,
      required: true,
    },
    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
      default: null,
    },
    played: {
      type: Number,
      default: 0,
    },
    won: {
      type: Number,
      default: 0,
    },
    drawn: {
      type: Number,
      default: 0,
    },
    lost: {
      type: Number,
      default: 0,
    },
    points: {
      type: Number,
      default: 0,
    },
    goalsFor: {
      type: Number,
      default: 0,
    },
    goalsAgainst: {
      type: Number,
      default: 0,
    },
    goalDifference: {
      type: Number,
      default: 0,
    },
    form: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

standingsSchema.index({ tournament: 1, teamName: 1 }, { unique: true });

const Standings = mongoose.model('Standings', standingsSchema);
export default Standings;
