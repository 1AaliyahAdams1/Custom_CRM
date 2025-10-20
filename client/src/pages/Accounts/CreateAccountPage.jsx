import React, { useState } from 'react';
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
import { useTheme } from '@mui/material/styles';
import { useSettings } from '../../context/SettingsContext';
import { createAccount, getAllAccounts } from '../../services/accountService';
import {
  cityService,
  industryService,
  countryService,
  stateProvinceService
} from '../../services/dropdownServices';
import SmartDropdown from '../../components/SmartDropdown';
import { buildAccountFieldErrors, isFormValid, trimString } from '../../utils/validation/accountValidation';

const CreateAccount = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { getSpacing, settings } = useSettings();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
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
    number_of_events_annually: "",
    ParentAccount: "",
  });

const validateField = (name, value) => {
    const errors = {};
    
    switch(name) {
      case 'AccountName':
        if (!value || value.trim().length === 0) {
          errors.AccountName = 'Account name is required';
        } else if (value.trim().length < 2) {
          errors.AccountName = 'Account name must be at least 2 characters';
        } else if (!/^[a-zA-Z0-9\s\-_.,&()]+$/.test(value.trim())) {
          errors.AccountName = 'Account name contains invalid characters';
        }
        break;
        
      case 'street_address1':
      case 'street_address2':
      case 'street_address3':
        if (value && value.trim() !== '') {
          if (!/^[a-zA-Z0-9\s\-.,#/]+$/.test(value.trim())) {
            errors[name] = 'Address contains invalid characters';
          }
        }
        break;
        
      case 'postal_code':
        if (value && value.trim() !== '') {
          if (!/^[a-zA-Z0-9\s\-]{3,10}$/.test(value.trim())) {
            errors.postal_code = 'Postal code must be 3-10 alphanumeric characters';
          }
        }
        break;
        
      case 'email':
        if (value && value.trim() !== '') {
          const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
          if (!emailRegex.test(value.trim())) {
            errors.email = 'Please enter a valid email address';
          }
        }
        break;
        
      case 'Website':
        if (value && value.trim() !== '') {
          const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
          if (!urlRegex.test(value.trim())) {
            errors.Website = 'Please enter a valid website URL';
          }
        }
        break;
        
      case 'PrimaryPhone':
      case 'fax':
        if (value && value.trim() !== '') {
          // International phone regex - supports all formats with +, spaces, dashes, parentheses
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$|^[\+]?[1-9][\d\s\-\(\)]{7,20}$/;
          const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
          if (!phoneRegex.test(value) || cleanPhone.length < 7 || cleanPhone.length > 15) {
            errors[name] = 'Please enter a valid phone number';
          }
        }
        break;
        
      case 'number_of_employees':
      case 'number_of_venues':
      case 'number_of_releases':
      case 'number_of_events_annually':
      case 'annual_revenue':
        if (value && value.trim() !== '') {
          const numValue = Number(value);
          if (isNaN(numValue) || numValue < 0 || !Number.isInteger(numValue)) {
            errors[name] = 'Must be a positive whole number';
          }
        }
        break;
        
      case 'CountryID':
      case 'StateProvinceID':
      case 'CityID':
      case 'IndustryID':
      case 'ParentAccount':
        // These are dropdown fields - validation depends on business rules
        // Currently treating as optional, but can be made required if needed
        break;
    }
    
    return errors;
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    const cleanedValue = typeof value === 'string' ? value : value;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      if (name === 'CountryID') {
        newData.StateProvinceID = "";
        newData.CityID = "";
      } else if (name === 'StateProvinceID') {
        newData.CityID = "";
      }
      
      return newData;
    });

<<<<<<< HEAD
    // Real-time validation
    const errors = validateField(name, value);
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(prev => ({
        ...prev,
        ...errors
      }));
    } else {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
=======
    // Live validation for the changed field
    setTouched(prev => ({ ...prev, [name]: true }));
    const nextErrors = { ...fieldErrors };
    const computed = buildAccountFieldErrors({ ...formData, [name]: cleanedValue });
    // Keep only the changed field's error for responsiveness
    if (computed[name]) nextErrors[name] = computed[name]; else delete nextErrors[name];
    setFieldErrors(nextErrors);
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7

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

<<<<<<< HEAD
    // Run validation
    const errors = validateField(name, value);
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(prev => ({
        ...prev,
        ...errors
      }));
    } else {
      // Clear error if validation passes
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
=======
    const computed = buildAccountFieldErrors({ ...formData, [name]: value });
    setFieldErrors(prev => ({ ...prev, [name]: computed[name] }));
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    
<<<<<<< HEAD
    // Validate required field
    if (!formData.AccountName || formData.AccountName.trim().length === 0) {
      setError('Account name is required');
      return;
    }

    // Validate all fields before submit
    const allErrors = {};
    Object.keys(formData).forEach(key => {
      const errors = validateField(key, formData[key]);
      Object.assign(allErrors, errors);
    });

    if (Object.keys(allErrors).length > 0) {
      setFieldErrors(allErrors);
      setError('Please fix validation errors before submitting');
      return;
    }
=======
    // Touch all fields and build full error map
    const allTouched = {};
    Object.keys(formData).forEach(key => { allTouched[key] = true; });
    setTouched(allTouched);
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7

    const computed = buildAccountFieldErrors(formData);
    setFieldErrors(computed);

    if (!isFormValid(computed)) {
      setError('Please fix the validation errors');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
<<<<<<< HEAD
      const response = await createAccount(formData);
=======
      const payload = {
        ...formData,
        AccountName: trimString(formData.AccountName),
        email: trimString(formData.email)?.toLowerCase(),
        Website: trimString(formData.Website),
      };
      console.log('[CreateAccountPage] Submitting:', payload);
      const result = await createAccount(payload);
      console.log('[CreateAccountPage] Create result:', result);
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
      
      // Navigate immediately on success
      navigate('/accounts');

    } catch (error) {
<<<<<<< HEAD
      console.error('Error creating account:', error);
      setError(error.message || 'Failed to create account. Please try again.');
=======
      console.error('[CreateAccountPage] Error creating account:', error);
      console.error('[CreateAccountPage] Error response data:', error.response?.data);

      const status = error.response?.status;
      const serverMessage = error.response?.data?.message || error.response?.data?.error;

      if (error.response?.data?.errors) {
        setFieldErrors(error.response.data.errors);
        setError('Please fix the validation errors');
      } else if (status === 409) {
        setError(serverMessage || 'Account with this information already exists');
      } else if (status === 400) {
        setError(serverMessage || 'Invalid data provided');
      } else if (status >= 500) {
        setError(serverMessage || 'Server error. Please try again later');
      } else {
        setError(serverMessage || 'Failed to create account. Please try again.');
      }
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/accounts');
  };

  const isFieldInvalid = (fieldName) => {
    return fieldErrors[fieldName];
  };

  const getFieldError = (fieldName) => {
    return isFieldInvalid(fieldName) ? fieldErrors[fieldName] : '';
  };

  const isFormValid = () => {
    // Check if AccountName is filled (required field)
    if (!formData.AccountName || formData.AccountName.trim().length === 0) {
      return false;
    }

    // Check if there are any validation errors
    const allErrors = {};
    Object.keys(formData).forEach(key => {
      const errors = validateField(key, formData[key]);
      Object.assign(allErrors, errors);
    });

    return Object.keys(allErrors).length === 0;
  };

  return (
    <Box sx={{ 
      width: '100%', 
      backgroundColor: theme.palette.background.default, 
      minHeight: '100vh', 
      p: getSpacing(3) 
    }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: getSpacing(3) }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
              Create New Account
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
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
              disabled={isSubmitting || !isFormValid()}
            >
              {isSubmitting ? 'Saving...' : 'Save Account'}
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: getSpacing(3) }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Paper elevation={0} sx={{ p: getSpacing(3), bgcolor: theme.palette.background.paper }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: getSpacing(3) }}>
              
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
                  size={settings.general.compactView ? "small" : "medium"}
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
                      return await stateProvinceService.getAllFiltered(formData.CountryID);
                    }
                  }}
                  displayField="StateProvince_Name"
                  valueField="StateProvinceID"
                  disabled={isSubmitting || !formData.CountryID}
                  placeholder={!formData.CountryID ? "Select a country first" : "Select a state/province"}
                  error={isFieldInvalid('StateProvinceID')}
                  helperText={getFieldError('StateProvinceID')}
                  key={`state-${formData.CountryID}`}
                />
              </Box>

              <Box>
                <SmartDropdown
                  label="City"
                  name="CityID"
                  value={formData.CityID}
                  onChange={handleInputChange}
                  service={{
                    getAll: async () => {
                      return await cityService.getAllFiltered(
                        formData.StateProvinceID, 
                        formData.CountryID
                      );
                    }
                  }}
                  displayField="CityName"
                  valueField="CityID"
                  disabled={isSubmitting || (!formData.StateProvinceID && !formData.CountryID)}
                  placeholder={
                    !formData.CountryID 
                      ? "Select a country first" 
                      : !formData.StateProvinceID 
                        ? "Select a state/province first" 
                        : "Select a city"
                  }
                  error={isFieldInvalid('CityID')}
                  helperText={getFieldError('CityID')}
                  key={`city-${formData.StateProvinceID}-${formData.CountryID}`}
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
                  label="Primary Phone"
                  name="PrimaryPhone"
                  type="tel"
                  value={formData.PrimaryPhone}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                  error={isFieldInvalid('PrimaryPhone')}
                  helperText={getFieldError('PrimaryPhone') || "Format: 0680713091, +27 68 071 3091, (068) 071-3091"}
                  size={settings.general.compactView ? "small" : "medium"}
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
                  size={settings.general.compactView ? "small" : "medium"}
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
                  size={settings.general.compactView ? "small" : "medium"}
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
                  size={settings.general.compactView ? "small" : "medium"}
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
                  size={settings.general.compactView ? "small" : "medium"}
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
                  size={settings.general.compactView ? "small" : "medium"}
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
                  size={settings.general.compactView ? "small" : "medium"}
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
                  size={settings.general.compactView ? "small" : "medium"}
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
                <TextField
                  fullWidth
                  label="Number of Employees"
                  name="number_of_employees"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={formData.number_of_employees}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                  error={isFieldInvalid('number_of_employees')}
                  helperText={getFieldError('number_of_employees')}
                  size={settings.general.compactView ? "small" : "medium"}
                  placeholder="e.g., 50"
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Annual Revenue"
                  name="annual_revenue"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={formData.annual_revenue}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                  error={isFieldInvalid('annual_revenue')}
                  helperText={getFieldError('annual_revenue')}
                  size={settings.general.compactView ? "small" : "medium"}
                  placeholder="e.g., 1000000"
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Number of Venues"
                  name="number_of_venues"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={formData.number_of_venues}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                  error={isFieldInvalid('number_of_venues')}
                  helperText={getFieldError('number_of_venues')}
                  size={settings.general.compactView ? "small" : "medium"}
                  placeholder="e.g., 10"
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Number of Releases"
                  name="number_of_releases"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={formData.number_of_releases}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                  error={isFieldInvalid('number_of_releases')}
                  helperText={getFieldError('number_of_releases')}
                  size={settings.general.compactView ? "small" : "medium"}
                  placeholder="e.g., 10"
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Number of Events Annually"
                  name="number_of_events_annually"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={formData.number_of_events_annually}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                  error={isFieldInvalid('number_of_events_annually')}
                  helperText={getFieldError('number_of_events_annually')}
                  size={settings.general.compactView ? "small" : "medium"}
                  placeholder="e.g., 20"
                />
              </Box>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default CreateAccount;