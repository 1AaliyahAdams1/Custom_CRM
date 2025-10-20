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
import { useTheme } from '@mui/material/styles';
import SmartDropdown from '../../components/SmartDropdown';
import { createDeal } from '../../services/dealService';
import { getAllAccounts } from '../../services/accountService';
import { dealStageService, currencyService } from '../../services/dropdownServices';

const CreateDealPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    AccountID: '',
    DealStageID: '',
    DealName: '',
    Value: '',
    CloseDate: '',
    Probability: '',
    CurrencyID: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const requiredFields = ['AccountID', 'DealName', 'Value'];

  // Test currency API directly
  useEffect(() => {
    const testCurrencyAPI = async () => {
      try {
        console.log('=== TESTING CURRENCY API DIRECTLY ===');
        const response = await fetch('/currencies', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('Direct API Response Status:', response.status);
        console.log('Direct API Response OK:', response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Direct API Response Data:', data);
          console.log('Direct API Data Length:', data?.length);
        } else {
          console.error('Direct API Error:', response.statusText);
        }
        console.log('=====================================');
      } catch (error) {
        console.error('Direct API Test Error:', error);
      }
    };
    
    testCurrencyAPI();
  }, []);

  const validateField = (name, value) => {
    const errors = [];
    
    // Define dropdown fields that contain numeric IDs
    const dropdownFields = ['AccountID', 'DealStageID', 'CurrencyID'];
    
    // For dropdown fields, only check if value exists (don't call trim on numbers)
    if (dropdownFields.includes(name)) {
      if (name === 'AccountID') {
        // Required dropdown field
        if (!value || value === '') {
          errors.push('Account is required.');
        }
      }
      // Optional dropdown fields are always valid if they have a value or are empty
      return errors;
    }
    
    // For string fields, safely convert to string and trim
    const strValue = typeof value === 'string' ? value.trim() : (value ?? '').toString().trim();

    // Check required fields
    if (requiredFields.includes(name) && !strValue) {
      errors.push('This field is required.');
    }

    // Only validate format if value exists
    if (strValue) {
      if (name === 'DealName') {
        if (strValue.length < 2) {
          errors.push('Deal name must be at least 2 characters.');
        } else if (!/^[a-zA-Z0-9\s\-_.,&()]+$/.test(strValue)) {
          errors.push('Deal name contains invalid characters.');
        }
      }
      if (name === 'Value') {
        const numValue = Number(strValue);
        if (isNaN(numValue) || numValue < 0) {
          errors.push('Value must be a positive number.');
        } else if (!/^\d+(\.\d{1,2})?$/.test(strValue)) {
          errors.push('Value must have at most 2 decimal places (e.g., 99.99).');
        }
      }
      if (name === 'Probability') {
        const num = Number(strValue);
        if (isNaN(num)) {
          errors.push('Please enter a valid number.');
        } else if (num < 0 || num > 100) {
          errors.push('Probability must be between 0 and 100.');
        }
      }
      if (name === 'CloseDate') {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(strValue)) {
          errors.push('Please enter a valid date in YYYY-MM-DD format.');
        } else {
          const selectedDate = new Date(strValue);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDate < today) {
            errors.push('Close date cannot be in the past.');
          }
        }
      }
      if (name === 'DealStageID' || name === 'CurrencyID') {
        // Optional dropdown fields - only validate if selected
        if (strValue && strValue.trim() !== '') {
          // Additional validation can be added here if needed
        }
      }
    }

    return errors;
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const errors = validateField(field, formData[field]);
      if (errors.length > 0) newErrors[field] = errors;
    });
    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Ensure dropdown values are stored as strings for consistency
    const processedValue = typeof value === 'number' ? value.toString() : value;
    
    console.log(`Field ${name} changed:`, { originalValue: value, processedValue, type: typeof processedValue });
    
    setFormData((prev) => ({ ...prev, [name]: processedValue }));

    setTouched((prev) => ({ ...prev, [name]: true }));

    // Real-time validation
    const errors = validateField(name, processedValue);
    setFieldErrors((prev) => ({ ...prev, [name]: errors.length > 0 ? errors : undefined }));

    if (error) setError(null);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Ensure dropdown values are processed consistently
    const processedValue = typeof value === 'number' ? value.toString() : value;
    
    const errors = validateField(name, processedValue);
    setFieldErrors((prev) => ({ ...prev, [name]: errors.length > 0 ? errors : undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) {
      setError('Please fix the errors before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createDeal(formData);
      // Navigate immediately on success
      navigate('/deals');
    } catch (err) {
      console.error('Error creating deal:', err);
      setError('Failed to create deal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate('/deals');

  const getFieldError = (fieldName) => {
    return touched[fieldName] && fieldErrors[fieldName] ? (
      <span style={{ display: 'flex', alignItems: 'center', color: '#ff4444' }}>
        ✗ {fieldErrors[fieldName][0]}
      </span>
    ) : '';
  };

  const isFieldInvalid = (fieldName) => fieldErrors[fieldName]?.length > 0;

  const isFormValid = () => {
    // Define dropdown fields that contain numeric IDs
    const dropdownFields = ['AccountID', 'DealStageID', 'CurrencyID'];
    
    // Check required fields with safe type handling
    if (!formData.AccountID || formData.AccountID === '') {
      return false;
    }
    if (!formData.DealName || (typeof formData.DealName === 'string' && formData.DealName.trim() === '')) {
      return false;
    }
    if (!formData.Value || (typeof formData.Value === 'string' && formData.Value.trim() === '')) {
      return false;
    }

    // Check if there are any validation errors
    const allErrors = {};
    Object.keys(formData).forEach(key => {
      const errors = validateField(key, formData[key]);
      if (errors.length > 0) {
        allErrors[key] = errors;
      }
    });

    return Object.keys(allErrors).length === 0;
  };

  const accountService = {
    getAll: async () => {
      try {
        console.log('=== ACCOUNT SERVICE DEBUG ===');
        console.log('Account Service: Fetching accounts from /accounts...');
        const response = await getAllAccounts();
        console.log('Account Service: Response:', response);
        console.log('Account Service: Response type:', typeof response);
        console.log('Account Service: Is array:', Array.isArray(response));
        console.log('Account Service: Length:', response?.length);
        console.log('================================');
        return response.data || response;
      } catch (error) {
        console.error('Account Service: Error:', error);
        return [];
      }
    },
  };

  // Create a custom currency service with detailed logging
  const currencyServiceWithLogging = {
    getAll: async () => {
      try {
        console.log('=== CURRENCY SERVICE DEBUG ===');
        console.log('Currency Service: Fetching currencies from /currencies...');
        const response = await currencyService.getAll();
        console.log('Currency Service: Response:', response);
        console.log('Currency Service: Response type:', typeof response);
        console.log('Currency Service: Is array:', Array.isArray(response));
        console.log('Currency Service: Length:', response?.length);
        console.log('Currency Service: Sample data:', response?.[0]);
        console.log('================================');
        return response;
      } catch (error) {
        console.error('Currency Service: Error:', error);
        return [];
      }
    },
  };

  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: '100vh', 
      p: 3, 
      backgroundColor: theme.palette.background.default 
    }}>
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary 
          }}>
            Create New Deal
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(-1)}>Back</Button>
            <Button variant="outlined" startIcon={<Clear />} onClick={handleCancel} disabled={isSubmitting}>Cancel</Button>
            <Button
              variant="contained"
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
              onClick={handleSubmit}
              disabled={isSubmitting || !isFormValid()}
            >
              {isSubmitting ? 'Saving...' : 'Save Deal'}
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}

        <Paper elevation={0} sx={{ 
          p: 3,
          backgroundColor: theme.palette.background.paper 
        }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
              <SmartDropdown
                label="Account"
                name="AccountID"
                value={formData.AccountID}
                onChange={handleInputChange}
                onBlur={handleBlur}
                service={accountService}
                displayField="AccountName"
                valueField="AccountID"
                disabled={isSubmitting}
                error={isFieldInvalid('AccountID')}
                helperText={getFieldError('AccountID')}
              />

              <SmartDropdown
                label="Deal Stage"
                name="DealStageID"
                value={formData.DealStageID}
                onChange={handleInputChange}
                onBlur={handleBlur}
                service={dealStageService}
                displayField="StageName"
                valueField="DealStageID"
                disabled={isSubmitting}
                error={isFieldInvalid('DealStageID')}
                helperText={getFieldError('DealStageID')}
              />

              <TextField
                label="Deal Name"
                name="DealName"
                value={formData.DealName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                fullWidth
                required
                error={isFieldInvalid('DealName')}
                helperText={getFieldError('DealName') || 'Enter deal name (min 2 characters)'}
                placeholder="Enter deal name"
              />

              <TextField
                label="Value"
                name="Value"
                type="number"
                inputProps={{ step: "0.01", min: 0 }}
                value={formData.Value}
                onChange={handleInputChange}
                onBlur={handleBlur}
                fullWidth
                required
                error={isFieldInvalid('Value')}
                helperText={getFieldError('Value') || 'Enter amount (e.g., 99.99)'}
                placeholder="0.00"
              />

              <TextField
                label="Close Date (Optional)"
                name="CloseDate"
                type="date"
                value={formData.CloseDate}
                onChange={handleInputChange}
                onBlur={handleBlur}
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={isFieldInvalid('CloseDate')}
                helperText={getFieldError('CloseDate') || 'Select future date (optional)'}
              />

              <TextField
                label="Probability (%)"
                name="Probability"
                type="number"
                inputProps={{ min: 0, max: 100 }}
                value={formData.Probability}
                onChange={handleInputChange}
                onBlur={handleBlur}
                fullWidth
                error={isFieldInvalid('Probability')}
                helperText={getFieldError('Probability') || 'Enter percentage (0-100)'}
                placeholder="0"
              />

              <SmartDropdown
                label="Currency"
                name="CurrencyID"
                value={formData.CurrencyID}
                onChange={handleInputChange}
                onBlur={handleBlur}
                service={currencyServiceWithLogging}
                displayField="EnglishName"
                valueField="CurrencyID"
                disabled={isSubmitting}
                error={isFieldInvalid('CurrencyID')}
                helperText={getFieldError('CurrencyID') || 'Select currency (e.g., USD - US Dollar)'}
                placeholder="Search for currency..."
              />
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default CreateDealPage;