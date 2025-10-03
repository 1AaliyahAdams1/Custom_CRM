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
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../components/Theme';
import { createSequence } from '../../services/sequenceService';

const CreateSequencesPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    SequenceName: '',
    SequenceDescription: '',
    Active: true,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const requiredFields = ['SequenceName'];

  const validateField = (name, value) => {
    const errors = [];
    const strValue = value?.toString().trim();

    if (requiredFields.includes(name) && (!strValue || strValue === '')) {
      errors.push('This field is required.');
    }

    if (strValue) {
      if (name === 'SequenceName') {
        if (strValue.length < 3) {
          errors.push('Sequence name must be at least 3 characters long.');
        }
        if (strValue.length > 255) {
          errors.push('Sequence name cannot exceed 255 characters.');
        }
      }

      if (name === 'SequenceDescription') {
        if (strValue.length > 2000) {
          errors.push('Description cannot exceed 2000 characters.');
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
      const result = await createSequence(formData);
      setSuccessMessage('Sequence created successfully!');
      setTimeout(() => navigate('/sequences'), 1500);
    } catch (err) {
      console.error('Error creating sequence:', err);
      setError('Failed to create sequence. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate('/sequences');

  const getFieldError = (fieldName) => {
    return touched[fieldName] && fieldErrors[fieldName] ? (
      <span style={{ display: 'flex', alignItems: 'center', color: '#ff4444' }}>
        ✗ {fieldErrors[fieldName][0]}
      </span>
    ) : '';
  };

  const isFieldInvalid = (fieldName) => touched[fieldName] && fieldErrors[fieldName]?.length > 0;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Create New Sequence
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
                {isSubmitting ? 'Saving...' : 'Save Sequence'}
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
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Sequence Information
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
                <TextField
                  label="Sequence Name"
                  name="SequenceName"
                  value={formData.SequenceName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  fullWidth
                  required
                  disabled={isSubmitting}
                  error={isFieldInvalid('SequenceName')}
                  helperText={getFieldError('SequenceName')}
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Description"
                  name="SequenceDescription"
                  value={formData.SequenceDescription}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  fullWidth
                  multiline
                  rows={4}
                  disabled={isSubmitting}
                  error={isFieldInvalid('SequenceDescription')}
                  helperText={getFieldError('SequenceDescription') || 'Optional: Describe the purpose and workflow of this sequence'}
                  sx={{ mb: 2 }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.Active}
                      onChange={handleInputChange}
                      name="Active"
                      disabled={isSubmitting}
                    />
                  }
                  label="Active (sequence is ready to use)"
                />
                {touched.Active && fieldErrors.Active && (
                  <Box sx={{ color: '#ff4444', mt: 0.5 }}>{fieldErrors.Active[0]}</Box>
                )}
              </Box>
            </form>

            {/* Information Panel */}
            <Paper 
              elevation={0} 
              sx={{ 
                mt: 4, 
                p: 3, 
                backgroundColor: '#f8f9fa', 
                border: '1px solid #e9ecef' 
              }}
            >
            </Paper>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default CreateSequencesPage;