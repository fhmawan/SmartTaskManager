const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

router.use(auth);

router.get('/', notificationController.getNotifications);

router.patch('/:id/read', notificationController.markAsRead);

router.delete('/:id', notificationController.deleteNotification);

module.exports = router;