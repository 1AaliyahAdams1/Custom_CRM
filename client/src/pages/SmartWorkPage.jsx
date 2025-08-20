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
  ListItemText,
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
  Divider,
  Switch,
  FormControlLabel,
  Badge
} from "@mui/material";
import {
  Settings,
  PlayArrow,
  Pause,
  Refresh,
  Psychology,
  Close,
  Add,
  CheckCircle,
  Schedule,
  Assignment,
  Email,
  Phone,
  Event
} from "@mui/icons-material";

// Mock data
const mockActivities = [
  {
    id: "1",
    title: "Review quarterly reports",
    description: "Analyze Q3 performance metrics and prepare summary",
    type: "task",
    priority: "high",
    status: "pending",
    dueDate: new Date(Date.now() + 86400000), // Tomorrow
    estimatedDuration: 60,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2",
    title: "Team standup meeting",
    description: "Daily sync with development team",
    type: "meeting",
    priority: "medium",
    status: "pending",
    dueDate: new Date(Date.now() + 3600000), // 1 hour from now
    estimatedDuration: 30,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "3",
    title: "Client follow-up call",
    description: "Follow up on project proposal with ABC Corp",
    type: "call",
    priority: "high",
    status: "overdue",
    dueDate: new Date(Date.now() - 86400000), // Yesterday
    estimatedDuration: 45,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "4",
    title: "Update project documentation",
    description: "Review and update API documentation",
    type: "task",
    priority: "low",
    status: "completed",
    dueDate: new Date(),
    estimatedDuration: 90,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Activity icon mapping
const getActivityIcon = (type) => {
  switch (type) {
    case 'meeting': return <Event />;
    case 'call': return <Phone />;
    case 'email': return <Email />;
    default: return <Assignment />;
  }
};

// Priority color mapping
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'info';
    default: return 'default';
  }
};

// Status color mapping
const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'success';
    case 'in_progress': return 'black';
    case 'overdue': return 'error';
    default: return 'default';
  }
};

