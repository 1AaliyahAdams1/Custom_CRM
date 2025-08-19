import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Save, Clear } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { createAccount, getAllAccounts } from '../../services/accountService';
import {
  cityService,
  industryService,
  countryService,
  stateProvinceService
} from '../../services/dropdownServices';
import SmartDropdown from '../../components/SmartDropdown';

// Enhanced Monochrome theme with error styling
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#050505',
      contrastText: '#fafafa',
    },
    secondary: {
      main: '#666666',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#050505',
      secondary: '#666666',
    },
    divider: '#e5e5e5',
    error: {
      main: '#ff4444',
      contrastText: '#ffffff',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid #e5e5e5',
          borderRadius: '8px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff',
            '& fieldset': { borderColor: '#e5e5e5' },
            '&:hover fieldset': { borderColor: '#cccccc' },
            '&.Mui-focused fieldset': { borderColor: '#050505' },
            '&.Mui-error fieldset': { 
              borderColor: '#ff4444',
              borderWidth: '2px',
            },
          },
          '& .Mui-error': {
            '& .MuiSvgIcon-root': {
              color: '#ff4444',
            },
            '& .MuiFormHelperText-root': {
              color: '#ff4444',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginLeft: '0',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          '&.Mui-error': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#ff4444',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        outlined: {
          borderColor: '#e5e5e5',
          color: '#050505',
          '&:hover': {
            borderColor: '#cccccc',
            backgroundColor: '#f5f5f5',
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginLeft: '0',
        },
      },
    },
  },
});

