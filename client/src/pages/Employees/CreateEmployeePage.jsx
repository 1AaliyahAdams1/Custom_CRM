import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
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
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const errors = validateField(name, value);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: errors.length > 0 ? errors : undefined,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (!isValid) {
      setError("Please fix the errors before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
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
    } finally {
      setIsSubmitting(false);
    }
  };

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