function SmartWork() {
  const [activities, setActivities] = useState(mockActivities);
  const [workTabs, setWorkTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(0);
  const [dropzonePosition, setDropzonePosition] = useState('left');
  const [isAutoAdvance, setIsAutoAdvance] = useState(true);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const showToast = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Auto-open next activity when tabs are empty and auto-advance is enabled
  useEffect(() => {
    if (workTabs.length === 0 && isAutoAdvance && activities.length > 0) {
      const nextActivity = activities.find(a => a.status === 'pending' || a.status === 'overdue');
      if (nextActivity) {
        handleActivityClick(nextActivity);
      }
    }
  }, [workTabs, isAutoAdvance, activities]);

  const handleActivityClick = (activity) => {
    // Check if tab already exists
    const existingTab = workTabs.find(tab => tab.activityId === activity.id);
    if (existingTab) {
      const tabIndex = workTabs.findIndex(tab => tab.id === existingTab.id);
      setActiveTabId(tabIndex);
      return;
    }

    // Create new tab
    const newTab = {
      id: `tab-${Date.now()}`,
      activityId: activity.id,
      title: activity.title,
      type: activity.type,
      color: 'black',
      isActive: true
    };

    setWorkTabs(prev => {
      const newTabs = [...prev, newTab];
      setActiveTabId(newTabs.length - 1);
      return newTabs;
      
    });

    // Update activity status to in_progress
    setActivities(prev => prev.map(a => 
      a.id === activity.id 
        ? { ...a, status: 'in_progress' }
        : a
    ));

    showToast(`${activity.title} is now open in a new tab`, 'success');
  };

  const handleCloseTab = (tabIndex) => {
    const tab = workTabs[tabIndex];
    if (tab) {
      // Reset activity status if not completed
      const activity = activities.find(a => a.id === tab.activityId);
      if (activity && activity.status === 'in_progress') {
        setActivities(prev => prev.map(a => 
          a.id === activity.id 
            ? { ...a, status: 'pending' }
            : a
        ));
      }
    }

    setWorkTabs(prev => prev.filter((_, index) => index !== tabIndex));
    
    // Adjust active tab
    if (activeTabId === tabIndex && workTabs.length > 1) {
      setActiveTabId(tabIndex > 0 ? tabIndex - 1 : 0);
    } else if (activeTabId > tabIndex) {
      setActiveTabId(activeTabId - 1);
    }
  };

  const handleCompleteActivity = () => {
    if (!selectedActivityId) return;

    // Update activity status and notes
    setActivities(prev => prev.map(a => 
      a.id === selectedActivityId 
        ? { 
            ...a, 
            status: 'completed',
            notes: completionNotes,
            updatedAt: new Date()
          }
        : a
    ));

    // Close the tab
    const tabIndex = workTabs.findIndex(t => t.activityId === selectedActivityId);
    if (tabIndex !== -1) {
      handleCloseTab(tabIndex);
    }

    setCompleteDialogOpen(false);
    setCompletionNotes('');
    setSelectedActivityId(null);

    showToast("Activity completed successfully!", 'success');

    // Auto-advance to next activity if enabled
    if (isAutoAdvance) {
      setTimeout(() => {
        const nextActivity = activities.find(a => 
          a.status === 'pending' || a.status === 'overdue'
        );
        if (nextActivity && nextActivity.id !== selectedActivityId) {
          handleActivityClick(nextActivity);
        }
      }, 500);
    }
  };

  const handleAddTab = () => {
    const availableActivity = activities.find(a => 
      (a.status === 'pending' || a.status === 'overdue') &&
      !workTabs.some(tab => tab.activityId === a.id)
    );

    if (availableActivity) {
      handleActivityClick(availableActivity);
    } else {
      showToast("All activities are either completed or already open", 'warning');
    }
  };

  const pendingActivities = activities.filter(a => 
    a.status === 'pending' || a.status === 'overdue'
  );

  const completedToday = activities.filter(a => {
    const today = new Date();
    const completedDate = new Date(a.updatedAt);
    return a.status === 'completed' && 
           completedDate.toDateString() === today.toDateString();
  }).length;

  const currentActivity = workTabs.length > 0 && workTabs[activeTabId] 
    ? activities.find(a => a.id === workTabs[activeTabId].activityId)
    : null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" color="light grey" elevation={1}>
        <Toolbar sx={{ px: 3, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Paper
                // sx={{
                //   p: 1,
                //   background: 'black',
                //   display: 'flex',
                //   alignItems: 'center',
                //   justifyContent: 'center'
                // }}
              >
                {/* <Psychology sx={{ color: 'white', fontSize: 24 }} /> */}
              </Paper>
              <Box>
                <Typography variant="h3" component="h1" fontWeight="bold">
                  Smart Work
                </Typography>
                
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
              <Chip
                label={`${pendingActivities.length} pending`}
                color="default"
                size="small"
              />
              <Chip
                label={`${completedToday} completed today`}
                color="success"
                variant="outlined"
                size="small"
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isAutoAdvance}
                  onChange={(e) => setIsAutoAdvance(e.target.checked)}
                  size="small"
                    color="black"
                />
              }
              label="Auto-advance"
            />
            
            <Button 
              variant="outlined" 
              size="small"
              startIcon={<Refresh />}
              color="black"
              onClick={() => {
                setWorkTabs([]);
                setActivities(mockActivities);
                showToast("Workspace reset", 'info');
              }}
            >
              Reset
            </Button>
            
            {/* <IconButton size="small">
              <Settings />
            </IconButton> */}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Workspace */}
      <Box sx={{ display: 'flex', height: 'calc(100vh - 88px)' }}>
        {/* Activity Sidebar */}
        {dropzonePosition === 'left' && (
          <Paper sx={{ width: 320, flexShrink: 0, overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: 'black', color: 'white' }}>
              <Typography variant="h6" component="h2">
                Activities
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Click to open in workspace
              </Typography>
            </Box>
            <List sx={{ p: 0, height: 'calc(100% - 80px)', overflow: 'auto' }}>
              {pendingActivities.map((activity) => (
                <ListItem key={activity.id} disablePadding>
                  <ListItemButton 
                    onClick={() => handleActivityClick(activity)}
                    sx={{ p: 2 }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {getActivityIcon(activity.type)}
                        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                          {activity.title}
                        </Typography>
                        <Chip 
                          label={activity.priority}
                          color={getPriorityColor(activity.priority)}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {activity.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip 
                          label={activity.status}
                          color={getStatusColor(activity.status)}
                          variant="outlined"
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {activity.estimatedDuration}min
                        </Typography>
                      </Box>
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {/* Work Area */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {workTabs.length > 0 ? (
            <>
              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider'}}>
                <Tabs
                  value={activeTabId}
                  onChange={(event, newValue) => setActiveTabId(newValue)}
                  variant="scrollable"
                    scrollButtons="auto"
                sx={{
                      '& .MuiTabs-indicator': {
                        height: 3,
                        backgroundColor: '#000',
                      },
                      '& .MuiTab-root': {
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        minHeight: 56,
                        px: 3,
                        color: '#666',
                        '&.Mui-selected': {
                          color: '#000',
                        }
                      }
                    }} 
                >
                  {workTabs.map((tab, index) => (
                    <Tab 
                        
                      key={tab.id}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                  <Tab
                    icon={<Add />}
                    onClick={handleAddTab}
                    sx={{ minWidth: 48 }}
                  />
                </Tabs>
              </Box>

              {/* Tab Content */}
              <Box sx={{ flexGrow: 1, p: 3 }}>
                {currentActivity && (
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        {getActivityIcon(currentActivity.type)}
                        <Typography variant="h5" component="h2">
                          {currentActivity.title}
                          
                        </Typography>
                        <Chip 
                          label={currentActivity.priority}
                          color={getPriorityColor(currentActivity.priority)}
                          size="small"
                        />
                        <Chip 
                          label={currentActivity.status}
                          color={getStatusColor(currentActivity.status)}
                          variant="outlined"
                          size="small"
                        />
                      </Box>

                      <Typography variant="body1" sx={{ mb: 3 }}>
                        {currentActivity.description}
                      </Typography>

                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Due Date
                          </Typography>
                          <Typography variant="body1">
                            {currentActivity.dueDate.toLocaleDateString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Estimated Duration
                          </Typography>
                          <Typography variant="body1">
                            {currentActivity.estimatedDuration} minutes
                          </Typography>
                        </Grid>
                      </Grid>

                      {currentActivity.notes && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Notes
                          </Typography>
                          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <Typography variant="body2">
                              {currentActivity.notes}
                            </Typography>
                          </Paper>
                        </Box>
                      )}
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'space-between', px: 3, pb: 3 }}>
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
                        >
                          Complete
                        </Button>
                        <Button
                          variant="outlined"
                          color="black"
                          startIcon={<Schedule />}
                          onClick={() => showToast("Follow-up scheduling feature coming soon!", 'info')}
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
            // Empty state
            <Box sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 2
            }}>
              <Psychology sx={{ fontSize: 64, color: 'text.secondary' }} />
              <Typography variant="h5" color="text.secondary">
                No activities open
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Select an activity from the sidebar to get started
              </Typography>
              <Button
                variant="contained"
                onClick={handleAddTab}
                startIcon={<Add />}
              >
                Open Next Activity
              </Button>
            </Box>
          )}
        </Box>

        {/* Activity Sidebar (Right) */}
        {dropzonePosition === 'right' && (
          <Paper sx={{ width: 320, flexShrink: 0, overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6" component="h2">
                Activities
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Click to open in workspace
              </Typography>
            </Box>
            <List sx={{ p: 0, height: 'calc(100% - 80px)', overflow: 'auto' }}>
              {pendingActivities.map((activity) => (
                <ListItem key={activity.id} disablePadding>
                  <ListItemButton 
                    onClick={() => handleActivityClick(activity)}
                    sx={{ p: 2 }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {getActivityIcon(activity.type)}
                        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                          {activity.title}
                        </Typography>
                        <Chip 
                          label={activity.priority}
                          color={getPriorityColor(activity.priority)}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {activity.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip 
                          label={activity.status}
                          color={getStatusColor(activity.status)}
                          variant="outlined"
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {activity.estimatedDuration}min
                        </Typography>
                      </Box>
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      {/* Complete Activity Dialog */}
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
            placeholder="Add any notes about completing this activity..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCompleteActivity} variant="contained" color="success">
            Mark Complete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default SmartWork;