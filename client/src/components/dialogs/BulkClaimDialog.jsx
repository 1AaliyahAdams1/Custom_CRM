import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';

const BulkClaimDialog = ({
  open,
  onClose,
  selectedItems = [],
  onConfirm,
  loading = false,
}) => {
  const [error, setError] = useState('');
  const [claimableAccounts, setClaimableAccounts] = useState([]);
  const [nonClaimableAccounts, setNonClaimableAccounts] = useState([]);

  useEffect(() => {
    if (open) {
      setError('');
      const claimable = selectedItems.filter(
        acc => acc.ownerStatus === 'unowned' || acc.ownerStatus === 'n/a'
      );
      const nonClaimable = selectedItems.filter(
        acc => acc.ownerStatus !== 'unowned' && acc.ownerStatus !== 'n/a'
      );
      setClaimableAccounts(claimable);
      setNonClaimableAccounts(nonClaimable);
    }
  }, [open, selectedItems]);

  const handleConfirm = () => {
    if (claimableAccounts.length === 0) {
      setError('No claimable accounts selected');
      return;
    }
    setError('');
    onConfirm(claimableAccounts);
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Bulk Claim Accounts</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Typography variant="body2" sx={{ mb: 2 }}>
          You are about to claim {claimableAccounts.length} unowned account
          {claimableAccounts.length !== 1 ? 's' : ''} from {selectedItems.length}{' '}
          selected account{selectedItems.length !== 1 ? 's' : ''}:
        </Typography>

        {claimableAccounts.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Accounts to be claimed:
            </Typography>
            <Box
              sx={{
                maxHeight: 150,
                overflowY: 'auto',
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.paper',
              }}
            >
              <List dense>
                {claimableAccounts.map((acc, index) => (
                  <ListItem key={acc.AccountID || index}>
                    <ListItemText
                      primary={acc.AccountName}
                      secondary={`${acc.CityName || 'Unknown'}, ${acc.CountryName || 'Unknown'}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        )}

        {nonClaimableAccounts.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Accounts that cannot be claimed:
            </Typography>
            <Box
              sx={{
                maxHeight: 100,
                overflowY: 'auto',
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.default',
              }}
            >
              <List dense>
                {nonClaimableAccounts.map((acc, index) => (
                  <ListItem key={acc.AccountID || index}>
                    <ListItemText
                      primary={acc.AccountName}
                      secondary={`Status: ${acc.ownerStatus}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} variant="outlined" disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={claimableAccounts.length === 0 || loading}
        >
          {loading ? 'Claiming...' : `Claim ${claimableAccounts.length} Account${claimableAccounts.length !== 1 ? 's' : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkClaimDialog;
