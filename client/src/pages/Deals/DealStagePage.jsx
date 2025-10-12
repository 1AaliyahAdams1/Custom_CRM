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
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput,
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
  Percent as PercentIcon,
  Timeline as TimelineIcon,
  Add,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import TableView from '../../components/tableFormat/TableView';
import { formatters } from '../../utils/formatters';

const DealStagePage = ({
  dealStages = [],
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
  selectedDealStage,
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
  
  // Add Deal Stage Dialog State
  const [addDealStageDialogOpen, setAddDealStageDialogOpen] = useState(false);
  const [newDealStage, setNewDealStage] = useState({
    StageName: '',
    Progression: 0,
    Display_order: '',
    Description: '',
    IsActive: true
  });
  const [addDealStageLoading, setAddDealStageLoading] = useState(false);

  const columns = [
    { field: 'StageName', headerName: 'Stage Name', type: 'tooltip', defaultVisible: true },
    { 
      field: 'Progression', 
      headerName: 'Progression %', 
      type: 'custom',
      defaultVisible: true 
    },
    { field: 'Display_order', headerName: 'Display Order', defaultVisible: true },
    { field: 'Description', headerName: 'Description', type: 'tooltip', defaultVisible: false },
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

  // Enhanced menu items for deal stages
  const getMenuItems = (dealStage) => {
    const baseItems = [
      {
        label: 'View Details',
        icon: <InfoIcon sx={{ mr: 1, color: theme.palette.text.primary }} />,
        onClick: () => onView && onView(dealStage),
        show: !!onView,
      },
      {
        label: 'Edit',
        icon: <EditIcon sx={{ mr: 1, color: theme.palette.text.primary }} />,
        onClick: () => onEdit && onEdit(dealStage),
        show: !!onEdit,
      },
      {
        label: 'Add Notes',
        icon: <NoteIcon sx={{ mr: 1, color: theme.palette.text.primary }} />,
        onClick: () => onAddNote && onAddNote(dealStage),
        show: !!onAddNote,
      },
      {
        label: 'Add Attachments',
        icon: <AttachFileIcon sx={{ mr: 1, color: theme.palette.text.primary }} />,
        onClick: () => onAddAttachment && onAddAttachment(dealStage),
        show: !!onAddAttachment,
      },
    ];

    // Add reactivate/deactivate based on current status
    const isActive = dealStage.IsActive === true || dealStage.IsActive === 1;
    if (isActive) {
      baseItems.push({
        label: 'Deactivate',
        icon: <PowerOffIcon sx={{ mr: 1, color: '#ff9800' }} />,
        onClick: () => onDeactivate && onDeactivate(dealStage.DealStageID),
        show: !!onDeactivate,
      });
    } else {
      baseItems.push({
        label: 'Reactivate',
        icon: <PowerIcon sx={{ mr: 1, color: '#4caf50' }} />,
        onClick: () => onReactivate && onReactivate(dealStage.DealStageID),
        show: !!onReactivate,
      });
    }

    // Add delete option
    baseItems.push({
      label: 'Delete',
      icon: <DeleteIcon sx={{ mr: 1, color: '#f44336' }} />,
      onClick: () => onDelete && onDelete(dealStage.DealStageID),
      show: !!onDelete,
    });

    return baseItems;
  };

  // Custom formatters for deal stage-specific fields
  const dealStageFormatters = {
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
    Progression: (value) => {
      const percentage = parseFloat(value) || 0;
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={`${percentage}%`}
            size="small"
            icon={<PercentIcon />}
            sx={{
              backgroundColor: percentage >= 80 ? '#4caf50' : 
                             percentage >= 50 ? '#ff9800' : 
                             percentage >= 25 ? '#2196f3' : '#f44336',
              color: '#fff',
              fontWeight: 500,
            }}
          />
        </Box>
      );
    },
    Display_order: (value) => {
      return value !== null && value !== undefined ? value : 'N/A';
    },
    Description: (value) => {
      return value || 'No description';
    }
  };

  // Handle Add Deal Stage Dialog
  const handleOpenAddDealStageDialog = () => {
    setAddDealStageDialogOpen(true);
    setNewDealStage({
      StageName: '',
      Progression: 0,
      Display_order: '',
      Description: '',
      IsActive: true
    });
  };

  const handleCloseAddDealStageDialog = () => {
    setAddDealStageDialogOpen(false);
    setNewDealStage({
      StageName: '',
      Progression: 0,
      Display_order: '',
      Description: '',
      IsActive: true
    });
  };

  const handleAddDealStage = async () => {
    if (!newDealStage.StageName.trim()) {
      setError && setError('Deal stage name is required');
      return;
    }

    if (newDealStage.Progression < 0 || newDealStage.Progression > 100) {
      setError && setError('Progression must be between 0 and 100');
      return;
    }

    setAddDealStageLoading(true);
    try {
      if (onCreate) {
        const dealStageData = {
          ...newDealStage,
          Display_order: newDealStage.Display_order !== '' ? parseInt(newDealStage.Display_order) : null
        };
        await onCreate(dealStageData);
        handleCloseAddDealStageDialog();
        setSuccessMessage && setSuccessMessage('Deal stage added successfully');
      }
    } catch (error) {
      setError && setError('Failed to add deal stage');
    } finally {
      setAddDealStageLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewDealStage(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProgressionChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      handleInputChange('Progression', value);
    } else if (e.target.value === '') {
      handleInputChange('Progression', 0);
    }
  };

  const handleDisplayOrderChange = (e) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(value) && parseInt(value) >= 0)) {
      handleInputChange('Display_order', value);
    }
  };

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
              Deal Stages
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
              onClick={handleOpenAddDealStageDialog}
            >
              Add Deal Stage
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
              Loading deal stages...
            </Typography>
          </Box>
        ) : (
          <TableView
            data={dealStages}
            columns={columns}
            idField="DealStageID"
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
            formatters={dealStageFormatters}
            entityType="dealStage"
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
            Showing {dealStages.length} deal stages
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

      {/* Add Deal Stage Dialog */}
      <Dialog 
        open={addDealStageDialogOpen} 
        onClose={handleCloseAddDealStageDialog}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TimelineIcon sx={{ color: theme.palette.primary.main }} />
            Add New Deal Stage
          </Box>
          <IconButton onClick={handleCloseAddDealStageDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Stage Name"
              value={newDealStage.StageName}
              onChange={(e) => handleInputChange('StageName', e.target.value)}
              fullWidth
              required
              variant="outlined"
              helperText="Enter the name of the deal stage (e.g., Prospecting, Qualification, Proposal)"
              inputProps={{ maxLength: 100 }}
            />

            <FormControl fullWidth required>
              <InputLabel>Progression</InputLabel>
              <OutlinedInput
                value={newDealStage.Progression}
                onChange={handleProgressionChange}
                type="number"
                inputProps={{ 
                  min: 0, 
                  max: 100, 
                  step: 0.01 
                }}
                endAdornment={<InputAdornment position="end">%</InputAdornment>}
                label="Progression"
              />
              <Typography variant="caption" sx={{ mt: 0.5, color: theme.palette.text.secondary }}>
                Enter progression percentage (0-100)
              </Typography>
            </FormControl>

            <TextField
              label="Display Order (Optional)"
              value={newDealStage.Display_order}
              onChange={handleDisplayOrderChange}
              fullWidth
              variant="outlined"
              type="number"
              helperText="Enter display order for sorting stages (leave empty for auto-assignment)"
              inputProps={{ min: 1 }}
            />

            <TextField
              label="Description (Optional)"
              value={newDealStage.Description}
              onChange={(e) => handleInputChange('Description', e.target.value)}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              helperText="Enter a description for this deal stage"
              inputProps={{ maxLength: 500 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={newDealStage.IsActive}
                  onChange={(e) => handleInputChange('IsActive', e.target.checked)}
                  color="primary"
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={handleCloseAddDealStageDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleAddDealStage}
            variant="contained"
            disabled={
              addDealStageLoading || 
              !newDealStage.StageName.trim() || 
              newDealStage.Progression < 0 || 
              newDealStage.Progression > 100
            }
          >
            {addDealStageLoading ? <CircularProgress size={20} /> : 'Add Deal Stage'}
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

export default DealStagePage;