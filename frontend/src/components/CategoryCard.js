import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Avatar,
  Chip,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  alpha,
  Fade,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Home as HomeIcon,
  Sports as SportsIcon,
  LocalHospital as HealthIcon,
  Flight as TravelIcon,
  ShoppingCart as ShoppingIcon,
  Restaurant as RestaurantIcon,
  Task as TaskIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

const CategoryCard = ({ 
  category, 
  taskCount, 
  onEdit, 
  onDelete, 
  index = 0 
}) => {
  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = useState(null);

  const iconMap = {
    category: <CategoryIcon />,
    work: <WorkIcon />,
    personal: <PersonIcon />,
    learning: <SchoolIcon />,
    home: <HomeIcon />,
    sports: <SportsIcon />,
    health: <HealthIcon />,
    travel: <TravelIcon />,
    shopping: <ShoppingIcon />,
    restaurant: <RestaurantIcon />,
    task: <TaskIcon />,
    assignment: <AssignmentIcon />,
  };

  const handleMenuClick = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEdit = () => {
    onEdit(category);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(category);
    handleMenuClose();
  };

  return (
    <>
      <Fade in timeout={300 * (index + 1)}>
        <Card 
          elevation={3}
          sx={{
            height: 200,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'visible',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: `0 16px 40px ${alpha(category.color, 0.2)}`,
            },
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, ${category.color} 0%, ${alpha(category.color, 0.7)} 100%)`,
              borderRadius: '4px 4px 0 0',
            }}
          />
          <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(category.color, 0.1),
                    color: category.color,
                    width: 48,
                    height: 48,
                  }}
                >
                  {iconMap[category.icon] || <CategoryIcon />}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {category.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {taskCount} tasks
                  </Typography>
                </Box>
              </Box>
              <IconButton
                onClick={handleMenuClick}
                size="small"
                sx={{
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    backgroundColor: alpha(category.color, 0.1),
                    color: category.color,
                  },
                }}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>

            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: category.color,
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {category.color}
                </Typography>
              </Box>
              
              <Badge
                badgeContent={taskCount}
                color="primary"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: category.color,
                    color: 'white',
                  },
                }}
              >
                <Chip
                  label={category.icon}
                  size="small"
                  sx={{
                    backgroundColor: alpha(category.color, 0.1),
                    color: category.color,
                    fontWeight: 600,
                  }}
                />
              </Badge>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
            minWidth: 160,
          }
        }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={handleDelete}
          sx={{ color: theme.palette.error.main }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default CategoryCard; 