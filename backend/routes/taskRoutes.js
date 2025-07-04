const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const taskController = require('../controllers/taskController');

router.use(auth);

router.get('/', taskController.getTasks);

router.post(
  '/',
  [
    check('title', 'Title is required').not().isEmpty(),
    check('category', 'Category ID is required').not().isEmpty()
  ],
  taskController.createTask
);

router.put('/:id', taskController.updateTask);

router.delete('/:id', taskController.deleteTask);

router.patch('/:id/complete', taskController.completeTask);

module.exports = router;