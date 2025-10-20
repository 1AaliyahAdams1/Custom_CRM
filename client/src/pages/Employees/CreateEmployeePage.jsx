import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
<<<<<<< HEAD
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
=======
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  IconButton,
} from "@mui/material";
import { ArrowBack, Save, Clear, Add, Business as BusinessIcon, Close as CloseIcon } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../components/Theme";
import { createEmployee } from "../../services/employeeService";
import { getAllDepartments, createDepartment } from "../../services/departmentService";
// SmartDropdown removed for Department; using MUI Select rendering

const CreateEmployeePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    EmployeeName: "",
    EmployeeEmail: "",
    EmployeePhone: "",
    CityID: "",
    CountryID: "",
    StateProvinceID: "",
    HireDate: "",
    TerminationDate: null, // Changed from "" to null
    DepartmentID: "",
    Salary: "",
    Holidays_PA: "",
    JobTitleID: "",
    UserID: "",
    Active: true,
    // Removed TeamID completely
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [addDepartmentDialogOpen, setAddDepartmentDialogOpen] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    DepartmentName: "",
    Active: true,
  });
  const [addDepartmentLoading, setAddDepartmentLoading] = useState(false);

  const requiredFields = [
    "EmployeeName",
    "HireDate",
    "UserID",
    "Active",
  ];

  // Load departments on component mount
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        console.log("🔵 Starting to load departments...");
        setLoadingDepartments(true);

        const data = await getAllDepartments();
        console.log("🔵 Raw data received:", data);
        console.log("🔵 Data type:", typeof data);
        console.log("🔵 Is array?", Array.isArray(data));
        console.log("🔵 Data length:", data?.length);

        const activeDepts = Array.isArray(data)
          ? data.filter((d) => d.Active === true || d.Active === 1)
          : [];
        console.log("🔵 Active departments:", activeDepts);
        console.log("🔵 Active departments count:", activeDepts.length);

        setDepartments(activeDepts);
        console.log("🔵 State updated with departments");
        setLoadingDepartments(false);
      } catch (error) {
        console.error("🔴 Error loading departments:", error);
        setError("Failed to load departments");
        setLoadingDepartments(false);
        setDepartments([]);
      }
    };
    loadDepartments();
  }, []);

  useEffect(() => {
    console.log("🟡 Departments state changed:", departments);
    console.log("🟡 Departments count:", departments.length);
    console.log("🟡 Loading state:", loadingDepartments);
  }, [departments, loadingDepartments]);

  const validateField = (name, value) => {
    const errors = [];
    const strValue = (value ?? "").toString().trim();

    if (requiredFields.includes(name) && !strValue) {
      errors.push("This field is required.");
    }

    if (strValue) {
      if (name === "EmployeeName") {
        if (strValue.length < 2)
          errors.push("Employee name must be at least 2 characters.");
        else if (!/^[A-Za-z\s]+$/.test(strValue))
          errors.push("Employee name should only contain letters and spaces.");
      }
      if (name === "EmployeeEmail") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(strValue))
          errors.push("Please enter a valid email address.");
      }
      if (name === "EmployeePhone") {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(strValue.replace(/[\s\-\(\)]/g, ""))) {
          errors.push("Please enter a valid phone number.");
        }
      }
      if (name === "Salary") {
        const num = Number(strValue);
        if (isNaN(num)) errors.push("Please enter a valid number.");
        else if (num < 0) errors.push("Salary must be a positive number.");
      }
      if (name === "HireDate") {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(strValue))
          errors.push("Please enter a valid date in YYYY-MM-DD format.");
      }
      if (name === "TerminationDate" && strValue) { // Only validate if value is provided
        if (!/^\d{4}-\d{2}-\d{2}$/.test(strValue))
          errors.push("Please enter a valid date in YYYY-MM-DD format.");
      }
      if (name === "UserID") {
        const num = Number(strValue);
        if (isNaN(num) || num <= 0)
          errors.push("User ID must be a positive number.");
      }
      if (name === "CityID") {
        const num = Number(strValue);
        if (isNaN(num) || num <= 0)
          errors.push("City ID must be a positive number.");
      }
      if (name === "CountryID") {
        const num = Number(strValue);
        if (isNaN(num) || num <= 0)
          errors.push("Country ID must be a positive number.");
      }
      if (name === "StateProvinceID") {
        const num = Number(strValue);
        if (isNaN(num) || num <= 0)
          errors.push("State/Province ID must be a positive number.");
      }
      if (name === "DepartmentID") {
        if (!value) {
          errors.push("Department is required.");
        } else {
          const num = Number(value);
          if (isNaN(num) || num <= 0)
            errors.push("Please select a valid department.");
        }
      }
      if (name === "JobTitleID") {
        const num = Number(strValue);
        if (isNaN(num) || num <= 0)
          errors.push("Job Title ID must be a positive number.");
      }
      // Removed TeamID validation since TeamID field doesn't exist in database
      if (name === "Holidays_PA") {
        const num = Number(strValue);
        if (isNaN(num) || num < 0)
          errors.push("Holidays must be a non-negative number.");
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const errors = validateField(name, value);
      setFieldErrors((prev) => ({
        ...prev,
        [name]: errors.length > 0 ? errors : undefined,
      }));
    }

    if (error) setError(null);
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
<<<<<<< HEAD
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
=======
    setTouched((prev) => ({ ...prev, [name]: true }));

    const errors = validateField(name, value);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: errors.length > 0 ? errors : undefined,
    }));
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
<<<<<<< HEAD
    
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
=======
    const isValid = validateForm();
    if (!isValid) {
      setError("Please fix the errors before submitting.");
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
<<<<<<< HEAD
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
=======
      // Prepare data with proper data types and field names
      const employeeData = {
        ...formData,
        salary: formData.Salary ? parseFloat(formData.Salary) : null, // Convert to number for decimal field
        CountryID: formData.CountryID ? parseInt(formData.CountryID) : null, // Use form value or null
        TerminationDate: formData.TerminationDate || null, // Convert empty string to null
        CityID: formData.CityID ? parseInt(formData.CityID) : null,
        StateProvinceID: formData.StateProvinceID ? parseInt(formData.StateProvinceID) : null,
        DepartmentID: formData.DepartmentID ? parseInt(formData.DepartmentID) : null,
        JobTitleID: formData.JobTitleID ? parseInt(formData.JobTitleID) : null,
        UserID: parseInt(formData.UserID), // Convert to integer
        Holidays_PA: formData.Holidays_PA ? parseInt(formData.Holidays_PA) : null,
      };

      console.log("Submitting employee data:", employeeData);
      
      // Call with required audit parameters
      await createEmployee(employeeData, 1, 1); // changedBy=1, actionTypeId=1
      setSuccessMessage("Employee created successfully!");
      setTimeout(() => navigate("/employees"), 1500);
    } catch (err) {
      console.error("Error creating employee:", err);
      setError(`Failed to create employee: ${err.message || 'Please try again.'}`);
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
    } finally {
      setIsSubmitting(false);
    }
  };

