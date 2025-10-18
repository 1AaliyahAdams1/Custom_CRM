import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { useTheme } from "@mui/material/styles";
import { formatters } from '../../utils/formatters';
import TableView from '../../components/tableFormat/TableView';
import ActivitiesBulkActionsToolbar from './ActivitiesBulkActionsToolbar';
import BulkDueDatesDialog from '../../components/dialogs/BulkDueDatesDialog';

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
  activities = [],
  loading = false,
  error,
  setError,
  successMessage,
  setSuccessMessage,
  selected = [],
  onSelectClick,
  onSelectAllClick,
  onClearSelection,
  onDeactivate,
  onView,
  onCreate,
  onAddNote,
  onAddAttachment,
  onFilterChange,
  totalCount,
  currentFilter = 'all',
  userRole = [],
  
  onBulkMarkComplete,
  onBulkMarkIncomplete,
  onBulkUpdateDueDates,
  onCloseDueDatesDialog,
  onConfirmDueDatesUpdate,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [activityFilter, setActivityFilter] = useState(currentFilter);
  const [dueDatesDialogOpen, setDueDatesDialogOpen] = useState(false);

  // Navigate to account detail
  const handleViewAccount = (activity) => {
    if (!activity?.AccountID) {
      if (setError) setError("Cannot view account - missing ID");
      return;
    }
    navigate(`/accounts/${activity.AccountID}`);
  };

  // Navigate to edit activity with full state
  const handleEditActivity = (activity) => {
    if (!activity?.ActivityID) return;
    navigate(`/activities/edit/${activity.ActivityID}`, { state: { activity } });
  };

  const handleConfirmDueDatesUpdate = async (newDates) => {
    if (onConfirmDueDatesUpdate) await onConfirmDueDatesUpdate(newDates);
    setDueDatesDialogOpen(false);
  };

  const handleFilterChange = (event) => {
    const newFilter = event.target.value;
    setActivityFilter(newFilter);
    if (onFilterChange) onFilterChange(newFilter);
  };

  useEffect(() => {
    setActivityFilter(currentFilter);
  }, [currentFilter]);

  const filterOptions = [
    { value: 'all', label: 'All Activities' },
    { value: 'my', label: 'My Account Activities' },
    { value: 'team', label: "My Team's Account Activities" },
    { value: 'unassigned', label: 'Unassigned Account Activities' },
  ];

  const selectedActivities = activities.filter(activity => selected.includes(activity.ActivityID));

  const enhancedFormatters = {
    ...formatters,
    Status: statusFormatter,
  };

  const activitiesTableConfig = {
    idField: "ActivityID",
    columns: [
      { field: "ActivityType", headerName: "Activity Type", type: "tooltip", defaultVisible: true },
      { 
        field: "AccountName", 
        headerName: "Account Name", 
        type: "clickable",
        defaultVisible: true,
        onClick: handleViewAccount
      },
      { 
        field: "Description", 
        headerName: "Description", 
        type: "truncated",
        maxWidth: 300
      },
      { field: "DueToStart", headerName: "Due To Start", type: "date" },
      { field: "DueToEnd", headerName: "Due To End", type: "date" },
      { field: "Completed", headerName: "Completed", type: "boolean" },
    ],
  };

  return (
    <Box sx={{ width: "100%", backgroundColor: theme.palette.background.default, minHeight: "100vh", p: 3 }}>
      <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
        {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
        {successMessage && (
          <Alert severity="success" sx={{ m: 2 }} onClose={() => setSuccessMessage("")}>{successMessage}</Alert>
        )}

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

        <Toolbar sx={{
          backgroundColor: theme.palette.background.paper,
          borderBottom: selected.length > 0 ? "none" : `1px solid ${theme.palette.divider}`,
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          py: 2,
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" component="div" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                Activities
              </Typography>
              <Tooltip title="Manage and view all activities linked to customer accounts" arrow>
                <Info sx={{ fontSize: 18, color: theme.palette.text.secondary, cursor: 'help' }} />
              </Tooltip>
            </Box>

            <FormControl size="small" sx={{ minWidth: 240 }}>
              <Select value={activityFilter} onChange={handleFilterChange} displayEmpty
                sx={{ 
                  backgroundColor: theme.palette.background.paper,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.text.secondary },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                }}>
                {filterOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {selected.length > 0 && (
              <Tooltip title={`${selected.length} activit${selected.length === 1 ? 'y' : 'ies'} selected`} arrow>
                <Chip label={`${selected.length} selected`} size="small"
                  sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#333' : "#e0e0e0", color: theme.palette.text.primary }} />
              </Tooltip>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <Tooltip title="Create a new activity in the system" arrow>
              <Button variant="contained" startIcon={<Add />} onClick={onCreate} disabled={loading}>
                Add Activity
              </Button>
            </Tooltip>
          </Box>
        </Toolbar>

        {loading ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={8}>
            <CircularProgress />
            <Tooltip title="Loading activity data from the database" arrow>
              <Typography variant="body2" sx={{ mt: 2, color: theme.palette.text.secondary }}>
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
            onViewAccount={handleViewAccount}
            showSelection={true}
            onView={onView}
            onEdit={handleEditActivity} // <--- use the updated handler
            onDelete={onDeactivate}
            onAddNote={onAddNote}
            onAddAttachment={onAddAttachment}
            formatters={enhancedFormatters}
            entityType="activity"
          />
        )}

        <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.default, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Tooltip title="Total number of activities currently displayed in the table" arrow>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, cursor: 'help' }}>
              Showing {activities.length} of {totalCount || activities.length} activities
            </Typography>
          </Tooltip>
          {selected.length > 0 && (
            <Tooltip title="Number of activities currently selected for operations" arrow>
              <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 500, cursor: 'help' }}>
                {selected.length} selected
              </Typography>
            </Tooltip>
          )}
        </Box>
      </Paper>

      <BulkDueDatesDialog
        open={dueDatesDialogOpen}
        onClose={() => setDueDatesDialogOpen(false)}
        onConfirm={handleConfirmDueDatesUpdate}
        selectedItems={selectedActivities}
        loading={loading}
      />
    </Box>
  );
};

export default ActivitiesPage;
