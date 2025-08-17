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
  Skeleton,
} from "@mui/material";
import { ArrowBack, Save, Clear } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  fetchAccountById,
  updateAccount,
  getAllAccounts,
} from "../services/accountService";
import {
  cityService,
  industryService,
  countryService,
  stateProvinceService,
} from "../services/dropdownServices";
import SmartDropdown from "../components/SmartDropdown";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#050505",
      contrastText: "#fafafa",
    },
    secondary: {
      main: "#666666",
      contrastText: "#ffffff",
    },
    background: {
      default: "#fafafa",
      paper: "#ffffff",
    },
    text: {
      primary: "#050505",
      secondary: "#666666",
    },
    divider: "#e5e5e5",
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: "1px solid #e5e5e5",
          borderRadius: "8px",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#ffffff",
            "& fieldset": { borderColor: "#e5e5e5" },
            "&:hover fieldset": { borderColor: "#cccccc" },
            "&.Mui-focused fieldset": { borderColor: "#050505" },
            "&.Mui-error fieldset": { borderColor: "#d32f2f" },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        outlined: {
          borderColor: "#e5e5e5",
          color: "#050505",
          "&:hover": {
            borderColor: "#cccccc",
            backgroundColor: "#f5f5f5",
          },
        },
      },
    },
  },
});

// Validation rules (same as CreateAccount)
const validationRules = {
  AccountName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: null,
    message: "Account name must be between 2 and 100 characters",
  },
  email: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address",
  },
  Website: {
    required: false,
    pattern: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    message: "Please enter a valid website URL",
  },
  PrimaryPhone: {
    required: false,
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: "Please enter a valid phone number",
  },
  fax: {
    required: false,
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: "Please enter a valid fax number",
  },
  postal_code: {
    required: false,
    minLength: 3,
    maxLength: 10,
    message: "Postal code must be between 3 and 10 characters",
  },
  number_of_employees: {
    required: false,
    pattern: /^\d+$/,
    min: 0,
    message: "Number of employees must be a positive number",
  },
  annual_revenue: {
    required: false,
    pattern: /^\d+(\.\d{1,2})?$/,
    min: 0,
    message: "Annual revenue must be a positive number",
  },
  number_of_venues: {
    required: false,
    pattern: /^\d+$/,
    min: 0,
    message: "Number of venues must be a positive number",
  },
  number_of_releases: {
    required: false,
    pattern: /^\d+$/,
    min: 0,
    message: "Number of releases must be a positive number",
  },
  number_of_events_anually: {
    required: false,
    pattern: /^\d+$/,
    min: 0,
    message: "Number of events annually must be a positive number",
  },
};

