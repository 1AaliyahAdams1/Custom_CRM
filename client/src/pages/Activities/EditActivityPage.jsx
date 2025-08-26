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
<<<<<<< HEAD
  Grid,
} from "@mui/material";

import { fetchActivityById, updateActivity } from "../../services/activityService";


const EditActivityPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get account ID from URL params
  
  const [formData, setFormData] = useState({
    AccountID: "",
    ActivityType: "",
    AccountName: "",
    Due_date: "",
    Priority: "",
=======
  FormControlLabel,
  Checkbox
} from "@mui/material";
import { ArrowBack, Save, Clear } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../components/Theme";
import SmartDropdown from '../../components/SmartDropdown';
import { fetchActivityById, updateActivity } from "../../services/activityService";
import { getAllAccounts } from "../../services/accountService";
import { priorityLevelService, activityTypeService } from '../../services/dropdownServices';

const EditActivityPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    AccountID: "",
    TypeID: "",
    PriorityLevelID: "",
    DueToStart: "",
    DueToEnd: "",
    Completed: false
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

<<<<<<< HEAD
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
=======
  useEffect(() => {
    const loadActivity = async () => {
      if (!id) return setError("No activity ID provided");
      try {
        const response = await fetchActivityById(id);
        const activityData = response.data;
        setFormData({
          AccountID: activityData.AccountID || "",
          TypeID: activityData.TypeID || "",
          PriorityLevelID: activityData.PriorityLevelID || "",
          DueToStart: activityData.DueToStart || "",
          DueToEnd: activityData.DueToEnd || "",
          Completed: !!activityData.Completed
        });
      } catch {
        setError("Failed to load activity data.");
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
      } finally {
        setLoading(false);
      }
    };
<<<<<<< HEAD

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
=======
    loadActivity();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateActivity(id, formData);
      setSuccessMessage("Activity updated successfully!");
      setTimeout(() => navigate("/activities"), 1500);
    } catch {
      setError("Failed to update activity");
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
    } finally {
      setSaving(false);
    }
  };

<<<<<<< HEAD
  // Handle cancel - navigate back to activities page
  const handleCancel = () => {
    navigate("/activities");
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
=======
  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </ThemeProvider>
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
    );
  }

  return (
<<<<<<< HEAD
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
=======
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', minHeight: '100vh', p: 3, backgroundColor: '#fafafa' }}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4">Edit Activity</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(-1)}>Back</Button>
              <Button variant="outlined" startIcon={<Clear />} onClick={() => navigate("/activities")} disabled={saving}>Cancel</Button>
              <Button variant="contained" startIcon={saving ? <CircularProgress size={20} /> : <Save />} onClick={handleSubmit} disabled={saving}>
                {saving ? 'Updating...' : 'Update Activity'}
              </Button>
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {successMessage && <Alert severity="success" sx={{ mb: 3 }}>{successMessage}</Alert>}

          <Paper elevation={0} sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <SmartDropdown
                  label="Account"
                  name="AccountID"
                  value={formData.AccountID}
                  onChange={handleInputChange}
                  service={{ getAll: async () => (await getAllAccounts()).data }}
                  displayField="AccountName"
                  valueField="AccountID"
                  disabled={saving}
                />

                <SmartDropdown
                  label="Activity Type"
                  name="TypeID"
                  value={formData.TypeID}
                  onChange={handleInputChange}
                  service={activityTypeService}
                  displayField="TypeName"
                  valueField="TypeID"
                  disabled={saving}
                />

                <SmartDropdown
                  label="Priority Level"
                  name="PriorityLevelID"
                  value={formData.PriorityLevelID}
                  onChange={handleInputChange}
                  service={priorityLevelService}
                  displayField="PriorityLevelName"
                  valueField="PriorityLevelID"
                  disabled={saving}
                />

                <TextField
                  fullWidth
                  label="Due To Start"
                  name="DueToStart"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  value={formData.DueToStart}
                  onChange={handleInputChange}
                  disabled={saving}
                />

                <TextField
                  fullWidth
                  label="Due To End"
                  name="DueToEnd"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  value={formData.DueToEnd}
                  onChange={handleInputChange}
                  disabled={saving}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.Completed}
                      onChange={handleCheckboxChange}
                      name="Completed"
                      disabled={saving}
                    />
                  }
                  label="Completed"
                />
              </Box>
            </form>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default EditActivityPage;
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
