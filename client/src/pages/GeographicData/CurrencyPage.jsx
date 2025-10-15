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
  useTheme,
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
  AttachMoney as AttachMoneyIcon,
  Add,
  Code as CodeIcon,
} from "@mui/icons-material";

import TableView from '../../components/tableFormat/TableView';
import { formatters } from '../../utils/formatters';

const CurrencyPage = ({
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
}) => {
  const theme = useTheme();

  const [addCurrencyDialogOpen, setAddCurrencyDialogOpen] = useState(false);
  const [newCurrency, setNewCurrency] = useState({
    Symbol: '',
    ISOcode: '',
    DecimalPlaces: 2,
    EnglishName: '',
    LocalName: '',
    ExchangeRate: '',
    Active: true,
    Prefix: true
  });
  const [addCurrencyLoading, setAddCurrencyLoading] = useState(false);

  const columns = [
    { field: 'Symbol', headerName: 'Symbol', defaultVisible: true },
    { field: 'ISOcode', headerName: 'ISO Code', defaultVisible: true },
    { field: 'EnglishName', headerName: 'English Name', type: 'tooltip', defaultVisible: true },
    { field: 'LocalName', headerName: 'Local Name', type: 'tooltip', defaultVisible: true },
    { field: 'ExchangeRate', headerName: 'Exchange Rate', defaultVisible: true },
    { field: 'DecimalPlaces', headerName: 'Decimal Places', defaultVisible: true },
    { field: 'Prefix', headerName: 'Prefix', defaultVisible: false },
    { field: 'LastUpdated', headerName: 'Last Updated', type: 'date', defaultVisible: false },
  ];

  const currencyFormatters = {
    ...formatters,
    Active: (value) => {
      const isActive = value === true || value === 1;
      return <Chip label={isActive ? 'Active' : 'Inactive'} size="small" sx={{ backgroundColor: isActive ? theme.palette.success.main : theme.palette.grey[500], color: theme.palette.getContrastText(isActive ? theme.palette.success.main : theme.palette.grey[500]), fontWeight: 500 }} />;
    },
    Symbol: (value) => <Chip label={value} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontWeight: 'bold', backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }} />,
    ISOcode: (value) => <Chip label={value} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontWeight: 'bold', backgroundColor: theme.palette.action.hover, color: theme.palette.primary.main }} />,
    ExchangeRate: (value) => parseFloat(value).toFixed(4),
    Prefix: (value) => {
      const isPrefix = value === true || value === 1;
      return <Chip label={isPrefix ? 'Prefix' : 'Suffix'} size="small" sx={{ backgroundColor: isPrefix ? theme.palette.success.light : theme.palette.warning.light, color: isPrefix ? theme.palette.success.dark : theme.palette.warning.dark, fontWeight: 500 }} />;
    },
    DecimalPlaces: (value) => `${value} places`,
  };

  const handleInputChange = (field, value) => setNewCurrency(prev => ({ ...prev, [field]: value }));

  const handleISOCodeChange = (e) => {
    const value = e.target.value.toUpperCase();
    if (value.length <= 3) handleInputChange('ISOcode', value);
  };

  const handleSymbolChange = (e) => {
    const value = e.target.value;
    if (value.length <= 5) handleInputChange('Symbol', value);
  };

  const handleDecimalPlacesChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 8) handleInputChange('DecimalPlaces', value);
  };

  const handleExchangeRateChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,4}$/.test(value) || value === '') handleInputChange('ExchangeRate', value);
  };

  const handleOpenAddCurrencyDialog = () => setAddCurrencyDialogOpen(true);
  const handleCloseAddCurrencyDialog = () => {
    setAddCurrencyDialogOpen(false);
    setNewCurrency({ Symbol: '', ISOcode: '', DecimalPlaces: 2, EnglishName: '', LocalName: '', ExchangeRate: '', Active: true, Prefix: true });
  };

  const handleAddCurrency = async () => {
    if (!newCurrency.Symbol.trim()) return setError && setError('Currency symbol is required');
    if (!newCurrency.ISOcode.trim()) return setError && setError('ISO code is required');
    if (newCurrency.ISOcode.length !== 3) return setError && setError('ISO code must be exactly 3 characters');
    if (!newCurrency.EnglishName.trim()) return setError && setError('English name is required');
    if (!newCurrency.ExchangeRate || parseFloat(newCurrency.ExchangeRate) <= 0) return setError && setError('Valid exchange rate is required');

    setAddCurrencyLoading(true);
    try {
      if (onCreate) {
        await onCreate({ ...newCurrency, ExchangeRate: parseFloat(newCurrency.ExchangeRate), DecimalPlaces: parseInt(newCurrency.DecimalPlaces), LocalName: newCurrency.LocalName || newCurrency.EnglishName });
        handleCloseAddCurrencyDialog();
        setSuccessMessage && setSuccessMessage('Currency added successfully');
      }
    } catch (err) {
      setError && setError('Failed to add currency');
    } finally {
      setAddCurrencyLoading(false);
    }
  };

  return (
    <>
      {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ m: 2 }} onClose={() => setSuccessMessage && setSuccessMessage("")}>{successMessage}</Alert>}

      {/* Toolbar */}
      <Toolbar sx={{ backgroundColor: theme.palette.background.paper, borderBottom: `1px solid ${theme.palette.divider}`, justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
          <Typography variant="h6" component="div" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>Currencies</Typography>
          {selected.length > 0 && <Chip label={`${selected.length} selected`} size="small" sx={{ backgroundColor: theme.palette.action.selected, color: theme.palette.text.primary }} />}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenAddCurrencyDialog} disabled={loading} sx={{ backgroundColor: theme.palette.text.primary, color: theme.palette.getContrastText(theme.palette.text.primary), "&:hover": { backgroundColor: theme.palette.grey[800] } }}>Add Currency</Button>
          {selected.length > 0 && <Button variant="outlined" color="warning" onClick={onBulkDeactivate}>Deactivate Selected</Button>}
        </Box>
      </Toolbar>

      {/* Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={8}><CircularProgress /></Box>
      ) : (
        <TableView
          data={currencies}
          columns={columns}
          idField="CurrencyID"
          selected={selected}
          onSelectClick={onSelectClick}
          onSelectAllClick={onSelectAllClick}
          showSelection
          formatters={currencyFormatters}
          entityType="currency"
          showActions={false}
        />
      )}

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.default, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Showing {currencies.length} currencies</Typography>
        {selected.length > 0 && <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>{selected.length} selected</Typography>}
      </Box>

      {/* Add Currency Dialog */}
      <Dialog open={addCurrencyDialogOpen} onClose={handleCloseAddCurrencyDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoneyIcon sx={{ color: theme.palette.primary.main }} /> Add New Currency
          </Box>
          <IconButton onClick={handleCloseAddCurrencyDialog} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            {/* Left Column */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField label="Currency Symbol" value={newCurrency.Symbol} onChange={handleSymbolChange} fullWidth required variant="outlined" helperText="Enter currency symbol (e.g., $, €, £)" inputProps={{ maxLength: 5 }} InputProps={{ startAdornment: <AttachMoneyIcon sx={{ mr: 1, color: theme.palette.text.secondary }} /> }} />
              <TextField label="ISO Code" value={newCurrency.ISOcode} onChange={handleISOCodeChange} fullWidth required variant="outlined" helperText="3-letter ISO 4217 code (e.g., USD, EUR, ZAR)" inputProps={{ maxLength: 3 }} InputProps={{ startAdornment: <CodeIcon sx={{ mr: 1, color: theme.palette.text.secondary }} /> }} />
              <TextField label="English Name" value={newCurrency.EnglishName} onChange={(e) => handleInputChange('EnglishName', e.target.value)} fullWidth required variant="outlined" helperText="English name of the currency" inputProps={{ maxLength: 100 }} />
              <TextField label="Local Name" value={newCurrency.LocalName} onChange={(e) => handleInputChange('LocalName', e.target.value)} fullWidth variant="outlined" helperText="Local language name (optional)" inputProps={{ maxLength: 100 }} />
            </Box>
            {/* Right Column */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField label="Exchange Rate" value={newCurrency.ExchangeRate} onChange={handleExchangeRateChange} fullWidth required variant="outlined" helperText="Exchange rate relative to base currency" type="text" />
              <FormControl fullWidth>
                <InputLabel>Decimal Places</InputLabel>
                <Select value={newCurrency.DecimalPlaces} onChange={handleDecimalPlacesChange} label="Decimal Places">
                  {[...Array(9).keys()].map((places) => <MenuItem key={places} value={places}>{places} decimal places</MenuItem>)}
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel control={<Switch checked={newCurrency.Prefix} onChange={(e) => handleInputChange('Prefix', e.target.checked)} color="primary" />} label="Symbol is Prefix" />
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: -1 }}>If checked, symbol appears before amount ($100). If unchecked, symbol appears after amount (100$)</Typography>
                <FormControlLabel control={<Switch checked={newCurrency.Active} onChange={(e) => handleInputChange('Active', e.target.checked)} color="primary" />} label="Active" />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={handleCloseAddCurrencyDialog} color="inherit">Cancel</Button>
          <Button onClick={handleAddCurrency} variant="contained" disabled={addCurrencyLoading || !newCurrency.Symbol.trim() || !newCurrency.ISOcode.trim() || newCurrency.ISOcode.length !== 3 || !newCurrency.EnglishName.trim() || !newCurrency.ExchangeRate || parseFloat(newCurrency.ExchangeRate) <= 0}>
            {addCurrencyLoading ? <CircularProgress size={20} /> : 'Add Currency'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Snackbar */}
      <Snackbar open={!!statusMessage} autoHideDuration={4000} onClose={() => setStatusMessage && setStatusMessage('')} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setStatusMessage && setStatusMessage('')} severity={statusSeverity} sx={{ width: '100%' }}>
          {statusMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CurrencyPage;
