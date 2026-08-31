import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { uploadImageBuffer } from '../config/cloudinary.js';
import { sendPasswordResetEmail, sendOtpEmail } from '../utils/emailService.js';
import { createNotification } from '../utils/notify.js';
import { logActivity } from '../models/ActivityLog.js';

// Helper to sign JWT and set HTTP-only cookie
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'goa_tournament_super_secret_jwt_key_2026_mca_project',
    { expiresIn: '7d' }
  );

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  const userObj = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    organizationName: user.organizationName,
    profilePhoto: user.profilePhoto || user.profileImage || '',
    profileImage: user.profilePhoto || user.profileImage || '',
    bio: user.bio,
    location: user.location,
    createdAt: user.createdAt,
  };

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    message,
    token, // Provided for clients using Bearer header
    user: userObj,
  });
};

// @desc    Register a new user (PLAYER or ORGANIZER - Admin cannot be registered via public endpoint)
// @route   POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, organizationName, bio, location } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    let profilePhotoUrl = '';
    if (req.file) {
      profilePhotoUrl = await uploadImageBuffer(req.file.buffer, req.file.mimetype, 'avatars');
    }

    // Never allow ADMIN creation via public register endpoint
    const assignedRole = role === 'ORGANIZER' ? 'ORGANIZER' : 'PLAYER';

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone || '',
      role: assignedRole,
      organizationName: organizationName || '',
      profilePhoto: profilePhotoUrl,
      bio: bio || '',
      location: location || 'Goa, India',
    });

    await logActivity({
      action: assignedRole === 'ORGANIZER' ? 'New Organizer Registered' : 'New User Registered',
      performedBy: user._id,
      performerRole: assignedRole,
      targetType: assignedRole === 'ORGANIZER' ? 'ORGANIZER' : 'USER',
      targetId: user._id,
      targetName: user.name,
      details: `${user.name} registered as ${assignedRole}`,
    });

    sendTokenResponse(user, 201, res, 'Registration successful! Welcome to Goa Tournament.');
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated by administrator.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    sendTokenResponse(user, 200, res, 'Logged in successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user
// @route   GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile details
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, bio, location, organizationName } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (location !== undefined) user.location = location.trim();
    if (organizationName !== undefined) user.organizationName = organizationName.trim();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload / Update profile photo
// @route   POST /api/auth/profile-photo
export const uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file to upload.',
      });
    }

    const imageUrl = await uploadImageBuffer(req.file.buffer, req.file.mimetype, 'avatars');

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    user.profilePhoto = imageUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully.',
      profilePhoto: imageUrl,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove profile photo (restore default avatar)
// @route   DELETE /api/auth/profile-photo
export const removeProfilePhoto = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    user.profilePhoto = '';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile photo removed. Default avatar restored.',
      profilePhoto: '',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password - generate 6-digit OTP code & send email
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered email address.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.',
      });
    }

    // Generate 6-digit numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP code & save to user with 10-minute expiration
    const hashedOtp = crypto.createHash('sha256').update(otpCode).digest('hex');
    user.resetOtp = hashedOtp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Also generate link resetToken for backwards compatibility
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    await user.save({ validateBeforeSave: false });

    // Send 6-digit OTP email and await completion
    try {
      await sendOtpEmail(user.email, otpCode, user.name);
    } catch (emailErr) {
      console.error('[OTP Email Error]', emailErr.message);
      return res.status(400).json({
        success: false,
        message: emailErr.message || 'Failed to deliver OTP email to your inbox. Please check server SMTP configuration.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `A 6-digit OTP verification code has been sent to your email (${user.email}). Please check your inbox.`,
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using 6-digit OTP
// @route   POST /api/auth/reset-password-otp
export const resetPasswordWithOtp = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, 6-digit OTP code, and new password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const cleanOtp = otp.toString().replace(/\D/g, '');
    const hashedOtp = crypto.createHash('sha256').update(cleanOtp).digest('hex');

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetOtp: hashedOtp,
      resetOtpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired 6-digit OTP code. Please request a new OTP.',
      });
    }

    // Update user password and clear OTP fields
    user.password = password;
    user.resetOtp = null;
    user.resetOtpExpires = null;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    // Log activity
    await logActivity({
      action: 'Password Reset Completed',
      performedBy: user._id,
      performerRole: user.role,
      targetType: 'USER',
      targetId: user._id,
      targetName: user.name,
      details: `${user.name} reset their password via email OTP verification`,
    });

    // Create system notification
    await createNotification({
      recipient: user._id,
      title: 'Password Updated',
      message: 'Your account password was successfully reset using OTP verification.',
      type: 'SYSTEM',
    });

    sendTokenResponse(user, 200, res, 'Password reset successful! You are now logged in.');
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using token (URL link fallback)
// @route   POST /api/auth/reset-password/:token
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    // Hash token to compare with database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset link. Please request a new OTP.',
      });
    }

    // Set new password
    user.password = password;
    user.resetOtp = null;
    user.resetOtpExpires = null;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    // Create notification
    await createNotification({
      recipient: user._id,
      title: 'Password Changed',
      message: 'Your account password was updated successfully.',
      type: 'SYSTEM',
    });

    sendTokenResponse(user, 200, res, 'Password reset successful! You are now logged in.');
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
export const logout = async (req, res) => {
  const cookieOptions = {
    expires: new Date(0), // Immediately expire cookie in browser
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('token', '', cookieOptions);
  res.clearCookie('token', cookieOptions);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};
