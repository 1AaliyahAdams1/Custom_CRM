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
import { useTheme } from "@mui/material/styles";
import SmartDropdown from '../../components/SmartDropdown';
import { fetchActivityById, updateActivity } from "../../services/activityService";
import { getAllAccounts } from "../../services/accountService";
import { priorityLevelService, activityTypeService } from '../../services/dropdownServices';

const EditActivityPage = () => {
  const theme = useTheme();
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
        // Fetch the activity data first
        const activityResponse = await fetchActivityById(id);
        const activityData = activityResponse.data;

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
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
        sx={{ backgroundColor: theme.palette.background.default }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: '100vh', 
      p: 3, 
      backgroundColor: theme.palette.background.default 
    }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>
            Edit Activity
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<Clear />} 
              onClick={() => navigate("/activities")} 
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              startIcon={saving ? <CircularProgress size={20} /> : <Save />} 
              onClick={handleSubmit} 
              disabled={saving}
            >
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
                value={formData.ActivityType}
                onChange={handleInputChange}
                service={activityTypeService}
                displayField="TypeName"
                valueField="ActivityType"
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
  );
};

export default EditActivityPage;