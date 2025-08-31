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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  IconButton,
} from "@mui/material";
import {
  Info as InfoIcon,
  Edit as EditIcon,
  Note as NoteIcon,
  AttachFile as AttachFileIcon,
  PowerOff as PowerOffIcon,
  Power as PowerIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

import { Add } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import TableView from '../../components/tableFormat/TableView';
import theme from "../../components/Theme";
import { formatters } from '../../utils/formatters';

const ActivityTypePage = ({
  activityTypes = [],
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
  showStatus,
  // Popup props
  notesPopupOpen,
  setNotesPopupOpen,
  attachmentsPopupOpen,
  setAttachmentsPopupOpen,
  selectedActivityType,
  popupLoading,
  popupError,
  handleSaveNote,
  handleDeleteNote,
  handleEditNote,
  handleUploadAttachment,
  handleDeleteAttachment,
  handleDownloadAttachment,
}) => {
  // Add Activity Type Dialog State
  const [addActivityTypeDialogOpen, setAddActivityTypeDialogOpen] = useState(false);
  const [newActivityType, setNewActivityType] = useState({
    TypeName: '',
    Description: '',
    IsActive: true
  });
  const [addActivityTypeLoading, setAddActivityTypeLoading] = useState(false);

  const columns = [
    { field: 'TypeName', headerName: 'Type Name', type: 'tooltip', defaultVisible: true },
    { field: 'Description', headerName: 'Description', type: 'tooltip', defaultVisible: true },
    { field: 'CreatedAt', headerName: 'Created', type: 'dateTime', defaultVisible: true },
    { field: 'UpdatedAt', headerName: 'Updated', type: 'dateTime', defaultVisible: false },
    {
      field: 'IsActive',
      headerName: 'Status',
      type: 'chip',
      chipLabels: { true: 'Active', false: 'Inactive', 1: 'Active', 0: 'Inactive' },
      chipColors: { true: '#079141ff', false: '#999999', 1: '#079141ff', 0: '#999999' },
      defaultVisible: true,
    },
  ];

  // Enhanced menu items for activity types
  const getMenuItems = (activityType) => {
    const baseItems = [
      {
        label: 'View Details',
        icon: <InfoIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onView && onView(activityType),
        show: !!onView,
      },
      {
        label: 'Edit',
        icon: <EditIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onEdit && onEdit(activityType),
        show: !!onEdit,
      },
      {
        label: 'Add Notes',
        icon: <NoteIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onAddNote && onAddNote(activityType),
        show: !!onAddNote,
      },
      {
        label: 'Add Attachments',
        icon: <AttachFileIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onAddAttachment && onAddAttachment(activityType),
        show: !!onAddAttachment,
      },
    ];

    // Add reactivate/deactivate based on current status
    const isActive = activityType.IsActive === true || activityType.IsActive === 1;
    if (isActive) {
      baseItems.push({
        label: 'Deactivate',
        icon: <PowerOffIcon sx={{ mr: 1, color: '#ff9800' }} />,
        onClick: () => onDeactivate && onDeactivate(activityType.TypeID),
        show: !!onDeactivate,
      });
    } else {
      baseItems.push({
        label: 'Reactivate',
        icon: <PowerIcon sx={{ mr: 1, color: '#4caf50' }} />,
        onClick: () => onReactivate && onReactivate(activityType.TypeID),
        show: !!onReactivate,
      });
    }

    // Add delete option
    baseItems.push({
      label: 'Delete',
      icon: <DeleteIcon sx={{ mr: 1, color: '#f44336' }} />,
      onClick: () => onDelete && onDelete(activityType.TypeID),
      show: !!onDelete,
    });

    return baseItems;
  };

  // Custom formatters for activity type-specific fields
  const activityTypeFormatters = {
    ...formatters,
    IsActive: (value) => {
      const isActive = value === true || value === 1;
      return (
        <Chip
          label={isActive ? 'Active' : 'Inactive'}
          size="small"
          sx={{
            backgroundColor: isActive ? '#079141ff' : '#999999',
            color: '#fff',
            fontWeight: 500,
          }}
        />
      );
    },
    Description: (value) => {
      return value || 'No description';
    }
  };

  // Handle Add Activity Type Dialog
  const handleOpenAddActivityTypeDialog = () => {
    setAddActivityTypeDialogOpen(true);
    setNewActivityType({
      TypeName: '',
      Description: '',
      IsActive: true
    });
  };

  const handleCloseAddActivityTypeDialog = () => {
    setAddActivityTypeDialogOpen(false);
    setNewActivityType({
      TypeName: '',
      Description: '',
      IsActive: true
    });
  };

  const handleAddActivityType = async () => {
    if (!newActivityType.TypeName.trim()) {
      setError && setError('Activity type name is required');
      return;
    }

    if (!newActivityType.Description.trim()) {
      setError && setError('Activity type description is required');
      return;
    }

    setAddActivityTypeLoading(true);
    try {
      if (onCreate) {
        await onCreate(newActivityType);
        handleCloseAddActivityTypeDialog();
        setSuccessMessage && setSuccessMessage('Activity type added successfully');
      }
    } catch (error) {
      setError && setError('Failed to add activity type');
    } finally {
      setAddActivityTypeLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewActivityType(prev => ({
      ...prev,
      [field]: value
    }));
  };

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
              <Typography variant="h6" component="div" sx={{ color: '#050505', fontWeight: 600 }}>
                Activity Types
              </Typography>
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
                onClick={handleOpenAddActivityTypeDialog}
              >
                Add Activity Type
              </Button>
              {selected.length > 0 && (
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={onBulkDeactivate}
                >
                  Deactivate Selected
                </Button>
              )}
            </Box>
          </Toolbar>

          {loading ? (
            <Box display="flex" justifyContent="center" p={8}>
              <CircularProgress />
            </Box>
          ) : (
            <TableView
              data={activityTypes}
              columns={columns}
              idField="TypeID"
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
              formatters={activityTypeFormatters}
              entityType="activityType"
              getMenuItems={getMenuItems}
            />
          )}

          <Box sx={{ 
            p: 2, 
            borderTop: '1px solid #e5e5e5', 
            backgroundColor: '#fafafa', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Typography variant="body2" sx={{ color: '#666666' }}>
              Showing {activityTypes.length} activity types
            </Typography>
            {selected.length > 0 && (
              <Typography variant="body2" sx={{ color: '#050505', fontWeight: 500 }}>
                {selected.length} selected
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Add Activity Type Dialog */}
        <Dialog 
          open={addActivityTypeDialogOpen} 
          onClose={handleCloseAddActivityTypeDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid #e5e5e5'
          }}>
            Add New Activity Type
            <IconButton onClick={handleCloseAddActivityTypeDialog} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Activity Type Name"
                value={newActivityType.TypeName}
                onChange={(e) => handleInputChange('TypeName', e.target.value)}
                fullWidth
                required
                variant="outlined"
                helperText="Enter the name of the activity type (e.g., Call, Email, Meeting)"
                inputProps={{ maxLength: 50 }}
              />

              <TextField
                label="Description"
                value={newActivityType.Description}
                onChange={(e) => handleInputChange('Description', e.target.value)}
                fullWidth
                required
                multiline
                rows={3}
                variant="outlined"
                helperText="Enter a description for this activity type"
                inputProps={{ maxLength: 255 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={newActivityType.IsActive}
                    onChange={(e) => handleInputChange('IsActive', e.target.checked)}
                    color="primary"
                  />
                }
                label="Active"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #e5e5e5' }}>
            <Button onClick={handleCloseAddActivityTypeDialog} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleAddActivityType}
              variant="contained"
              disabled={addActivityTypeLoading || !newActivityType.TypeName.trim() || !newActivityType.Description.trim()}
            >
              {addActivityTypeLoading ? <CircularProgress size={20} /> : 'Add Activity Type'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Status Snackbar */}
        <Snackbar
          open={!!statusMessage}
          autoHideDuration={4000}
          onClose={() => setStatusMessage && setStatusMessage('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setStatusMessage && setStatusMessage('')} 
            severity={statusSeverity} 
            sx={{ width: '100%' }}
          >
            {statusMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default ActivityTypePage;