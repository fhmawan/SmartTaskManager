const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  dueDate: {
    type: Date,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'archived'],
    default: 'pending'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subtasks: [{
    title: String,
    completed: Boolean,
    _id: false
  }],
  tags: [String],
  reminders: [{
    time: Date,
    sent: {
      type: Boolean,
      default: false
    },
    _id: false
  }],
  completedAt: Date,
  syncVersion: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ user: 1, category: 1 });

// Virtual for formatted due date
taskSchema.virtual('formattedDueDate').get(function() {
  return this.dueDate?.toISOString().split('T')[0];
});

// Pre-save hook for completedAt
taskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

// Static method to get user's tasks
taskSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId }).populate('category', 'name color');
};

// Instance method to add subtask
taskSchema.methods.addSubtask = function(subtask) {
  this.subtasks.push(subtask);
  return this.save();
};

// Instance method to update status
taskSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  if (newStatus === 'completed') {
    this.completedAt = new Date();
  }
  return this.save();
};

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;