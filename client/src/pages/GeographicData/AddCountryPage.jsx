import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Divider,
  Autocomplete,
  InputAdornment,
  Tooltip,
  IconButton,
  FormHelperText,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  Info as InfoIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import defaultTheme from '../../components/Theme';

const AddCountryPage = ({
  onSave,
  onCancel,
  loading: externalLoading = false,
  error: externalError = null,
  currencies = [],
  regions = [],
  onLoadCurrencies,
  onLoadRegions,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();

  // ✅ Form state
  const [formData, setFormData] = useState({
    CountryName: '',
    CountryCode: '',
    CurrencyID: '',
    Region: '',
    Active: true,
    Notes: '',
  });

  // ✅ UI state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // ✅ Load initial data
  useEffect(() => {
    if (onLoadCurrencies) onLoadCurrencies();
    if (onLoadRegions) onLoadRegions();
  }, [onLoadCurrencies, onLoadRegions]);

  // ✅ Clear success message after a delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // ✅ Default regions if not provided
  const defaultRegions = [
    'Africa',
    'Asia',
    'Europe',
    'North America',
    'South America',
    'Oceania',
    'Antarctica',
  ];
  const availableRegions = regions.length > 0 ? regions : defaultRegions;

  // ✅ Validation logic
  const validateField = (name, value) => {
    let message = '';

    switch (name) {
      case 'CountryName':
        if (!value.trim()) message = 'Country name is required';
        else if (value.length > 100) message = 'Country name must be under 100 characters';
        break;

      case 'CountryCode':
        if (!value.trim()) message = 'Country code is required';
        else if (!/^[A-Z]{2,3}$/.test(value.toUpperCase()))
          message = 'Country code must be 2–3 uppercase letters (e.g., US, PAK)';
        break;

      case 'Region':
        if (!value.trim()) message = 'Region is required';
        break;

      case 'CurrencyID':
        if (!value) message = 'Currency selection is required';
        break;

      default:
        break;
    }

    return message;
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const errorMsg = validateField(field, formData[field]);
      if (errorMsg) newErrors[field] = errorMsg;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle input changes (live validation)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : name === 'CountryCode' ? value.toUpperCase() : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Validate while typing
    const errorMsg = validateField(name, newValue);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  // ✅ Handle autocomplete (for Region)
  const handleAutocompleteChange = (event, value) => {
    setFormData((prev) => ({ ...prev, Region: value || '' }));
    const errorMsg = validateField('Region', value || '');
    setErrors((prev) => ({ ...prev, Region: errorMsg }));
  };

  // ✅ Validate onBlur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const errorMsg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      CountryName: true,
      CountryCode: true,
      CurrencyID: true,
      Region: true,
    });

    if (!validateForm()) {
      setSubmitError('Please fix validation errors before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const submitData = {
        ...formData,
        CurrencyID: formData.CurrencyID ? parseInt(formData.CurrencyID) : null,
        CountryCode: formData.CountryCode.toUpperCase().trim(),
        CountryName: formData.CountryName.trim(),
        Region: formData.Region.trim(),
        Notes: formData.Notes?.trim() || null,
      };

      await onSave(submitData);
      setSuccessMessage('✅ Country added successfully!');
      setTimeout(() => onCancel && onCancel(), 1500);
    } catch (error) {
      console.error('Error:', error);
      setSubmitError('❌ Failed to add country. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Clear form
  const handleClear = () => {
    setFormData({
      CountryName: '',
      CountryCode: '',
      CurrencyID: '',
      Region: '',
      Active: true,
      Notes: '',
    });
    setErrors({});
    setTouched({});
    setSubmitError(null);
  };

  const handleCancel = () => navigate('/country');

  const getFieldProps = (name) => ({
    error: !!errors[name],
    helperText: errors[name] || '',
  });

  const isLoading = externalLoading || isSubmitting;
  const displayError = externalError || submitError;

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box
        sx={{
          width: '100%',
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconButton onClick={handleCancel} sx={{ color: 'primary.main' }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" fontWeight={600}>
              Add New Country
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ ml: 7, color: theme.palette.text.secondary }}>
            Add a new country to expand client base
          </Typography>
        </Box>

        {successMessage && <Alert severity="success" sx={{ mb: 3 }}>{successMessage}</Alert>}
        {displayError && <Alert severity="error" sx={{ mb: 3 }}>{displayError}</Alert>}

        <Paper sx={{ p: 4, borderRadius: 2, maxWidth: 800 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Country Details
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Country Name"
                    name="CountryName"
                    value={formData.CountryName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g., South Africa"
                    disabled={isLoading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Official country name">
                            <InfoIcon color="action" fontSize="small" />
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                    {...getFieldProps('CountryName')}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Country Code"
                    name="CountryCode"
                    value={formData.CountryCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g., PAK"
                    inputProps={{ style: { textTransform: 'uppercase' }, maxLength: 3 }}
                    disabled={isLoading}
                    {...getFieldProps('CountryCode')}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.CurrencyID}>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      name="CurrencyID"
                      value={formData.CurrencyID}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      label="Currency"
                      disabled={isLoading}
                    >
                      <MenuItem value="">
                        <em>Select Currency</em>
                      </MenuItem>
                      {currencies.map((currency) => (
                        <MenuItem key={currency.CurrencyID} value={currency.CurrencyID}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MoneyIcon fontSize="small" />
                            {currency.CurrencyName} ({currency.CurrencyCode})
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.CurrencyID && (
                      <FormHelperText>{errors.CurrencyID}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={availableRegions}
                    value={formData.Region}
                    onChange={(e, v) => handleAutocompleteChange(e, v)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Region"
                        onBlur={(e) => handleBlur({ target: { name: 'Region', value: formData.Region } })}
                        {...getFieldProps('Region')}
                      />
                    )}
                    freeSolo
                    disabled={isLoading}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Status */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Status
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <FormControlLabel
                control={
                  <Switch
                    name="Active"
                    checked={formData.Active}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label="Active"
              />
            </Box>

            {/* Advanced Section */}
            <Box sx={{ mb: 4 }}>
              <Button
                variant="text"
                onClick={() => setShowAdvanced(!showAdvanced)}
                disabled={isLoading}
              >
                {showAdvanced ? 'Hide' : 'Show'} Additional Info
              </Button>
              {showAdvanced && (
                <Box>
                  <Divider sx={{ mb: 3 }} />
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Notes"
                    name="Notes"
                    value={formData.Notes}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </Box>
              )}
            </Box>

            {/* Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleClear}>
                Clear
              </Button>
              <Button variant="outlined" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={isLoading}
              >
                {isLoading ? 'Adding...' : 'Add Country'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default AddCountryPage;
