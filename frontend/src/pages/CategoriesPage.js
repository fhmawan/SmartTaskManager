import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  useTheme,
  alpha,
  Fade,
  Zoom,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Category as CategoryIcon,
  Task as TaskIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { 
  useGetCategoriesQuery, 
  useCreateCategoryMutation, 
  useUpdateCategoryMutation, 
  useDeleteCategoryMutation 
} from '../services/categoryApi';
import { useGetTasksQuery } from '../services/taskApi';
import CategoryCard from '../components/CategoryCard';
import CategoryFormModal from '../components/CategoryFormModal';
import DeleteCategoryModal from '../components/DeleteCategoryModal';

const CategoriesPage = () => {
  const theme = useTheme();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // API Hooks
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useGetCategoriesQuery();
  const { data: tasksData } = useGetTasksQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const categories = categoriesData?.data || [];
  const tasks = tasksData?.data || [];

  // Calculate stats
  const stats = useMemo(() => {
    const totalCategories = categories.length;
    const totalTasks = tasks.length;
    const categoriesWithTasks = categories.filter(cat => 
      tasks.some(task => task.category?._id === cat._id)
    ).length;
    const emptyCategoriesCount = totalCategories - categoriesWithTasks;

    return {
      totalCategories,
      totalTasks,
      categoriesWithTasks,
      emptyCategoriesCount,
    };
  }, [categories, tasks]);

  // Get task count for a category
  const getTaskCount = (categoryId) => {
    return tasks.filter(task => task.category?._id === categoryId).length;
  };

  // Handlers
  const handleCreateCategory = async (categoryData) => {
    try {
      await createCategory(categoryData).unwrap();
      setCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleUpdateCategory = async (categoryData) => {
    try {
      await updateCategory({ id: selectedCategory._id, ...categoryData }).unwrap();
      setEditModalOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async () => {
    try {
      await deleteCategory(selectedCategory._id).unwrap();
      setDeleteModalOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (category) => {
    setSelectedCategory(category);
    setDeleteModalOpen(true);
  };

  if (categoriesError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading categories: {categoriesError.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
      }}>
        <Fade in timeout={800}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                <CategoryIcon sx={{ fontSize: 32 }} />
              </Box>
              Categories
              <Chip 
                label={`${stats.totalCategories} categories`} 
                variant="outlined" 
                sx={{
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                }}
              />
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Organize your tasks with custom categories
            </Typography>

            {/* Stats Cards - Using Flexbox for 25% width each */}
            <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
              {/* Total Categories */}
              <Box sx={{ flex: 1, width: '25%' }}>
                <Zoom in timeout={600}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, mx: 'auto', mb: 1 }}>
                        <CategoryIcon />
                      </Avatar>
                      <Typography variant="h5" fontWeight={700} color="primary">
                        {stats.totalCategories}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Total Categories
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Box>

              {/* Categories With Tasks */}
              <Box sx={{ flex: 1, width: '25%' }}>
                <Zoom in timeout={700}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 25px ${alpha(theme.palette.success.main, 0.15)}`,
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, mx: 'auto', mb: 1 }}>
                        <TaskIcon />
                      </Avatar>
                      <Typography variant="h5" fontWeight={700} color="success.main">
                        {stats.categoriesWithTasks}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        With Tasks
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Box>

              {/* Total Tasks */}
              <Box sx={{ flex: 1, width: '25%' }}>
                <Zoom in timeout={800}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 25px ${alpha(theme.palette.warning.main, 0.15)}`,
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main, mx: 'auto', mb: 1 }}>
                        <AssignmentIcon />
                      </Avatar>
                      <Typography variant="h5" fontWeight={700} color="warning.main">
                        {stats.totalTasks}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Total Tasks
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Box>

              {/* Empty Categories */}
              <Box sx={{ flex: 1, width: '25%' }}>
                <Zoom in timeout={900}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                      border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 25px ${alpha(theme.palette.info.main, 0.15)}`,
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main, mx: 'auto', mb: 1 }}>
                        <CategoryIcon />
                      </Avatar>
                      <Typography variant="h5" fontWeight={700} color="info.main">
                        {stats.emptyCategoriesCount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Empty Categories
                      </Typography>
                    </CardContent>
                  </Card>
                </Zoom>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Box>

      {/* Categories Grid */}
      <Box sx={{ flex: 1, p: 3 }}>
        {categoriesLoading ? (
          <Grid container spacing={3}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: 200 }}>
                  <CardContent>
                    <CircularProgress size={24} sx={{ mb: 2 }} />
                    <Typography variant="h6">Loading...</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : categories.length === 0 ? (
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
                <CategoryIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h5" color="text.secondary">
                No categories yet
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create your first category to organize your tasks
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateModalOpen(true)}
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
                Create First Category
              </Button>
            </Box>
          </Fade>
        ) : (
          <Grid container spacing={3}>
            {categories.map((category, index) => (
              <Grid item xs={12} sm={6} md={4} key={category._id}>
                <CategoryCard
                  category={category}
                  taskCount={getTaskCount(category._id)}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  index={index}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Floating Action Button */}
      <Zoom in timeout={1200}>
        <Fab
          color="primary"
          onClick={() => setCreateModalOpen(true)}
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

      {/* Modals */}
      <CategoryFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateCategory}
        isLoading={isCreating}
      />

      <CategoryFormModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleUpdateCategory}
        category={selectedCategory}
        isLoading={isUpdating}
      />

      <DeleteCategoryModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteCategory}
        category={selectedCategory}
        isLoading={isDeleting}
      />
    </Box>
  );
};

export default CategoriesPage; 