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
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadActivity = async () => {
      if (!id) {
        setError("No activity ID provided");
        setLoading(false);
        return;
      }

      try {
        console.log("Loading activity with ID:", id);

        // Fetch the activity data first
        const activityResponse = await fetchActivityById(id);
        const activityData = activityResponse.data;
        console.log("Activity data loaded:", activityData);

        // Format dates for datetime-local inputs
        const formatDateTimeLocal = (dateString) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          if (isNaN(date)) return "";

          // Convert to local timezone and format for datetime-local input
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');

          return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        setFormData({
          AccountName: activityData.AccountName,
          ActivityType: activityData.ActivityType || "",
          PriorityLevelID: activityData.PriorityLevelID || "",
          DueToStart: formatDateTimeLocal(activityData.DueToStart),
          DueToEnd: formatDateTimeLocal(activityData.DueToEnd),
          Completed: !!activityData.Completed
        });

      } catch (err) {
        console.error("Error loading activity:", err);
        setError("Failed to load activity data.");
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log("Input changed:", name, "=", value);
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    console.log("Checkbox changed:", name, "=", checked);
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      console.log("Submitting form data:", formData);

      await updateActivity(id, formData);
      setSuccessMessage("Activity updated successfully!");
      setTimeout(() => navigate("/activities"), 1500);
    } catch (err) {
      console.error("Error updating activity:", err);
      setError("Failed to update activity");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
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

          {/* Temporary debug section */}
          <Paper elevation={0} sx={{ p: 2, mb: 2, backgroundColor: '#f0f0f0' }}>
            <Typography variant="h6">Debug Info:</Typography>
            <Box sx={{ fontSize: '12px', fontFamily: 'monospace' }}>
              <div><strong>Current FormData:</strong></div>
              <pre>{JSON.stringify(formData, null, 2)}</pre>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <SmartDropdown
                  label="Account"
                  name="AccountName"
                  value={formData.AccountName}
                  onChange={handleInputChange}
                  service={{ getAll: async () => (await getAllAccounts()).data }}
                  displayField="AccountName"
                  valueField="AccountName"
                  disabled={saving}
                />

                <SmartDropdown
                  label="Activity Type"
                  name="ActivityType"
                  value={formData.ActivityType} // "Call"
                  onChange={handleInputChange}
                  service={activityTypeService}
                  displayField="TypeName" // Shows "Call" in dropdown
                  valueField="ActivityType" // Returns "Call" when selected
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