import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';

const BulkDueDatesDialog = ({
  open,
  onClose,
  onConfirm,
  selectedItems = [],
  loading = false,
}) => {
  const [dueToStart, setDueToStart] = useState('');
  const [dueToEnd, setDueToEnd] = useState('');
  const [error, setError] = useState('');

  const handleClose = () => {
    setDueToStart('');
    setDueToEnd('');
    setError('');
    onClose();
  };

  const handleConfirm = () => {
    setError('');

    // Validation
    if (!dueToStart && !dueToEnd) {
      setError('At least one due date (start or end) is required');
      return;
    }

    if (dueToStart && dueToEnd && new Date(dueToStart) >= new Date(dueToEnd)) {
      setError('Due start date must be before due end date');
      return;
    }

    onConfirm({
      dueToStart: dueToStart ? new Date(dueToStart).toISOString() : null,
      dueToEnd: dueToEnd ? new Date(dueToEnd).toISOString() : null,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Update Due Dates
        </Typography>
        <Typography variant="body2" sx={{ color: '#666666', mt: 0.5 }}>
          Update due dates for {selectedItems.length} selected activit{selectedItems.length === 1 ? 'y' : 'ies'}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Due To Start"
            type="datetime-local"
            value={dueToStart}
            onChange={(e) => setDueToStart(e.target.value)}
            fullWidth
            helperText="Optional: Set when the activity should start"
            disabled={loading}
            InputLabelProps={{
              shrink: true,
            }}
          />

          <TextField
            label="Due To End"
            type="datetime-local"
            value={dueToEnd}
            onChange={(e) => setDueToEnd(e.target.value)}
            fullWidth
            helperText="Optional: Set when the activity should be completed"
            disabled={loading}
            InputLabelProps={{
              shrink: true,
            }}
          />

          {/* Preview of selected activities */}
          <Box sx={{ 
            backgroundColor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1,
            maxHeight: 200,
            overflowY: 'auto'
          }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Selected Activities:
            </Typography>
            {selectedItems.slice(0, 5).map((item, index) => (
              <Typography key={item.ActivityID || index} variant="body2" sx={{ color: '#666666' }}>
                • {item.ActivityType} - {item.AccountName}
              </Typography>
            ))}
            {selectedItems.length > 5 && (
              <Typography variant="body2" sx={{ color: '#666666', fontStyle: 'italic' }}>
                ... and {selectedItems.length - 5} more
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ color: '#666666' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={loading || (!dueToStart && !dueToEnd)}
          startIcon={loading ? <CircularProgress size={16} /> : null}
          sx={{
            backgroundColor: '#050505',
            '&:hover': {
              backgroundColor: '#333333',
            },
            '&:disabled': {
              backgroundColor: '#cccccc',
              color: '#666666',
            },
          }}
        >
          {loading ? 'Updating...' : `Update ${selectedItems.length} Activit${selectedItems.length === 1 ? 'y' : 'ies'}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkDueDatesDialog;