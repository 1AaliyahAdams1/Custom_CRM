import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
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
  LocationCity as LocationCityIcon,
  Add,
} from "@mui/icons-material";

import TableView from '../../components/tableFormat/TableView';
import { formatters } from '../../utils/formatters';

const CityPage = ({
  cities = [],
  statesProvinces = [], // For dropdown in add city popup
  entertainmentCities = [], // For dropdown in add city popup
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
  selectedCity,
}) => {
  // Add City Dialog State
  const [addCityDialogOpen, setAddCityDialogOpen] = useState(false);
  const [newCity, setNewCity] = useState({
    City_Name: '',
    StateProvince_ID: '',
    EntertainmentCity_ID: '',
    Active: true
  });
  const [addCityLoading, setAddCityLoading] = useState(false);

  // Create maps for quick lookup - handling both naming conventions
  const stateProvinceMap = React.useMemo(() => {
    const map = {};
    statesProvinces.forEach(state => {
      // Handle both underscore and camelCase field names
      const stateId = state.StateProvince_ID || state.StateProvinceID;
      const stateName = state.StateProvince_Name || state.StateProvinceName;
      if (stateId) {
        map[stateId] = stateName;
      }
    });
    return map;
  }, [statesProvinces]);

  const entertainmentCityMap = React.useMemo(() => {
    const map = {};
    entertainmentCities.forEach(entertainment => {
      // Handle both underscore and camelCase field names
      const entertainmentId = entertainment.EntertainmentCity_ID || entertainment.EntertainmentCityID;
      const entertainmentName = entertainment.EntertainmentCity_Name || entertainment.EntertainmentCityName;
      if (entertainmentId) {
        map[entertainmentId] = entertainmentName;
      }
    });
    return map;
  }, [entertainmentCities]);

  // Enhanced cities data with state/province and entertainment city names
  const enhancedCities = React.useMemo(() => {
    return cities.map(city => {
      // Handle both underscore and camelCase field names for IDs
      const stateProvinceId = city.StateProvince_ID || city.StateProvinceID;
      const entertainmentCityId = city.EntertainmentCity_ID || city.EntertainmentCityID;
      
      return {
        ...city,
        StateProvince_Name: stateProvinceMap[stateProvinceId] || 'N/A',
        EntertainmentCity_Name: entertainmentCityMap[entertainmentCityId] || 'N/A'
      };
    });
  }, [cities, stateProvinceMap, entertainmentCityMap]);

  const columns = [
    { field: 'CityName', headerName: 'City Name', type: 'tooltip', defaultVisible: true },
    { field: 'StateProvince_Name', headerName: 'State/Province', defaultVisible: true },
    { field: 'EntertainmentCity_Name', headerName: 'Entertainment City', defaultVisible: true },
    {
      field: 'Active',
      headerName: 'Status',
      type: 'chip',
      chipLabels: { true: 'Active', false: 'Inactive', 1: 'Active', 0: 'Inactive' },
      chipColors: { true: '#079141ff', false: '#999999', 1: '#079141ff', 0: '#999999' },
      defaultVisible: true,
    },
  ];

  // Enhanced menu items for cities
  const getMenuItems = (city) => {
    const cityId = city.City_ID || city.CityID;
    const baseItems = [
      {
        label: 'View Details',
        icon: <InfoIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onView && onView(city),
        show: !!onView,
      },
      {
        label: 'Edit',
        icon: <EditIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onEdit && onEdit(city),
        show: !!onEdit,
      },
      {
        label: 'Add Notes',
        icon: <NoteIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onAddNote && onAddNote(city),
        show: !!onAddNote,
      },
      {
        label: 'Add Attachments',
        icon: <AttachFileIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onAddAttachment && onAddAttachment(city),
        show: !!onAddAttachment,
      },
    ];

    // Add reactivate/deactivate based on current status
    const isActive = city.Active === true || city.Active === 1;
    if (isActive) {
      baseItems.push({
        label: 'Deactivate',
        icon: <PowerOffIcon sx={{ mr: 1, color: '#ff9800' }} />,
        onClick: () => onDeactivate && onDeactivate(cityId),
        show: !!onDeactivate,
      });
    } else {
      baseItems.push({
        label: 'Reactivate',
        icon: <PowerIcon sx={{ mr: 1, color: '#4caf50' }} />,
        onClick: () => onReactivate && onReactivate(cityId),
        show: !!onReactivate,
      });
    }

    // Add delete option
    baseItems.push({
      label: 'Delete',
      icon: <DeleteIcon sx={{ mr: 1, color: '#f44336' }} />,
      onClick: () => onDelete && onDelete(cityId),
      show: !!onDelete,
    });

    return baseItems;
  };

  // Custom formatters for city-specific fields
  const cityFormatters = {
    ...formatters,
    Active: (value) => {
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
    StateProvince_Name: (value) => {
      return value || 'N/A';
    },
    EntertainmentCity_Name: (value) => {
      return value === 'N/A' ? (
        <Typography variant="body2" sx={{ color: '#999' }}>
          N/A
        </Typography>
      ) : value;
    }
  };

  // Handle Add City Dialog
  const handleOpenAddCityDialog = () => {
    setAddCityDialogOpen(true);
    setNewCity({
      City_Name: '',
      StateProvince_ID: '',
      EntertainmentCity_ID: '',
      Active: true
    });
  };

  const handleCloseAddCityDialog = () => {
    setAddCityDialogOpen(false);
    setNewCity({
      City_Name: '',
      StateProvince_ID: '',
      EntertainmentCity_ID: '',
      Active: true
    });
  };

  const handleAddCity = async () => {
    if (!newCity.City_Name.trim()) {
      setError && setError('City name is required');
      return;
    }

    if (!newCity.StateProvince_ID) {
      setError && setError('State/Province is required');
      return;
    }

    setAddCityLoading(true);
    try {
      if (onCreate) {
        const cityData = {
          ...newCity,
          StateProvince_ID: parseInt(newCity.StateProvince_ID),
          EntertainmentCity_ID: newCity.EntertainmentCity_ID ? parseInt(newCity.EntertainmentCity_ID) : null
        };
        await onCreate(cityData);
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
    <>
      {/* Error and Success Messages */}
      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert
          severity="success"
          sx={{ m: 2 }}
          onClose={() => setSuccessMessage && setSuccessMessage("")}
        >
          {successMessage}
        </Alert>
      )}

      {/* Cities Toolbar */}
      <Toolbar
        sx={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e5e5e5",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          py: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flex: 1,
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{ color: "#050505", fontWeight: 600 }}
          >
            Cities
          </Typography>
          {selected.length > 0 && (
            <Chip
              label={`${selected.length} selected`}
              size="small"
              sx={{ backgroundColor: "#e0e0e0", color: "#050505" }}
            />
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenAddCityDialog}
            disabled={loading}
            sx={{
              backgroundColor: "#050505",
              color: "#ffffff",
              "&:hover": { backgroundColor: "#333333" },
              "&:disabled": {
                backgroundColor: "#cccccc",
                color: "#666666",
              },
            }}
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

      {/* Cities Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={8}>
          <CircularProgress />
        </Box>
      ) : (
        <TableView
          data={enhancedCities}
          columns={columns}
          idField="City_ID"
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

      {/* Results Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid #e5e5e5",
          backgroundColor: "#fafafa",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" sx={{ color: "#666666" }}>
          Showing {enhancedCities.length} cities
        </Typography>
        {selected.length > 0 && (
          <Typography
            variant="body2"
            sx={{ color: "#050505", fontWeight: 500 }}
          >
            {selected.length} selected
          </Typography>
        )}
      </Box>

      {/* Add City Dialog */}
      <Dialog
        open={addCityDialogOpen}
        onClose={handleCloseAddCityDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e5e5e5'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationCityIcon sx={{ color: '#1976d2' }} />
            Add New City
          </Box>
          <IconButton onClick={handleCloseAddCityDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="City Name"
              value={newCity.City_Name}
              onChange={(e) => handleInputChange('City_Name', e.target.value)}
              fullWidth
              required
              variant="outlined"
              helperText="Enter the full city name"
              inputProps={{ maxLength: 100 }}
            />

            <FormControl fullWidth required>
              <InputLabel>State/Province</InputLabel>
              <Select
                value={newCity.StateProvince_ID}
                onChange={(e) => handleInputChange('StateProvince_ID', e.target.value)}
                label="State/Province"
              >
                <MenuItem value="">
                  <em>Select a state/province</em>
                </MenuItem>
                {statesProvinces.map((state) => {
                  const stateId = state.StateProvince_ID || state.StateProvinceID;
                  const stateName = state.StateProvince_Name || state.StateProvinceName;
                  return (
                    <MenuItem key={stateId} value={stateId}>
                      {stateName}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Entertainment City (Optional)</InputLabel>
              <Select
                value={newCity.EntertainmentCity_ID}
                onChange={(e) => handleInputChange('EntertainmentCity_ID', e.target.value)}
                label="Entertainment City (Optional)"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {entertainmentCities.map((entertainment) => {
                  const entertainmentId = entertainment.EntertainmentCity_ID || entertainment.EntertainmentCityID;
                  const entertainmentName = entertainment.EntertainmentCity_Name || entertainment.EntertainmentCityName;
                  return (
                    <MenuItem key={entertainmentId} value={entertainmentId}>
                      {entertainmentName}
                    </MenuItem>
                  );
                })}
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
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e5e5e5' }}>
          <Button onClick={handleCloseAddCityDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleAddCity}
            variant="contained"
            disabled={
              addCityLoading ||
              !newCity.City_Name.trim() ||
              !newCity.StateProvince_ID
            }
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
    </>
  );
};

export default CityPage;