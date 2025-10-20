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
    ISOCode: '',
    DecimalPlaces: 2,
    EnglishName: '',
    LocalName: '',
    ExchangeRate: '',
    Active: true,
    Prefix: true
  });
  const [addCurrencyLoading, setAddCurrencyLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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

  // Validation rules
  const validateField = (name, value) => {
    const fieldErrors = {};

    switch (name) {
      case 'Symbol':
        if (!value.trim()) {
          fieldErrors.Symbol = 'Currency symbol is required';
        } else if (value.trim().length > 5) {
          fieldErrors.Symbol = 'Symbol must be 5 characters or less';
        }
        break;
      
      case 'ISOCode':
        if (!value.trim()) {
          fieldErrors.ISOCode = 'ISO code is required';
        } else if (!/^[A-Z]{3}$/.test(value.trim())) {
          fieldErrors.ISOCode = 'ISO code must be exactly 3 uppercase letters (e.g., USD, GBP, PKR)';
        }
        break;

      case 'EnglishName':
        if (!value.trim()) {
          fieldErrors.EnglishName = 'English name is required';
        } else if (value.trim().length < 2) {
          fieldErrors.EnglishName = 'English name must be at least 2 characters';
        } else if (value.trim().length > 100) {
          fieldErrors.EnglishName = 'English name must be 100 characters or less';
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          fieldErrors.EnglishName = 'English name can only contain letters and spaces';
        }
        break;

      case 'LocalName':
        if (value.trim() && value.trim().length < 2) {
          fieldErrors.LocalName = 'Local name must be at least 2 characters';
        } else if (value.trim().length > 100) {
          fieldErrors.LocalName = 'Local name must be 100 characters or less';
        }
        break;

      case 'DecimalPlaces':
        const decimalValue = parseInt(value);
        if (isNaN(decimalValue) || decimalValue < 0 || decimalValue > 4) {
          fieldErrors.DecimalPlaces = 'Decimal places must be between 0 and 4';
        }
        break;

      case 'ExchangeRate':
        if (!value || value === '') {
          fieldErrors.ExchangeRate = 'Exchange rate is required';
        } else {
          const rateValue = parseFloat(value);
          if (isNaN(rateValue) || rateValue <= 0) {
            fieldErrors.ExchangeRate = 'Exchange rate must be a positive number';
          }
        }
        break;
      
      default:
        break;
    }

    return fieldErrors;
  };

  const handleInputChange = (field, value) => {
    setNewCurrency(prev => ({ ...prev, [field]: value }));

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

  const handleISOCodeChange = (e) => {
    const value = e.target.value.toUpperCase();
    if (value.length <= 3) handleInputChange('ISOCode', value);
  };

  const handleSymbolChange = (e) => {
    const value = e.target.value;
    if (value.length <= 5) handleInputChange('Symbol', value);
  };

  const handleDecimalPlacesChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 4) handleInputChange('DecimalPlaces', value);
  };

  const handleExchangeRateChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,4}$/.test(value) || value === '') handleInputChange('ExchangeRate', value);
  };

  const handleOpenAddCurrencyDialog = () => {
    setAddCurrencyDialogOpen(true);
    setNewCurrency({ Symbol: '', ISOCode: '', DecimalPlaces: 2, EnglishName: '', LocalName: '', ExchangeRate: '', Active: true, Prefix: true });
    setErrors({});
    setTouched({});
  };

  const handleCloseAddCurrencyDialog = () => {
    setAddCurrencyDialogOpen(false);
    setNewCurrency({ Symbol: '', ISOCode: '', DecimalPlaces: 2, EnglishName: '', LocalName: '', ExchangeRate: '', Active: true, Prefix: true });
    setErrors({});
    setTouched({});
  };

  const handleAddCurrency = async () => {
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(newCurrency).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate all fields
    const allErrors = {};
    Object.keys(newCurrency).forEach(key => {
      const fieldErrors = validateField(key, newCurrency[key]);
      Object.assign(allErrors, fieldErrors);
    });

    setErrors(allErrors);

    if (Object.keys(allErrors).length > 0) {
      setError && setError('Please fix the errors below before submitting');
      return;
    }

    setAddCurrencyLoading(true);
    try {
      if (onCreate) {
        await onCreate({ 
          ...newCurrency, 
          ExchangeRate: parseFloat(newCurrency.ExchangeRate), 
          DecimalPlaces: parseInt(newCurrency.DecimalPlaces), 
          LocalName: newCurrency.LocalName || newCurrency.EnglishName 
        });
        handleCloseAddCurrencyDialog();
        setSuccessMessage && setSuccessMessage('Currency added successfully');
      }
    } catch (err) {
      setError && setError('Failed to add currency');
    } finally {
      setAddCurrencyLoading(false);
    }
  };

  // Check if form is valid for submit button
  const isFormValid = () => {
    const requiredFields = ['Symbol', 'ISOCode', 'EnglishName', 'ExchangeRate'];
    const hasRequiredFields = requiredFields.every(field => {
      const value = newCurrency[field];
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
              <TextField 
                label="Currency Symbol" 
                value={newCurrency.Symbol} 
                onChange={handleSymbolChange} 
                fullWidth 
                required 
                variant="outlined" 
                helperText="Enter currency symbol (e.g., $, €, £)" 
                inputProps={{ maxLength: 5 }} 
                InputProps={{ startAdornment: <AttachMoneyIcon sx={{ mr: 1, color: theme.palette.text.secondary }} /> }}
                {...getFieldProps('Symbol')}
              />
              <TextField 
                label="ISO Code" 
                value={newCurrency.ISOCode} 
                onChange={handleISOCodeChange} 
                fullWidth 
                required 
                variant="outlined" 
                helperText="3-letter ISO 4217 code (e.g., USD, EUR, ZAR)" 
                inputProps={{ maxLength: 3 }} 
                InputProps={{ startAdornment: <CodeIcon sx={{ mr: 1, color: theme.palette.text.secondary }} /> }}
                {...getFieldProps('ISOCode')}
              />
              <TextField 
                label="English Name" 
                value={newCurrency.EnglishName} 
                onChange={(e) => handleInputChange('EnglishName', e.target.value)} 
                fullWidth 
                required 
                variant="outlined" 
                helperText="English name of the currency" 
                inputProps={{ maxLength: 100 }}
                {...getFieldProps('EnglishName')}
              />
              <TextField 
                label="Local Name" 
                value={newCurrency.LocalName} 
                onChange={(e) => handleInputChange('LocalName', e.target.value)} 
                fullWidth 
                variant="outlined" 
                helperText="Local language name (optional)" 
                inputProps={{ maxLength: 100 }}
                {...getFieldProps('LocalName')}
              />
            </Box>
            {/* Right Column */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField 
                label="Exchange Rate" 
                value={newCurrency.ExchangeRate} 
                onChange={handleExchangeRateChange} 
                fullWidth 
                required 
                variant="outlined" 
                helperText="Exchange rate relative to base currency" 
                type="number"
                step="0.0001"
                inputProps={{ min: 0 }}
                {...getFieldProps('ExchangeRate')}
              />
              <FormControl fullWidth {...getFieldProps('DecimalPlaces')}>
                <InputLabel>Decimal Places</InputLabel>
                <Select value={newCurrency.DecimalPlaces} onChange={handleDecimalPlacesChange} label="Decimal Places">
                  {[...Array(5).keys()].map((places) => <MenuItem key={places} value={places}>{places} decimal places</MenuItem>)}
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
          <Button onClick={handleAddCurrency} variant="contained" disabled={addCurrencyLoading || !isFormValid()}>
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