const EditAccount = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [cities, setCities] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [countries, setCountries] = useState([]);
  const [stateProvinces, setStateProvinces] = useState([]);
  const [formData, setFormData] = useState({
    AccountName: "",
    CityID: "",
    CountryID: "",
    StateProvinceID: "",
    street_address1: "",
    street_address2: "",
    street_address3: "",
    postal_code: "",
    PrimaryPhone: "",
    IndustryID: "",
    Website: "",
    fax: "",
    email: "",
    number_of_employees: "",
    annual_revenue: "",
    number_of_venues: "",
    number_of_releases: "",
    number_of_events_anually: "",
    ParentAccount: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Validation function
  const validateField = (name, value) => {
    const rule = validationRules[name];
    if (!rule) return null;

    // Required field validation
    if (rule.required && (!value || value.toString().trim() === "")) {
      return `${name
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value || value.toString().trim() === "") return null;

    // Min length validation
    if (rule.minLength && value.toString().length < rule.minLength) {
      return rule.message || `Minimum length is ${rule.minLength} characters`;
    }

    // Max length validation
    if (rule.maxLength && value.toString().length > rule.maxLength) {
      return rule.message || `Maximum length is ${rule.maxLength} characters`;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value.toString())) {
      return rule.message || "Invalid format";
    }

    // Min value validation for numbers
    if (rule.min !== undefined && parseFloat(value) < rule.min) {
      return rule.message || `Minimum value is ${rule.min}`;
    }

    return null;
  };

  // Validate all fields
  const validateForm = () => {
    const errors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });
    return errors;
  };

  // Check if field has error and is touched
  const getFieldError = (fieldName) => {
    return touchedFields[fieldName] && validationErrors[fieldName];
  };

  // Check if form is valid
  const isFormValid = () => {
    const errors = validateForm();
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [citiesData, industriesData, countriesData, stateProvincesData] =
          await Promise.all([
            cityService.getAll(),
            industryService.getAll(),
            countryService.getAll(),
            stateProvinceService.getAll(),
          ]);
        setCities(citiesData);
        setIndustries(industriesData);
        setCountries(countriesData);
        setStateProvinces(stateProvincesData);
      } catch {
        setError("Failed to load dropdown data");
      }
    };
    loadDropdownData();
  }, []);

  useEffect(() => {
    const loadAccount = async () => {
      if (!id) {
        setError("No account ID provided");
        setLoading(false);
        return;
      }
      try {
        const accountData = await fetchAccountById(id);

        setFormData({
          AccountName: accountData.AccountName || "",
          CityID: accountData.CityID || "",
          CountryID: accountData.CountryID || "",
          StateProvinceID: accountData.StateProvinceID || "",
          street_address1: accountData.street_address1 || "",
          street_address2: accountData.street_address2 || "",
          street_address3: accountData.street_address3 || "",
          postal_code: accountData.postal_code || "",
          PrimaryPhone: accountData.PrimaryPhone || "",
          IndustryID: accountData.IndustryID || "",
          Website: accountData.Website || "",
          fax: accountData.fax || "",
          email: accountData.email || "",
          number_of_employees: accountData.number_of_employees || "",
          annual_revenue: accountData.annual_revenue || "",
          number_of_venues: accountData.number_of_venues || "",
          number_of_releases: accountData.number_of_releases || "",
          number_of_events_anually: accountData.number_of_events_anually || "",
          ParentAccount: accountData.ParentAccountID || "", // ✅ use ID not name
        });
      } catch {
        setError("Failed to load account data");
      } finally {
        setLoading(false);
      }
    };
    loadAccount();
  }, [id]);

  // Handle input changes with real-time validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Mark field as touched
    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Real-time validation
    const fieldError = validateField(name, value);
    setValidationErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));

    // Clear general error when user starts typing
    if (error) setError(null);
  };

  // Handle field blur for validation
  const handleFieldBlur = (e) => {
    const { name, value } = e.target;
    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }));

    const fieldError = validateField(name, value);
    setValidationErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate entire form
    const errors = validateForm();
    setValidationErrors(errors);

    // Mark all fields as touched to show validation errors
    const allFieldsTouched = {};
    Object.keys(formData).forEach((key) => {
      allFieldsTouched[key] = true;
    });
    setTouchedFields(allFieldsTouched);

    // Stop submission if there are validation errors
    if (Object.keys(errors).length > 0) {
      setError("Please correct the errors below before submitting.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Clean data before sending
      const cleanedData = { ...formData };

      // Convert empty strings to null for optional fields
      Object.keys(cleanedData).forEach((key) => {
        if (cleanedData[key] === "") {
          cleanedData[key] = null;
        }
      });

      // Convert numeric fields safely
      const numericFields = [
        "CityID",
        "CountryID",
        "StateProvinceID",
        "IndustryID",
        "number_of_employees",
        "annual_revenue",
        "number_of_venues",
        "number_of_releases",
        "number_of_events_anually",
      ];

      numericFields.forEach((field) => {
        if (
          cleanedData[field] &&
          !/^\d+(\.\d{1,2})?$/.test(cleanedData[field])
        ) {
          // Drop invalid numbers
          cleanedData[field] = null;
        } else if (cleanedData[field] !== null) {
          cleanedData[field] = Number(cleanedData[field]);
        }
      });

      await updateAccount(id, cleanedData);
      setSuccessMessage("Account updated successfully!");
      setTimeout(() => navigate("/accounts"), 1500);
    } catch {
      setError("Failed to update account");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ p: 3 }}>
          <Skeleton variant="rectangular" width="100%" height={400} />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: "100%",
          backgroundColor: "#fafafa",
          minHeight: "100vh",
          p: 3,
        }}>
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h4" sx={{ color: "#050505", fontWeight: 600 }}>
              Edit Account
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
                onClick={() => navigate("/accounts")}
                disabled={saving}>
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                onClick={handleSubmit}
                disabled={saving || !isFormValid()}
                sx={{
                  backgroundColor: "#050505",
                  "&:hover": { backgroundColor: "#333333" },
                  "&:disabled": {
                    backgroundColor: "#cccccc",
                    color: "#666666",
                  },
                }}>
                {saving ? "Updating..." : "Update Account"}
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
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 3,
                }}>
                {/* Account Name - Required */}
                <TextField
                  fullWidth
                  label="Account Name *"
                  name="AccountName"
                  value={formData.AccountName}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={!!getFieldError("AccountName")}
                  helperText={getFieldError("AccountName")}
                  disabled={saving}
                  required
                />

                {/* Parent Account Dropdown */}
                <SmartDropdown
                  label="Parent Account"
                  name="ParentAccount"
                  value={formData.ParentAccount}
                  onChange={handleInputChange}
                  service={{
                    getAll: async () => await getAllAccounts(),
                  }}
                  displayField="AccountName"
                  valueField="AccountID"
                  disabled={saving}
                />

                {/* Country Dropdown */}
                <SmartDropdown
                  label="Country"
                  name="CountryID"
                  value={formData.CountryID}
                  onChange={handleInputChange}
                  service={countryService}
                  displayField="name"
                  valueField="id"
                  disabled={saving}
                />

                {/* State/Province Dropdown */}
                <SmartDropdown
                  label="State/Province"
                  name="StateProvinceID"
                  value={formData.StateProvinceID}
                  onChange={handleInputChange}
                  service={stateProvinceService}
                  displayField="name"
                  valueField="id"
                  disabled={saving}
                />

                {/* City Dropdown */}
                <SmartDropdown
                  label="City"
                  name="CityID"
                  value={formData.CityID}
                  onChange={handleInputChange}
                  service={cityService}
                  displayField="name"
                  valueField="id"
                  disabled={saving}
                />

                {/* Industry Dropdown */}
                <SmartDropdown
                  label="Industry"
                  name="IndustryID"
                  value={formData.IndustryID}
                  onChange={handleInputChange}
                  service={industryService}
                  displayField="name"
                  valueField="id"
                  disabled={saving}
                />

                {/* Address Fields */}
                <TextField
                  fullWidth
                  label="Street Address 1"
                  name="street_address1"
                  value={formData.street_address1}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  disabled={saving}
                />

                <TextField
                  fullWidth
                  label="Street Address 2"
                  name="street_address2"
                  value={formData.street_address2}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  disabled={saving}
                />

                <TextField
                  fullWidth
                  label="Street Address 3"
                  name="street_address3"
                  value={formData.street_address3}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  disabled={saving}
                />

                <TextField
                  fullWidth
                  label="Postal Code"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={!!getFieldError("postal_code")}
                  helperText={getFieldError("postal_code")}
                  disabled={saving}
                />

                {/* Contact Information */}
                <TextField
                  fullWidth
                  label="Primary Phone"
                  name="PrimaryPhone"
                  value={formData.PrimaryPhone}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={!!getFieldError("PrimaryPhone")}
                  helperText={getFieldError("PrimaryPhone")}
                  disabled={saving}
                />

                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={!!getFieldError("email")}
                  helperText={getFieldError("email")}
                  disabled={saving}
                />

                <TextField
                  fullWidth
                  label="Fax"
                  name="fax"
                  value={formData.fax}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={!!getFieldError("fax")}
                  helperText={getFieldError("fax")}
                  disabled={saving}
                />

                <TextField
                  fullWidth
                  label="Website"
                  name="Website"
                  value={formData.Website}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={!!getFieldError("Website")}
                  helperText={getFieldError("Website")}
                  disabled={saving}
                />

                {/* Numeric Fields */}
                <TextField
                  fullWidth
                  label="Annual Revenue"
                  name="annual_revenue"
                  value={formData.annual_revenue}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={!!getFieldError("annual_revenue")}
                  helperText={getFieldError("annual_revenue")}
                  disabled={saving}
                />

                <TextField
                  fullWidth
                  label="Number of Employees"
                  name="number_of_employees"
                  value={formData.number_of_employees}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={!!getFieldError("number_of_employees")}
                  helperText={getFieldError("number_of_employees")}
                  disabled={saving}
                />

                <TextField
                  fullWidth
                  label="Number of Releases"
                  name="number_of_releases"
                  value={formData.number_of_releases}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={!!getFieldError("number_of_releases")}
                  helperText={getFieldError("number_of_releases")}
                  disabled={saving}
                />

                <TextField
                  fullWidth
                  label="Number of Events Annually"
                  name="number_of_events_anually"
                  value={formData.number_of_events_anually}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={!!getFieldError("number_of_events_anually")}
                  helperText={getFieldError("number_of_events_anually")}
                  disabled={saving}
                />

                <TextField
                  fullWidth
                  label="Number of Venues"
                  name="number_of_venues"
                  value={formData.number_of_venues}
                  onChange={handleInputChange}
                  onBlur={handleFieldBlur}
                  error={!!getFieldError("number_of_venues")}
                  helperText={getFieldError("number_of_venues")}
                  disabled={saving}
                />
              </Box>
            </form>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default EditAccount;
