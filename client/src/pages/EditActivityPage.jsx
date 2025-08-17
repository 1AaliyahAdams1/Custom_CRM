// EditActivityPage.jsx

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

import { fetchActivityById, updateActivity } from "../services/activityService";

const EditActivityPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    activity_name: "",
    type: "",
    date: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Validation state
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [formTouched, setFormTouched] = useState(false);

  // Fetch activity
  useEffect(() => {
    const loadActivity = async () => {
      if (!id) {
        setError("No activity ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetchActivityById(id);
        const activityData = response?.data || response;
        setFormData({
          activity_name: activityData.activity_name || "",
          type: activityData.type || "",
          date: activityData.date || "",
        });
      } catch (error) {
        console.error("Failed to fetch activity:", error);
        setError("Failed to load activity data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, [id]);

  // Auto-clear success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // -------- Validation --------
  const validateField = (name, value) => {
    switch (name) {
      case "activity_name":
        if (!value.trim()) return "Activity name is required";
        if (value.length < 2)
          return "Activity name must be at least 2 characters";
        if (value.length > 100)
          return "Activity name cannot exceed 100 characters";
        break;

      case "type":
        if (!value.trim()) return "Type is required";
        break;

      case "date":
        if (!value.trim()) return "Date is required";
        const dateValue = new Date(value);
        if (isNaN(dateValue.getTime())) return "Please enter a valid date";
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

  // Handle input
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
      await updateActivity(id, formData);
      setSuccessMessage("Activity updated successfully!");
      setTimeout(() => navigate("/activities"), 1500);
    } catch (error) {
      console.error("Failed to update activity:", error);
      setError(
        error.response?.data?.message ||
          "Failed to update activity. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate("/activities");

  const isFormValid = Object.values(fieldErrors).every((msg) => !msg);

  // -------- UI --------
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Edit Activity
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Activity Name"
                name="activity_name"
                value={formData.activity_name}
                onChange={handleInputChange}
                error={isFieldInvalid("activity_name")}
                helperText={getFieldError("activity_name")}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                error={isFieldInvalid("type")}
                helperText={getFieldError("type")}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                error={isFieldInvalid("date")}
                helperText={getFieldError("date")}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={saving}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving || (formTouched && !isFormValid)}
                  startIcon={saving ? <CircularProgress size={20} /> : null}>
                  {saving ? "Updating..." : "Update Activity"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default EditActivityPage;
