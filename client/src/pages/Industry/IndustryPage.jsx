import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Toolbar,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  IconButton,
} from "@mui/material";
import {
  Info as InfoIcon,
  Edit as EditIcon,
  Note as NoteIcon,
  AttachFile as AttachFileIcon,
  PowerOff as PowerOffIcon,
  Power as PowerIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Business as BusinessIcon,
  Add,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import TableView from '../../components/tableFormat/TableView';
import { formatters } from '../../utils/formatters';

const IndustryPage = ({
  industries = [],
  loading = false,
  error,
  setError,
  successMessage,
  setSuccessMessage,
  statusMessage,
  statusSeverity,
  setStatusMessage,
  selected = [],
  onSelectClick,
  onSelectAllClick,
  onDeactivate,
  onReactivate,
  onDelete,
  onBulkDeactivate,
  onEdit,
  onView,
  onCreate,
  onAddNote,
  onAddAttachment,
  onAssignUser,
  selectedIndustry,
}) => {
  const theme = useTheme();
  
  // Add Industry Dialog State
  const [addIndustryDialogOpen, setAddIndustryDialogOpen] = useState(false);
  const [newIndustry, setNewIndustry] = useState({
    IndustryName: '',
    IndustryCode: '',
    Description: '',
    Active: true
  });
  const [addIndustryLoading, setAddIndustryLoading] = useState(false);
<<<<<<< HEAD
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
=======
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7

  const columns = [
    { field: 'IndustryName', headerName: 'Industry Name', type: 'tooltip', defaultVisible: true }
  ];

  // Custom formatters for industry-specific fields
  const industryFormatters = {
    ...formatters,
    Active: (value) => {
      const isActive = value === true || value === 1;
      return (
        <Chip
          label={isActive ? 'Active' : 'Inactive'}
          size="small"
          sx={{
            backgroundColor: isActive ? '#079141ff' : '#999999',
            color: '#fff',
            fontWeight: 500,
          }}
        />
      );
    },
    IndustryName: (value) => {
      return value || 'N/A';
    }
  };

<<<<<<< HEAD
  // Validation rules
  const validateField = (name, value) => {
    const fieldErrors = {};

    switch (name) {
      case 'IndustryName':
        if (!value.trim()) {
          fieldErrors.IndustryName = 'Industry name is required';
        } else if (value.trim().length < 2) {
          fieldErrors.IndustryName = 'Industry name must be at least 2 characters';
        } else if (value.trim().length > 100) {
          fieldErrors.IndustryName = 'Industry name must be 100 characters or less';
        } else if (!/^[a-zA-Z0-9\s]+$/.test(value.trim())) {
          fieldErrors.IndustryName = 'Industry name can only contain letters, numbers, and spaces';
        }
        break;
      
      case 'IndustryCode':
        if (value.trim() && !/^[A-Z0-9]+$/.test(value.trim())) {
          fieldErrors.IndustryCode = 'Industry code must contain only uppercase letters and numbers';
        }
        break;

      case 'Description':
        if (value.trim() && value.trim().length > 500) {
          fieldErrors.Description = 'Description must be 500 characters or less';
        }
        break;
      
      default:
        break;
    }

    return fieldErrors;
=======
  // Validation functions
  const validateField = (field, value) => {
    const errors = {};
    
    switch (field) {
      case 'IndustryName':
        if (!value || value.trim() === '') {
          errors.IndustryName = 'Industry name is required';
        } else if (value.length > 255) {
          errors.IndustryName = 'Industry name must be 255 characters or less';
        }
        break;
      default:
        break;
    }
    
    return errors;
  };

  const validateForm = (industryData) => {
    const errors = {};
    
    // Validate IndustryName
    const nameErrors = validateField('IndustryName', industryData.IndustryName);
    Object.assign(errors, nameErrors);
    
    return errors;
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
  };

  // Handle Add Industry Dialog
  const handleOpenAddIndustryDialog = () => {
    setAddIndustryDialogOpen(true);
    setNewIndustry({
      IndustryName: '',
      IndustryCode: '',
      Description: '',
      Active: true
    });
<<<<<<< HEAD
    setErrors({});
    setTouched({});
=======
    setValidationErrors({});
    setTouchedFields({});
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
  };

  const handleCloseAddIndustryDialog = () => {
    setAddIndustryDialogOpen(false);
    setNewIndustry({
      IndustryName: '',
      IndustryCode: '',
      Description: '',
      Active: true
    });
<<<<<<< HEAD
    setErrors({});
    setTouched({});
  };

  const handleAddIndustry = async () => {
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(newIndustry).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate all fields
    const allErrors = {};
    Object.keys(newIndustry).forEach(key => {
      const fieldErrors = validateField(key, newIndustry[key]);
      Object.assign(allErrors, fieldErrors);
    });

    setErrors(allErrors);

    if (Object.keys(allErrors).length > 0) {
      setError && setError('Please fix the errors below before submitting');
=======
    setValidationErrors({});
    setTouchedFields({});
  };

  // Handle field blur event
  const handleFieldBlur = (field) => {
    setTouchedFields(prev => ({
      ...prev,
      [field]: true
    }));
    
    // Validate the field that just lost focus
    const fieldErrors = validateField(field, newIndustry[field]);
    setValidationErrors(prev => ({
      ...prev,
      [field]: fieldErrors[field]
    }));
  };

  const handleAddIndustry = async () => {
    // Mark all fields as touched on submit
    const allTouched = {
      IndustryName: true
    };
    setTouchedFields(allTouched);
    
    // Validate entire form
    const errors = validateForm(newIndustry);
    setValidationErrors(errors);
    
    // Check if form is valid
    if (Object.keys(errors).length > 0) {
      setError && setError('Please fix validation errors before submitting');
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
      return;
    }

    setAddIndustryLoading(true);
    try {
      if (onCreate) {
        await onCreate(newIndustry);
        handleCloseAddIndustryDialog();
        setSuccessMessage && setSuccessMessage('Industry added successfully');
      }
    } catch (error) {
      setError && setError('Failed to add industry');
    } finally {
      setAddIndustryLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewIndustry(prev => ({
      ...prev,
      [field]: value
    }));
<<<<<<< HEAD

    // Real-time validation
    const fieldErrors = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      ...fieldErrors
    }));

    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
=======
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Check if form is valid for enabling submit button
  const isFormValid = () => {
    const errors = validateForm(newIndustry);
    return Object.keys(errors).length === 0;
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
  };

  // Check if form is valid for submit button
  const isFormValid = () => {
    const requiredFields = ['IndustryName'];
    const hasRequiredFields = requiredFields.every(field => {
      const value = newIndustry[field];
      return value && value.toString().trim();
    });
    const hasNoErrors = Object.keys(errors).length === 0;
    return hasRequiredFields && hasNoErrors;
  };

  // Get field props for consistent styling
  const getFieldProps = (name) => ({
    error: touched[name] && !!errors[name],
    helperText: touched[name] && errors[name] ? errors[name] : '',
  });

  return (
    <Box sx={{ 
      width: '100%', 
      backgroundColor: theme.palette.background.default, 
      minHeight: '100vh', 
      p: 3 
    }}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={() => setError && setError('')}
        >
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
          onClose={() => setSuccessMessage && setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
        <Toolbar sx={{ 
          backgroundColor: theme.palette.background.paper, 
          borderBottom: `1px solid ${theme.palette.divider}`, 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: 2, 
          py: 2 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Typography variant="h6" component="div" sx={{ 
              color: theme.palette.text.primary, 
              fontWeight: 600 
            }}>
              Industries
            </Typography>
            {selected.length > 0 && (
              <Chip 
                label={`${selected.length} selected`} 
                size="small" 
                sx={{ 
                  backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#e0e0e0', 
                  color: theme.palette.text.primary 
                }} 
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenAddIndustryDialog}
              disabled={loading}
            >
              Add Industry
            </Button>
            {selected.length > 0 && (
              <Button
                variant="outlined"
                color="warning"
                onClick={onBulkDeactivate}
              >
                Deactivate Selected
              </Button>
            )}
          </Box>
        </Toolbar>

        {loading ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={8}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2, color: theme.palette.text.secondary }}>
              Loading industries...
            </Typography>
          </Box>
        ) : industries.length === 0 ? (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
              No industries found
            </Typography>
            <Typography variant="body2" sx={{ 
              mt: 1, 
              color: theme.palette.text.secondary 
            }}>
              Click "Add Industry" to create your first industry
            </Typography>
          </Box>
        ) : (
          <TableView
            data={industries}
            columns={columns}
            idField="IndustryID"
            selected={selected}
            onSelectClick={onSelectClick}
            onSelectAllClick={onSelectAllClick}
            showSelection={true}
            formatters={industryFormatters}
            entityType="industry"
            showActions={false}
          />
        )}

        <Box sx={{ 
          p: 2, 
          borderTop: `1px solid ${theme.palette.divider}`, 
          backgroundColor: theme.palette.background.default, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Showing {industries.length} industries
          </Typography>
          {selected.length > 0 && (
            <Typography variant="body2" sx={{ 
              color: theme.palette.text.primary, 
              fontWeight: 500 
            }}>
              {selected.length} selected
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Add Industry Dialog */}
      <Dialog 
        open={addIndustryDialogOpen} 
        onClose={handleCloseAddIndustryDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BusinessIcon sx={{ color: theme.palette.primary.main }} />
            Add New Industry
          </Box>
          <IconButton onClick={handleCloseAddIndustryDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Industry Name"
              value={newIndustry.IndustryName}
              onChange={(e) => handleInputChange('IndustryName', e.target.value)}
              onBlur={() => handleFieldBlur('IndustryName')}
              fullWidth
              required
              variant="outlined"
<<<<<<< HEAD
              helperText="Enter the name of the industry (e.g., Technology, Healthcare, Finance)"
              inputProps={{ maxLength: 100 }}
              {...getFieldProps('IndustryName')}
            />

            <TextField
              label="Industry Code (Optional)"
              value={newIndustry.IndustryCode}
              onChange={(e) => handleInputChange('IndustryCode', e.target.value.toUpperCase())}
              fullWidth
              variant="outlined"
              helperText="Optional industry code (e.g., TECH, HEALTH, FIN)"
              inputProps={{ maxLength: 20 }}
              {...getFieldProps('IndustryCode')}
            />

            <TextField
              label="Description (Optional)"
              value={newIndustry.Description}
              onChange={(e) => handleInputChange('Description', e.target.value)}
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              helperText={`${newIndustry.Description.length}/500 characters`}
              inputProps={{ maxLength: 500 }}
              {...getFieldProps('Description')}
=======
              helperText={validationErrors.IndustryName || "Enter the name of the industry (e.g., Technology, Healthcare, Finance)"}
              inputProps={{ maxLength: 255 }}
              error={!!validationErrors.IndustryName && touchedFields.IndustryName}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-error fieldset': {
                    borderColor: '#f44336',
                  },
                },
              }}
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
            />

            <FormControlLabel
              control={
                <Switch
                  checked={newIndustry.Active}
                  onChange={(e) => handleInputChange('Active', e.target.checked)}
                  color="primary"
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={handleCloseAddIndustryDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleAddIndustry}
            variant="contained"
            disabled={addIndustryLoading || !isFormValid()}
          >
            {addIndustryLoading ? <CircularProgress size={20} /> : 'Add Industry'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Snackbar */}
      <Snackbar
        open={!!statusMessage}
        autoHideDuration={4000}
        onClose={() => setStatusMessage && setStatusMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setStatusMessage && setStatusMessage('')} 
          severity={statusSeverity} 
          sx={{ width: '100%' }}
        >
          {statusMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default IndustryPage;