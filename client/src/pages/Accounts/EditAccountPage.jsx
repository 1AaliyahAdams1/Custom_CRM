import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import { ArrowBack, Save, Clear } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { fetchAccountById, updateAccount, getAllAccounts } from "../../services/accountService";
import { 
  cityService, 
  industryService, 
  countryService, 
  stateProvinceService 
} from '../../services/dropdownServices';
import { useSettings } from '../../context/SettingsContext';
import SmartDropdown from '../../components/SmartDropdown';

const EditAccount = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();
  
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const [cities, setCities] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [countries, setCountries] = useState([]);
  const [stateProvinces, setStateProvinces] = useState([]);
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
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { getSpacing, settings } = useSettings();

  const validateField = (name, value) => {
    switch(name) {
      case 'AccountName':
        if (!value || value.trim().length === 0) {
          return 'Account name is required';
        } else if (value.trim().length > 100) {
          return 'Account name must be 100 characters or less';
        }
        break;
        
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address e.g. example@gmail.com';
        }
        break;
        
      case 'Website':
        if (value && value.trim() && !/^https?:\/\/.+/.test(value)) {
          return 'Website must start with http:// or https://';
        }
        break;
        
      case 'PrimaryPhone':
      case 'fax':
        if (value && !/^[\d\s\-\(\)\+]+$/.test(value)) {
          return 'Invalid format e.g. 0680713091, +27 68 071 3091, (068) 071-3091';
        }
        break;
      
      case 'postal_code':
        if (value && value.trim().length > 12) {
          return 'Postal code must be 12 characters or less';
        }
        break;

      case 'street_address1':
      case 'street_address2':
      case 'street_address3':
        if (value && value.trim().length > 255) {
          return 'Address must be 255 characters or less';
        }
        break;
        
      case 'number_of_employees':
      case 'number_of_venues':
      case 'number_of_releases':
      case 'number_of_events_anually':
        if (value && value.trim() !== '') {
          if (/\s/.test(value)) {
            return 'Must not contain spaces';
          }
          if (isNaN(value)) {
            return 'Invalid format. Must not be a character';
          }
          if (Number(value) < 0) {
            return 'Must be a positive number';
          }
          if (Number(value) >= 1000000) {
            return 'Must be less than 1,000,000';
          }
        }
        break;
      
      case 'annual_revenue':
        if (value && value.trim() !== '') {
          if (/\s/.test(value)) {
            return 'Must not contain spaces';
          }
          if (isNaN(value)) {
            return 'Invalid format. Must not be a character';
          }
          if (Number(value) < 0) {
            return 'Must be a positive number';
          }
          if (Number(value) >= 1000000000) {
            return 'Must be less than 1,000,000,000';
          }
        }
        break;
    }
    
    return null;
  };

  const getFieldError = (fieldName) => {
    return isFieldInvalid(fieldName) ? fieldErrors[fieldName] : '';
  };

  const isFieldInvalid = (fieldName) => {
    return touched[fieldName] && fieldErrors[fieldName];
  };

  const validateForm = () => {
    const newFieldErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(field => {
      const errorMessage = validateField(field, formData[field]);
      if (errorMessage) {
        newFieldErrors[field] = errorMessage;
        isValid = false;
      }
    });

    setFieldErrors(newFieldErrors);
    return isValid;
  };

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [citiesData, industriesData, countriesData, stateProvincesData] = await Promise.all([
          cityService.getAll(),
          industryService.getAll(),
          countryService.getAll(),
          stateProvinceService.getAll()
        ]);
        setCities(citiesData);
        setIndustries(industriesData);
        setCountries(countriesData);
        setStateProvinces(stateProvincesData);
      } catch {
        setError('Failed to load dropdown data');
      }
    };
    loadDropdownData();
  }, []);

  useEffect(() => {
    const loadAccount = async () => {
      if (!id) {
        setError("No account ID provided");
        setLoading(false);
        return;
      }
      try {
        const accountData = await fetchAccountById(id);
        
        setFormData({
          AccountName: accountData.AccountName || "",
          CityID: accountData.CityID || "",
          CountryID: accountData.CountryID || "",
          StateProvinceID: accountData.StateProvinceID || "",
          street_address1: accountData.street_address1 || "",
          street_address2: accountData.street_address2 || "",
          street_address3: accountData.street_address3 || "",
          postal_code: accountData.postal_code || "",
          PrimaryPhone: accountData.PrimaryPhone || "",
          IndustryID: accountData.IndustryID || "",
          Website: accountData.Website || "",
          fax: accountData.fax || "",
          email: accountData.email || "",
          number_of_employees: accountData.number_of_employees || "",
          annual_revenue: accountData.annual_revenue || "",
          number_of_venues: accountData.number_of_venues || "",
          number_of_releases: accountData.number_of_releases || "",
          number_of_events_anually: accountData.number_of_events_anually || "",
          ParentAccount: accountData.ParentAccount || "",
        });
      } catch (err) {
        console.error("Error loading account:", err);
        setError("Failed to load account data");
      } finally {
        setLoading(false);
      }
    };
    loadAccount();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
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

    // Mark as touched when user starts typing
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate in real-time
    const errorMessage = validateField(name, value);
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      if (errorMessage) {
        newErrors[name] = errorMessage;
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });

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

    // Run validation on blur as well
    const errorMessage = validateField(name, value);
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      if (errorMessage) {
        newErrors[name] = errorMessage;
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
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

    try {
      setSaving(true);
      setError(null);
      await updateAccount(id, formData);
      setSuccessMessage("Account updated successfully!");
      setTimeout(() => navigate("/accounts"), 1500);
    } catch (error) {
      console.error('Error updating account:', error);
      
      if (error.isValidation) {
        setError(error.message);
      } else if (error.response?.status === 409) {
        setError('Account with this information already exists');
      } else if (error.response?.status === 400) {
        setError(error.response.data?.error || 'Invalid data provided');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later');
      } else {
        setError('Failed to update account. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, backgroundColor: theme.palette.background.default }}>
        <Skeleton variant="rectangular" width="100%" height={400} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      backgroundColor: theme.palette.background.default, 
      minHeight: '100vh', 
      p: 3 
    }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>
            Edit Account
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button variant="outlined" startIcon={<Clear />} onClick={() => navigate("/accounts")} disabled={saving}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              startIcon={saving ? <CircularProgress size={20} /> : <Save />} 
              onClick={handleSubmit} 
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Update Account'}
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

        <Paper elevation={0} sx={{ p: 3, bgcolor: theme.palette.background.paper }}>
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
                  disabled={saving}
                  error={isFieldInvalid('AccountName')}
                  helperText={getFieldError('AccountName')}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving || !formData.CountryID}
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
                  disabled={saving || (!formData.StateProvinceID && !formData.CountryID)}
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
                  disabled={saving}
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
                  disabled={saving}
                  error={isFieldInvalid('street_address1')}
                  helperText={getFieldError('street_address1')}
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
                  disabled={saving}
                  error={isFieldInvalid('street_address2')}
                  helperText={getFieldError('street_address2')}
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
                  disabled={saving}
                  error={isFieldInvalid('street_address3')}
                  helperText={getFieldError('street_address3')}
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
                  disabled={saving}
                  error={isFieldInvalid('postal_code')}
                  helperText={getFieldError('postal_code')}
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
                  disabled={saving}
                  error={isFieldInvalid('PrimaryPhone')}
                  helperText={getFieldError('PrimaryPhone')}
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
                  disabled={saving}
                  error={isFieldInvalid('email')}
                  helperText={getFieldError('email')}
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
                  disabled={saving}
                  error={isFieldInvalid('fax')}
                  helperText={getFieldError('fax')}
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
                  disabled={saving}
                  error={isFieldInvalid('Website')}
                  helperText={getFieldError('Website')}
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Number of Employees"
                  name="number_of_employees"
                  type="text"
                  value={formData.number_of_employees}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  disabled={saving}
                  error={isFieldInvalid('number_of_employees')}
                  helperText={getFieldError('number_of_employees')}
                  size={settings?.general?.compactView ? "small" : "medium"}
                  placeholder="e.g., 50"
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Annual Revenue"
                  name="annual_revenue"
                  type="text"
                  value={formData.annual_revenue}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  disabled={saving}
                  error={isFieldInvalid('annual_revenue')}
                  helperText={getFieldError('annual_revenue')}
                  size={settings?.general?.compactView ? "small" : "medium"}
                  placeholder="e.g., 1000000"
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Number of Venues"
                  name="number_of_venues"
                  type="text"
                  value={formData.number_of_venues}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  disabled={saving}
                  error={isFieldInvalid('number_of_venues')}
                  helperText={getFieldError('number_of_venues')}
                  size={settings?.general?.compactView ? "small" : "medium"}
                  placeholder="e.g., 10"
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Number of Releases"
                  name="number_of_releases"
                  type="text"
                  value={formData.number_of_releases}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  disabled={saving}
                  error={isFieldInvalid('number_of_releases')}
                  helperText={getFieldError('number_of_releases')}
                  size={settings?.general?.compactView ? "small" : "medium"}
                  placeholder="e.g., 10"
                />
              </Box>

              <Box>
                <TextField
                  fullWidth
                  label="Number of Events Annually"
                  name="number_of_events_anually"
                  type="text"
                  value={formData.number_of_events_anually}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  disabled={saving}
                  error={isFieldInvalid('number_of_events_anually')}
                  helperText={getFieldError('number_of_events_anually')}
                  size={settings?.general?.compactView ? "small" : "medium"}
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

export default EditAccount;