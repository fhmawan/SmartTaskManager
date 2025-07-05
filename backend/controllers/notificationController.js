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
    
    // Convert to your local timezone (UTC+5)
    const localNow = new Date(now.getTime() + (5 * 60 * 60 * 1000));
    
    
    // Find tasks that are not completed and have reminders
    const tasks = await Task.find({
      user: userId,
      status: { $ne: 'completed' },
      $and: [
        { reminders: { $exists: true } },
        { reminders: { $ne: [] } }
      ]
    });
    
    let notificationsCreated = 0;

    for (const task of tasks) {
      let taskUpdated = false;
      

      for (let i = 0; i < task.reminders.length; i++) {

        const reminder = task.reminders[i];
        const reminderLocalTime = new Date(reminder.time.getTime() + (5 * 60 * 60 * 1000));

        console.log(reminderLocalTime, localNow, reminder.sent);
        if (reminderLocalTime <= localNow && !reminder.sent) {
          console.log(`🚨 Creating notification for task: ${task.title} (reminder time: ${reminderLocalTime.toISOString()})`);
          
          await Notification.create({
            user: userId,
            title: 'Task Reminder',
            message: `${task.title} reminder`,
            type: 'reminder',
            relatedTask: task._id,
            metadata: {
              dueDate: task.dueDate,
              priority: task.priority,
              reminderTime: reminder.time,
              localReminderTime: reminderLocalTime
            }
          });

          // Mark this reminder as sent
          task.reminders[i].sent = true;
          taskUpdated = true;
          notificationsCreated++;
        }
      }
      
      // Save task if any reminder was marked as sent
      if (taskUpdated) {
        await task.save();
        console.log(`✅ Updated task reminders for: ${task.title}`);
      }
    }
    
    console.log(`📨 Created ${notificationsCreated} notifications for user ${userId}`);
    
  } catch (err) {
    console.error('❌ Error checking task notifications:', err);
  }
};