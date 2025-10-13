import React from 'react';
import {
  Toolbar,
  Typography,
  Button,
  Box,
  Tooltip,
  IconButton,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Close,
  PersonAdd,
  Assignment,
  Delete,
  FileDownload,
  Gavel,
  Timeline,
} from '@mui/icons-material';

const BulkActionsToolbar = ({
  selectedCount = 0,
  selectedItems = [],
  entityType = 'item',
  onBulkAssign,
  onBulkClaim,
  onBulkClaimAndSequence,
  onBulkDeactivate,
  onBulkExport,
  onClearSelection,
  userRole = [],
  loading = false,
  disabled = false,
}) => {
  const roles = Array.isArray(userRole) ? userRole : [userRole];

  // Check user permissions
  const hasClaimPermission = roles.includes('Sales Representative') || 
                             roles.includes('Sales Manager') || 
                             roles.includes('C-Level') ||
                             roles.includes('C-level');
  
  const hasAssignPermission = roles.includes('C-Level') || 
                              roles.includes('C-level') ||
                              roles.includes('Sales Manager');
  
  const hasDeactivatePermission = roles.includes('C-Level') || 
                                  roles.includes('C-level') ||
                                  roles.includes('Sales Manager');

  // Count claimable accounts
  const claimableCount = selectedItems.filter(item => 
    item.ownerStatus === 'unowned' || item.ownerStatus === 'n/a'
  ).length;

  if (selectedCount === 0) return null;

  return (
    <Toolbar
      sx={{
        pl: 2,
        pr: 1,
        backgroundColor: '#079141ff',
        color: '#ffffff',
        minHeight: '64px !important',
        borderRadius: '8px 8px 0 0',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 2 }}>
        <Typography
          sx={{ flex: '0 0 auto' }}
          color="inherit"
          variant="subtitle1"
          component="div"
          fontWeight={600}
        >
          {selectedCount} {entityType}{selectedCount !== 1 ? 's' : ''} selected
        </Typography>

        {hasClaimPermission && claimableCount > 0 && claimableCount !== selectedCount && (
          <Chip
            label={`${claimableCount} claimable`}
            size="small"
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              color: 'inherit',
              fontWeight: 500
            }}
          />
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {/* Bulk Claim Button */}
          {hasClaimPermission && onBulkClaim && claimableCount > 0 && (
            <Tooltip title={`Claim ${claimableCount} unowned ${entityType}${claimableCount !== 1 ? 's' : ''}`} arrow>
              <span>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <Gavel />}
                  onClick={onBulkClaim}
                  disabled={disabled || loading}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.5)',
                    },
                  }}
                >
                  Claim 
                </Button>
              </span>
            </Tooltip>
          )}

           {/*Bulk Claim & Add Sequence Button */}
          {hasClaimPermission && onBulkClaimAndSequence && claimableCount > 0 && (
            <Tooltip 
              title={`Claim ${claimableCount} ${entityType}${claimableCount !== 1 ? 's' : ''} and assign sequence with activities`} 
              arrow
            >
              <span>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <Timeline />}
                  onClick={onBulkClaimAndSequence}
                  disabled={disabled || loading}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.5)',
                    },
                  }}
                >
                  Claim & Assign Sequence
                </Button>
              </span>
            </Tooltip>
          )}

          {/* Bulk Assign Button */}
          {hasAssignPermission && onBulkAssign && (
            <Tooltip title={`Assign ${selectedCount} selected ${entityType}${selectedCount !== 1 ? 's' : ''} to a user`} arrow>
              <span>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <PersonAdd />}
                  onClick={onBulkAssign}
                  disabled={disabled || loading}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.5)',
                    },
                  }}
                >
                  Assign
                </Button>
              </span>
            </Tooltip>
          )}

          {/* Bulk Deactivate Button */}
          {hasDeactivatePermission && onBulkDeactivate && (
            <Tooltip title={`Deactivate ${selectedCount} selected ${entityType}${selectedCount !== 1 ? 's' : ''}`} arrow>
              <span>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <Delete />}
                  onClick={onBulkDeactivate}
                  disabled={disabled || loading}
                  sx={{
                    backgroundColor: 'rgba(211, 47, 47, 0.9)',
                    color: '#ffffff',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(198, 40, 40, 0.9)',
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.5)',
                    },
                  }}
                >
                  Deactivate
                </Button>
              </span>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Clear Selection Button */}
      {onClearSelection && (
        <Tooltip title="Clear selection" arrow>
          <IconButton
            onClick={onClearSelection}
            disabled={disabled || loading}
            sx={{
              color: '#ffffff',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)',
              },
              '&:disabled': {
                color: 'rgba(255,255,255,0.3)',
              }
            }}
          >
            <Close />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
};

export default BulkActionsToolbar;