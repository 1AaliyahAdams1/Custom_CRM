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

import TableView from "../../components/tableFormat/TableView";
import { formatters } from "../../utils/formatters";

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
<<<<<<< HEAD
    Symbol: '',
    ISOCode: '',
=======
    Symbol: "",
    ISOcode: "",
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
    DecimalPlaces: 2,
    EnglishName: "",
    LocalName: "",
    ExchangeRate: "",
    Active: true,
    Prefix: true,
  });
  const [errors, setErrors] = useState({});
  const [addCurrencyLoading, setAddCurrencyLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const columns = [
    { field: "Symbol", headerName: "Symbol", defaultVisible: true },
    { field: "ISOcode", headerName: "ISO Code", defaultVisible: true },
    { field: "EnglishName", headerName: "English Name", type: "tooltip", defaultVisible: true },
    { field: "LocalName", headerName: "Local Name", type: "tooltip", defaultVisible: true },
    { field: "ExchangeRate", headerName: "Exchange Rate", defaultVisible: true },
    { field: "DecimalPlaces", headerName: "Decimal Places", defaultVisible: true },
    { field: "Prefix", headerName: "Prefix", defaultVisible: false },
    { field: "LastUpdated", headerName: "Last Updated", type: "date", defaultVisible: false },
  ];

<<<<<<< HEAD
=======
  const getMenuItems = (currency) => {
    const currencyId = currency.CurrencyID;
    const isActive = currency.Active === true || currency.Active === 1;

    const baseItems = [
      {
        label: "View Details",
        icon: <InfoIcon sx={{ mr: 1, color: theme.palette.text.primary }} />,
        onClick: () => onView && onView(currency),
        show: !!onView,
      },
      {
        label: "Edit",
        icon: <EditIcon sx={{ mr: 1, color: theme.palette.text.primary }} />,
        onClick: () => onEdit && onEdit(currency),
        show: !!onEdit,
      },
      {
        label: "Add Notes",
        icon: <NoteIcon sx={{ mr: 1, color: theme.palette.text.primary }} />,
        onClick: () => onAddNote && onAddNote(currency),
        show: !!onAddNote,
      },
      {
        label: "Add Attachments",
        icon: <AttachFileIcon sx={{ mr: 1, color: theme.palette.text.primary }} />,
        onClick: () => onAddAttachment && onAddAttachment(currency),
        show: !!onAddAttachment,
      },
    ];

    if (isActive) {
      baseItems.push({
        label: "Deactivate",
        icon: <PowerOffIcon sx={{ mr: 1, color: theme.palette.warning.main }} />,
        onClick: () => onDeactivate && onDeactivate(currencyId),
        show: !!onDeactivate,
      });
    } else {
      baseItems.push({
        label: "Reactivate",
        icon: <PowerIcon sx={{ mr: 1, color: theme.palette.success.main }} />,
        onClick: () => onReactivate && onReactivate(currencyId),
        show: !!onReactivate,
      });
    }

    baseItems.push({
      label: "Delete",
      icon: <DeleteIcon sx={{ mr: 1, color: theme.palette.error.main }} />,
      onClick: () => onDelete && onDelete(currencyId),
      show: !!onDelete,
    });

    return baseItems;
  };

>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
  const currencyFormatters = {
    ...formatters,
    Active: (value) => {
      const isActive = value === true || value === 1;
      return (
        <Chip
          label={isActive ? "Active" : "Inactive"}
          size="small"
          sx={{
            backgroundColor: isActive
              ? theme.palette.success.main
              : theme.palette.grey[500],
            color: theme.palette.getContrastText(
              isActive ? theme.palette.success.main : theme.palette.grey[500]
            ),
            fontWeight: 500,
          }}
        />
      );
    },
    Symbol: (value) => (
      <Chip
        label={value}
        size="small"
        variant="outlined"
        sx={{
          fontFamily: "monospace",
          fontWeight: "bold",
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}
      />
    ),
    ISOcode: (value) => (
      <Chip
        label={value}
        size="small"
        variant="outlined"
        sx={{
          fontFamily: "monospace",
          fontWeight: "bold",
          backgroundColor: theme.palette.action.hover,
          color: theme.palette.primary.main,
        }}
      />
    ),
    ExchangeRate: (value) => parseFloat(value).toFixed(4),
    Prefix: (value) => {
      const isPrefix = value === true || value === 1;
      return (
        <Chip
          label={isPrefix ? "Prefix" : "Suffix"}
          size="small"
          sx={{
            backgroundColor: isPrefix
              ? theme.palette.success.light
              : theme.palette.warning.light,
            color: isPrefix
              ? theme.palette.success.dark
              : theme.palette.warning.dark,
            fontWeight: 500,
          }}
        />
      );
    },
    DecimalPlaces: (value) => `${value} places`,
  };

<<<<<<< HEAD
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
=======
  const handleInputChange = (field, value) =>
    setNewCurrency((prev) => ({ ...prev, [field]: value }));

  const handleISOCodeChange = (e) => {
    const value = e.target.value.toUpperCase();
    if (value.length <= 3) handleInputChange("ISOcode", value);
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
  };

  const handleSymbolChange = (e) => {
    const value = e.target.value;
    if (value.length <= 5) handleInputChange("Symbol", value);
  };

  const handleDecimalPlacesChange = (e) => {
    const value = parseInt(e.target.value);
<<<<<<< HEAD
    if (!isNaN(value) && value >= 0 && value <= 4) handleInputChange('DecimalPlaces', value);
=======
    if (!isNaN(value) && value >= 0 && value <= 8)
      handleInputChange("DecimalPlaces", value);
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
  };

  const handleExchangeRateChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,4}$/.test(value) || value === "")
      handleInputChange("ExchangeRate", value);
  };

  const validateField = (field, value) => {
    let message = "";

    switch (field) {
      case "Symbol":
        if (!value.trim()) message = "Currency symbol is required";
        break;
      case "ISOcode":
        if (!value.trim()) message = "ISO code is required";
        else if (value.length !== 3)
          message = "ISO code must be exactly 3 letters";
        break;
      case "EnglishName":
        if (!value.trim()) message = "English name is required";
        break;
      case "ExchangeRate":
        if (!value.trim()) message = "Exchange rate is required";
        else if (isNaN(value) || parseFloat(value) <= 0)
          message = "Enter a valid positive number";
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const handleOpenAddCurrencyDialog = () => {
    setAddCurrencyDialogOpen(true);
    setNewCurrency({ Symbol: '', ISOCode: '', DecimalPlaces: 2, EnglishName: '', LocalName: '', ExchangeRate: '', Active: true, Prefix: true });
    setErrors({});
    setTouched({});
  };

  const handleCloseAddCurrencyDialog = () => {
    setAddCurrencyDialogOpen(false);
<<<<<<< HEAD
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
=======
    setNewCurrency({
      Symbol: "",
      ISOcode: "",
      DecimalPlaces: 2,
      EnglishName: "",
      LocalName: "",
      ExchangeRate: "",
      Active: true,
      Prefix: true,
    });
    setErrors({});
  };

  const handleAddCurrency = async () => {
    if (
      !newCurrency.Symbol.trim() ||
      !newCurrency.ISOcode.trim() ||
      newCurrency.ISOcode.length !== 3 ||
      !newCurrency.EnglishName.trim() ||
      !newCurrency.ExchangeRate ||
      parseFloat(newCurrency.ExchangeRate) <= 0
    ) {
      setError && setError("Please fill in all required fields correctly.");
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
      return;
    }

    setAddCurrencyLoading(true);
    try {
      if (onCreate) {
<<<<<<< HEAD
        await onCreate({ 
          ...newCurrency, 
          ExchangeRate: parseFloat(newCurrency.ExchangeRate), 
          DecimalPlaces: parseInt(newCurrency.DecimalPlaces), 
          LocalName: newCurrency.LocalName || newCurrency.EnglishName 
=======
        await onCreate({
          ...newCurrency,
          ExchangeRate: parseFloat(newCurrency.ExchangeRate),
          DecimalPlaces: parseInt(newCurrency.DecimalPlaces),
          LocalName:
            newCurrency.LocalName || newCurrency.EnglishName,
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
        });
        handleCloseAddCurrencyDialog();
        setSuccessMessage &&
          setSuccessMessage("Currency added successfully");
      }
    } catch (err) {
      setError && setError("Failed to add currency");
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
      {successMessage && (
        <Alert
          severity="success"
          sx={{ m: 2 }}
          onClose={() => setSuccessMessage && setSuccessMessage("")}
        >
          {successMessage}
        </Alert>
      )}

      {/* Toolbar */}
      <Toolbar
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          py: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{ color: theme.palette.text.primary, fontWeight: 600 }}
          >
            Currencies
          </Typography>
          {selected.length > 0 && (
            <Chip
              label={`${selected.length} selected`}
              size="small"
              sx={{
                backgroundColor: theme.palette.action.selected,
                color: theme.palette.text.primary,
              }}
            />
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenAddCurrencyDialog}
            disabled={loading}
            sx={{
              backgroundColor: theme.palette.text.primary,
              color: theme.palette.getContrastText(theme.palette.text.primary),
              "&:hover": { backgroundColor: theme.palette.grey[800] },
            }}
          >
            Add Currency
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

      {/* Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={8}>
          <CircularProgress />
        </Box>
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
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          Showing {currencies.length} currencies
        </Typography>
        {selected.length > 0 && (
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.primary, fontWeight: 500 }}
          >
            {selected.length} selected
          </Typography>
        )}
      </Box>

      {/* Add Currency Dialog */}
      <Dialog open={addCurrencyDialogOpen} onClose={handleCloseAddCurrencyDialog} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AttachMoneyIcon sx={{ color: theme.palette.primary.main }} /> Add New Currency
          </Box>
          <IconButton onClick={handleCloseAddCurrencyDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
            {/* Left Column */}
<<<<<<< HEAD
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
=======
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                label="Currency Symbol"
                value={newCurrency.Symbol}
                onChange={handleSymbolChange}
                onBlur={() => validateField("Symbol", newCurrency.Symbol)}
                error={!!errors.Symbol}
                helperText={errors.Symbol || "Enter currency symbol (e.g., $, €, £)"}
                fullWidth
                required
                variant="outlined"
                inputProps={{ maxLength: 5 }}
                InputProps={{
                  startAdornment: (
                    <AttachMoneyIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                  ),
                }}
              />

              <TextField
                label="ISO Code"
                value={newCurrency.ISOcode}
                onChange={handleISOCodeChange}
                onBlur={() => validateField("ISOcode", newCurrency.ISOcode)}
                error={!!errors.ISOcode}
                helperText={errors.ISOcode || "3-letter ISO 4217 code (e.g., USD, EUR, ZAR)"}
                fullWidth
                required
                variant="outlined"
                inputProps={{ maxLength: 3 }}
                InputProps={{
                  startAdornment: (
                    <CodeIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
                  ),
                }}
              />

              <TextField
                label="English Name"
                value={newCurrency.EnglishName}
                onChange={(e) => handleInputChange("EnglishName", e.target.value)}
                onBlur={() => validateField("EnglishName", newCurrency.EnglishName)}
                error={!!errors.EnglishName}
                helperText={errors.EnglishName || "English name of the currency"}
                fullWidth
                required
                variant="outlined"
                inputProps={{ maxLength: 100 }}
              />

              <TextField
                label="Local Name"
                value={newCurrency.LocalName}
                onChange={(e) => handleInputChange("LocalName", e.target.value)}
                fullWidth
                variant="outlined"
                helperText="Local language name (optional)"
                inputProps={{ maxLength: 100 }}
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
              />
            </Box>

            {/* Right Column */}
<<<<<<< HEAD
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
=======
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                label="Exchange Rate"
                value={newCurrency.ExchangeRate}
                onChange={handleExchangeRateChange}
                onBlur={() => validateField("ExchangeRate", newCurrency.ExchangeRate)}
                error={!!errors.ExchangeRate}
                helperText={errors.ExchangeRate || "Exchange rate relative to base currency"}
                fullWidth
                required
                variant="outlined"
                type="text"
              />

              <FormControl fullWidth>
                <InputLabel>Decimal Places</InputLabel>
                <Select
                  value={newCurrency.DecimalPlaces}
                  onChange={handleDecimalPlacesChange}
                  label="Decimal Places"
                >
                  {[...Array(9).keys()].map((places) => (
                    <MenuItem key={places} value={places}>
                      {places} decimal places
                    </MenuItem>
                  ))}
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
                </Select>
              </FormControl>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newCurrency.Prefix}
                      onChange={(e) => handleInputChange("Prefix", e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Symbol is Prefix"
                />
                <Typography
                  variant="caption"
                  sx={{ color: theme.palette.text.secondary, mt: -1 }}
                >
                  If checked, symbol appears before amount ($100). If unchecked, symbol appears
                  after amount (100$)
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={newCurrency.Active}
                      onChange={(e) => handleInputChange("Active", e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Active"
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
<<<<<<< HEAD
          <Button onClick={handleCloseAddCurrencyDialog} color="inherit">Cancel</Button>
          <Button onClick={handleAddCurrency} variant="contained" disabled={addCurrencyLoading || !isFormValid()}>
            {addCurrencyLoading ? <CircularProgress size={20} /> : 'Add Currency'}
=======
          <Button onClick={handleCloseAddCurrencyDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleAddCurrency}
            variant="contained"
            disabled={addCurrencyLoading}
            sx={{
              backgroundColor: theme.palette.text.primary,
              color: theme.palette.getContrastText(theme.palette.text.primary),
              "&:hover": { backgroundColor: theme.palette.grey[800] },
            }}
          >
            {addCurrencyLoading ? <CircularProgress size={24} /> : "Add Currency"}
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for status messages */}
      <Snackbar
        open={!!statusMessage}
        autoHideDuration={4000}
        onClose={() => setStatusMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {statusMessage && (
          <Alert
            severity={statusSeverity || "info"}
            onClose={() => setStatusMessage("")}
          >
            {statusMessage}
          </Alert>
        )}
      </Snackbar>
    </>
  );
};

export default CurrencyPage;
