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
} from "@mui/icons-material";

import { Add } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import TableView from '../../components/tableFormat/TableView';
import theme from "../../components/Theme";
import { formatters } from '../../utils/formatters';

const StateProvincePage = ({
  statesProvinces = [],
  countries = [], // For dropdown in add state/province popup
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
  selectedStateProvince,
  popupLoading,
  popupError,
  handleSaveNote,
  handleDeleteNote,
  handleEditNote,
  handleUploadAttachment,
  handleDeleteAttachment,
  handleDownloadAttachment,
}) => {
  // Add State/Province Dialog State
  const [addStateProvinceDialogOpen, setAddStateProvinceDialogOpen] = useState(false);
  const [newStateProvince, setNewStateProvince] = useState({
    StateProvince_Name: '',
    CountryID: '',
    Active: true
  });
  const [addStateProvinceLoading, setAddStateProvinceLoading] = useState(false);

  const columns = [
    { field: 'StateProvince_Name', headerName: 'State/Province Name', type: 'tooltip', defaultVisible: true },
    { field: 'CountryName', headerName: 'Country', defaultVisible: true },
    { field: 'CreatedAt', headerName: 'Created', type: 'dateTime', defaultVisible: true },
    { field: 'UpdatedAt', headerName: 'Updated', type: 'dateTime', defaultVisible: false },
    {
      field: 'Active',
      headerName: 'Status',
      type: 'chip',
      chipLabels: { true: 'Active', false: 'Inactive' },
      chipColors: { true: '#079141ff', false: '#999999' },
      defaultVisible: true,
    },
  ];

  // Enhanced menu items for states/provinces
  const getMenuItems = (stateProvince) => {
    const baseItems = [
      {
        label: 'View Details',
        icon: <InfoIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onView && onView(stateProvince),
        show: !!onView,
      },
      {
        label: 'Edit',
        icon: <EditIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onEdit && onEdit(stateProvince),
        show: !!onEdit,
      },
      {
        label: 'Add Notes',
        icon: <NoteIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onAddNote && onAddNote(stateProvince),
        show: !!onAddNote,
      },
      {
        label: 'Add Attachments',
        icon: <AttachFileIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onAddAttachment && onAddAttachment(stateProvince),
        show: !!onAddAttachment,
      },
    ];

    // Add reactivate/deactivate based on current status
    if (stateProvince.Active) {
      baseItems.push({
        label: 'Deactivate',
        icon: <PowerOffIcon sx={{ mr: 1, color: '#ff9800' }} />,
        onClick: () => onDeactivate && onDeactivate(stateProvince.StateProvinceID),
        show: !!onDeactivate,
      });
    } else {
      baseItems.push({
        label: 'Reactivate',
        icon: <PowerIcon sx={{ mr: 1, color: '#4caf50' }} />,
        onClick: () => onReactivate && onReactivate(stateProvince.StateProvinceID),
        show: !!onReactivate,
      });
    }

    // Add delete option
    baseItems.push({
      label: 'Delete',
      icon: <DeleteIcon sx={{ mr: 1, color: '#f44336' }} />,
      onClick: () => onDelete && onDelete(stateProvince.StateProvinceID),
      show: !!onDelete,
    });

    return baseItems;
  };

  // Custom formatters for state/province-specific fields
  const stateProvinceFormatters = {
    ...formatters,
    Active: (value) => {
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
    CountryName: (value) => {
      return value || 'N/A';
    }
  };

  // Handle Add State/Province Dialog
  const handleOpenAddStateProvinceDialog = () => {
    setAddStateProvinceDialogOpen(true);
    setNewStateProvince({
      StateProvince_Name: '',
      CountryID: '',
      Active: true
    });
  };

  const handleCloseAddStateProvinceDialog = () => {
    setAddStateProvinceDialogOpen(false);
    setNewStateProvince({
      StateProvince_Name: '',
      CountryID: '',
      Active: true
    });
  };

  const handleAddStateProvince = async () => {
    if (!newStateProvince.StateProvince_Name.trim() || !newStateProvince.CountryID) {
      setError && setError('State/Province name and country are required');
      return;
    }

    setAddStateProvinceLoading(true);
    try {
      if (onCreate) {
        await onCreate(newStateProvince);
        handleCloseAddStateProvinceDialog();
        setSuccessMessage && setSuccessMessage('State/Province added successfully');
      }
    } catch (error) {
      setError && setError('Failed to add state/province');
    } finally {
      setAddStateProvinceLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewStateProvince(prev => ({
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
                States/Provinces
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
                onClick={handleOpenAddStateProvinceDialog}
              >
                Add State/Province
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
              data={statesProvinces}
              columns={columns}
              idField="StateProvinceID"
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
              formatters={stateProvinceFormatters}
              entityType="stateProvince"
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
              Showing {statesProvinces.length} states/provinces
            </Typography>
            {selected.length > 0 && (
              <Typography variant="body2" sx={{ color: '#050505', fontWeight: 500 }}>
                {selected.length} selected
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Add State/Province Dialog */}
        <Dialog 
          open={addStateProvinceDialogOpen} 
          onClose={handleCloseAddStateProvinceDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid #e5e5e5'
          }}>
            Add New State/Province
            <IconButton onClick={handleCloseAddStateProvinceDialog} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="State/Province Name"
                value={newStateProvince.StateProvince_Name}
                onChange={(e) => handleInputChange('StateProvince_Name', e.target.value)}
                fullWidth
                required
                variant="outlined"
                helperText="Enter the full name of the state or province"
              />

              <FormControl fullWidth required>
                <InputLabel>Country</InputLabel>
                <Select
                  value={newStateProvince.CountryID}
                  onChange={(e) => handleInputChange('CountryID', e.target.value)}
                  label="Country"
                >
                  {countries.map((country) => (
                    <MenuItem key={country.CountryID} value={country.CountryID}>
                      {country.CountryName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={newStateProvince.Active}
                    onChange={(e) => handleInputChange('Active', e.target.checked)}
                    color="primary"
                  />
                }
                label="Active"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #e5e5e5' }}>
            <Button onClick={handleCloseAddStateProvinceDialog} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleAddStateProvince}
              variant="contained"
              disabled={addStateProvinceLoading || !newStateProvince.StateProvince_Name.trim() || !newStateProvince.CountryID}
            >
              {addStateProvinceLoading ? <CircularProgress size={20} /> : 'Add State/Province'}
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

export default StateProvincePage;