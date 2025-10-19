import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { ArrowBack, Save, Clear } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import SmartDropdown from '../../components/SmartDropdown';
import { fetchActivityById, updateActivity } from "../../services/activityService";
import { getAllAccounts } from "../../services/accountService";
import { priorityLevelService, activityTypeService } from '../../services/dropdownServices';

// Helper function to format datetime for input field
const formatDateTimeLocal = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const EditActivityPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const passedActivity = location.state?.activity;

  const [formData, setFormData] = useState({
    AccountID: "",
    AccountName: "",
    TypeID: "",
    PriorityLevelID: "",
    DueToStart: "",
    DueToEnd: "",
    Completed: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [accounts, setAccounts] = useState([]);

  // Load activity either from passed state or server
  useEffect(() => {
    const loadActivity = async () => {
      try {
        setLoading(true);
        
        // First, load all accounts to get AccountID mapping
        console.log("🔄 Loading accounts...");
        const accountsData = await getAllAccounts();
        console.log("📦 Accounts loaded:", accountsData?.length || 0, "accounts");
        if (accountsData && accountsData.length > 0) {
          console.log("First account sample:", accountsData[0]);
        }
        setAccounts(accountsData);
        
        let activity;
        
        if (passedActivity) {
          console.log("📋 Using passed activity:", passedActivity);
          console.log("Available keys:", Object.keys(passedActivity));
          activity = passedActivity;
        } else if (id) {
          console.log("🔄 Fetching activity by ID:", id);
          const response = await fetchActivityById(id);
          activity = response.data;
          console.log("📋 Fetched activity from API:", activity);
          console.log("Available keys:", Object.keys(activity));
        } else {
          setError("Activity ID is missing! Cannot edit.");
          setLoading(false);
          return;
        }

        // Try to find AccountID
        let accountID = activity.AccountID || 
                       activity.accountID || 
                       activity.accountId || 
                       "";

        console.log("🔍 Initial AccountID search:", accountID);
        console.log("🔍 AccountName to search:", activity.AccountName);

        // If no AccountID but we have AccountName, look it up
        if (!accountID && activity.AccountName && accountsData && accountsData.length > 0) {
          console.log("🔍 Searching for account with name:", activity.AccountName);
          const matchedAccount = accountsData.find(acc => {
            const accName = acc.AccountName || acc.Name || acc.name;
            console.log("  Checking account:", accName, "vs", activity.AccountName);
            return accName === activity.AccountName;
          });
          
          if (matchedAccount) {
            accountID = matchedAccount.AccountID || matchedAccount.accountID || matchedAccount.id;
            console.log("✅ Found AccountID from AccountName:", accountID);
            console.log("✅ Matched account:", matchedAccount);
          } else {
            console.error("❌ No matching account found for:", activity.AccountName);
            console.log("Available account names:", accountsData.map(a => a.AccountName || a.Name || a.name));
          }
        }

        console.log("📌 Final AccountID:", accountID);

        if (!accountID) {
          console.error("⚠️ AccountID not found after all attempts!");
          setError("Activity is missing AccountID! Cannot edit. Please ensure the account exists.");
          setLoading(false);
          return;
        }

        // Look up the activity type ID if we only have the name
        let typeID = activity.TypeID || activity.typeID || activity.ActivityTypeID || "";
        
        console.log("🔍 Initial TypeID:", typeID);
        console.log("🔍 ActivityType name:", activity.ActivityType);
        
        if (!typeID && activity.ActivityType) {
          try {
            console.log("🔄 Loading activity types...");
            const types = await activityTypeService.getAll();
            console.log("📦 Activity types loaded:", types?.length || 0, "types");
            if (types && types.length > 0) {
              console.log("First type sample:", types[0]);
            }
            
            const matchedType = types.find(t => {
              const typeName = t.TypeName || t.typeName || t.name;
              console.log("  Checking type:", typeName, "vs", activity.ActivityType);
              return typeName === activity.ActivityType;
            });
            
            if (matchedType) {
              typeID = matchedType.TypeID || matchedType.typeID || matchedType.id;
              console.log("✅ Found TypeID from ActivityType:", typeID);
            } else {
              console.warn("⚠️ No matching type found for:", activity.ActivityType);
              console.log("Available types:", types.map(t => t.TypeName || t.typeName || t.name));
            }
          } catch (err) {
            console.error("Error loading activity types:", err);
          }
        }

        console.log("📌 Final TypeID:", typeID);

        const newFormData = {
          AccountID: accountID,
          AccountName: activity.AccountName || "",
          TypeID: typeID || "",
          PriorityLevelID: activity.PriorityLevelID || 
                          activity.priorityLevelID || 
                          activity.PriorityID || 
                          "",
          DueToStart: formatDateTimeLocal(
            activity.DueToStart || 
            activity.dueToStart
          ),
          DueToEnd: formatDateTimeLocal(
            activity.DueToEnd || 
            activity.dueToEnd
          ),
          Completed: !!activity.Completed,
        };

        console.log("✅ Setting FormData:", newFormData);
        setFormData(newFormData);

      } catch (err) {
        console.error("❌ Error loading activity:", err);
        console.error("Error details:", err.message, err.stack);
        setError(`Failed to load activity data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, [id, passedActivity]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name} = ${value}`);
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      console.log("Updated formData:", updated);
      return updated;
    });
    if (error) setError(null);
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("=== FORM SUBMISSION DEBUG ===");
    console.log("Full formData:", formData);
    console.log("AccountID:", formData.AccountID);
    console.log("AccountID type:", typeof formData.AccountID);
    console.log("============================");

    if (!formData.AccountID || formData.AccountID === '') {
      console.error("❌ AccountID is missing or empty!");
      setError("Cannot update activity without AccountID!");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        AccountID: Number(formData.AccountID),
        TypeID: formData.TypeID ? Number(formData.TypeID) : null,
        PriorityLevelID: formData.PriorityLevelID ? Number(formData.PriorityLevelID) : null,
        DueToStart: formData.DueToStart || null,
        DueToEnd: formData.DueToEnd || null,
        Completed: formData.Completed
      };

      console.log("📤 Payload to send:", payload);

      await updateActivity(id, payload);

      setSuccessMessage("Activity updated successfully!");
      setTimeout(() => navigate("/activities"), 1500);
    } catch (err) {
      console.error("Error updating activity:", err);
      setError(`Failed to update activity: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" sx={{ backgroundColor: theme.palette.background.default }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', p: 3, backgroundColor: theme.palette.background.default }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>Edit Activity</Typography>
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
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Account: {formData.AccountName || formData.AccountID || "N/A"}
              </Typography>

              <SmartDropdown
                label="Activity Type"
                name="TypeID"
                value={formData.TypeID}
                onChange={handleInputChange}
                service={{
                  getAll: async () => {
                    const types = await activityTypeService.getAll();
                    console.log("🔍 Activity Types loaded for dropdown:", types);
                    return types.map(t => ({ 
                      TypeID: Number(t.TypeID || t.typeID || t.id), 
                      TypeName: t.TypeName || t.typeName || t.name 
                    }));
                  }
                }}
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
  );
};

export default EditActivityPage;