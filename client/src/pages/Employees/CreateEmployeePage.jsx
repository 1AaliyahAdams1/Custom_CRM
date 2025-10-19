import React, { useState, useEffect, useContext } from "react";
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
import { ArrowBack, Save, Close, Clear } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { createEmployee } from "../../services/employeeService";
import { AuthContext } from '../../context/auth/authContext';
import {
  cityService,
  industryService,
  countryService,
  stateProvinceService,
  departmentService,  
  jobTitleService,  
  teamService        
} from '../../services/dropdownServices';

import SmartDropdown from '../../components/SmartDropdown';

const CreateEmployeePage = () => {
  const { user } = useContext(AuthContext);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to create an employee');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const userId = user.UserID;

      console.log('User object:', user);
      console.log('Extracted userId:', userId);
      
      
      if (!userId) {
        throw new Error('Could not find user ID in user object');
      }
      
      const dataToSubmit = {
        EmployeeName: formData.EmployeeName,
        EmployeeEmail: formData.EmployeeEmail,
        EmployeePhone: formData.EmployeePhone,
        HireDate: formData.HireDate,
        salary: formData.salary,
        Holidays_PA: formData.Holidays_PA,
        DepartmentID: formData.DepartmentID,
        JobTitleID: formData.JobTitleID,
        
        CityID: formData.CityID || null,
        StateProvinceID: formData.StateProvinceID || null,
      };
      
      
     
      const response = await createEmployee(dataToSubmit, userId, 1, userId);
      
      
      setSuccessMessage('Employee created successfully!');
      
      setTimeout(() => {
        navigate('/employees');
      }, 1500);
      
    } catch (err) {
      console.error('Full error object:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to create employee');
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

              {/* Full Name */}
              <Box>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="EmployeeName"
                  value={formData.EmployeeName}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </Box>

              {/* Email */}
              <Box>
                <TextField
                  fullWidth
                  label="Email"
                  name="EmployeeEmail"
                  type="email"
                  value={formData.EmployeeEmail}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </Box>

              {/* Phone Number */}
              <Box>
                <TextField
                  fullWidth
                  label="Phone Number (Optional)"
                  name="EmployeePhone"
                  type="text"
                  value={formData.EmployeePhone}
                  onChange={handleChange}
                  disabled={isSubmitting}
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

              {/* Department Dropdown */}
              <Box>
                <SmartDropdown
                  label="Department"
                  name="DepartmentID"
                  value={formData.DepartmentID}
                  onChange={handleChange}
                  service={departmentService}
                  displayField="DepartmentName"
                  valueField="DepartmentID"
                  placeholder="Search for department..."
                  disabled={isSubmitting}
                />
              </Box>

              {/* Job Title Dropdown */}
              <Box>
                <SmartDropdown
                  label="Job Title"
                  name="JobTitleID"
                  value={formData.JobTitleID}
                  onChange={handleChange}
                  service={jobTitleService}
                  displayField="JobTitleName"
                  valueField="JobTitleID"
                  placeholder="Search for job title..."
                  disabled={isSubmitting}
                />
              </Box>

              {/* Team Dropdown */}
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
                />
              </Box>

              {/* Hire Date */}
              <Box>
                <TextField
                  fullWidth
                  label="Hire Date"
                  name="HireDate"
                  type="date"
                  value={formData.HireDate}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Box>

              {/* Salary */}
              <Box>
                <TextField
                  fullWidth
                  label="Salary (Optional)"
                  name="salary"
                  type="text"
                  inputMode="decimal"
                  value={formData.salary}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                />
              </Box>

              {/* Holidays Per Year */}
              <Box>
                <TextField
                  fullWidth
                  label="Holidays Per Year (Optional)"
                  name="Holidays_PA"
                  type="text"
                  inputMode="numeric"
                  value={formData.Holidays_PA}
                  onChange={handleChange}
                  disabled={isSubmitting}
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

              {/* City Dropdown */}
              <Box>
                <SmartDropdown
                  label="City (Optional)"
                  name="CityID"
                  value={formData.CityID}
                  onChange={handleChange}
                  service={cityService}
                  displayField="CityName"
                  valueField="CityID"
                  placeholder="Search for city..."
                  disabled={isSubmitting}
                />
              </Box>

              {/* State/Province Dropdown */}
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
  );
};

export default CreateEmployeePage;