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
  Tabs,
  Tab,
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
  Public as PublicIcon,
  Language as LanguageIcon,
  Add,
} from "@mui/icons-material";

import { ThemeProvider } from "@mui/material/styles";
import TableView from '../../components/tableFormat/TableView';
import theme from "../../components/Theme";
import { formatters } from '../../utils/formatters';
import StateProvincePage from './StateProvincePage';
import CityPage from './CityPage';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`geography-tabpanel-${index}`}
      aria-labelledby={`geography-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

const CountryPage = ({
  // Country props
  countries = [],
  currencies = [],
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
  selectedCountry,
  popupLoading,
  popupError,
  handleSaveNote,
  handleDeleteNote,
  handleEditNote,
  handleUploadAttachment,
  handleDeleteAttachment,
  handleDownloadAttachment,

  // City props (pass through to CityPage)
  cityProps = {},

  // State/Province props (pass through to StateProvincePage)
  stateProvinceProps = {},

  // Tab management
  currentTab = 0,
  onTabChange,
}) => {
  // Add Country Dialog State
  const [addCountryDialogOpen, setAddCountryDialogOpen] = useState(false);
  const [newCountry, setNewCountry] = useState({
    CountryName: '',
    CountryCode: '',
    CurrencyID: '',
    Active: true
  });
  const [addCountryLoading, setAddCountryLoading] = useState(false);

  // Define available tabs
  const availableTabs = [
    {
      id: 'countries',
      label: 'Countries',
      component: 'countries'
    },
    {
      id: 'states-provinces',
      label: 'States/Provinces',
      component: 'statesProvinces'
    },
    {
      id: 'cities',
      label: 'Cities',
      component: 'cities'
    },
  ];

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    if (onTabChange) {
      onTabChange(newValue);
    }
  };

  const columns = [
    { field: 'CountryName', headerName: 'Country Name', type: 'tooltip', defaultVisible: true },
    { field: 'CountryCode', headerName: 'Country Code', defaultVisible: true },
    { field: 'CurrencyName', headerName: 'Currency', defaultVisible: true },
    { field: 'CreatedAt', headerName: 'Created', type: 'dateTime', defaultVisible: true },
    { field: 'UpdatedAt', headerName: 'Updated', type: 'dateTime', defaultVisible: false },
    {
      field: 'Active',
      headerName: 'Status',
      type: 'chip',
      chipLabels: { true: 'Active', false: 'Inactive', 1: 'Active', 0: 'Inactive' },
      chipColors: { true: '#079141ff', false: '#999999', 1: '#079141ff', 0: '#999999' },
      defaultVisible: true,
    },
  ];

  // Enhanced menu items for countries
  const getMenuItems = (country) => {
    const baseItems = [
      {
        label: 'View Details',
        icon: <InfoIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onView && onView(country),
        show: !!onView,
      },
      {
        label: 'Edit',
        icon: <EditIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onEdit && onEdit(country),
        show: !!onEdit,
      },
      {
        label: 'Add Notes',
        icon: <NoteIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onAddNote && onAddNote(country),
        show: !!onAddNote,
      },
      {
        label: 'Add Attachments',
        icon: <AttachFileIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onAddAttachment && onAddAttachment(country),
        show: !!onAddAttachment,
      },
    ];

    // Add reactivate/deactivate based on current status
    const isActive = country.Active === true || country.Active === 1;
    if (isActive) {
      baseItems.push({
        label: 'Deactivate',
        icon: <PowerOffIcon sx={{ mr: 1, color: '#ff9800' }} />,
        onClick: () => onDeactivate && onDeactivate(country.CountryID),
        show: !!onDeactivate,
      });
    } else {
      baseItems.push({
        label: 'Reactivate',
        icon: <PowerIcon sx={{ mr: 1, color: '#4caf50' }} />,
        onClick: () => onReactivate && onReactivate(country.CountryID),
        show: !!onReactivate,
      });
    }

    // Add delete option
    baseItems.push({
      label: 'Delete',
      icon: <DeleteIcon sx={{ mr: 1, color: '#f44336' }} />,
      onClick: () => onDelete && onDelete(country.CountryID),
      show: !!onDelete,
    });

    return baseItems;
  };

  // Custom formatters for country-specific fields
  const countryFormatters = {
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
    CountryCode: (value) => {
      return (
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
      );
    },
    CurrencyName: (value) => {
      return value || 'No Currency';
    }
  };

  // Handle Add Country Dialog
  const handleOpenAddCountryDialog = () => {
    setAddCountryDialogOpen(true);
    setNewCountry({
      CountryName: '',
      CountryCode: '',
      CurrencyID: '',
      Active: true
    });
  };

  const handleCloseAddCountryDialog = () => {
    setAddCountryDialogOpen(false);
    setNewCountry({
      CountryName: '',
      CountryCode: '',
      CurrencyID: '',
      Active: true
    });
  };

  const handleAddCountry = async () => {
    if (!newCountry.CountryName.trim()) {
      setError && setError('Country name is required');
      return;
    }

    if (!newCountry.CountryCode.trim()) {
      setError && setError('Country code is required');
      return;
    }

    if (newCountry.CountryCode.length > 5) {
      setError && setError('Country code must be 5 characters or less');
      return;
    }

    setAddCountryLoading(true);
    try {
      if (onCreate) {
        const countryData = {
          ...newCountry,
          CurrencyID: newCountry.CurrencyID !== '' ? parseInt(newCountry.CurrencyID) : null
        };
        await onCreate(countryData);
        handleCloseAddCountryDialog();
        setSuccessMessage && setSuccessMessage('Country added successfully');
      }
    } catch (error) {
      setError && setError('Failed to add country');
    } finally {
      setAddCountryLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewCountry(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCountryCodeChange = (e) => {
    const value = e.target.value.toUpperCase();
    if (value.length <= 5) {
      handleInputChange('CountryCode', value);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: "100%",
          backgroundColor: "#fafafa",
          minHeight: "100vh",
          p: 3,
        }}
      >
        {/* Main Paper Container */}
        <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
          {/* Tabs Header */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              sx={{
                backgroundColor: '#fff',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  minHeight: 56,
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#050505',
                }
              }}
            >
              {availableTabs.map((tab, index) => (
                <Tab
                  key={tab.id}
                  label={tab.label}
                  sx={{
                    color: currentTab === index ? '#050505' : '#666666',
                    '&.Mui-selected': {
                      color: '#050505',
                      fontWeight: 600,
                    }
                  }}
                />
              ))}
            </Tabs>
          </Box>

          {/* Tab Content */}
          {availableTabs.map((tab, index) => (
            <TabPanel key={tab.id} value={currentTab} index={index}>

              {/* Countries Tab Content */}
              {tab.component === 'countries' && (
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

                  {/* Countries Toolbar */}
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
                        Countries
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
                        onClick={handleOpenAddCountryDialog}
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
                        Add Country
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

                  {/* Countries Table */}
                  {loading ? (
                    <Box display="flex" justifyContent="center" p={8}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <TableView
                      data={countries}
                      columns={columns}
                      idField="CountryID"
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
                      formatters={countryFormatters}
                      entityType="country"
                      getMenuItems={getMenuItems}
                    />
                  )}

                  {/* Countries Results Footer */}
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
                      Showing {countries.length} countries
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
                </>
              )}

              {/* States/Provinces Tab Content */}
              {tab.component === 'statesProvinces' && (
                <StateProvincePage {...stateProvinceProps} />
              )}

              {/* Cities Tab Content */}
              {tab.component === 'cities' && (
                <CityPage {...cityProps} />
              )}

            </TabPanel>
          ))}
        </Paper>

        {/* Add Country Dialog */}
        <Dialog
          open={addCountryDialogOpen}
          onClose={handleCloseAddCountryDialog}
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
              <PublicIcon sx={{ color: '#1976d2' }} />
              Add New Country
            </Box>
            <IconButton onClick={handleCloseAddCountryDialog} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Country Name"
                value={newCountry.CountryName}
                onChange={(e) => handleInputChange('CountryName', e.target.value)}
                fullWidth
                required
                variant="outlined"
                helperText="Enter the full country name"
                inputProps={{ maxLength: 100 }}
              />

              <TextField
                label="Country Code"
                value={newCountry.CountryCode}
                onChange={handleCountryCodeChange}
                fullWidth
                required
                variant="outlined"
                helperText="Enter ISO Alpha-2/3 country code (e.g., US, USA, ZA)"
                inputProps={{ maxLength: 5 }}
                InputProps={{
                  startAdornment: <LanguageIcon sx={{ mr: 1, color: '#666' }} />,
                }}
              />

              <FormControl fullWidth>
                <InputLabel>Currency (Optional)</InputLabel>
                <Select
                  value={newCountry.CurrencyID}
                  onChange={(e) => handleInputChange('CurrencyID', e.target.value)}
                  label="Currency (Optional)"
                >
                  <MenuItem value="">
                    <em>No Currency</em>
                  </MenuItem>
                  {currencies.map((currency) => (
                    <MenuItem key={currency.CurrencyID} value={currency.CurrencyID}>
                      {currency.CurrencyName} ({currency.CurrencyCode})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={newCountry.Active}
                    onChange={(e) => handleInputChange('Active', e.target.checked)}
                    color="primary"
                  />
                }
                label="Active"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, borderTop: '1px solid #e5e5e5' }}>
            <Button onClick={handleCloseAddCountryDialog} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleAddCountry}
              variant="contained"
              disabled={
                addCountryLoading ||
                !newCountry.CountryName.trim() ||
                !newCountry.CountryCode.trim() ||
                newCountry.CountryCode.length > 5
              }
            >
              {addCountryLoading ? <CircularProgress size={20} /> : 'Add Country'}
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

export default CountryPage;