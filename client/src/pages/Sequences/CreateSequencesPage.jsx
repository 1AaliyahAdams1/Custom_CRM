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
  Checkbox,
  FormControlLabel,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
} from '@mui/material';
import { ArrowBack, Save, Clear, Add, Delete, DragIndicator } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../components/Theme';
import api from '../../utils/api';

const CreateSequencesPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    SequenceName: '',
    SequenceDescription: '',
    Active: true,
  });
  const [items, setItems] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [itemErrors, setItemErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingActivityTypes, setLoadingActivityTypes] = useState(true);

  const requiredFields = ['SequenceName'];

  // Fetch activity types on mount
  useEffect(() => {
    const fetchActivityTypes = async () => {
      try {
        const response = await api.get('/sequences/activity-types');
        setActivityTypes(response.data || []);
      } catch (err) {
        console.error('Error fetching activity types:', err);
        setError('Failed to load activity types');
      } finally {
        setLoadingActivityTypes(false);
      }
    };
    fetchActivityTypes();
  }, []);

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
        if (strValue.length > 4000) {
          errors.push('Description cannot exceed 4000 characters.');
        }
      }
    }

    return errors;
  };

  const validateItem = (item, index) => {
    const errors = {};

    if (!item.ActivityTypeID) {
      errors.ActivityTypeID = 'Activity type is required';
    }

    if (!item.SequenceItemDescription || item.SequenceItemDescription.trim() === '') {
      errors.SequenceItemDescription = 'Description is required';
    } else if (item.SequenceItemDescription.length > 255) {
      errors.SequenceItemDescription = 'Description cannot exceed 255 characters';
    }

    if (item.DaysFromStart === undefined || item.DaysFromStart === null || item.DaysFromStart === '') {
      errors.DaysFromStart = 'Days from start is required';
    } else {
      const days = parseInt(item.DaysFromStart, 10);
      if (isNaN(days)) {
        errors.DaysFromStart = 'Must be a number';
      } else if (days < 0) {
        errors.DaysFromStart = 'Cannot be negative';
      } else if (days > 32767) {
        errors.DaysFromStart = 'Cannot exceed 32767';
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

    // Validate items
    const newItemErrors = {};
    items.forEach((item, index) => {
      const itemErrs = validateItem(item, index);
      if (Object.keys(itemErrs).length > 0) {
        newItemErrors[index] = itemErrs;
      }
    });
    setItemErrors(newItemErrors);

    // Check for duplicate days
    const daysValues = items.map(item => parseInt(item.DaysFromStart, 10)).filter(d => !isNaN(d));
    const duplicates = daysValues.filter((day, index) => daysValues.indexOf(day) !== index);
    if (duplicates.length > 0) {
      setError(`Duplicate days found: ${[...new Set(duplicates)].join(', ')}. Each item must have a unique day value.`);
      return false;
    }

    return Object.keys(newErrors).length === 0 && Object.keys(newItemErrors).length === 0;
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

  const handleAddItem = () => {
    const newItem = {
      ActivityTypeID: '',
      SequenceItemDescription: '',
      DaysFromStart: items.length,
      Active: true,
      tempId: Date.now(),
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    
    // Remove errors for this item
    const newItemErrors = { ...itemErrors };
    delete newItemErrors[index];
    
    // Reindex errors
    const reindexedErrors = {};
    Object.keys(newItemErrors).forEach(key => {
      const numKey = parseInt(key, 10);
      if (numKey > index) {
        reindexedErrors[numKey - 1] = newItemErrors[key];
      } else {
        reindexedErrors[key] = newItemErrors[key];
      }
    });
    setItemErrors(reindexedErrors);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);

    // Validate this field
    const itemErrs = validateItem(newItems[index], index);
    const newItemErrors = { ...itemErrors };
    
    if (Object.keys(itemErrs).length === 0) {
      delete newItemErrors[index];
    } else {
      newItemErrors[index] = itemErrs;
    }
    
    setItemErrors(newItemErrors);
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (items.length === 0) {
      setError('Please add at least one sequence item');
      return;
    }

    const isValid = validateForm();
    if (!isValid) {
      setError('Please fix the errors before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        sequence: formData,
        items: items.map(item => ({
          ActivityTypeID: parseInt(item.ActivityTypeID, 10),
          SequenceItemDescription: item.SequenceItemDescription,
          DaysFromStart: parseInt(item.DaysFromStart, 10),
          Active: item.Active !== undefined ? item.Active : true,
        }))
      };

      await api.post('/sequences/with-items', payload);
      setSuccessMessage('Sequence created successfully!');
      setTimeout(() => navigate('/sequences'), 1500);
    } catch (err) {
      console.error('Error creating sequence:', err);
      setError(err.response?.data?.error || 'Failed to create sequence. Please try again.');
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

  const getItemError = (index, field) => {
    return itemErrors[index]?.[field] || '';
  };

  const sortItemsByDay = () => {
    const sorted = [...items].sort((a, b) => {
      const dayA = parseInt(a.DaysFromStart, 10);
      const dayB = parseInt(b.DaysFromStart, 10);
      return dayA - dayB;
    });
    setItems(sorted);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
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
                disabled={isSubmitting || loadingActivityTypes}
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

          {/* Sequence Information */}
          <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Sequence Information
            </Typography>
            
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
                helperText={getFieldError('SequenceDescription') || 'Describe the purpose and workflow of this sequence'}
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
            </Box>
          </Paper>

          {/* Sequence Items */}
          <Paper elevation={0} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Sequence Items
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {items.length > 1 && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={sortItemsByDay}
                    disabled={isSubmitting}
                  >
                    Sort by Day
                  </Button>
                )}
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddItem}
                  disabled={isSubmitting || loadingActivityTypes}
                  sx={{ backgroundColor: '#050505', '&:hover': { backgroundColor: '#333' } }}
                >
                  Add Item
                </Button>
              </Box>
            </Box>

            {loadingActivityTypes ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : items.length === 0 ? (
              <Box
                sx={{
                  p: 4,
                  textAlign: 'center',
                  backgroundColor: '#f5f5f5',
                  borderRadius: 1,
                  border: '2px dashed #ccc',
                }}
              >
                <Typography variant="body1" color="textSecondary">
                  No sequence items yet. Click "Add Item" to create your first step.
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width="50"></TableCell>
                      <TableCell width="100">Day *</TableCell>
                      <TableCell width="200">Activity Type *</TableCell>
                      <TableCell>Description *</TableCell>
                      <TableCell width="100">Active</TableCell>
                      <TableCell width="80">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={item.tempId} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                        <TableCell>
                          <DragIndicator sx={{ color: '#999', cursor: 'move' }} />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={item.DaysFromStart}
                            onChange={(e) => handleItemChange(index, 'DaysFromStart', e.target.value)}
                            size="small"
                            fullWidth
                            error={!!getItemError(index, 'DaysFromStart')}
                            helperText={getItemError(index, 'DaysFromStart')}
                            disabled={isSubmitting}
                            inputProps={{ min: 0, max: 32767 }}
                          />
                        </TableCell>
                        <TableCell>
                          <FormControl fullWidth size="small" error={!!getItemError(index, 'ActivityTypeID')}>
                            <Select
                              value={item.ActivityTypeID}
                              onChange={(e) => handleItemChange(index, 'ActivityTypeID', e.target.value)}
                              disabled={isSubmitting}
                              displayEmpty
                            >
                              <MenuItem value="">
                                <em>Select type</em>
                              </MenuItem>
                              {activityTypes.map((type) => (
                                <MenuItem key={type.TypeID} value={type.TypeID}>
                                  {type.TypeName}
                                </MenuItem>
                              ))}
                            </Select>
                            {getItemError(index, 'ActivityTypeID') && (
                              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                                {getItemError(index, 'ActivityTypeID')}
                              </Typography>
                            )}
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={item.SequenceItemDescription}
                            onChange={(e) => handleItemChange(index, 'SequenceItemDescription', e.target.value)}
                            size="small"
                            fullWidth
                            multiline
                            rows={2}
                            error={!!getItemError(index, 'SequenceItemDescription')}
                            helperText={getItemError(index, 'SequenceItemDescription')}
                            disabled={isSubmitting}
                            placeholder="E.g., Welcome call to introduce services"
                          />
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={item.Active !== false}
                            onChange={(e) => handleItemChange(index, 'Active', e.target.checked)}
                            disabled={isSubmitting}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Remove this item">
                            <IconButton
                              onClick={() => handleRemoveItem(index)}
                              disabled={isSubmitting}
                              size="small"
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {items.length > 0 && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Tip:</strong> Sequence items represent steps in your workflow. 
                  The "Day" field indicates when each step should occur relative to when the sequence starts.
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default CreateSequencesPage;