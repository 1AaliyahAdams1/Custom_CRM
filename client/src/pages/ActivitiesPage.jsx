//PAGE : Main Activity Page
//Combines the UI components onto one page

//IMPORTS
import React, { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress, Alert } from "@mui/material";


import { useNavigate } from "react-router-dom";
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Toolbar,
  MenuItem,
} from "@mui/material";
import {
  Search,
  Add,
  Clear,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { formatters} from '../utils/formatters';
import UniversalTable from '../components/TableView';

import {
  getAllActivities,
  deactivateActivity,
} from "../services/activityService";

// Monochrome theme for MUI components
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#050505',
      contrastText: '#fafafa',
    },
    secondary: {
      main: '#666666',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#050505',
      secondary: '#666666',
    },
    divider: '#e5e5e5',
  },
  components: {
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f0f0f0',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
          '&.Mui-selected': {
            backgroundColor: '#e0e0e0',
            '&:hover': {
              backgroundColor: '#d5d5d5',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          fontWeight: 500,
        },
      },
    },
  },
});

// Table configuration for activities
const activitiesTableConfig = {
  idField: 'ActivityID',
  columns: [
    { field: "ActivityType", headerName: "Activity Type", width: 150 },
    { field: "AccountName", headerName: "Account Name", width: 150 },
    { field: "PriorityLevelName", headerName: "Priority", width: 130 },
    { field: 'note', headerName: 'Notes', type: 'truncated', maxWidth: 150 },
    { field: 'attachment', headerName: 'Attachments' },
    { field: 'DueToStart', headerName: 'Due To Start', type: 'date' },
    { field: 'DueToEnd', headerName: 'Due To End', type: 'date' },
    {
      field: 'CreatedAt',
      headerName: 'Created',
      type: 'dateTime',
    },
    {
      field: 'UpdatedAt',
      headerName: 'Updated',
      type: 'date',
    },
    {
      field: 'Completed',
      headerName: 'Status',
      type: 'boolean',
    },
  ]
};

const ActivitiesPage = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch activities from backend API
  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllActivities(true);
      setActivities(data);
    } catch (err) {
      setError("Failed to load activities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load activities once when component mounts
  useEffect(() => {
    fetchActivities();
  }, []);

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Navigate to create acctivity page
  const handleOpenCreate = () => {
    navigate("/activities/create");
  };
  // Handle edit action
  const handleEdit = (activity) => {
  navigate(`/activities/edit/${activity.ActivityID}`);
  };

  // Handle deleting an activity
  const handleDeactivate = async (id) => {
    // Confirm before deleting
    const confirmDelete = window.confirm("Are you sure you want to delete this activity?");
    if (!confirmDelete) return;

    setError(null);
    try {
      await deactivateActivity(id);
      setSuccessMessage("Activity deleted successfully.");
      await fetchActivities(); 
    } catch (err) {
      setError("Failed to delete activity. Please try again.");
    }
  };

  const handleEdit = (activity) => {
    // Pass the full activity object
    navigate(`/activities/edit/${activity.ActivityID}`, { state: { activity } });
  };

  const handleView = (activityId) => {
    navigate(`/activities/${activityId}`);
  };

  //  Handle adding notes
  const handleAddNote = (activity) => {
    console.log("Adding note for activity:", activity);
    // Navigate to notes page or open modal
    navigate(`/activities/${activity.ActivityID}/notes`);
  };

  // Handle adding attachments
  const handleAddAttachment = (activity) => {
    console.log("Adding attachment for activity:", activity);
    // Navigate to attachments page or open file picker
    navigate(`/activities/${activity.ActivityID}/attachments`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
  };


  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <Box p={4}>
      {/* Page Title */}
      <Typography variant="h4" gutterBottom>
        Activities
      </Typography>

      {/* Show error alert if any */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Show success alert if any */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      {/* Button to add a new activity */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenCreate}
        sx={{ mb: 2 }}
        disabled={loading}
      >
        Add Activity
      </Button>

      {/* Show loading spinner or the activities table */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <ActivitiesTable
          activities={activities}
          loading={loading}
          onEdit={handleEdit} 
          onDelete={handleDeactivate}
        />
      )}
    </Box>
  );



};

export default ActivitiesPage;