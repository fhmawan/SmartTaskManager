const Category = require('../models/Category');
const Task = require('../models/Task');
const ErrorResponse = require('../utils/errorResponse');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ user: req.user.id });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
    }

    if (category.user.toString() !== req.user.id) {
      return next(new ErrorResponse(`Not authorized to update this category`, 401));
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
    }

    if (category.user.toString() !== req.user.id) {
      return next(new ErrorResponse(`Not authorized to delete this category`, 401));
    }
    const tasksWithCategory = await Task.countDocuments({ 
      category: req.params.id,
      user: req.user.id
    });

    if (tasksWithCategory > 0) {
      return next(new ErrorResponse(
        `Cannot delete category. It has ${tasksWithCategory} associated tasks. Please reassign or delete these tasks first.`, 
        400
      ));
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {},
      message: 'Category deleted successfully'
    });

  } catch (err) {
    next(err);
  }
};