const CreateAccount = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [formData, setFormData] = useState({
    AccountName: "",
    CityID: "",
    CountryID: "",
    StateProvinceID: "",
    street_address1: "",
    street_address2: "",
    street_address3: "",
    postal_code: "",
    PrimaryPhone: "",
    IndustryID: "",
    Website: "",
    fax: "",
    email: "",
    number_of_employees: "",
    annual_revenue: "",
    number_of_venues: "",
    number_of_releases: "",
    number_of_events_anually: "",
    ParentAccount: "",
  });

  // Enhanced error display with icon
  const getFieldError = (fieldName) => {
    return touched[fieldName] && fieldErrors[fieldName] ? (
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ color: '#ff4444', marginRight: '4px' }}>✗</span>
        {fieldErrors[fieldName][0]}
      </span>
    ) : '';
  };

  const isFieldInvalid = (fieldName) => {
    return touched[fieldName] && fieldErrors[fieldName] && fieldErrors[fieldName].length > 0;
  };

  const validateField = (name, value) => {
    const errors = [];

    switch (name) {
      case 'AccountName':
        if (!value || value.trim().length === 0) {
          errors.push('Account name is required');
        } else if (value.trim().length < 2) {
          errors.push('Account name must be at least 2 characters');
        } else if (value.trim().length > 100) {
          errors.push('Account name must be 100 characters or less');
        }
        break;

      case 'email':
        if (value && value.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.trim())) {
            errors.push('Invalid email format');
          }
        }
        break;

      case 'PrimaryPhone':
      case 'fax':
        if (value && value.trim()) {
          const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,20}$/;
          if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            errors.push(`Invalid ${name === 'PrimaryPhone' ? 'phone' : 'fax'} format`);
          }
        }
        break;

      case 'Website':
        if (value && value.trim()) {
          const urlRegex = /^https?:\/\/.+\..+/;
          if (!urlRegex.test(value.trim())) {
            errors.push('Website must start with http:// or https://');
          }
        }
        break;

      case 'postal_code':
        if (value && value.trim().length > 20) {
          errors.push('Postal code must be 20 characters or less');
        }
        break;

      case 'street_address1':
      case 'street_address2':
      case 'street_address3':
        if (value && value.trim().length > 255) {
          errors.push('Address must be 255 characters or less');
        }
        break;

      case 'number_of_employees':
      case 'number_of_venues':
      case 'number_of_releases':
      case 'number_of_events_anually':
        if (value && value.trim()) {
          const num = parseInt(value);
          if (isNaN(num) || num < 0) {
            errors.push('Must be a non-negative number');
          } else if (num > 1000000) {
            errors.push('Must be less than 1,000,000');
          }
        }
        break;

      case 'annual_revenue':
        if (value && value.trim()) {
          const revenue = parseFloat(value);
          if (isNaN(revenue) || revenue < 0) {
            errors.push('Must be a non-negative number');
          } else if (revenue > 999999999999) {
            errors.push('Must be less than 1 trillion');
          }
        }
        break;
    }

    return errors;
  };

  const validateForm = () => {
    const newFieldErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(field => {
      const errors = validateField(field, formData[field]);
      if (errors.length > 0) {
        newFieldErrors[field] = errors;
        isValid = false;
      }
    });

    setFieldErrors(newFieldErrors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    if (touched[name]) {
      const errors = validateField(name, value);
      setFieldErrors(prev => ({
        ...prev,
        [name]: errors.length > 0 ? errors : undefined
      }));
    }

    if (error) {
      setError(null);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const errors = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: errors.length > 0 ? errors : undefined
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (!validateForm()) {
      setError("Please fix the errors below before submitting");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createAccount(formData);
      
      setSuccessMessage("Account created successfully!");

      // Navigate after a short delay
      setTimeout(() => {
        navigate('/accounts');
      }, 1500);

    } catch (error) {
      console.error('Error creating account:', error);
      
      if (error.isValidation) {
        setError(error.message);
      } else if (error.response?.status === 409) {
        setError('Account with this information already exists');
      } else if (error.response?.status === 400) {
        setError(error.response.data?.error || 'Invalid data provided');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/accounts');
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4" sx={{ color: '#050505', fontWeight: 600 }}>
                Create New Account
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ minWidth: 'auto' }}
              >
                Back
              </Button>
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
                onClick={handleSubmit}
                disabled={isSubmitting}
                sx={{
                  backgroundColor: '#050505',
                  '&:hover': { backgroundColor: '#333333' },
                }}
              >
                {isSubmitting ? 'Saving...' : 'Save Account'}
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          )}

          <Paper elevation={0} sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    fullWidth
                    label="Account Name"
                    name="AccountName"
                    value={formData.AccountName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    disabled={isSubmitting}
                    error={isFieldInvalid('AccountName')}
                    helperText={getFieldError('AccountName')}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                <Box sx={{ gridColumn: '1 / -1' }}>
                  <SmartDropdown
                    label="Parent Account"
                    name="ParentAccount"
                    value={formData.ParentAccount}
                    onChange={handleInputChange}
                    service={{
                      getAll: async () => {
                        const response = await getAllAccounts();
                        return response.data || response;
                      }
                    }}
                    displayField="AccountName"
                    valueField="AccountID"
                    disabled={isSubmitting}
                    error={isFieldInvalid('ParentAccount')}
                    helperText={getFieldError('ParentAccount')}
                  />
                </Box>

                <Box>
                  <SmartDropdown
                    label="Country"
                    name="CountryID"
                    value={formData.CountryID}
                    onChange={handleInputChange}
                    service={countryService}
                    displayField="CountryName"
                    valueField="CountryID"
                    disabled={isSubmitting}
                    error={isFieldInvalid('CountryID')}
                    helperText={getFieldError('CountryID')}
                  />
                </Box>

                <Box>
                  <SmartDropdown
                    label="State/Province"
                    name="StateProvinceID"
                    value={formData.StateProvinceID}
                    onChange={handleInputChange}
                    service={{
                      getAll: async () => {
                        const allStates = await stateProvinceService.getAll();
                        return formData.CountryID 
                          ? allStates.filter(state => state.countryId === parseInt(formData.CountryID))
                          : allStates;
                      }
                    }}
                    displayField="StateProvince_Name"
                    valueField="StateProvinceID"
                    disabled={isSubmitting}
                    error={isFieldInvalid('StateProvinceID')}
                    helperText={getFieldError('StateProvinceID')}
                  />
                </Box>

                <Box>
                  <SmartDropdown
                    label="City"
                    name="CityID"
                    value={formData.CityID}
                    onChange={handleInputChange}
                    service={cityService}
                    displayField="CityName"
                    valueField="CityID"
                    disabled={isSubmitting}
                    error={isFieldInvalid('CityID')}
                    helperText={getFieldError('CityID')}
                  />
                </Box>

                <Box>
                  <SmartDropdown
                    label="Industry"
                    name="IndustryID"
                    value={formData.IndustryID}
                    onChange={handleInputChange}
                    service={industryService}
                    displayField="IndustryName"
                    valueField="IndustryID"
                    disabled={isSubmitting}
                    error={isFieldInvalid('IndustryID')}
                    helperText={getFieldError('IndustryID')}
                  />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Street Address 1"
                    name="street_address1"
                    value={formData.street_address1}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    error={isFieldInvalid('street_address1')}
                    helperText={getFieldError('street_address1')}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Street Address 2"
                    name="street_address2"
                    value={formData.street_address2}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    error={isFieldInvalid('street_address2')}
                    helperText={getFieldError('street_address2')}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Street Address 3"
                    name="street_address3"
                    value={formData.street_address3}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    error={isFieldInvalid('street_address3')}
                    helperText={getFieldError('street_address3')}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    error={isFieldInvalid('postal_code')}
                    helperText={getFieldError('postal_code')}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Primary Phone"
                    name="PrimaryPhone"
                    type="tel"
                    value={formData.PrimaryPhone}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    error={isFieldInvalid('PrimaryPhone')}
                    helperText={getFieldError('PrimaryPhone')}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    error={isFieldInvalid('email')}
                    helperText={getFieldError('email')}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Fax"
                    name="fax"
                    type="tel"
                    value={formData.fax}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    error={isFieldInvalid('fax')}
                    helperText={getFieldError('fax')}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Website"
                    name="Website"
                    type="url"
                    value={formData.Website}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    error={isFieldInvalid('Website')}
                    helperText={getFieldError('Website')}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Annual Revenue"
                    name="annual_revenue"
                    type="number"
                    value={formData.annual_revenue}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    error={isFieldInvalid('annual_revenue')}
                    helperText={getFieldError('annual_revenue')}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Number of Employees"
                    name="number_of_employees"
                    type="number"
                    value={formData.number_of_employees}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    error={isFieldInvalid('number_of_employees')}
                    helperText={getFieldError('number_of_employees')}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Number of Releases"
                    name="number_of_releases"
                    type="number"
                    value={formData.number_of_releases}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    error={isFieldInvalid('number_of_releases')}
                    helperText={getFieldError('number_of_releases')}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Number of Events Annually"
                    name="number_of_events_anually"
                    type="number"
                    value={formData.number_of_events_anually}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    error={isFieldInvalid('number_of_events_anually')}
                    helperText={getFieldError('number_of_events_anually')}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                <Box>
                  <TextField
                    fullWidth
                    label="Number of Venues"
                    name="number_of_venues"
                    type="number"
                    value={formData.number_of_venues}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    error={isFieldInvalid('number_of_venues')}
                    helperText={getFieldError('number_of_venues')}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>
              </Box>
            </form>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default CreateAccount;