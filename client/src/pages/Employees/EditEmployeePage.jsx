// import React, { useState, useEffect } from "react";
// import { useNavigate, useParams, useLocation } from "react-router-dom";
// import {
//   Box,
//   Paper,
//   Typography,
//   TextField,
//   Button,
//   Grid,
//   Alert,
//   CircularProgress,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   InputAdornment,
//   FormControlLabel,
//   Switch,
// } from "@mui/material";
// import { Save, Cancel } from "@mui/icons-material";
// import { useTheme } from "@mui/material/styles";
// import { getEmployeeById, updateEmployee } from "../../services/employeeService";
// import { getAllDepartments } from "../../services/departmentService";
// import { getAllJobTitles } from "../../services/jobTitleService";
// import { getAllTeams } from "../../services/teamService";
// import { getAllCities } from "../../services/cityService";
// import { getAllStateProvinces } from "../../services/stateProvinceService";

// const EditEmployee = () => {
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const location = useLocation();
//   const theme = useTheme();
  
//   const storedUser = JSON.parse(localStorage.getItem("user")) || {};
//   const userId = storedUser.UserID || storedUser.id || null;

//   const [loading, setLoading] = useState(false);
//   const [fetchLoading, setFetchLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [formData, setFormData] = useState({
//     EmployeeName: "",
//     EmployeeEmail: "",
//     EmployeePhone: "",
//     CityID: "",
//     StateProvinceID: "",
//     HireDate: "",
//     TerminationDate: "",
//     DepartmentID: "",
//     salary: "",
//     Holidays_PA: "",
//     JobTitleID: "",
//     UserID: "",
//     TeamID: "",
//     Active: true,
//   });

//   // Lookup data
//   const [departments, setDepartments] = useState([]);
//   const [jobTitles, setJobTitles] = useState([]);
//   const [teams, setTeams] = useState([]);
//   const [cities, setCities] = useState([]);
//   const [stateProvinces, setStateProvinces] = useState([]);

//   useEffect(() => {
//     fetchLookupData();
//     fetchEmployee();
//   }, [id]);

//   const fetchLookupData = async () => {
//     try {
//       const [depts, jobs, teamsList, citiesList, statesList] = await Promise.all([
//         getAllDepartments(),
//         getAllJobTitles(),
//         getAllTeams(),
//         getAllCities(),
//         getAllStateProvinces(),
//       ]);
      
//       setDepartments(Array.isArray(depts) ? depts : []);
//       setJobTitles(Array.isArray(jobs) ? jobs : []);
//       setTeams(Array.isArray(teamsList) ? teamsList : []);
//       setCities(Array.isArray(citiesList) ? citiesList : []);
//       setStateProvinces(Array.isArray(statesList) ? statesList : []);
//     } catch (err) {
//       console.error("Error fetching lookup data:", err);
//       setError("Failed to load form options. Please refresh the page.");
//     }
//   };

//   const fetchEmployee = async () => {
//     try {
//       setFetchLoading(true);
//       let employeeData;
      
//       // Check if employee data was passed via location state
//       if (location.state?.employee) {
//         employeeData = location.state.employee;
//       } else {
//         // Otherwise fetch from API
//         employeeData = await getEmployeeById(id);
//       }

//       // Format dates for input fields
//       const formatDate = (dateStr) => {
//         if (!dateStr) return "";
//         const date = new Date(dateStr);
//         return date.toISOString().split("T")[0];
//       };

//       setFormData({
//         EmployeeName: employeeData.EmployeeName || "",
//         EmployeeEmail: employeeData.EmployeeEmail || "",
//         EmployeePhone: employeeData.EmployeePhone || "",
//         CityID: employeeData.CityID || "",
//         StateProvinceID: employeeData.StateProvinceID || "",
//         HireDate: formatDate(employeeData.HireDate),
//         TerminationDate: formatDate(employeeData.TerminationDate),
//         DepartmentID: employeeData.DepartmentID || "",
//         salary: employeeData.salary || "",
//         Holidays_PA: employeeData.Holidays_PA || "",
//         JobTitleID: employeeData.JobTitleID || "",
//         UserID: employeeData.UserID || "",
//         TeamID: employeeData.TeamID || "",
//         Active: employeeData.Active !== false,
//       });
//     } catch (err) {
//       console.error("Error fetching employee:", err);
//       setError("Failed to load employee data. Please try again.");
//     } finally {
//       setFetchLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value, checked, type } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       // Validate required fields
//       if (!formData.EmployeeName || !formData.HireDate) {
//         throw new Error("Employee Name and Hire Date are required");
//       }

