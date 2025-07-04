const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const categoryController = require('../controllers/categoryController');

router.use(auth);

router.get('/', categoryController.getCategories);

router.post(
  '/',
  [
    check('name', 'Category name is required').not().isEmpty()
  ],
  categoryController.createCategory
);

router.put('/:id', categoryController.updateCategory);

router.delete('/:id', categoryController.deleteCategory);

module.exports = router;