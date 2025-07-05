import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  useTheme,
  alpha,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  CircularProgress,
  Stack,
  Badge,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Assignment as TaskIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  TrendingUp as ProgressIcon,
  Today as TodayIcon,
  Warning as WarningIcon,
  Category as CategoryIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  Flag as FlagIcon,
  CalendarToday as CalendarIcon,
  Notifications as NotificationsIcon,
  Star as StarIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useGetTasksQuery } from '../services/taskApi';
import { useGetCategoriesQuery } from '../services/categoryApi';
import { useSelector } from 'react-redux';
import { format, isToday, isTomorrow, isPast, startOfDay, endOfDay, addDays } from 'date-fns';

const HomePage = () => {
  const theme = useTheme();
  const { user } = useSelector(state => state.auth);
  const { data: tasksData = {}, isLoading } = useGetTasksQuery();
  const { data: categoriesData = {} } = useGetCategoriesQuery();
  
  const tasks = tasksData.data || [];
  const categories = categoriesData.data || [];

  // Calculate analytics data
  const analytics = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const pendingTasks = tasks.filter(task => task.status === 'pending').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Today's tasks
    const todaysTasks = tasks.filter(task => 
      task.dueDate && isToday(new Date(task.dueDate))
    );

    // Overdue tasks
    const overdueTasks = tasks.filter(task => 
      task.dueDate && 
      isPast(new Date(task.dueDate)) && 
      !isToday(new Date(task.dueDate)) && 
      task.status !== 'completed'
    );

    // Upcoming tasks (next 7 days)
    const upcomingTasks = tasks.filter(task => {
      if (!task.dueDate || task.status === 'completed') return false;
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const nextWeek = addDays(today, 7);
      return dueDate >= today && dueDate <= nextWeek;
    });

    // Priority distribution
    const priorityStats = {
      high: tasks.filter(task => task.priority === 'high' && task.status !== 'completed').length,
      medium: tasks.filter(task => task.priority === 'medium' && task.status !== 'completed').length,
      low: tasks.filter(task => task.priority === 'low' && task.status !== 'completed').length,
    };

    // Category distribution
    const categoryStats = categories.map(category => ({
      ...category,
      taskCount: tasks.filter(task => task.category?._id === category._id).length,
      completedCount: tasks.filter(task => 
        task.category?._id === category._id && task.status === 'completed'
      ).length,
    }));

    // Recent completed tasks
    const recentCompleted = tasks
      .filter(task => task.status === 'completed')
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 5);

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      completionRate,
      todaysTasks,
      overdueTasks,
      upcomingTasks,
      priorityStats,
      categoryStats,
      recentCompleted,
    };
  }, [tasks, categories]);

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <Card 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px ${alpha(color, 0.15)}`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Avatar
            sx={{
              backgroundColor: alpha(color, 0.1),
              color: color,
              width: 48,
              height: 48,
            }}
          >
            {icon}
          </Avatar>
          {trend && (
            <Chip
              label={trend}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main,
                fontWeight: 600,
              }}
            />
          )}
        </Box>
        <Typography variant="h3" fontWeight="bold" color={color} mb={0.5}>
          {value}
        </Typography>
        <Typography variant="h6" fontWeight={600} color="text.primary" mb={0.5}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const PriorityChart = () => {
    const { high, medium, low } = analytics.priorityStats;
    const total = high + medium + low;
    
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FlagIcon color="primary" />
            Priority Distribution
          </Typography>
          
          <Stack spacing={2}>
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" fontWeight={600} color="error.main">High Priority</Typography>
                <Typography variant="body2" fontWeight={600}>{high}</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={total > 0 ? (high / total) * 100 : 0}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: theme.palette.error.main,
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
            
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" fontWeight={600} color="warning.main">Medium Priority</Typography>
                <Typography variant="body2" fontWeight={600}>{medium}</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={total > 0 ? (medium / total) * 100 : 0}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: alpha(theme.palette.warning.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: theme.palette.warning.main,
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
            
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" fontWeight={600} color="success.main">Low Priority</Typography>
                <Typography variant="body2" fontWeight={600}>{low}</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={total > 0 ? (low / total) * 100 : 0}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: theme.palette.success.main,
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  const TodayTasksCard = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TodayIcon color="primary" />
            Today's Tasks
          </Typography>
          <Badge badgeContent={analytics.todaysTasks.length} color="primary">
            <CalendarIcon />
          </Badge>
        </Box>
        
        {analytics.todaysTasks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No tasks due today! 🎉
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {analytics.todaysTasks.slice(0, 4).map((task, index) => (
              <React.Fragment key={task._id}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        backgroundColor: task.priority === 'high' ? alpha(theme.palette.error.main, 0.1) :
                                       task.priority === 'medium' ? alpha(theme.palette.warning.main, 0.1) :
                                       alpha(theme.palette.success.main, 0.1),
                        color: task.priority === 'high' ? theme.palette.error.main :
                               task.priority === 'medium' ? theme.palette.warning.main :
                               theme.palette.success.main,
                        width: 32,
                        height: 32,
                      }}
                    >
                      <TaskIcon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={task.title}
                    secondary={task.category?.name}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <Chip
                    label={task.status}
                    size="small"
                    color={task.status === 'completed' ? 'success' : 
                           task.status === 'in-progress' ? 'info' : 'warning'}
                    variant="outlined"
                  />
                </ListItem>
                {index < analytics.todaysTasks.slice(0, 4).length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );

  const OverdueTasksCard = () => (
    <Card 
      sx={{ 
        height: '100%',
        border: analytics.overdueTasks.length > 0 ? `1px solid ${alpha(theme.palette.error.main, 0.3)}` : 'default',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="error" />
            Overdue Tasks
          </Typography>
          <Badge badgeContent={analytics.overdueTasks.length} color="error">
            <AccessTimeIcon />
          </Badge>
        </Box>
        
        {analytics.overdueTasks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No overdue tasks! ✅
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {analytics.overdueTasks.slice(0, 3).map((task, index) => (
              <React.Fragment key={task._id}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                        color: theme.palette.error.main,
                        width: 32,
                        height: 32,
                      }}
                    >
                      <WarningIcon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={task.title}
                    secondary={`Due: ${format(new Date(task.dueDate), 'MMM dd')}`}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                </ListItem>
                {index < analytics.overdueTasks.slice(0, 3).length - 1 && <Divider />}
              </React.Fragment>
            ))}
            {analytics.overdueTasks.length > 3 && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 6 }}>
                +{analytics.overdueTasks.length - 3} more overdue tasks
              </Typography>
            )}
          </List>
        )}
      </CardContent>
    </Card>
  );

  const CategoryBreakdownCard = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CategoryIcon color="secondary" />
          Category Breakdown
        </Typography>
        
        <Stack spacing={2}>
          {analytics.categoryStats.slice(0, 5).map((category) => (
            <Box key={category._id}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: category.color,
                    }}
                  />
                  <Typography variant="body2" fontWeight={600}>
                    {category.name}
                  </Typography>
                </Box>
                <Typography variant="body2" fontWeight={600}>
                  {category.completedCount}/{category.taskCount}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={category.taskCount > 0 ? (category.completedCount / category.taskCount) * 100 : 0}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: alpha(category.color, 0.1),
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: category.color,
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );

  const RecentActivityCard = () => (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimelineIcon color="info" />
          Recent Completions
        </Typography>
        
        {analytics.recentCompleted.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No completed tasks yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {analytics.recentCompleted.map((task, index) => (
              <React.Fragment key={task._id}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main,
                        width: 32,
                        height: 32,
                      }}
                    >
                      <CompletedIcon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={task.title}
                    secondary={task.category?.name || 'No category'}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <StarIcon sx={{ color: theme.palette.warning.main, fontSize: 16 }} />
                </ListItem>
                {index < analytics.recentCompleted.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Header */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Welcome back, {user?.name || user?.username || 'User'}! 👋
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Here's your productivity dashboard for {format(new Date(), 'EEEE, MMMM do')}
        </Typography>
        
        {/* Overall Progress */}
        <Box sx={{ mt: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="subtitle1" fontWeight={600}>
              Overall Progress
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="primary.main">
              {analytics.completionRate.toFixed(0)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={analytics.completionRate}
            sx={{
              height: 12,
              borderRadius: 6,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 6,
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              },
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            You've completed {analytics.completedTasks} out of {analytics.totalTasks} tasks
          </Typography>
        </Box>
      </Paper>

      {/* Main Stats Cards - Flexbox Layout */}
      <Box 
        sx={{ 
          display: 'flex', 
          gap: 3, 
          mb: 4,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ flex: '1 1 300px', minWidth: 250 }}>
          <StatCard
            title="Total Tasks"
            value={analytics.totalTasks}
            icon={<TaskIcon fontSize="large" />}
            color={theme.palette.primary.main}
            subtitle="All tasks in your workspace"
          />
        </Box>
        
        <Box sx={{ flex: '1 1 300px', minWidth: 250 }}>
          <StatCard
            title="Completed"
            value={analytics.completedTasks}
            icon={<CompletedIcon fontSize="large" />}
            color={theme.palette.success.main}
            subtitle={`${analytics.completionRate.toFixed(0)}% completion rate`}
            trend="+12%"
          />
        </Box>
        
        <Box sx={{ flex: '1 1 300px', minWidth: 250 }}>
          <StatCard
            title="In Progress"
            value={analytics.inProgressTasks}
            icon={<ProgressIcon fontSize="large" />}
            color={theme.palette.info.main}
            subtitle="Currently working on"
          />
        </Box>
        
        <Box sx={{ flex: '1 1 300px', minWidth: 250 }}>
          <StatCard
            title="Pending"
            value={analytics.pendingTasks}
            icon={<PendingIcon fontSize="large" />}
            color={theme.palette.warning.main}
            subtitle="Waiting to be started"
          />
        </Box>
      </Box>

      {/* Today's Focus & Overdue Tasks */}
      <Box 
        sx={{ 
          display: 'flex', 
          gap: 3, 
          mb: 4,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ flex: '1 1 400px' }}>
          <TodayTasksCard />
        </Box>
        <Box sx={{ flex: '1 1 400px' }}>
          <OverdueTasksCard />
        </Box>
      </Box>

      {/* Analytics Dashboard */}
      <Box 
        sx={{ 
          display: 'flex', 
          gap: 3, 
          mb: 4,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ flex: '1 1 400px' }}>
          <PriorityChart />
        </Box>
        <Box sx={{ flex: '1 1 400px' }}>
          <CategoryBreakdownCard />
        </Box>
        <Box sx={{ flex: '1 1 400px' }}>
          <RecentActivityCard />
        </Box>
      </Box>

      {/* Quick Actions */}
      <Paper
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
          border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
        }}
      >
        <Typography variant="h6" fontWeight={600} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SpeedIcon color="secondary" />
          Quick Stats
        </Typography>
        
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 4, 
            flexWrap: 'wrap',
            justifyContent: 'space-around',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              {analytics.upcomingTasks.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upcoming This Week
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="bold" color="secondary.main">
              {categories.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Categories
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {analytics.priorityStats.high}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              High Priority Tasks
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="bold" color="info.main">
              {Math.round((analytics.completedTasks / Math.max(analytics.totalTasks, 1)) * 100)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Success Rate
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default HomePage; 