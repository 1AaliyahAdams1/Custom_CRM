
// import React, { useState, useEffect, useContext } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   Box,
//   Typography,
//   Button,
//   TextField,
//   Paper,
//   Alert,
//   CircularProgress,
//   MenuItem,
// } from "@mui/material";
// import { ArrowBack, Save, Clear } from "@mui/icons-material";
// import { useTheme } from "@mui/material/styles";
// import { getEmployeeById, updateEmployee } from "../../services/employeeService";
// import { AuthContext } from '../../context/auth/authContext';
// import {
//   cityService,
//   stateProvinceService,
//   departmentService,  
//   jobTitleService,
// } from '../../services/dropdownServices';

// import SmartDropdown from '../../components/SmartDropdown';
// import RoleBasedAccess from '../../components/auth/RoleBasedAccess';

// const EditEmployeePage = () => {
//   const { id } = useParams();
//   const { user } = useContext(AuthContext);
//   const theme = useTheme();
//   const navigate = useNavigate();

//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [fieldErrors, setFieldErrors] = useState({});
//   const [touched, setTouched] = useState({});

//   const [formData, setFormData] = useState({
//     EmployeeName: '',
//     EmployeeEmail: '',
//     EmployeePhone: '',
//     DepartmentID: '',
//     JobTitleID: '',
//     HireDate: '',
//     TerminationDate: '',
//     salary: '',
//     Holidays_PA: '',
//     CityID: '',
//     StateProvinceID: '',
//     Active: true,
//      UserID: null,
//   });

//   const requiredFields = ['EmployeeName', 'EmployeeEmail', 'DepartmentID', 'JobTitleID', 'HireDate'];

//   const validateField = (name, value) => {
//     const errors = [];
//     const strValue = value?.toString().trim();

//     // Required field validation
//     if (requiredFields.includes(name) && (!strValue || strValue === '')) {
//       errors.push('This field is required.');
//     }

//     // Only validate if field has value or is required
//     if (strValue || requiredFields.includes(name)) {
//       switch (name) {
//         case 'EmployeeName':
//           if (!strValue || strValue === '') {
//             errors.push('Employee name is required.');
//           } else {
//             if (strValue.length < 2) {
//               errors.push('Employee name must be at least 2 characters long.');
//             }
//             if (strValue.length > 100) {
//               errors.push('Employee name cannot exceed 100 characters.');
//             }
//             // Allow alphanumeric with spaces and common punctuation
//             if (!/^[a-zA-Z0-9\s\-'.,]+$/.test(strValue)) {
//               errors.push('Employee name contains invalid characters.');
//             }
//           }
//           break;

//         case 'EmployeeEmail':
//           if (!strValue || strValue === '') {
//             errors.push('Email is required.');
//           } else {
//             const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//             if (!emailRegex.test(strValue)) {
//               errors.push('Please enter a valid email address.');
//             }
//           }
//           break;

//         case 'EmployeePhone':
//           if (strValue && strValue !== '') {
//             const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,20}$/;
//             if (!phoneRegex.test(strValue.replace(/[\s\-\(\)]/g, ''))) {
//               errors.push('Invalid phone number - Phone number requires at least 8 numbers');
//             }
//           }
//           break;

//         case 'DepartmentID':
//           if (!strValue || strValue === '') {
//             errors.push('Department selection is required.');
//           }
//           break;

//         case 'JobTitleID':
//           if (!strValue || strValue === '') {
//             errors.push('Job title selection is required.');
//           }
//           break;

//         case 'HireDate':
//           if (!strValue || strValue === '') {
//             errors.push('Hire date is required.');
//           } else {
//             const hireDate = new Date(strValue);
//             const today = new Date();
//             today.setHours(0, 0, 0, 0);
//             if (isNaN(hireDate.getTime())) {
//               errors.push('Please enter a valid date.');
//             } else if (hireDate > today) {
//               errors.push('Hire date cannot be in the future.');
//             }
//           }
//           break;

