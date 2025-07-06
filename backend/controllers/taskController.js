const Task = require('../models/Task');
const Category = require('../models/Category');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user.id })
      .populate('category', 'name color')
      .sort({ dueDate: 1, priority: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    const category = await Category.findOne({
      _id: req.body.category,
      user: req.user.id
    });

    if (!category) {
      return next(new ErrorResponse(`Category not found with id of ${req.body.category}`, 404));
    }

    const task = await Task.create(req.body);

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return next(new ErrorResponse(`Task not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns the task
    if (task.user.toString() !== req.user.id) {
      return next(new ErrorResponse(`Not authorized to update this task`, 401));
    }

    // Check if category exists and belongs to user if being updated
    if (req.body.category) {
      const category = await Category.findOne({
        _id: req.body.category,
        user: req.user.id
      });

      if (!category) {
        return next(new ErrorResponse(`Category not found with id of ${req.body.category}`, 404));
      }
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(new ErrorResponse(`Task not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns the task
    if (task.user.toString() !== req.user.id) {
      return next(new ErrorResponse(`Not authorized to delete this task`, 401));
    }

    await task.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Complete task
// @route   PATCH /api/tasks/:id/complete
// @access  Private
exports.completeTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(new ErrorResponse(`Task not found with id of ${req.params.id}`, 404));
    }

    // Make sure user owns the task
    if (task.user.toString() !== req.user.id) {
      return next(new ErrorResponse(`Not authorized to update this task`, 401));
    }

    task.status = 'completed';
    task.completedAt = Date.now();
    await task.save();

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    next(err);
  }
};