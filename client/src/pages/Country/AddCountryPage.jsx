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
  Chip,
  Autocomplete,
  InputAdornment,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  Info as InfoIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../components/Theme';

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
  // Form state
  const [formData, setFormData] = useState({
    CountryName: '',
    CountryCode: '',
    CurrencyID: '',
    Region: '',
    Active: true,
    Notes: '',
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Load initial data
  useEffect(() => {
    if (onLoadCurrencies) {
      onLoadCurrencies();
    }
    if (onLoadRegions) {
      onLoadRegions();
    }
  }, [onLoadCurrencies, onLoadRegions]);

  // Clear success message after a delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Default regions if not provided
  const defaultRegions = [
    'Africa',
    'Asia',
    'Europe',
    'North America',
    'South America',
    'Oceania',
    'Antarctica'
  ];

  const availableRegions = regions.length > 0 ? regions : defaultRegions;

  // Validation rules
  const validateField = (name, value) => {
    const fieldErrors = {};

    switch (name) {
      case 'CountryName':
        if (!value.trim()) {
          fieldErrors.CountryName = 'Country name is required';
        } else if (value.length > 100) {
          fieldErrors.CountryName = 'Country name must be 100 characters or less';
        }
        break;
      
      case 'CountryCode':
        if (!value.trim()) {
          fieldErrors.CountryCode = 'Country code is required';
        } else if (value.length > 5) {
          fieldErrors.CountryCode = 'Country code must be 5 characters or less';
        } else if (!/^[A-Z]{2,3}$/.test(value.toUpperCase())) {
          fieldErrors.CountryCode = 'Country code must be 2-3 uppercase letters (e.g., US, USA)';
        }
        break;
      
      case 'Region':
        if (!value.trim()) {
          fieldErrors.Region = 'Region is required';
        }
        break;
      
      default:
        break;
    }

    return fieldErrors;
  };

  // Handle input changes
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    // Special handling for CountryCode - auto-uppercase
    const finalValue = name === 'CountryCode' ? fieldValue.toUpperCase() : fieldValue;

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError(null);
    }

    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  // Handle autocomplete changes
  const handleAutocompleteChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value || ''
    }));

    // Clear field error when user makes selection
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError(null);
    }

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  // Handle field blur for validation
  const handleBlur = (event) => {
    const { name, value } = event.target;
    const fieldErrors = validateField(name, value);
    
    setErrors(prev => ({
      ...prev,
      ...fieldErrors
    }));
  };

  // Validate entire form
  const validateForm = () => {
    const allErrors = {};
    
    Object.keys(formData).forEach(key => {
      const fieldErrors = validateField(key, formData[key]);
      Object.assign(allErrors, fieldErrors);
    });

    setErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched to show validation errors
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    // Validate the form before submission
    if (!validateForm()) {
      setSubmitError("Please fix the errors below before submitting");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Prepare the data for submission
      const submitData = {
        ...formData,
        // Convert CurrencyID to integer if it exists
        CurrencyID: formData.CurrencyID ? parseInt(formData.CurrencyID) : null,
        // Ensure CountryCode is uppercase
        CountryCode: formData.CountryCode.toUpperCase().trim(),
        // Trim whitespace from text fields
        CountryName: formData.CountryName.trim(),
        Region: formData.Region.trim(),
        Notes: formData.Notes?.trim() || null,
      };
      
      // Call the onSave function passed from parent
      await onSave(submitData);
      
      // Show success message
      setSuccessMessage("Country added successfully!");
      
      // Navigate back after a short delay (if using router)
      setTimeout(() => {
        if (onCancel) {
          onCancel(); // This could navigate back or close the form
        }
      }, 1500);
      
    } catch (error) {
      console.error('Error creating country:', error);
      
      // Handle different types of errors
      if (error.isValidation) {
        setSubmitError(error.message);
      } else if (error.response?.status === 409) {
        setSubmitError('Country with this code already exists');
      } else if (error.response?.status === 400) {
        setSubmitError(error.response.data?.error || 'Invalid data provided');
      } else if (error.response?.status >= 500) {
        setSubmitError('Server error. Please try again later');
      } else {
        setSubmitError('Failed to add country. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle clear form
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
    setSuccessMessage('');
  };

  
  const handleCancel = () => {
    navigate('/country');
  };

  // Get field props for consistent styling
  const getFieldProps = (name) => ({
    error: touched[name] && !!errors[name],
    helperText: touched[name] && errors[name] ? errors[name] : '',
  });

  // Determine which loading state to use
  const isLoading = externalLoading || isSubmitting;
  // Determine which error to show
  const displayError = externalError || submitError;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3, display:'flex', flexDirection:'column', alignItems:'center' }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconButton onClick={handleCancel} sx={{ color: 'primary.main' }}>
              <ArrowBackIcon />
            </IconButton>
            
            <Typography variant="h4" component="h1" sx={{ color: 'primary.main', fontWeight: 600 }}>
              Add New Country
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ ml: 7 }}>
            Add a new country to expand client base
          </Typography>
        </Box>

        {/* Success Alert */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        {/* Error Alert */}
        {displayError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {displayError}
          </Alert>
        )}

        {/* Form */}
        <Paper sx={{ p: 4, borderRadius: 2, maxWidth: 800 }}>
          <form onSubmit={handleSubmit}>
            {/* Basic Information Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                Fill in the following details to add a new country:
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
                    required
                    placeholder="e.g., South Africa"
                    disabled={isLoading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Official country name">
                            <InfoIcon color="action" fontSize="small" />
                          </Tooltip>
                        </InputAdornment>
                      )
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
                    required
                    placeholder="e.g., ZA"
                    disabled={isLoading}
                    inputProps={{ 
                      style: { textTransform: 'uppercase' },
                      maxLength: 3
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="ISO 3166-1 alpha-2 or alpha-3 code">
                            <InfoIcon color="action" fontSize="small" />
                          </Tooltip>
                        </InputAdornment>
                      )
                    }}
                    {...getFieldProps('CountryCode')}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth {...getFieldProps('CurrencyID')}>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      fullWidth
                      labelId="currency-label"
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
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={availableRegions}
                    value={formData.Region}
                    onChange={(event, value) => handleAutocompleteChange('Region', value)}
                    disabled={isLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Region"
                        required
                        placeholder="Select or type region"
                        {...getFieldProps('Region')}
                      />
                    )}
                    freeSolo
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Status Section */}
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
                    disabled={isLoading}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>Active</Typography>
                  </Box>
                }
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 4 }}>
                {formData.Active 
                  ? 'Entertainment.FM has active clients in this country' 
                  : 'Country will be inactive'
                }
              </Typography>
            </Box>

            {/* Advanced Section */}
            <Box sx={{ mb: 4 }}>
              <Button
                variant="text"
                onClick={() => setShowAdvanced(!showAdvanced)}
                sx={{ mb: 2 }}
                disabled={isLoading}
              >
                {showAdvanced ? 'Hide' : 'Show'} Additional Information
              </Button>
              
              {showAdvanced && (
                <Box>
                  <Divider sx={{ mb: 3 }} />
                  <TextField
                    fullWidth
                    label="Notes"
                    name="Notes"
                    value={formData.Notes}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    placeholder="Add any additional notes about this country..."
                    disabled={isLoading}
                  />
                </Box>
              )}
            </Box>

            {/* Form Actions */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2, borderTop: '1px solid #e5e5e5' }}>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClear}
                disabled={isLoading}
              >
                Clear Form
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={isLoading}
              >
                {isLoading ? 'Adding Country...' : 'Add Country'}
              </Button>
            </Box>
          </form>
        </Paper>

        {/* Form Summary
        {(formData.CountryName || formData.CountryCode) && (
          <Paper sx={{ mt: 3, p: 3, maxWidth: 800, backgroundColor: '#f8f9fa' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Preview
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.CountryName && (
                <Chip 
                  label={`Name: ${formData.CountryName}`} 
                  variant="outlined" 
                  color="primary" 
                />
              )}
              {formData.CountryCode && (
                <Chip 
                  label={`Code: ${formData.CountryCode}`} 
                  variant="outlined" 
                  color="primary" 
                />
              )}
              {formData.Region && (
                <Chip 
                  label={`Region: ${formData.Region}`} 
                  variant="outlined" 
                />
              )}
              <Chip 
                label={`Status: ${formData.Active ? 'Active' : 'Inactive'}`} 
                variant="outlined" 
                color={formData.Active ? 'success' : 'default'}
              />
            </Box>
          </Paper>
        )} */}
      </Box>
    </ThemeProvider>
  );
};

export default AddCountryPage;