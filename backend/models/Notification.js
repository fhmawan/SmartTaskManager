const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['reminder', 'system', 'update', 'overdue', 'due_soon'],
    required: true
  },
  relatedTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  read: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // Auto-delete after 30 days

// Virtual for formatted date
notificationSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleString();
});

// Static method to create a reminder notification
notificationSchema.statics.createReminder = async function(userId, task, reminderTime) {
  return this.create({
    user: userId,
    title: 'Task Reminder',
    message: `"${task.title}" is due soon`,
    type: 'reminder',
    relatedTask: task._id,
    metadata: {
      dueDate: task.dueDate,
      reminderTime: reminderTime
    }
  });
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function(userId) {
  return this.updateMany(
    { user: userId, read: false },
    { $set: { read: true } }
  );
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  return this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;