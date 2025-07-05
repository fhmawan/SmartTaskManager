import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemButton,
  IconButton,
  Checkbox,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
  Zoom,
  Slide,
  CircularProgress,
  Tooltip,
  Avatar,
  Stack,
  ButtonGroup,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Label as TagIcon,
  CheckCircle as CompleteIcon,
  Assignment as AssignmentIcon,
  Task as TaskIcon,
  PlayArrow as InProgressIcon,
  Pending as PendingIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, isPast } from 'date-fns';
import { useUpdateTaskMutation, useCompleteTaskMutation, useDeleteTaskMutation } from '../services/taskApi';
import { useGetCategoriesQuery } from '../services/categoryApi';

const TaskDetailModal = ({ 
  open, 
  onClose, 
  task, 
  onTaskUpdated 
}) => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [newSubtask, setNewSubtask] = useState('');
  const [newReminder, setNewReminder] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [completeTask, { isLoading: isCompleting }] = useCompleteTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();
  const { data: categoriesData } = useGetCategoriesQuery();
  const categories = categoriesData?.data || [];

  // Custom isOverdue function since it's not available in date-fns
  const isOverdue = (date) => {
    if (!date) return false;
    return isPast(new Date(date)) && !isToday(new Date(date));
  };

  const isToday = (date) => {
    const today = new Date();
    const checkDate = new Date(date);
    return checkDate.toDateString() === today.toDateString();
  };

  useEffect(() => {
    if (task) {
      setEditData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        category: task.category?._id || '',
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        tags: task.tags || [],
        subtasks: task.subtasks || [],
        reminders: task.reminders || [],
        status: task.status || 'pending',
      });
    }
  }, [task]);

  const handleClose = () => {
    setIsEditing(false);
    setNewSubtask('');
    setNewReminder(null);
    setNewTag('');
    setDeleteConfirmOpen(false);
    onClose();
  };

  const handleSave = async () => {
    try {
      const updateData = {
        ...editData,
        dueDate: editData.dueDate ? editData.dueDate.toISOString() : null,
        reminders: editData.reminders.map(reminder => ({
          ...reminder,
          time: typeof reminder.time === 'string' ? reminder.time : reminder.time.toISOString(),
        })),
      };

      await updateTask({ id: task._id, ...updateData }).unwrap();
      setIsEditing(false);
      onTaskUpdated();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(task._id).unwrap();
      setDeleteConfirmOpen(false);
      onTaskUpdated();
      handleClose();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateTask({ 
        id: task._id, 
        status: newStatus 
      }).unwrap();
      onTaskUpdated();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleCompleteTask = async () => {
    try {
      await completeTask(task._id).unwrap();
      onTaskUpdated();
      handleClose();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleSubtaskToggle = async (index) => {
    const updatedSubtasks = editData.subtasks.map((subtask, i) =>
      i === index ? { ...subtask, completed: !subtask.completed } : subtask
    );
    
    setEditData(prev => ({ ...prev, subtasks: updatedSubtasks }));
    
    // If not in edit mode, save immediately to backend
    if (!isEditing) {
      try {
        await updateTask({ 
          id: task._id, 
          subtasks: updatedSubtasks 
        }).unwrap();
        onTaskUpdated();
      } catch (error) {
        console.error('Error updating subtask:', error);
        // Revert the local state if the update fails
        setEditData(prev => ({ ...prev, subtasks: editData.subtasks }));
      }
    }
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setEditData(prev => ({
        ...prev,
        subtasks: [...prev.subtasks, { title: newSubtask.trim(), completed: false }]
      }));
      setNewSubtask('');
    }
  };

  const handleDeleteSubtask = (index) => {
    setEditData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index)
    }));
  };

  const handleAddReminder = () => {
    if (newReminder) {
      setEditData(prev => ({
        ...prev,
        reminders: [...prev.reminders, { time: newReminder, sent: false }]
      }));
      setNewReminder(null);
    }
  };

  const handleDeleteReminder = (index) => {
    setEditData(prev => ({
      ...prev,
      reminders: prev.reminders.filter((_, i) => i !== index)
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editData.tags.includes(newTag.trim())) {
      setEditData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleDeleteTag = (tagToDelete) => {
    setEditData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return theme.palette.success.main;
      case 'in-progress': return theme.palette.info.main;
      case 'pending': return theme.palette.warning.main;
      default: return theme.palette.grey[500];
    }
  };

  const getCompletionPercentage = () => {
    if (!editData.subtasks || editData.subtasks.length === 0) return 0;
    const completed = editData.subtasks.filter(subtask => subtask.completed).length;
    return (completed / editData.subtasks.length) * 100;
  };

  if (!task) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        TransitionComponent={Zoom}
        TransitionProps={{ timeout: 400 }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: `0 24px 48px ${alpha(theme.palette.primary.main, 0.15)}`,
            overflow: 'visible',
          }
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                backgroundColor: getPriorityColor(task.priority),
                width: 40,
                height: 40,
              }}
            >
              <TaskIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Task Details
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {task.category?.name || 'No Category'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* Status Change Buttons */}
            {!isEditing && (
              <ButtonGroup variant="contained" sx={{ mr: 1 }}>
                {task.status === 'pending' && (
                  <Tooltip title="Mark as In Progress">
                    <Button
                      onClick={() => handleStatusChange('in-progress')}
                      disabled={isUpdating}
                      sx={{
                        backgroundColor: alpha(theme.palette.info.main, 0.1),
                        color: theme.palette.info.main,
                        '&:hover': {
                          backgroundColor: theme.palette.info.main,
                          color: 'white',
                        },
                      }}
                    >
                      {isUpdating ? (
                        <CircularProgress size={20} />
                      ) : (
                        <InProgressIcon />
                      )}
                    </Button>
                  </Tooltip>
                )}
                
                {task.status !== 'completed' && (
                  <Tooltip title="Mark as Complete">
                    <Button
                      onClick={handleCompleteTask}
                      disabled={isCompleting}
                      sx={{
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main,
                        '&:hover': {
                          backgroundColor: theme.palette.success.main,
                          color: 'white',
                        },
                      }}
                    >
                      {isCompleting ? (
                        <CircularProgress size={20} />
                      ) : (
                        <CompleteIcon />
                      )}
                    </Button>
                  </Tooltip>
                )}

                {task.status !== 'pending' && (
                  <Tooltip title="Mark as Pending">
                    <Button
                      onClick={() => handleStatusChange('pending')}
                      disabled={isUpdating}
                      sx={{
                        backgroundColor: alpha(theme.palette.warning.main, 0.1),
                        color: theme.palette.warning.main,
                        '&:hover': {
                          backgroundColor: theme.palette.warning.main,
                          color: 'white',
                        },
                      }}
                    >
                      {isUpdating ? (
                        <CircularProgress size={20} />
                      ) : (
                        <PendingIcon />
                      )}
                    </Button>
                  </Tooltip>
                )}
              </ButtonGroup>
            )}

            <Tooltip title={isEditing ? "Cancel Edit" : "Edit Task"}>
              <IconButton
                onClick={() => setIsEditing(!isEditing)}
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                  },
                }}
              >
                {isEditing ? <CancelIcon /> : <EditIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete Task">
              <IconButton
                onClick={() => setDeleteConfirmOpen(true)}
                sx={{
                  backgroundColor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.main,
                  '&:hover': {
                    backgroundColor: theme.palette.error.main,
                    color: 'white',
                  },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>

            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Main Content - Full Width */}
              <Grid item xs={12} sx={{ width: '100%' }}>
                {/* Title & Description */}
                <Card elevation={1} sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TaskIcon color="primary" />
                      Task Information
                    </Typography>

                    {isEditing ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                          fullWidth
                          label="Title"
                          value={editData.title}
                          onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                          variant="outlined"
                        />
                        <TextField
                          fullWidth
                          label="Description"
                          multiline
                          rows={3}
                          value={editData.description}
                          onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                          variant="outlined"
                        />
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="h5" fontWeight={600} gutterBottom>
                          {task.title}
                        </Typography>
                        {task.description && (
                          <Typography variant="body1" color="text.secondary">
                            {task.description}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Subtasks */}
                <Card elevation={1} sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AssignmentIcon color="secondary" />
                      Subtasks ({editData.subtasks?.filter(st => st.completed).length || 0}/{editData.subtasks?.length || 0})
                    </Typography>

                    {isEditing && (
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField
                          fullWidth
                          label="Add Subtask"
                          value={newSubtask}
                          onChange={(e) => setNewSubtask(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                          size="small"
                        />
                        <Button
                          variant="contained"
                          onClick={handleAddSubtask}
                          disabled={!newSubtask.trim()}
                          startIcon={<AddIcon />}
                        >
                          Add
                        </Button>
                      </Box>
                    )}

                    <List>
                      {editData.subtasks?.map((subtask, index) => (
                        <Slide direction="right" in timeout={300 * (index + 1)} key={index}>
                          <ListItem disablePadding>
                            <ListItemButton 
                              onClick={() => handleSubtaskToggle(index)}
                              sx={{
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                },
                              }}
                            >
                              <Checkbox
                                checked={subtask.completed}
                                onChange={() => handleSubtaskToggle(index)}
                                sx={{
                                  color: theme.palette.primary.main,
                                  '&.Mui-checked': {
                                    color: theme.palette.success.main,
                                  },
                                  transition: 'all 0.2s ease',
                                }}
                              />
                              <ListItemText
                                primary={subtask.title}
                                sx={{
                                  textDecoration: subtask.completed ? 'line-through' : 'none',
                                  opacity: subtask.completed ? 0.7 : 1,
                                  transition: 'all 0.3s ease',
                                  '& .MuiListItemText-primary': {
                                    color: subtask.completed ? theme.palette.text.secondary : theme.palette.text.primary,
                                  },
                                }}
                              />
                              {subtask.completed && (
                                <Zoom in timeout={200}>
                                  <Chip
                                    label="Completed"
                                    size="small"
                                    sx={{
                                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                                      color: theme.palette.success.main,
                                      fontWeight: 600,
                                      fontSize: '0.7rem',
                                      mr: 1,
                                    }}
                                  />
                                </Zoom>
                              )}
                            </ListItemButton>
                            {isEditing && (
                              <ListItemSecondaryAction>
                                <IconButton
                                  onClick={() => handleDeleteSubtask(index)}
                                  color="error"
                                  size="small"
                                  sx={{
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                                    },
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </ListItemSecondaryAction>
                            )}
                          </ListItem>
                        </Slide>
                      ))}
                    </List>

                    {!isEditing && editData.subtasks?.length === 0 && (
                      <Box sx={{ 
                        textAlign: 'center', 
                        py: 4,
                        color: theme.palette.text.secondary 
                      }}>
                        <Typography variant="body2">
                          No subtasks added yet. Click edit to add subtasks.
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card elevation={1} sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TagIcon color="info" />
                      Tags
                    </Typography>

                    {isEditing && (
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField
                          fullWidth
                          label="Add Tag"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                          size="small"
                        />
                        <Button
                          variant="contained"
                          onClick={handleAddTag}
                          disabled={!newTag.trim()}
                          startIcon={<AddIcon />}
                        >
                          Add
                        </Button>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {editData.tags?.map((tag, index) => (
                        <Zoom in timeout={200 * (index + 1)} key={tag}>
                          <Chip
                            label={tag}
                            onDelete={isEditing ? () => handleDeleteTag(tag) : undefined}
                            color="primary"
                            variant="outlined"
                          />
                        </Zoom>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Properties and Reminders in Single Row - Full Width */}
              <Grid item xs={12} sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', gap: 3, width: '100%' }}>
                  {/* Properties - Exactly Half Width */}
                  <Box sx={{ flex: 1, width: '50%' }}>
                    <Card elevation={1} sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Properties
                        </Typography>

                        {isEditing ? (
                          <Stack spacing={2}>
                            <FormControl fullWidth>
                              <InputLabel>Priority</InputLabel>
                              <Select
                                value={editData.priority}
                                onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value }))}
                                label="Priority"
                              >
                                <MenuItem value="low">Low</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="high">High</MenuItem>
                              </Select>
                            </FormControl>

                            <FormControl fullWidth>
                              <InputLabel>Status</InputLabel>
                              <Select
                                value={editData.status}
                                onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                                label="Status"
                              >
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="in-progress">In Progress</MenuItem>
                                <MenuItem value="completed">Completed</MenuItem>
                              </Select>
                            </FormControl>

                            <FormControl fullWidth>
                              <InputLabel>Category</InputLabel>
                              <Select
                                value={editData.category}
                                onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                                label="Category"
                              >
                                {categories.map(category => (
                                  <MenuItem key={category._id} value={category._id}>
                                    {category.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>

                            <DateTimePicker
                              label="Due Date"
                              value={editData.dueDate}
                              onChange={(date) => setEditData(prev => ({ ...prev, dueDate: date }))}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  variant: 'outlined',
                                }
                              }}
                            />
                          </Stack>
                        ) : (
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="body2" color="text.secondary">Priority</Typography>
                              <Chip
                                label={task.priority}
                                sx={{
                                  backgroundColor: alpha(getPriorityColor(task.priority), 0.1),
                                  color: getPriorityColor(task.priority),
                                  fontWeight: 600,
                                }}
                              />
                            </Box>

                            <Box>
                              <Typography variant="body2" color="text.secondary">Status</Typography>
                              <Chip
                                label={task.status.replace('-', ' ')}
                                sx={{
                                  backgroundColor: alpha(getStatusColor(task.status), 0.1),
                                  color: getStatusColor(task.status),
                                  fontWeight: 600,
                                  textTransform: 'capitalize',
                                }}
                              />
                            </Box>

                            {task.dueDate && (
                              <Box>
                                <Typography variant="body2" color="text.secondary">Due Date</Typography>
                                <Typography variant="body1" sx={{ 
                                  color: isOverdue(task.dueDate) ? theme.palette.error.main : 'inherit' 
                                }}>
                                  {format(new Date(task.dueDate), 'PPP p')}
                                </Typography>
                              </Box>
                            )}

                            <Box>
                              <Typography variant="body2" color="text.secondary">Progress</Typography>
                              <Typography variant="h6" color="primary">
                                {Math.round(getCompletionPercentage())}%
                              </Typography>
                            </Box>
                          </Stack>
                        )}
                      </CardContent>
                    </Card>
                  </Box>

                  {/* Reminders - Exactly Half Width */}
                  <Box sx={{ flex: 1, width: '50%' }}>
                    <Card elevation={1} sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ScheduleIcon color="warning" />
                          Reminders
                        </Typography>

                        {isEditing && (
                          <Box sx={{ mb: 2 }}>
                            <DateTimePicker
                              label="Add Reminder"
                              value={newReminder}
                              onChange={setNewReminder}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  size: 'small',
                                  variant: 'outlined',
                                }
                              }}
                            />
                            <Button
                              variant="contained"
                              onClick={handleAddReminder}
                              disabled={!newReminder}
                              startIcon={<AddIcon />}
                              sx={{ mt: 1, width: '100%' }}
                            >
                              Add Reminder
                            </Button>
                          </Box>
                        )}

                        <List>
                          {editData.reminders?.map((reminder, index) => (
                            <ListItem key={index} disablePadding>
                              <ListItemText
                                primary={format(new Date(reminder.time), 'PPP')}
                                secondary={format(new Date(reminder.time), 'p')}
                              />
                              {isEditing && (
                                <ListItemSecondaryAction>
                                  <IconButton
                                    onClick={() => handleDeleteReminder(index)}
                                    color="error"
                                    size="small"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              )}
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        {isEditing && (
          <DialogActions sx={{ p: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Button onClick={() => setIsEditing(false)} startIcon={<CancelIcon />}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={isUpdating}
              startIcon={isUpdating ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          Delete Task
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this task? This action cannot be undone.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Task: <strong>{task?.title}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {isDeleting ? 'Deleting...' : 'Delete Task'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default TaskDetailModal;