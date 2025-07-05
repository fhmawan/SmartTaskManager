import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Sidebar from './Sidebar';

const SIDEBAR_WIDTH = 280;

const DashboardLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  
  // Start with sidebar closed by default
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Sidebar 
        open={sidebarOpen} 
        onClose={handleSidebarToggle}
        isMobile={isMobile}
      />
      
      {/* Main Content Wrapper */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          flexGrow: 1,
          // Remove margin and width calculations - let flexbox handle it
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* Top Bar */}
        <TopBar 
          onMenuClick={handleSidebarToggle} 
          sidebarOpen={sidebarOpen}
        />
        
        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflow: 'auto',
            backgroundColor: theme.palette.background.default,
            minHeight: 0, // Important for scroll
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout; 