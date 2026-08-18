import mongoose from 'mongoose';

const playerItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    jerseyNumber: {
      type: Number,
      default: null,
    },
    role: {
      type: String,
      trim: true,
      default: 'Player',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
);

const registrationSchema = new mongoose.Schema(
  {
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teamName: {
      type: String,
      required: [true, 'Please provide team / participant name'],
      trim: true,
      maxlength: [60, 'Team name cannot exceed 60 characters'],
    },
    captainName: {
      type: String,
      required: [true, 'Please provide captain / player in-charge name'],
      trim: true,
    },
    contactPhone: {
      type: String,
      required: [true, 'Please provide contact phone number'],
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    playersList: [playerItemSchema],
    status: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING',
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate team registration by same user in same tournament
registrationSchema.index({ tournament: 1, user: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);
export default Registration;
