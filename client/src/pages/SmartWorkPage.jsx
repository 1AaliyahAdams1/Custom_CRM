import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemButton,
  Tab,
  Tabs,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Grid,
  Switch,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import {
  Close,
  Add,
  CheckCircle,
  Schedule,
  Event,
  Phone,
  Email,
  Assignment,
  Psychology,
  Refresh,
} from "@mui/icons-material";
import theme from "../components/Theme";
import WIPBanner from '../components/WIPBanner';
import * as workService from '../services/workService';

// Icons
const getActivityIcon = (type) => {
  switch (type) {
    case "meeting":
      return <Event />;
    case "call":
      return <Phone />;
    case "email":
      return <Email />;
    default:
      return <Assignment />;
  }
};

// Priority colors
const getPriorityColor = (priority) => {
  switch (priority) {
    case "high":
      return "error";
    case "medium":
      return "warning";
    case "low":
      return "success";
    default:
      return "default";
  }
};

// Status colors
const getStatusColor = (status) => {
  switch (status) {
    case "completed":
      return "success";
    case "in_progress":
      return "primary";
    case "overdue":
      return "secondary";
    default:
      return "default";
  }
};

function SmartWork() {
  // State
  const [activities, setActivities] = useState([]);
  const [workPageData, setWorkPageData] = useState(null);
  const [workTabs, setWorkTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(0);
  const [dropzonePosition] = useState("left");
  const [isAutoAdvance, setIsAutoAdvance] = useState(true);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortCriteria, setSortCriteria] = useState('dueDate');
  
  // Replace this with actual user ID from your auth system
  const userId = 1; // You should get this from your auth context/store

  const showToast = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  // Load activities from API
  const loadActivities = async (sort = sortCriteria) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await workService.getWorkPageData(userId, sort);
      const transformedData = workService.transformWorkPageData(data);
      
      setWorkPageData(transformedData);
      setActivities(transformedData.activities || []);
      
      console.log('Loaded activities:', transformedData.activities?.length || 0);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError(err.message);
      showToast(`Error loading activities: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadActivities();
  }, [userId]);

  // Auto-open next activity
  useEffect(() => {
    if (workTabs.length === 0 && isAutoAdvance && activities.length > 0 && !loading) {
      const nextActivity = activities.find(
        (a) => a.status === "pending" || a.status === "overdue"
      );
      if (nextActivity) handleActivityClick(nextActivity);
    }
  }, [workTabs, isAutoAdvance, activities, loading]);

  const handleActivityClick = (activity) => {
    const existingTab = workTabs.find((tab) => tab.activityId === activity.id);
    if (existingTab) {
      setActiveTabId(workTabs.findIndex((tab) => tab.id === existingTab.id));
      return;
    }

    const newTab = {
      id: `tab-${Date.now()}`,
      activityId: activity.id,
      title: activity.title,
      type: activity.type,
      color: "primary",
      isActive: true,
    };

    setWorkTabs((prev) => {
      const newTabs = [...prev, newTab];
      setActiveTabId(newTabs.length - 1);
      return newTabs;
    });

    setActivities((prev) =>
      prev.map((a) =>
        a.id === activity.id ? { ...a, status: "in_progress" } : a
      )
    );

    showToast(`${activity.title} is now open in a new tab`, "success");
  };

  const handleCloseTab = (tabIndex) => {
    const tab = workTabs[tabIndex];
    if (tab) {
      const activity = activities.find((a) => a.id === tab.activityId);
      if (activity && activity.status === "in_progress") {
        setActivities((prev) =>
          prev.map((a) =>
            a.id === activity.id ? { ...a, status: "pending" } : a
          )
        );
      }
    }

    setWorkTabs((prev) => prev.filter((_, index) => index !== tabIndex));
    if (activeTabId === tabIndex && workTabs.length > 1) {
      setActiveTabId(tabIndex > 0 ? tabIndex - 1 : 0);
    } else if (activeTabId > tabIndex) {
      setActiveTabId(activeTabId - 1);
    }
  };

  const handleCompleteActivity = async () => {
    if (!selectedActivityId) return;

    try {
      setLoading(true);
      
      // Call API to complete activity
      const result = await workService.completeActivity(
        parseInt(selectedActivityId), 
        userId, 
        completionNotes
      );

      // Update local state
      setActivities((prev) =>
        prev.map((a) =>
          a.id === selectedActivityId
            ? { ...a, status: "completed", notes: completionNotes, updatedAt: new Date() }
            : a
        )
      );

      const tabIndex = workTabs.findIndex((t) => t.activityId === selectedActivityId);
      if (tabIndex !== -1) handleCloseTab(tabIndex);

      setCompleteDialogOpen(false);
      setCompletionNotes("");
      setSelectedActivityId(null);
      showToast("Activity completed successfully!", "success");

      // Auto-advance to next activity
      if (isAutoAdvance && result.nextActivity) {
        setTimeout(() => {
          // Reload activities to get fresh data
          loadActivities();
        }, 500);
      } else if (isAutoAdvance) {
        setTimeout(() => {
          const nextActivity = activities.find(
            (a) => (a.status === "pending" || a.status === "overdue") && 
            a.id !== selectedActivityId
          );
          if (nextActivity) {
            handleActivityClick(nextActivity);
          }
        }, 500);
      }
    } catch (err) {
      console.error('Error completing activity:', err);
      showToast(`Error completing activity: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTab = () => {
    const availableActivity = activities.find(
      (a) =>
        (a.status === "pending" || a.status === "overdue") &&
        !workTabs.some((tab) => tab.activityId === a.id)
    );
    if (availableActivity) handleActivityClick(availableActivity);
    else showToast("All activities are either completed or already open", "warning");
  };

  const handleRefresh = () => {
    setWorkTabs([]);
    loadActivities();
    showToast("Activities refreshed", "info");
  };

  const handleSortChange = (newSort) => {
    setSortCriteria(newSort);
    loadActivities(newSort);
  };

  // Loading state
  if (loading && activities.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading activities...</Typography>
      </Box>
    );
  }

  // Error state
  if (error && activities.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <Typography color="error" variant="h6">Error loading activities</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>{error}</Typography>
        <Button variant="contained" onClick={() => loadActivities()}>Retry</Button>
      </Box>
    );
  }

  const pendingActivities = activities.filter(
    (a) => a.status === "pending" || a.status === "overdue"
  );
  
  const completedToday = activities.filter((a) => {
    const today = new Date();
    const completedDate = new Date(a.updatedAt);
    return a.status === "completed" && completedDate.toDateString() === today.toDateString();
  }).length;
  
  const currentActivity =
    workTabs.length > 0 && workTabs[activeTabId]
      ? activities.find((a) => a.id === workTabs[activeTabId].activityId)
      : null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      {/* WIP Banner */}
      <WIPBanner />

      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: "white", color: "primary.main" }} elevation={1}>
        <Toolbar sx={{ px: 3, py: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="h3" fontWeight="bold" color="text.secondary">
                Smart Work
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1, ml: 2 }}>
              <Chip label={`${pendingActivities.length} pending`} color="default" size="small" />
              <Chip label={`${completedToday} completed today`} color="success" variant="outlined" size="small" />
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isAutoAdvance}
                  onChange={(e) => setIsAutoAdvance(e.target.checked)}
                  size="small"
                  color="primary"
                />
              }
              label="Auto-advance"
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
              sx={{ color: theme.palette.primary.main, borderColor: theme.palette.divider }}
              onClick={handleRefresh}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Workspace */}
      <Box sx={{ display: "flex", height: "calc(100vh - 112px)" }}>
        {/* Sidebar */}
        {dropzonePosition === "left" && (
          <Paper sx={{ width: 320, flexShrink: 0, overflow: "hidden" }}>
            <Box sx={{ p: 2, bgcolor: "#f5f5f5", color: "primary.contrastText" }}>
              <Typography variant="h6" color="text.secondary">Activities</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, color: "text.secondary" }}>
                Click to open in workspace
              </Typography>
            </Box>
            <List sx={{ p: 0, height: "calc(100% - 80px)", overflow: "auto" }}>
              {pendingActivities.map((activity) => (
                <ListItem key={activity.id} disablePadding>
                  <ListItemButton onClick={() => handleActivityClick(activity)} sx={{ p: 2 }}>
                    <Box sx={{ width: "100%" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        {getActivityIcon(activity.type)}
                        <Typography variant="subtitle2" sx={{ flexGrow: 1, color: "text.secondary" }}>
                          {activity.title}
                        </Typography>
                        <Chip label={activity.priority} color={getPriorityColor(activity.priority)} size="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {activity.description}
                      </Typography>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Chip label={activity.status} color={getStatusColor(activity.status)} variant="outlined" size="small" />
                        <Typography variant="caption" color="text.secondary">
                          {activity.estimatedDuration}min
                        </Typography>
                      </Box>
                      {activity.accountName && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          Account: {activity.accountName}
                        </Typography>
                      )}
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
              {pendingActivities.length === 0 && !loading && (
                <ListItem>
                  <Typography color="text.secondary" sx={{ textAlign: 'center', width: '100%' }}>
                    No pending activities
                  </Typography>
                </ListItem>
              )}
            </List>
          </Paper>
        )}

        {/* Work Area */}
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          {workTabs.length > 0 ? (
            <>
              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={activeTabId}
                  onChange={(e, newVal) => setActiveTabId(newVal)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    "& .MuiTabs-indicator": { height: 3, bgcolor: theme.palette.primary.main },
                    "& .MuiTab-root": {
                      textTransform: "none",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      minHeight: 56,
                      px: 3,
                      color: theme.palette.text.secondary,
                      "&.Mui-selected": { color: theme.palette.text.primary },
                    },
                  }}
                >
                  {workTabs.map((tab, index) => (
                    <Tab
                      key={tab.id}
                      label={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {getActivityIcon(tab.type)}
                          {tab.title}
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCloseTab(index);
                            }}
                            sx={{ ml: 1, p: 0.25 }}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </Box>
                      }
                    />
                  ))}
                  <Tab icon={<Add />} onClick={handleAddTab} sx={{ minWidth: 48 }} />
                </Tabs>
              </Box>

              {/* Tab Content */}
              <Box sx={{ flexGrow: 1, p: 3 }}>
                {currentActivity && (
                  <Card sx={{ bgcolor: "background.paper" }}>
                    <CardContent>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                        {getActivityIcon(currentActivity.type)}
                        <Typography variant="h5" component="h2">
                          {currentActivity.title}
                        </Typography>
                        <Chip label={currentActivity.priority} color={getPriorityColor(currentActivity.priority)} size="small" />
                        <Chip label={currentActivity.status} color={getStatusColor(currentActivity.status)} variant="outlined" size="small" />
                      </Box>

                      <Typography variant="body1" sx={{ mb: 3 }}>
                        {currentActivity.description}
                      </Typography>

                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Due Date</Typography>
                          <Typography variant="body1">{currentActivity.dueDate.toLocaleDateString()}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Estimated Duration</Typography>
                          <Typography variant="body1">{currentActivity.estimatedDuration} minutes</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Account</Typography>
                          <Typography variant="body1">{currentActivity.accountName || 'N/A'}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Sequence</Typography>
                          <Typography variant="body1">{currentActivity.sequenceName || 'N/A'}</Typography>
                        </Grid>
                      </Grid>

                      {currentActivity.notes && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Notes</Typography>
                          <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                            <Typography variant="body2">{currentActivity.notes}</Typography>
                          </Paper>
                        </Box>
                      )}
                    </CardContent>

                    <CardActions sx={{ justifyContent: "space-between", px: 3, pb: 3 }}>
                      <Box>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => {
                            setSelectedActivityId(currentActivity.id);
                            setCompleteDialogOpen(true);
                          }}
                          sx={{ mr: 2 }}
                          disabled={loading}
                        >
                          Complete
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Schedule />}
                          sx={{ color: theme.palette.text.primary, borderColor: theme.palette.divider }}
                          onClick={() => showToast("Follow-up scheduling feature coming soon!", "info")}
                        >
                          Schedule Follow-up
                        </Button>
                      </Box>
                    </CardActions>
                  </Card>
                )}
              </Box>
            </>
          ) : (
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Psychology sx={{ fontSize: 64, color: "text.secondary" }} />
              <Typography variant="h5" color="text.secondary">
                No activities open
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Select an activity from the sidebar to get started
              </Typography>
              <Button variant="contained" onClick={handleAddTab} startIcon={<Add />} disabled={loading}>
                Open Next Activity
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Complete Dialog */}
      <Dialog
        open={completeDialogOpen}
        onClose={() => setCompleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Complete Activity</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Completion Notes"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            placeholder="Add any notes..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="success" 
            onClick={handleCompleteActivity}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Mark Complete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default SmartWork;