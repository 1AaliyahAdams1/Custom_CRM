//PAGE : Main Activities Page
//Combines the UI components onto one page using UniversalTable

//IMPORTS
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
    { field: 'ActivityType', headerName: 'Activity Type', type: 'tooltip' },
    { field: 'AccountName', headerName: 'Account Name', type: 'tooltip' },
    { field: 'PriorityLevelID', headerName: 'Priority' }, //change to name
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
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Function to fetch activities data from backend API
  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllActivities(true);
      console.log("Fetched activities:", data);
      setActivities(data);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      setError("Failed to load activities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch activities once when component mounts
  useEffect(() => {
    fetchActivities();
  }, []);

  // Automatically clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      // Cleanup timer if component unmounts or successMessage changes
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Filter and search logic
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesSearch =
        (activity.ActivityType && activity.ActivityType.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (activity.AccountName && activity.AccountName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (activity.note && activity.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (activity.attachment && activity.attachment.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = !statusFilter ||
        (statusFilter === 'completed' && activity.Completed) ||
        (statusFilter === 'pending' && !activity.Completed);

      const matchesPriority = !priorityFilter ||
        (activity.PriorityLevelID && activity.PriorityLevelID.toString() === priorityFilter);

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [activities, searchTerm, statusFilter, priorityFilter]);

  // Selection handlers
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(filteredActivities.map(activity => activity.ActivityID));
    } else {
      setSelected([]);
    }
  };

  const handleSelectClick = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  // Navigate to create activity page
  const handleOpenCreate = () => {
    navigate("/activities/create");
  };

  // Deactivates an activity 
  const handleDeactivate = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this activity? This will deactivate it.");
    if (!confirm) return;

    setError(null);
    try {
      console.log("Deactivating (soft deleting) activity with ID:", id);
      await deactivateActivity(id);
      setSuccessMessage("Activity deleted successfully.");
      await fetchActivities();
    } catch (error) {
      console.log("Deactivating (soft deleting) activity with ID:", id);
      console.error("Delete failed:", error);
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
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
        {/* Display error alert if any error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Display success alert on successful operation */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
            {successMessage}
          </Alert>
        )}

        <Paper
          elevation={0}
          sx={{
            width: '100%',
            mb: 2,
            border: '0px solid #e5e5e5',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        >
          {/* Toolbar with search and filters */}
          <Toolbar
            sx={{
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #e5e5e5',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
              py: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <Typography variant="h6" component="div" sx={{ color: '#050505', fontWeight: 600 }}>
                Activities
              </Typography>
              {selected.length > 0 && (
                <Chip
                  label={`${selected.length} selected`}
                  size="small"
                  sx={{ backgroundColor: '#e0e0e0', color: '#050505' }}
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {/* Add Activity Button */}
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenCreate}
                sx={{
                  backgroundColor: '#050505',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#333333',
                  },
                }}
              >
                Add Activity
              </Button>

              {/* Search */}
              <TextField
                size="small"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#666666' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  minWidth: 250,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#ffffff',
                    '& fieldset': { borderColor: '#e5e5e5' },
                    '&:hover fieldset': { borderColor: '#cccccc' },
                    '&.Mui-focused fieldset': { borderColor: '#050505' },
                  }
                }}
              />

              {/* Status Filter */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{
                    backgroundColor: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e5e5' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cccccc' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#050505' },
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>

              {/* Priority Filter */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priorityFilter}
                  label="Priority"
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  sx={{
                    backgroundColor: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e5e5' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cccccc' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#050505' },
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="1">Low</MenuItem>
                  <MenuItem value="2">Medium</MenuItem>
                  <MenuItem value="3">High</MenuItem>
                  <MenuItem value="4">Critical</MenuItem>
                </Select>
              </FormControl>

              {/* Clear Filters */}
              {(searchTerm || statusFilter || priorityFilter) && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={clearFilters}
                  startIcon={<Clear />}
                  sx={{
                    borderColor: '#e5e5e5',
                    color: '#666666',
                    '&:hover': {
                      borderColor: '#cccccc',
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                >
                  Clear
                </Button>
              )}
            </Box>
          </Toolbar>

          {/* Universal Table */}
          <UniversalTable
            data={filteredActivities}
            columns={activitiesTableConfig.columns}
            idField={activitiesTableConfig.idField}
            selected={selected}
            onSelectClick={handleSelectClick}
            onSelectAllClick={handleSelectAllClick}
            showSelection={true}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeactivate}
            onAddNote={handleAddNote}
            onAddAttachment={handleAddAttachment}
            formatters={formatters}
          />

          {/* Results footer */}
          <Box sx={{
            p: 2,
            borderTop: '1px solid #e5e5e5',
            backgroundColor: '#fafafa',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="body2" sx={{ color: '#666666' }}>
              Showing {filteredActivities.length} of {activities.length} activities
            </Typography>
            {selected.length > 0 && (
              <Typography variant="body2" sx={{ color: '#050505', fontWeight: 500 }}>
                {selected.length} selected
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default ActivitiesPage;