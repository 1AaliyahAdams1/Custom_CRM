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

import { fetchActivityById, updateActivity } from "../../services/activityService";
import SmartDropdown from '../../components/SmartDropdown';
import {
  getAllAccounts,
} from "../../services/accountService";
import { 
  priorityLevelService, 
  activityTypeService, 
} from '../../services/dropdownServices';

const EditActivityPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get activity ID from URL params
  
  const [formData, setFormData] = useState({
    AccountID: "",
    TypeID: "",
    PriorityLevelID: "",
    DueToStart: "",
    DueToEnd: "",
    Completed: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Validation states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Required fields only
  const requiredFields = ['AccountID', 'TypeID', 'PriorityLevelID', 'DueToStart', 'DueToEnd'];

  // --- VALIDATION LOGIC ---
  const validateField = (name, value) => {
    let error = "";
    const strValue = (value ?? "").toString().trim();

    // Check if field is required
    if (requiredFields.includes(name)) {
      if (!strValue) {
        error = "This field is required.";
        return error;
      }
    }

    // Field-specific validation (only if field has value)
    if (strValue) {
      if (name === "DueToStart") {
        if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$|^\d{4}-\d{2}-\d{2}$/.test(strValue)) {
          error = "Please enter a valid date and time.";
        } else {
          const startDate = new Date(strValue);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (startDate < today) {
            error = "Start date cannot be in the past.";
          }
        }
      }
      if (name === "DueToEnd") {
        if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$|^\d{4}-\d{2}-\d{2}$/.test(strValue)) {
          error = "Please enter a valid date and time.";
        } else {
          const endDate = new Date(strValue);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (endDate < today) {
            error = "End date cannot be in the past.";
          }
          
          // Check if end date is after start date
          if (formData.DueToStart && strValue) {
            const startDate = new Date(formData.DueToStart);
            const endDateForComparison = new Date(strValue);
            if (endDateForComparison <= startDate) {
              error = "End date must be after start date.";
            }
          }
        }
      }
      if (name === "Completed") {
        if (!['true', 'false', '1', '0', 'yes', 'no'].includes(strValue.toLowerCase())) {
          error = "Completed must be true/false, 1/0, or yes/no.";
        }
      }
    }

    return error;
  };

  const validateForm = () => {
    let newErrors = {};
    // Only validate required fields for form submission
    requiredFields.forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  };

  // Fetch activity data when component mounts
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
        
        // Populate form with fetched data
        const activityData = response.data;
        setFormData({
          AccountID: activityData.AccountID || "",
          TypeID: activityData.TypeID || "",
          PriorityLevelID: activityData.PriorityLevelID || "",
          DueToStart: activityData.DueToStart || "",
          DueToEnd: activityData.DueToEnd || "",
          Completed: activityData.Completed || "",
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

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Live validation: only validate if field has been touched
    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }

    // Special case: Re-validate end date when start date changes
    if (name === 'DueToStart' && formData.DueToEnd && touched.DueToEnd) {
      const endDateError = validateField('DueToEnd', formData.DueToEnd);
      setErrors(prev => ({
        ...prev,
        DueToEnd: endDateError
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Mark all required fields as touched to show errors
      const newTouched = {};
      requiredFields.forEach(field => {
        newTouched[field] = true;
      });
      setTouched(prev => ({ ...prev, ...newTouched }));
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      console.log('Updating activity:', formData);
      await updateActivity(id, formData);
      setSuccessMessage("Activity updated successfully!");
      
      // Navigate back to activities page after a short delay
      setTimeout(() => {
        navigate("/activities");
      }, 1500);
      
    } catch (error) {
      console.error("Failed to update activity:", error);
      setError("Failed to update activity. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel - navigate back to activities page
  const handleCancel = () => {
    navigate("/activities");
  };

  // Check if all required fields are filled and have no errors
  const isFormValid = () => {
    const formErrors = validateForm();
    return Object.keys(formErrors).length === 0;
  };

  // Account service wrapper for dropdown
  const accountService = {
    getAll: async () => {
      try {
        const response = await getAllAccounts();
        return response.data || [];
      } catch (error) {
        console.error('Error loading accounts:', error);
        return [];
      }
    },
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4} maxWidth={900} mx="auto">
      <Typography variant="h4" gutterBottom>
        Edit Activity
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Success Alert */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      {/* Buttons at the top */}
      <Box mb={3} display="flex" justifyContent="flex-end" gap={2}>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Back
        </Button>
        <Button variant="outlined" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!isFormValid() || saving}
          startIcon={saving ? <CircularProgress size={20} /> : null}
        >
          {saving ? "Updating..." : "Update Activity"}
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <SmartDropdown
              label="Account"
              name="AccountID"
              value={formData.AccountID}
              onChange={handleInputChange}
              onBlur={handleBlur}
              service={accountService}
              displayField="AccountName"
              valueField="AccountID"
              placeholder="Search for account..."
              fullWidth
              error={touched.AccountID && !!errors.AccountID}
              helperText={touched.AccountID && errors.AccountID}
            />
          </Grid>

          <Grid item xs={12}>
            <SmartDropdown
              label="Activity Type"
              name="TypeID"
              value={formData.TypeID}
              onChange={handleInputChange}
              onBlur={handleBlur}
              service={activityTypeService}
              displayField="TypeName"
              valueField="TypeID"
              placeholder="Search for activity type..."
              fullWidth
              error={touched.TypeID && !!errors.TypeID}
              helperText={touched.TypeID && errors.TypeID}
            />
          </Grid>

          <Grid item xs={12}>
            <SmartDropdown
              label="Priority Level"
              name="PriorityLevelID"
              value={formData.PriorityLevelID}
              onChange={handleInputChange}
              onBlur={handleBlur}
              service={priorityLevelService}
              displayField="PriorityLevelName"
              valueField="PriorityLevelID"
              placeholder="Search for priority level..."
              fullWidth
              error={touched.PriorityLevelID && !!errors.PriorityLevelID}
              helperText={touched.PriorityLevelID && errors.PriorityLevelID}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Due To Start"
              name="DueToStart"
              type="datetime-local"
              value={formData.DueToStart}
              onChange={handleInputChange}
              onBlur={handleBlur}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              error={touched.DueToStart && !!errors.DueToStart}
              helperText={touched.DueToStart && errors.DueToStart}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Due To End"
              name="DueToEnd"
              type="datetime-local"
              value={formData.DueToEnd}
              onChange={handleInputChange}
              onBlur={handleBlur}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              error={touched.DueToEnd && !!errors.DueToEnd}
              helperText={touched.DueToEnd && errors.DueToEnd}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Completed"
              name="Completed"
              value={formData.Completed}
              onChange={handleInputChange}
              onBlur={handleBlur}
              fullWidth
              placeholder="Enter: true/false, 1/0, or yes/no"
              error={touched.Completed && !!errors.Completed}
              helperText={touched.Completed && errors.Completed}
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default EditActivityPage;