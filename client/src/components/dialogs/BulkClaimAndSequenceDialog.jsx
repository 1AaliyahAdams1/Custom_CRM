import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import {Timeline, CheckCircle, Info, Cancel } from '@mui/icons-material';

const BulkClaimAndSequenceDialog = ({
  open,
  onClose,
  onConfirm,
  selectedItems = [],
  sequences = [],
  loading = false,
}) => {
  const [analyzing, setAnalyzing] = useState(true);
  const [selectedSequence, setSelectedSequence] = useState('');
  const [claimableAccounts, setClaimableAccounts] = useState([]);
  const [ownedAccounts, setOwnedAccounts] = useState([]);
  const [inactiveAccounts, setInactiveAccounts] = useState([]);

  useEffect(() => {
    if (open && selectedItems.length > 0) {
      analyzeAccounts();
    }
  }, [open, selectedItems]);

  const analyzeAccounts = () => {
    setAnalyzing(true);
    
    const claimable = [];
    const owned = [];
    const inactive = [];

    selectedItems.forEach(account => {
      if (!account.Active) {
        inactive.push(account);
      } else if (account.ownerStatus === 'owned') {
        owned.push(account);
      } else if (account.ownerStatus === 'unowned' || account.ownerStatus === 'n/a') {
        claimable.push(account);
      }
    });

    setClaimableAccounts(claimable);
    setOwnedAccounts(owned);
    setInactiveAccounts(inactive);
    setAnalyzing(false);
  };

  const handleConfirm = () => {
    if (claimableAccounts.length === 0 || !selectedSequence) {
      return;
    }
    const accountIds = claimableAccounts.map(acc => acc.AccountID);
    onConfirm(accountIds, selectedSequence);
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedSequence('');
      onClose();
    }
  };

  const selectedSequenceData = sequences.find(seq => seq.SequenceID === selectedSequence);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
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
        Bulk Claim & Assign Sequence
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {analyzing ? (
          <Box display="flex" flexDirection="column" alignItems="center" py={4}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2, color: '#666' }}>
              Analyzing selected accounts...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Summary Alert */}
            <Alert 
              severity={claimableAccounts.length > 0 ? "info" : "warning"}
              icon={<Info />}
              sx={{ mb: 3 }}
            >
              <Typography variant="body2">
                {selectedItems.length} account{selectedItems.length !== 1 ? 's' : ''} selected
              </Typography>
              {claimableAccounts.length > 0 ? (
                <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                  {claimableAccounts.length} can be claimed
                </Typography>
              ) : (
                <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                  No accounts available to claim
                </Typography>
              )}
            </Alert>

            {/* Sequence Selection */}
            {claimableAccounts.length > 0 && (
              <Box mb={3}>
                <FormControl fullWidth>
                  <InputLabel>Select Sequence</InputLabel>
                  <Select
                    value={selectedSequence}
                    onChange={(e) => setSelectedSequence(e.target.value)}
                    label="Select Sequence"
                  >
                    {sequences.map((seq) => (
                      <MenuItem key={seq.SequenceID} value={seq.SequenceID}>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {seq.SequenceName}
                          </Typography>
                          {seq.SequenceDescription && (
                            <Typography variant="caption" color="text.secondary">
                              {seq.SequenceDescription}
                            </Typography>
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedSequenceData && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      What will happen:
                    </Typography>
                    <Typography variant="body2">
                      • {claimableAccounts.length} account(s) will be claimed and assigned to you
                    </Typography>
                    <Typography variant="body2">
                      • "{selectedSequenceData.SequenceName}" sequence will be assigned
                    </Typography>
                    <Typography variant="body2">
                      • All sequence activities will be automatically created
                    </Typography>
                  </Alert>
                )}
              </Box>
            )}

            {/* Claimable Accounts */}
            {claimableAccounts.length > 0 && (
              <Box mb={3}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <CheckCircle sx={{ color: '#079141ff', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Will Be Claimed ({claimableAccounts.length})
                  </Typography>
                </Box>
                <List dense sx={{ 
                  bgcolor: '#f5f5f5', 
                  borderRadius: 1,
                  maxHeight: 150,
                  overflow: 'auto'
                }}>
                  {claimableAccounts.map((account, index) => (
                    <React.Fragment key={account.AccountID}>
                      {index > 0 && <Divider />}
                      <ListItem>
                        <ListItemText 
                          primary={account.AccountName}
                          secondary={`${account.CityName || 'N/A'}, ${account.CountryName || 'N/A'}`}
                        />
                        <Chip 
                          label="Ready" 
                          size="small" 
                          sx={{ 
                            bgcolor: '#e8f5e9',
                            color: '#2e7d32',
                            fontSize: '0.75rem'
                          }} 
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}

            {/* Already Owned Accounts */}
            {ownedAccounts.length > 0 && (
              <Box mb={3}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Info sx={{ color: '#1976d2', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Already Owned ({ownedAccounts.length})
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  These accounts are already claimed and will be skipped
                </Typography>
                <List dense sx={{ 
                  bgcolor: '#f5f5f5', 
                  borderRadius: 1,
                  maxHeight: 120,
                  overflow: 'auto'
                }}>
                  {ownedAccounts.map((account, index) => (
                    <React.Fragment key={account.AccountID}>
                      {index > 0 && <Divider />}
                      <ListItem>
                        <ListItemText 
                          primary={account.AccountName}
                          secondary="Already claimed"
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}

            {/* Inactive Accounts */}
            {inactiveAccounts.length > 0 && (
              <Box mb={2}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Cancel sx={{ color: '#d32f2f', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Inactive Accounts ({inactiveAccounts.length})
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  These accounts are inactive and cannot be claimed
                </Typography>
              </Box>
            )}

            {/* No claimable accounts warning */}
            {claimableAccounts.length === 0 && (
              <Alert severity="warning">
                None of the selected accounts can be claimed. All accounts are either already owned or inactive.
              </Alert>
            )}
          </>
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
          disabled={loading || analyzing || claimableAccounts.length === 0 || !selectedSequence}
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
          {loading 
            ? 'Processing...' 
            : `Claim & Add Sequence (${claimableAccounts.length})`
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkClaimAndSequenceDialog;