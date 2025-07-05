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

  // Optional: Daily cleanup job (runs every day at 2 AM)
  cron.schedule('0 2 * * *', async () => {
    console.log('🧹 Running daily cleanup...');
    try {
      // You can add cleanup logic here later
      // For example: Delete old notifications, clean up expired sessions, etc.
      console.log('✅ Daily cleanup completed');
    } catch (error) {
      console.error('❌ Error during daily cleanup:', error);
    }
  });

  // Optional: Weekly summary job (runs every Sunday at 9 AM)
  cron.schedule('0 9 * * 0', async () => {
    console.log('📊 Generating weekly summaries...');
    try {
      // You can add weekly summary logic here later
      // For example: Generate weekly task completion reports
      console.log('✅ Weekly summary generation completed');
    } catch (error) {
      console.error('❌ Error generating weekly summaries:', error);
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