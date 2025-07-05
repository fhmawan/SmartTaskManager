import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Divider,
  Alert,
  useTheme,
  alpha,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  Card,
  CardContent,
  Zoom,
  Fade,
  Slide,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Assignment as TaskIcon,
  AccessTime as TimeIcon,
  Label as TagIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import { useCreateTaskMutation } from '../services/taskApi';
import { useGetCategoriesQuery, useCreateCategoryMutation } from '../services/categoryApi';

const AddTaskPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [createCategory, { isLoading: isCreatingCategory }] = useCreateCategoryMutation();
  const { data: categoriesData = {}, refetch: refetchCategories } = useGetCategoriesQuery();
  const categories = categoriesData.data || [];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: null,
    priority: 'medium',
    status: 'pending',
    category: '',
    tags: [],
    subtasks: [],
    reminders: [],
  });

  const [errors, setErrors] = useState({});
  const [newSubtask, setNewSubtask] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newReminder, setNewReminder] = useState(null);
  const [focusedField, setFocusedField] = useState('');

  // Category dialog state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    color: '#4f46e5',
    icon: 'default'
  });

  const priorityOptions = [
    { value: 'low', label: 'Low Priority', color: theme.palette.success.main, icon: '🟢' },
    { value: 'medium', label: 'Medium Priority', color: theme.palette.warning.main, icon: '🟡' },
    { value: 'high', label: 'High Priority', color: theme.palette.error.main, icon: '🔴' },
  ];

  const colorOptions = [
    '#4f46e5', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleCreateNewCategory = async () => {
    if (!newCategoryData.name.trim()) {
      return;
    }

    try {
      const result = await createCategory(newCategoryData).unwrap();
      await refetchCategories();
      
      // Set the newly created category as selected
      setFormData(prev => ({
        ...prev,
        category: result.data._id || ''
      }));
      
      // Reset and close dialog
      setNewCategoryData({ name: '', color: '#4f46e5', icon: 'default' });
      setCategoryDialogOpen(false);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setFormData(prev => ({
        ...prev,
        subtasks: [...prev.subtasks, { title: newSubtask.trim(), completed: false }]
      }));
      setNewSubtask('');
    }
  };

  const handleDeleteSubtask = (index) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index)
    }));
  };

  const handleToggleSubtask = (index) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map((subtask, i) =>
        i === index ? { ...subtask, completed: !subtask.completed } : subtask
      )
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
  };

  const handleAddReminder = () => {
    if (newReminder) {
      setFormData(prev => ({
        ...prev,
        reminders: [...prev.reminders, { time: newReminder, sent: false }]
      }));
      setNewReminder(null);
    }
  };

  const handleDeleteReminder = (index) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const taskData = {
        ...formData,
        status: 'pending', // Always send pending status
        dueDate: formData.dueDate ? formData.dueDate.toISOString() : null,
        reminders: formData.reminders.map(reminder => ({
          time: reminder.time.toISOString(),
          sent: false
        }))
      };

      console.log(taskData);

      await createTask(taskData).unwrap();
      navigate('/tasks');
    } catch (error) {
      console.error('Error creating task:', error);
      setErrors({ submit: error.data?.message || 'Failed to create task' });
    }
  };

  const handleCancel = () => {
    navigate('/tasks');
  };

  const getPriorityColor = (priority) => {
    const option = priorityOptions.find(opt => opt.value === priority);
    return option ? option.color : theme.palette.grey[600];
  };

  const getFieldStyles = (fieldName) => ({
    '& .MuiOutlinedInput-root': {
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
        '& fieldset': {
          borderColor: theme.palette.primary.main,
          borderWidth: 2,
        },
      },
      '&.Mui-focused': {
        transform: 'translateY(-3px)',
        boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.25)}`,
        '& fieldset': {
          borderColor: theme.palette.primary.main,
          borderWidth: 2,
          boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
        },
      },
    },
    '& .MuiInputLabel-root': {
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&.Mui-focused': {
        color: theme.palette.primary.main,
        fontWeight: 600,
      },
    },
  });

  const handleCloseDialog = () => {
    setNewCategoryData({ name: '', color: '#4f46e5', icon: 'default' });
    setCategoryDialogOpen(false);
  };

  const handleFormKeyDown = (e) => {
    // Prevent form submission on Enter key press
    if (e.key === 'Enter' && e.target.type !== 'submit') {
      e.preventDefault();
    }
  };

  const handleSubmitClick = async () => {
    const formEvent = { preventDefault: () => {} };
    await handleSubmit(formEvent);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Zoom in timeout={800}>
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                color: theme.palette.text.primary
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'rotate(5deg) scale(1.05)',
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  }
                }}
              >
                <TaskIcon sx={{ fontSize: 32 }} />
              </Box>
              Create New Task
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              Add a new task to your project and stay organized
            </Typography>
          </Box>
        </Zoom>

        {/* Error Alert */}
        {errors.submit && (
          <Slide direction="down" in={!!errors.submit} mountOnEnter unmountOnExit>
            <Alert severity="error" sx={{ mb: 3 }}>
              {errors.submit}
            </Alert>
          </Slide>
        )}

        <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown}>
          <Grid container spacing={3}>
            {/* Main Information - Full Width */}
            <Grid item xs={12} sx={{ width: '100%' }}>
              <Fade in timeout={1000}>
                <Card 
                  elevation={3} 
                  sx={{ 
                    mb: 3,
                    width: '100%',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      elevation: 8,
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                    }
                  }}
                >
                  <CardContent sx={{ p: 4, width: '100%' }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        mb: 4,
                        color: theme.palette.text.primary,
                        fontWeight: 600
                      }}
                    >
                      <TaskIcon sx={{ color: theme.palette.primary.main }} />
                      Task Information
                    </Typography>

                    <Box sx={{ width: '100%' }}>
                      {/* First Row: Task Title and Priority */}
                      <Grid container spacing={3} sx={{ mb: 3, width: '100%' }}>
                        <Grid item xs={12} md={8} sx={{ width: '100%' }}>
                          <TextField
                            fullWidth
                            label="Task Title"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            onFocus={() => setFocusedField('title')}
                            onBlur={() => setFocusedField('')}
                            error={!!errors.title}
                            helperText={errors.title || `${formData.title.length}/100 characters`}
                            required
                            variant="outlined"
                            sx={{
                              ...getFieldStyles('title'),
                              width: '100%',
                              '& .MuiOutlinedInput-root': {
                                width: '100%',
                                ...getFieldStyles('title')['& .MuiOutlinedInput-root'],
                              }
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} md={4} sx={{ width: '100%' }}>
                          <FormControl 
                            fullWidth 
                            variant="outlined" 
                            sx={{
                              ...getFieldStyles('priority'),
                              width: '100%',
                              minWidth: '100%',
                              '& .MuiOutlinedInput-root': {
                                width: '100%',
                                ...getFieldStyles('priority')['& .MuiOutlinedInput-root'],
                              }
                            }}
                          >
                            <InputLabel>Priority</InputLabel>
                            <Select
                              value={formData.priority}
                              onChange={(e) => handleChange('priority', e.target.value)}
                              label="Priority"
                              onFocus={() => setFocusedField('priority')}
                              onBlur={() => setFocusedField('')}
                              fullWidth
                              sx={{ width: '100%' }}
                              MenuProps={{
                                TransitionComponent: Zoom,
                                TransitionProps: { timeout: 300 },
                                PaperProps: {
                                  sx: {
                                    borderRadius: 2,
                                    boxShadow: `0 8px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                                  }
                                }
                              }}
                            >
                              {priorityOptions.map((option) => (
                                <MenuItem 
                                  key={option.value} 
                                  value={option.value}
                                  sx={{
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      backgroundColor: alpha(option.color, 0.1),
                                      transform: 'translateX(8px)',
                                    }
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <span style={{ fontSize: '16px' }}>{option.icon}</span>
                                    <Typography>{option.label}</Typography>
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>

                      {/* Second Row: Category and Due Date */}
                      <Grid container spacing={3} sx={{ mb: 3, width: '100%' }}>
                        <Grid item xs={12} md={6} sx={{ width: '100%' }}>
                          <FormControl 
                            fullWidth 
                            error={!!errors.category} 
                            variant="outlined" 
                            sx={{
                              ...getFieldStyles('category'),
                              width: '100%',
                              minWidth: '100%',
                              '& .MuiOutlinedInput-root': {
                                width: '100%',
                                ...getFieldStyles('category')['& .MuiOutlinedInput-root'],
                              }
                            }}
                          >
                            <InputLabel>Category</InputLabel>
                            <Select
                              value={formData.category || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === 'create-new') {
                                  setCategoryDialogOpen(true);
                                } else {
                                  handleChange('category', value);
                                }
                              }}
                              label="Category"
                              onFocus={() => setFocusedField('category')}
                              onBlur={() => setFocusedField('')}
                              fullWidth
                              sx={{ 
                                width: '100%',
                                minWidth: '100%',
                              }}
                              MenuProps={{
                                TransitionComponent: Zoom,
                                TransitionProps: { timeout: 300 },
                                PaperProps: {
                                  sx: { 
                                    maxHeight: 300,
                                    borderRadius: 2,
                                    boxShadow: `0 8px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                                  }
                                }
                              }}
                            >
                              <MenuItem value="" disabled>
                                <em>Select a category</em>
                              </MenuItem>
                              {categories.map((category) => (
                                <MenuItem 
                                  key={category._id} 
                                  value={category._id}
                                  sx={{
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      backgroundColor: alpha(category.color, 0.1),
                                      transform: 'translateX(8px)',
                                    }
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box
                                      sx={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: '50%',
                                        backgroundColor: category.color,
                                        border: '2px solid white',
                                        boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                                        transition: 'transform 0.2s ease',
                                        '&:hover': {
                                          transform: 'scale(1.2)',
                                        }
                                      }}
                                    />
                                    <Typography>{category.name}</Typography>
                                  </Box>
                                </MenuItem>
                              ))}
                              <Divider />
                              <MenuItem 
                                value="create-new"
                                sx={{
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    transform: 'translateX(8px)',
                                  }
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: theme.palette.primary.main }}>
                                  <AddIcon />
                                  <Typography>Create New Category</Typography>
                                </Box>
                              </MenuItem>
                            </Select>
                            {errors.category && (
                              <FormHelperText>{errors.category}</FormHelperText>
                            )}
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6} sx={{ width: '100%' }}>
                          <Box sx={{ width: '100%' }}>
                            <DateTimePicker
                              label="Due Date"
                              value={formData.dueDate}
                              onChange={(date) => handleChange('dueDate', date)}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  variant: 'outlined',
                                  onFocus: () => setFocusedField('dueDate'),
                                  onBlur: () => setFocusedField(''),
                                  sx: {
                                    ...getFieldStyles('dueDate'),
                                    width: '100%',
                                    '& .MuiOutlinedInput-root': {
                                      width: '100%',
                                      ...getFieldStyles('dueDate')['& .MuiOutlinedInput-root'],
                                    }
                                  }
                                },
                                popper: {
                                  sx: {
                                    '& .MuiPaper-root': {
                                      borderRadius: 3,
                                      boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
                                      backdropFilter: 'blur(10px)',
                                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                    }
                                  }
                                }
                              }}
                              TransitionComponent={Zoom}
                            />
                          </Box>
                        </Grid>
                      </Grid>

                      {/* Third Row: Description (Full Width) */}
                      <Grid container spacing={3} sx={{ width: '100%' }}>
                        <Grid item xs={12} sx={{ width: '100%' }}>
                          <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={4}
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            onFocus={() => setFocusedField('description')}
                            onBlur={() => setFocusedField('')}
                            error={!!errors.description}
                            helperText={errors.description || `${formData.description.length}/500 characters`}
                            placeholder="Add a detailed description of your task..."
                            variant="outlined"
                            sx={{
                              ...getFieldStyles('description'),
                              width: '100%',
                              '& .MuiOutlinedInput-root': {
                                width: '100%',
                                ...getFieldStyles('description')['& .MuiOutlinedInput-root'],
                                '&:hover': {
                                  ...getFieldStyles('description')['& .MuiOutlinedInput-root']['&:hover'],
                                  transform: 'translateY(-3px)',
                                },
                                '&.Mui-focused': {
                                  ...getFieldStyles('description')['& .MuiOutlinedInput-root']['&.Mui-focused'],
                                  transform: 'translateY(-4px)',
                                },
                              }
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>

            {/* Subtasks - Full Width */}
            <Grid item xs={12} sx={{ width: '100%' }}>
              <Fade in timeout={1200}>
                <Card 
                  elevation={3} 
                  sx={{ 
                    mb: 3,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 40px ${alpha(theme.palette.secondary.main, 0.15)}`,
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        mb: 3,
                        color: theme.palette.text.primary,
                        fontWeight: 600
                      }}
                    >
                      <TaskIcon sx={{ color: theme.palette.secondary.main }} />
                      Subtasks
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                      <TextField
                        fullWidth
                        label="Add Subtask"
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddSubtask();
                          }
                        }}
                        variant="outlined"
                        sx={getFieldStyles('subtask')}
                      />
                      <Button
                        variant="contained"
                        onClick={handleAddSubtask}
                        disabled={!newSubtask.trim()}
                        startIcon={<AddIcon />}
                        sx={{ 
                          minWidth: 120,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                          }
                        }}
                      >
                        Add
                      </Button>
                    </Box>

                    <List>
                      {formData.subtasks.map((subtask, index) => (
                        <Slide direction="right" in timeout={300 * (index + 1)} key={index}>
                          <ListItem sx={{ px: 0 }}>
                            <Checkbox
                              checked={subtask.completed}
                              onChange={() => handleToggleSubtask(index)}
                              color="primary"
                              sx={{
                                transition: 'transform 0.2s ease',
                                '&:hover': {
                                  transform: 'scale(1.1)',
                                }
                              }}
                            />
                            <ListItemText
                              primary={subtask.title}
                              sx={{
                                textDecoration: subtask.completed ? 'line-through' : 'none',
                                opacity: subtask.completed ? 0.7 : 1,
                                transition: 'all 0.3s ease',
                              }}
                            />
                            <ListItemSecondaryAction>
                              <IconButton 
                                onClick={() => handleDeleteSubtask(index)} 
                                color="error"
                                sx={{
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    transform: 'scale(1.1) rotate(5deg)',
                                  }
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        </Slide>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>

            {/* Tags and Reminders - Full Width */}
            <Grid item xs={12} sx={{ width: '100%' }}>
              <Fade in timeout={1400}>
                <Card 
                  elevation={3} 
                  sx={{ 
                    mb: 3,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 40px ${alpha(theme.palette.info.main, 0.15)}`,
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        mb: 3,
                        color: theme.palette.text.primary,
                        fontWeight: 600
                      }}
                    >
                      <TagIcon sx={{ color: theme.palette.info.main }} />
                      Tags & Reminders
                    </Typography>

                    {/* Tags and Reminders in a single row */}
                    <Box sx={{ display: 'flex', gap: 3, width: '100%' }}>
                      {/* Tags - Half Width */}
                      <Box sx={{ 
                        flex: 1,
                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                        borderRadius: 2,
                        p: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: theme.palette.info.main,
                          boxShadow: `0 4px 20px ${alpha(theme.palette.info.main, 0.1)}`,
                        }
                      }}>
                        <Typography 
                          variant="subtitle1" 
                          gutterBottom 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            mb: 2,
                            color: theme.palette.info.main,
                            fontWeight: 600
                          }}
                        >
                          <TagIcon sx={{ fontSize: 20 }} />
                          Tags
                        </Typography>

                        <Box sx={{ mb: 2, width: '100%' }}>
                          <TextField
                            fullWidth
                            label="Add Tag"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddTag();
                              }
                            }}
                            size="small"
                            variant="outlined"
                            sx={{ ...getFieldStyles('tag'), width: '100%' }}
                          />
                          <Button
                            variant="contained"
                            onClick={handleAddTag}
                            disabled={!newTag.trim()}
                            startIcon={<AddIcon />}
                            size="small"
                            sx={{
                              mt: 2,
                              width: '100%',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                              }
                            }}
                          >
                            Add Tag
                          </Button>
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 200, overflow: 'auto', width: '100%' }}>
                          {formData.tags.map((tag, index) => (
                            <Zoom in timeout={200 * (index + 1)} key={tag}>
                              <Chip
                                label={tag}
                                onDelete={() => handleDeleteTag(tag)}
                                color="primary"
                                variant="outlined"
                                size="small"
                                sx={{
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    transform: 'scale(1.05)',
                                  }
                                }}
                              />
                            </Zoom>
                          ))}
                        </Box>
                      </Box>

                      {/* Reminders - Half Width */}
                      <Box sx={{ 
                        flex: 1,
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                        borderRadius: 2,
                        p: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: theme.palette.warning.main,
                          boxShadow: `0 4px 20px ${alpha(theme.palette.warning.main, 0.1)}`,
                        }
                      }}>
                        <Typography 
                          variant="subtitle1" 
                          gutterBottom 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            mb: 2,
                            color: theme.palette.warning.main,
                            fontWeight: 600
                          }}
                        >
                          <TimeIcon sx={{ fontSize: 20 }} />
                          Reminders
                        </Typography>

                        <Box sx={{ mb: 2, width: '100%' }}>
                          <DateTimePicker
                            label="Add Reminder"
                            value={newReminder}
                            onChange={setNewReminder}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: 'small',
                                variant: 'outlined',
                                sx: { ...getFieldStyles('reminder'), width: '100%' }
                              },
                              popper: {
                                sx: {
                                  '& .MuiPaper-root': {
                                    borderRadius: 3,
                                    boxShadow: `0 12px 40px ${alpha(theme.palette.warning.main, 0.2)}`,
                                  }
                                }
                              }
                            }}
                            TransitionComponent={Zoom}
                          />
                          <Button
                            variant="contained"
                            onClick={handleAddReminder}
                            disabled={!newReminder}
                            startIcon={<AddIcon />}
                            size="small"
                            sx={{ 
                              mt: 2, 
                              width: '100%',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                              }
                            }}
                          >
                            Add Reminder
                          </Button>
                        </Box>

                        <List sx={{ maxHeight: 200, overflow: 'auto', width: '100%' }}>
                          {formData.reminders.map((reminder, index) => (
                            <Slide direction="left" in timeout={300 * (index + 1)} key={index}>
                              <ListItem sx={{ px: 0 }}>
                                <ListItemText
                                  primary={new Date(reminder.time).toLocaleString()}
                                  secondary="Reminder"
                                />
                                <ListItemSecondaryAction>
                                  <IconButton 
                                    onClick={() => handleDeleteReminder(index)} 
                                    color="error"
                                    size="small"
                                    sx={{
                                      transition: 'all 0.2s ease',
                                      '&:hover': {
                                        transform: 'scale(1.1) rotate(5deg)',
                                      }
                                    }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              </ListItem>
                            </Slide>
                          ))}
                        </List>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Fade in timeout={1800}>
            <Card 
              elevation={3} 
              sx={{ 
                mt: 3,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.2)}`,
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    startIcon={<CancelIcon />}
                    size="large"
                    sx={{ 
                      minWidth: 120,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 15px ${alpha(theme.palette.grey[500], 0.3)}`,
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="contained"
                    onClick={handleSubmitClick}
                    startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={isLoading}
                    size="large"
                    sx={{ 
                      minWidth: 140,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                      }
                    }}
                  >
                    {isLoading ? 'Creating...' : 'Create Task'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </form>

        {/* Create Category Dialog */}
        <Dialog 
          open={categoryDialogOpen} 
          onClose={handleCloseDialog}
          maxWidth="sm" 
          fullWidth
          TransitionComponent={Zoom}
          TransitionProps={{ timeout: 400 }}
        >
          <DialogTitle>Create New Category</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Category Name"
                    value={newCategoryData.name}
                    onChange={(e) => setNewCategoryData(prev => ({ ...prev, name: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCreateNewCategory();
                      }
                    }}
                    variant="outlined"
                    required
                    sx={getFieldStyles('categoryName')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Choose Color
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {colorOptions.map((color, index) => (
                      <Zoom in timeout={100 * (index + 1)} key={color}>
                        <Box
                          onClick={() => setNewCategoryData(prev => ({ ...prev, color }))}
                          sx={{
                            width: 32,
                            height: 32,
                            backgroundColor: color,
                            borderRadius: '50%',
                            cursor: 'pointer',
                            border: newCategoryData.color === color ? '3px solid #000' : '2px solid #fff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.2) rotate(5deg)',
                              boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                            },
                          }}
                        />
                      </Zoom>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCloseDialog}
              sx={{
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-1px)' }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateNewCategory}
              variant="contained"
              disabled={!newCategoryData.name.trim() || isCreatingCategory}
              startIcon={isCreatingCategory ? <CircularProgress size={20} /> : <AddIcon />}
              sx={{
                transition: 'all 0.2s ease',
                '&:hover': { 
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
                }
              }}
            >
              {isCreatingCategory ? 'Creating...' : 'Create Category'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default AddTaskPage;
