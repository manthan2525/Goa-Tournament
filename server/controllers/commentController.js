import Comment from '../models/Comment.js';
import Tournament from '../models/Tournament.js';
import User from '../models/User.js';
import { createNotification } from '../utils/notify.js';
import { logActivity } from '../models/ActivityLog.js';
import { getIO } from '../sockets/matchSocket.js';

// Helper to broadcast socket events safely
const emitSocketEvent = (tournamentId, event, data) => {
  try {
    const io = getIO();
    if (io && tournamentId) {
      io.to(`tournament_${tournamentId}`).emit(event, data);
      io.emit(`global_${event}`, { tournamentId, ...data });
    }
  } catch (err) {
    // Socket emit fail silent
  }
};

// @desc    Get paginated & sorted comments for a tournament with nested replies
// @route   GET /api/tournaments/:tournamentId/comments
// @access  Public
export const getTournamentComments = async (req, res, next) => {
  try {
    const { tournamentId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sort = req.query.sort || 'newest'; // 'newest', 'oldest', 'most_liked'
    const skip = (page - 1) * limit;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found.',
      });
    }

    // Determine sort order
    let sortOptions = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'most_liked') {
      sortOptions = { likesCount: -1, createdAt: -1 };
    }

    // Pipeline to count total active non-deleted comments
    const totalComments = await Comment.countDocuments({
      tournament: tournamentId,
      isDeleted: { $ne: true },
    });

    // Main parent comments query
    let query = { tournament: tournamentId, parentComment: null, isDeleted: { $ne: true } };

    let parentComments;

    if (sort === 'most_liked') {
      parentComments = await Comment.aggregate([
        { $match: query },
        {
          $addFields: {
            likesCount: { $size: { $ifNull: ['$likes', []] } },
          },
        },
        { $sort: { likesCount: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);
      // Populate user references after aggregation
      parentComments = await Comment.populate(parentComments, {
        path: 'user',
        select: 'name email role profilePhoto organizationName',
      });
    } else {
      parentComments = await Comment.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email role profilePhoto organizationName');
    }

    // Fetch replies for each parent comment
    const parentIds = parentComments.map((c) => c._id);

    const replies = await Comment.find({
      tournament: tournamentId,
      parentComment: { $in: parentIds },
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: 1 })
      .populate('user', 'name email role profilePhoto organizationName');

    // Group replies by parentComment ID
    const repliesMap = {};
    replies.forEach((reply) => {
      const pId = reply.parentComment.toString();
      if (!repliesMap[pId]) repliesMap[pId] = [];
      repliesMap[pId].push(reply);
    });

    // Format comments list
    const currentUserId = req.user?._id?.toString();

    const formattedComments = parentComments.map((c) => {
      const commentObj = c.toObject ? c.toObject() : c;
      const cReplies = repliesMap[commentObj._id.toString()] || [];

      return {
        ...commentObj,
        likesCount: commentObj.likes ? commentObj.likes.length : 0,
        isLikedByMe: currentUserId && commentObj.likes
          ? commentObj.likes.some((id) => id.toString() === currentUserId)
          : false,
        replies: cReplies.map((r) => {
          const rObj = r.toObject ? r.toObject() : r;
          return {
            ...rObj,
            likesCount: rObj.likes ? rObj.likes.length : 0,
            isLikedByMe: currentUserId && rObj.likes
              ? rObj.likes.some((id) => id.toString() === currentUserId)
              : false,
          };
        }),
      };
    });

    // Count unanswered questions (main comments without organizer replies)
    const unansweredCount = formattedComments.filter((c) => {
      return !c.replies.some((r) => r.isOrganizerReply);
    }).length;

    const totalPages = Math.ceil(totalComments / limit) || 1;

    res.status(200).json({
      success: true,
      tournamentId,
      totalComments,
      unansweredCount,
      page,
      pages: totalPages,
      hasMore: page < totalPages,
      comments: formattedComments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a main comment on a tournament
// @route   POST /api/tournaments/:tournamentId/comments
// @access  Private (Logged-in users)
export const createComment = async (req, res, next) => {
  try {
    const { tournamentId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment cannot be empty.',
      });
    }

    const trimmedText = text.trim();
    if (trimmedText.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Comment is too long (maximum 500 characters).',
      });
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found.',
      });
    }

    // Determine if poster is the tournament organizer
    const isOrganizer = tournament.organizer.toString() === req.user._id.toString();

    const newComment = await Comment.create({
      tournament: tournamentId,
      user: req.user._id,
      parentComment: null,
      text: trimmedText,
      isOrganizerReply: isOrganizer,
    });

    const populatedComment = await Comment.findById(newComment._id).populate(
      'user',
      'name email role profilePhoto organizationName'
    );

    const formattedComment = {
      ...populatedComment.toObject(),
      likesCount: 0,
      isLikedByMe: false,
      replies: [],
    };

    // If a player/user comments, send in-app notification to tournament organizer
    if (!isOrganizer && tournament.organizer) {
      await createNotification({
        recipient: tournament.organizer,
        sender: req.user._id,
        title: 'New Discussion Comment',
        message: `${req.user.name} commented on "${tournament.title}".`,
        type: 'SYSTEM',
        link: `/tournaments/${tournamentId}?tab=discussion#comment-${newComment._id}`,
      });
    }

    // Log Activity
    await logActivity({
      action: 'Tournament Comment Posted',
      performedBy: req.user._id,
      performerRole: req.user.role,
      targetType: 'TOURNAMENT',
      targetId: tournament._id,
      targetName: tournament.title,
      details: `${req.user.name} commented on ${tournament.title}`,
    });

    // Broadcast Socket.IO event
    emitSocketEvent(tournamentId, 'comment_added', {
      tournamentId,
      comment: formattedComment,
    });

    res.status(201).json({
      success: true,
      message: 'Comment posted successfully.',
      comment: formattedComment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reply to a comment (by Organizer or User)
// @route   POST /api/comments/:commentId/reply
// @access  Private
export const replyToComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply text cannot be empty.',
      });
    }

    const trimmedText = text.trim();
    if (trimmedText.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Reply is too long (maximum 500 characters).',
      });
    }

    const parentComment = await Comment.findById(commentId);
    if (!parentComment || parentComment.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Parent comment not found or has been deleted.',
      });
    }

    const tournament = await Tournament.findById(parentComment.tournament);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Associated tournament not found.',
      });
    }

    const isOrganizer = tournament.organizer.toString() === req.user._id.toString();

    // Create reply comment (link to top parent comment if nested)
    const targetParentId = parentComment.parentComment || parentComment._id;

    const reply = await Comment.create({
      tournament: parentComment.tournament,
      user: req.user._id,
      parentComment: targetParentId,
      text: trimmedText,
      isOrganizerReply: isOrganizer,
    });

    const populatedReply = await Comment.findById(reply._id).populate(
      'user',
      'name email role profilePhoto organizationName'
    );

    const formattedReply = {
      ...populatedReply.toObject(),
      likesCount: 0,
      isLikedByMe: false,
    };

    // If organizer replied to a user's comment, send notification to the original comment author
    if (isOrganizer && parentComment.user.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: parentComment.user,
        sender: req.user._id,
        title: 'Organizer Replied to Your Comment',
        message: `${req.user.name} (Organizer) replied to your comment on "${tournament.title}".`,
        type: 'SYSTEM',
        link: `/tournaments/${tournament._id}?tab=discussion#reply-${reply._id}`,
      });
    } else if (!isOrganizer && parentComment.user.toString() !== req.user._id.toString()) {
      // User replied to another comment
      await createNotification({
        recipient: parentComment.user,
        sender: req.user._id,
        title: 'New Reply to Your Comment',
        message: `${req.user.name} replied to your comment on "${tournament.title}".`,
        type: 'SYSTEM',
        link: `/tournaments/${tournament._id}?tab=discussion#reply-${reply._id}`,
      });
    }

    // Log Activity
    await logActivity({
      action: isOrganizer ? 'Organizer Reply Posted' : 'Comment Reply Posted',
      performedBy: req.user._id,
      performerRole: req.user.role,
      targetType: 'TOURNAMENT',
      targetId: tournament._id,
      targetName: tournament.title,
      details: `${req.user.name} replied to a comment on ${tournament.title}`,
    });

    // Broadcast Socket.IO event
    emitSocketEvent(tournament._id, 'comment_reply_added', {
      tournamentId: tournament._id,
      parentCommentId: targetParentId,
      reply: formattedReply,
    });

    res.status(201).json({
      success: true,
      message: 'Reply posted successfully.',
      reply: formattedReply,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit a comment or organizer reply
// @route   PUT /api/comments/:commentId
// @access  Private (Owner only)
export const updateComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text cannot be empty.',
      });
    }

    const trimmedText = text.trim();
    if (trimmedText.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Comment is too long (maximum 500 characters).',
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
    }

    // Authorization check: Only the author can edit their comment
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are only authorized to edit your own comments.',
      });
    }

    comment.text = trimmedText;
    comment.isEdited = true;
    await comment.save();

    const updatedComment = await Comment.findById(comment._id).populate(
      'user',
      'name email role profilePhoto organizationName'
    );

    // Broadcast Socket.IO event
    emitSocketEvent(comment.tournament, 'comment_updated', {
      tournamentId: comment.tournament,
      comment: updatedComment,
    });

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully.',
      comment: updatedComment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment or reply (by Owner, Tournament Organizer, or Admin)
