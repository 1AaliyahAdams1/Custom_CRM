import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Toolbar,
  Snackbar,
  Avatar,
} from "@mui/material";
import {
  Info as InfoIcon,
  Edit as EditIcon,
  Note as NoteIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  LocalOffer as DiscountIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Schedule as ScheduleIcon,
  Percent as PercentIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Redeem as RedeemIcon,
  Today as TodayIcon,
} from "@mui/icons-material";

import { Add } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import TableView from '../../components/tableFormat/TableView';
import theme from "../../components/Theme";
import { formatters } from '../../utils/formatters';

const DiscountCodesPage = ({
  discountCodes = [],
  loading = false,
  error,
  setError,
  successMessage,
  setSuccessMessage,
  statusMessage,
  statusSeverity,
  setStatusMessage,
  selected = [],
  onSelectClick,
  onSelectAllClick,
  onDeactivate,
  onReactivate,
  onDelete,
  onBulkDeactivate,
  onEdit,
  onView,
  onCreate,
  onAddNote,
  onAddAttachment,
  onAssignUser,
  onApprove,
  onReject,
  onLock,
  onUnlock,
  onActivate,
  showStatus,
  // Popup props (for future use if needed)
  notesPopupOpen,
  setNotesPopupOpen,
  attachmentsPopupOpen,
  setAttachmentsPopupOpen,
  selectedDiscountCode,
  popupLoading,
  popupError,
  handleSaveNote,
  handleDeleteNote,
  handleEditNote,
  handleUploadAttachment,
  handleDeleteAttachment,
  handleDownloadAttachment,
}) => {
  
  const columns = [
    { 
      field: 'DiscountCode', 
      headerName: 'Discount Code', 
      type: 'clickable',
      defaultVisible: true,
      onClick: onView,
      clickableStyle: {
        fontWeight: 600,
        fontSize: '0.95rem'
      }
    },
    { 
      field: 'DiscountPercentage', 
      headerName: 'Discount %', 
      type: 'percentage', 
      defaultVisible: true 
    },
    { 
      field: 'CompanyName', 
      headerName: 'Company', 
      type: 'truncated', 
      maxWidth: 200, 
      defaultVisible: true 
    },
    {
      field: 'IsActive',
      headerName: 'Status',
      type: 'chip',
      chipLabels: { 
        true: 'Active', 
        false: 'Inactive',
        null: 'Inactive' 
      },
      chipColors: { 
        true: '#4caf50', 
        false: '#757575',
        null: '#757575' 
      },
      defaultVisible: true,
    },
    {
      field: 'IsExpired',
      headerName: 'Validity',
      type: 'chip',
      chipLabels: { 
        true: 'Expired', 
        false: 'Valid',
        null: 'Valid' 
      },
      chipColors: { 
        true: '#f44336', 
        false: '#4caf50',
        null: '#4caf50' 
      },
      defaultVisible: true,
    },
    { 
      field: 'ValidUntil', 
      headerName: 'Valid Until', 
      type: 'date', 
      defaultVisible: true 
    },
    {
      field: 'OneTime',
      headerName: 'Usage Type',
      type: 'chip',
      chipLabels: { 
        true: 'One-Time', 
        false: 'Multiple Use',
        null: 'Multiple Use' 
      },
      chipColors: { 
        true: '#ff9800', 
        false: '#2196f3',
        null: '#2196f3' 
      },
      defaultVisible: true,
    },
    {
      field: 'Redeemed',
      headerName: 'Redeemed',
      type: 'chip',
      chipLabels: { 
        true: 'Redeemed', 
        false: 'Not Redeemed',
        null: 'Not Redeemed' 
      },
      chipColors: { 
        true: '#9c27b0', 
        false: '#757575',
        null: '#757575' 
      },
      defaultVisible: true,
    },
    { 
      field: 'MinEvents', 
      headerName: 'Min Events', 
      type: 'number', 
      defaultVisible: false 
    },
    { 
      field: 'MaxEvents', 
      headerName: 'Max Events', 
      type: 'number', 
      defaultVisible: false 
    },
    { 
      field: 'MinCommitted', 
      headerName: 'Min Committed', 
      type: 'currency', 
      defaultVisible: false 
    },
    {
      field: 'Locked',
      headerName: 'Lock Status',
      type: 'chip',
      chipLabels: { 
        true: 'Locked', 
        false: 'Unlocked',
        null: 'Unlocked' 
      },
      chipColors: { 
        true: '#f44336', 
        false: '#4caf50',
        null: '#4caf50' 
      },
      defaultVisible: false,
    },
    {
      field: 'RequiresApproval',
      headerName: 'Approval Required',
      type: 'chip',
      chipLabels: { 
        true: 'Required', 
        false: 'Not Required',
        null: 'Not Required' 
      },
      chipColors: { 
        true: '#ff9800', 
        false: '#757575',
        null: '#757575' 
      },
      defaultVisible: false,
    },
    { 
      field: 'CreatedByUserName', 
      headerName: 'Created By', 
      type: 'tooltip', 
      defaultVisible: false 
    },
    { 
      field: 'LastEditedByUserName', 
      headerName: 'Last Edited By', 
      type: 'tooltip', 
      defaultVisible: false 
    },
    { 
      field: 'CreateDate', 
      headerName: 'Create Date', 
      type: 'date', 
      defaultVisible: false 
    },
    { 
      field: 'LastEditedDT', 
      headerName: 'Last Edited', 
      type: 'dateTime', 
      defaultVisible: false 
    },
    { 
      field: 'CreatedDate', 
      headerName: 'Created', 
      type: 'dateTime', 
      defaultVisible: false 
    },
    { 
      field: 'UpdatedDate', 
      headerName: 'Updated', 
      type: 'dateTime', 
      defaultVisible: false 
    },
    { 
      field: 'DiscountCodeID', 
      headerName: 'Code ID', 
      defaultVisible: false 
    },
    { 
      field: 'CompanyID', 
      headerName: 'Company ID', 
      defaultVisible: false 
    },
    { 
      field: 'CreatedBy', 
      headerName: 'Created By ID', 
      defaultVisible: false 
    },
    { 
      field: 'LastEditedByUserID', 
      headerName: 'Last Edited By ID', 
      defaultVisible: false 
    }
  ];

  // Enhanced menu items for discount codes
  const getMenuItems = (discountCode) => {
    const baseItems = [
      {
        label: 'View Details',
        icon: <InfoIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onView && onView(discountCode),
        show: !!onView,
      },
      {
        label: 'Edit',
        icon: <EditIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onEdit && onEdit(discountCode),
        show: !!onEdit && !discountCode.Locked,
      },
      {
        label: 'Add Notes',
        icon: <NoteIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onAddNote && onAddNote(discountCode),
        show: !!onAddNote,
      },
      {
        label: 'Add Attachments',
        icon: <AttachFileIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onAddAttachment && onAddAttachment(discountCode),
        show: !!onAddAttachment,
      },
    ];

    // Add lock/unlock options
    if (discountCode.Locked && onUnlock) {
      baseItems.push({
        label: 'Unlock',
        icon: <UnlockIcon sx={{ mr: 1, color: '#4caf50' }} />,
        onClick: () => onUnlock(discountCode.DiscountCodeID),
        show: true,
      });
    } else if (!discountCode.Locked && onLock) {
      baseItems.push({
        label: 'Lock',
        icon: <LockIcon sx={{ mr: 1, color: '#f44336' }} />,
        onClick: () => onLock(discountCode.DiscountCodeID),
        show: true,
      });
    }

    // Add activate/deactivate options
    if (!discountCode.IsActive && onActivate) {
      baseItems.push({
        label: 'Activate',
        icon: <VisibilityIcon sx={{ mr: 1, color: '#4caf50' }} />,
        onClick: () => onActivate(discountCode.DiscountCodeID),
        show: true,
      });
    } else if (discountCode.IsActive && onDeactivate) {
      baseItems.push({
        label: 'Deactivate',
        icon: <VisibilityOffIcon sx={{ mr: 1, color: '#ff9800' }} />,
        onClick: () => onDeactivate(discountCode.DiscountCodeID),
        show: true,
      });
    }

    // Add approval options for codes requiring approval
    if (discountCode.RequiresApproval && onApprove) {
      baseItems.push({
        label: 'Approve',
        icon: <CheckCircleIcon sx={{ mr: 1, color: '#4caf50' }} />,
        onClick: () => onApprove(discountCode.DiscountCodeID),
        show: true,
      });
    }

    if (discountCode.RequiresApproval && onReject) {
      baseItems.push({
        label: 'Reject',
        icon: <CancelIcon sx={{ mr: 1, color: '#f44336' }} />,
        onClick: () => onReject(discountCode.DiscountCodeID),
        show: true,
      });
    }

    // Add delete option
    baseItems.push({
      label: 'Delete',
      icon: <DeleteIcon sx={{ mr: 1, color: '#f44336' }} />,
      onClick: () => onDelete && onDelete(discountCode.DiscountCodeID),
      show: !!onDelete && !discountCode.Locked,
    });

    return baseItems;
  };

  // Custom formatters for discount code-specific fields
  const discountCodeFormatters = {
    ...formatters,
    DiscountCode: (value, row) => {
      if (!value) return 'N/A';
      return (
        <Box
          component="span"
          onClick={(e) => {
            e.stopPropagation();
            if (onView) {
              onView(row);
            }
          }}
          sx={{
            color: 'primary.main',
            cursor: 'pointer',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            fontFamily: 'monospace',
            backgroundColor: '#f5f5f5',
            padding: '4px 8px',
            borderRadius: '4px',
            '&:hover': {
              textDecoration: 'underline',
              backgroundColor: '#e0e0e0',
            },
          }}
        >
          {value}
        </Box>
      );
    },
    DiscountPercentage: (value) => {
      if (!value && value !== 0) return 'N/A';
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PercentIcon sx={{ fontSize: '1rem', color: '#4caf50' }} />
          <Chip
            label={`${value}%`}
            size="small"
            sx={{
              backgroundColor: '#e8f5e8',
              color: '#2e7d32',
              fontWeight: 600,
            }}
          />
        </Box>
      );
    },
    CompanyName: (value) => {
      if (!value) return 'N/A';
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessIcon sx={{ fontSize: '1rem', color: '#757575' }} />
          <span title={value}>
            {value.length > 25 ? `${value.substring(0, 25)}...` : value}
          </span>
        </Box>
      );
    },
    ValidUntil: (value) => {
      if (!value) return 'No Expiry';
      try {
        const date = new Date(value);
        const isExpired = date < new Date();
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TodayIcon sx={{ 
              fontSize: '1rem', 
              color: isExpired ? '#f44336' : '#4caf50' 
            }} />
            <span style={{ color: isExpired ? '#f44336' : '#000' }}>
              {date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </Box>
        );
      } catch {
        return value;
      }
    },
    IsActive: (value) => {
      const isActive = value === true || value === 'true';
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isActive ? (
            <VisibilityIcon sx={{ fontSize: '1rem', color: '#4caf50' }} />
          ) : (
            <VisibilityOffIcon sx={{ fontSize: '1rem', color: '#757575' }} />
          )}
          <Chip
            label={isActive ? 'Active' : 'Inactive'}
            size="small"
            sx={{
              backgroundColor: isActive ? '#4caf50' : '#757575',
              color: '#fff',
              fontWeight: 500,
            }}
          />
        </Box>
      );
    },
    IsExpired: (value) => {
      const isExpired = value === true || value === 'true';
      return (
        <Chip
          label={isExpired ? 'Expired' : 'Valid'}
          size="small"
          sx={{
            backgroundColor: isExpired ? '#f44336' : '#4caf50',
            color: '#fff',
            fontWeight: 500,
          }}
        />
      );
    },
    OneTime: (value) => {
      const isOneTime = value === true || value === 'true';
      return (
        <Chip
          label={isOneTime ? 'One-Time' : 'Multiple Use'}
          size="small"
          sx={{
            backgroundColor: isOneTime ? '#ff9800' : '#2196f3',
            color: '#fff',
            fontWeight: 500,
          }}
        />
      );
    },
    Redeemed: (value) => {
      const isRedeemed = value === true || value === 'true';
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isRedeemed && <RedeemIcon sx={{ fontSize: '1rem', color: '#9c27b0' }} />}
          <Chip
            label={isRedeemed ? 'Redeemed' : 'Not Redeemed'}
            size="small"
            sx={{
              backgroundColor: isRedeemed ? '#9c27b0' : '#757575',
              color: '#fff',
              fontWeight: 500,
            }}
          />
        </Box>
      );
    },
    Locked: (value) => {
      const isLocked = value === true || value === 'true';
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isLocked ? (
            <LockIcon sx={{ fontSize: '1rem', color: '#f44336' }} />
          ) : (
            <UnlockIcon sx={{ fontSize: '1rem', color: '#4caf50' }} />
          )}
          <Chip
            label={isLocked ? 'Locked' : 'Unlocked'}
            size="small"
            sx={{
              backgroundColor: isLocked ? '#f44336' : '#4caf50',
              color: '#fff',
              fontWeight: 500,
            }}
          />
        </Box>
      );
    },
    RequiresApproval: (value) => {
      const requiresApproval = value === true || value === 'true';
      return (
        <Chip
          label={requiresApproval ? 'Required' : 'Not Required'}
          size="small"
          sx={{
            backgroundColor: requiresApproval ? '#ff9800' : '#757575',
            color: '#fff',
            fontWeight: 500,
          }}
        />
      );
    },
    MinEvents: (value) => {
      if (!value && value !== 0) return 'N/A';
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EventIcon sx={{ fontSize: '1rem', color: '#757575' }} />
          <span>{value} events</span>
        </Box>
      );
    },
    MaxEvents: (value) => {
      if (!value && value !== 0) return 'N/A';
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EventIcon sx={{ fontSize: '1rem', color: '#757575' }} />
          <span>{value} events</span>
        </Box>
      );
    },
    MinCommitted: (value) => {
      if (!value && value !== 0) return 'N/A';
      return `$${parseFloat(value).toLocaleString()}`;
    },
    CreatedByUserName: (value) => {
      if (!value) return 'N/A';
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon sx={{ fontSize: '1rem', color: '#757575' }} />
          <span>{value}</span>
        </Box>
      );
    },
    LastEditedByUserName: (value) => {
      if (!value) return 'N/A';
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon sx={{ fontSize: '1rem', color: '#757575' }} />
          <span>{value}</span>
        </Box>
      );
    },
    CreateDate: (value) => {
      if (!value) return 'N/A';
      try {
        const date = new Date(value);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch {
        return value;
      }
    },
    LastEditedDT: (value) => {
      if (!value) return 'N/A';
      try {
        const date = new Date(value);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return value;
      }
    },
    CreatedDate: (value) => {
      if (!value) return 'N/A';
      try {
        const date = new Date(value);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return value;
      }
    },
    UpdatedDate: (value) => {
      if (!value) return 'N/A';
      try {
        const date = new Date(value);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return value;
      }
    }
  };

  // Tooltip messages for discount codes
  const tooltips = {
    search: "Search discount codes by code, company, percentage, or any visible field",
    filter: "Show advanced filtering options to narrow down codes by status, expiry, company, or usage type",
    columns: "Customize which discount code information columns are visible",
    actions: "Available actions for this discount code",
    actionMenu: {
      view: "View detailed discount code information including usage restrictions and history",
      edit: "Edit discount code details, percentage, and validity settings",
      addNote: "Add internal notes about this discount code or usage instructions",
      addAttachment: "Attach documents or files related to this discount code",
      lock: "Lock this discount code to prevent further modifications",
      unlock: "Unlock this discount code to allow modifications",
      activate: "Activate this discount code for use",
      deactivate: "Deactivate this discount code temporarily",
      approve: "Approve this discount code for use",
      reject: "Reject this discount code",
      delete: "Delete this discount code from the system"
    }
  };
  const navigate = useNavigate();
  const handleCreateDiscountCode = () => {
  navigate('/discount-codes/create');
};

  // Calculate some stats for display
  const activeCodesCount = discountCodes.filter(code => code.IsActive === true || code.IsActive === 'true').length;
  const expiredCodesCount = discountCodes.filter(code => code.IsExpired === true || code.IsExpired === 'true').length;
  const redeemedCodesCount = discountCodes.filter(code => code.Redeemed === true || code.Redeemed === 'true').length;
  const lockedCodesCount = discountCodes.filter(code => code.Locked === true || code.Locked === 'true').length;
  const oneTimeCodesCount = discountCodes.filter(code => code.OneTime === true || code.OneTime === 'true').length;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            onClose={() => setError && setError('')}
          >
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert 
            severity="success" 
            sx={{ mb: 2 }}
            onClose={() => setSuccessMessage && setSuccessMessage('')}
          >
            {successMessage}
          </Alert>
        )}

        <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
          <Toolbar sx={{ 
            backgroundColor: '#fff', 
            borderBottom: '1px solid #e5e5e5', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: 2, 
            py: 2 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              {/* <DiscountIcon sx={{ color: 'primary.main', fontSize: '1.5rem' }} /> */}
              <Typography variant="h6" component="div" sx={{ color: '#050505', fontWeight: 600 }}>
                Discount Codes
              </Typography>
              {discountCodes.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`${discountCodes.length} total codes`} 
                    size="small" 
                    sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }} 
                  />
                  {activeCodesCount > 0 && (
                    <Chip 
                      label={`${activeCodesCount} active`} 
                      size="small" 
                      icon={<VisibilityIcon sx={{ fontSize: '0.75rem !important' }} />}
                      sx={{ backgroundColor: '#e8f5e8', color: '#2e7d32' }} 
                    />
                  )}
                  {expiredCodesCount > 0 && (
                    <Chip 
                      label={`${expiredCodesCount} expired`} 
                      size="small" 
                      icon={<ScheduleIcon sx={{ fontSize: '0.75rem !important' }} />}
                      sx={{ backgroundColor: '#ffebee', color: '#c62828' }} 
                    />
                  )}
                  {redeemedCodesCount > 0 && (
                    <Chip 
                      label={`${redeemedCodesCount} redeemed`} 
                      size="small" 
                      icon={<RedeemIcon sx={{ fontSize: '0.75rem !important' }} />}
                      sx={{ backgroundColor: '#f3e5f5', color: '#7b1fa2' }} 
                    />
                  )}
                  {oneTimeCodesCount > 0 && (
                    <Chip 
                      label={`${oneTimeCodesCount} one-time`} 
                      size="small" 
                      sx={{ backgroundColor: '#fff3e0', color: '#f57c00' }} 
                    />
                  )}
                </Box>
              )}
              {selected.length > 0 && (
                <Chip 
                  label={`${selected.length} selected`} 
                  size="small" 
                  sx={{ backgroundColor: '#e0e0e0', color: '#050505' }} 
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateDiscountCode}
                sx={{
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  }
                }}
              >
                Create Code
              </Button>
              {selected.length > 0 && onBulkDeactivate && (
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={onBulkDeactivate}
                >
                  Bulk Actions ({selected.length})
                </Button>
              )}
            </Box>
          </Toolbar>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={8}>
              <CircularProgress size={40} />
              <Typography variant="body1" sx={{ ml: 2, color: '#666' }}>
                Loading discount codes...
              </Typography>
            </Box>
          ) : discountCodes.length === 0 ? (
            <Box display="flex" flex-direction="column" justifyContent="center" alignItems="center" p={8}>
              <DiscountIcon sx={{ fontSize: '4rem', color: '#ccc', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                No Discount Codes Found
              </Typography>
              {/* <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', mb: 3 }}>
                Get started by creating your first discount code for customers.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onCreate}
              >
                Create First Code
              </Button> */}
            </Box>
          ) : (
            <TableView
              data={discountCodes}
              columns={columns}
              idField="DiscountCodeID"
              selected={selected}
              onSelectClick={onSelectClick}
              onSelectAllClick={onSelectAllClick}
              showSelection={true}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddNote={onAddNote}
              onAddAttachment={onAddAttachment}
              onAssignUser={onAssignUser}
              formatters={discountCodeFormatters}
              tooltips={tooltips}
              entityType="discount codes"
              menuItems={getMenuItems}
            />
          )}

          <Box sx={{ 
            p: 2, 
            borderTop: '1px solid #e5e5e5', 
            backgroundColor: '#fafafa', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Typography variant="body2" sx={{ color: '#666666' }}>
              {discountCodes.length === 0 ? 'No discount codes' : 
               discountCodes.length === 1 ? 'Showing 1 discount code' : 
               `Showing ${discountCodes.length} discount codes`}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              {selected.length > 0 && (
                <Typography variant="body2" sx={{ color: '#050505', fontWeight: 500 }}>
                  {selected.length} selected
                </Typography>
              )}
              {expiredCodesCount > 0 && (
                <Typography variant="body2" sx={{ color: '#666666' }}>
                  {expiredCodesCount} expired codes
                </Typography>
              )}
              {lockedCodesCount > 0 && (
                <Typography variant="body2" sx={{ color: '#666666' }}>
                  {lockedCodesCount} locked codes
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Status Snackbar */}
        <Snackbar
          open={!!statusMessage}
          autoHideDuration={4000}
          onClose={() => setStatusMessage && setStatusMessage('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setStatusMessage && setStatusMessage('')} 
            severity={statusSeverity || 'info'} 
            sx={{ width: '100%' }}
          >
            {statusMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default DiscountCodesPage;