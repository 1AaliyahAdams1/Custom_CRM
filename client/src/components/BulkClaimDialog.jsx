import React, { useState } from 'react';
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

  // Filter claimable accounts based on user role
  // Sales Rep can claim 'unowned' accounts
  // C-level can claim 'n/a' accounts
  const claimableAccounts = selectedItems.filter(account => {
    return account.ownerStatus === 'unowned' || account.ownerStatus === 'n/a';
  });

  const handleConfirm = () => {
    if (claimableAccounts.length === 0) {
      setError('No claimable accounts selected');
      return;
    }
    setError(''); // Clear any errors
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
      PaperProps={{
        sx: { 
          borderRadius: 2,
          backgroundColor: 'white',
          color: 'black'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        pb: 1,
        color: 'black'
      }}>
        Bulk Claim Accounts
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              backgroundColor: 'white',
              color: 'black',
              border: '1px solid black',
              '& .MuiAlert-icon': {
                color: 'black'
              }
            }}
          >
            {error}
          </Alert>
        )}

        <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
          You are about to claim {claimableAccounts.length} unowned account{claimableAccounts.length !== 1 ? 's' : ''} from {selectedItems.length} selected account{selectedItems.length !== 1 ? 's' : ''}:
        </Typography>

        {/* Claimable accounts preview */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'black' }}>
            Accounts to be claimed:
          </Typography>
          <Box sx={{ 
            maxHeight: 150, 
            overflow: 'auto', 
            border: '1px solid black', 
            borderRadius: 1,
            backgroundColor: '#f9f9f9'
          }}>
            <List dense>
              {claimableAccounts.slice(0, 10).map((account, index) => (
                <ListItem key={account.AccountID || index}>
                  <ListItemText 
                    primary={account.AccountName}
                    secondary={`${account.CityName || 'Unknown'}, ${account.CountryName || 'Unknown'}`}
                    sx={{
                      '& .MuiListItemText-primary': { color: 'black' },
                      '& .MuiListItemText-secondary': { color: '#666' }
                    }}
                  />
                </ListItem>
              ))}
              {claimableAccounts.length > 10 && (
                <ListItem>
                  <ListItemText 
                    primary={`... and ${claimableAccounts.length - 10} more accounts`}
                    sx={{ 
                      fontStyle: 'italic',
                      '& .MuiListItemText-primary': { color: '#666' }
                    }}
                  />
                </ListItem>
              )}
            </List>
          </Box>
        </Box>

        {/* Non-claimable accounts notice */}
        {selectedItems.length > claimableAccounts.length && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>
              Accounts that cannot be claimed (already owned or unavailable):
            </Typography>
            <Box sx={{ 
              maxHeight: 100, 
              overflow: 'auto', 
              border: '1px solid #ddd', 
              borderRadius: 1,
              backgroundColor: '#f5f5f5'
            }}>
              <List dense>
                {selectedItems
                  .filter(account => account.ownerStatus !== 'unowned')
                  .slice(0, 5)
                  .map((account, index) => (
                    <ListItem key={account.AccountID || index}>
                      <ListItemText 
                        primary={account.AccountName}
                        secondary={`Status: ${account.ownerStatus}`}
                        sx={{
                          '& .MuiListItemText-primary': { color: '#666' },
                          '& .MuiListItemText-secondary': { color: '#999' }
                        }}
                      />
                    </ListItem>
                  ))}
                {(selectedItems.length - claimableAccounts.length) > 5 && (
                  <ListItem>
                    <ListItemText 
                      primary={`... and ${(selectedItems.length - claimableAccounts.length) - 5} more accounts`}
                      sx={{ 
                        fontStyle: 'italic',
                        '& .MuiListItemText-primary': { color: '#999' }
                      }}
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          </Box>
        )}

        {claimableAccounts.length > 0 && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            backgroundColor: '#f5f5f5', 
            borderRadius: 1,
            border: '1px solid #ddd'
          }}>
            <Typography variant="body2" sx={{ color: 'black' }}>
              <strong>Confirmation:</strong> You are about to claim ownership of {claimableAccounts.length} account
              {claimableAccounts.length !== 1 ? 's' : ''}. These accounts will be assigned to you and marked as owned.
            </Typography>
          </Box>
        )}

        {claimableAccounts.length === 0 && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            backgroundColor: '#fff3cd', 
            borderRadius: 1,
            border: '1px solid #ffc107'
          }}>
            <Typography variant="body2" sx={{ color: '#856404' }}>
              <strong>Notice:</strong> None of the selected accounts can be claimed. Only unowned accounts are eligible for claiming.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button 
          onClick={handleClose}
          disabled={loading}
          sx={{
            color: 'black',
            borderColor: 'black',
            '&:hover': {
              backgroundColor: '#f5f5f5',
              borderColor: 'black'
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm}
          variant="contained"
          disabled={claimableAccounts.length === 0 || loading}
          startIcon={loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null}
          sx={{
            backgroundColor: 'black',
            color: 'white',
            '&:hover': {
              backgroundColor: '#333'
            },
            '&:disabled': {
              backgroundColor: '#ccc',
              color: '#666'
            }
          }}
        >
          {loading ? 'Claiming...' : `Claim ${claimableAccounts.length} Account${claimableAccounts.length !== 1 ? 's' : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkClaimDialog;