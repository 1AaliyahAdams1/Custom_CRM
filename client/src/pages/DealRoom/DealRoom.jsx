import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Business } from '@mui/icons-material';

const DealRoom = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa'
        }}
      >
        <Business 
          sx={{ 
            fontSize: 64, 
            color: 'primary.main', 
            mb: 2 
          }} 
        />
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontWeight: 'bold',
            color: 'primary.main',
            mb: 1
          }}
        >
          Deal Room
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'text.secondary',
            fontStyle: 'primary.main'
          }}
        >
          This is the dealroom, for now.........
        </Typography>
      </Paper>
    </Box>
  );
};

export default DealRoom;