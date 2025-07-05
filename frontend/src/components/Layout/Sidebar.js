import React from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Home as HomeIcon,
  Category as CategoryIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  CheckCircle as AllIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetCategoriesQuery } from '../../services/categoryApi';
import { useGetTasksQuery } from '../../services/taskApi';

const SIDEBAR_WIDTH = 280;

const Sidebar = ({ open, onClose, isMobile }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  
  const { data: categoriesData = {}, isLoading: categoriesLoading } = useGetCategoriesQuery();
  const { data: tasksData = {}, isLoading: tasksLoading } = useGetTasksQuery();
  
  const categories = categoriesData.data || [];
  const tasks = tasksData.data || [];

  const getTaskCountByCategory = (categoryId) => {
    if (!categoryId) return tasks.length;
    return tasks.filter(task => task.category?._id === categoryId).length;
  };

  const getCompletedTasksCount = () => {
    return tasks.filter(task => task.status === 'completed').length;
  };

  const mainMenuItems = [
    {
      text: 'Home',
      icon: <HomeIcon />,
      path: '/',
      count: null,
    },
    {
      text: 'All Tasks',
      icon: <AllIcon />,
      path: '/tasks',
      count: tasks.length,
    },
    {
      text: 'Add Task',
      icon: <AddIcon />,
      path: '/tasks/new',
      count: null,
      action: true,
    },
  ];

  const categoryMenuItems = [
    {
      text: 'All Categories',
      icon: <CategoryIcon />,
      path: '/categories',
      count: categories.length,
    },
    ...(Array.isArray(categories) ? categories.map(category => ({
      text: category.name,
      icon: getCategoryIcon(category.icon),
      path: `/tasks?category=${category._id}`,
      count: getTaskCountByCategory(category._id),
      color: category.color,
    })) : []),
  ];

  const bottomMenuItems = [
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      count: null,
    },
  ];

  function getCategoryIcon(iconName) {
    const iconMap = {
      work: <WorkIcon />,
      personal: <PersonIcon />,
      learning: <SchoolIcon />,
      default: <CategoryIcon />,
    };
    return iconMap[iconName] || iconMap.default;
  }

  const handleNavigation = (path, isAction = false) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const renderMenuItem = (item) => {
    const isActive = location.pathname === item.path;
    
    return (
      <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
        <ListItemButton
          onClick={() => handleNavigation(item.path, item.action)}
          sx={{
            borderRadius: 2,
            mx: 1,
            backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
            '&:hover': {
              backgroundColor: isActive 
                ? alpha(theme.palette.primary.main, 0.2)
                : alpha(theme.palette.primary.main, 0.05),
            },
          }}
        >
          <ListItemIcon
            sx={{
              color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
              minWidth: 40,
            }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.text}
            sx={{
              '& .MuiTypography-root': {
                fontWeight: isActive ? 600 : 400,
                color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
              },
            }}
          />
          {item.count !== null && (
            <Chip
              label={item.count}
              size="small"
              sx={{
                backgroundColor: item.color || theme.palette.primary.main,
                color: 'white',
                minWidth: 24,
                height: 20,
                fontSize: '0.75rem',
              }}
            />
          )}
        </ListItemButton>
      </ListItem>
    );
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          Smart Task Manager
        </Typography>
      </Box>

      {/* User Profile */}
      <Box sx={{ px: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {user?.name || user?.username || 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {getCompletedTasksCount()} tasks completed
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Main Menu */}
      <Box sx={{ flexGrow: 1, py: 2 }}>
        <List>
          {mainMenuItems.map(renderMenuItem)}
        </List>

        {/* Categories Section */}
        <Box sx={{ mt: 3 }}>
          <Typography
            variant="overline"
            sx={{
              px: 2,
              color: theme.palette.text.secondary,
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          >
            Categories
          </Typography>
          <List>
            {categoryMenuItems.map(renderMenuItem)}
          </List>
        </Box>
      </Box>

      {/* Bottom Menu */}
      <Box sx={{ pb: 2 }}>
        <Divider sx={{ mx: 2, mb: 2 }} />
        <List>
          {bottomMenuItems.map(renderMenuItem)}
        </List>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={open}
      onClose={onClose}
      sx={{
        width: open ? SIDEBAR_WIDTH : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          position: 'relative',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar; 