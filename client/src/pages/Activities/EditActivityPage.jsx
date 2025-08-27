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
      } finally {
        setLoading(false);
      }
    };
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
