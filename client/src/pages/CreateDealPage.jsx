import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Grid,
  Box,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { createDeal } from "../services/dealService";
import { getAllAccounts } from "../services/accountService";
import SmartDropdown from "../components/SmartDropdown";
import { dealStageService } from "../services/dropdownServices";
import theme from "../components/Theme";

const CreateDealPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formData, setFormData] = useState({
    AccountID: "",
    DealStageID: "",
    DealName: "",
    Value: "",
    CloseDate: "",
    Probability: "",
    CurrencyID: "",
  });

  // ✅ Fix account service wrapper
  const accountService = {
    getAll: async () => {
      try {
        return await getAllAccounts(); // already returns data
      } catch (error) {
        console.error("Error loading accounts:", error);
        return [];
      }
    },
  };

  // ----------------- Validation -----------------
  const validateField = (name, value) => {
    const errors = [];
    switch (name) {
      case "DealName":
        if (!value || value.trim().length === 0) {
          errors.push("Deal name is required");
        } else if (value.length < 2) {
          errors.push("Deal name must be at least 2 characters");
        } else if (value.length > 100) {
          errors.push("Deal name must be less than 100 characters");
        }
        break;

      case "Value":
        if (!value || isNaN(value) || Number(value) <= 0) {
          errors.push("Value must be a positive number");
        }
        break;

      case "Probability":
        if (value) {
          const num = Number(value);
          if (isNaN(num) || num < 0 || num > 100) {
            errors.push("Probability must be between 0 and 100");
          }
        }
        break;

      case "CloseDate":
        if (!value) {
          errors.push("Close date is required");
        } else {
          const today = new Date().toISOString().split("T")[0];
          if (value < today) {
            errors.push("Close date cannot be in the past");
          }
        }
        break;

      case "AccountID":
      case "DealStageID":
        if (!value) {
          errors.push("This field is required");
        }
        break;

      default:
        break;
    }
    return errors;
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    Object.keys(formData).forEach((field) => {
      const fieldErrors = validateField(field, formData[field]);
      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
        isValid = false;
      }
    });

    setFieldErrors(errors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (error) setError(null);

    // live validation
    const errs = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: errs }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach((key) => (allTouched[key] = true));
    setTouched(allTouched);

    if (!validateForm()) {
      setError("Please fix the errors before submitting");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createDeal(formData);
      navigate("/deals");
    } catch (err) {
      console.error("Error creating deal:", err);
      if (err.response?.status === 400) {
        setError("Invalid deal data provided");
      } else if (err.response?.status === 409) {
        setError("A deal with this name already exists");
      } else if (err.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Failed to create deal. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isFieldInvalid = (name) =>
    touched[name] && fieldErrors[name] && fieldErrors[name].length > 0;

  const getFieldError = (name) =>
    isFieldInvalid(name) ? fieldErrors[name][0] : "";

  // ----------------- JSX -----------------
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: "100%",
          backgroundColor: "#fafafa",
          minHeight: "100vh",
          p: 3,
        }}>
        <Paper
          elevation={0}
          sx={{ maxWidth: 900, mx: "auto", p: 4, borderRadius: "8px" }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
            Create New Deal
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box mb={4} display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              disabled={loading}>
              Back
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/deals")}
              disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <SmartDropdown
                  label="Account"
                  name="AccountID"
                  value={formData.AccountID}
                  onChange={handleInputChange}
                  service={accountService}
                  displayField="AccountName"
                  valueField="AccountID"
                  error={isFieldInvalid("AccountID")}
                  helperText={getFieldError("AccountID")}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <SmartDropdown
                  label="Deal Stage"
                  name="DealStageID"
                  value={formData.DealStageID}
                  onChange={handleInputChange}
                  service={dealStageService}
                  displayField="StageName"
                  valueField="DealStageID"
                  error={isFieldInvalid("DealStageID")}
                  helperText={getFieldError("DealStageID")}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Deal Name"
                  name="DealName"
                  value={formData.DealName}
                  onChange={handleInputChange}
                  error={isFieldInvalid("DealName")}
                  helperText={getFieldError("DealName")}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Value"
                  name="Value"
                  type="number"
                  value={formData.Value}
                  onChange={handleInputChange}
                  error={isFieldInvalid("Value")}
                  helperText={getFieldError("Value")}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Close Date"
                  name="CloseDate"
                  type="date"
                  value={formData.CloseDate}
                  onChange={handleInputChange}
                  error={isFieldInvalid("CloseDate")}
                  helperText={getFieldError("CloseDate")}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Probability (%)"
                  name="Probability"
                  type="number"
                  value={formData.Probability}
                  onChange={handleInputChange}
                  error={isFieldInvalid("Probability")}
                  helperText={getFieldError("Probability")}
                  fullWidth
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Currency ID"
                  name="CurrencyID"
                  value={formData.CurrencyID}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default CreateDealPage;