<<<<<<< HEAD
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
=======
  const handleCancel = () => navigate("/employees");

  // Department dialog handlers
  const handleOpenAddDepartmentDialog = () => {
    setAddDepartmentDialogOpen(true);
    setNewDepartment({
      DepartmentName: "",
      Active: true,
    });
  };

  const handleCloseAddDepartmentDialog = () => {
    setAddDepartmentDialogOpen(false);
    setNewDepartment({
      DepartmentName: "",
      Active: true,
    });
  };

  const handleAddDepartment = async () => {
    if (!newDepartment.DepartmentName.trim()) {
      setError("Department name is required");
      return;
    }

    setAddDepartmentLoading(true);
    try {
      const createdDept = await createDepartment(newDepartment);
      handleCloseAddDepartmentDialog();
      setSuccessMessage("Department added successfully");
      
      // Refresh departments list
      const data = await getAllDepartments();
      setDepartments(data);
      
      // Auto-select the newly created department
      setFormData(prev => ({ ...prev, DepartmentID: createdDept.DepartmentID }));
    } catch (error) {
      setError("Failed to add department");
    } finally {
      setAddDepartmentLoading(false);
    }
  };

  const handleDepartmentInputChange = (field, value) => {
    setNewDepartment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getFieldError = (fieldName) => {
    return touched[fieldName] && fieldErrors[fieldName] ? (
      <span style={{ display: "flex", alignItems: "center", color: "#ff4444" }}>
        {fieldErrors[fieldName][0]}
      </span>
    ) : (
      ""
    );
  };

  const isFieldInvalid = (fieldName) =>
    touched[fieldName] && fieldErrors[fieldName]?.length > 0;

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          p: 3,
          backgroundColor: "#fafafa",
        }}>
        <Box sx={{ maxWidth: 900, mx: "auto" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Create New Employee
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}>
                Back
              </Button>
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleCancel}
                disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={
                  isSubmitting ? <CircularProgress size={20} /> : <Save />
                }
                onClick={handleSubmit}
                disabled={isSubmitting}
                sx={{
                  backgroundColor: "#050505",
                  "&:hover": { backgroundColor: "#333" },
                }}>
                {isSubmitting ? "Saving..." : "Save Employee"}
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3 }}
              onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert
              severity="success"
              sx={{ mb: 3 }}
              onClose={() => setSuccessMessage("")}>
              {successMessage}
            </Alert>
          )}

          <Paper elevation={0} sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 3 }}>
                <TextField
                  label="Employee Name"
                  name="EmployeeName"
                  value={formData.EmployeeName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  fullWidth
                  error={isFieldInvalid("EmployeeName")}
                  helperText={getFieldError("EmployeeName")}
                />

                <TextField
                  label="Employee Email"
                  name="EmployeeEmail"
                  type="email"
                  value={formData.EmployeeEmail}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  fullWidth
                  error={isFieldInvalid("EmployeeEmail")}
                  helperText={getFieldError("EmployeeEmail")}
                />

                <TextField
                  label="Employee Phone"
                  name="EmployeePhone"
                  value={formData.EmployeePhone}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  fullWidth
                  error={isFieldInvalid("EmployeePhone")}
                  helperText={getFieldError("EmployeePhone")}
                />

                <TextField
                  label="City ID"
                  name="CityID"
                  type="number"
                  value={formData.CityID}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  fullWidth
                  error={isFieldInvalid("CityID")}
                  helperText={getFieldError("CityID")}
                />

                <TextField
                  label="Country ID"
                  name="CountryID"
                  type="number"
                  value={formData.CountryID}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  fullWidth
                  error={isFieldInvalid("CountryID")}
                  helperText={getFieldError("CountryID")}
                />

                <TextField
                  label="State/Province ID"
                  name="StateProvinceID"
                  type="number"
                  value={formData.StateProvinceID}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  fullWidth
                  error={isFieldInvalid("StateProvinceID")}
                  helperText={getFieldError("StateProvinceID")}
                />

                <TextField
                  label="Hire Date"
                  name="HireDate"
                  type="date"
                  value={formData.HireDate}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={isFieldInvalid("HireDate")}
                  helperText={getFieldError("HireDate")}
                />

                <TextField
                  label="Termination Date"
                  name="TerminationDate"
                  type="date"
                  value={formData.TerminationDate}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={isFieldInvalid("TerminationDate")}
                  helperText={getFieldError("TerminationDate")}
                />

                {/* Department Dropdown - WORKING VERSION */}
                <FormControl fullWidth error={isFieldInvalid("DepartmentID")}>
                  <InputLabel id="department-label">Department</InputLabel>
                  <Select
                    labelId="department-label"
                    id="department-select"
                    name="DepartmentID"
                    value={formData.DepartmentID || ""}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    label="Department"
                    disabled={loadingDepartments}
                  >
                    {/* Add New Department Option */}
                    <MenuItem 
                      value=""
                      sx={{ 
                        color: "#1976d2", 
                        fontWeight: 600,
                        borderBottom: "1px solid #e0e0e0",
                        '&:hover': {
                          backgroundColor: '#f5f5f5'
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddDepartmentDialogOpen(true);
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Add fontSize="small" />
                        Add New Department
                      </Box>
                    </MenuItem>

                    {/* Loading State */}
                    {loadingDepartments && (
                      <MenuItem disabled value="">
                        <em>Loading departments...</em>
                      </MenuItem>
                    )}

                    {/* No Departments State */}
                    {!loadingDepartments && departments.length === 0 && (
                      <MenuItem disabled value="">
                        <em>No departments available</em>
                      </MenuItem>
                    )}

                    {/* Department Options */}
                    {!loadingDepartments && departments.length > 0 && departments.map((dept) => (
                      <MenuItem 
                        key={dept.DepartmentID} 
                        value={dept.DepartmentID}
                      >
                        {dept.DepartmentName}
                      </MenuItem>
                    ))}
                  </Select>
                  {getFieldError("DepartmentID")}
                </FormControl>

                <TextField
                  label="Salary"
                  name="Salary"
                  type="number"
                  value={formData.Salary}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  fullWidth
                  error={isFieldInvalid("Salary")}
                  helperText={getFieldError("Salary")}
                />

                <TextField
                  label="Holidays (PA)"
                  name="Holidays_PA"
                  type="number"
                  value={formData.Holidays_PA}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  fullWidth
                  error={isFieldInvalid("Holidays_PA")}
                  helperText={getFieldError("Holidays_PA")}
                />

                <TextField
                  label="Job Title ID"
                  name="JobTitleID"
                  type="number"
                  value={formData.JobTitleID}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  fullWidth
                  error={isFieldInvalid("JobTitleID")}
                  helperText={getFieldError("JobTitleID")}
                />

                <TextField
                  label="User ID"
                  name="UserID"
                  type="number"
                  value={formData.UserID}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  fullWidth
                  error={isFieldInvalid("UserID")}
                  helperText={getFieldError("UserID")}
                />

                {/* TeamID field removed - doesn't exist in database */}

                <FormControl fullWidth error={isFieldInvalid("Active")}>
                  <InputLabel>Active Status</InputLabel>
                  <Select
                    name="Active"
                    value={formData.Active}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    label="Active Status"
                    disabled={isSubmitting}
                  >
                    <MenuItem value={true}>Active</MenuItem>
                    <MenuItem value={false}>Inactive</MenuItem>
                  </Select>
                  {getFieldError("Active")}
                </FormControl>
              </Box>
            </form>
          </Paper>

          {/* Add Department Dialog */}
          <Dialog
            open={addDepartmentDialogOpen}
            onClose={handleCloseAddDepartmentDialog}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #e5e5e5",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BusinessIcon sx={{ color: "#1976d2" }} />
                Add New Department
              </Box>
              <IconButton onClick={handleCloseAddDepartmentDialog} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <TextField
                  label="Department Name"
                  value={newDepartment.DepartmentName}
                  onChange={(e) =>
                    handleDepartmentInputChange('DepartmentName', e.target.value)
                  }
                  fullWidth
                  required
                  variant="outlined"
                  helperText="Enter the name of the department (e.g., Engineering, Sales, Marketing)"
                  inputProps={{ maxLength: 255 }}
                  sx={{ mt: 2 }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={newDepartment.Active}
                      onChange={(e) =>
                        handleDepartmentInputChange('Active', e.target.checked)
                      }
                      color="primary"
                    />
                  }
                  label="Active"
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: "1px solid #e5e5e5" }}>
              <Button onClick={handleCloseAddDepartmentDialog} color="inherit">
                Cancel
              </Button>
              <Button
                onClick={handleAddDepartment}
                variant="contained"
                disabled={addDepartmentLoading || !newDepartment.DepartmentName.trim()}
              >
                {addDepartmentLoading ? <CircularProgress size={20} /> : 'Add Department'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default CreateEmployeePage;
>>>>>>> ea839b4db07b3dad90afd56e3760b09b150ea2f7
