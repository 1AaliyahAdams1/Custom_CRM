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
import SmartDropdown from '../../components/SmartDropdown';
import { createDeal } from '../../services/dealService';
import { getAllAccounts } from '../../services/accountService';
import { getAllCurrencies } from '../../services/currencyService';
import { dealStageService } from '../../services/dropdownServices';

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
  const [successMessage, setSuccessMessage] = useState('');

  const requiredFields = ['AccountID', 'DealStageID', 'DealName', 'Value', 'CloseDate', 'Probability', 'CurrencyID'];

  const validateField = (name, value) => {
    const errors = [];
    const strValue = (value ?? '').toString().trim();

    if (requiredFields.includes(name) && !strValue) {
      errors.push('This field is required.');
    }

    if (strValue) {
      if (name === 'DealName') {
        if (strValue.length < 3) errors.push('Deal name must be at least 3 characters.');
        else if (!/^[A-Za-z\s]+$/.test(strValue)) errors.push('Deal name should only contain letters and spaces.');
      }
      if (name === 'Value') {
        if (isNaN(strValue) || Number(strValue) < 0) errors.push('Please enter a valid positive numeric value.');
      }
      if (name === 'Probability') {
        const num = Number(strValue);
        if (isNaN(num)) errors.push('Please enter a valid number.');
        else if (num < 0 || num > 100) errors.push('Probability must be between 0 and 100.');
      }
      if (name === 'CloseDate') {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(strValue)) errors.push('Please enter a valid date in YYYY-MM-DD format.');
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
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const errors = validateField(name, value);
      setFieldErrors((prev) => ({ ...prev, [name]: errors.length > 0 ? errors : undefined }));
    }

    if (error) setError(null);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const errors = validateField(name, value);
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
      setSuccessMessage('Deal created successfully!');
      setTimeout(() => navigate('/deals'), 1500);
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

  const isFieldInvalid = (fieldName) => touched[fieldName] && fieldErrors[fieldName]?.length > 0;

  const accountService = {
    getAll: async () => {
      try {
        const response = await getAllAccounts();
        return response.data || response;
      } catch {
        return [];
      }
    },
  };

  const currencyService = {
    getAll: async () => {
      try {
        const response = await getAllCurrencies();
        return response.data || response;
      } catch {
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Deal'}
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>{successMessage}</Alert>}

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
                error={isFieldInvalid('DealName')}
                helperText={getFieldError('DealName')}
              />

              <TextField
                label="Value"
                name="Value"
                type="text"
                value={formData.Value}
                onChange={handleInputChange}
                onBlur={handleBlur}
                fullWidth
                error={isFieldInvalid('Value')}
                helperText={getFieldError('Value')}
              />

              <SmartDropdown
                label="Currency"
                name="CurrencyID"
                value={formData.CurrencyID}
                onChange={handleInputChange}
                onBlur={handleBlur}
                service={currencyService}
                displayField="LocalName"
                valueField="CurrencyID"
                disabled={isSubmitting}
                error={isFieldInvalid('CurrencyID')}
                helperText={getFieldError('CurrencyID')}
              />

              <TextField
                label="Close Date"
                name="CloseDate"
                type="date"
                value={formData.CloseDate}
                onChange={handleInputChange}
                onBlur={handleBlur}
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={isFieldInvalid('CloseDate')}
                helperText={getFieldError('CloseDate')}
              />

              <TextField
                label="Probability (%)"
                name="Probability"
                type="number"
                value={formData.Probability}
                onChange={handleInputChange}
                onBlur={handleBlur}
                fullWidth
                error={isFieldInvalid('Probability')}
                helperText={getFieldError('Probability')}
              />
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default CreateDealPage;