import React, { useState } from "react";
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
  Person as PersonIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  PendingActions as PendingIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LinkedIn as LinkedInIcon,
} from "@mui/icons-material";

import { Add } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import TableView from '../../components/tableFormat/TableView';
import theme from "../../components/Theme";
import { formatters } from '../../utils/formatters';

const OwnersPage = ({
  owners = [],
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
  showStatus,
  // Popup props (for future use if needed)
  notesPopupOpen,
  setNotesPopupOpen,
  attachmentsPopupOpen,
  setAttachmentsPopupOpen,
  selectedOwner,
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
      field: 'UserName', 
      headerName: 'Username', 
      type: 'clickable',
      defaultVisible: true,
      onClick: onView,
      clickableStyle: {
        fontWeight: 600,
        fontSize: '0.95rem'
      }
    },
    { 
      field: 'PreferredName', 
      headerName: 'Name', 
      type: 'tooltip', 
      defaultVisible: true 
    },
    { 
      field: 'Email', 
      headerName: 'Email', 
      type: 'tooltip', 
      defaultVisible: true 
    },
    {
      field: 'EmailConfirmed',
      headerName: 'Email Status',
      type: 'chip',
      chipLabels: { true: 'Confirmed', false: 'Unconfirmed' },
      chipColors: { true: '#4caf50', false: '#ff9800' },
      defaultVisible: true,
    },
    { 
      field: 'CompanyName', 
      headerName: 'Company', 
      type: 'truncated', 
      maxWidth: 200, 
      defaultVisible: true 
    },
    { 
      field: 'PositionInCompany', 
      headerName: 'Position', 
      type: 'tooltip', 
      defaultVisible: true 
    },
    {
      field: 'Approved',
      headerName: 'Status',
      type: 'chip',
      chipLabels: { 
        true: 'Approved', 
        false: 'Pending',
        null: 'Pending' 
      },
      chipColors: { 
        true: '#4caf50', 
        false: '#ff9800',
        null: '#ff9800' 
      },
      defaultVisible: true,
    },
    { 
      field: 'PhoneNumber', 
      headerName: 'Phone', 
      type: 'tooltip', 
      defaultVisible: false 
    },
    { 
      field: 'LinkedinProfile', 
      headerName: 'LinkedIn', 
      type: 'link', 
      defaultVisible: false 
    },
    { 
      field: 'RequestDate', 
      headerName: 'Request Date', 
      type: 'date', 
      defaultVisible: false 
    },
    { 
      field: 'ApprovedDate', 
      headerName: 'Approved Date', 
      type: 'date', 
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
      field: 'OwnerID', 
      headerName: 'Owner ID', 
      defaultVisible: false 
    },
    { 
      field: 'UserID', 
      headerName: 'User ID', 
      defaultVisible: false 
    },
    { 
      field: 'CompanyID', 
      headerName: 'Company ID', 
      defaultVisible: false 
    },
    { 
      field: 'PictureWithID', 
      headerName: 'Profile Picture', 
      type: 'image', 
      defaultVisible: false 
    },
    { 
      field: 'PictureOfID', 
      headerName: 'ID Document', 
      type: 'image', 
      defaultVisible: false 
    }
  ];

  // Enhanced menu items for owners
  const getMenuItems = (owner) => {
    const baseItems = [
      {
        label: 'View Details',
        icon: <InfoIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onView && onView(owner),
        show: !!onView,
      },
      {
        label: 'Edit',
        icon: <EditIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onEdit && onEdit(owner),
        show: !!onEdit,
      },
      {
        label: 'Add Notes',
        icon: <NoteIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onAddNote && onAddNote(owner),
        show: !!onAddNote,
      },
      {
        label: 'Add Attachments',
        icon: <AttachFileIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onAddAttachment && onAddAttachment(owner),
        show: !!onAddAttachment,
      },
    ];

    // Add approval/rejection options for pending owners
    if (!owner.Approved && onApprove) {
      baseItems.push({
        label: 'Approve',
        icon: <CheckCircleIcon sx={{ mr: 1, color: '#4caf50' }} />,
        onClick: () => onApprove(owner.OwnerID),
        show: true,
      });
    }

    if (!owner.Approved && onReject) {
      baseItems.push({
        label: 'Reject',
        icon: <DeleteIcon sx={{ mr: 1, color: '#f44336' }} />,
        onClick: () => onReject(owner.OwnerID),
        show: true,
      });
    }

    // Add delete option
    baseItems.push({
      label: 'Delete',
      icon: <DeleteIcon sx={{ mr: 1, color: '#f44336' }} />,
      onClick: () => onDelete && onDelete(owner.OwnerID),
      show: !!onDelete,
    });

    return baseItems;
  };

  // Custom formatters for owner-specific fields
  const ownerFormatters = {
    ...formatters,
    UserName: (value, row) => {
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
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {value}
        </Box>
      );
    },
    Email: (value) => {
      if (!value) return 'N/A';
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailIcon sx={{ fontSize: '1rem', color: '#757575' }} />
          <span>{value}</span>
        </Box>
      );
    },
    PhoneNumber: (value) => {
      if (!value) return 'N/A';
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhoneIcon sx={{ fontSize: '1rem', color: '#757575' }} />
          <span>{value}</span>
        </Box>
      );
    },
    LinkedinProfile: (value) => {
      if (!value) return 'N/A';
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinkedInIcon sx={{ fontSize: '1rem', color: '#0077b5' }} />
          <a 
            href={value.startsWith('http') ? value : `https://${value}`} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#0077b5', textDecoration: 'none' }}
          >
            LinkedIn Profile
          </a>
        </Box>
      );
    },
    Approved: (value) => {
      const isApproved = value === true || value === 'true';
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isApproved ? (
            <CheckCircleIcon sx={{ fontSize: '1rem', color: '#4caf50' }} />
          ) : (
            <PendingIcon sx={{ fontSize: '1rem', color: '#ff9800' }} />
          )}
          <Chip
            label={isApproved ? 'Approved' : 'Pending'}
            size="small"
            sx={{
              backgroundColor: isApproved ? '#4caf50' : '#ff9800',
              color: '#fff',
              fontWeight: 500,
            }}
          />
        </Box>
      );
    },
    EmailConfirmed: (value) => {
      const isConfirmed = value === true || value === 'true';
      return (
        <Chip
          label={isConfirmed ? 'Confirmed' : 'Unconfirmed'}
          size="small"
          sx={{
            backgroundColor: isConfirmed ? '#4caf50' : '#ff9800',
            color: '#fff',
            fontWeight: 500,
          }}
        />
      );
    },
    RequestDate: (value) => {
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
    ApprovedDate: (value) => {
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
    },
    PictureWithID: (value) => {
      if (!value) return 'No Image';
      return (
        <Avatar
          src={value}
          alt="Profile Picture"
          variant="circular"
          sx={{ width: 40, height: 40 }}
        >
          <PersonIcon />
        </Avatar>
      );
    },
    PictureOfID: (value) => {
      if (!value) return 'No Document';
      return (
        <Avatar
          src={value}
          alt="ID Document"
          variant="rounded"
          sx={{ width: 40, height: 30 }}
        >
          ID
        </Avatar>
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
    }
  };

  // Tooltip messages for owners
  const tooltips = {
    search: "Search owners by username, name, email, company, position, or any visible field",
    filter: "Show advanced filtering options to narrow down owners by approval status, company, or email confirmation",
    columns: "Customize which owner information columns are visible",
    actions: "Available actions for this owner",
    actionMenu: {
      view: "View detailed owner information including company details and documents",
      edit: "Edit owner details, contact information, and company association",
      addNote: "Add internal notes about this owner or verification details",
      addAttachment: "Attach documents, verification files, or images related to this owner",
      approve: "Approve this owner's registration and grant access",
      reject: "Reject this owner's registration",
      delete: "Delete this owner from the system"
    }
  };

  // Calculate some stats for display
  const approvedOwnersCount = owners.filter(owner => owner.Approved === true || owner.Approved === 'true').length;
  const pendingOwnersCount = owners.filter(owner => !owner.Approved || owner.Approved === false).length;
  const emailConfirmedCount = owners.filter(owner => owner.EmailConfirmed === true || owner.EmailConfirmed === 'true').length;

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
              {/* <PersonIcon sx={{ color: 'primary.main', fontSize: '1.5rem' }} /> */}
              <Typography variant="h6" component="div" sx={{ color: '#050505', fontWeight: 600 }}>
                Owners
              </Typography>
              {owners.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`${owners.length} total owners`} 
                    size="small" 
                    sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }} 
                  />
                  {approvedOwnersCount > 0 && (
                    <Chip 
                      label={`${approvedOwnersCount} approved`} 
                      size="small" 
                      icon={<CheckCircleIcon sx={{ fontSize: '0.75rem !important' }} />}
                      sx={{ backgroundColor: '#e8f5e8', color: '#2e7d32' }} 
                    />
                  )}
                  {pendingOwnersCount > 0 && (
                    <Chip 
                      label={`${pendingOwnersCount} pending`} 
                      size="small" 
                      icon={<PendingIcon sx={{ fontSize: '0.75rem !important' }} />}
                      sx={{ backgroundColor: '#fff3e0', color: '#f57c00' }} 
                    />
                  )}
                  {emailConfirmedCount > 0 && (
                    <Chip 
                      label={`${emailConfirmedCount} email confirmed`} 
                      size="small" 
                      icon={<EmailIcon sx={{ fontSize: '0.75rem !important' }} />}
                      sx={{ backgroundColor: '#e8f5e8', color: '#2e7d32' }} 
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
                onClick={onCreate}
                sx={{
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  }
                }}
              >
                Add Owner
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
                Loading owners...
              </Typography>
            </Box>
          ) : owners.length === 0 ? (
            <Box display="flex" flex-direction="column" justifyContent="center" alignItems="center" p={8}>
              <PersonIcon sx={{ fontSize: '4rem', color: '#ccc', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                No Owners Found
              </Typography>
            </Box>
          ) : (
            <TableView
              data={owners}
              columns={columns}
              idField="OwnerID"
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
              formatters={ownerFormatters}
              tooltips={tooltips}
              entityType="owners"
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
              {owners.length === 0 ? 'No owners' : 
               owners.length === 1 ? 'Showing 1 owner' : 
               `Showing ${owners.length} owners`}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              {selected.length > 0 && (
                <Typography variant="body2" sx={{ color: '#050505', fontWeight: 500 }}>
                  {selected.length} selected
                </Typography>
              )}
              {pendingOwnersCount > 0 && (
                <Typography variant="body2" sx={{ color: '#666666' }}>
                  {pendingOwnersCount} pending approval
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

export default OwnersPage;