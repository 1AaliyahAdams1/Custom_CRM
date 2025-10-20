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
    CountryID: '',
    StateProvinceID: '',
    PostalCode: '',
    Active: true
  });
  const [addCityLoading, setAddCityLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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

  // Validation rules
  const validateField = (name, value) => {
    const fieldErrors = {};

    switch (name) {
      case 'CityName':
        if (!value.trim()) {
          fieldErrors.CityName = 'City name is required';
        } else if (value.trim().length < 2) {
          fieldErrors.CityName = 'City name must be at least 2 characters';
        } else if (value.trim().length > 100) {
          fieldErrors.CityName = 'City name must be 100 characters or less';
        } else if (!/^[a-zA-Z\s\-]+$/.test(value.trim())) {
          fieldErrors.CityName = 'City name can only contain letters, spaces, and hyphens';
        }
        break;
      
      case 'CountryID':
        if (!value) {
          fieldErrors.CountryID = 'Country is required';
        }
        break;

      case 'StateProvinceID':
        if (value && !value.toString().trim()) {
          fieldErrors.StateProvinceID = 'State/Province must be valid if selected';
        }
        break;

      case 'PostalCode':
        if (value.trim() && !/^[a-zA-Z0-9\s\-]{3,10}$/.test(value.trim())) {
          fieldErrors.PostalCode = 'Postal code must be 3-10 alphanumeric characters';
        }
        break;
      
      default:
        break;
    }

    return fieldErrors;
  };

  const handleOpenAddCityDialog = () => {
    setAddCityDialogOpen(true);
    setNewCity({
      CityName: '',
      CountryID: '',
      StateProvinceID: '',
      PostalCode: '',
      Active: true
    });
    setErrors({});
    setTouched({});
  };

  const handleCloseAddCityDialog = () => {
    setAddCityDialogOpen(false);
    setNewCity({
      CityName: '',
      CountryID: '',
      StateProvinceID: '',
      PostalCode: '',
      Active: true
    });
    setErrors({});
    setTouched({});
  };

  const handleAddCity = async () => {
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(newCity).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate all fields
    const allErrors = {};
    Object.keys(newCity).forEach(key => {
      const fieldErrors = validateField(key, newCity[key]);
      Object.assign(allErrors, fieldErrors);
    });

    setErrors(allErrors);

    if (Object.keys(allErrors).length > 0) {
      setError && setError('Please fix the errors below before submitting');
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

    // Real-time validation
    const fieldErrors = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      ...fieldErrors
    }));

    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  // Check if form is valid for submit button
  const isFormValid = () => {
    const requiredFields = ['CityName', 'CountryID'];
    const hasRequiredFields = requiredFields.every(field => {
      const value = newCity[field];
      return value && value.toString().trim();
    });
    const hasNoErrors = Object.keys(errors).length === 0;
    return hasRequiredFields && hasNoErrors;
  };

  // Get field props for consistent styling
  const getFieldProps = (name) => ({
    error: touched[name] && !!errors[name],
    helperText: touched[name] && errors[name] ? errors[name] : '',
  });

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
            formatters={cityFormatters}
            entityType="city"
            showActions={false}
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
              placeholder="e.g., New York"
              inputProps={{ maxLength: 100 }}
              {...getFieldProps('CityName')}
            />

            <FormControl fullWidth required {...getFieldProps('CountryID')}>
              <InputLabel>Country</InputLabel>
              <Select
                value={newCity.CountryID}
                onChange={(e) => handleInputChange('CountryID', e.target.value)}
                label="Country"
              >
                <MenuItem value="">
                  <em>Select Country</em>
                </MenuItem>
                {/* Add countries data here when available */}
              </Select>
            </FormControl>

            <FormControl fullWidth {...getFieldProps('StateProvinceID')}>
              <InputLabel>State/Province (Optional)</InputLabel>
              <Select
                value={newCity.StateProvinceID}
                onChange={(e) => handleInputChange('StateProvinceID', e.target.value)}
                label="State/Province (Optional)"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {statesProvinces.map((state) => (
                  <MenuItem key={state.StateProvinceID} value={state.StateProvinceID}>
                    {state.StateProvinceName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Postal Code (Optional)"
              value={newCity.PostalCode}
              onChange={(e) => handleInputChange('PostalCode', e.target.value)}
              fullWidth
              variant="outlined"
              placeholder="e.g., 10001"
              inputProps={{ maxLength: 10 }}
              {...getFieldProps('PostalCode')}
            />

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
            disabled={addCityLoading || !isFormValid()}
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