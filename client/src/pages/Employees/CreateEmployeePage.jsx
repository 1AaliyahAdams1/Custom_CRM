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
  stateProvinceService
} from '../../services/dropdownServices';


import SmartDropdown from '../../components/SmartDropdown';

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

  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const departmentService = {
    getAll: async () => {
      // TODO: Replace with actual API call
      return [];
    }
  };

  const jobTitleService = {
    getAll: async () => {
      // TODO: Replace with actual API call
      return [];
    }
  };

  const teamService = {
    getAll: async () => {
      // TODO: Replace with actual API call
      return [];
    }
  };

  const stateProvinceService = {
    getAll: async () => {
      return await stateProvinceService.getAll();
    }
  };
    const cityService = {
    getAll: async () => {
      return await cityService.getAll();
    }
    };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.EmployeeName.trim()) {
      errors.EmployeeName = 'Full name is required';
    }
    
    if (!formData.EmployeeEmail.trim()) {
      errors.EmployeeEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.EmployeeEmail)) {
      errors.EmployeeEmail = 'Invalid email format';
    }
    
    if (!formData.DepartmentID) {
      errors.DepartmentID = 'Department is required';
    }
    
    if (!formData.JobTitleID) {
      errors.JobTitleID = 'Job title is required';
    }
    
    if (!formData.HireDate) {
      errors.HireDate = 'Hire date is required';
    }
    
    return errors;
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
    
    const errors = validateForm();
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      setError('Please fix the errors before submitting');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Replace with your actual API call
      // const response = await employeeService.create(formData);
      
      setSuccessMessage('Employee created successfully!');
      
      // Navigate after short delay
      setTimeout(() => {
        navigate('/employees'); // Adjust route as needed
      }, 1500);
      
    } catch (err) {
      setError(err.message || 'Failed to create employee');
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
              disabled={isSubmitting}
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
                  helperText={getFieldError('EmployeeName')}
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
                  helperText={getFieldError('EmployeeEmail')}
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
                  helperText={getFieldError('EmployeePhone')}
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
                  service={teamService} // Replace with your actual service
                  displayField="TeamName"
                  valueField="TeamID"
                  placeholder="Search for team..."
                  disabled={isSubmitting}
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
                  service={stateProvinceService} // Replace with your actual service
                  displayField="StateProvinceName"
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
  );
};

export default CreateEmployeePage;