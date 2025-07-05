import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Avatar,
  useTheme,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  Delete as DeleteIcon,
} from '@mui/icons-material';

const DeleteCategoryModal = ({ 
  open, 
  onClose, 
  onConfirm, 
  category, 
  isLoading = false 
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: `0 24px 48px ${alpha(theme.palette.error.main, 0.15)}`,
        }
      }}
    >
      <DialogTitle sx={{ 
        background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}>
        <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main }}>
          <DeleteIcon />
        </Avatar>
        Delete Category
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Typography variant="body1" gutterBottom>
          Are you sure you want to delete the category "{category?.name}"?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This action cannot be undone. Tasks in this category will be moved to "No Category".
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
        >
          {isLoading ? 'Deleting...' : 'Delete Category'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteCategoryModal; 