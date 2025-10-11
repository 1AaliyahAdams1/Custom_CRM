import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { Timeline, CheckCircle } from '@mui/icons-material';

const AssignSequenceDialog = ({
  open,
  onClose,
  onConfirm,
  account = null,
  sequences = [],
  loading = false,
}) => {
  const [selectedSequence, setSelectedSequence] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setSelectedSequence('');
      setError('');
    }
  }, [open]);

  const handleConfirm = () => {
    if (!selectedSequence) {
      setError('Please select a sequence');
      return;
    }
    
    onConfirm(selectedSequence);
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const activeSequences = sequences.filter(seq => seq.Active !== false);

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
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        borderBottom: '1px solid #e0e0e0',
        pb: 2
      }}>
        <Timeline sx={{ color: '#079141ff' }} />
        Assign Sequence to Account
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {account && (
          <Box mb={3}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Account
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body1" fontWeight={600}>
                {account.AccountName}
              </Typography>
              {account.Active && (
                <Chip 
                  label="Active" 
                  size="small" 
                  sx={{ 
                    bgcolor: '#e8f5e9',
                    color: '#2e7d32',
                    fontSize: '0.75rem'
                  }} 
                />
              )}
            </Box>
            {account.CityName && account.CountryName && (
              <Typography variant="body2" color="text.secondary">
                {account.CityName}, {account.CountryName}
              </Typography>
            )}
          </Box>
        )}

        <FormControl fullWidth variant="outlined">
          <InputLabel id="sequence-select-label">Select Sequence</InputLabel>
          <Select
            labelId="sequence-select-label"
            id="sequence-select"
            value={selectedSequence}
            onChange={(e) => {
              setSelectedSequence(e.target.value);
              setError('');
            }}
            label="Select Sequence"
            disabled={loading}
          >
            {activeSequences.length === 0 ? (
              <MenuItem disabled value="">
                <em>No active sequences available</em>
              </MenuItem>
            ) : (
              activeSequences.map((seq) => (
                <MenuItem key={seq.SequenceID} value={seq.SequenceID}>
                  <Box>
                    <Typography variant="body1">
                      {seq.SequenceName}
                    </Typography>
                    {seq.SequenceDescription && (
                      <Typography variant="caption" color="text.secondary">
                        {seq.SequenceDescription}
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {selectedSequence && (
          <Alert severity="info" icon={<CheckCircle />} sx={{ mt: 2 }}>
            <Typography variant="body2">
              This will assign the selected sequence to the account and automatically create all associated activities.
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0' }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          sx={{ color: '#666' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={loading || !selectedSequence || activeSequences.length === 0}
          startIcon={loading ? <CircularProgress size={16} /> : <Timeline />}
          sx={{
            bgcolor: '#079141ff',
            '&:hover': {
              bgcolor: '#067a37',
            },
            '&:disabled': {
              bgcolor: '#ccc',
            }
          }}
        >
          {loading ? 'Assigning...' : 'Assign Sequence'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignSequenceDialog;