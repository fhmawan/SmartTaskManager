import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  useTheme,
  alpha,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as TaskIcon,
  Schedule as ScheduleIcon,
  Flag as FlagIcon,
  Circle as CircleIcon,
  MarkEmailRead as MarkReadIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice';
import { 
  useGetNotificationsQuery, 
  useMarkAsReadMutation 
} from '../../services/notificationApi';

const TopBar = ({ onMenuClick, sidebarOpen }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);

  const { 
    data: notificationsData = {}, 
    isLoading: notificationsLoading,
    error: notificationsError 
  } = useGetNotificationsQuery(undefined, {
    // Explicitly enable polling
    pollingInterval: 30000, // 30 seconds
    refetchOnFocus: true,
    refetchOnReconnect: true,
    // Keep polling active
    skip: false,
  });
  
  const [markAsRead] = useMarkAsReadMutation();
  
  const notifications = notificationsData.data || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
    navigate('/login');
  };

  const handleSettings = () => {
    navigate('/settings');
    handleMenuClose();
  };

  const handleMarkAsRead = async (notificationId, event) => {
    event.stopPropagation();
    try {
      await markAsRead(notificationId).unwrap();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(notification => 
          markAsRead(notification._id).unwrap()
        )
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const formatNotificationTime = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (notification) => {
    switch (notification.type) {
      case 'reminder':
        return <ScheduleIcon sx={{ color: theme.palette.warning.main }} />;
      case 'task':
        return <TaskIcon sx={{ color: theme.palette.primary.main }} />;
      case 'priority':
        return <FlagIcon sx={{ color: theme.palette.error.main }} />;
      default:
        return <CircleIcon sx={{ color: theme.palette.info.main }} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.info.main;
    }
  };

  const profileMenuId = 'primary-search-account-menu';
  const notificationMenuId = 'primary-search-notification-menu';

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label={sidebarOpen ? "close sidebar" : "open sidebar"}
          onClick={onMenuClick}
          sx={{ 
            mr: 2,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ 
            flexGrow: 1,
            fontWeight: 600,
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
          }}
        >
          Smart Task Manager
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            onClick={handleNotificationMenuOpen}
            aria-controls={notificationMenuId}
            aria-haspopup="true"
            sx={{
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <Badge 
              badgeContent={unreadCount} 
              color="error"
              sx={{
                '& .MuiBadge-badge': {
                  animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.1)' },
                    '100%': { transform: 'scale(1)' },
                  },
                },
              }}
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton
            edge="end"
            color="inherit"
            onClick={handleProfileMenuOpen}
            aria-controls={profileMenuId}
            aria-haspopup="true"
            sx={{
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <Avatar
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: theme.palette.primary.main,
                fontSize: '0.875rem',
              }}
            >
              {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        id={profileMenuId}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 200,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {user?.name || user?.username || 'User'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleSettings} sx={{ py: 1.5 }}>
          <SettingsIcon sx={{ mr: 1.5 }} />
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
          <LogoutIcon sx={{ mr: 1.5 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Enhanced Notifications Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        id={notificationMenuId}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(notificationAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { 
            width: 420, 
            maxHeight: 500,
            borderRadius: 2,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
          },
        }}
      >
        {/* Header */}
        <Box sx={{ 
          px: 2, 
          py: 1.5, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsIcon color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip 
                label={unreadCount} 
                size="small" 
                color="error" 
                sx={{ fontSize: '0.75rem' }}
              />
            )}
          </Box>
          {unreadCount > 0 && (
            <Tooltip title="Mark All as Read">
              <IconButton size="small" onClick={handleMarkAllAsRead}>
                <MarkReadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Notifications List */}
        {notificationsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <NotificationsIcon sx={{ fontSize: 48, color: theme.palette.text.disabled, mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
            <Typography variant="caption" color="text.secondary">
              You'll see task reminders and updates here
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
            {notifications.map((notification, index) => (
              <ListItem
                key={notification._id}
                sx={{
                  py: 1.5,
                  px: 2,
                  borderLeft: `4px solid ${notification.read ? 'transparent' : theme.palette.primary.main}`,
                  backgroundColor: notification.read 
                    ? 'transparent' 
                    : alpha(theme.palette.primary.main, 0.02),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  },
                  ...(index < notifications.length - 1 && {
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }),
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getNotificationIcon(notification)}
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: notification.read ? 400 : 600,
                          color: notification.read ? 'text.secondary' : 'text.primary',
                        }}
                      >
                        {notification.title}
                      </Typography>
                      {notification.metadata?.priority && (
                        <Chip 
                          label={notification.metadata.priority} 
                          size="small" 
                          sx={{ 
                            fontSize: '0.65rem',
                            height: 16,
                            backgroundColor: alpha(getPriorityColor(notification.metadata.priority), 0.1),
                            color: getPriorityColor(notification.metadata.priority),
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                        {formatNotificationTime(notification.createdAt)}
                      </Typography>
                    </Box>
                  }
                />
                
                {!notification.read && (
                  <ListItemSecondaryAction>
                    <Tooltip title="Mark as Read">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMarkAsRead(notification._id, e)}
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.success.main, 0.1),
                            color: theme.palette.success.main,
                          },
                        }}
                      >
                        <CheckCircleIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Menu>
    </AppBar>
  );
};

export default TopBar; 