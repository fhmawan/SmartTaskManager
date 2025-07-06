import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  IconButton,
  Fab,
  Drawer,
  Divider,
  useTheme,
  alpha,
  Fade,
  Zoom,
  Alert,
  Skeleton,
  Tooltip,
  Badge,
  InputAdornment,
  Stack,
  Avatar,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Sort as SortIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  Assignment as TaskIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CompleteIcon,
  Pending as PendingIcon,
  PlayArrow as InProgressIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  useGetTasksQuery, 
  useDeleteTaskMutation, 
  useCompleteTaskMutation 
} from '../services/taskApi';
import { useGetCategoriesQuery } from '../services/categoryApi';
import TaskCard from '../components/TaskCard';
import TaskDetailModal from '../components/TaskDetailModal';

const TasksPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get category from URL parameters
  const categoryFromUrl = searchParams.get('category');
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || '');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('pending'); // Default to pending
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0: Pending, 1: In Progress, 2: Completed

  // API Queries
  const { 
    data: tasksData, 
    isLoading: tasksLoading, 
    error: tasksError,
    refetch: refetchTasks 
  } = useGetTasksQuery();
  
  const { data: categoriesData } = useGetCategoriesQuery();
  const [deleteTask] = useDeleteTaskMutation();
  const [completeTask] = useCompleteTaskMutation();

  // Effect to handle URL category parameter changes
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl || '');
    }
  }, [searchParams]); // Remove selectedCategory from dependencies to prevent loops

  // Update URL when category filter changes (optional - keeps URL in sync)
  const updateCategoryInUrl = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
  };

  // Memoize tasks to prevent dependency issues
  const tasks = useMemo(() => tasksData?.data || [], [tasksData?.data]);
  const categories = useMemo(() => categoriesData?.data || [], [categoriesData?.data]);

  // Get all unique tags from tasks
  const allTags = useMemo(() => {
    const tagSet = new Set();
    tasks.forEach(task => {
      task.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [tasks]);

  // Tab status mapping
  const tabStatusMap = ['pending', 'in-progress', 'completed'];

  // Filter and sort tasks based on active tab
  const filteredAndSortedTasks = useMemo(() => {
    // First filter by active tab
    const currentStatus = tabStatusMap[activeTab];
    let filtered = tasks.filter(task => task.status === currentStatus);

    // Then apply other filters
    filtered = filtered.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || task.category?._id === selectedCategory;
      const matchesPriority = !selectedPriority || task.priority === selectedPriority;
      const matchesTag = !selectedTag || task.tags?.includes(selectedTag);

      return matchesSearch && matchesCategory && matchesPriority && matchesTag;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
          bValue = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tasks, searchTerm, selectedCategory, selectedPriority, selectedTag, sortBy, sortOrder, activeTab]);

  // Stats
  const stats = useMemo(() => {
    // First apply all filters except status (since tabs control status)
    let filteredTasks = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || task.category?._id === selectedCategory;
      const matchesPriority = !selectedPriority || task.priority === selectedPriority;
      const matchesTag = !selectedTag || task.tags?.includes(selectedTag);

      return matchesSearch && matchesCategory && matchesPriority && matchesTag;
    });

    // Calculate stats from filtered tasks
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(task => task.status === 'completed').length;
    const pending = filteredTasks.filter(task => task.status === 'pending').length;
    const inProgress = filteredTasks.filter(task => task.status === 'in-progress').length;
    const overdue = filteredTasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
    ).length;

    return { total, completed, pending, inProgress, overdue };
  }, [tasks, searchTerm, selectedCategory, selectedPriority, selectedTag]);

  // Get selected category name for display
  const selectedCategoryName = useMemo(() => {
    if (!selectedCategory) return null;
    const category = categories.find(cat => cat._id === selectedCategory);
    return category?.name || 'Unknown Category';
  }, [selectedCategory, categories]);

  // Handlers
  const handleTaskEdit = (task) => {
    navigate(`/add-task?edit=${task._id}`);
  };

  const handleTaskDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId).unwrap();
        refetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleTaskComplete = async (taskId) => {
    try {
      await completeTask(taskId).unwrap();
      refetchTasks();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setDetailModalOpen(true);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory(''); // Clear state directly
    setSelectedPriority('');
    setSelectedTag('');
    setSearchParams({}); // Clear URL parameters directly
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Clear status filter when changing tabs since tab controls status
    setSelectedStatus('');
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedPriority || selectedTag;

  if (tasksError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading tasks: {tasksError.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
      }}>
        <Fade in timeout={800}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              flexWrap: 'wrap', // Allow wrapping on mobile
              fontSize: { xs: '1.5rem', sm: '2rem' } // Responsive font size
            }}>
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
                <TaskIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />
              </Box>
              My Tasks
              <Chip 
                label={`${filteredAndSortedTasks.length} tasks`} 
                variant="outlined" 
                sx={{
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                }}
              />
              {/* Show selected category - Make it wrap friendly */}
              {selectedCategoryName && (
                <Chip
                  label={`Category: ${selectedCategoryName}`}
                  onDelete={() => updateCategoryInUrl('')}
                  color="primary"
                  variant="filled"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    maxWidth: { xs: '200px', sm: 'none' }, // Limit width on mobile
                    '& .MuiChip-deleteIcon': {
                      color: 'inherit',
                    },
                  }}
                />
              )}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {selectedCategoryName 
                ? `Manage and track your ${selectedCategoryName.toLowerCase()} tasks efficiently`
                : 'Manage and track your tasks efficiently'
              }
            </Typography>

            {/* Stats Cards - Fixed to take 100% width properly */}
            <Box sx={{ mb: 3, width: '100%' }}>
              {/* Mobile: 2 cards per row, Desktop: 5 cards per row using flexbox */}
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 2, 
                width: '100%' 
              }}>
                {/* Total */}
                <Box sx={{ 
                  flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 calc(33.333% - 11px)', md: '1 1 calc(20% - 12.8px)' },
                  minWidth: { xs: 'calc(50% - 8px)', sm: 'calc(33.333% - 11px)', md: 'calc(20% - 12.8px)' }
                }}>
                  <Zoom in timeout={600}>
                    <Card 
                      elevation={0}
                      sx={{ 
                        height: '100%',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
                        }
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }}>
                            <TaskIcon fontSize="small" />
                          </Avatar>
                        </Box>
                        <Typography variant="h5" fontWeight={700} color="primary" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                          {stats.total}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          Total
                        </Typography>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Box>

                {/* Complete */}
                <Box sx={{ 
                  flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 calc(33.333% - 11px)', md: '1 1 calc(20% - 12.8px)' },
                  minWidth: { xs: 'calc(50% - 8px)', sm: 'calc(33.333% - 11px)', md: 'calc(20% - 12.8px)' }
                }}>
                  <Zoom in timeout={700}>
                    <Card 
                      elevation={0}
                      sx={{ 
                        height: '100%',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                        border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 8px 25px ${alpha(theme.palette.success.main, 0.15)}`,
                        }
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }}>
                            <CompleteIcon fontSize="small" />
                          </Avatar>
                        </Box>
                        <Typography variant="h5" fontWeight={700} color="success.main" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                          {stats.completed}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          Complete
                        </Typography>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Box>

                {/* Pending */}
                <Box sx={{ 
                  flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 calc(33.333% - 11px)', md: '1 1 calc(20% - 12.8px)' },
                  minWidth: { xs: 'calc(50% - 8px)', sm: 'calc(33.333% - 11px)', md: 'calc(20% - 12.8px)' }
                }}>
                  <Zoom in timeout={800}>
                    <Card 
                      elevation={0}
                      sx={{ 
                        height: '100%',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 8px 25px ${alpha(theme.palette.warning.main, 0.15)}`,
                        }
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main, width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }}>
                            <PendingIcon fontSize="small" />
                          </Avatar>
                        </Box>
                        <Typography variant="h5" fontWeight={700} color="warning.main" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                          {stats.pending}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          Pending
                        </Typography>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Box>

                {/* In Progress */}
                <Box sx={{ 
                  flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 calc(33.333% - 11px)', md: '1 1 calc(20% - 12.8px)' },
                  minWidth: { xs: 'calc(50% - 8px)', sm: 'calc(33.333% - 11px)', md: 'calc(20% - 12.8px)' }
                }}>
                  <Zoom in timeout={900}>
                    <Card 
                      elevation={0}
                      sx={{ 
                        height: '100%',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                        border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 8px 25px ${alpha(theme.palette.info.main, 0.15)}`,
                        }
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main, width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }}>
                            <InProgressIcon fontSize="small" />
                          </Avatar>
                        </Box>
                        <Typography variant="h5" fontWeight={700} color="info.main" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                          {stats.inProgress}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          In Progress
                        </Typography>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Box>

                {/* Overdue */}
                <Box sx={{ 
                  flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 calc(33.333% - 11px)', md: '1 1 calc(20% - 12.8px)' },
                  minWidth: { xs: 'calc(50% - 8px)', sm: 'calc(33.333% - 11px)', md: 'calc(20% - 12.8px)' }
                }}>
                  <Zoom in timeout={1000}>
                    <Card 
                      elevation={0}
                      sx={{ 
                        height: '100%',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
                        border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 8px 25px ${alpha(theme.palette.error.main, 0.15)}`,
                        }
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, sm: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main, width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }}>
                            <ScheduleIcon fontSize="small" />
                          </Avatar>
                        </Box>
                        <Typography variant="h5" fontWeight={700} color="error.main" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                          {stats.overdue}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          Overdue
                        </Typography>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Box>
              </Box>
            </Box>

            {/* Search and Controls - Mobile Optimized */}
            <Grid container spacing={2} alignItems="center" sx={{ maxWidth: '100%' }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setSearchTerm('')} size="small">
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: alpha(theme.palette.background.paper, 0.8),
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap" gap={1}>
                  {/* Sort Controls - Responsive */}
                  <FormControl size="small" sx={{ minWidth: { xs: 100, sm: 120 } }}>
                    <InputLabel>Sort by</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      label="Sort by"
                    >
                      <MenuItem value="dueDate">Due Date</MenuItem>
                      <MenuItem value="title">Title</MenuItem>
                      <MenuItem value="priority">Priority</MenuItem>
                      <MenuItem value="createdAt">Created</MenuItem>
                    </Select>
                  </FormControl>

                  <Tooltip title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}>
                    <IconButton
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.2),
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      <SortIcon 
                        sx={{ 
                          transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.3s ease',
                        }} 
                      />
                    </IconButton>
                  </Tooltip>

                  {/* View Mode Toggle - Hidden on mobile since we only show one layout */}
                  <Tooltip title={`Switch to ${viewMode === 'grid' ? 'List' : 'Grid'} View`}>
                    <IconButton
                      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                      sx={{
                        backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                        display: { xs: 'none', sm: 'inline-flex' }, // Hide on mobile
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.secondary.main, 0.2),
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      {viewMode === 'grid' ? <ListViewIcon /> : <GridViewIcon />}
                    </IconButton>
                  </Tooltip>

                  {/* Filter Button */}
                  <Tooltip title="Filters">
                    <Badge badgeContent={hasActiveFilters ? '!' : 0} color="error">
                      <IconButton
                        onClick={() => setFilterDrawerOpen(true)}
                        sx={{
                          backgroundColor: hasActiveFilters 
                            ? alpha(theme.palette.warning.main, 0.1)
                            : alpha(theme.palette.info.main, 0.1),
                          color: hasActiveFilters ? theme.palette.warning.main : theme.palette.info.main,
                          '&:hover': {
                            backgroundColor: hasActiveFilters 
                              ? alpha(theme.palette.warning.main, 0.2)
                              : alpha(theme.palette.info.main, 0.2),
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        <FilterIcon />
                      </IconButton>
                    </Badge>
                  </Tooltip>
                </Stack>
              </Grid>
            </Grid>

            {/* Active Filters */}
            {hasActiveFilters && (
              <Fade in timeout={300}>
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    Active filters:
                  </Typography>
                  {selectedCategory && (
                    <Chip
                      label={`Category: ${selectedCategoryName}`}
                      onDelete={() => updateCategoryInUrl('')}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {selectedPriority && (
                    <Chip
                      label={`Priority: ${selectedPriority}`}
                      onDelete={() => setSelectedPriority('')}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {selectedTag && (
                    <Chip
                      label={`Tag: ${selectedTag}`}
                      onDelete={() => setSelectedTag('')}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  <Button
                    size="small"
                    onClick={clearAllFilters}
                    startIcon={<ClearIcon />}
                    sx={{ ml: 1 }}
                  >
                    Clear All
                  </Button>
                </Box>
              </Fade>
            )}
          </Box>
        </Fade>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        p: 3,
      }}>
        {/* Status Tabs - Just above tasks */}
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                minHeight: 48,
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PendingIcon fontSize="small" />
                  Pending ({stats.pending})
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InProgressIcon fontSize="small" />
                  In Progress ({stats.inProgress})
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CompleteIcon fontSize="small" />
                  Completed ({stats.completed})
                </Box>
              } 
            />
          </Tabs>
        </Box>

        {/* Tasks Content */}
        {tasksLoading ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        ) : filteredAndSortedTasks.length === 0 ? (
          <Fade in timeout={800}>
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
            }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                }}
              >
                <TaskIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h5" color="text.secondary">
                {hasActiveFilters ? `No ${tabStatusMap[activeTab].replace('-', ' ')} tasks match your filters` : `No ${tabStatusMap[activeTab].replace('-', ' ')} tasks yet`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {hasActiveFilters 
                  ? 'Try adjusting your filters or search terms'
                  : `Create your first ${tabStatusMap[activeTab].replace('-', ' ')} task to get started`
                }
              </Typography>
              {!hasActiveFilters && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/add-task')}
                  size="large"
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 12px 35px ${alpha(theme.palette.primary.main, 0.4)}`,
                    },
                  }}
                >
                  Create First Task
                </Button>
              )}
            </Box>
          </Fade>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: { xs: 2, sm: 2, md: 3 }, // Responsive gap
            width: '100%',
            maxWidth: '100%', // Ensure no overflow
            overflow: 'hidden', // Prevent horizontal scroll
          }}>
            {filteredAndSortedTasks.map((task, index) => (
              <Box 
                key={task._id}
                sx={{
                  // Mobile-first responsive width without calc()
                  width: { 
                    xs: '100%', // Full width on mobile
                    sm: '48%',  // ~50% on small screens (accounting for gap)
                    md: '23%'   // ~25% on medium+ screens (accounting for gap)
                  },
                  maxWidth: { 
                    xs: '100%', 
                    sm: '48%', 
                    md: '23%' 
                  },
                  flexShrink: 0,
                  flexGrow: 0,
                }}
              >
                <TaskCard
                  task={task}
                  index={index}
                  onEdit={handleTaskEdit}
                  onDelete={handleTaskDelete}
                  onComplete={handleTaskComplete}
                  onViewDetails={handleViewDetails}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Floating Action Button */}
      <Zoom in timeout={1200}>
        <Fab
          color="primary"
          onClick={() => navigate('/tasks/new')}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: `0 12px 35px ${alpha(theme.palette.primary.main, 0.4)}`,
            },
          }}
        >
          <AddIcon />
        </Fab>
      </Zoom>

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 320,
            borderRadius: '16px 0 0 16px',
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon color="primary" />
            Filters
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={3}>
            {/* Category Filter */}
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => updateCategoryInUrl(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category._id} value={category._id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: category.color,
                        }}
                      />
                      {category.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Priority Filter */}
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                label="Priority"
              >
                <MenuItem value="">All Priorities</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>

            {/* Tag Filter */}
            <FormControl fullWidth>
              <InputLabel>Tag</InputLabel>
              <Select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                label="Tag"
              >
                <MenuItem value="">All Tags</MenuItem>
                {allTags.map(tag => (
                  <MenuItem key={tag} value={tag}>
                    {tag}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={clearAllFilters}
              startIcon={<ClearIcon />}
              disabled={!hasActiveFilters}
              fullWidth
            >
              Clear All Filters
            </Button>
          </Stack>
        </Box>
      </Drawer>

      {/* Task Detail Modal */}
      <TaskDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        task={selectedTask}
        onTaskUpdated={() => {
          refetchTasks();
          setDetailModalOpen(false);
        }}
      />
    </Box>
  );
};

export default TasksPage; 