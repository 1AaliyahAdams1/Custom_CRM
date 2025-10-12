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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Add,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import TableView from '../components/tableFormat/TableView';
import { formatters } from '../utils/formatters';

const PriorityLevelPage = ({
  priorityLevels = [],
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
  selectedPriorityLevel,
  popupLoading,
  popupError,
  handleSaveNote,
  handleDeleteNote,
  handleEditNote,
  handleUploadAttachment,
  handleDeleteAttachment,
  handleDownloadAttachment,
}) => {
  const theme = useTheme();
  
  // Add Priority Level Dialog State
  const [addPriorityLevelDialogOpen, setAddPriorityLevelDialogOpen] = useState(false);
  const [newPriorityLevel, setNewPriorityLevel] = useState({
    PriorityName: '',
    Description: '',
    PriorityOrder: '',
    Color: '#079141ff',
    IsActive: true
  });
  const [addPriorityLevelLoading, setAddPriorityLevelLoading] = useState(false);

  const columns = [
    { field: 'PriorityLevelName', headerName: 'Priority Name', type: 'tooltip', defaultVisible: true },
  ];

  // Enhanced menu items for priority levels
  const getMenuItems = (priorityLevel) => {
    const baseItems = [
      {
        label: 'View Details',
        icon: <InfoIcon sx={{ mr: 1, color: theme.palette.text.primary }} />,
        onClick: () => onView && onView(priorityLevel),
        show: !!onView,
      },
      {
        label: 'Edit',
        icon: <EditIcon sx={{ mr: 1, color: theme.palette.text.primary }} />,
        onClick: () => onEdit && onEdit(priorityLevel),
        show: !!onEdit,
      },
      {
        label: 'Add Notes',
        icon: <NoteIcon sx={{ mr: 1, color: theme.palette.text.primary }} />,
        onClick: () => onAddNote && onAddNote(priorityLevel),
        show: !!onAddNote,
      },
      {
        label: 'Add Attachments',
        icon: <AttachFileIcon sx={{ mr: 1, color: theme.palette.text.primary }} />,
        onClick: () => onAddAttachment && onAddAttachment(priorityLevel),
        show: !!onAddAttachment,
      },
    ];

    // Add reactivate/deactivate based on current status
    if (priorityLevel.IsActive) {
      baseItems.push({
        label: 'Deactivate',
        icon: <PowerOffIcon sx={{ mr: 1, color: '#ff9800' }} />,
        onClick: () => onDeactivate && onDeactivate(priorityLevel.PriorityLevelID),
        show: !!onDeactivate,
      });
    } else {
      baseItems.push({
        label: 'Reactivate',
        icon: <PowerIcon sx={{ mr: 1, color: '#4caf50' }} />,
        onClick: () => onReactivate && onReactivate(priorityLevel.PriorityLevelID),
        show: !!onReactivate,
      });
    }

    // Add delete option
    baseItems.push({
      label: 'Delete',
      icon: <DeleteIcon sx={{ mr: 1, color: '#f44336' }} />,
      onClick: () => onDelete && onDelete(priorityLevel.PriorityLevelID),
      show: !!onDelete,
    });

    return baseItems;
  };

  // Custom formatters for priority level-specific fields
  const priorityLevelFormatters = {
    ...formatters,
    IsActive: (value) => {
      return (
        <Chip
          label={value ? 'Active' : 'Inactive'}
          size="small"
          sx={{
            backgroundColor: value ? '#079141ff' : '#999999',
            color: '#fff',
            fontWeight: 500,
          }}
        />
      );
    },
    Color: (value) => {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 20,
              height: 20,
              backgroundColor: value || '#079141ff',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1
            }}
          />
          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
            {value || '#079141ff'}
          </Typography>
        </Box>
      );
    },
    PriorityOrder: (value) => {
      return (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: theme.palette.text.primary,
            textAlign: 'center'
          }}
        >
          {value || 'N/A'}
        </Typography>
      );
    },
    Description: (value) => {
      return value || 'No description';
    }
  };

  // Handle Add Priority Level Dialog
  const handleOpenAddPriorityLevelDialog = () => {
    setAddPriorityLevelDialogOpen(true);
    setNewPriorityLevel({
      PriorityName: '',
      Description: '',
      PriorityOrder: '',
      Color: '#079141ff',
      IsActive: true
    });
  };

  const handleCloseAddPriorityLevelDialog = () => {
    setAddPriorityLevelDialogOpen(false);
    setNewPriorityLevel({
      PriorityName: '',
      Description: '',
      PriorityOrder: '',
      Color: '#079141ff',
      IsActive: true
    });
  };

  const handleAddPriorityLevel = async () => {
    if (!newPriorityLevel.PriorityName.trim()) {
      setError && setError('Priority name is required');
      return;
    }

    setAddPriorityLevelLoading(true);
    try {
      if (onCreate) {
        // Convert PriorityOrder to number if provided
        const priorityLevelData = {
          ...newPriorityLevel,
          PriorityOrder: newPriorityLevel.PriorityOrder ? parseInt(newPriorityLevel.PriorityOrder) : undefined
        };
        
        await onCreate(priorityLevelData);
        handleCloseAddPriorityLevelDialog();
        setSuccessMessage && setSuccessMessage('Priority level added successfully');
      }
    } catch (error) {
      setError && setError('Failed to add priority level');
    } finally {
      setAddPriorityLevelLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewPriorityLevel(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Predefined color options
  const colorOptions = [
    { value: '#f44336', label: 'High Priority (Red)' },
    { value: '#ff9800', label: 'Medium Priority (Orange)' },
    { value: '#ffeb3b', label: 'Normal Priority (Yellow)' },
    { value: '#4caf50', label: 'Low Priority (Green)' },
    { value: '#2196f3', label: 'Info (Blue)' },
    { value: '#9c27b0', label: 'Special (Purple)' },
    { value: '#607d8b', label: 'Neutral (Gray)' },
    { value: '#079141ff', label: 'Default (Brand Green)' },
  ];

  return (
    <Box sx={{ 
      width: '100%', 
      backgroundColor: theme.palette.background.default, 
      minHeight: '100vh', 
      p: 3 
    }}>
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
          backgroundColor: theme.palette.background.paper, 
          borderBottom: `1px solid ${theme.palette.divider}`, 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: 2, 
          py: 2 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Typography variant="h6" component="div" sx={{ 
              color: theme.palette.text.primary, 
              fontWeight: 600 
            }}>
              Priority Levels
            </Typography>
            {selected.length > 0 && (
              <Chip 
                label={`${selected.length} selected`} 
                size="small" 
                sx={{ 
                  backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#e0e0e0', 
                  color: theme.palette.text.primary 
                }} 
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenAddPriorityLevelDialog}
            >
              Add Priority Level
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
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={8}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2, color: theme.palette.text.secondary }}>
              Loading priority levels...
            </Typography>
          </Box>
        ) : (
          <TableView
            data={priorityLevels}
            columns={columns}
            idField="PriorityLevelID"
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
            formatters={priorityLevelFormatters}
            entityType="priority level"
            getMenuItems={getMenuItems}
          />
        )}

        <Box sx={{ 
          p: 2, 
          borderTop: `1px solid ${theme.palette.divider}`, 
          backgroundColor: theme.palette.background.default, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Showing {priorityLevels.length} priority levels
          </Typography>
          {selected.length > 0 && (
            <Typography variant="body2" sx={{ 
              color: theme.palette.text.primary, 
              fontWeight: 500 
            }}>
              {selected.length} selected
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Add Priority Level Dialog */}
      <Dialog 
        open={addPriorityLevelDialogOpen} 
        onClose={handleCloseAddPriorityLevelDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary
        }}>
          Add New Priority Level
          <IconButton onClick={handleCloseAddPriorityLevelDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Priority Name"
              value={newPriorityLevel.PriorityName}
              onChange={(e) => handleInputChange('PriorityName', e.target.value)}
              fullWidth
              required
              variant="outlined"
              helperText="Enter a descriptive name for the priority level"
            />

            <TextField
              label="Description"
              value={newPriorityLevel.Description}
              onChange={(e) => handleInputChange('Description', e.target.value)}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              helperText="Optional description explaining when to use this priority level"
            />

            <TextField
              label="Priority Order"
              value={newPriorityLevel.PriorityOrder}
              onChange={(e) => handleInputChange('PriorityOrder', e.target.value)}
              fullWidth
              type="number"
              variant="outlined"
              helperText="Lower numbers = higher priority (1 = highest priority)"
              inputProps={{ min: 1, max: 100 }}
            />

            <FormControl fullWidth>
              <InputLabel>Color</InputLabel>
              <Select
                value={newPriorityLevel.Color}
                onChange={(e) => handleInputChange('Color', e.target.value)}
                label="Color"
              >
                {colorOptions.map((color) => (
                  <MenuItem key={color.value} value={color.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          backgroundColor: color.value,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 1
                        }}
                      />
                      {color.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                label="Custom Color"
                value={newPriorityLevel.Color}
                onChange={(e) => handleInputChange('Color', e.target.value)}
                size="small"
                variant="outlined"
                helperText="Or enter custom hex color"
                sx={{ flex: 1 }}
              />
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  backgroundColor: newPriorityLevel.Color,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  flexShrink: 0
                }}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={newPriorityLevel.IsActive}
                  onChange={(e) => handleInputChange('IsActive', e.target.checked)}
                  color="primary"
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={handleCloseAddPriorityLevelDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleAddPriorityLevel}
            variant="contained"
            disabled={addPriorityLevelLoading || !newPriorityLevel.PriorityName.trim()}
          >
            {addPriorityLevelLoading ? <CircularProgress size={20} /> : 'Add Priority Level'}
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
  );
};

export default PriorityLevelPage;