// src/components/DetailsActions.jsx
import React from "react";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import {
  ArrowBack,
  Edit,
  Save,
  Close,
  Delete,
  Note,
  AttachFile,
  PersonAdd,
  Business,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { ROUTE_ACCESS } from "../../utils/auth/routesAccess";
import { useAuth } from "../../hooks/auth/useAuth";

export default function DetailsActions({
  isEditing = false,
  readOnly = false,
  entityType = "entity",
  onBack,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onAddNote,
  onAddAttachment,
  onAssignUser,
  onClaimAccount,
   customActions = [],
  compact = false, // Optional prop for even more compact view
}) {
  const theme = useTheme();
  const { roles = [] } = useAuth() || {};
  const isDark = theme.palette.mode === 'dark';

  const hasAccess = (accessKey) => {
    if (!accessKey || !ROUTE_ACCESS[accessKey]) return true;
    return ROUTE_ACCESS[accessKey].some((role) => roles.includes(role));
  };

  // Theme-aware color palette
  const colors = {
    primary: {
      main: isDark ? '#3b82f6' : '#2563eb',
      hover: isDark ? '#2563eb' : '#1d4ed8',
      bg: isDark ? 'rgba(59, 130, 246, 0.1)' : '#dbeafe',
    },
    success: {
      main: isDark ? '#10b981' : '#059669',
      hover: isDark ? '#059669' : '#047857',
      bg: isDark ? 'rgba(16, 185, 129, 0.1)' : '#d1fae5',
    },
    warning: {
      main: isDark ? '#f59e0b' : '#f59e0b',
      hover: isDark ? '#d97706' : '#d97706',
      bg: isDark ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7',
    },
    purple: {
      main: isDark ? '#a78bfa' : '#7c3aed',
      hover: isDark ? '#8b5cf6' : '#6d28d9',
      bg: isDark ? 'rgba(167, 139, 250, 0.1)' : '#f3e8ff',
    },
    error: {
      main: '#ef4444',
      hover: '#dc2626',
      bg: isDark ? 'rgba(239, 68, 68, 0.1)' : '#ffebee',
    },
    neutral: {
      main: theme.palette.text.secondary,
      hover: theme.palette.text.primary,
      bg: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5',
      border: theme.palette.divider,
    }
  };

  const buttonStyle = {
    minWidth: compact ? 'auto' : '100px',
    textTransform: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    px: compact ? 1.5 : 2,
    py: 0.75,
  };

  if (compact) {
    // Compact icon-only view
    return (
      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
        {!isEditing ? (
          <>
            {onBack && (
              <Tooltip title="Back">
                <IconButton onClick={onBack} size="small" sx={{ color: colors.neutral.main }}>
                  <ArrowBack fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {onEdit && !readOnly && hasAccess(`${entityType}Edit`) && (
              <Tooltip title="Edit">
                <IconButton 
                  onClick={onEdit} 
                  size="small"
                  sx={{ 
                    color: theme.palette.primary.main,
                    '&:hover': { bgcolor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.1)' }
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {onAssignUser && !readOnly && entityType === "account" && hasAccess("accountAssign") && (
              <Tooltip title="Assign User">
                <IconButton 
                  onClick={onAssignUser} 
                  size="small"
                  sx={{ 
                    color: colors.purple.main,
                    '&:hover': { bgcolor: colors.purple.bg }
                  }}
                >
                  <PersonAdd fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {onClaimAccount && entityType === "account" && hasAccess("accountClaim") && (
              <Tooltip title="Claim Account">
                <IconButton 
                  onClick={onClaimAccount} 
                  size="small"
                  sx={{ 
                    color: colors.warning.main,
                    '&:hover': { bgcolor: colors.warning.bg }
                  }}
                >
                  <Business fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {onAddNote && !readOnly && hasAccess("activitiesCreate") && (
              <Tooltip title="Add Note">
                <IconButton 
                  onClick={onAddNote} 
                  size="small"
                  sx={{ 
                    color: colors.primary.main,
                    '&:hover': { bgcolor: colors.primary.bg }
                  }}
                >
                  <Note fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {onAddAttachment && !readOnly && hasAccess("activitiesCreate") && (
              <Tooltip title="Add Attachment">
                <IconButton 
                  onClick={onAddAttachment} 
                  size="small"
                  sx={{ 
                    color: colors.success.main,
                    '&:hover': { bgcolor: colors.success.bg }
                  }}
                >
                  <AttachFile fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {onDelete && !readOnly && hasAccess(`${entityType}Edit`) && (
              <Tooltip title="Delete">
                <IconButton 
                  onClick={onDelete} 
                  size="small"
                  sx={{ 
                    color: colors.error.main,
                    '&:hover': { bgcolor: colors.error.bg }
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </>
        ) : (
          <>
            {onCancel && (
              <Tooltip title="Cancel">
                <IconButton onClick={onCancel} size="small" sx={{ color: colors.neutral.main }}>
                  <Close fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {onSave && hasAccess(`${entityType}Edit`) && (
              <Tooltip title="Save">
                <IconButton 
                  onClick={onSave} 
                  size="small"
                  sx={{ 
                    color: colors.success.main,
                    '&:hover': { bgcolor: colors.success.bg }
                  }}
                >
                  <Save fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {onAddNote && hasAccess("activitiesCreate") && (
              <Tooltip title="Add Note">
                <IconButton 
                  onClick={onAddNote} 
                  size="small"
                  sx={{ 
                    color: colors.primary.main,
                    '&:hover': { bgcolor: colors.primary.bg }
                  }}
                >
                  <Note fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {onAddAttachment && hasAccess("activitiesCreate") && (
              <Tooltip title="Add Attachment">
                <IconButton 
                  onClick={onAddAttachment} 
                  size="small"
                  sx={{ 
                    color: colors.success.main,
                    '&:hover': { bgcolor: colors.success.bg }
                  }}
                >
                  <AttachFile fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </>
        )}
      </Box>
    );
  }

  // Regular button view with better sizing
  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
      {!isEditing ? (
        <>
          {/* Back */}
          {onBack && (
            <Button
              variant="outlined"
              onClick={onBack}
              startIcon={<ArrowBack />}
              size="small"
              sx={{
                ...buttonStyle,
                borderColor: colors.neutral.border,
                color: colors.neutral.main,
                "&:hover": { 
                  borderColor: colors.neutral.hover,
                  backgroundColor: colors.neutral.bg,
                },
              }}
            >
              Back
            </Button>
          )}

          {/* Edit */}
          {onEdit && !readOnly && hasAccess(`${entityType}Edit`) && (
            <Button
              variant="contained"
              onClick={onEdit}
              startIcon={<Edit />}
              size="small"
              sx={{
                ...buttonStyle,
                backgroundColor: theme.palette.primary.main,
                "&:hover": { backgroundColor: theme.palette.primary.dark },
              }}
            >
              Edit
            </Button>
          )}

          {/* Assign User */}
          {onAssignUser &&
            !readOnly &&
            entityType === "account" &&
            hasAccess("accountAssign") && (
              <Button
                variant="outlined"
                onClick={onAssignUser}
                startIcon={<PersonAdd />}
                size="small"
                sx={{
                  ...buttonStyle,
                  borderColor: colors.purple.main,
                  color: colors.purple.main,
                  "&:hover": {
                    borderColor: colors.purple.hover,
                    backgroundColor: colors.purple.bg,
                  },
                }}
              >
                Assign
              </Button>
            )}

          {/* Claim Account */}
          {onClaimAccount &&
            entityType === "account" &&
            hasAccess("accountClaim") && (
              <Button
                variant="outlined"
                onClick={onClaimAccount}
                startIcon={<Business />}
                size="small"
                sx={{
                  ...buttonStyle,
                  borderColor: colors.warning.main,
                  color: colors.warning.main,
                  "&:hover": {
                    borderColor: colors.warning.hover,
                    backgroundColor: colors.warning.bg,
                  },
                }}
              >
                Claim
              </Button>
            )}
            {/* Custom Actions */}
            {customActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outlined"}
                onClick={action.onClick}
                startIcon={action.icon}
                size="small"
                sx={{
                  ...buttonStyle,
                  borderColor: action.color === 'primary' ? colors.primary.main : colors.neutral.border,
                  color: action.color === 'primary' ? colors.primary.main : colors.neutral.main,
                  "&:hover": {
                    borderColor: action.color === 'primary' ? colors.primary.hover : colors.neutral.hover,
                    backgroundColor: action.color === 'primary' ? colors.primary.bg : colors.neutral.bg,
                  },
                }}
              >
                {action.label}
              </Button>
            ))}

          {/* Add Note */}
          {onAddNote && !readOnly && hasAccess("activitiesCreate") && (
            <Button
              variant="outlined"
              onClick={onAddNote}
              startIcon={<Note />}
              size="small"
              sx={{
                ...buttonStyle,
                borderColor: colors.primary.main,
                color: colors.primary.main,
                "&:hover": {
                  borderColor: colors.primary.hover,
                  backgroundColor: colors.primary.bg,
                },
              }}
            >
              Note
            </Button>
          )}

          {/* Add Attachment */}
          {onAddAttachment && !readOnly && hasAccess("activitiesCreate") && (
            <Button
              variant="outlined"
              onClick={onAddAttachment}
              startIcon={<AttachFile />}
              size="small"
              sx={{
                ...buttonStyle,
                borderColor: colors.success.main,
                color: colors.success.main,
                "&:hover": {
                  borderColor: colors.success.hover,
                  backgroundColor: colors.success.bg,
                },
              }}
            >
              Attach
            </Button>
          )}

          {/* Delete */}
          {onDelete && !readOnly && hasAccess(`${entityType}Edit`) && (
            <Button
              variant="outlined"
              onClick={onDelete}
              startIcon={<Delete />}
              size="small"
              sx={{
                ...buttonStyle,
                borderColor: colors.error.main,
                color: colors.error.main,
                "&:hover": { 
                  borderColor: colors.error.hover,
                  backgroundColor: colors.error.bg 
                },
              }}
            >
              Delete
            </Button>
          )}
        </>
      ) : (
        <>
          {/* Cancel */}
          {onCancel && (
            <Button
              variant="outlined"
              onClick={onCancel}
              startIcon={<Close />}
              size="small"
              sx={{
                ...buttonStyle,
                borderColor: colors.neutral.border,
                color: colors.neutral.main,
                "&:hover": {
                  borderColor: colors.neutral.hover,
                  backgroundColor: colors.neutral.bg,
                }
              }}
            >
              Cancel
            </Button>
          )}

          {/* Save */}
          {onSave && hasAccess(`${entityType}Edit`) && (
            <Button
              variant="contained"
              onClick={onSave}
              startIcon={<Save />}
              size="small"
              sx={{
                ...buttonStyle,
                backgroundColor: colors.success.main,
                "&:hover": { backgroundColor: colors.success.hover },
              }}
            >
              Save
            </Button>
          )}

          {/* Note & Attachment in Edit Mode */}
          {onAddNote && hasAccess("activitiesCreate") && (
            <Button
              variant="outlined"
              onClick={onAddNote}
              startIcon={<Note />}
              size="small"
              sx={{
                ...buttonStyle,
                borderColor: colors.primary.main,
                color: colors.primary.main,
                "&:hover": {
                  borderColor: colors.primary.hover,
                  backgroundColor: colors.primary.bg,
                },
              }}
            >
              Note
            </Button>
          )}

          {onAddAttachment && hasAccess("activitiesCreate") && (
            <Button
              variant="outlined"
              onClick={onAddAttachment}
              startIcon={<AttachFile />}
              size="small"
              sx={{
                ...buttonStyle,
                borderColor: colors.success.main,
                color: colors.success.main,
                "&:hover": {
                  borderColor: colors.success.hover,
                  backgroundColor: colors.success.bg,
                },
              }}
            >
              Attach
            </Button>
          )}
        </>
      )}
    </Box>
  );
}