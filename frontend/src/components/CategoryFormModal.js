import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Avatar,
  Box,
  Typography,
  Stack,
  useTheme,
  alpha,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
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
import { ChromePicker } from 'react-color';

const CategoryFormModal = ({ 
  open, 
  onClose, 
  onSubmit, 
  category = null, 
  isLoading = false 
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    color: '#4f46e5',
    icon: 'category',
  });
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const isEditMode = Boolean(category);

  const availableIcons = [
    { name: 'category', icon: <CategoryIcon /> },
    { name: 'work', icon: <WorkIcon /> },
    { name: 'personal', icon: <PersonIcon /> },
    { name: 'learning', icon: <SchoolIcon /> },
    { name: 'home', icon: <HomeIcon /> },
    { name: 'sports', icon: <SportsIcon /> },
    { name: 'health', icon: <HealthIcon /> },
    { name: 'travel', icon: <TravelIcon /> },
    { name: 'shopping', icon: <ShoppingIcon /> },
    { name: 'restaurant', icon: <RestaurantIcon /> },
    { name: 'task', icon: <TaskIcon /> },
    { name: 'assignment', icon: <AssignmentIcon /> },
  ];

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        color: category.color,
        icon: category.icon,
      });
    } else {
      setFormData({
        name: '',
        color: '#4f46e5',
        icon: 'category',
      });
    }
    setColorPickerOpen(false);
  }, [category, open]);

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const handleClose = () => {
    setColorPickerOpen(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: `0 24px 48px ${alpha(theme.palette.primary.main, 0.15)}`,
        }
      }}
    >
      <DialogTitle sx={{ 
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}>
        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
          {isEditMode ? <EditIcon /> : <AddIcon />}
        </Avatar>
        {isEditMode ? 'Edit Category' : 'Create New Category'}
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="Category Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            variant="outlined"
            autoFocus
          />
          
          <FormControl fullWidth>
            <InputLabel>Icon</InputLabel>
            <Select
              value={formData.icon}
              onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
              label="Icon"
            >
              {availableIcons.map(icon => (
                <MenuItem key={icon.name} value={icon.name}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {icon.icon}
                    <Typography sx={{ textTransform: 'capitalize' }}>{icon.name}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Color
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                onClick={() => setColorPickerOpen(!colorPickerOpen)}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  backgroundColor: formData.color,
                  cursor: 'pointer',
                  border: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                }}
              />
              <TextField
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                size="small"
                sx={{ flexGrow: 1 }}
              />
            </Box>
            {colorPickerOpen && (
              <Box sx={{ mt: 2 }}>
                <ChromePicker
                  color={formData.color}
                  onChange={(color) => setFormData(prev => ({ ...prev, color: color.hex }))}
                />
              </Box>
            )}
          </Box>
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!formData.name.trim() || isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : (isEditMode ? <EditIcon /> : <AddIcon />)}
        >
          {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Category' : 'Create Category')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryFormModal; 