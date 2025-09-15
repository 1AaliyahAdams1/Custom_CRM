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
  FormControlLabel,
  Switch,
  InputAdornment,
  Divider,
} from '@mui/material';
import { ArrowBack, Save, Clear, LocalOffer, Percent, CalendarToday, Business } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import SmartDropdown from '../../components/SmartDropdown';
import theme from "../../components/Theme";

// Mock service for companies - replace with your actual service
const companyService = {
  getAll: async () => {
    // Replace this with  actual company service
    return [
      { CompanyID: 1, CompanyName: 'Acme Corporation' },
      { CompanyID: 2, CompanyName: 'Tech Solutions Ltd' },
      { CompanyID: 3, CompanyName: 'Global Industries' },
      { CompanyID: 4, CompanyName: 'Innovation Partners' },
      { CompanyID: 5, CompanyName: 'Digital Ventures' },
    ];
  }
};

const CreateDiscountCode = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [formData, setFormData] = useState({
    DiscountCode: "",
    DiscountPercentage: "",
    CompanyID: "",
    MinEvents: "",
    MaxEvents: "",
    ValidUntil: "",
    OneTime: false,
    MinCommitted: "",
    RequiresApproval: false,
    IsActive: true,
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
      case 'DiscountCode':
        if (!value || value.trim().length === 0) {
          errors.push('Discount code is required');
        } else if (value.trim().length < 3) {
          errors.push('Discount code must be at least 3 characters');
        } else if (value.trim().length > 50) {
          errors.push('Discount code must be 50 characters or less');
        } else if (!/^[A-Za-z0-9\-_]+$/.test(value.trim())) {
          errors.push('Discount code can only contain letters, numbers, hyphens, and underscores');
        }
        break;

      case 'DiscountPercentage':
        if (!value || value.trim().length === 0) {
          errors.push('Discount percentage is required');
        } else {
          const percentage = parseFloat(value);
          if (isNaN(percentage) || percentage <= 0) {
            errors.push('Discount percentage must be greater than 0');
          } else if (percentage > 100) {
            errors.push('Discount percentage cannot exceed 100%');
          }
        }
        break;

      case 'CompanyID':
        if (!value) {
          errors.push('Company is required');
        }
        break;

      case 'MinEvents':
        if (value && value.trim()) {
          const minEvents = parseInt(value);
          if (isNaN(minEvents) || minEvents < 0) {
            errors.push('Minimum events must be a non-negative number');
          } else if (minEvents > 9999) {
            errors.push('Minimum events must be less than 10,000');
          }
        }
        break;

      case 'MaxEvents':
        if (value && value.trim()) {
          const maxEvents = parseInt(value);
          if (isNaN(maxEvents) || maxEvents < 0) {
            errors.push('Maximum events must be a non-negative number');
          } else if (maxEvents > 9999) {
            errors.push('Maximum events must be less than 10,000');
          } else if (formData.MinEvents && parseInt(formData.MinEvents) > maxEvents) {
            errors.push('Maximum events must be greater than or equal to minimum events');
          }
        }
        break;

      case 'ValidUntil':
        if (!value || value.trim().length === 0) {
          errors.push('Valid until date is required');
        } else {
          const validDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (isNaN(validDate.getTime())) {
            errors.push('Please enter a valid date');
          } else if (validDate <= today) {
            errors.push('Valid until date must be in the future');
          }
        }
        break;

      case 'MinCommitted':
        if (value && value.trim()) {
          const minCommitted = parseFloat(value);
          if (isNaN(minCommitted) || minCommitted < 0) {
            errors.push('Minimum committed amount must be a non-negative number');
          } else if (minCommitted > 999999.99) {
            errors.push('Minimum committed amount must be less than $999,999.99');
          }
        }
        break;
    }

    return errors;
  };

  const validateForm = () => {
    const newFieldErrors = {};
    let isValid = true;

    // Validate all fields except boolean fields
    Object.keys(formData).forEach(field => {
      if (!['OneTime', 'RequiresApproval', 'IsActive'].includes(field)) {
        const errors = validateField(field, formData[field]);
        if (errors.length > 0) {
          newFieldErrors[field] = errors;
          isValid = false;
        }
      }
    });

    // Cross-field validation
    if (formData.MinEvents && formData.MaxEvents) {
      const minEvents = parseInt(formData.MinEvents);
      const maxEvents = parseInt(formData.MaxEvents);
      if (!isNaN(minEvents) && !isNaN(maxEvents) && minEvents > maxEvents) {
        newFieldErrors.MaxEvents = ['Maximum events must be greater than or equal to minimum events'];
        isValid = false;
      }
    }

    setFieldErrors(newFieldErrors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));

    if (type !== 'checkbox') {
      setTouched(prev => ({
        ...prev,
        [name]: true
      }));

      if (touched[name]) {
        const errors = validateField(name, finalValue);
        setFieldErrors(prev => ({
          ...prev,
          [name]: errors.length > 0 ? errors : undefined
        }));
      }
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
      if (!['OneTime', 'RequiresApproval', 'IsActive'].includes(key)) {
        allTouched[key] = true;
      }
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
        DiscountPercentage: parseFloat(formData.DiscountPercentage),
        CompanyID: parseInt(formData.CompanyID),
        MinEvents: formData.MinEvents ? parseInt(formData.MinEvents) : null,
        MaxEvents: formData.MaxEvents ? parseInt(formData.MaxEvents) : null,
        MinCommitted: formData.MinCommitted ? parseFloat(formData.MinCommitted) : null,
        ValidUntil: new Date(formData.ValidUntil).toISOString(),
      };

      // TODO: Replace with actual service call
      // await createDiscountCode(submitData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccessMessage("Discount code created successfully!");

      // Navigate after a short delay
      setTimeout(() => {
        navigate('/discount-codes');
      }, 1500);

    } catch (error) {
      console.error('Error creating discount code:', error);
      
      if (error.isValidation) {
        setError(error.message);
      } else if (error.response?.status === 409) {
        setError('Discount code already exists');
      } else if (error.response?.status === 400) {
        setError(error.response.data?.error || 'Invalid data provided');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later');
      } else {
        setError('Failed to create discount code. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const handleCancel = () => {
    navigate('/discount-codes');
  };

  // Get today's date in YYYY-MM-DD format for minimum date
  const getTodayDate = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LocalOffer sx={{ color: 'primary.main', fontSize: '2rem' }} />
              <Typography variant="h4" sx={{ color: '#050505', fontWeight: 600 }}>
                Create Discount Code
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
                {isSubmitting ? 'Saving...' : 'Save Discount Code'}
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
              
              {/* Basic Information Section */}
              <Typography variant="h6" sx={{ mb: 3, color: '#050505', fontWeight: 600 }}>
                Basic Information
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 4 }}>
                
                {/* Discount Code */}
                <Box>
                  <TextField
                    fullWidth
                    label="Discount Code"
                    name="DiscountCode"
                    value={formData.DiscountCode}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    disabled={isSubmitting}
                    error={isFieldInvalid('DiscountCode')}
                    helperText={getFieldError('DiscountCode')}
                    placeholder="e.g., SAVE20, SUMMER2024"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalOffer sx={{ color: '#666' }} />
                        </InputAdornment>
                      ),
                    }}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                {/* Discount Percentage */}
                <Box>
                  <TextField
                    fullWidth
                    label="Discount Percentage"
                    name="DiscountPercentage"
                    type="number"
                    value={formData.DiscountPercentage}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    disabled={isSubmitting}
                    error={isFieldInvalid('DiscountPercentage')}
                    helperText={getFieldError('DiscountPercentage')}
                    inputProps={{
                      min: "0.01",
                      max: "100",
                      step: "0.01"
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Percent sx={{ color: '#666' }} />
                        </InputAdornment>
                      ),
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                {/* Company - Full width */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <SmartDropdown
                    label="Company"
                    name="CompanyID"
                    value={formData.CompanyID}
                    onChange={handleInputChange}
                    service={companyService}
                    displayField="CompanyName"
                    valueField="CompanyID"
                    required={true}
                    fullWidth={true}
                    placeholder="Search or select a company"
                    disabled={isSubmitting}
                    error={isFieldInvalid('CompanyID')}
                    helperText={getFieldError('CompanyID')}
                  />
                </Box>

              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Usage Restrictions Section */}
              <Typography variant="h6" sx={{ mb: 3, color: '#050505', fontWeight: 600 }}>
                Usage Restrictions
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, mb: 4 }}>
                
                {/* Min Events */}
                <Box>
                  <TextField
                    fullWidth
                    label="Minimum Events"
                    name="MinEvents"
                    type="number"
                    value={formData.MinEvents}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    error={isFieldInvalid('MinEvents')}
                    helperText={getFieldError('MinEvents') || 'Optional: Minimum number of events required'}
                    inputProps={{
                      min: "0",
                      step: "1"
                    }}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                {/* Max Events */}
                <Box>
                  <TextField
                    fullWidth
                    label="Maximum Events"
                    name="MaxEvents"
                    type="number"
                    value={formData.MaxEvents}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    error={isFieldInvalid('MaxEvents')}
                    helperText={getFieldError('MaxEvents') || 'Optional: Maximum number of events allowed'}
                    inputProps={{
                      min: "0",
                      step: "1"
                    }}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                {/* Valid Until */}
                <Box>
                  <TextField
                    fullWidth
                    label="Valid Until"
                    name="ValidUntil"
                    type="date"
                    value={formData.ValidUntil}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    disabled={isSubmitting}
                    error={isFieldInvalid('ValidUntil')}
                    helperText={getFieldError('ValidUntil')}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      min: getTodayDate()
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday sx={{ color: '#666' }} />
                        </InputAdornment>
                      ),
                    }}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                {/* Min Committed */}
                <Box>
                  <TextField
                    fullWidth
                    label="Minimum Committed Amount"
                    name="MinCommitted"
                    type="number"
                    value={formData.MinCommitted}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    error={isFieldInvalid('MinCommitted')}
                    helperText={getFieldError('MinCommitted') || 'Optional: Minimum amount that must be committed'}
                    inputProps={{
                      min: "0",
                      step: "0.01"
                    }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Settings Section */}
              <Typography variant="h6" sx={{ mb: 3, color: '#050505', fontWeight: 600 }}>
                Settings
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                
                <FormControlLabel
                  control={
                    <Switch
                      name="OneTime"
                      checked={formData.OneTime}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                  }
                  label="One-time use only"
                />

                <FormControlLabel
                  control={
                    <Switch
                      name="RequiresApproval"
                      checked={formData.RequiresApproval}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                  }
                  label="Requires approval before use"
                />

                <FormControlLabel
                  control={
                    <Switch
                      name="IsActive"
                      checked={formData.IsActive}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                  }
                  label="Active (can be used immediately)"
                />

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
                  <strong>Required fields:</strong> Discount Code, Discount Percentage, Company, Valid Until Date
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                  <strong>Optional fields:</strong> Min/Max Events, Minimum Committed Amount
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  <strong>Note:</strong> The discount code will be created with the current user as the creator.
                </Typography>
              </Box>
            </form>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};
export default CreateDiscountCode;