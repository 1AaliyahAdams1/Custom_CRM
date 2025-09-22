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
import { ArrowBack, Save, Clear, Business } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import SmartDropdown from '../../components/SmartDropdown';
import theme from "../../components/Theme";

// Mock services for countries and cities - replace with  actual services when frontend services are made
const countryService = {
  getAll: async () => {
    // Replace this with actual country service
    return [
      { CountryID: 1, CountryName: 'United States' },
      { CountryID: 2, CountryName: 'Canada' },
      { CountryID: 3, CountryName: 'United Kingdom' },
      { CountryID: 4, CountryName: 'Germany' },
      { CountryID: 5, CountryName: 'France' },
      { CountryID: 6, CountryName: 'Australia' },
      { CountryID: 7, CountryName: 'Japan' },
      { CountryID: 8, CountryName: 'South Africa' },
    ];
  }
};

const cityService = {
  getByCountry: async (countryId) => {
    // Replace this with  actual city service
    // Mock data based on country
    const cities = {
      1: [ // United States
        { CityID: 1, CityName: 'New York' },
        { CityID: 2, CityName: 'Los Angeles' },
        { CityID: 3, CityName: 'Chicago' },
        { CityID: 4, CityName: 'Houston' },
      ],
      2: [ // Canada
        { CityID: 5, CityName: 'Toronto' },
        { CityID: 6, CityName: 'Vancouver' },
        { CityID: 7, CityName: 'Montreal' },
      ],
      3: [ // United Kingdom
        { CityID: 8, CityName: 'London' },
        { CityID: 9, CityName: 'Manchester' },
        { CityID: 10, CityName: 'Birmingham' },
      ],
      8: [ // South Africa
        { CityID: 11, CityName: 'Cape Town' },
        { CityID: 12, CityName: 'Johannesburg' },
        { CityID: 13, CityName: 'Durban' },
      ]
    };
    return cities[countryId] || [];
  }
};

const AddCompany = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [availableCities, setAvailableCities] = useState([]);

  const [formData, setFormData] = useState({
    CompanyName: "",
    CountryID: "",
    CityID: "",
    Area: "",
    Street: "",
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
      case 'CompanyName':
        if (!value || value.trim().length === 0) {
          errors.push('Company name is required');
        } else if (value.trim().length < 2) {
          errors.push('Company name must be at least 2 characters');
        } else if (value.trim().length > 200) {
          errors.push('Company name must be 200 characters or less');
        }
        break;

      case 'CountryID':
        if (!value) {
          errors.push('Country is required');
        }
        break;

      case 'CityID':
        if (!value) {
          errors.push('City is required');
        }
        break;

      case 'Area':
        if (!value || value.trim().length === 0) {
          errors.push('Area is required');
        } else if (value.trim().length < 2) {
          errors.push('Area must be at least 2 characters');
        } else if (value.trim().length > 100) {
          errors.push('Area must be 100 characters or less');
        }
        break;

      case 'Street':
        if (value && value.trim().length > 200) {
          errors.push('Street must be 200 characters or less');
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

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Handle country change - load cities
    if (name === 'CountryID' && value) {
      try {
        const cities = await cityService.getByCountry(parseInt(value));
        setAvailableCities(cities);
        // Reset city selection when country changes
        setFormData(prev => ({
          ...prev,
          CountryID: value,
          CityID: ""
        }));
      } catch (error) {
        console.error('Error loading cities:', error);
        setAvailableCities([]);
      }
    } else if (name === 'CountryID' && !value) {
      // Clear cities if no country selected
      setAvailableCities([]);
      setFormData(prev => ({
        ...prev,
        CountryID: "",
        CityID: ""
      }));
    }

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
      // Prepare the data for submission
      const submitData = {
        ...formData,
        CountryID: parseInt(formData.CountryID),
        CityID: parseInt(formData.CityID),
      };

      // TODO: Replace with actual service call
      // await createCompany(submitData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccessMessage("Company created successfully!");

      // Navigate after a short delay
      setTimeout(() => {
        navigate('/companies');
      }, 1500);

    } catch (error) {
      console.error('Error creating company:', error);
      
      if (error.isValidation) {
        setError(error.message);
      } else if (error.response?.status === 409) {
        setError('Company with this name already exists in this location');
      } else if (error.response?.status === 400) {
        setError(error.response.data?.error || 'Invalid data provided');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later');
      } else {
        setError('Failed to create company. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/companies');
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* <Business sx={{ color: 'primary.main', fontSize: '2rem' }} /> */}
              <Typography variant="h4" sx={{ color: '#050505', fontWeight: 600 }}>
                Add New Company
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
                {isSubmitting ? 'Saving...' : 'Save Company'}
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
                
                {/* Company Name - Full width */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    name="CompanyName"
                    value={formData.CompanyName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    disabled={isSubmitting}
                    error={isFieldInvalid('CompanyName')}
                    helperText={getFieldError('CompanyName')}
                    placeholder="Enter the company name"
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                {/* Country */}
                <Box>
                  <SmartDropdown
                    label="Country"
                    name="CountryID"
                    value={formData.CountryID}
                    onChange={handleInputChange}
                    service={countryService}
                    displayField="CountryName"
                    valueField="CountryID"
                    required={true}
                    fullWidth={true}
                    placeholder="Search or select a country"
                    disabled={isSubmitting}
                    error={isFieldInvalid('CountryID')}
                    helperText={getFieldError('CountryID')}
                  />
                </Box>

                {/* City */}
                <Box>
                  <SmartDropdown
                    label="City"
                    name="CityID"
                    value={formData.CityID}
                    onChange={handleInputChange}
                    service={{
                      getAll: async () => availableCities
                    }}
                    displayField="CityName"
                    valueField="CityID"
                    required={true}
                    fullWidth={true}
                    placeholder={!formData.CountryID ? 'Select country first' : 'Search or select a city'}
                    disabled={isSubmitting || !formData.CountryID}
                    error={isFieldInvalid('CityID')}
                    helperText={!formData.CountryID ? 'Please select a country first' : getFieldError('CityID')}
                  />
                </Box>

                {/* Area - Full width */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    fullWidth
                    label="Area"
                    name="Area"
                    value={formData.Area}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    disabled={isSubmitting}
                    error={isFieldInvalid('Area')}
                    helperText={getFieldError('Area')}
                    placeholder="Enter the area/district/neighborhood"
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                {/* Street - Full width */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    name="Street"
                    value={formData.Street}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    error={isFieldInvalid('Street')}
                    helperText={getFieldError('Street') || 'Optional: Enter the complete street address'}
                    placeholder="Enter street address (optional)"
                    multiline
                    rows={2}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

              </Box>

              {/* Form Summary */}
              <Box sx={{ 
                mt: 4, 
                pt: 3, 
                borderTop: '1px solid #e0e0e0',
                backgroundColor: '#f8f9fa',
                borderRadius: 1,
                p: 2
              }}>
                <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                  <strong>Required fields:</strong> Company Name, Country, City, Area
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  <strong>Optional fields:</strong> Street Address
                </Typography>
              </Box>
            </form>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};
export default AddCompany;