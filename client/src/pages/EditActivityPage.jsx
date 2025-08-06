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
  const { id } = useParams(); // Get account ID from URL params
  
  const [formData, setFormData] = useState({
    AccountID: "",
    ActivityType: "",
    AccountName: "",
    Due_date: "",
    Priority: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

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
          ActivityID: activityData.ActivityID || "",
          ActivityType: activityData.ActivityType || "",
          AccountName: activityData.AccountName || "",
          Due_date: activityData.Due_date || "",
           Priority: activityData.Priority || "",
         
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

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.ActivityID.trim()) {
      setError("Activity ID is required");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      // Add Activity ID to formData for the update
      const updateData = {
        ...formData,
        ActivityID: id
      };
      
      await updateActivity(id, updateData);
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
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

      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Account ID - Required */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Account ID"
                name="AccountID"
                value={formData.AccountID}
                onChange={handleInputChange}
                required
                variant="outlined"
              />
            </Grid>

            {/* ActivityType */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Activity Type"
                name="ActivityType"
                value={formData.ActivityType}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            {/* Account Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Account Name"
                name="AccountName"
                value={formData.AccountName}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>

            {/* Due_date */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Due date"
                name="Due_date"
                value={formData.Due_date}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>

            {/* Priority */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Priority"
                name="Priority"
                value={formData.Priority}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>

            
            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : null}
                >
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