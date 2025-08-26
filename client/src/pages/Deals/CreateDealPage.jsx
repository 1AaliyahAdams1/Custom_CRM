import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
<<<<<<< HEAD
  Button,
  Grid,
  Box,
  TextField,
  Typography
} from '@mui/material';
import { createDeal } from '../../services/dealService';
import { getAllAccounts } from '../../services/accountService';
import SmartDropdown from '../../components/SmartDropdown';
=======
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Save, Clear } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../components/Theme';
import SmartDropdown from '../../components/SmartDropdown';
import { createDeal } from '../../services/dealService';
import { getAllAccounts } from '../../services/accountService';
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
import { dealStageService } from '../../services/dropdownServices';

const CreateDealPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
<<<<<<< HEAD
    DealID: "",
    AccountID: "",
    DealStageID: "",
    DealName: "",
    Value: "",
    CloseDate: "",
    Probability: "",
    CurrencyID: "",
    CreatedAt: "",
    UpdatedAt: "",
  });

  // Account service wrapper for dropdown - matching your pattern
=======
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

>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
  const accountService = {
    getAll: async () => {
      try {
        const response = await getAllAccounts();
<<<<<<< HEAD
        return response.data || [];
      } catch (error) {
        console.error('Error loading accounts:', error);
=======
        return response.data || response;
      } catch {
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
        return [];
      }
    },
  };

<<<<<<< HEAD
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Creating deal:', formData);
      await createDeal(formData);
      navigate('/deals');
    } catch (error) {
      console.error('Error creating deal:', error);
      alert('Failed to create deal. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/deals');
  };

  return (
    <Box p={4} maxWidth={900} mx="auto">
      {/* Page Title */}
      <Typography variant="h4" gutterBottom>
        Create New Deal
      </Typography>
      {/* Buttons at the top */}
      <Box mb={3} display="flex" justifyContent="flex-end" gap={2}>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Back
        </Button>
        <Button variant="outlined" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Save
        </Button>
      </Box>

      <Grid item xs={20} sm={10}>
        <SmartDropdown
          label="Account ID"
          name="AccountID"
          value={formData.AccountID}
          onChange={handleInputChange}
          service={accountService}
          displayField="AccountName"
          valueField="AccountID"
          // onCreateNewClick={() => setShowAccountPopup(true)}
          fullWidth
        />

        <SmartDropdown
          label="Deal Stage ID"
          name="DealStageID"
          value={formData.DealStageID}
          onChange={handleInputChange}
          service={dealStageService}
          displayField="StageName"
          valueField="DealStageID"
          // onCreateNewClick={() => setShowDealStagePopup(true)}
          fullWidth
        />


        <TextField
          label="Deal Name"
          name="DealName"
          value={formData.DealName}
          onChange={handleInputChange}
          fullWidth
        />

        <TextField
          label="Value"
          name="Value"
          value={formData.Value}
          onChange={handleInputChange}
          fullWidth
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          label="CloseDate"
          name="CloseDate"
          value={formData.CloseDate}
          onChange={handleInputChange}
          fullWidth
        />

        <TextField
          label="Probability"
          name="Probability"
          value={formData.Probability}
          onChange={handleInputChange}
          fullWidth
        />

        <TextField
          label="CurrencyID"
          name="CurrencyID"
          value={formData.CurrencyID}
          onChange={handleInputChange}
          fullWidth
        />
        
      </Grid>
    </Box>
  );
};

export default CreateDealPage;
=======
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', minHeight: '100vh', p: 3, backgroundColor: '#fafafa' }}>
        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>Create New Deal</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(-1)}>Back</Button>
              <Button variant="outlined" startIcon={<Clear />} onClick={handleCancel} disabled={isSubmitting}>Cancel</Button>
              <Button
                variant="contained"
                startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
                onClick={handleSubmit}
                disabled={isSubmitting}
                sx={{ backgroundColor: '#050505', '&:hover': { backgroundColor: '#333' } }}
              >
                {isSubmitting ? 'Saving...' : 'Save Deal'}
              </Button>
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
          {successMessage && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>{successMessage}</Alert>}

          <Paper elevation={0} sx={{ p: 3 }}>
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
                  type="number"
                  value={formData.Value}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  fullWidth
                  error={isFieldInvalid('Value')}
                  helperText={getFieldError('Value')}
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

                <TextField
                  label="Currency ID"
                  name="CurrencyID"
                  value={formData.CurrencyID}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  fullWidth
                  error={isFieldInvalid('CurrencyID')}
                  helperText={getFieldError('CurrencyID')}
                />
              </Box>
            </form>
          </Paper>

        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default CreateDealPage;
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
