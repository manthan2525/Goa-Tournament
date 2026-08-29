import mongoose from 'mongoose';

const tournamentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a tournament name'],
      trim: true,
      maxlength: [100, 'Tournament name cannot exceed 100 characters'],
    },
    sport: {
      type: String,
      required: [true, 'Please specify the sport'],
      enum: [
        'Football',
        'Cricket',
        'Badminton',
        'Chess',
        'Kabaddi',
        'Table Tennis',
        'Volleyball',
        'Basketball',
        'Futsal',
        'Tennis',
      ],
      default: 'Football',
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    venue: {
      type: String,
      required: [true, 'Please provide a venue name'],
      trim: true,
    },
    location: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Please provide a location'],
    },
    startDate: {
      type: Date,
      required: [true, 'Please specify start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please specify end date'],
    },
    startTime: {
      type: String,
      default: '09:00 AM',
    },
    registrationDeadline: {
      type: Date,
    },
    registrationFee: {
      type: Number,
      required: [true, 'Please specify registration fee (0 for free)'],
      min: [0, 'Fee cannot be negative'],
      default: 0,
    },
    upiId: {
      type: String,
      trim: true,
      default: '',
    },
    qrCode: {
      type: String,
      default: '',
    },
    format: {
      type: String,
      enum: ['KNOCKOUT', 'ROUND_ROBIN', 'GROUP_KNOCKOUT'],
      default: 'KNOCKOUT',
    },
    groupAssignmentMode: {
      type: String,
      enum: ['AUTOMATIC', 'MANUAL'],
      default: 'AUTOMATIC',
    },
    numberOfGroups: {
      type: Number,
      default: 2,
      min: 2,
      max: 8,
    },
    groupAssignments: [
      {
        groupName: { type: String, required: true },
        teamRegistrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration' },
        teamName: { type: String, required: true },
      },
    ],
    maxTeams: {
      type: Number,
      required: true,
      min: [2, 'At least 2 teams required'],
      max: [64, 'Maximum 64 teams supported'],
      default: 16,
    },
    teamSize: {
      type: Number,
      default: 11,
    },
    prizePool: {
      type: String,
      default: '',
    },
    prizes: [
      {
        position: { type: Number, default: 1 },
        title: { type: String, required: true, default: 'Prize' },
        amount: { type: Number, default: 0 },
        description: { type: String, default: '' },
      },
    ],
    rules: {
      type: String,
      default: '',
    },
    bannerImage: {
      type: String,
      default: '',
    },
    requireAadhaarVerification: {
      type: Boolean,
      default: false,
    },
    winner: {
      type: String,
      default: '',
      trim: true,
    },
    runnerUp: {
      type: String,
      default: '',
      trim: true,
    },
    thirdPlace: {
      type: String,
      default: '',
      trim: true,
    },
    winnerType: {
      type: String,
      enum: ['TEAM', 'INDIVIDUAL'],
      default: 'TEAM',
    },
    status: {
      type: String,
      enum: [
        'UPCOMING',
        'REGISTRATION_OPEN',
        'REGISTRATION_CLOSED',
        'ONGOING',
        'COMPLETED',
        'CANCELLED',
        'DRAFT',
      ],
      default: 'REGISTRATION_OPEN',
    },
    registeredTeamsCount: {
      type: Number,
      default: 0,
    },
    isTestData: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual alias for banner
tournamentSchema.virtual('banner').get(function () {
  return this.bannerImage || '';
}).set(function (val) {
  this.bannerImage = val;
});

// Virtual for remaining slots
tournamentSchema.virtual('slotsRemaining').get(function () {
  return Math.max(0, this.maxTeams - (this.registeredTeamsCount || 0));
});

const Tournament = mongoose.model('Tournament', tournamentSchema);
export default Tournament;
