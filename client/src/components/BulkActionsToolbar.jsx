//adds bulk actions like bulk assign and bulk claim
import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Divider,
  Typography,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Assignment,
  PersonAdd,
  Delete,
  MoreHoriz,
  Check,
  Cancel,
} from '@mui/icons-material';

const BulkActionsToolbar = ({
  selectedCount = 0,
  selectedItems = [],
  entityType = 'records',
  onBulkAssign,
  onBulkClaim,
  onBulkDeactivate,
  onBulkExport,
  onClearSelection,
  userRole = '',
  loading = false,
  disabled = false,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [bulkLoading, setBulkLoading] = useState('');

  const handleMoreClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleBulkAction = async (action, handler) => {
    if (!handler || loading || disabled) return;
    
    setBulkLoading(action);
    try {
      await handler(selectedItems);
    } catch (error) {
      console.error(`Bulk ${action} failed:`, error);
    } finally {
      setBulkLoading('');
      handleClose();
    }
  };

  // Don't render if no items selected
  if (selectedCount === 0) return null;

  const isSalesRep = userRole.includes('Sales Representative');
  const isCLevel = userRole.includes('C-level');
  
  // Determine which accounts can be claimed (only unowned ones)
  const claimableCount = selectedItems.filter(item => item.ownerStatus === 'unowned').length;
  const canClaim = isSalesRep && claimableCount > 0;

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1200,
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        borderRadius: '8px 8px 0 0',
        mb: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {selectedCount} {entityType}{selectedCount !== 1 ? 's' : ''} selected
        </Typography>
        
        {claimableCount > 0 && claimableCount !== selectedCount && (
          <Chip
            label={`${claimableCount} claimable`}
            size="small"
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              color: 'inherit' 
            }}
          />
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Primary bulk actions */}
        {canClaim && (
          <Tooltip title={`Claim ${claimableCount} unowned ${entityType}${claimableCount !== 1 ? 's' : ''}`}>
            <Button
              variant="contained"
              size="small"
              startIcon={
                bulkLoading === 'claim' ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <PersonAdd />
                )
              }
              onClick={() => handleBulkAction('claim', onBulkClaim)}
              disabled={loading || bulkLoading || disabled}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'inherit',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.25)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.5)',
                }
              }}
            >
              {bulkLoading === 'claim' ? 'Claiming...' : `Claim ${claimableCount}`}
            </Button>
          </Tooltip>
        )}

        <Tooltip title={`Assign team members to ${selectedCount} selected ${entityType}${selectedCount !== 1 ? 's' : ''}`}>
          <Button
            variant="contained"
            size="small"
            startIcon={
              bulkLoading === 'assign' ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Assignment />
              )
            }
            onClick={() => handleBulkAction('assign', onBulkAssign)}
            disabled={loading || bulkLoading || disabled}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: 'inherit',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.25)',
              },
              '&:disabled': {
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.5)',
              }
            }}
          >
            {bulkLoading === 'assign' ? 'Assigning...' : 'Bulk Assign'}
          </Button>
        </Tooltip>

        

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 180,
            }
          }}
        >
          {onBulkExport && (
            <MenuItem
              onClick={() => handleBulkAction('export', onBulkExport)}
              disabled={bulkLoading}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {bulkLoading === 'export' ? (
                  <CircularProgress size={16} />
                ) : (
                  <Check fontSize="small" />
                )}
                Export Selected
              </Box>
            </MenuItem>
          )}
          
          <Divider />
          
          {(isCLevel || isSalesRep) && onBulkDeactivate && (
            <MenuItem
              onClick={() => handleBulkAction('deactivate', onBulkDeactivate)}
              disabled={bulkLoading}
              sx={{ color: 'error.main' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {bulkLoading === 'deactivate' ? (
                  <CircularProgress size={16} color="error" />
                ) : (
                  <Delete fontSize="small" />
                )}
                Deactivate Selected
              </Box>
            </MenuItem>
          )}
        </Menu>

        {/* Clear selection */}
        <Tooltip title="Clear selection">
          <Button
            variant="text"
            size="small"
            startIcon={<Cancel />}
            onClick={onClearSelection}
            disabled={loading || bulkLoading}
            sx={{
              color: 'inherit',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.15)',
              }
            }}
          >
            Clear
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default BulkActionsToolbar;