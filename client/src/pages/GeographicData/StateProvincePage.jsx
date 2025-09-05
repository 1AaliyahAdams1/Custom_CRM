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

const StateProvincePage = ({
  statesProvinces = [],
  countries = [],
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
  selectedStateProvince,
}) => {
  // Add State/Province Dialog State
  const [addStateProvinceDialogOpen, setAddStateProvinceDialogOpen] = useState(false);
  const [newStateProvince, setNewStateProvince] = useState({
    StateProvince_Name: '',
    StateProvince_Code: '',
    Country_ID: '',
    Active: true
  });
  const [addStateProvinceLoading, setAddStateProvinceLoading] = useState(false);

  // Create a map of country IDs to country names for quick lookup
  const countryMap = React.useMemo(() => {
    const map = {};
    countries.forEach(country => {
      // Handle both naming conventions
      const countryId = country.Country_ID || country.CountryID;
      const countryName = country.Country_Name || country.CountryName;
      if (countryId) {
        map[countryId] = countryName;
      }
    });
    return map;
  }, [countries]);

  // Enhanced states/provinces data with country names
  const enhancedStatesProvinces = React.useMemo(() => {
    return statesProvinces.map(stateProvince => ({
      ...stateProvince,
      Country_Name: countryMap[stateProvince.Country_ID || stateProvince.CountryID] || 'N/A'
    }));
  }, [statesProvinces, countryMap]);

  const columns = [
    { field: 'StateProvince_Name', headerName: 'State/Province Name', type: 'tooltip', defaultVisible: true },
    { field: 'Country_Name', headerName: 'Country', defaultVisible: true },
  ];

  // Enhanced menu items for states/provinces
  const getMenuItems = (stateProvince) => {
    const stateProvinceId = stateProvince.StateProvince_ID || stateProvince.StateProvinceID;
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
    const isActive = stateProvince.Active === true || stateProvince.Active === 1;
    if (isActive) {
      baseItems.push({
        label: 'Deactivate',
        icon: <PowerOffIcon sx={{ mr: 1, color: '#ff9800' }} />,
        onClick: () => onDeactivate && onDeactivate(stateProvinceId),
        show: !!onDeactivate,
      });
    } else {
      baseItems.push({
        label: 'Reactivate',
        icon: <PowerIcon sx={{ mr: 1, color: '#4caf50' }} />,
        onClick: () => onReactivate && onReactivate(stateProvinceId),
        show: !!onReactivate,
      });
    }

    // Add delete option
    baseItems.push({
      label: 'Delete',
      icon: <DeleteIcon sx={{ mr: 1, color: '#f44336' }} />,
      onClick: () => onDelete && onDelete(stateProvinceId),
      show: !!onDelete,
    });

    return baseItems;
  };

  // Custom formatters for state/province-specific fields
  const stateProvinceFormatters = {
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
    StateProvince_Code: (value) => {
      return value ? (
        <Chip
          label={value}
          size="small"
          variant="outlined"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 'bold',
            backgroundColor: '#f5f5f5',
          }}
        />
      ) : '-';
    },
    Country_Name: (value) => {
      return value || 'N/A';
    }
  };

  // Handle Add State/Province Dialog
  const handleOpenAddStateProvinceDialog = () => {
    setAddStateProvinceDialogOpen(true);
    setNewStateProvince({
      StateProvince_Name: '',
      StateProvince_Code: '',
      Country_ID: '',
      Active: true
    });
  };

  const handleCloseAddStateProvinceDialog = () => {
    setAddStateProvinceDialogOpen(false);
    setNewStateProvince({
      StateProvince_Name: '',
      StateProvince_Code: '',
      Country_ID: '',
      Active: true
    });
  };

  const handleAddStateProvince = async () => {
    if (!newStateProvince.StateProvince_Name.trim()) {
      setError && setError('State/Province name is required');
      return;
    }

    if (!newStateProvince.Country_ID) {
      setError && setError('Country is required');
      return;
    }

    setAddStateProvinceLoading(true);
    try {
      if (onCreate) {
        const stateProvinceData = {
          ...newStateProvince,
          Country_ID: parseInt(newStateProvince.Country_ID)
        };
        await onCreate(stateProvinceData);
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

  const handleStateProvinceCodeChange = (e) => {
    const value = e.target.value.toUpperCase();
    if (value.length <= 10) {
      handleInputChange('StateProvince_Code', value);
    }
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

      {/* States/Provinces Toolbar */}
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
            States/Provinces
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
            onClick={handleOpenAddStateProvinceDialog}
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

      {/* States/Provinces Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={8}>
          <CircularProgress />
        </Box>
      ) : (
        <TableView
          data={enhancedStatesProvinces}
          columns={columns}
          idField="StateProvince_ID"
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
          Showing {enhancedStatesProvinces.length} states/provinces
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationCityIcon sx={{ color: '#1976d2' }} />
            Add New State/Province
          </Box>
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
              helperText="Enter the full state or province name"
              inputProps={{ maxLength: 100 }}
            />

            <TextField
              label="State/Province Code"
              value={newStateProvince.StateProvince_Code}
              onChange={handleStateProvinceCodeChange}
              fullWidth
              variant="outlined"
              helperText="Enter state/province code (e.g., CA, ON, NSW)"
              inputProps={{ maxLength: 10 }}
            />

            <FormControl fullWidth required>
              <InputLabel>Country</InputLabel>
              <Select
                value={newStateProvince.Country_ID}
                onChange={(e) => handleInputChange('Country_ID', e.target.value)}
                label="Country"
              >
                <MenuItem value="">
                  <em>Select a country</em>
                </MenuItem>
                {countries.map((country) => {
                  const countryId = country.Country_ID || country.CountryID;
                  const countryName = country.Country_Name || country.CountryName;
                  const countryCode = country.Country_Code || country.CountryCode;
                  return (
                    <MenuItem key={countryId} value={countryId}>
                      {countryName} ({countryCode})
                    </MenuItem>
                  );
                })}
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
            disabled={
              addStateProvinceLoading ||
              !newStateProvince.StateProvince_Name.trim() ||
              !newStateProvince.Country_ID
            }
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
    </>
  );
};

export default StateProvincePage;