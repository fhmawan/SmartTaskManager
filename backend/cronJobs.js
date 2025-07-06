const cron = require('node-cron');
const User = require('./models/User');
const { checkTaskNotifications } = require('./controllers/notificationController');

// Initialize all cron jobs
const initializeCronJobs = () => {
  console.log('🕐 Initializing cron jobs...');

  // Check for task notifications every 5 minutes
  cron.schedule('* * * * *', async () => {
    console.log('🔔 Checking for task notifications...');
    try {
      // Get all users
      const users = await User.find().select('_id');
      
      // Check notifications for each user
      for (const user of users) {
        await checkTaskNotifications(user._id);
      }
      
      console.log(`✅ Notification check completed for ${users.length} users`);
    } catch (error) {
      console.error('❌ Error checking notifications:', error);
    }
  });
  console.log('✅ All cron jobs initialized successfully');
};

// Run initial notification check on startup
const runInitialNotificationCheck = async () => {
  try {
    console.log('🚀 Running initial notification check...');
    const users = await User.find().select('_id');
    
    for (const user of users) {
      await checkTaskNotifications(user._id);
    }
    
    console.log(`✅ Initial notification check completed for ${users.length} users`);
  } catch (error) {
    console.error('❌ Error in initial notification check:', error);
  }
};

// Export functions
module.exports = {
  initializeCronJobs,
  runInitialNotificationCheck
}; 