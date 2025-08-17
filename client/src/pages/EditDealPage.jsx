import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Grid,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { getDealById, updateDeal } from "../services/dealService";
import { getAllAccounts } from "../services/accountService";
import SmartDropdown from "../components/SmartDropdown";
import { dealStageService } from "../services/dropdownServices";
import theme from "../components/Theme";

const EditDealPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    AccountID: "",
    DealStageID: "",
    DealName: "",
    Value: "",
    CloseDate: "",
    Probability: "",
    CurrencyID: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // 🔹 Validation states
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formTouched, setFormTouched] = useState(false);

  // ✅ Fix wrapper
  const accountService = {
    getAll: async () => {
      try {
        return await getAllAccounts();
      } catch (error) {
        console.error("Error loading accounts:", error);
        return [];
      }
    },
  };

  // ---------------- Fetch deal ----------------
  useEffect(() => {
    const loadDeal = async () => {
      if (!id) {
        setError("No deal ID provided");
        setLoading(false);
        return;
      }

      try {
        const dealData = await getDealById(id);
        setFormData({
          AccountID: dealData.AccountID || "",
          DealStageID: dealData.DealStageID || "",
          DealName: dealData.DealName || "",
          Value: dealData.Value || "",
          CloseDate: dealData.CloseDate ? dealData.CloseDate.split("T")[0] : "",
          Probability: dealData.Probability || "",
          CurrencyID: dealData.CurrencyID || "",
        });
      } catch (error) {
        console.error("Failed to fetch deal:", error);
        setError("Failed to load deal data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadDeal();
  }, [id]);

  // Auto-clear success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // ---------------- Validation ----------------
  const validateField = (name, value) => {
    if (
      !value &&
      ["AccountID", "DealStageID", "DealName", "Value", "CloseDate"].includes(
        name
      )
    ) {
      return "This field is required";
    }

    switch (name) {
      case "DealName":
        if (value.trim().length < 2)
          return "Deal name must be at least 2 characters";
        break;

      case "Value":
        if (isNaN(value) || Number(value) <= 0)
          return "Value must be a positive number";
        break;

      case "Probability":
        if (value) {
          const num = Number(value);
          if (isNaN(num) || num < 0 || num > 100)
            return "Probability must be between 0 and 100";
        }
        break;

      case "CloseDate":
        const today = new Date().toISOString().split("T")[0];
        if (value < today) return "Close date cannot be in the past";
        break;

      default:
        break;
    }
    return "";
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    Object.keys(formData).forEach((field) => {
      const msg = validateField(field, formData[field]);
      if (msg) {
        errors[field] = msg;
        isValid = false;
      }
    });

    setFieldErrors(errors);
    return isValid;
  };

  const isFieldInvalid = (name) => touched[name] && fieldErrors[name];
  const getFieldError = (name) =>
    isFieldInvalid(name) ? fieldErrors[name] : "";

  // Handle input changes + live validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (error) setError(null);

    const msg = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: msg }));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormTouched(true);

    // mark all fields touched
    const allTouched = {};
    Object.keys(formData).forEach((key) => (allTouched[key] = true));
    setTouched(allTouched);

    if (!validateForm()) {
      setError("Please fix the errors before submitting");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await updateDeal(id, formData);
      setSuccessMessage("Deal updated successfully!");
      setTimeout(() => navigate("/deals"), 1500);
    } catch (err) {
      console.error("Failed to update deal:", err);
      if (err.response?.status === 400) setError("Invalid deal data provided");
      else if (err.response?.status === 409)
        setError("A deal with this name already exists");
      else setError("Failed to update deal. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = Object.values(fieldErrors).every((msg) => !msg);

  // ---------------- UI ----------------
  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}>
          <CircularProgress />
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
        <Paper sx={{ maxWidth: 900, mx: "auto", p: 4, borderRadius: "8px" }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
            Edit Deal
          </Typography>

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

          {/* Buttons */}
          <Box mb={4} display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              disabled={saving}>
              Back
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/deals")}
              disabled={saving}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={saving || (formTouched && !isFormValid)}
              startIcon={saving && <CircularProgress size={20} />}>
              {saving ? "Updating..." : "Update Deal"}
            </Button>
          </Box>

          {/* Form */}
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

export default EditDealPage;
