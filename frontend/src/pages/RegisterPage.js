import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  AccountCircle as AccountIcon,
  Task as TaskIcon,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useRegisterMutation } from '../services/authApi';
import { setCredentials, setError, clearError } from '../store/authSlice';

const RegisterPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error, isAuthenticated } = useSelector((state) => state.auth);
  
  const [register, { isLoading }] = useRegisterMutation();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Redirect if already authenticated
  useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated }); // Debug log
    if (isAuthenticated) {
      console.log('User is authenticated, navigating to dashboard...'); // Debug log
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const validateForm = () => {
    const errors = {};
    
    // Username validation
    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (formData.username.length > 30) {
      errors.username = 'Username must be less than 30 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      console.log('Attempting registration...'); // Debug log
      
      const registerData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        name: formData.name || undefined, // Only include name if provided
      };
      
      const result = await register(registerData).unwrap();
      console.log('Registration result:', result); // Debug log
      
      if (result.success && result.token && result.user) {
        console.log('Setting credentials...'); // Debug log
        
        // Set credentials in Redux store
        dispatch(setCredentials({
          user: result.user,
          token: result.token
        }));
        
        console.log('Credentials set, navigating...'); // Debug log
        
        // Small delay to ensure state is updated before navigation
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
        
      } else {
        console.error('Invalid response structure:', result);
        dispatch(setError('Registration failed. Please try again.'));
      }
    } catch (err) {
      console.error('Registration error:', err);
      let errorMessage = 'An error occurred during registration';
      
      if (err.status === 400) {
        if (err.data?.message?.includes('already registered')) {
          errorMessage = err.data.message;
        } else if (err.data?.message) {
          errorMessage = err.data.message;
        }
      } else if (err.data?.message) {
        errorMessage = err.data.message;
      }
      
      dispatch(setError(errorMessage));
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)} 0%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`,
        py: 3,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 4,
            backdropFilter: 'blur(10px)',
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                boxShadow: theme.shadows[8],
              }}
            >
              <TaskIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                textAlign: 'center',
              }}
            >
              Smart Task Manager
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              Create your account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join us and start managing your tasks efficiently
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              onClose={() => dispatch(clearError())}
            >
              {error}
            </Alert>
          )}

          {/* Register Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              name="username"
              label="Username"
              value={formData.username}
              onChange={handleChange}
              error={!!formErrors.username}
              helperText={formErrors.username || 'Must be 3-30 characters, letters, numbers, and underscores only'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
              disabled={isLoading}
            />

            <TextField
              fullWidth
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
              disabled={isLoading}
            />

            <TextField
              fullWidth
              name="name"
              label="Full Name (Optional)"
              value={formData.name}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
              disabled={isLoading}
            />

            <TextField
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password || 'Must be at least 6 characters'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
              disabled={isLoading}
            />

            <TextField
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleClickShowConfirmPassword}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 4 }}
              disabled={isLoading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <PersonAddIcon />}
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
                boxShadow: theme.shadows[4],
                '&:hover': {
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Box>

          {/* Divider */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              or
            </Typography>
          </Divider>

          {/* Login Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link
                component={RouterLink}
                to="/login"
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Sign in here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage; 