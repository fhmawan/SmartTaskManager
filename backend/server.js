// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { initializeCronJobs, runInitialNotificationCheck } = require('./cronJobs');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Initialize cron jobs after database connection
initializeCronJobs();

// Run initial notification check
runInitialNotificationCheck();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🌟 Server started on port ${PORT}`);
  console.log('📅 Cron jobs are running in the background');
});