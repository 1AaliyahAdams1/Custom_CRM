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
import { useTheme } from "@mui/material/styles";
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
import TableView from '../../components/tableFormat/TableView';
import { formatters } from '../../utils/formatters';

const CityPage = ({
  cities = [],
  statesProvinces = [],
  entertainmentCities = [],
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
  notesPopupOpen,
  setNotesPopupOpen,
  attachmentsPopupOpen,
  setAttachmentsPopupOpen,
  selectedCity,
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

  const [addCityDialogOpen, setAddCityDialogOpen] = useState(false);
  const [newCity, setNewCity] = useState({
    CityName: '',
    StateProvinceID: '',
    EntertainmentCityID: '',
    Active: true
  });
  const [addCityLoading, setAddCityLoading] = useState(false);

  const columns = [
    { field: 'CityName', headerName: 'City Name', type: 'tooltip', defaultVisible: true },
    { field: 'StateProvinceName', headerName: 'State/Province', defaultVisible: true },
    { field: 'EntertainmentCityName', headerName: 'Entertainment City', defaultVisible: true },
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

  const getMenuItems = (city) => {
    const baseItems = [
      {
        label: 'View Details',
        icon: <InfoIcon sx={{ mr: 1, color: theme.palette.text.primary }} />,
        onClick: () => onView && onView(city),
        show: !!onView,
      },
      {
        label: 'Edit',
        icon: <EditIcon sx={{ mr: 1, color: theme.palette.text.primary }} />,
        onClick: () => onEdit && onEdit(city),
        show: !!onEdit,
      },
      {
        label: 'Add Notes',
        icon: <NoteIcon sx={{ mr: 1, color: theme.palette.text.primary }} />,
        onClick: () => onAddNote && onAddNote(city),
        show: !!onAddNote,
      },
      {
        label: 'Add Attachments',
        icon: <AttachFileIcon sx={{ mr: 1, color: theme.palette.text.primary }} />,
        onClick: () => onAddAttachment && onAddAttachment(city),
        show: !!onAddAttachment,
      },
    ];

    if (city.Active) {
      baseItems.push({
        label: 'Deactivate',
        icon: <PowerOffIcon sx={{ mr: 1, color: '#ff9800' }} />,
        onClick: () => onDeactivate && onDeactivate(city.CityID),
        show: !!onDeactivate,
      });
    } else {
      baseItems.push({
        label: 'Reactivate',
        icon: <PowerIcon sx={{ mr: 1, color: '#4caf50' }} />,
        onClick: () => onReactivate && onReactivate(city.CityID),
        show: !!onReactivate,
      });
    }

    baseItems.push({
      label: 'Delete',
      icon: <DeleteIcon sx={{ mr: 1, color: '#f44336' }} />,
      onClick: () => onDelete && onDelete(city.CityID),
      show: !!onDelete,
    });

    return baseItems;
  };

  const cityFormatters = {
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
    EntertainmentCityName: (value) => {
      return value || 'N/A';
    }
  };

  const handleOpenAddCityDialog = () => {
    setAddCityDialogOpen(true);
    setNewCity({
      CityName: '',
      StateProvinceID: '',
      EntertainmentCityID: '',
      Active: true
    });
  };

  const handleCloseAddCityDialog = () => {
    setAddCityDialogOpen(false);
    setNewCity({
      CityName: '',
      StateProvinceID: '',
      EntertainmentCityID: '',
      Active: true
    });
  };

  const handleAddCity = async () => {
    if (!newCity.CityName.trim() || !newCity.StateProvinceID) {
      setError && setError('City name and state/province are required');
      return;
    }

    setAddCityLoading(true);
    try {
      if (onCreate) {
        await onCreate(newCity);
        handleCloseAddCityDialog();
        setSuccessMessage && setSuccessMessage('City added successfully');
      }
    } catch (error) {
      setError && setError('Failed to add city');
    } finally {
      setAddCityLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewCity(prev => ({
      ...prev,
      [field]: value
    }));
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
              Cities
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
              onClick={handleOpenAddCityDialog}
            >
              Add City
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
            data={cities}
            columns={columns}
            idField="CityID"
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
            formatters={cityFormatters}
            entityType="city"
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
            Showing {cities.length} cities
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

      {/* Add City Dialog */}
      <Dialog 
        open={addCityDialogOpen} 
        onClose={handleCloseAddCityDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
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
          Add New City
          <IconButton onClick={handleCloseAddCityDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="City Name"
              value={newCity.CityName}
              onChange={(e) => handleInputChange('CityName', e.target.value)}
              fullWidth
              required
              variant="outlined"
            />

            <FormControl fullWidth required>
              <InputLabel>State/Province</InputLabel>
              <Select
                value={newCity.StateProvinceID}
                onChange={(e) => handleInputChange('StateProvinceID', e.target.value)}
                label="State/Province"
              >
                {statesProvinces.map((state) => (
                  <MenuItem key={state.StateProvinceID} value={state.StateProvinceID}>
                    {state.StateProvinceName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Entertainment City (Optional)</InputLabel>
              <Select
                value={newCity.EntertainmentCityID}
                onChange={(e) => handleInputChange('EntertainmentCityID', e.target.value)}
                label="Entertainment City (Optional)"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {entertainmentCities.map((entertainment) => (
                  <MenuItem key={entertainment.EntertainmentCityID} value={entertainment.EntertainmentCityID}>
                    {entertainment.EntertainmentCityName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={newCity.Active}
                  onChange={(e) => handleInputChange('Active', e.target.checked)}
                  color="primary"
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          borderTop: `1px solid ${theme.palette.divider}`
        }}>
          <Button onClick={handleCloseAddCityDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleAddCity}
            variant="contained"
            disabled={addCityLoading || !newCity.CityName.trim() || !newCity.StateProvinceID}
          >
            {addCityLoading ? <CircularProgress size={20} /> : 'Add City'}
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

export default CityPage;