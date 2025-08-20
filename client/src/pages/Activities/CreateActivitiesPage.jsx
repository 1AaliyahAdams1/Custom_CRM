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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { ArrowBack, Save, Clear } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import theme from '../../components/Theme';
import SmartDropdown from '../../components/SmartDropdown';
import { createActivity } from '../../services/activityService';
import { getAllAccounts } from '../../services/accountService';
import { activityTypeService, priorityLevelService } from '../../services/dropdownServices';

const CreateActivitiesPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    AccountID: '',
    TypeID: '',
    PriorityLevelID: '',
    DueToStart: '',
    DueToEnd: '',
    Completed: false,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const requiredFields = ['AccountID', 'TypeID', 'PriorityLevelID', 'DueToStart', 'DueToEnd'];

  const validateField = (name, value) => {
    const errors = [];
    const strValue = value?.toString().trim();

    if (requiredFields.includes(name) && (!strValue || strValue === '')) {
      errors.push('This field is required.');
    }

    if (strValue) {
      if (name === 'DueToStart') {
        const startDate = new Date(strValue);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (isNaN(startDate.getTime())) errors.push('Please enter a valid date and time.');
        else if (startDate < today) errors.push('Start date cannot be in the past.');
      }

      if (name === 'DueToEnd') {
        const endDate = new Date(strValue);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (isNaN(endDate.getTime())) errors.push('Please enter a valid date and time.');
        else if (endDate < today) errors.push('End date cannot be in the past.');
        if (formData.DueToStart) {
          const startDate = new Date(formData.DueToStart);
          if (endDate <= startDate) errors.push('End date must be after start date.');
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
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: val }));

    if (touched[name]) {
      const errors = validateField(name, val);
      setFieldErrors((prev) => ({ ...prev, [name]: errors.length > 0 ? errors : undefined }));
    }

    // Re-validate DueToEnd if DueToStart changes
    if (name === 'DueToStart' && formData.DueToEnd && touched.DueToEnd) {
      const endErrors = validateField('DueToEnd', formData.DueToEnd);
      setFieldErrors((prev) => ({ ...prev, DueToEnd: endErrors.length > 0 ? endErrors : undefined }));
    }

    if (error) setError(null);
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setTouched((prev) => ({ ...prev, [name]: true }));

    const errors = validateField(name, val);
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
      await createActivity(formData);
      setSuccessMessage('Activity created successfully!');
      setTimeout(() => navigate('/activities'), 1500);
    } catch (err) {
      console.error('Error creating activity:', err);
      setError('Failed to create activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate('/activities');

  const getFieldError = (fieldName) => {
    return touched[fieldName] && fieldErrors[fieldName] ? (
      <span style={{ display: 'flex', alignItems: 'center', color: '#ff4444' }}>
        ✗ {fieldErrors[fieldName][0]}
      </span>
    ) : '';
  };

  const isFieldInvalid = (fieldName) => touched[fieldName] && fieldErrors[fieldName]?.length > 0;

  // Dropdown service wrapper
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

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Create New Activity
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
                Back
              </Button>
              <Button variant="outlined" startIcon={<Clear />} onClick={handleCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
                onClick={handleSubmit}
                disabled={isSubmitting}
                sx={{ backgroundColor: '#050505', '&:hover': { backgroundColor: '#333' } }}
              >
                {isSubmitting ? 'Saving...' : 'Save Activity'}
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
                  label="Activity Type"
                  name="TypeID"
                  value={formData.TypeID}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  service={activityTypeService}
                  displayField="TypeName"
                  valueField="TypeID"
                  disabled={isSubmitting}
                  error={isFieldInvalid('TypeID')}
                  helperText={getFieldError('TypeID')}
                />

                <SmartDropdown
                  label="Priority Level"
                  name="PriorityLevelID"
                  value={formData.PriorityLevelID}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  service={priorityLevelService}
                  displayField="PriorityLevelName"
                  valueField="PriorityLevelID"
                  disabled={isSubmitting}
                  error={isFieldInvalid('PriorityLevelID')}
                  helperText={getFieldError('PriorityLevelID')}
                />

                <TextField
                  label="Due To Start"
                  name="DueToStart"
                  type="datetime-local"
                  value={formData.DueToStart}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={isFieldInvalid('DueToStart')}
                  helperText={getFieldError('DueToStart')}
                />

                <TextField
                  label="Due To End"
                  name="DueToEnd"
                  type="datetime-local"
                  value={formData.DueToEnd}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={isFieldInvalid('DueToEnd')}
                  helperText={getFieldError('DueToEnd')}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.Completed}
                      onChange={handleInputChange}
                      name="Completed"
                      disabled={isSubmitting}
                    />
                  }
                  label="Completed"
                />
                {touched.Completed && fieldErrors.Completed && (
                  <Box sx={{ color: '#ff4444', mt: 0.5 }}>{fieldErrors.Completed[0]}</Box>
                )}
              </Box>
            </form>
          </Paper>

        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default CreateActivitiesPage;
