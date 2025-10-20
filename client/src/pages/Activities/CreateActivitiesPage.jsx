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
import { useTheme } from '@mui/material/styles';
import SmartDropdown from '../../components/SmartDropdown';
import { createActivity } from '../../services/activityService';
import { getAllAccounts } from '../../services/accountService';
import { activityTypeService, priorityLevelService } from '../../services/dropdownServices';

const CreateActivitiesPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    AccountID: '',
    TypeID: '',
    PriorityLevelID: '',
    DueToStart: '',
    DueToEnd: '',
    Completed: false,
    SequenceItemID: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const requiredFields = ['AccountID'];

  const validateField = (name, value) => {
    const errors = [];
    const strValue = value?.toString().trim();

    // Required field validation
    if (requiredFields.includes(name) && (!strValue || strValue === '')) {
      errors.push('This field is required.');
    }

    // Only validate if field has value or is required
    if (strValue || requiredFields.includes(name)) {
      switch (name) {
        case 'AccountID':
          if (!strValue || strValue === '') {
            errors.push('Account selection is required.');
          }
          break;

        case 'TypeID':
          // Optional field - only validate if value is provided
          if (strValue && strValue !== '') {
            // Validate it's a valid ID (numeric)
            if (!/^\d+$/.test(strValue)) {
              errors.push('Please select a valid activity type.');
            }
          }
          break;

        case 'PriorityLevelID':
          // Optional field - only validate if value is provided
          if (strValue && strValue !== '') {
            // Validate it's a valid ID (numeric)
            if (!/^\d+$/.test(strValue)) {
              errors.push('Please select a valid priority level.');
            }
          }
          break;

        case 'SequenceItemID':
          // Optional number field with min=0
          if (strValue && strValue !== '') {
            const numValue = parseFloat(strValue);
            if (isNaN(numValue)) {
              errors.push('Please enter a valid number.');
            } else if (numValue < 0) {
              errors.push('Sequence item ID must be 0 or greater.');
            } else if (!Number.isInteger(numValue)) {
              errors.push('Sequence item ID must be a whole number.');
            }
          }
          break;

        case 'DueToStart':
          if (strValue && strValue !== '') {
            const startDate = new Date(strValue);
            if (isNaN(startDate.getTime())) {
              errors.push('Please enter a valid date and time.');
            }
          }
          break;

        case 'DueToEnd':
          if (strValue && strValue !== '') {
            const endDate = new Date(strValue);
            if (isNaN(endDate.getTime())) {
              errors.push('Please enter a valid date and time.');
            } else if (formData.DueToStart) {
              const startDate = new Date(formData.DueToStart);
              if (!isNaN(startDate.getTime()) && endDate <= startDate) {
                errors.push('End date must be after start date.');
              }
            }
          }
          break;

        case 'Completed':
          // Checkbox validation - should be boolean
          if (typeof value !== 'boolean') {
            errors.push('Completed must be true or false.');
          }
          break;
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

  const isFormValid = () => {
    // Check if all required fields are valid
    const requiredFieldValid = requiredFields.every(field => {
      const errors = validateField(field, formData[field]);
      return errors.length === 0;
    });

    // Check if all non-empty fields are valid
    const allFieldsValid = Object.keys(formData).every(field => {
      const value = formData[field];
      const strValue = value?.toString().trim();
      
      // If field is empty and not required, it's valid
      if ((!strValue || strValue === '') && !requiredFields.includes(field)) {
        return true;
      }
      
      // If field has value, validate it
      const errors = validateField(field, value);
      return errors.length === 0;
    });

    return requiredFieldValid && allFieldsValid;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: val }));

    // Always validate the changed field
    const errors = validateField(name, val);
    setFieldErrors((prev) => ({ ...prev, [name]: errors.length > 0 ? errors : undefined }));

    // Re-validate DueToEnd if DueToStart changes
    if (name === 'DueToStart' && formData.DueToEnd) {
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
      navigate('/activities');
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
         {fieldErrors[fieldName][0]}
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
    <Box sx={{ 
      width: '100%', 
      backgroundColor: theme.palette.background.default, 
      minHeight: '100vh', 
      p: 3 
    }}>
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" sx={{ 
            color: theme.palette.text.primary,
            fontWeight: 600 
          }}>
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
              disabled={isSubmitting || !isFormValid()}
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

              <TextField
                label="Sequence Item ID"
                name="SequenceItemID"
                type="number"
                value={formData.SequenceItemID}
                onChange={handleInputChange}
                onBlur={handleBlur}
                fullWidth
                inputProps={{ min: 0 }}
                error={isFieldInvalid('SequenceItemID')}
                helperText={getFieldError('SequenceItemID')}
                disabled={isSubmitting}
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
  );
};

export default CreateActivitiesPage;