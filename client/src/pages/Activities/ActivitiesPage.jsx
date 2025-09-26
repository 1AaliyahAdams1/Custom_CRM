import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Toolbar,
  Tabs,
  Tab,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { Add, Info } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import { formatters } from '../../utils/formatters';
import TableView from '../../components/tableFormat/TableView';
import ActivityTypePage from './ActivityTypePage'; 
import ActivitiesBulkActionsToolbar from './ActivitiesBulkActionsToolbar';
import theme from "../../components/Theme";
import BulkDueDatesDialog from '../../components/BulkDueDatesDialog';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`activities-tabpanel-${index}`}
      aria-labelledby={`activities-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

// Status configuration for the new status options
const statusConfig = {
  incomplete: { label: "Incomplete", color: "#f44336" },
  complete: { label: "Complete", color: "#4caf50" },
  "in-progress": { label: "In Progress", color: "#ff9800" },
  pending: { label: "Pending", color: "#2196f3" }
};

// Custom formatter for the new status field
const statusFormatter = (value) => {
  const config = statusConfig[value] || { label: value || "Unknown", color: "#9e9e9e" };
  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        backgroundColor: config.color,
        color: "#fff",
        fontWeight: 500,
      }}
    />
  );
};

const ActivitiesPage = ({
  // Activities props
  activities = [],
  loading = false,
  error,
  successMessage,
  setSuccessMessage,
  selected = [],
  onSelectClick,
  onSelectAllClick,
  onClearSelection,
  onDeactivate,
  onEdit,
  onView,
  onCreate,
  onAddNote,
  onAddAttachment,
  onFilterChange,
  totalCount,
  currentFilter = 'all',
  userRole = [],
  
  // Add this new prop for viewing accounts
  onViewAccount,
  
  // Bulk action handlers
  onBulkMarkComplete,
  onBulkMarkIncomplete,
  onBulkUpdateDueDates,
  // Removed duplicate dueDatesDialogOpen prop
  onCloseDueDatesDialog,
  onConfirmDueDatesUpdate,
  // Activity Types props (pass through to ActivityTypePage)
  activityTypesProps = {},
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  

  // Local state for filter
  const [activityFilter, setActivityFilter] = useState(currentFilter);

  // Local state for bulk due dates dialog
  const [dueDatesDialogOpen, setDueDatesDialogOpen] = useState(false);

  // Table configuration for activities with clickable AccountName
  const activitiesTableConfig = {
    idField: "ActivityID",
    columns: [
      { field: "ActivityType", headerName: "Activity Type", type: "tooltip" },
      { 
        field: "AccountName", 
        headerName: "Account Name", 
        type: "clickable",
        onClick: (row) => {
          // Call the account view handler with the account information
          if (onViewAccount) {
            // Pass the AccountID - adjust field name based on your data structure
            onViewAccount(row.AccountID || row.Account_ID);
          }
        }
      },
      { 
        field: "Description", 
        headerName: "Description", 
        type: "truncated",
        maxWidth: 300 // Limit width for better table layout
      },
      { field: "DueToStart", headerName: "Due To Start", type: "date" },
      { field: "DueToEnd", headerName: "Due To End", type: "date" },
      {
        field: "Completed",
        headerName: "Completed",
        type: "boolean",
      },
    ],
  };

  const handleConfirmDueDatesUpdate = async (newDates) => {
    if (onConfirmDueDatesUpdate && typeof onConfirmDueDatesUpdate === 'function') {
      await onConfirmDueDatesUpdate(newDates);
    } else {
      console.error('onConfirmDueDatesUpdate is not provided or is not a function');
    }
    setDueDatesDialogOpen(false);
  };

  // Define available tabs
  const availableTabs = [
    {
      id: 'activities',
      label: 'Activities',
      component: 'activities'
    },
    // {
    //   id: 'activity-types',
    //   label: 'Activity Types', 
    //   component: 'activityTypes'
    // },
  ];

  // Use all available tabs
  const userTabs = availableTabs;

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    const newFilter = event.target.value;
    setActivityFilter(newFilter);
    
    // Call the parent component's filter handler if provided
    if (onFilterChange) {
      onFilterChange(newFilter);
    }
  };

  // Update local filter when prop changes
  useEffect(() => {
    setActivityFilter(currentFilter);
  }, [currentFilter]);

  const filterOptions = [
    { value: 'all', label: 'All Activities' },
    { value: 'my', label: 'My Account Activities' },
    { value: 'team', label: 'My Team\'s Account Activities' },
    { value: 'unassigned', label: 'Unassigned Account Activities' },
  ];

  // Get selected activities data for bulk actions
  const selectedActivities = activities.filter(activity => 
    selected.includes(activity.ActivityID)
  );

  // Combine imported formatters with custom formatters
  const enhancedFormatters = {
    ...formatters,
    Status: statusFormatter,
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: "100%",
          backgroundColor: "#fafafa",
          minHeight: "100vh",
          p: 3,
        }}
      >
        <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
          {/* Error and Success Messages */}
          {error && (
            <Alert severity="error" sx={{ m: 2 }}>
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert
              severity="success"
              sx={{ m: 2 }}
              onClose={() => setSuccessMessage("")}
            >
              {successMessage}
            </Alert>
          )}

          {/* Bulk Actions Toolbar - Shows when items are selected */}
          <ActivitiesBulkActionsToolbar
            selectedCount={selected.length}
            selectedItems={selectedActivities}
            onBulkMarkComplete={onBulkMarkComplete}
            onBulkMarkIncomplete={onBulkMarkIncomplete}
            onBulkUpdateDueDates={() => setDueDatesDialogOpen(true)}
            onClearSelection={onClearSelection}
            userRole={userRole}
            loading={loading}
          />

          {/* Activities Toolbar */}
          <Toolbar
            sx={{
              backgroundColor: "#ffffff",
              borderBottom: "1px solid #e5e5e5",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
              py: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flex: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ color: "#050505", fontWeight: 600 }}
                >
                  Activities
                </Typography>
                <Tooltip title="Manage and view all activities linked to customer accounts" arrow>
                  <Info sx={{ fontSize: 18, color: '#666666', cursor: 'help' }} />
                </Tooltip>
              </Box>

              {/* Activity Filter Dropdown */}
              <FormControl size="small" sx={{ minWidth: 240 }}>
                <Select
                  value={activityFilter}
                  onChange={handleFilterChange}
                  displayEmpty
                  sx={{ 
                    backgroundColor: '#fff',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#c0c0c0',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  {filterOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selected.length > 0 && (
                <Tooltip title={`${selected.length} activit${selected.length === 1 ? 'y' : 'ies'} selected for operations`} arrow>
                  <Chip
                    label={`${selected.length} selected`}
                    size="small"
                    sx={{ backgroundColor: "#e0e0e0", color: "#050505" }}
                  />
                </Tooltip>
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Tooltip title="Create a new activity in the system" arrow>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={onCreate}
                  disabled={loading}
                  sx={{
                    backgroundColor: "#050505",
                    color: "#ffffff",
                    "&:hover": { backgroundColor: "#333333" },
                    "&:disabled": {
                      backgroundColor: "#cccccc",
                      color: "#666666",
                    },
                  }}
                >
                  Add Activity
                </Button>
              </Tooltip>
            </Box>
          </Toolbar>

          {/* Activities Table */}
          {loading ? (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={8}>
              <CircularProgress />
              <Tooltip title="Loading activity data from the database" arrow>
                <Typography variant="body2" sx={{ mt: 2, color: '#666666' }}>
                  Loading activities...
                </Typography>
              </Tooltip>
            </Box>
          ) : (
            <TableView
              data={activities}
              columns={activitiesTableConfig.columns}
              idField={activitiesTableConfig.idField}
              selected={selected}
              onSelectClick={onSelectClick}
              onSelectAllClick={onSelectAllClick}
              showSelection={true}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDeactivate}
              onAddNote={onAddNote}
              onAddAttachment={onAddAttachment}
              formatters={enhancedFormatters}
              entityType="activity"
              tooltips={{
                search: "Search activities by type, account, or description",
                filter: "Show/hide advanced filtering options",
                columns: "Customize which columns are visible in the table",
                actionMenu: {
                  view: "View detailed information for this activity",
                  edit: "Edit this activity's information",
                  delete: "Delete or deactivate this activity",
                  addNote: "Add internal notes or comments",
                  addAttachment: "Attach files or documents"
                }
              }}
            />
          )}

          {/* Activities Results Footer */}
          <Box
            sx={{
              p: 2,
              borderTop: "1px solid #e5e5e5",
              backgroundColor: "#fafafa",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Tooltip title="Total number of activities currently displayed in the table" arrow>
              <Typography variant="body2" sx={{ color: "#666666", cursor: 'help' }}>
                Showing {activities.length} of {totalCount || activities.length} activities
              </Typography>
            </Tooltip>
            {selected.length > 0 && (
              <Tooltip title="Number of activities currently selected for operations" arrow>
                <Typography
                  variant="body2"
                  sx={{ color: "#050505", fontWeight: 500, cursor: 'help' }}
                >
                  {selected.length} selected
                </Typography>
              </Tooltip>
            )}
          </Box>
        </Paper>

        {/* Bulk Due Dates Dialog */}
        <BulkDueDatesDialog
          open={dueDatesDialogOpen}
          onClose={() => setDueDatesDialogOpen(false)}
          onConfirm={handleConfirmDueDatesUpdate}
          selectedItems={selectedActivities}
          loading={loading}
        />
      </Box>
    </ThemeProvider>
  );
};

export default ActivitiesPage;