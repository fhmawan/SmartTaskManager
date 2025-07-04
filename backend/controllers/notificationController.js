const Notification = require('../models/Notification');
const Task = require('../models/Task');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return next(new ErrorResponse('Notification not found', 404));
    }

    if (notification.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this notification', 401));
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return next(new ErrorResponse('Notification not found', 404));
    }

    if (notification.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to delete this notification', 401));
    }

    await notification.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Check for task reminders
// @route   INTERNAL
exports.checkTaskNotifications = async (userId) => {
  try {
    const now = new Date();
    const threshold = new Date(now.getTime() + 30 * 60000); // 30 minutes from now

    const tasks = await Task.find({
      user: userId,
      dueDate: { $lte: threshold, $gte: now },
      status: { $ne: 'completed' },
      'reminders.sent': false
    });

    await Promise.all(tasks.map(async (task) => {
      // Create notification
      await Notification.create({
        user: userId,
        title: 'Task Reminder',
        message: `${task.title} is due soon`,
        type: 'reminder',
        relatedTask: task._id,
        metadata: {
          dueDate: task.dueDate,
          priority: task.priority
        }
      });

      // Update reminders
      task.reminders = task.reminders.map(reminder => ({
        ...reminder,
        sent: reminder.sent || reminder.time <= threshold
      }));

      await task.save();
    }));
  } catch (err) {
    console.error('Error checking task notifications:', err);
  }
};