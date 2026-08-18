import Notification from '../models/Notification.js';

let ioInstance = null;

export const setNotificationIO = (io) => {
  ioInstance = io;
};

/**
 * Creates and sends an in-app notification to a user
 */
export const createNotification = async ({
  recipient,
  sender = null,
  title,
  message,
  type = 'SYSTEM',
  link = '',
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      title,
      message,
      type,
      link,
    });

    if (ioInstance) {
      // Emit to recipient's private room
      ioInstance.to(`user_${recipient}`).emit('new_notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('[Notification Error]', error.message);
    return null;
  }
};