// @route   DELETE /api/comments/:commentId
// @access  Private
export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
    }

    const tournament = await Tournament.findById(comment.tournament);

    const isCommentOwner = comment.user.toString() === req.user._id.toString();
    const isTournamentOrganizer = tournament && tournament.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    // Authorization check
    if (!isCommentOwner && !isTournamentOrganizer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment.',
      });
    }

    // Check if this comment has child replies
    const childRepliesCount = await Comment.countDocuments({
      parentComment: comment._id,
      isDeleted: { $ne: true },
    });

    if (childRepliesCount > 0) {
      // Soft-delete if it has child replies
      comment.isDeleted = true;
      comment.text = '[Comment deleted]';
      await comment.save();
    } else {
      // Hard delete if standalone
      await Comment.findByIdAndDelete(comment._id);
    }

    // Broadcast Socket.IO event
    emitSocketEvent(comment.tournament, 'comment_deleted', {
      tournamentId: comment.tournament,
      commentId: comment._id,
    });

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully.',
      commentId: comment._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like / reaction on a comment
// @route   POST /api/comments/:commentId/like
// @access  Private
export const toggleLikeComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
    }

    const index = comment.likes.indexOf(userId);
    let isLiked = false;

    if (index === -1) {
      comment.likes.push(userId);
      isLiked = true;
    } else {
      comment.likes.splice(index, 1);
      isLiked = false;
    }

    await comment.save();

    // Broadcast Socket.IO event
    emitSocketEvent(comment.tournament, 'comment_like_toggled', {
      tournamentId: comment.tournament,
      commentId: comment._id,
      likesCount: comment.likes.length,
      userId,
      isLiked,
    });

    res.status(200).json({
      success: true,
      likesCount: comment.likes.length,
      isLikedByMe: isLiked,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get organizer comments overview for Organizer Dashboard
// @route   GET /api/organizers/comments
// @access  Private (ORGANIZER or ADMIN)
export const getOrganizerComments = async (req, res, next) => {
  try {
    let tournamentIds = [];

    if (req.user.role === 'ADMIN') {
      const allTournaments = await Tournament.find({}).select('_id');
      tournamentIds = allTournaments.map((t) => t._id);
    } else {
      const myTournaments = await Tournament.find({ organizer: req.user._id }).select('_id');
      tournamentIds = myTournaments.map((t) => t._id);
    }

    if (tournamentIds.length === 0) {
      return res.status(200).json({
        success: true,
        stats: {
          totalComments: 0,
          unansweredCount: 0,
          repliedCount: 0,
        },
        recentComments: [],
      });
    }

    const totalComments = await Comment.countDocuments({
      tournament: { $in: tournamentIds },
      isDeleted: { $ne: true },
    });

    // Fetch main parent comments for organizer's tournaments
    const mainComments = await Comment.find({
      tournament: { $in: tournamentIds },
      parentComment: null,
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .populate('user', 'name email role profilePhoto organizationName')
      .populate('tournament', 'title sport location banner startDate');

    const parentIds = mainComments.map((c) => c._id);

    // Fetch replies
    const replies = await Comment.find({
      tournament: { $in: tournamentIds },
      parentComment: { $in: parentIds },
      isDeleted: { $ne: true },
    }).populate('user', 'name email role profilePhoto organizationName');

    const repliesMap = {};
    replies.forEach((r) => {
      const pId = r.parentComment.toString();
      if (!repliesMap[pId]) repliesMap[pId] = [];
      repliesMap[pId].push(r);
    });

    let unansweredCount = 0;
    let repliedCount = 0;

    const formattedRecent = mainComments.map((c) => {
      const cObj = c.toObject();
      const cReplies = repliesMap[cObj._id.toString()] || [];
      const hasOrganizerReply = cReplies.some((r) => r.isOrganizerReply);

      if (hasOrganizerReply) {
        repliedCount++;
      } else {
        unansweredCount++;
      }

      return {
        ...cObj,
        hasOrganizerReply,
        replies: cReplies,
      };
    });

    res.status(200).json({
      success: true,
      stats: {
        totalComments,
        unansweredCount,
        repliedCount,
      },
      recentComments: formattedRecent,
    });
  } catch (error) {
    next(error);
  }
};
