//CreateActivityPage.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
} from "@mui/material";
import { createActivity } from "../services/activityService";

const CreateActivityPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    activity_name: "",
    type: "",
    date: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Validation function
  const validateForm = () => {
    const errors = {};

    // Activity name validation
    if (!formData.activity_name.trim()) {
      errors.activity_name = "Activity name is required";
    } else if (formData.activity_name.length < 2) {
      errors.activity_name = "Activity name must be at least 2 characters";
    } else if (formData.activity_name.length > 100) {
      errors.activity_name = "Activity name cannot exceed 100 characters";
    }

    // Type validation
    if (!formData.type.trim()) {
      errors.type = "Type is required";
    }

    // Date validation
    if (!formData.date.trim()) {
      errors.date = "Date is required";
    } else {
      const dateValue = new Date(formData.date);
      if (isNaN(dateValue.getTime())) {
        errors.date = "Please enter a valid date";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      setError("Please fix the validation errors below");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Creating activity:", formData);

      await createActivity(formData);
      setSuccessMessage("Activity created successfully!");

      // Navigate back to activities page after a short delay
      setTimeout(() => {
        navigate("/activities");
      }, 1500);
    } catch (error) {
      console.error("Error creating activity:", error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Failed to create activity. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/activities");
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Create New Activity
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Success Alert */}
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
            {/* Activity Name - Required */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Activity Name"
                name="activity_name"
                value={formData.activity_name}
                onChange={handleInputChange}
                required
                variant="outlined"
                error={!!validationErrors.activity_name}
                helperText={validationErrors.activity_name}
                placeholder="Enter activity name"
              />
            </Grid>

            {/* Type - Required */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                variant="outlined"
                error={!!validationErrors.type}
                helperText={validationErrors.type}
                placeholder="Enter activity type"
              />
            </Grid>

            {/* Date - Required */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                error={!!validationErrors.date}
                helperText={validationErrors.date}
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={loading}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}>
                  {loading ? "Creating..." : "Create Activity"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateActivityPage;
