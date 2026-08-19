import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    performerRole: {
      type: String,
      default: 'SYSTEM',
    },
    targetType: {
      type: String,
      enum: ['USER', 'ORGANIZER', 'TOURNAMENT', 'REGISTRATION', 'PAYMENT', 'MATCH', 'SYSTEM'],
      default: 'SYSTEM',
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    targetName: {
      type: String,
      default: '',
    },
    details: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Add index for fast querying by date and target
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ targetType: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;

// Helper to log activities safely
export const logActivity = async ({
  action,
  performedBy = null,
  performerRole = 'SYSTEM',
  targetType = 'SYSTEM',
  targetId = null,
  targetName = '',
  details = '',
  ipAddress = '',
}) => {
  try {
    await ActivityLog.create({
      action,
      performedBy,
      performerRole,
      targetType,
      targetId,
      targetName,
      details,
      ipAddress,
    });
  } catch (err) {
    // Non-blocking log failure
    console.error('[ActivityLog Error]:', err.message);
  }
};
