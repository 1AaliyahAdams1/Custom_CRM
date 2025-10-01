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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { ArrowBack, Save, Clear } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { fetchSequenceById, updateSequence } from "../../services/sequenceService";
import theme from "../../components/Theme";

const EditSequencesPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const [formData, setFormData] = useState({
    SequenceName: "",
    SequenceDescription: "",
    Active: true,
  });
  
  const [loading, setLoading] = useState(true);

  const requiredFields = ['SequenceName'];

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

  useEffect(() => {
    const loadSequence = async () => {
      if (!id) {
        setError("No sequence ID provided");
        setLoading(false);
        return;
      }
      try {
        const response = await fetchSequenceById(id);
        const sequenceData = response.data || response;
        setFormData({
          SequenceName: sequenceData.SequenceName || "",
          SequenceDescription: sequenceData.SequenceDescription || "",
          Active: sequenceData.Active !== undefined ? sequenceData.Active : true,
        });
      } catch (err) {
        console.error('Error loading sequence:', err);
        setError("Failed to load sequence data");
      } finally {
        setLoading(false);
      }
    };
    loadSequence();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: val }));

    setTouched(prev => ({ ...prev, [name]: true }));

    if (touched[name]) {
      const errors = validateField(name, val);
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
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setTouched(prev => ({ ...prev, [name]: true }));

    const errors = validateField(name, val);
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

    try {
      setIsSubmitting(true);
      setError(null);
      await updateSequence(id, formData);
      setSuccessMessage("Sequence updated successfully!");
      setTimeout(() => navigate("/sequences"), 1500);
    } catch (error) {
      console.error('Error updating sequence:', error);
      
      if (error.response?.status === 409) {
        setError('Sequence with this name already exists');
      } else if (error.response?.status === 400) {
        setError(error.response.data?.error || 'Invalid data provided');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later');
      } else {
        setError('Failed to update sequence. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ p: 3 }}>
          <Skeleton variant="rectangular" width="100%" height={400} />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 900, mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Edit Sequence
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
                Back
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<Clear />} 
                onClick={() => navigate("/sequences")} 
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
                {isSubmitting ? 'Updating...' : 'Update Sequence'}
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
                  FormHelperTextProps={{ component: 'div' }}
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
                  FormHelperTextProps={{ component: 'div' }}
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

export default EditSequencesPage;