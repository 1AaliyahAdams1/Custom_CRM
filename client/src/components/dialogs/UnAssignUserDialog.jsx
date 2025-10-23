import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { PersonRemove } from "@mui/icons-material";

const UnassignUserDialog = ({ 
  open, 
  onClose, 
  account, 
  onConfirm, // Expects (account, selectedUserIds)
  loading = false 
}) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      isMountedRef.current = true;
      setSelectedUsers([]);
      setError(null);
      setIsProcessing(false);
    }
  }, [open]);

  // Parse assigned users from account data
  const assignedUsers = React.useMemo(() => {
    if (!account?.AssignedEmployeeIDs || !account?.AssignedEmployeeNames) {
      return [];
    }

    const ids = account.AssignedEmployeeIDs.split(',').map(id => id.trim());
    const names = account.AssignedEmployeeNames.split(',').map(name => name.trim());

    return ids.map((id, index) => ({
      id,
      name: names[index] || `User ${id}`,
    }));
  }, [account]);

  const handleToggleUser = (userId) => {
    if (isProcessing) return;
    
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
    setError(null);
  };

  const handleSelectAll = () => {
    if (isProcessing) return;
    
    if (selectedUsers.length === assignedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(assignedUsers.map(u => u.id));
    }
  };

  const handleUnassign = async () => {
    if (selectedUsers.length === 0) {
      setError("Please select at least one user to unassign");
      return;
    }

    if (!account?.AccountID) {
      setError("Account information is missing");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Call onConfirm with account and selected user IDs
      await onConfirm(account, selectedUsers);
      
      // Only reset state if component is still mounted
      if (isMountedRef.current) {
        setSelectedUsers([]);
        setIsProcessing(false);
      }
      
      // Don't call onClose here - let parent handle it after success
      // This is handled in the parent's handleConfirmUnassignUser
    } catch (err) {
      console.error("Error in UnassignUserDialog:", err);
      if (isMountedRef.current) {
        setError(err.message || "Failed to unassign users");
        setIsProcessing(false);
      }
    }
  };

  const handleClose = () => {
    if (isProcessing) return;
    
    setSelectedUsers([]);
    setError(null);
    onClose();
  };

  if (!account) return null;

  const isDisabled = loading || isProcessing;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={isProcessing}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PersonRemove color="primary" />
          <Typography variant="h6">Unassign Users</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select users to unassign from <strong>{account.AccountName}</strong>
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {assignedUsers.length === 0 ? (
          <Alert severity="info">
            No users are currently assigned to this account
          </Alert>
        ) : (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                {selectedUsers.length} of {assignedUsers.length} selected
              </Typography>
              <Button 
                size="small" 
                onClick={handleSelectAll}
                disabled={isDisabled}
              >
                {selectedUsers.length === assignedUsers.length ? "Deselect All" : "Select All"}
              </Button>
            </Box>

            <Divider sx={{ mb: 1 }} />

            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {assignedUsers.map((user) => (
                <ListItem
                  key={user.id}
                  dense
                  onClick={() => handleToggleUser(user.id)}
                  disabled={isDisabled}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    cursor: isDisabled ? 'default' : 'pointer',
                    '&:hover': {
                      backgroundColor: isDisabled ? 'transparent' : 'action.hover',
                    },
                  }}
                >
                  <Checkbox
                    edge="start"
                    checked={selectedUsers.includes(user.id)}
                    tabIndex={-1}
                    disableRipple
                    disabled={isDisabled}
                  />
                  <ListItemText 
                    primary={user.name}
                    secondary={`User ID: ${user.id}`}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={isDisabled}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUnassign}
          variant="contained"
          color="error"
          disabled={isDisabled || selectedUsers.length === 0 || assignedUsers.length === 0}
          startIcon={isProcessing ? <CircularProgress size={16} /> : <PersonRemove />}
        >
          {isProcessing ? "Unassigning..." : `Unassign ${selectedUsers.length || ''} User${selectedUsers.length === 1 ? '' : 's'}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnassignUserDialog;