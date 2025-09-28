//adds bulk actions like bulk assign and bulk claim
import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Assignment,
  PersonAdd,
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
  userRole = [],
  loading = false,
  disabled = false,
}) => {
  const [bulkLoading, setBulkLoading] = useState('');

  const handleBulkAction = async (action, handler) => {
    if (!handler || loading || disabled) return;
    
    setBulkLoading(action);
    try {
      await handler(selectedItems);
    } catch (error) {
      console.error(`Bulk ${action} failed:`, error);
    } finally {
      setBulkLoading('');
    }
  };

  // Don't render if no items selected
  if (selectedCount === 0) return null;

  // Debug logging
  console.log('=== BULK ACTIONS TOOLBAR DEBUG ===');
  console.log('selectedCount:', selectedCount);
  console.log('userRole:', userRole, 'type:', typeof userRole);
  console.log('selectedItems:', selectedItems);
  console.log('selectedItems ownerStatus details:', selectedItems.map(item => ({ 
    name: item.AccountName, 
    status: item.ownerStatus,
    statusType: typeof item.ownerStatus 
  })));

  // Handle both array and string userRole
  let roles = [];
  if (Array.isArray(userRole)) {
    roles = userRole;
  } else if (typeof userRole === 'string') {
    roles = [userRole];
  }
  
  const isSalesRep = roles.includes('Sales Representative');
  const isCLevel = roles.includes('C-level');
  
  console.log('roles array:', roles);
  console.log('isSalesRep:', isSalesRep);
  console.log('isCLevel:', isCLevel);
  
  // Determine which accounts can be claimed
  // Sales Rep can claim 'unowned' accounts
  // C-level can claim 'n/a' accounts (since they see all accounts as n/a)
  let claimableCount = 0;
  if (isSalesRep) {
    claimableCount = selectedItems.filter(item => item.ownerStatus === 'unowned').length;
  } else if (isCLevel) {
    claimableCount = selectedItems.filter(item => item.ownerStatus === 'n/a').length;
  }
  
  const canClaim = (isSalesRep || isCLevel) && claimableCount > 0;

  console.log('claimableCount:', claimableCount);
  console.log('canClaim:', canClaim);
  console.log('All unique ownerStatus values:', [...new Set(selectedItems.map(item => item.ownerStatus))]);
  console.log('=== END DEBUG ===');

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
        {/* Bulk Claim Button - Show when there are claimable accounts */}
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
              disabled={Boolean(loading || bulkLoading || disabled)} // Convert to boolean
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

        {/* Bulk Assign Button */}
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
            disabled={Boolean(loading || bulkLoading || disabled)} // Convert to boolean
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

        {/* Clear selection */}
        <Tooltip title="Clear selection">
          <Button
            variant="text"
            size="small"
            startIcon={<Cancel />}
            onClick={onClearSelection}
            disabled={Boolean(loading || bulkLoading)} // Convert to boolean
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