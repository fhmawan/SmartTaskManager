import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Tooltip,
  useTheme,
  alpha,
  Fade,
  Zoom,
  Avatar,
  Stack,
} from '@mui/material';
import {
  CheckCircle as CompleteIcon,
  Schedule as ScheduleIcon,
  Flag as FlagIcon,
  Assignment as TaskIcon,
} from '@mui/icons-material';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

const TaskCard = ({ 
  task, 
  onViewDetails,
  index = 0 
}) => {
  const theme = useTheme();

  // Custom isOverdue function since it's not available in date-fns
  const isOverdue = (date) => {
    if (!date) return false;
    return isPast(new Date(date)) && !isToday(new Date(date));
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

  const getDueDateInfo = (dueDate) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    
    if (isOverdue(date)) {
      return { text: 'Overdue', color: theme.palette.error.main, icon: '🔴' };
    }
    if (isToday(date)) {
      return { text: 'Today', color: theme.palette.warning.main, icon: '⚡' };
    }
    if (isTomorrow(date)) {
      return { text: 'Tomorrow', color: theme.palette.info.main, icon: '📅' };
    }
    
    return { 
      text: format(date, 'MMM dd'), 
      color: theme.palette.text.secondary, 
      icon: '📆' 
    };
  };

  const getCompletionPercentage = () => {
    if (!task.subtasks || task.subtasks.length === 0) return 0;
    const completed = task.subtasks.filter(subtask => subtask.completed).length;
    return (completed / task.subtasks.length) * 100;
  };

  // Limit description to 4-5 words
  const getTruncatedDescription = (description) => {
    if (!description) return '';
    const words = description.split(' ').filter(word => word.trim());
    if (words.length <= 5) return description;
    return words.slice(0, 5).join(' ') + '...';
  };

  const dueDateInfo = getDueDateInfo(task.dueDate);
  const completionPercentage = getCompletionPercentage();
  const truncatedDescription = getTruncatedDescription(task.description);

  return (
    <Fade in timeout={300 + index * 100}>
      <Card
        sx={{
          width: '100%',
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
          position: 'relative',
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
          backdropFilter: 'blur(10px)',
          overflow: 'hidden',
          boxSizing: 'border-box',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 12px 35px ${alpha(theme.palette.primary.main, 0.15)}`,
            borderColor: alpha(theme.palette.primary.main, 0.3),
            '& .priority-flag': {
              transform: 'scale(1.1) rotate(5deg)',
            }
          },
        }}
        onClick={() => onViewDetails(task)}
      >
        {/* Priority Flag */}
        <Box
          className="priority-flag"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 18,
            height: 18,
            backgroundColor: getPriorityColor(task.priority),
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            transition: 'all 0.3s ease',
            boxShadow: `0 2px 8px ${alpha(getPriorityColor(task.priority), 0.4)}`,
          }}
        >
          <FlagIcon sx={{ fontSize: 10, color: 'white' }} />
        </Box>

        {/* Status Badge */}
        {task.status === 'completed' && (
          <Zoom in timeout={500}>
            <Box
              sx={{
                position: 'absolute',
                top: -4,
                left: -4,
                backgroundColor: theme.palette.success.main,
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 3,
                boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.4)}`,
                border: `2px solid ${theme.palette.background.paper}`,
              }}
            >
              <CompleteIcon sx={{ fontSize: 12, color: 'white' }} />
            </Box>
          </Zoom>
        )}

        <CardContent sx={{ 
          p: 2,
          pb: 3,
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Category - Fixed Height */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1,
            height: '16px',
            minHeight: '16px',
            overflow: 'hidden',
          }}>
            {task.category && (
              <>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: task.category.color,
                    mr: 0.8,
                    flexShrink: 0,
                    boxShadow: `0 0 0 2px ${alpha(task.category.color, 0.2)}`,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: task.category.color,
                    fontWeight: 700,
                    fontSize: '0.6rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}
                >
                  {task.category.name}
                </Typography>
              </>
            )}
          </Box>

          {/* Title - Fixed Height */}
          <Box sx={{ 
            height: '40px',
            minHeight: '40px',
            mb: 0.8,
            display: 'flex',
            alignItems: 'flex-start',
            overflow: 'hidden',
          }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                lineHeight: 1.2,
                fontSize: '0.95rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                color: task.status === 'completed' ? theme.palette.text.secondary : theme.palette.text.primary,
                textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                width: '100%',
              }}
            >
              {task.title}
            </Typography>
          </Box>

          {/* Description - Fixed Height */}
          <Box sx={{ 
            height: '20px',
            minHeight: '20px',
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
          }}>
            {truncatedDescription && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: '0.75rem',
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%',
                }}
              >
                {truncatedDescription}
              </Typography>
            )}
          </Box>

          {/* Status - Fixed Height */}
          <Box sx={{ 
            height: '24px',
            minHeight: '24px',
            mb: 1,
            display: 'flex',
            alignItems: 'center',
          }}>
            <Chip
              label={task.status.replace('-', ' ')}
              size="small"
              sx={{
                backgroundColor: alpha(getStatusColor(task.status), 0.1),
                color: getStatusColor(task.status),
                fontWeight: 600,
                textTransform: 'capitalize',
                border: `1px solid ${alpha(getStatusColor(task.status), 0.3)}`,
                fontSize: '0.65rem',
                height: 20,
              }}
            />
          </Box>

          {/* Progress Bar - Conditional Height */}
          {task.subtasks && task.subtasks.length > 0 && (
            <Box sx={{ 
              mb: 1,
              overflow: 'hidden',
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  Subtasks
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={completionPercentage}
                sx={{
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 2,
                    backgroundColor: completionPercentage === 100 
                      ? theme.palette.success.main 
                      : theme.palette.primary.main,
                  },
                }}
              />
            </Box>
          )}

          {/* Tags - Conditional Height */}
          {task.tags && task.tags.length > 0 && (
            <Box sx={{ 
              mb: 1,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.4,
              overflow: 'hidden',
            }}>
              {task.tags.slice(0, 2).map((tag, index) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: '0.6rem',
                    height: 16,
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    color: theme.palette.primary.main,
                    maxWidth: '55px',
                    '& .MuiChip-label': {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      px: 0.5,
                    },
                  }}
                />
              ))}
              {task.tags.length > 2 && (
                <Chip
                  label={`+${task.tags.length - 2}`}
                  size="small"
                  variant="filled"
                  sx={{ 
                    fontSize: '0.6rem', 
                    height: 16,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}
                />
              )}
            </Box>
          )}

          {/* Footer - Now with proper spacing from bottom */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mt: 'auto',
            overflow: 'hidden',
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.4,
              overflow: 'hidden',
              flex: 1,
            }}>
              {dueDateInfo && (
                <>
                  <span style={{ fontSize: '11px', flexShrink: 0 }}>{dueDateInfo.icon}</span>
                  <Typography
                    variant="caption"
                    sx={{
                      color: dueDateInfo.color,
                      fontWeight: 600,
                      fontSize: '0.65rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {dueDateInfo.text}
                  </Typography>
                </>
              )}
            </Box>

            {task.reminders && task.reminders.length > 0 && (
              <Tooltip title={`${task.reminders.length} reminder${task.reminders.length > 1 ? 's' : ''}`}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.4,
                  flexShrink: 0,
                }}>
                  <ScheduleIcon sx={{ fontSize: 12, color: theme.palette.info.main }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    {task.reminders.length}
                  </Typography>
                </Box>
              </Tooltip>
            )}
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

export default TaskCard; 