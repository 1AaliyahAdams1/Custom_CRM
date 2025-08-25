import React from 'react';
import { Alert, AlertTitle, Typography, Box } from '@mui/material';
import { Warning } from '@mui/icons-material';

const WIPBanner = () => {
  return (
    <Alert
      severity="warning"
      icon={<Warning />}
      sx={{
        mb: 3,
        backgroundColor: 'rgba(255, 243, 205, 0.9)',
        border: '1px solid #ffeaa7',
        borderRadius: 2,
        '& .MuiAlert-icon': {
          color: '#856404'
        },
        '& .MuiAlert-message': {
          width: '100%'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 'bold',
            color: '#856404',
            fontSize: '1rem'
          }}
        >
          Work in Progress:
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#856404',
            fontSize: '1rem'
          }}
        >
          This dashboard is currently displaying static data for demonstration purposes.
        </Typography>
      </Box>
    </Alert>
  );
};

export default WIPBanner;