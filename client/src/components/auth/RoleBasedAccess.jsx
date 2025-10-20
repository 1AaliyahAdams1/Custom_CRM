import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../hooks/auth/useAuth';

const RoleBasedAccess = ({ 
  children, 
  allowedRoles = [], 
  fallbackPath = '/unauthorized',
  showLoading = true 
}) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't check access while still loading user data
    if (loading) return;

    // If no user is logged in, redirect to login
    if (!user) {
      navigate('/login');
      return;
    }

    // Get user roles
    const userRoles = user.roles || [];
    
    // Check if user has any of the allowed roles (case-insensitive)
    const hasAccess = allowedRoles.some(role => 
      userRoles.some(userRole => 
        userRole.toLowerCase() === role.toLowerCase()
      )
    );

    // Debug logging
    console.log('=== ROLE BASED ACCESS DEBUG ===');
    console.log('User roles:', userRoles);
    console.log('Allowed roles:', allowedRoles);
    console.log('Has access:', hasAccess);
    console.log('================================');

    // If user doesn't have access, redirect to fallback path
    if (!hasAccess) {
      navigate(fallbackPath);
      return;
    }
  }, [user, loading, allowedRoles, fallbackPath, navigate]);

  // Show loading while checking access
  if (loading || !user) {
    if (!showLoading) return null;
    
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Checking access permissions...
        </Typography>
      </Box>
    );
  }

  // Get user roles for final check
  const userRoles = user.roles || [];
  const hasAccess = allowedRoles.some(role => 
    userRoles.some(userRole => 
      userRole.toLowerCase() === role.toLowerCase()
    )
  );

  // If user doesn't have access, don't render children
  if (!hasAccess) {
    return null;
  }

  // User has access, render children
  return children;
};

export default RoleBasedAccess;
