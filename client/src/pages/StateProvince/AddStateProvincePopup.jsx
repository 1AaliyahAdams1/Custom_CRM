import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const AddStateProvincePopup = ({ 
  open, 
  onClose, 
  onSave, 
  countries = [], 
  loading = false,
  error = null 
}) => {
  const [formData, setFormData] = useState({
    StateProvince_Name: '',
    CountryID: '',
    Active: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        StateProvince_Name: '',
        CountryID: '',
        Active: true
      });
      setFormErrors({});
      setIsSubmitting(false);
    }
  }, [open]);

  const validateForm = () => {
    const errors = {};

    if (!formData.StateProvince_Name.trim()) {
      errors.StateProvince_Name = 'State/Province name is required';
    } else if (formData.StateProvince_Name.length > 100) {
      errors.StateProvince_Name = 'State/Province name must be 100 characters or less';
    }

    if (!formData.CountryID) {
      errors.CountryID = 'Country selection is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field) => (event) => {
    const value = field === 'Active' ? event.target.checked : event.target.value;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing/selecting
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare data for submission
      const submitData = {
        StateProvince_Name: formData.StateProvince_Name.trim(),
        CountryID: parseInt(formData.CountryID),
        Active: formData.Active
      };

      await onSave(submitData);
      
      // Close dialog on successful save
      onClose();
    } catch (err) {
      console.error('Error saving state/province:', err);
      // Error handling is managed by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: 400
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Add New State/Province
        </Typography>
        <IconButton
          onClick={handleClose}
          disabled={isSubmitting}
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* State/Province Name Field */}
            <TextField
              label="State/Province Name"
              value={formData.StateProvince_Name}
              onChange={handleInputChange('StateProvince_Name')}
              error={!!formErrors.StateProvince_Name}
              helperText={formErrors.StateProvince_Name}
              fullWidth
              required
              variant="outlined"
              inputProps={{
                maxLength: 100
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />

            {/* Country Selection */}
            <FormControl 
              fullWidth 
              required 
              error={!!formErrors.CountryID}
              variant="outlined"
            >
              <InputLabel>Country</InputLabel>
              <Select
                value={formData.CountryID}
                onChange={handleInputChange('CountryID')}
                label="Country"
                disabled={loading || countries.length === 0}
                sx={{
                  borderRadius: 2
                }}
              >
                {countries.length === 0 && !loading && (
                  <MenuItem disabled>
                    <Typography color="text.secondary">
                      No countries available
                    </Typography>
                  </MenuItem>
                )}
                {countries.map((country) => (
                  <MenuItem key={country.CountryID} value={country.CountryID}>
                    {country.CountryName || country.Country_Name}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.CountryID && (
                <Typography color="error" variant="caption" sx={{ mt: 0.5, ml: 2 }}>
                  {formErrors.CountryID}
                </Typography>
              )}
            </FormControl>

            {/* Active Status Switch */}
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.Active}
                    onChange={handleInputChange('Active')}
                    color="primary"
                  />
                }
                label="Active Status"
                sx={{
                  '& .MuiFormControlLabel-label': {
                    fontWeight: 500
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                {formData.Active ? 'This state/province will be active' : 'This state/province will be inactive'}
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2, gap: 1 }}>
          <Button
            onClick={handleClose}
            disabled={isSubmitting}
            variant="outlined"
            startIcon={<CancelIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="contained"
            startIcon={isSubmitting ? <CircularProgress size={16} /> : <SaveIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              minWidth: 120
            }}
          >
            {isSubmitting ? 'Saving...' : 'Save State/Province'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddStateProvincePopup;