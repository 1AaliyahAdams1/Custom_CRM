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
  selectedCurrency,
}) => {
  // Add Currency Dialog State
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

  // Currency columns configuration
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

  // Enhanced menu items for currencies
  const getMenuItems = (currency) => {
    const currencyId = currency.CurrencyID;
    const baseItems = [
      {
        label: 'View Details',
        icon: <InfoIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onView && onView(currency),
        show: !!onView,
      },
      {
        label: 'Edit',
        icon: <EditIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onEdit && onEdit(currency),
        show: !!onEdit,
      },
      {
        label: 'Add Notes',
        icon: <NoteIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onAddNote && onAddNote(currency),
        show: !!onAddNote,
      },
      {
        label: 'Add Attachments',
        icon: <AttachFileIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onAddAttachment && onAddAttachment(currency),
        show: !!onAddAttachment,
      },
    ];

    // Add reactivate/deactivate based on current status
    const isActive = currency.Active === true || currency.Active === 1;
    if (isActive) {
      baseItems.push({
        label: 'Deactivate',
        icon: <PowerOffIcon sx={{ mr: 1, color: '#ff9800' }} />,
        onClick: () => onDeactivate && onDeactivate(currencyId),
        show: !!onDeactivate,
      });
    } else {
      baseItems.push({
        label: 'Reactivate',
        icon: <PowerIcon sx={{ mr: 1, color: '#4caf50' }} />,
        onClick: () => onReactivate && onReactivate(currencyId),
        show: !!onReactivate,
      });
    }

    // Add delete option
    baseItems.push({
      label: 'Delete',
      icon: <DeleteIcon sx={{ mr: 1, color: '#f44336' }} />,
      onClick: () => onDelete && onDelete(currencyId),
      show: !!onDelete,
    });

    return baseItems;
  };

  // Custom formatters for currency-specific fields
  const currencyFormatters = {
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
    Symbol: (value) => {
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
    ISOcode: (value) => {
      return (
        <Chip
          label={value}
          size="small"
          variant="outlined"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 'bold',
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
          }}
        />
      );
    },
    ExchangeRate: (value) => {
      return parseFloat(value).toFixed(4);
    },
    Prefix: (value) => {
      const isPrefix = value === true || value === 1;
      return (
        <Chip
          label={isPrefix ? 'Prefix' : 'Suffix'}
          size="small"
          sx={{
            backgroundColor: isPrefix ? '#e8f5e8' : '#fff3e0',
            color: isPrefix ? '#2e7d32' : '#ef6c00',
            fontWeight: 500,
          }}
        />
      );
    },
    DecimalPlaces: (value) => {
      return `${value} places`;
    }
  };

  // Handle Add Currency Dialog
  const handleOpenAddCurrencyDialog = () => {
    setAddCurrencyDialogOpen(true);
    setNewCurrency({
      Symbol: '',
      ISOcode: '',
      DecimalPlaces: 2,
      EnglishName: '',
      LocalName: '',
      ExchangeRate: '',
      Active: true,
      Prefix: true
    });
  };

  const handleCloseAddCurrencyDialog = () => {
    setAddCurrencyDialogOpen(false);
    setNewCurrency({
      Symbol: '',
      ISOcode: '',
      DecimalPlaces: 2,
      EnglishName: '',
      LocalName: '',
      ExchangeRate: '',
      Active: true,
      Prefix: true
    });
  };

  const handleAddCurrency = async () => {
    if (!newCurrency.Symbol.trim()) {
      setError && setError('Currency symbol is required');
      return;
    }

    if (!newCurrency.ISOcode.trim()) {
      setError && setError('ISO code is required');
      return;
    }

    if (newCurrency.ISOcode.length !== 3) {
      setError && setError('ISO code must be exactly 3 characters');
      return;
    }

    if (!newCurrency.EnglishName.trim()) {
      setError && setError('English name is required');
      return;
    }

    if (!newCurrency.ExchangeRate || parseFloat(newCurrency.ExchangeRate) <= 0) {
      setError && setError('Valid exchange rate is required');
      return;
    }

    setAddCurrencyLoading(true);
    try {
      if (onCreate) {
        const currencyData = {
          ...newCurrency,
          ExchangeRate: parseFloat(newCurrency.ExchangeRate),
          DecimalPlaces: parseInt(newCurrency.DecimalPlaces),
          LocalName: newCurrency.LocalName.trim() || newCurrency.EnglishName.trim()
        };
        await onCreate(currencyData);
        handleCloseAddCurrencyDialog();
        setSuccessMessage && setSuccessMessage('Currency added successfully');
      }
    } catch (error) {
      setError && setError('Failed to add currency');
    } finally {
      setAddCurrencyLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewCurrency(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleISOCodeChange = (e) => {
    const value = e.target.value.toUpperCase();
    if (value.length <= 3) {
      handleInputChange('ISOcode', value);
    }
  };

  const handleSymbolChange = (e) => {
    const value = e.target.value;
    if (value.length <= 5) {
      handleInputChange('Symbol', value);
    }
  };

  const handleDecimalPlacesChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 0 && value <= 8) {
      handleInputChange('DecimalPlaces', value);
    }
  };

  const handleExchangeRateChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,4}$/.test(value) || value === '') {
      handleInputChange('ExchangeRate', value);
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

      {/* Currencies Toolbar */}
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
            Currencies
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
            onClick={handleOpenAddCurrencyDialog}
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

      {/* Currencies Table */}
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
          showSelection={true}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddNote={onAddNote}
          onAddAttachment={onAddAttachment}
          onAssignUser={onAssignUser}
          formatters={currencyFormatters}
          entityType="currency"
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
          Showing {currencies.length} currencies
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

      {/* Add Currency Dialog */}
      <Dialog
        open={addCurrencyDialogOpen}
        onClose={handleCloseAddCurrencyDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e5e5e5'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoneyIcon sx={{ color: '#1976d2' }} />
            Add New Currency
          </Box>
          <IconButton onClick={handleCloseAddCurrencyDialog} size="small">
            <CloseIcon />
          </IconButton>
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
                InputProps={{
                  startAdornment: <AttachMoneyIcon sx={{ mr: 1, color: '#666' }} />,
                }}
              />

              <TextField
                label="ISO Code"
                value={newCurrency.ISOcode}
                onChange={handleISOCodeChange}
                fullWidth
                required
                variant="outlined"
                helperText="3-letter ISO 4217 code (e.g., USD, EUR, ZAR)"
                inputProps={{ maxLength: 3 }}
                InputProps={{
                  startAdornment: <CodeIcon sx={{ mr: 1, color: '#666' }} />,
                }}
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
              />

              <TextField
                label="Local Name"
                value={newCurrency.LocalName}
                onChange={(e) => handleInputChange('LocalName', e.target.value)}
                fullWidth
                variant="outlined"
                helperText="Local language name (optional)"
                inputProps={{ maxLength: 100 }}
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
                type="text"
              />

              <FormControl fullWidth>
                <InputLabel>Decimal Places</InputLabel>
                <Select
                  value={newCurrency.DecimalPlaces}
                  onChange={handleDecimalPlacesChange}
                  label="Decimal Places"
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((places) => (
                    <MenuItem key={places} value={places}>
                      {places} decimal places
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newCurrency.Prefix}
                      onChange={(e) => handleInputChange('Prefix', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Symbol is Prefix"
                />
                <Typography variant="caption" sx={{ color: '#666', mt: -1 }}>
                  If checked, symbol appears before amount ($100). If unchecked, symbol appears after amount (100$)
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={newCurrency.Active}
                      onChange={(e) => handleInputChange('Active', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Active"
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e5e5e5' }}>
          <Button onClick={handleCloseAddCurrencyDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleAddCurrency}
            variant="contained"
            disabled={
              addCurrencyLoading ||
              !newCurrency.Symbol.trim() ||
              !newCurrency.ISOcode.trim() ||
              newCurrency.ISOcode.length !== 3 ||
              !newCurrency.EnglishName.trim() ||
              !newCurrency.ExchangeRate ||
              parseFloat(newCurrency.ExchangeRate) <= 0
            }
          >
            {addCurrencyLoading ? <CircularProgress size={20} /> : 'Add Currency'}
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

export default CurrencyPage;