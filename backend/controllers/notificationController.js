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

// @desc    Check for task reminders, overdue tasks, and tasks due soon
// @route   INTERNAL
exports.checkTaskNotifications = async (userId) => {
  try {
    const now = new Date();
    
    // Convert to your local timezone (UTC+5)
    const localNow = new Date(now.getTime() + (5 * 60 * 60 * 1000));
    const oneHourFromNow = new Date(localNow.getTime() + (60 * 60 * 1000));
    
    // Find tasks that are not completed and archived
    const tasks = await Task.find({
      user: userId,
      status: { $nin: ['completed', 'archived'] },
      dueDate: { $exists: true, $ne: null }
    });
    
    let notificationsCreated = 0;

    for (const task of tasks) {
      let taskUpdated = false;
      
      // Check existing reminders
      if (task.reminders && task.reminders.length > 0) {
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
      }
      
      // Check for overdue tasks
      const taskDueLocalTime = new Date(task.dueDate.getTime() + (5 * 60 * 60 * 1000));
      
      if (taskDueLocalTime < localNow) {
        // Check if we already sent an overdue notification
        const existingOverdueNotification = await Notification.findOne({
          user: userId,
          relatedTask: task._id,
          type: 'overdue',
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Within last 24 hours
        });

        if (!existingOverdueNotification) {
          console.log(`⏰ Creating overdue notification for task: ${task.title}`);
          
          const hoursOverdue = Math.floor((localNow - taskDueLocalTime) / (1000 * 60 * 60));
          const daysOverdue = Math.floor(hoursOverdue / 24);
          
          let overdueMessage;
          if (daysOverdue > 0) {
            overdueMessage = `"${task.title}" is ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`;
          } else {
            overdueMessage = `"${task.title}" is ${hoursOverdue} hour${hoursOverdue > 1 ? 's' : ''} overdue`;
          }
          
          await Notification.create({
            user: userId,
            title: 'Task Overdue',
            message: overdueMessage,
            type: 'overdue',
            relatedTask: task._id,
            metadata: {
              dueDate: task.dueDate,
              priority: task.priority,
              hoursOverdue: hoursOverdue,
              daysOverdue: daysOverdue,
              localDueTime: taskDueLocalTime
            }
          });

          notificationsCreated++;
        }
      }
      
      // Check for tasks due within 1 hour
      else if (taskDueLocalTime > localNow && taskDueLocalTime <= oneHourFromNow) {
        // Check if we already sent a due soon notification
        const existingDueSoonNotification = await Notification.findOne({
          user: userId,
          relatedTask: task._id,
          type: 'due_soon',
          createdAt: { $gte: new Date(Date.now() - 2 * 60 * 60 * 1000) } // Within last 2 hours
        });

        if (!existingDueSoonNotification) {
          console.log(`⏳ Creating due soon notification for task: ${task.title}`);
          
          const minutesRemaining = Math.floor((taskDueLocalTime - localNow) / (1000 * 60));
          
          let dueSoonMessage;
          if (minutesRemaining <= 5) {
            dueSoonMessage = `"${task.title}" is due in ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''}`;
          } else {
            const hoursRemaining = Math.floor(minutesRemaining / 60);
            const remainingMinutes = minutesRemaining % 60;
            
            if (hoursRemaining > 0) {
              dueSoonMessage = `"${task.title}" is due in ${hoursRemaining}h ${remainingMinutes}m`;
            } else {
              dueSoonMessage = `"${task.title}" is due in ${minutesRemaining} minutes`;
            }
          }
          
          await Notification.create({
            user: userId,
            title: 'Task Due Soon',
            message: dueSoonMessage,
            type: 'due_soon',
            relatedTask: task._id,
            metadata: {
              dueDate: task.dueDate,
              priority: task.priority,
              minutesRemaining: minutesRemaining,
              localDueTime: taskDueLocalTime
            }
          });

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