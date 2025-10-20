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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { ArrowBack, Save, Clear } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../components/Theme';
import api from '../../utils/api';

const EditSequenceItemPage = () => {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const [formData, setFormData] = useState({
    SequenceID: '',
    ActivityTypeID: '',
    SequenceItemDescription: '',
    DaysFromStart: 0,
    Active: true,
  });
  
  const [sequences, setSequences] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const requiredFields = ['SequenceID', 'ActivityTypeID', 'SequenceItemDescription', 'DaysFromStart'];

  const validateField = (name, value) => {
    const errors = [];
    const strValue = value?.toString().trim();

    if (requiredFields.includes(name) && (!strValue || strValue === '')) {
      errors.push('This field is required.');
    }

    if (name === 'SequenceItemDescription' && strValue) {
      if (strValue.length > 255) {
        errors.push('Description cannot exceed 255 characters.');
      }
    }

    if (name === 'DaysFromStart') {
      const days = parseInt(value, 10);
      if (isNaN(days)) {
        errors.push('Must be a number');
      } else if (days < 0) {
        errors.push('Cannot be negative');
      } else if (days > 32767) {
        errors.push('Cannot exceed 32767');
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
    const loadData = async () => {
      if (!itemId) {
        setError("No sequence item ID provided");
        setLoading(false);
        return;
      }
      try {
        const [itemRes, sequencesRes, typesRes] = await Promise.all([
          api.get(`/sequences/items/${itemId}`),
          api.get('/sequences'),
          api.get('/sequences/activity-types')
        ]);
        
        const itemData = itemRes.data;
        setFormData({
          SequenceID: itemData.SequenceID || '',
          ActivityTypeID: itemData.ActivityTypeID || '',
          SequenceItemDescription: itemData.SequenceItemDescription || '',
          DaysFromStart: itemData.DaysFromStart || 0,
          Active: itemData.Active !== undefined ? itemData.Active : true,
        });
        setSequences(sequencesRes.data || []);
        setActivityTypes(typesRes.data || []);
      } catch (err) {
        console.error('Error loading data:', err);
        setError("Failed to load sequence item data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [itemId]);

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
      
      const payload = {
        ActivityTypeID: parseInt(formData.ActivityTypeID, 10),
        SequenceItemDescription: formData.SequenceItemDescription,
        DaysFromStart: parseInt(formData.DaysFromStart, 10),
      };
      
      await api.put(`/sequences/items/${itemId}`, payload);
      setSuccessMessage("Sequence item updated successfully!");
      setTimeout(() => navigate("/sequences/items"), 1500);
    } catch (error) {
      console.error('Error updating sequence item:', error);
      
      if (error.response?.status === 400) {
        setError(error.response.data?.error || 'Invalid data provided');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later');
      } else {
        setError('Failed to update sequence item. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (fieldName) => {
    return touched[fieldName] && fieldErrors[fieldName] ? (
      <span style={{ display: 'flex', alignItems: 'center', color: '#ff4444' }}>
         {fieldErrors[fieldName][0]}
      </span>
    ) : '';
  };

  const isFieldInvalid = (fieldName) => touched[fieldName] && fieldErrors[fieldName]?.length > 0;

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
              Edit Sequence Item
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
                Back
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<Clear />} 
                onClick={() => navigate("/sequences/items")} 
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
                {isSubmitting ? 'Updating...' : 'Update Item'}
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
              Sequence Item Information
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
                <FormControl fullWidth required disabled>
                  <InputLabel>Sequence</InputLabel>
                  <Select
                    name="SequenceID"
                    value={formData.SequenceID}
                    label="Sequence"
                  >
                    <MenuItem value="">
                      <em>Select Sequence</em>
                    </MenuItem>
                    {sequences.map(sequence => (
                      <MenuItem key={sequence.SequenceID} value={sequence.SequenceID}>
                        {sequence.SequenceName}
                      </MenuItem>
                    ))}
                  </Select>
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                    Sequence cannot be changed after creation
                  </Typography>
                </FormControl>

                <FormControl fullWidth required error={isFieldInvalid('ActivityTypeID')}>
                  <InputLabel>Activity Type</InputLabel>
                  <Select
                    name="ActivityTypeID"
                    value={formData.ActivityTypeID}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    label="Activity Type"
                    disabled={isSubmitting}
                  >
                    <MenuItem value="">
                      <em>Select Activity Type</em>
                    </MenuItem>
                    {activityTypes.map(type => (
                      <MenuItem key={type.TypeID} value={type.TypeID}>
                        {type.TypeName}
                      </MenuItem>
                    ))}
                  </Select>
                  {getFieldError('ActivityTypeID') && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {getFieldError('ActivityTypeID')}
                    </Typography>
                  )}
                </FormControl>

                <TextField
                  label="Description"
                  name="SequenceItemDescription"
                  value={formData.SequenceItemDescription}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  fullWidth
                  required
                  multiline
                  rows={4}
                  disabled={isSubmitting}
                  error={isFieldInvalid('SequenceItemDescription')}
                  helperText={getFieldError('SequenceItemDescription') || 'Describe this activity step'}
                  FormHelperTextProps={{ component: 'div' }}
                />

                <TextField
                  label="Days From Start"
                  name="DaysFromStart"
                  type="number"
                  value={formData.DaysFromStart}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  fullWidth
                  required
                  disabled={isSubmitting}
                  error={isFieldInvalid('DaysFromStart')}
                  helperText={getFieldError('DaysFromStart') || 'Number of days from sequence start'}
                  InputProps={{ inputProps: { min: 0, max: 32767 } }}
                  FormHelperTextProps={{ component: 'div' }}
                />
              </Box>
            </form>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default EditSequenceItemPage;