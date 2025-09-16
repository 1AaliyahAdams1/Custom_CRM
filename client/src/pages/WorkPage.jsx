import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Tab,
  Tabs,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  CardActions,
  Grid,
  Toolbar,
} from "@mui/material";
import {
  Close,
  CheckCircle,
  Edit,
  Delete,
  DragIndicator,
  AccessTime,
  PriorityHigh,
  Business,
  Assignment,
  Today,
  Sort,
  FilterList,
  Info,
} from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import { formatDistanceToNow, format } from "date-fns";
import theme from "../components/Theme";

const WorkPage = ({
  activities = [],
  loading = false,
  error,
  successMessage,
  statusMessage,
  statusSeverity = 'info',
  currentSort = 'dueDate',
  currentFilter = 'all',
  onSortChange = () => {},
  onFilterChange = () => {},
  openTabs = [],
  activeTab = 0,
  currentActivity,
  currentTabLoading = false,
  onTabChange = () => {},
  onTabClose = () => {},
  onActivityClick = () => {},
  onCompleteActivity = async () => {},
  onUpdateActivity = async () => {},
  onDeleteActivity = async () => {},
  onDragStart = () => {},
  onDrop = () => {},
  onDragOver = (e) => e.preventDefault(),
  activityMetadata = { priorityLevels: [], activityTypes: [] },
  onClearMessages = () => {},
  showStatus = () => {},
}) => {
  // Debug: Log all props on each render
  useEffect(() => {
    console.log('=== WORKPAGE DEBUG ===');
    console.log('activities prop:', activities);
    console.log('activities.length:', activities?.length);
    console.log('loading prop:', loading);
    console.log('error prop:', error);
    console.log('currentSort:', currentSort);
    console.log('currentFilter:', currentFilter);
    console.log('=== END DEBUG ===');
  }, [activities, loading, error, currentSort, currentFilter]);

  // Local state for dialogs and forms
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completeNotes, setCompleteNotes] = useState("");
  
  // Edit form state
  const [editFormData, setEditFormData] = useState({
    dueToStart: "",
    dueToEnd: "",
    priorityLevelId: ""
  });

  // Sort and filter options
  const sortOptions = [
    { value: 'dueDate', label: 'Due Date', icon: <Today /> },
    { value: 'priority', label: 'Priority', icon: <PriorityHigh /> },
    { value: 'account', label: 'Account', icon: <Business /> },
    { value: 'type', label: 'Type', icon: <Assignment /> },
    { value: 'sequence', label: 'Sequence', icon: <Sort /> },
    { value: 'status', label: 'Status', icon: <AccessTime /> },
  ];

  const filterOptions = [
    { value: 'all', label: 'All Activities' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high-priority', label: 'High Priority' },
    { value: 'today', label: 'Due Today' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
  ];

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'overdue':
        return '#f44336';
      case 'urgent':
        return '#ff9800';
      case 'completed':
        return '#4caf50';
      default:
        return '#2196f3';
    }
  };

  const getPriorityColor = (priorityValue) => {
    if (priorityValue >= 8) return '#f44336';
    if (priorityValue >= 5) return '#ff9800';
    return '#4caf50';
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return 'No due date';
    const date = new Date(dueDate);
    const now = new Date();
    
    if (isNaN(date.getTime())) return 'Invalid date';
    
    if (date < now) {
      return `${formatDistanceToNow(date)} overdue`;
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const formatTimeUntilDue = (timeUntilDue) => {
    if (!timeUntilDue) return 'No time info';
    return timeUntilDue;
  };

  // Dialog handlers
  const handleEditClick = () => {
    if (currentActivity) {
      setEditFormData({
        dueToStart: currentActivity.DueToStart ? 
          format(new Date(currentActivity.DueToStart), "yyyy-MM-dd'T'HH:mm") : "",
        dueToEnd: currentActivity.DueToEnd ? 
          format(new Date(currentActivity.DueToEnd), "yyyy-MM-dd'T'HH:mm") : "",
        priorityLevelId: currentActivity.PriorityLevelID || ""
      });
      setEditDialogOpen(true);
    }
  };

  const handleEditSubmit = async () => {
    if (!currentActivity) return;
    
    try {
      const updateData = {};
      
      if (editFormData.dueToStart) {
        updateData.dueToStart = new Date(editFormData.dueToStart).toISOString();
      }
      
      if (editFormData.dueToEnd) {
        updateData.dueToEnd = new Date(editFormData.dueToEnd).toISOString();
      }
      
      if (editFormData.priorityLevelId) {
        updateData.priorityLevelId = parseInt(editFormData.priorityLevelId);
      }

      await onUpdateActivity(currentActivity.ActivityID, updateData);
      setEditDialogOpen(false);
    } catch (err) {
      console.error("Edit submission error:", err);
    }
  };

  const handleCompleteClick = () => {
    setCompleteDialogOpen(true);
    setCompleteNotes("");
  };

  const handleCompleteSubmit = async () => {
    if (!currentActivity) return;
    
    try {
      await onCompleteActivity(currentActivity.ActivityID, completeNotes);
      setCompleteDialogOpen(false);
      setCompleteNotes("");
    } catch (err) {
      console.error("Complete submission error:", err);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentActivity) return;
    
    try {
      await onDeleteActivity(currentActivity.ActivityID);
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const CustomTabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`activity-tabpanel-${index}`}
      aria-labelledby={`activity-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ height: '100%', overflow: 'auto' }}>{children}</Box>}
    </div>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ height: '100vh', display: 'flex', backgroundColor: '#fafafa' }}>
        
        {/* Left Panel - Activities List */}
        <Paper sx={{ 
          width: 400, 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: 0,
          borderRight: '1px solid #e0e0e0'
        }}>
          {/* Activities List Header */}
          <Toolbar sx={{ 
            backgroundColor: '#fff', 
            borderBottom: '1px solid #e0e0e0',
            flexDirection: 'column',
            alignItems: 'stretch',
            py: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#050505', fontWeight: 600, flex: 1 }}>
                My Activities
              </Typography>
              <Tooltip title="Manage your work activities with smart workflow" arrow>
                <Info sx={{ fontSize: 18, color: '#666666', cursor: 'help' }} />
              </Tooltip>
            </Box>
            
            {/* Sort and Filter Controls */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={currentSort}
                  onChange={(e) => onSortChange(e.target.value)}
                  label="Sort by"
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {option.icon}
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
                <InputLabel>Filter</InputLabel>
                <Select
                  value={currentFilter}
                  onChange={(e) => onFilterChange(e.target.value)}
                  label="Filter"
                >
                  {filterOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            {/* DEBUG INFO - Remove this in production */}
            <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, mb: 2 }}>
              <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold' }}>
                DEBUG INFO:
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                Activities Count: {Array.isArray(activities) ? activities.length : 'Not Array'}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                Loading: {loading.toString()}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                Error: {error || 'None'}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                Current Filter: {currentFilter}
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                Current Sort: {currentSort}
              </Typography>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              {Array.isArray(activities) ? activities.length : 0} activities
            </Typography>
          </Toolbar>

          {/* Activities List */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, flexDirection: 'column', alignItems: 'center' }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2, color: '#666666' }}>
                  Loading activities...
                </Typography>
              </Box>
            ) : error ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="error" sx={{ mb: 1 }}>
                  Error Loading Activities
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {error}
                </Typography>
                <Button 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </Box>
            ) : !Array.isArray(activities) ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Assignment sx={{ fontSize: 48, color: '#f44336', mb: 2 }} />
                <Typography variant="h6" color="error" sx={{ mb: 1 }}>
                  Invalid Data Format
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Activities data is not in the expected format.
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Expected: Array, Got: {typeof activities}
                </Typography>
              </Box>
            ) : activities.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Assignment sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No activities found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Try adjusting your filter or sort options
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => onFilterChange('all')}
                  sx={{ mr: 1 }}
                >
                  Show All
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => onFilterChange('pending')}
                >
                  Show Pending
                </Button>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {activities.map((activity, index) => (
                  <React.Fragment key={activity.ActivityID || index}>
                    <ListItem
                      draggable
                      onDragStart={(e) => onDragStart(e, activity)}
                      onClick={() => onActivityClick(activity)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: '#f5f5f5' },
                        borderLeft: `4px solid ${getStatusColor(activity.Status)}`,
                        py: 2,
                        px: 2
                      }}
                    >
                      <DragIndicator sx={{ mr: 1, color: '#ccc', cursor: 'grab' }} />
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="subtitle2" noWrap sx={{ flex: 1, fontWeight: 500 }}>
                              {activity.AccountName || 'Unknown Account'}
                            </Typography>
                            <Chip
                              size="small"
                              label={activity.Status || 'unknown'}
                              sx={{
                                backgroundColor: getStatusColor(activity.Status),
                                color: 'white',
                                fontSize: '0.7rem',
                                height: 20
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 0.5 }}>
                              {activity.ActivityTypeName || 'Unknown Type'}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="caption" color="text.secondary">
                                {formatDueDate(activity.DueToStart)}
                              </Typography>
                              <Chip
                                size="small"
                                label={`P${activity.PriorityLevelValue || '?'}`}
                                sx={{
                                  backgroundColor: getPriorityColor(activity.PriorityLevelValue || 0),
                                  color: 'white',
                                  fontSize: '0.6rem',
                                  height: 16
                                }}
                              />
                            </Box>
                            {activity.HasSequence && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                {activity.SequenceName} - Day {activity.DaysFromStart || 'N/A'}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < activities.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        </Paper>

        {/* Main Content - Tabbed Activity Workspace */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* Tab Bar */}
          {openTabs.length > 0 && (
            <Paper sx={{ borderRadius: 0, borderBottom: '1px solid #e0e0e0' }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => onTabChange(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ minHeight: 48 }}
              >
                {openTabs.map((tab, index) => (
                  <Tab
                    key={`${tab.activityId}-${index}`}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                        <Box sx={{ textAlign: 'left' }}>
                          <Typography variant="caption" sx={{ fontWeight: 500, display: 'block' }}>
                            {tab.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {tab.subtitle}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTabClose(index);
                          }}
                          sx={{ ml: 1, p: 0.5 }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                    sx={{ minHeight: 48, textTransform: 'none' }}
                  />
                ))}
              </Tabs>
            </Paper>
          )}

          {/* Tab Content */}
          <Box 
            sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            {openTabs.length === 0 ? (
              // Empty State
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                p: 4,
                textAlign: 'center'
              }}>
                <Assignment sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No activities open
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Click on an activity from the left panel or drag and drop it here to get started
                </Typography>
                <Box sx={{ 
                  border: '2px dashed #ddd', 
                  borderRadius: 2, 
                  p: 4, 
                  backgroundColor: '#fafafa',
                  minWidth: 300
                }}>
                  <DragIndicator sx={{ color: '#ccc', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Drop activities here to open them
                  </Typography>
                </Box>
              </Box>
            ) : (
              // Active Tab Content
              openTabs.map((tab, index) => (
                <CustomTabPanel key={`${tab.activityId}-${index}`} value={activeTab} index={index}>
                  {currentTabLoading ? (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      height: '100%',
                      flexDirection: 'column',
                      gap: 2
                    }}>
                      <CircularProgress />
                      <Typography variant="body2" color="text.secondary">
                        Loading activity details...
                      </Typography>
                    </Box>
                  ) : currentActivity ? (
                    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
                      <Card sx={{ maxWidth: 800, mx: 'auto' }}>
                        <CardContent>
                          {/* Activity Header */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                                {currentActivity.AccountName}
                              </Typography>
                              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                                {currentActivity.ActivityTypeName}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip
                                  label={currentActivity.Status}
                                  sx={{
                                    backgroundColor: getStatusColor(currentActivity.Status),
                                    color: 'white'
                                  }}
                                />
                                <Chip
                                  label={`Priority ${currentActivity.PriorityLevelValue} - ${currentActivity.PriorityLevelName}`}
                                  sx={{
                                    backgroundColor: getPriorityColor(currentActivity.PriorityLevelValue),
                                    color: 'white'
                                  }}
                                />
                                {currentActivity.HasSequence && (
                                  <Chip
                                    label={`${currentActivity.SequenceName} (Day ${currentActivity.DaysFromStart})`}
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            </Box>
                          </Box>

                          {/* Activity Details */}
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                                Due Date
                              </Typography>
                              <Typography variant="body1" sx={{ mb: 2 }}>
                                {currentActivity.DueToStart ? 
                                  format(new Date(currentActivity.DueToStart), "MMM d, yyyy 'at' h:mm a") : 
                                  'No due date set'
                                }
                              </Typography>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                                Time Until Due
                              </Typography>
                              <Typography variant="body1" sx={{ mb: 2 }}>
                                {formatTimeUntilDue(currentActivity.TimeUntilDue)}
                              </Typography>
                            </Grid>

                            {currentActivity.DueToEnd && (
                              <Grid item xs={12} md={6}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                                  End Date
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                  {format(new Date(currentActivity.DueToEnd), "MMM d, yyyy 'at' h:mm a")}
                                </Typography>
                              </Grid>
                            )}

                            {currentActivity.SequenceItemDescription && (
                              <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
                                  Sequence Item Description
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                  {currentActivity.SequenceItemDescription}
                                </Typography>
                              </Grid>
                            )}

                            {/* Sequence Navigation */}
                            {currentActivity.SequenceProgress && (
                              <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                                  Sequence Progress
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                  {currentActivity.SequenceProgress.previous && (
                                    <Chip
                                      size="small"
                                      label={`Previous: Day ${currentActivity.SequenceProgress.previous.days}`}
                                      variant="outlined"
                                    />
                                  )}
                                  <Chip
                                    label={`Current: Day ${currentActivity.SequenceProgress.current}`}
                                    color="primary"
                                  />
                                  {currentActivity.SequenceProgress.next && (
                                    <Chip
                                      size="small"
                                      label={`Next: Day ${currentActivity.SequenceProgress.next.days}`}
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
                              </Grid>
                            )}
                          </Grid>
                        </CardContent>

                        <CardActions sx={{ p: 3, pt: 0, gap: 1 }}>
                          <Button
                            variant="contained"
                            startIcon={<CheckCircle />}
                            onClick={handleCompleteClick}
                            disabled={currentActivity.Completed}
                          >
                            {currentActivity.Completed ? 'Completed' : 'Mark Complete'}
                          </Button>
                          
                          <Button
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={handleEditClick}
                            disabled={currentActivity.Completed}
                          >
                            Edit
                          </Button>
                          
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Delete />}
                            onClick={handleDeleteClick}
                          >
                            Delete
                          </Button>
                        </CardActions>
                      </Card>
                    </Box>
                  ) : (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      height: '100%',
                      flexDirection: 'column',
                      gap: 2
                    }}>
                      <Assignment sx={{ fontSize: 48, color: '#ccc' }} />
                      <Typography variant="body2" color="text.secondary">
                        Activity not found or failed to load
                      </Typography>
                    </Box>
                  )}
                </CustomTabPanel>
              ))
            )}
          </Box>
        </Box>

        {/* Status Snackbar */}
        <Snackbar
          open={!!statusMessage}
          autoHideDuration={4000}
          onClose={() => showStatus('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={() => showStatus('')} severity={statusSeverity} sx={{ width: '100%' }}>
            {statusMessage}
          </Alert>
        </Snackbar>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1300 }}
            onClose={onClearMessages}
          >
            {error}
          </Alert>
        )}

        {/* Success Message */}
        {successMessage && (
          <Alert 
            severity="success" 
            sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1300 }}
            onClose={onClearMessages}
          >
            {successMessage}
          </Alert>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default WorkPage;