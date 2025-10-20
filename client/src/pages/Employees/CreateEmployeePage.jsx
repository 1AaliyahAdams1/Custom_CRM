import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  MenuItem,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import { ArrowBack, Save, Close,Clear } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { createEmployee } from "../../services/employeeService";
import {
  cityService,
  industryService,
  countryService,
  stateProvinceService,
  teamService,
  departmentService,
  jobTitleService
} from '../../services/dropdownServices';


import SmartDropdown from '../../components/SmartDropdown';
import RoleBasedAccess from '../../components/auth/RoleBasedAccess';

const CreateEmployeePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    EmployeeName: '',
    EmployeeEmail: '',
    EmployeePhone: '',
    DepartmentID: '',
    JobTitleID: '',
    TeamID: '',
    HireDate: '',
    salary: '',
    Holidays_PA: '',
    CityID: '',
    StateProvinceID: '',
  });
  
  // Debug: verify teams load once on mount and structure matches expectations
  useEffect(() => {
    (async () => {
      try {
        console.log('Fetching teams...');
        const teams = await teamService.getAll();
        console.log('Team API response:', teams);
        if (Array.isArray(teams)) {
          console.log('Teams loaded in state (SmartDropdown manages its own state): count =', teams.length);
          if (teams.length > 0) {
            console.log('First team sample:', teams[0]);
            const hasExpectedShape = teams[0] &&
              (Object.prototype.hasOwnProperty.call(teams[0], 'TeamID') || Object.prototype.hasOwnProperty.call(teams[0], 'teamId')) &&
              (Object.prototype.hasOwnProperty.call(teams[0], 'TeamName') || Object.prototype.hasOwnProperty.call(teams[0], 'teamName'));
            if (!hasExpectedShape) {
              console.warn('Team objects do not have expected fields TeamID/TeamName');
            }
          }
        } else {
          console.warn('Teams response is not an array.');
        }
      } catch (e) {
        console.error('Team fetch error:', e);
      }
    })();
  }, []);

  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Regex patterns for validation
  const validationPatterns = {
    // Phone validation: Accepts international formats with/without +, spaces, dashes, parentheses
    phone: /^[\+]?[\d\s\-\(\)]{7,20}$/,
    // Email validation: Standard email format
    email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    // Name validation: Letters, spaces, hyphens only
    name: /^[a-zA-Z\s\-']+$/
  };

  // Real-time validation function
  const validateField = (fieldName, value) => {
    // Define dropdown fields that contain numeric IDs
    const dropdownFields = ['DepartmentID', 'JobTitleID', 'TeamID', 'CityID', 'StateProvinceID'];
    
    // For dropdown fields, only check if value exists (don't call trim on numbers)
    if (dropdownFields.includes(fieldName)) {
      if (fieldName === 'DepartmentID' || fieldName === 'JobTitleID') {
        // Required dropdown fields
        if (!value || value === '') {
          return fieldName === 'DepartmentID' ? 'Department is required' : 'Job title is required';
        }
      }
      // Optional dropdown fields are always valid if they have a value or are empty
      return '';
    }
    
    // For string fields, safely convert to string and trim
    const trimmedValue = typeof value === 'string' ? value.trim() : (value ?? '').toString().trim();
    
    switch (fieldName) {
      case 'EmployeeName':
        if (!trimmedValue) {
          return 'Full name is required';
        }
        if (!validationPatterns.name.test(trimmedValue)) {
          return 'Name can only contain letters, spaces, hyphens, and apostrophes';
        }
        if (trimmedValue.length < 2) {
          return 'Name must be at least 2 characters long';
        }
        if (trimmedValue.length > 100) {
          return 'Name must be less than 100 characters';
        }
        return '';

      case 'EmployeeEmail':
        if (!trimmedValue) {
          return 'Email is required';
        }
        if (!validationPatterns.email.test(trimmedValue)) {
          return 'Please enter a valid email address';
        }
        if (trimmedValue.length > 255) {
          return 'Email must be less than 255 characters';
        }
        return '';

      case 'EmployeePhone':
        if (trimmedValue && !validationPatterns.phone.test(trimmedValue)) {
          return 'Please enter a valid phone number (e.g., +1234567890, (123) 456-7890, 123-456-7890)';
        }
        return '';

      case 'HireDate':
        if (!trimmedValue) {
          return 'Hire date is required';
        }
        const hireDate = new Date(trimmedValue);
          const today = new Date();
        if (hireDate > today) {
          return 'Hire date cannot be in the future';
        }
        if (hireDate < new Date('1900-01-01')) {
          return 'Hire date cannot be before 1900';
        }
        return '';

      case 'salary':
        if (trimmedValue && (isNaN(Number(trimmedValue)) || Number(trimmedValue) < 0)) {
          return 'Salary must be a positive number';
        }
        if (trimmedValue && Number(trimmedValue) > 999999999) {
          return 'Salary must be less than $1,000,000,000';
        }
        return '';

      case 'Holidays_PA':
        if (trimmedValue && (isNaN(Number(trimmedValue)) || Number(trimmedValue) < 0)) {
          return 'Holidays must be a positive number';
        }
        if (trimmedValue && Number(trimmedValue) > 365) {
          return 'Holidays cannot exceed 365 days per year';
        }
        return '';

      default:
        return '';
    }
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    const requiredFields = ['EmployeeName', 'EmployeeEmail', 'DepartmentID', 'JobTitleID', 'HireDate'];
    const dropdownFields = ['DepartmentID', 'JobTitleID', 'TeamID', 'CityID', 'StateProvinceID'];
    
    // Check if all required fields have values
    for (const field of requiredFields) {
      if (dropdownFields.includes(field)) {
        // For dropdown fields, check if value exists (don't call trim on numbers)
        if (!formData[field] || formData[field] === '') {
          return false;
        }
      } else {
        // For string fields, check if trimmed value exists
        if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
          return false;
        }
      }
    }
    
    // Check if all fields pass validation
    for (const fieldName of Object.keys(formData)) {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        return false;
      }
    }
    
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate field in real-time
    const error = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate field on blur
    const error = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const isFieldInvalid = (fieldName) => {
    return touchedFields[fieldName] && !!formErrors[fieldName];
  };

  const getFieldError = (fieldName) => {
    return touchedFields[fieldName] ? formErrors[fieldName] : '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouchedFields(allFields);
    
    // Validate all fields
    const errors = {};
    for (const fieldName of Object.keys(formData)) {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        errors[fieldName] = error;
      }
    }
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      setError('Please fix the errors before submitting');
      return;
    }
    
    // Double-check form validity before submitting
    if (!isFormValid()) {
      setError('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare data for API call - convert empty strings to null for optional fields
      const employeeData = {
        ...formData,
        TeamID: formData.TeamID || null,
        CityID: formData.CityID || null,
        StateProvinceID: formData.StateProvinceID || null,
        salary: formData.salary || null,
        Holidays_PA: formData.Holidays_PA || null,
        EmployeePhone: formData.EmployeePhone || null
      };
      
      // Get current user for audit logging (you may need to adjust this based on your auth implementation)
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const changedBy = currentUser.EmployeeID || 1; // Default to 1 if no user found
      const actionTypeId = 1; // Create action type ID
      
      await createEmployee(employeeData, changedBy, actionTypeId);
      
      setSuccessMessage('Employee created successfully!');
      
      // Navigate after short delay
      setTimeout(() => {
        navigate('/employees');
      }, 1500);
      
    } catch (err) {
      console.error('Error creating employee:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate(-1);
    }
  };


  return (
    <RoleBasedAccess allowedRoles={['C-level', 'Clevel', 'Admin', 'Administrator']} fallbackPath="/unauthorized">
    <Box sx={{
      width: '100%',
      backgroundColor: theme.palette.background.default,
      minHeight: '100vh',
      p: 3 
    }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" sx={{
              color: theme.palette.text.primary,
              fontWeight: 600 
          }}>
              Create New Employee
          </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{ minWidth: 'auto' }}
            >
              Back
            </Button>
            <Button
              variant="outlined"
              startIcon={<Clear />}
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
              onClick={handleSubmit}
              disabled={isSubmitting || !isFormValid()}
            >
              {isSubmitting ? 'Saving...' : 'Save Employee'}
            </Button>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        {/* Form */}
        <Paper elevation={0} sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              
              {/* Personal Information Section Header */}
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  mb: 1
                }}>
                  Personal Information
                </Typography>
              </Box>

              {/* Full Name - Required */}
              <Box>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="EmployeeName"
                  value={formData.EmployeeName}
                  onChange={handleChange}
                onBlur={handleBlur}
                  required
                disabled={isSubmitting}
                  error={isFieldInvalid('EmployeeName')}
                  helperText={getFieldError('EmployeeName') || 'Enter first and last name'}
                  placeholder="Enter full name"
                  FormHelperTextProps={{
                    component: 'div'
                  }}
                />
              </Box>

              {/* Email - Required */}
              <Box>
                <TextField
                  fullWidth
                  label="Email"
                  name="EmployeeEmail"
                  type="email"
                  value={formData.EmployeeEmail}
                  onChange={handleChange}
                onBlur={handleBlur}
                  required
                disabled={isSubmitting}
                  error={isFieldInvalid('EmployeeEmail')}
                  helperText={getFieldError('EmployeeEmail') || 'Enter valid email address'}
                  placeholder="Enter email address"
                  FormHelperTextProps={{
                    component: 'div'
                  }}
                />
              </Box>

              {/* Phone Number - Optional */}
              <Box>
              <TextField
                  fullWidth
                  label="Phone Number (Optional)"
                  name="EmployeePhone"
                  value={formData.EmployeePhone}
                  onChange={handleChange}
                onBlur={handleBlur}
                  disabled={isSubmitting}
                  error={isFieldInvalid('EmployeePhone')}
                  helperText={getFieldError('EmployeePhone') || 'e.g., +1234567890, (123) 456-7890, 123-456-7890'}
                  placeholder="Enter phone number"
                  type="number"
                  FormHelperTextProps={{
                    component: 'div'
                  }}
                />
              </Box>

              {/* Employment Information Section Header */}
              <Box sx={{ gridColumn: '1 / -1', mt: 2 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  mb: 1
                }}>
                  Employment Information
                </Typography>
              </Box>

              {/* Department Dropdown - Required */}
              <Box>
                <SmartDropdown
                  label="Department"
                  name="DepartmentID"
                  value={formData.DepartmentID}
                  onChange={handleChange}
                  service={departmentService} // Replace with your actual service
                  displayField="DepartmentName"
                  valueField="DepartmentID"
                  placeholder="Search for department..."
                required
                  disabled={isSubmitting}
                  error={isFieldInvalid('DepartmentID')}
                  helperText={getFieldError('DepartmentID')}
                />
              </Box>

              {/* Job Title Dropdown - Required */}
              <Box>
                <SmartDropdown
                  label="Job Title"
                  name="JobTitleID"
                  value={formData.JobTitleID}
                  onChange={handleChange}
                  service={jobTitleService} // Replace with your actual service
                  displayField="JobTitleName"
                  valueField="JobTitleID"
                  placeholder="Search for job title..."
                required
                  disabled={isSubmitting}
                  error={isFieldInvalid('JobTitleID')}
                  helperText={getFieldError('JobTitleID')}
                />
              </Box>

              {/* Team Dropdown - Optional */}
              <Box>
                <SmartDropdown
                  label="Team (Optional)"
                  name="TeamID"
                  value={formData.TeamID}
                  onChange={handleChange}
                  service={teamService}
                  displayField="TeamName"
                  valueField="TeamID"
                  placeholder="Search for team..."
                  disabled={isSubmitting}
                  error={isFieldInvalid('TeamID')}
                  helperText={getFieldError('TeamID')}
                />
              </Box>

              {/* Hire Date - Required */}
              <Box>
              <TextField
                  fullWidth
                  label="Hire Date"
                  name="HireDate"
                type="date"
                  value={formData.HireDate}
                  onChange={handleChange}
                onBlur={handleBlur}
                  required
                  disabled={isSubmitting}
                  error={isFieldInvalid('HireDate')}
                  helperText={getFieldError('HireDate')}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  FormHelperTextProps={{
                    component: 'div'
                  }}
                />
              </Box>

              {/* Salary - Optional */}
              <Box>
              <TextField
                  fullWidth
                  label="Salary (Optional)"
                  name="salary"
                type="number"
                  value={formData.salary}
                  onChange={handleChange}
                onBlur={handleBlur}
                  disabled={isSubmitting}
                  error={isFieldInvalid('salary')}
                  helperText={getFieldError('salary')}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                  FormHelperTextProps={{
                    component: 'div'
                  }}
                />
              </Box>

              {/* Holidays Per Year - Optional */}
              <Box>
              <TextField
                  fullWidth
                  label="Holidays Per Year (Optional)"
                  name="Holidays_PA"
                  type="number"
                  value={formData.Holidays_PA}
                  onChange={handleChange}
                onBlur={handleBlur}
                  disabled={isSubmitting}
                  error={isFieldInvalid('Holidays_PA')}
                  helperText={getFieldError('Holidays_PA')}
                  FormHelperTextProps={{
                    component: 'div'
                  }}
                />
              </Box>

              {/* Location Information Section Header */}
              <Box sx={{ gridColumn: '1 / -1', mt: 2 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  mb: 1
                }}>
                  Location Information (Optional)
                </Typography>
              </Box>

              {/* City Dropdown - Optional */}
              <Box>
                <SmartDropdown
                  label="City (Optional)"
                  name="CityID"
                  value={formData.CityID}
                  onChange={handleChange}
                  service={cityService} // Replace with your actual service
                  displayField="CityName"
                  valueField="CityID"
                  placeholder="Search for city..."
                  disabled={isSubmitting}
                />
              </Box>

              {/* State/Province Dropdown - Optional */}
              <Box>
                <SmartDropdown
                  label="State/Province (Optional)"
                  name="StateProvinceID"
                  value={formData.StateProvinceID}
                  onChange={handleChange}
                  service={stateProvinceService}
                  displayField="StateProvince_Name"
                  valueField="StateProvinceID"
                  placeholder="Search for state/province..."
                  disabled={isSubmitting}
                />
              </Box>

            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
    </RoleBasedAccess>
  );
};

export default CreateEmployeePage;