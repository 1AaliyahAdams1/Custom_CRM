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
import { useTheme } from "@mui/material/styles";
import TableView from '../../components/tableFormat/TableView';
import { formatters } from '../../utils/formatters';
import CityPage from './CityPage';
import CurrencyPage from "./CurrencyPage";

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
  cityProps = {},
  currencyProps = {},
  currentTab = 0,
  onTabChange,
}) => {
  const theme = useTheme(); // ✅ Theme hook

  const [addCountryDialogOpen, setAddCountryDialogOpen] = useState(false);
  const [newCountry, setNewCountry] = useState({
    CountryName: '',
    CountryCode: '',
    CurrencyID: '',
    Active: true
  });
  const [addCountryLoading, setAddCountryLoading] = useState(false);

  const getCountryId = (country) => country.EFMCountryID || country.CountryID;
  const getCurrencyId = (country) => country.EFMCurrencyID || country.CurrencyID;

  const currencyMap = React.useMemo(() => {
    const map = {};
    currencies.forEach(currency => {
      const currencyId = currency.EFMCurrencyID || currency.CurrencyID;
      if (currencyId) {
        map[currencyId] = {
          name: currency.CurrencyName,
          code: currency.CurrencyCode
        };
      }
    });
    return map;
  }, [currencies]);

  const enhancedCountries = React.useMemo(() => {
    return countries.map(country => {
      const currencyId = getCurrencyId(country);
      const currencyInfo = currencyMap[currencyId];
      return {
        ...country,
        CountryID: getCountryId(country),
        CountryName: country.CountryName,
        CountryCode: country.CountryCode,
        CurrencyID: currencyId,
        CurrencyName: currencyInfo?.name || 'No Currency',
        CurrencyCode: currencyInfo?.code || null
      };
    });
  }, [countries, currencyMap]);

  const availableTabs = [
    { id: 'countries', label: 'Countries', component: 'countries' },
    { id: 'cities', label: 'Cities', component: 'cities' },
    { id: 'currencies', label: 'Currencies', component: 'currencies' },
  ];

  const handleTabChange = (event, newValue) => {
    if (onTabChange) onTabChange(newValue);
  };

  const columns = [
    { field: 'CountryName', headerName: 'Country Name', type: 'tooltip', defaultVisible: true },
    { field: 'CountryCode', headerName: 'Country Code', defaultVisible: true },
    { field: 'CurrencyName', headerName: 'Currency', defaultVisible: true },
    { field: 'Active', headerName: 'Status', defaultVisible: true },
  ];

  const getMenuItems = (country) => {
    const countryId = getCountryId(country);
    const isActive = country.Active === true || country.Active === 1;
    const baseItems = [
      { label: 'View Details', icon: <InfoIcon sx={{ mr: 1, color: theme.palette.text.primary }} />, onClick: () => onView && onView(country), show: !!onView },
      { label: 'Edit', icon: <EditIcon sx={{ mr: 1, color: theme.palette.text.primary }} />, onClick: () => onEdit && onEdit(country), show: !!onEdit },
      { label: 'Add Notes', icon: <NoteIcon sx={{ mr: 1, color: theme.palette.text.primary }} />, onClick: () => onAddNote && onAddNote(country), show: !!onAddNote },
      { label: 'Add Attachments', icon: <AttachFileIcon sx={{ mr: 1, color: theme.palette.text.primary }} />, onClick: () => onAddAttachment && onAddAttachment(country), show: !!onAddAttachment },
    ];
    if (isActive) baseItems.push({ label: 'Deactivate', icon: <PowerOffIcon sx={{ mr: 1, color: theme.palette.warning.main }} />, onClick: () => onDeactivate && onDeactivate(countryId), show: !!onDeactivate });
    else baseItems.push({ label: 'Reactivate', icon: <PowerIcon sx={{ mr: 1, color: theme.palette.success.main }} />, onClick: () => onReactivate && onReactivate(countryId), show: !!onReactivate });
    baseItems.push({ label: 'Delete', icon: <DeleteIcon sx={{ mr: 1, color: theme.palette.error.main }} />, onClick: () => onDelete && onDelete(countryId), show: !!onDelete });
    return baseItems;
  };

  const countryFormatters = {
    ...formatters,
    Active: (value) => {
      const isActive = value === true || value === 1;
      return <Chip label={isActive ? 'Active' : 'Inactive'} size="small" sx={{ backgroundColor: isActive ? theme.palette.success.main : theme.palette.grey[500], color: theme.palette.common.white, fontWeight: 500 }} />;
    },
    CountryCode: (value) => <Chip label={value} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontWeight: 'bold', backgroundColor: theme.palette.background.paper }} />,
    CurrencyName: (value, row) => {
      if (!value || value === 'No Currency') return <Typography variant="body2" sx={{ color: theme.palette.grey[500], fontStyle: 'italic' }}>No Currency</Typography>;
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">{value}</Typography>
          {row?.CurrencyCode && <Chip label={row.CurrencyCode} size="small" sx={{ fontSize: '0.75rem', height: '20px', backgroundColor: theme.palette.info.light, color: theme.palette.info.dark, fontWeight: 'bold' }} />}
        </Box>
      );
    }
  };

  const handleOpenAddCountryDialog = () => {
    setAddCountryDialogOpen(true);
    setNewCountry({ CountryName: '', CountryCode: '', CurrencyID: '', Active: true });
  };

  const handleCloseAddCountryDialog = () => {
    setAddCountryDialogOpen(false);
    setNewCountry({ CountryName: '', CountryCode: '', CurrencyID: '', Active: true });
  };

  const handleAddCountry = async () => {
    if (!newCountry.CountryName.trim()) return setError && setError('Country name is required');
    if (!newCountry.CountryCode.trim()) return setError && setError('Country code is required');
    if (newCountry.CountryCode.length > 5) return setError && setError('Country code must be 5 characters or less');

    setAddCountryLoading(true);
    try {
      if (onCreate) {
        const countryData = { ...newCountry, CurrencyID: newCountry.CurrencyID !== '' ? parseInt(newCountry.CurrencyID) : null };
        await onCreate(countryData);
        handleCloseAddCountryDialog();
        setSuccessMessage && setSuccessMessage('Country added successfully');
      }
    } catch {
      setError && setError('Failed to add country');
    } finally {
      setAddCountryLoading(false);
    }
  };

  const handleInputChange = (field, value) => setNewCountry(prev => ({ ...prev, [field]: value }));
  const handleCountryCodeChange = (e) => { const value = e.target.value.toUpperCase(); if (value.length <= 5) handleInputChange('CountryCode', value); };

  return (
    <Box sx={{ width: "100%", backgroundColor: theme.palette.background.default, minHeight: "100vh", p: 3 }}>
      <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: theme.palette.divider }}>
          <Tabs value={currentTab} onChange={handleTabChange} sx={{ backgroundColor: theme.palette.background.paper }}>
            {availableTabs.map((tab, index) => (
              <Tab
                key={tab.id}
                label={tab.label}
                sx={{
                  color: currentTab === index ? theme.palette.text.primary : theme.palette.text.secondary,
                  '&.Mui-selected': { color: theme.palette.text.primary, fontWeight: 600 },
                  textTransform: 'none',
                  fontSize: '1rem',
                  minHeight: 56
                }}
              />
            ))}
          </Tabs>
        </Box>

        {availableTabs.map((tab, index) => (
          <TabPanel key={tab.id} value={currentTab} index={index}>
            {tab.component === 'countries' && (
              <>
                {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
                {successMessage && <Alert severity="success" sx={{ m: 2 }} onClose={() => setSuccessMessage && setSuccessMessage("")}>{successMessage}</Alert>}

                <Toolbar sx={{ backgroundColor: theme.palette.background.paper, borderBottom: `1px solid ${theme.palette.divider}`, justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, py: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>Countries</Typography>
                    {selected.length > 0 && <Chip label={`${selected.length} selected`} size="small" sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#333' : "#e0e0e0", color: theme.palette.text.primary }} />}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Button variant="contained" startIcon={<Add />} onClick={handleOpenAddCountryDialog} disabled={loading} sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText, "&:hover": { backgroundColor: theme.palette.primary.dark } }}>Add Country</Button>
                    {selected.length > 0 && <Button variant="outlined" color="warning" onClick={onBulkDeactivate}>Deactivate Selected</Button>}
                  </Box>
                </Toolbar>

                {loading ? (
                  <Box display="flex" justifyContent="center" p={8}><CircularProgress /></Box>
                ) : (
                  <TableView
                    data={enhancedCountries}
                    columns={columns}
                    idField="CountryID"
                    selected={selected}
                    onSelectClick={onSelectClick}
                    onSelectAllClick={onSelectAllClick}
                    showSelection
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

                <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.default, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Showing {enhancedCountries.length} countries</Typography>
                  {selected.length > 0 && <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>{selected.length} selected</Typography>}
                </Box>
              </>
            )}

            {tab.component === 'cities' && <CityPage {...cityProps} />}
            {tab.component === 'currencies' && <CurrencyPage {...currencyProps} />}
          </TabPanel>
        ))}
      </Paper>

      <Dialog open={addCountryDialogOpen} onClose={handleCloseAddCountryDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><PublicIcon color="primary" />Add New Country</Box>
          <IconButton onClick={handleCloseAddCountryDialog} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField label="Country Name" value={newCountry.CountryName} onChange={(e) => handleInputChange('CountryName', e.target.value)} fullWidth required variant="outlined" helperText="Enter the full country name" inputProps={{ maxLength: 100 }} />
            <TextField label="Country Code" value={newCountry.CountryCode} onChange={handleCountryCodeChange} fullWidth required variant="outlined" helperText="Enter ISO Alpha-2/3 country code (e.g., US, USA, ZA)" inputProps={{ maxLength: 5 }} InputProps={{ startAdornment: <LanguageIcon sx={{ mr: 1, color: theme.palette.text.secondary }} /> }} />
            <FormControl fullWidth>
              <InputLabel>Currency (Optional)</InputLabel>
              <Select value={newCountry.CurrencyID} onChange={(e) => handleInputChange('CurrencyID', e.target.value)} label="Currency (Optional)">
                <MenuItem value=""><em>No Currency</em></MenuItem>
                {currencies.map(currency => { const currencyId = currency.EFMCurrencyID || currency.CurrencyID; return <MenuItem key={currencyId} value={currencyId}>{currency.CurrencyName} ({currency.CurrencyCode})</MenuItem> })}
              </Select>
            </FormControl>
            <FormControlLabel control={<Switch checked={newCountry.Active} onChange={(e) => handleInputChange('Active', e.target.checked)} color="primary" />} label="Active" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={handleCloseAddCountryDialog} color="inherit">Cancel</Button>
          <Button onClick={handleAddCountry} variant="contained" disabled={addCountryLoading || !newCountry.CountryName.trim() || !newCountry.CountryCode.trim() || newCountry.CountryCode.length > 5}>{addCountryLoading ? <CircularProgress size={20} /> : 'Add Country'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!statusMessage} autoHideDuration={4000} onClose={() => setStatusMessage && setStatusMessage('')} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setStatusMessage && setStatusMessage('')} severity={statusSeverity} sx={{ width: '100%' }}>{statusMessage}</Alert>
      </Snackbar>
    </Box>
  );
};

export default CountryPage;