//       // Convert numeric fields and handle nulls
//       const updates = {
//         ...formData,
//         CityID: formData.CityID || null,
//         StateProvinceID: formData.StateProvinceID || null,
//         DepartmentID: formData.DepartmentID || null,
//         JobTitleID: formData.JobTitleID || null,
//         TeamID: formData.TeamID || null,
//         UserID: formData.UserID || null,
//         salary: formData.salary ? parseFloat(formData.salary) : null,
//         Holidays_PA: formData.Holidays_PA ? parseInt(formData.Holidays_PA) : null,
//       };

//       await updateEmployee(id, updates, userId, 2); // Action type 2 for update
//       navigate("/employees", { 
//         state: { successMessage: "Employee updated successfully!" } 
//       });
//     } catch (err) {
//       console.error("Error updating employee:", err);
//       setError(err.message || "Failed to update employee. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancel = () => {
//     navigate("/employees");
//   };

//   if (fetchLoading) {
//     return (
//       <Box sx={{ 
//         display: "flex", 
//         justifyContent: "center", 
//         alignItems: "center", 
//         minHeight: "100vh" 
//       }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ 
//       width: "100%", 
//       backgroundColor: theme.palette.background.default,
//       minHeight: "100vh", 
//       p: 3 
//     }}>
//       <Paper sx={{ maxWidth: 1200, mx: "auto", p: 4, borderRadius: 2 }}>
//         <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
//           Edit Employee
//         </Typography>

//         {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

//         <form onSubmit={handleSubmit}>
//           <Grid container spacing={3}>
//             {/* Basic Information */}
//             <Grid item xs={12}>
//               <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.secondary }}>
//                 Basic Information
//               </Typography>
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <TextField
//                 fullWidth
//                 required
//                 label="Employee Name"
//                 name="EmployeeName"
//                 value={formData.EmployeeName}
//                 onChange={handleChange}
//               />
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <TextField
//                 fullWidth
//                 label="Email"
//                 name="EmployeeEmail"
//                 type="email"
//                 value={formData.EmployeeEmail}
//                 onChange={handleChange}
//               />
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <TextField
//                 fullWidth
//                 label="Phone"
//                 name="EmployeePhone"
//                 value={formData.EmployeePhone}
//                 onChange={handleChange}
//               />
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <TextField
//                 fullWidth
//                 label="User ID"
//                 name="UserID"
//                 type="number"
//                 value={formData.UserID}
//                 onChange={handleChange}
//                 helperText="Link to system user account"
//               />
//             </Grid>

