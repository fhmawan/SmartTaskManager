const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30
  },
  color: {
    type: String,
    default: '#4f46e5', // Default indigo color
    validate: {
      validator: (v) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v),
      message: props => `${props.value} is not a valid hex color!`
    }
  },
  icon: {
    type: String,
    default: 'list' // Default icon name
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  syncVersion: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Unique compound index for user and category name
categorySchema.index({ user: 1, name: 1 }, { unique: true });

// Virtual for task count
categorySchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Updated pre-delete hook using newer Mongoose methods
categorySchema.pre('findOneAndDelete', async function(next) {
  try {
    const categoryId = this.getQuery()['_id'];
    // Update all tasks with this category to remove the category field
    await mongoose.model('Task').updateMany(
      { category: categoryId },
      { $unset: { category: 1 } }
    );
    next();
  } catch (err) {
    next(err);
  }
});

// Static method to find categories by user
categorySchema.statics.findByUser = function(userId) {
  return this.find({ user: userId }).sort({ name: 1 });
};

// Instance method to update category
categorySchema.methods.updateCategory = function(updates) {
  Object.assign(this, updates);
  return this.save();
};

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;