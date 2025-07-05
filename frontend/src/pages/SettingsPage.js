import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Avatar,
  useTheme,
  alpha,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Stack,
  Divider,
  Paper,
  Fade,
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useChangePasswordMutation, useDeleteAccountMutation } from '../services/authApi';
import { logout } from '../store/authSlice';

const SettingsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  console.log('User:', user); 
  
  // State for password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // State for account deletion
  const [deletePassword, setDeletePassword] = useState('');
  
  // UI state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteAccountDialog, setDeleteAccountDialog] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });
  
  // API mutations
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [deleteAccount, { isLoading: isDeletingAccount }] = useDeleteAccountMutation();

  const showAlert = (message, severity = 'success') => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'success' }), 5000);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showAlert('New passwords do not match!', 'error');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      showAlert('New password must be at least 6 characters long!', 'error');
      return;
    }
    
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }).unwrap();
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      showAlert('Password changed successfully!', 'success');
    } catch (error) {
      showAlert(error.data?.message || 'Failed to change password', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      showAlert('Please enter your password to confirm account deletion', 'error');
      return;
    }
    
    try {
      await deleteAccount({ password: deletePassword }).unwrap();
      
      // Clear local storage and logout
      localStorage.removeItem('token');
      dispatch(logout());
      
      showAlert('Account deleted successfully. You will be redirected to login.', 'success');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      showAlert(error.data?.message || 'Failed to delete account', 'error');
      setDeleteAccountDialog(false);
      setDeletePassword('');
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SettingsIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account settings and preferences
        </Typography>
      </Box>

      {/* Alert */}
      {alert.show && (
        <Fade in={alert.show}>
          <Alert 
            severity={alert.severity} 
            sx={{ mb: 3 }}
            onClose={() => setAlert({ show: false, message: '', severity: 'success' })}
          >
            {alert.message}
          </Alert>
        </Fade>
      )}

      {/* Main Content - Flexbox Layout */}
      <Box 
        sx={{ 
          display: 'flex', 
          gap: 3,
          flexDirection: { xs: 'column', md: 'row' }, // Stack on mobile, side-by-side on desktop
          alignItems: 'stretch', // Make both sections same height
        }}
      >
        {/* Left Section - User Profile (50% width) */}
        <Box sx={{ flex: '1 1 50%' }}>
          <Card 
            sx={{ 
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="bold" mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PersonIcon color="primary" />
                Profile Information
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{ 
                    width: 100, 
                    height: 100,
                    border: `4px solid ${theme.palette.primary.main}`,
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    mb: 2,
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
                
                <Typography variant="h6" fontWeight="bold">
                  {user?.name || 'No Name Set'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  @{user?.username}
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Stack spacing={2}>
                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                  <Typography variant="body2" color="text.secondary">
                    Full Name
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {user?.name || 'Not set'}
                  </Typography>
                </Paper>
                
                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                  <Typography variant="body2" color="text.secondary">
                    Username
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {user?.username}
                  </Typography>
                </Paper>
                
                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                  <Typography variant="body2" color="text.secondary">
                    Email Address
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {user?.email}
                  </Typography>
                </Paper>
                
                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                  <Typography variant="body2" color="text.secondary">
                    Member Since
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Right Section - Security Settings (50% width) */}
        <Box sx={{ flex: '1 1 50%' }}>
          <Stack spacing={3} sx={{ height: '100%' }}>
            {/* Change Password Card */}
            <Card 
              sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.1)} 100%)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                flex: '1 1 auto', // Take up available space
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight="bold" mb={3} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <SecurityIcon color="warning" />
                  Change Password
                </Typography>
                
                <Box component="form" onSubmit={handleChangePassword}>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      InputProps={{
                        endAdornment: (
                          <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                            {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        ),
                      }}
                      required
                    />
                    
                    <TextField
                      fullWidth
                      label="New Password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      InputProps={{
                        endAdornment: (
                          <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                            {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        ),
                      }}
                      required
                    />
                    
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      InputProps={{
                        endAdornment: (
                          <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        ),
                      }}
                      required
                    />
                    
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isChangingPassword}
                      startIcon={<SaveIcon />}
                      color="warning"
                      size="large"
                    >
                      {isChangingPassword ? 'Updating...' : 'Update Password'}
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>

            {/* Delete Account Card */}
            <Card 
              sx={{ 
                background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.2)} 100%)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                flex: '0 0 auto', // Don't grow, just take needed space
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight="bold" mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <WarningIcon color="error" />
                  Danger Zone
                </Typography>
                
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Once you delete your account, there is no going back. Please be certain.
                </Typography>
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteAccountDialog(true)}
                  size="large"
                  sx={{ 
                    borderWidth: 2,
                    '&:hover': { borderWidth: 2 }
                  }}
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Box>

      {/* Delete Account Dialog */}
      <Dialog 
        open={deleteAccountDialog} 
        onClose={() => setDeleteAccountDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          Delete Account
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Are you absolutely sure you want to delete your account? This action cannot be undone.
            All your tasks, categories, and data will be permanently removed.
          </DialogContentText>
          
          <TextField
            fullWidth
            label="Enter your password to confirm"
            type={showDeletePassword ? 'text' : 'password'}
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton onClick={() => setShowDeletePassword(!showDeletePassword)} edge="end">
                  {showDeletePassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              ),
            }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setDeleteAccountDialog(false);
              setDeletePassword('');
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={isDeletingAccount}
            startIcon={<DeleteIcon />}
          >
            {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage; 