//             {/* Employment Details */}
//             <Grid item xs={12}>
//               <Typography variant="h6" sx={{ mt: 2, mb: 2, color: theme.palette.text.secondary }}>
//                 Employment Details
//               </Typography>
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <TextField
//                 fullWidth
//                 required
//                 label="Hire Date"
//                 name="HireDate"
//                 type="date"
//                 value={formData.HireDate}
//                 onChange={handleChange}
//                 InputLabelProps={{ shrink: true }}
//               />
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <TextField
//                 fullWidth
//                 label="Termination Date"
//                 name="TerminationDate"
//                 type="date"
//                 value={formData.TerminationDate}
//                 onChange={handleChange}
//                 InputLabelProps={{ shrink: true }}
//               />
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <FormControl fullWidth>
//                 <InputLabel>Department</InputLabel>
//                 <Select
//                   name="DepartmentID"
//                   value={formData.DepartmentID}
//                   onChange={handleChange}
//                   label="Department"
//                 >
//                   <MenuItem value="">
//                     <em>None</em>
//                   </MenuItem>
//                   {departments.map((dept) => (
//                     <MenuItem key={dept.DepartmentID} value={dept.DepartmentID}>
//                       {dept.DepartmentName}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <FormControl fullWidth>
//                 <InputLabel>Job Title</InputLabel>
//                 <Select
//                   name="JobTitleID"
//                   value={formData.JobTitleID}
//                   onChange={handleChange}
//                   label="Job Title"
//                 >
//                   <MenuItem value="">
//                     <em>None</em>
//                   </MenuItem>
//                   {jobTitles.map((job) => (
//                     <MenuItem key={job.JobTitleID} value={job.JobTitleID}>
//                       {job.JobTitleName}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <FormControl fullWidth>
//                 <InputLabel>Team</InputLabel>
//                 <Select
//                   name="TeamID"
//                   value={formData.TeamID}
//                   onChange={handleChange}
//                   label="Team"
//                 >
//                   <MenuItem value="">
//                     <em>None</em>
//                   </MenuItem>
//                   {teams.map((team) => (
//                     <MenuItem key={team.TeamID} value={team.TeamID}>
//                       {team.TeamName}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <TextField
//                 fullWidth
//                 label="Salary"
//                 name="salary"
//                 type="number"
//                 value={formData.salary}
//                 onChange={handleChange}
//                 InputProps={{
//                   startAdornment: <InputAdornment position="start">$</InputAdornment>,
//                 }}
//               />
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <TextField
//                 fullWidth
//                 label="Holidays Per Annum"
//                 name="Holidays_PA"
//                 type="number"
//                 value={formData.Holidays_PA}
//                 onChange={handleChange}
//               />
//             </Grid>

//             {/* Location Details */}
//             <Grid item xs={12}>
//               <Typography variant="h6" sx={{ mt: 2, mb: 2, color: theme.palette.text.secondary }}>
//                 Location
//               </Typography>
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <FormControl fullWidth>
//                 <InputLabel>City</InputLabel>
//                 <Select
//                   name="CityID"
//                   value={formData.CityID}
//                   onChange={handleChange}
//                   label="City"
//                 >
//                   <MenuItem value="">
//                     <em>None</em>
//                   </MenuItem>
//                   {cities.map((city) => (
//                     <MenuItem key={city.CityID} value={city.CityID}>
//                       {city.CityName}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <FormControl fullWidth>
//                 <InputLabel>State/Province</InputLabel>
//                 <Select
//                   name="StateProvinceID"
//                   value={formData.StateProvinceID}
//                   onChange={handleChange}
//                   label="State/Province"
//                 >
//                   <MenuItem value="">
//                     <em>None</em>
//                   </MenuItem>
//                   {stateProvinces.map((state) => (
//                     <MenuItem key={state.StateProvinceID} value={state.StateProvinceID}>
//                       {state.StateProvinceName}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>

//             {/* Status */}
//             <Grid item xs={12}>
//               <Typography variant="h6" sx={{ mt: 2, mb: 2, color: theme.palette.text.secondary }}>
//                 Status
//               </Typography>
//             </Grid>

//             <Grid item xs={12}>
//               <FormControlLabel
//                 control={
//                   <Switch
//                     checked={formData.Active}
//                     onChange={handleChange}
//                     name="Active"
//                   />
//                 }
//                 label="Active"
//               />
//             </Grid>

//             {/* Action Buttons */}
//             <Grid item xs={12}>
//               <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
//                 <Button
//                   variant="outlined"
//                   startIcon={<Cancel />}
//                   onClick={handleCancel}
//                   disabled={loading}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   type="submit"
//                   variant="contained"
//                   startIcon={loading ? <CircularProgress size={20} /> : <Save />}
//                   disabled={loading}
//                 >
//                   {loading ? "Saving..." : "Save Changes"}
//                 </Button>
//               </Box>
//             </Grid>
//           </Grid>
//         </form>
//       </Paper>
//     </Box>
//   );
// };

// export default EditEmployee;