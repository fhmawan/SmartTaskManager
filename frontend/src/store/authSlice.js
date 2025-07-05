import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      console.log('Setting credentials in authSlice:', { user, token }); // Debug log
      state.user = user;
      state.token = token;
      state.isAuthenticated = Boolean(token && user); // More explicit check
      state.error = null;
      state.loading = false;
    },
    logout: (state) => {
      console.log('Logging out in authSlice'); // Debug log
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Add this new action to help with rehydration
    rehydrateAuth: (state, action) => {
      const { user, token } = action.payload || {};
      if (token && user) {
        state.user = user;
        state.token = token;
        state.isAuthenticated = true;
        state.error = null;
        state.loading = false;
      }
    },
  },
});

export const { 
  setCredentials, 
  logout, 
  setLoading, 
  setError, 
  clearError,
  rehydrateAuth 
} = authSlice.actions;

export default authSlice.reducer; 