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
  CheckCircle,
  Cancel,
  Archive,
  Delete,
  Assignment,
  Schedule,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const ActivitiesBulkActionsToolbar = ({
  selectedCount = 0,
  selectedItems = [],
  onBulkMarkComplete,
  onBulkMarkIncomplete,
  onBulkAssign,
  onBulkArchive,
  onBulkDelete,
  onBulkUpdateDueDates,
  onClearSelection,
  userRole = [],
  loading = false,
  disabled = false,
}) => {
  const theme = useTheme();
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

  // Handle both array and string userRole
  let roles = [];
  if (Array.isArray(userRole)) {
    roles = userRole;
  } else if (typeof userRole === 'string') {
    roles = [userRole];
  }
  
  const isSalesRep = roles.includes('Sales Representative');
  const isCLevel = roles.includes('C-level');
  const isManager = roles.includes('Manager');
  
  // Analyze selected activities to determine available actions
  const incompleteCount = selectedItems.filter(item => !item.Completed).length;
  const completeCount = selectedItems.filter(item => item.Completed).length;
  const overdueCount = selectedItems.filter(item => {
    if (!item.DueToEnd) return false;
    const dueDate = new Date(item.DueToEnd);
    const today = new Date();
    return dueDate < today && !item.Completed;
  }).length;

  // Permission checks for different actions
  const canMarkComplete = incompleteCount > 0;
  const canMarkIncomplete = completeCount > 0;
  const canAssign = isCLevel || isManager;
  const canArchive = isCLevel || isManager;
  const canDelete = isCLevel;
  const canUpdateDueDates = isCLevel || isManager || isSalesRep;

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1200,
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
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
          {selectedCount} activit{selectedCount !== 1 ? 'ies' : 'y'} selected
        </Typography>
        
        {/* Status indicators */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {incompleteCount > 0 && (
            <Chip
              label={`${incompleteCount} incomplete`}
              size="small"
              sx={{ 
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.2)' 
                  : 'rgba(255,255,255,0.2)', 
                color: 'inherit' 
              }}
            />
          )}
          {completeCount > 0 && (
            <Chip
              label={`${completeCount} complete`}
              size="small"
              sx={{ 
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(76,175,80,0.3)'
                  : 'rgba(76,175,80,0.3)', 
                color: 'inherit' 
              }}
            />
          )}
          {overdueCount > 0 && (
            <Chip
              label={`${overdueCount} overdue`}
              size="small"
              sx={{ 
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(244,67,54,0.3)'
                  : 'rgba(244,67,54,0.3)', 
                color: 'inherit' 
              }}
            />
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Mark as Complete Button */}
        {canMarkComplete && (
          <Tooltip title={`Mark ${incompleteCount} incomplete activit${incompleteCount !== 1 ? 'ies' : 'y'} as complete`}>
            <Button
              variant="contained"
              size="small"
              startIcon={
                bulkLoading === 'complete' ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <CheckCircle />
                )
              }
              onClick={() => handleBulkAction('complete', onBulkMarkComplete)}
              disabled={Boolean(loading || bulkLoading || disabled)}
              sx={{
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(76,175,80,0.3)'
                  : 'rgba(76,175,80,0.2)',
                color: 'inherit',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(76,175,80,0.4)'
                    : 'rgba(76,175,80,0.3)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.5)',
                }
              }}
            >
              {bulkLoading === 'complete' ? 'Completing...' : `Complete ${incompleteCount}`}
            </Button>
          </Tooltip>
        )}

        {/* Mark as Incomplete Button */}
        {canMarkIncomplete && (
          <Tooltip title={`Mark ${completeCount} complete activit${completeCount !== 1 ? 'ies' : 'y'} as incomplete`}>
            <Button
              variant="contained"
              size="small"
              startIcon={
                bulkLoading === 'incomplete' ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Cancel />
                )
              }
              onClick={() => handleBulkAction('incomplete', onBulkMarkIncomplete)}
              disabled={Boolean(loading || bulkLoading || disabled)}
              sx={{
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(255,152,0,0.3)'
                  : 'rgba(255,152,0,0.2)',
                color: 'inherit',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(255,152,0,0.4)'
                    : 'rgba(255,152,0,0.3)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.5)',
                }
              }}
            >
              {bulkLoading === 'incomplete' ? 'Reverting...' : `Revert ${completeCount}`}
            </Button>
          </Tooltip>
        )}

        {/* Update Due Dates Button */}
        {canUpdateDueDates && (
          <Tooltip title={`Update due dates for ${selectedCount} selected activit${selectedCount !== 1 ? 'ies' : 'y'}`}>
            <Button
              variant="contained"
              size="small"
              startIcon={
                bulkLoading === 'due-dates' ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Schedule />
                )
              }
              onClick={() => handleBulkAction('due-dates', onBulkUpdateDueDates)}
              disabled={Boolean(loading || bulkLoading || disabled)}
              sx={{
                backgroundColor: theme.palette.mode === 'dark'
                  ? 'rgba(33,150,243,0.3)'
                  : 'rgba(33,150,243,0.2)',
                color: 'inherit',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(33,150,243,0.4)'
                    : 'rgba(33,150,243,0.3)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.5)',
                }
              }}
            >
              {bulkLoading === 'due-dates' ? 'Updating...' : 'Update Dates'}
            </Button>
          </Tooltip>
        )}

        {/* Clear selection */}
        <Tooltip title="Clear selection">
          <Button
            variant="text"
            size="small"
            startIcon={<Cancel />}
            onClick={onClearSelection}
            disabled={Boolean(loading || bulkLoading)}
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

export default ActivitiesBulkActionsToolbar;