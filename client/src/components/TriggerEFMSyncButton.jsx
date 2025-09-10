import React, { useState } from 'react';
import { IconButton, CircularProgress, Snackbar, Alert } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import { triggerEFMSync } from '../services/efmService';

const TriggerEFMSyncButton = () => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleClick = async () => {
    setLoading(true);
    try {
      const result = await triggerEFMSync();
      setSnackbar({
        open: true,
        message: result.message || 'EFM sync triggered successfully!',
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to trigger EFM sync',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        disabled={loading}
        sx={{
          backgroundColor: 'white',
          color: 'black',
          '&:hover': { backgroundColor: '#f0f0f0' },
        }}
      >
        {loading ? <CircularProgress size={24} /> : <SyncIcon />}
      </IconButton>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TriggerEFMSyncButton;