//         case 'TerminationDate':
//           if (strValue && strValue !== '') {
//             const terminationDate = new Date(strValue);
//             const hireDate = new Date(formData.HireDate);
//             if (isNaN(terminationDate.getTime())) {
//               errors.push('Please enter a valid date.');
//             } else if (formData.HireDate && terminationDate <= hireDate) {
//               errors.push('Termination date must be after hire date.');
//             }
//           }
//           break;

//         case 'salary':
//           if (strValue && strValue !== '') {
//             const salary = parseFloat(strValue);
//             if (isNaN(salary) || salary < 0) {
//               errors.push('Salary must be a non-negative number.');
//             } else if (salary > 999999999) {
//               errors.push('Salary must be less than 1 billion.');
//             }
//           }
//           break;

//         case 'Holidays_PA':
//           if (strValue && strValue !== '') {
//             const holidays = parseInt(strValue, 10);
//             if (isNaN(holidays) || holidays < 0) {
//               errors.push('Holidays must be a non-negative number.');
//             } else if (holidays > 365) {
//               errors.push('Holidays cannot exceed 365 days.');
//             }
//           }
//           break;
//       }
//     }

//     return errors;
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     Object.keys(formData).forEach((field) => {
//       const errors = validateField(field, formData[field]);
//       if (errors.length > 0) newErrors[field] = errors;
//     });
//     setFieldErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const isFormValid = () => {
//     // Check if all required fields are valid
//     const requiredFieldValid = requiredFields.every(field => {
//       const errors = validateField(field, formData[field]);
//       return errors.length === 0;
//     });

//     // Check if all non-empty fields are valid
//     const allFieldsValid = Object.keys(formData).every(field => {
//       const value = formData[field];
//       const strValue = value?.toString().trim();
      
//       // If field is empty and not required, it's valid
//       if ((!strValue || strValue === '') && !requiredFields.includes(field)) {
//         return true;
//       }
      
//       // If field has value, validate it
//       const errors = validateField(field, value);
//       return errors.length === 0;
//     });

//     return requiredFieldValid && allFieldsValid;
//   };

//   const getFieldError = (fieldName) => {
//     return touched[fieldName] && fieldErrors[fieldName] ? (
//       <span style={{ display: 'flex', alignItems: 'center', color: '#ff4444' }}>
//          {fieldErrors[fieldName][0]}
//       </span>
//     ) : '';
//   };

//   const isFieldInvalid = (fieldName) => touched[fieldName] && fieldErrors[fieldName]?.length > 0;

//   // Fetch employee data on component mount
//   useEffect(() => {
//     const fetchEmployee = async () => {
//       if (!id) {
//         setError("No employee ID provided");
//         setIsLoading(false);
//         return;
//       }

//       try {
//         setIsLoading(true);
//         const employeeId = parseInt(id, 10);
        
//         if (isNaN(employeeId)) {
//           throw new Error('Invalid employee ID');
//         }
        
//         const response = await getEmployeeById(employeeId);
//         const employeeData = response?.data || response;
        
//         if (!employeeData) {
//           throw new Error('Employee not found');
//         }

//         // Populate form with existing data
//         setFormData({
//           EmployeeName: employeeData.EmployeeName || '',
//           EmployeeEmail: employeeData.EmployeeEmail || '',
//           EmployeePhone: employeeData.EmployeePhone || '',
//           DepartmentID: employeeData.DepartmentID || '',
//           JobTitleID: employeeData.JobTitleID || '',
//           HireDate: employeeData.HireDate ? employeeData.HireDate.split('T')[0] : '',
//           TerminationDate: employeeData.TerminationDate ? employeeData.TerminationDate.split('T')[0] : '',
//           salary: employeeData.salary || '',
//           Holidays_PA: employeeData.Holidays_PA || '',
//           CityID: employeeData.CityID || '',
//           StateProvinceID: employeeData.StateProvinceID || '',
//           Active: employeeData.Active !== undefined ? employeeData.Active : true,
//            UserID: employeeData.UserID || null,
//         });
        
//       } catch (err) {
//         console.error('Error fetching employee:', err);
//         setError(err.message || 'Failed to load employee details');
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchEmployee();
//   }, [id]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));

//     // Always validate the changed field in real-time
//     const errors = validateField(name, value);
//     setFieldErrors(prev => ({ ...prev, [name]: errors.length > 0 ? errors : undefined }));

//     if (error) setError(null);
//   };

//   const handleBlur = (e) => {
//     const { name, value } = e.target;
    
//     setTouched(prev => ({ ...prev, [name]: true }));

//     const errors = validateField(name, value);
//     setFieldErrors(prev => ({ ...prev, [name]: errors.length > 0 ? errors : undefined }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!user) {
//       setError('You must be logged in to update an employee');
//       return;
//     }

//     // Mark all fields as touched for validation
//     const allTouched = {};
//     Object.keys(formData).forEach(key => {
//       allTouched[key] = true;
//     });
//     setTouched(allTouched);

//     // Validate the entire form
//     if (!validateForm()) {
//       setError("Please fix the errors below before submitting");
//       return;
//     }
    
//     setIsSubmitting(true);
//     setError(null);
    
//     try {
//       const userId = user.UserID;
      
//       if (!userId) {
//         throw new Error('Could not find user ID in user object');
//       }
      
//       const employeeId = parseInt(id, 10);
      
//       // Prepare data for submission - only send what the backend needs
//       const dataToSubmit = {
//         EmployeeName: formData.EmployeeName,
//         EmployeeEmail: formData.EmployeeEmail,
//         EmployeePhone: formData.EmployeePhone || null,
//         DepartmentID: formData.DepartmentID,
//         JobTitleID: formData.JobTitleID,
//         HireDate: formData.HireDate,
//         TerminationDate: formData.TerminationDate || null,
//         salary: formData.salary || null,
//         Holidays_PA: formData.Holidays_PA || null,
//         CityID: formData.CityID || null,
//         StateProvinceID: formData.StateProvinceID || null,
//         Active: formData.Active,
//         UserID: formData.UserID || null,
//       };
      
//       console.log('Updating employee with data:', dataToSubmit);
      
//       const changedBy = userId;
//       const actionTypeId = 2; // Update action
      
//       await updateEmployee(employeeId, dataToSubmit, changedBy, actionTypeId);
      
//       navigate(`/employees/${employeeId}`);
      
//     } catch (err) {
//       console.error('Full error object:', err);
//       console.error('Error response:', err.response);
//       console.error('Error response data:', err.response?.data);
//       setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to update employee');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleCancel = () => {
//     if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
//       navigate(-1);
//     }
//   };

//   if (isLoading) {
//     return (
//       <Box sx={{ 
//         width: '100%', 
//         backgroundColor: theme.palette.background.default,
//         minHeight: '100vh', 
//         p: 3,
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         justifyContent: 'center'
//       }}>
//         <CircularProgress />
//         <Typography variant="body2" sx={{ mt: 2, color: theme.palette.text.secondary }}>
//           Loading employee details...
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <RoleBasedAccess allowedRoles={['C-level']} fallbackPath="/unauthorized">
//       <Box sx={{ 
//         width: '100%', 
//         backgroundColor: theme.palette.background.default,
//         minHeight: '100vh', 
//         p: 3 
//       }}>
//         <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
//           {/* Header */}
//           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//               <Typography variant="h4" sx={{ 
//                 color: theme.palette.text.primary,
//                 fontWeight: 600 
//               }}>
//                 Edit Employee
//               </Typography>
//             </Box>
            
//             <Box sx={{ display: 'flex', gap: 2 }}>
//               <Button
//                 variant="outlined"
//                 startIcon={<ArrowBack />}
//                 onClick={() => navigate(`/employees/${id}`)}
//                 sx={{ minWidth: 'auto' }}
//               >
//                 Back
//               </Button>
//               <Button
//                 variant="outlined"
//                 startIcon={<Clear />}
//                 onClick={handleCancel}
//                 disabled={isSubmitting}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 variant="contained"
//                 startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
//                 onClick={handleSubmit}
//                 disabled={isSubmitting || !isFormValid()}
//               >
//                 {isSubmitting ? 'Saving...' : 'Save Changes'}
//               </Button>
//             </Box>
//           </Box>

//           {/* Error Alert */}
//           {error && (
//             <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
//               {error}
//             </Alert>
//           )}


//           {/* Form */}
//           <Paper elevation={0} sx={{ p: 3 }}>
//             <form onSubmit={handleSubmit}>
//               <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                
//                 {/* Personal Information Section Header */}
//                 <Box sx={{ gridColumn: '1 / -1' }}>
//                   <Typography variant="h6" sx={{ 
//                     fontWeight: 600,
//                     color: theme.palette.text.primary,
//                     mb: 1
//                   }}>
//                     Personal Information
//                   </Typography>
//                 </Box>

//                 {/* Full Name */}
//                 <Box>
//                   <TextField
//                     fullWidth
//                     label="Full Name"
//                     name="EmployeeName"
//                     value={formData.EmployeeName}
//                     onChange={handleChange}
//                     onBlur={handleBlur}
//                     disabled={isSubmitting}
//                     required
//                     error={isFieldInvalid('EmployeeName')}
//                     helperText={getFieldError('EmployeeName')}
//                   />
//                 </Box>

//                 {/* Email */}
//                 <Box>
//                   <TextField
//                     fullWidth
//                     label="Email"
//                     name="EmployeeEmail"
//                     type="email"
//                     value={formData.EmployeeEmail}
//                     onChange={handleChange}
//                     onBlur={handleBlur}
//                     disabled={isSubmitting}
//                     required
//                     error={isFieldInvalid('EmployeeEmail')}
//                     helperText={getFieldError('EmployeeEmail')}
//                   />
//                 </Box>

//                 {/* Phone Number */}
//                 <Box>
//                   <TextField
//                     fullWidth
//                     label="Phone Number (Optional)"
//                     name="EmployeePhone"
//                     type="text"
//                     value={formData.EmployeePhone}
//                     onChange={handleChange}
//                     onBlur={handleBlur}
//                     disabled={isSubmitting}
//                     error={isFieldInvalid('EmployeePhone')}
//                     helperText={getFieldError('EmployeePhone')}
//                   />
//                 </Box>

//                 {/* Employment Information Section Header */}
//                 <Box sx={{ gridColumn: '1 / -1', mt: 2 }}>
//                   <Typography variant="h6" sx={{ 
//                     fontWeight: 600,
//                     color: theme.palette.text.primary,
//                     mb: 1
//                   }}>
//                     Employment Information
//                   </Typography>
//                 </Box>

//                 {/* Department Dropdown */}
//                 <Box>
//                   <SmartDropdown
//                     label="Department"
//                     name="DepartmentID"
//                     value={formData.DepartmentID}
//                     onChange={handleChange}
//                     onBlur={handleBlur}
//                     service={departmentService}
//                     displayField="DepartmentName"
//                     valueField="DepartmentID"
//                     placeholder="Search for department..."
//                     disabled={isSubmitting}
//                     required
//                     error={isFieldInvalid('DepartmentID')}
//                     helperText={getFieldError('DepartmentID')}
//                   />
//                 </Box>

//                 {/* Job Title Dropdown */}
//                 <Box>
//                   <SmartDropdown
//                     label="Job Title"
//                     name="JobTitleID"
//                     value={formData.JobTitleID}
//                     onChange={handleChange}
//                     onBlur={handleBlur}
//                     service={jobTitleService}
//                     displayField="JobTitleName"
//                     valueField="JobTitleID"
//                     placeholder="Search for job title..."
//                     disabled={isSubmitting}
//                     required
//                     error={isFieldInvalid('JobTitleID')}
//                     helperText={getFieldError('JobTitleID')}
//                   />
//                 </Box>

//                 {/* Hire Date */}
//                 <Box>
//                   <TextField
//                     fullWidth
//                     label="Hire Date"
//                     name="HireDate"
//                     type="date"
//                     value={formData.HireDate}
//                     onChange={handleChange}
//                     onBlur={handleBlur}
//                     disabled={isSubmitting}
//                     required
//                     error={isFieldInvalid('HireDate')}
//                     helperText={getFieldError('HireDate')}
//                     InputLabelProps={{
//                       shrink: true,
//                     }}
//                   />
//                 </Box>

//                 {/* Termination Date */}
//                 <Box>
//                   <TextField
//                     fullWidth
//                     label="Termination Date (Optional)"
//                     name="TerminationDate"
//                     type="date"
//                     value={formData.TerminationDate}
//                     onChange={handleChange}
//                     onBlur={handleBlur}
//                     disabled={isSubmitting}
//                     error={isFieldInvalid('TerminationDate')}
//                     helperText={getFieldError('TerminationDate')}
//                     InputLabelProps={{
//                       shrink: true,
//                     }}
//                   />
//                 </Box>

//                 {/* Salary */}
//                 <Box>
//                   <TextField
//                     fullWidth
//                     label="Salary (Optional)"
//                     name="salary"
//                     type="text"
//                     inputMode="decimal"
//                     value={formData.salary}
//                     onChange={handleChange}
//                     onBlur={handleBlur}
//                     disabled={isSubmitting}
//                     error={isFieldInvalid('salary')}
//                     helperText={getFieldError('salary')}
//                     InputProps={{
//                       startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
//                     }}
//                   />
//                 </Box>

//                 {/* Holidays Per Year */}
//                 <Box>
//                   <TextField
//                     fullWidth
//                     label="Holidays Per Year (Optional)"
//                     name="Holidays_PA"
//                     type="text"
//                     inputMode="numeric"
//                     value={formData.Holidays_PA}
//                     onChange={handleChange}
//                     onBlur={handleBlur}
//                     disabled={isSubmitting}
//                     error={isFieldInvalid('Holidays_PA')}
//                     helperText={getFieldError('Holidays_PA')}
//                   />
//                 </Box>

//                 {/* Location Information Section Header */}
//                 <Box sx={{ gridColumn: '1 / -1', mt: 2 }}>
//                   <Typography variant="h6" sx={{ 
//                     fontWeight: 600,
//                     color: theme.palette.text.primary,
//                     mb: 1
//                   }}>
//                     Location Information (Optional)
//                   </Typography>
//                 </Box>

//                 {/* City Dropdown */}
//                 <Box>
//                   <SmartDropdown
//                     label="City (Optional)"
//                     name="CityID"
//                     value={formData.CityID}
//                     onChange={handleChange}
//                     service={cityService}
//                     displayField="CityName"
//                     valueField="CityID"
//                     placeholder="Search for city..."
//                     disabled={isSubmitting}
//                   />
//                 </Box>

//                 {/* State/Province Dropdown */}
//                 <Box>
//                   <SmartDropdown
//                     label="State/Province (Optional)"
//                     name="StateProvinceID"
//                     value={formData.StateProvinceID}
//                     onChange={handleChange}
//                     service={stateProvinceService} 
//                     displayField="StateProvince_Name"
//                     valueField="StateProvinceID"
//                     placeholder="Search for state/province..."
//                     disabled={isSubmitting}
//                   />
//                 </Box>

//                 {/* Status Section Header */}
//                 <Box sx={{ gridColumn: '1 / -1', mt: 2 }}>
//                   <Typography variant="h6" sx={{ 
//                     fontWeight: 600,
//                     color: theme.palette.text.primary,
//                     mb: 1
//                   }}>
//                     Status
//                   </Typography>
//                 </Box>

//                 {/* Active Status */}
//                 <Box>
//                   <TextField
//                     fullWidth
//                     select
//                     label="Active Status"
//                     name="Active"
//                     value={formData.Active}
//                     onChange={handleChange}
//                     disabled={isSubmitting}
//                   >
//                     <MenuItem value={true}>Active</MenuItem>
//                     <MenuItem value={false}>Inactive</MenuItem>
//                   </TextField>
//                 </Box>

//               </Box>
//             </form>
//           </Paper>
//         </Box>
//       </Box>
//     </RoleBasedAccess>
//   );
// };

// export default EditEmployeePage;