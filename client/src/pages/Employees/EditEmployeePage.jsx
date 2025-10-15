import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
} from "@mui/material";
import { ArrowBack, Save, Clear } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../components/Theme";
import { getEmployeeById, updateEmployee } from "../../services/employeeService";

const EditEmployeePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    EmployeeName: "",
    EmployeeEmail: "",
    EmployeePhone: "",
    CityID: "",
    CountryID: "",
    StateProvinceID: "",
    HireDate: "",
    TerminationDate: null,
    DepartmentID: "",
    Salary: "",
    Holidays_PA: "",
    JobTitleID: "",
    UserID: "",
    Active: true,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const requiredFields = [
    "EmployeeName",
    "HireDate",
    "UserID",
    "Active",
  ];

  // Load employee data on component mount
  useEffect(() => {
    const loadEmployee = async () => {
      try {
        setIsLoading(true);
        const employee = await getEmployeeById(id);
        
        // Convert dates from DB format to input format
        const formatDate = (dateString) => {
          if (!dateString) return "";
          // Handle both "2025-01-15T00:00:00" and "2025-01-15" formats
          return dateString.split('T')[0];
        };

        setFormData({
          EmployeeName: employee.EmployeeName || "",
          EmployeeEmail: employee.EmployeeEmail || "",
          EmployeePhone: employee.EmployeePhone || "",
          CityID: employee.CityID ? employee.CityID.toString() : "",
          CountryID: employee.CountryID ? employee.CountryID.toString() : "",
          StateProvinceID: employee.StateProvinceID ? employee.StateProvinceID.toString() : "",
          HireDate: formatDate(employee.HireDate),
          TerminationDate: employee.TerminationDate ? formatDate(employee.TerminationDate) : null,
          DepartmentID: employee.DepartmentID ? employee.DepartmentID.toString() : "",
          Salary: employee.salary ? employee.salary.toString() : "",
          Holidays_PA: employee.Holidays_PA ? employee.Holidays_PA.toString() : "",
          JobTitleID: employee.JobTitleID ? employee.JobTitleID.toString() : "",
          UserID: employee.UserID ? employee.UserID.toString() : "",
          Active: employee.Active !== undefined ? employee.Active : true,
        });
      } catch (err) {
        console.error("Error loading employee:", err);
        setError("Failed to load employee data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadEmployee();
    }
  }, [id]);

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
      if (name === "TerminationDate" && strValue) {
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
        const num = Number(strValue);
        if (isNaN(num) || num <= 0)
          errors.push("Department ID must be a positive number.");
      }
      if (name === "JobTitleID") {
        const num = Number(strValue);
        if (isNaN(num) || num <= 0)
          errors.push("Job Title ID must be a positive number.");
      }
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
        salary: formData.Salary ? parseFloat(formData.Salary) : null,
        CountryID: formData.CountryID ? parseInt(formData.CountryID) : null,
        TerminationDate: formData.TerminationDate || null,
        CityID: formData.CityID ? parseInt(formData.CityID) : null,
        StateProvinceID: formData.StateProvinceID ? parseInt(formData.StateProvinceID) : null,
        DepartmentID: formData.DepartmentID ? parseInt(formData.DepartmentID) : null,
        JobTitleID: formData.JobTitleID ? parseInt(formData.JobTitleID) : null,
        UserID: parseInt(formData.UserID),
        Holidays_PA: formData.Holidays_PA ? parseInt(formData.Holidays_PA) : null,
      };

      console.log("Updating employee data:", employeeData);
      
      // Call with required audit parameters (actionTypeId = 2 for Update)
      await updateEmployee(id, employeeData, 1, 2);
      setSuccessMessage("Employee updated successfully!");
      setTimeout(() => navigate("/employees"), 1500);
    } catch (err) {
      console.error("Error updating employee:", err);
      setError(`Failed to update employee: ${err.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate("/employees");

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

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            width: "100%",
            minHeight: "100vh",
            p: 3,
            backgroundColor: "#fafafa",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}>
          <CircularProgress size={60} />
        </Box>
      </ThemeProvider>
    );
  }

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
              Edit Employee
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
                {isSubmitting ? "Updating..." : "Update Employee"}
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
                  value={formData.TerminationDate || ""}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={isFieldInvalid("TerminationDate")}
                  helperText={getFieldError("TerminationDate")}
                />

                <TextField
                  label="Department ID"
                  name="DepartmentID"
                  type="number"
                  value={formData.DepartmentID}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  fullWidth
                  error={isFieldInvalid("DepartmentID")}
                  helperText={getFieldError("DepartmentID")}
                />

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
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default EditEmployeePage;