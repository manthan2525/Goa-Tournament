import User from '../models/User.js';
import Tournament from '../models/Tournament.js';
import Registration from '../models/Registration.js';
import ActivityLog, { logActivity } from '../models/ActivityLog.js';

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $in: ['PLAYER', 'USER'] } });
    const totalOrganizers = await User.countDocuments({ role: 'ORGANIZER' });
    const totalTournaments = await Tournament.countDocuments({});
    const totalRegistrations = await Registration.countDocuments({});

    // Tournaments grouped by status
    const statusCounts = await Tournament.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const tournamentsByStatus = {
      UPCOMING: 0,
      REGISTRATION_OPEN: 0,
      REGISTRATION_CLOSED: 0,
      ONGOING: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      DRAFT: 0,
    };
    statusCounts.forEach((item) => {
      if (item._id && tournamentsByStatus[item._id] !== undefined) {
        tournamentsByStatus[item._id] = item.count;
      }
    });

    // Registrations by payment/verification status
    const regCounts = await Registration.aggregate([
      { $group: { _id: '$paymentStatus', count: { $sum: 1 } } },
    ]);
    const registrationsByStatus = {
      PENDING: 0,
      APPROVED: 0, // Maps to VERIFIED in Payment schema
      REJECTED: 0,
    };
    regCounts.forEach((item) => {
      if (item._id === 'VERIFIED') registrationsByStatus.APPROVED = item.count;
      else if (item._id === 'REJECTED') registrationsByStatus.REJECTED = item.count;
      else if (item._id === 'PENDING') registrationsByStatus.PENDING = item.count;
    });

    // Recent 5 Users
    const recentUsers = await User.find({ role: { $in: ['PLAYER', 'USER'] } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email profilePhoto role createdAt');

    // Recent 5 Organizers with their tournament counts
    const recentOrganizersRaw = await User.find({ role: 'ORGANIZER' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email profilePhoto organizationName createdAt');

    const recentOrganizers = await Promise.all(
      recentOrganizersRaw.map(async (org) => {
        const count = await Tournament.countDocuments({ organizer: org._id });
        return {
          ...org.toObject(),
          tournamentCount: count,
        };
      })
    );

    // Recent 5 Tournaments
    const recentTournaments = await Tournament.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('organizer', 'name email');

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalOrganizers,
        totalTournaments,
        totalRegistrations,
        tournamentsByStatus,
        registrationsByStatus,
        recentUsers,
        recentOrganizers,
        recentTournaments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Paginated Users
// @route   GET /api/admin/users
export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const search = req.query.search || '';

    const query = {
      role: { $in: ['PLAYER', 'USER'] },
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-password');

    res.status(200).json({
      success: true,
      data: {
        users,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Single User Details
// @route   GET /api/admin/users/:id
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const registrationCount = await Registration.countDocuments({ user: user._id });

    res.status(200).json({
      success: true,
      data: {
        user,
        registrationCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete User Account (Safely without deleting organizer data)
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Cannot delete an ADMIN user.' });
    }

    // Remove user's registrations safely
    await Registration.deleteMany({ user: user._id });
    await User.findByIdAndDelete(user._id);

    await logActivity({
      action: 'Delete User Account',
      performedBy: req.user._id,
      performerRole: 'ADMIN',
      targetType: 'USER',
      targetId: user._id,
      targetName: user.name,
      details: `Admin deleted user ${user.name} (${user.email})`,
    });

    res.status(200).json({
      success: true,
      message: `User ${user.name} has been deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle User Active Status
// @route   PATCH /api/admin/users/:id/toggle-status
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = user.isActive === false ? true : false;
    await user.save();

    await logActivity({
      action: user.isActive ? 'Activate User' : 'Deactivate User',
      performedBy: req.user._id,
      performerRole: 'ADMIN',
      targetType: 'USER',
      targetId: user._id,
      targetName: user.name,
      details: `User status set to ${user.isActive ? 'Active' : 'Inactive'}`,
    });

    res.status(200).json({
      success: true,
      message: `User ${user.name} status updated to ${user.isActive ? 'Active' : 'Inactive'}.`,
      data: { isActive: user.isActive },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Paginated Organizers
// @route   GET /api/admin/organizers
export const getOrganizers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const search = req.query.search || '';

    const query = { role: 'ORGANIZER' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { organizationName: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const organizersRaw = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-password');

    const organizers = await Promise.all(
      organizersRaw.map(async (org) => {
        const count = await Tournament.countDocuments({ organizer: org._id });
        return {
          ...org.toObject(),
          tournamentCount: count,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        organizers,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Organizer Details & Their Tournaments
// @route   GET /api/admin/organizers/:id
export const getOrganizerById = async (req, res, next) => {
  try {
    const organizer = await User.findById(req.params.id).select('-password');
    if (!organizer || organizer.role !== 'ORGANIZER') {
      return res.status(404).json({ success: false, message: 'Organizer not found' });
    }

    const tournaments = await Tournament.find({ organizer: organizer._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        organizer,
        tournaments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate/Soft Delete Organizer Account
// @route   DELETE /api/admin/organizers/:id
export const deleteOrganizer = async (req, res, next) => {
  try {
    const organizer = await User.findById(req.params.id);
    if (!organizer) {
      return res.status(404).json({ success: false, message: 'Organizer not found' });
    }

    // Soft delete / deactivate to preserve historical tournament integrity
    organizer.isActive = false;
    await organizer.save();

    await logActivity({
      action: 'Deactivate Organizer Account',
      performedBy: req.user._id,
      performerRole: 'ADMIN',
      targetType: 'ORGANIZER',
      targetId: organizer._id,
      targetName: organizer.name,
      details: `Deactivated organizer ${organizer.name} while preserving their tournaments.`,
    });

    res.status(200).json({
      success: true,
      message: `Organizer ${organizer.name} deactivated. Tournaments remain intact.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Tournaments for Admin (Across All Organizers)
// @route   GET /api/admin/tournaments
export const getAdminTournaments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const organizerId = req.query.organizer || '';
    const sort = req.query.sort || 'newest';

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sport: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) query.status = status;
    if (organizerId) query.organizer = organizerId;

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'startDate') sortOption = { startDate: 1 };
    if (sort === 'registrations') sortOption = { registeredTeamsCount: -1 };

    const total = await Tournament.countDocuments(query);
    const tournaments = await Tournament.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('organizer', 'name email organizationName profilePhoto');

    res.status(200).json({
      success: true,
      data: {
        tournaments,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Single Tournament Detail for Admin
// @route   GET /api/admin/tournaments/:id
export const getAdminTournamentById = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id).populate(
      'organizer',
      'name email phone organizationName profilePhoto'
    );

    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    const registrations = await Registration.find({ tournament: tournament._id })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        tournament,
        registrations,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Update Any Tournament
// @route   PUT /api/admin/tournaments/:id
export const updateAdminTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    // Apply allowed update fields, preserving original organizer
    const allowedFields = [
      'name',
      'sport',
      'description',
      'venue',
      'location',
      'startDate',
      'endDate',
      'startTime',
      'registrationDeadline',
      'registrationFee',
      'upiId',
      'format',
      'maxTeams',
      'teamSize',
      'prizePool',
      'rules',
      'requireAadhaarVerification',
      'status',
      'winner',
      'runnerUp',
      'thirdPlace',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'location' && typeof req.body.location === 'string') {
          try {
            tournament.location = JSON.parse(req.body.location);
          } catch (e) {
            tournament.location = req.body.location;
          }
        } else {
          tournament[field] = req.body[field];
        }
      }
    });

    if (req.file) {
      const { uploadImageBuffer } = await import('../config/cloudinary.js');
      tournament.bannerImage = await uploadImageBuffer(req.file.buffer, req.file.mimetype, 'banners');
    }

    await tournament.save();

    await logActivity({
      action: 'Admin Update Tournament',
      performedBy: req.user._id,
      performerRole: 'ADMIN',
      targetType: 'TOURNAMENT',
      targetId: tournament._id,
      targetName: tournament.name,
      details: `Admin updated parameters for "${tournament.name}"`,
    });

    res.status(200).json({
      success: true,
      message: 'Tournament updated successfully by Admin.',
      tournament,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Delete Any Tournament (With Cascade Cleanup)
// @route   DELETE /api/admin/tournaments/:id
export const deleteAdminTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found' });
    }

    const tName = tournament.name;

    // Delete associated registrations
    await Registration.deleteMany({ tournament: tournament._id });

    // Delete tournament
    await Tournament.findByIdAndDelete(tournament._id);

    await logActivity({
      action: 'Admin Delete Tournament',
      performedBy: req.user._id,
      performerRole: 'ADMIN',
      targetType: 'TOURNAMENT',
      targetId: tournament._id,
      targetName: tName,
      details: `Admin deleted tournament "${tName}" and cleared registrations.`,
    });

    res.status(200).json({
      success: true,
      message: `Tournament "${tName}" deleted successfully by Admin.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Registrations Across Platform
// @route   GET /api/admin/registrations
export const getAdminRegistrations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const status = req.query.status || '';

    const query = {};
    if (status) query.paymentStatus = status;

    const total = await Registration.countDocuments(query);
    const registrations = await Registration.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('tournament', 'name sport venue location registrationFee organizer')
      .populate('user', 'name email phone');

    res.status(200).json({
      success: true,
      data: {
        registrations,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Admin Aggregated Analytics & Reports
// @route   GET /api/admin/reports
export const getReports = async (req, res, next) => {
  try {
    // Sport breakdown
    const sportsData = await Tournament.aggregate([
      { $group: { _id: '$sport', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Top Organizers
    const topOrganizersData = await Tournament.aggregate([
      { $group: { _id: '$organizer', tournamentCount: { $sum: 1 } } },
      { $sort: { tournamentCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'organizerInfo',
        },
      },
      { $unwind: '$organizerInfo' },
      {
        $project: {
          name: '$organizerInfo.name',
          email: '$organizerInfo.email',
          organizationName: '$organizerInfo.organizationName',
          tournamentCount: 1,
        },
      },
    ]);

    // Monthly Registration Distribution
    const monthlyRegistrations = await Registration.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    // Location Breakdown
    const locationData = await Tournament.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        sportsData,
        topOrganizersData,
        monthlyRegistrations,
        locationData,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Platform Activity Audit Logs
// @route   GET /api/admin/activity-logs
export const getActivityLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;

    const total = await ActivityLog.countDocuments({});
    const logs = await ActivityLog.find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('performedBy', 'name email role');

    res.status(200).json({
      success: true,
      data: {
        logs,
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
