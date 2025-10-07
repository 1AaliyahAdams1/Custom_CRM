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
  AppBar,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
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
  Timeline,
  CheckCircleOutline,
  RadioButtonUnchecked,
  Schedule,
  Note,
  Email,
} from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import { formatDistanceToNow, format } from "date-fns";
import theme from "../components/Theme";
import NotesPopup from "../components/NotesComponent";

const WorkPage = ({
  viewMode = 'activities',
  sequenceViewData = null,
  activities = [],
  loading = false,
  error,
  successMessage,
  onAddNote,
  selectedAccount,
  handleSaveNote,
  handleEditNote,  
  statusMessage,
  statusSeverity = 'info',
  currentSort = 'dueDate',
  currentFilter = 'all',
  selectedAccountId = null,
  onSortChange = () => {},
  onFilterChange = () => {},
  onAccountFilterChange = () => {},
  openTabs = [],
  activeTab = 0,
  currentActivity,
  currentTabLoading = false,
  onTabChange = () => {},
  onTabClose = () => {},
  onActivityClick = () => {},
  onSequenceStepClick = () => {},
  onCompleteActivity = async () => {},
  onSendEmailClick = () => {}, 
  showEmailForm = {},
  onUpdateActivity = async () => {},
  onDeleteActivity = async () => {},
  onDragStart = () => {}, // For opening in workspace
  onDrop = () => {}, // For opening in workspace
  onDragOver = (e) => e.preventDefault(), // For opening in workspace
  onReorderActivities = () => {}, // For reordering in list
  activityMetadata = { priorityLevels: [], activityTypes: [] },
  onClearMessages = () => {},
  showStatus = () => {},
}) => {
  // Local state for dialogs and forms
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completeNotes, setCompleteNotes] = useState("");
  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  
  // NEW: Drag and drop reordering state
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const [editFormData, setEditFormData] = useState({
    dueToStart: "",
    dueToEnd: "",
    priorityLevelId: ""
  });

  // Sort and filter options
  const sortOptions = [
    { value: 'dueDate', label: 'Due Date', icon: <Today />, tooltip: 'Sort by due date - overdue first' },
    { value: 'priority', label: 'Priority', icon: <PriorityHigh />, tooltip: 'Sort by priority level' },
    { value: 'account', label: 'Account', icon: <Business />, tooltip: 'Sort by account name (A-Z)' },
    { value: 'type', label: 'Type', icon: <Assignment />, tooltip: 'Sort by activity type' },
    { value: 'sequence', label: 'Sequence', icon: <Sort />, tooltip: 'Sort by sequence order' },
    { value: 'status', label: 'Status', icon: <AccessTime />, tooltip: 'Sort by urgency status' },
  ];

  const filterOptions = [
    { value: 'all', label: 'All Activities', tooltip: 'Show all activities' },
    { value: 'overdue', label: 'Overdue', tooltip: 'Show overdue activities' },
    { value: 'high-priority', label: 'High Priority', tooltip: 'Show high priority activities' },
    { value: 'today', label: 'Due Today', tooltip: 'Show activities due today' },
    { value: 'completed', label: 'Completed', tooltip: 'Show completed activities' },
  ];

  // Helper functions
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'overdue':
        return '#f44336';
      case 'urgent':
        return '#ff9800';
      case 'completed':
        return '#4caf50';
      case 'pending':
        return '#2196f3';
      case 'not_started':
        return '#9e9e9e';
      default:
        return '#757575';
    }
  };

  const getPriorityColor = (priorityValue) => {
    const priority = parseInt(priorityValue) || 1;
    switch(priority) {
      case 4:
        return '#d32f2f';
      case 3:
        return '#f57c00';
      case 2:
        return '#1976d2';
      case 1:
      default:
        return '#4caf50';
    }
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

  const getStepIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircleOutline sx={{ color: '#4caf50' }} />;
      case 'pending':
      case 'overdue':
      case 'urgent':
        return <Schedule sx={{ color: '#ff9800' }} />;
      case 'not_started':
      default:
        return <RadioButtonUnchecked sx={{ color: '#9e9e9e' }} />;
    }
  };

  // NEW: Check if activity is an email activity (TypeID = 3)
  const isEmailActivity = (activity) => {
    return activity && (activity.TypeID === 3 || activity.ActivityTypeID === 3);
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

  // NEW: Drag and drop handlers for activities list (reordering + workspace drop)
  const handleListDragStart = (e, index, activity) => {
    setDraggedIndex(index);
    // Store activity data for workspace drop
    e.dataTransfer.setData("application/json", JSON.stringify(activity));
    // Allow both move (reorder) and copy (to workspace)
    e.dataTransfer.effectAllowed = "copyMove";
  };

  const handleListDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleListDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleListDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Call the parent handler to reorder activities
    onReorderActivities(draggedIndex, dropIndex);
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleListDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
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

  // ============================================================
  // SEQUENCE VIEW COMPONENT
  // ============================================================
  const SequenceView = () => {
    if (!sequenceViewData) return null;

    const { account, sequence, progress, steps } = sequenceViewData;

    return (
      <Box sx={{ p: 0 }}>
        {/* Sequence Header */}
        <Paper sx={{ p: 3, mb: 2, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                {account.AccountName}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                {sequence.SequenceName}
              </Typography>
              {sequence.SequenceDescription && (
                <Typography variant="body2" color="text.secondary">
                  {sequence.SequenceDescription}
                </Typography>
              )}
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onAccountFilterChange(null)}
              sx={{ ml: 2 }}
            >
              Back to All Activities
            </Button>
          </Box>

          {/* Progress Bar */}
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Sequence Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {progress.completedSteps} of {progress.totalSteps} steps completed
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress.progressPercentage} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#4caf50'
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {progress.progressPercentage}% complete
            </Typography>
          </Box>
        </Paper>

        {/* Sequence Steps */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Sequence Steps
          </Typography>
          
          <Stepper orientation="vertical" nonLinear>
            {steps.map((step, index) => {
              const isCompleted = step.Status === 'completed';
              const isActive = step.Status === 'pending' || step.Status === 'overdue' || step.Status === 'urgent';
              const isNotStarted = step.Status === 'not_started';

              return (
                <Step key={step.SequenceItemID} active={isActive} completed={isCompleted}>
                  <StepLabel
                    StepIconComponent={() => getStepIcon(step.Status)}
                    optional={
                      <Typography variant="caption">
                        Day {step.DaysFromStart}
                      </Typography>
                    }
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                        Step {step.stepNumber}: {step.ActivityTypeName}
                      </Typography>
                      <Chip
                        size="small"
                        label={step.Status.replace('_', ' ')}
                        sx={{
                          backgroundColor: getStatusColor(step.Status),
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 20,
                          textTransform: 'capitalize'
                        }}
                      />
                    </Box>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ mb: 2 }}>
                      {step.SequenceItemDescription && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {step.SequenceItemDescription}
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Due Date
                          </Typography>
                          <Typography variant="body2">
                            {step.DueToStart 
                              ? format(new Date(step.DueToStart), "MMM d, yyyy")
                              : format(new Date(step.estimatedDueDate), "MMM d, yyyy (estimated)")}
                          </Typography>
                        </Box>
                        
                        {step.PriorityLevelValue && (
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Priority
                            </Typography>
                            <Chip
                              size="small"
                              label={`P${step.PriorityLevelValue} - ${step.PriorityLevelName}`}
                              sx={{
                                backgroundColor: getPriorityColor(step.PriorityLevelValue),
                                color: 'white',
                                fontSize: '0.65rem',
                                height: 18
                              }}
                            />
                          </Box>
                        )}
                      </Box>

                      {step.ActivityID && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => onSequenceStepClick(step)}
                          sx={{ mt: 1 }}
                        >
                          Open Activity
                        </Button>
                      )}
                      
                      {!step.ActivityID && isNotStarted && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                          This step hasn't been started yet
                        </Typography>
                      )}
                    </Box>
                  </StepContent>
                </Step>
              );
            })}
          </Stepper>
        </Paper>
      </Box>
    );
  };

  // ============================================================
  // ACTIVITIES LIST VIEW COMPONENT (WITH SCROLLBAR AND REORDERING)
  // ============================================================
  const ActivitiesListView = () => (
    <List sx={{ p: 0 }}>
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
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button variant="outlined" onClick={() => window.location.reload()}>
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
          <Button variant="outlined" onClick={() => onFilterChange('all')}>
            Show All
          </Button>
        </Box>
      ) : (
        activities.map((activity, index) => (
          <React.Fragment key={activity.ActivityID || index}>
            <ListItem
              draggable
              onDragStart={(e) => handleListDragStart(e, index, activity)}
              onDragOver={(e) => handleListDragOver(e, index)}
              onDragLeave={handleListDragLeave}
              onDrop={(e) => handleListDrop(e, index)}
              onDragEnd={handleListDragEnd}
              onClick={() => onActivityClick(activity)}
              sx={{
                cursor: 'move',
                '&:hover': { backgroundColor: '#f5f5f5' },
                borderLeft: `4px solid ${getStatusColor(activity.Status)}`,
                py: 2,
                px: 2,
                backgroundColor: dragOverIndex === index ? '#e3f2fd' : 'transparent',
                borderTop: dragOverIndex === index ? '2px solid #2196f3' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <DragIndicator sx={{ mr: 1, color: '#999', cursor: 'grab' }} />
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
                    {activity.SequenceName && (
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
        ))
      )}
    </List>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fafafa' }}>
        
        {/* Page Header */}
        <AppBar position="static" sx={{ backgroundColor: '#fff', color: '#050505', boxShadow: 1 }}>
          <Toolbar>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#050505' }}>
              Work Page
            </Typography>
            {viewMode === 'sequence' && (
              <Chip
                icon={<Timeline />}
                label="Sequence View"
                sx={{ ml: 2, backgroundColor: '#2196f3', color: 'white' }}
              />
            )}
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* Left Panel - Activities List or Sequence View (WITH SCROLLBAR) */}
          <Paper sx={{ 
            width: viewMode === 'sequence' ? '100%' : 400,
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 0,
            borderRight: viewMode === 'activities' ? '1px solid #e0e0e0' : 'none',
            overflow: 'hidden' // IMPORTANT: Prevents overflow
          }}>
            {viewMode === 'activities' ? (
              <>
                {/* Activities List Header */}
                <Toolbar sx={{ 
                  backgroundColor: '#fff', 
                  borderBottom: '1px solid #e0e0e0',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  py: 2,
                  flexShrink: 0 // Prevents toolbar from shrinking
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="h6" sx={{ color: '#050505', fontWeight: 600, flex: 1 }}>
                      My Activities
                    </Typography>
                    <Tooltip title="Drag activities to reorder or drop into workspace" arrow>
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
                  
                  <Typography variant="body2" color="text.secondary">
                    {Array.isArray(activities) ? activities.length : 0} activities
                  </Typography>
                </Toolbar>

                {/* Activities List (SCROLLABLE) */}
                <Box sx={{ 
                  flex: 1, 
                  overflow: 'auto', // ENABLES SCROLLING
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#f1f1f1',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#888',
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: '#555',
                    },
                  },
                }}>
                  <ActivitiesListView />
                </Box>
              </>
            ) : (
              /* Sequence View (SCROLLABLE) */
              <Box sx={{ 
                flex: 1, 
                overflow: 'auto', 
                p: 3,
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f1f1f1',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#888',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: '#555',
                  },
                },
              }}>
                <SequenceView />
              </Box>
            )}
          </Paper>

          {/* Main Content - Tabbed Activity Workspace (only in activities mode) */}
          {viewMode === 'activities' && (
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
                              <Typography variant="body2" sx={{ fontWeight: 500, display: 'block' }}>
                                {tab.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {tab.subtitle}
                              </Typography>
                            </Box>
                            <Box
                              component="span"
                              onClick={(e) => {
                                e.stopPropagation();
                                onTabClose(index);
                              }}
                              sx={{ 
                                ml: 1, 
                                p: 0.5,
                                borderRadius: '50%',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                }
                              }}
                            >
                              <Close fontSize="small" />
                            </Box>
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
                  /* Empty State */
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
                      Click on an activity from the left panel or drag and drop it here
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
                  /* Active Tab Content */
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
                          <Card sx={{ width: '100%', height: 'fit-content' }}>
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
                                    {currentActivity.SequenceName && (
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
                                    {formatDueDate(currentActivity.DueToStart)}
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
                              </Grid>
                            </CardContent>

                            <CardActions sx={{ p: 3, pt: 0, gap: 1, flexWrap: 'wrap' }}>
                              <Button
                                variant="contained"
                                startIcon={<CheckCircle />}
                                onClick={handleCompleteClick}
                                disabled={currentActivity.Completed}
                              >
                                {currentActivity.Completed ? 'Completed' : 'Mark Complete'}
                              </Button>
                              
                              {/* CONDITIONAL EMAIL BUTTON - Only show for TypeID = 3 */}
                              {isEmailActivity(currentActivity) && (
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  startIcon={<Email />}
                                  onClick={() => onSendEmailClick(currentActivity.ActivityID)}
                                >
                                  Send Email
                                </Button>
                              )}
                              
                              <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<Note />}
                                onClick={() => setNotesPopupOpen(true)}
                              >
                                Add Note
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
          )}
          
        </Box>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Activity</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Due Start Date"
                type="datetime-local"
                value={editFormData.dueToStart}
                onChange={(e) => setEditFormData(prev => ({ ...prev, dueToStart: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Due End Date"
                type="datetime-local"
                value={editFormData.dueToEnd}
                onChange={(e) => setEditFormData(prev => ({ ...prev, dueToEnd: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Priority Level</InputLabel>
                <Select
                  value={editFormData.priorityLevelId}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, priorityLevelId: e.target.value }))}
                  label="Priority Level"
                >
                  {activityMetadata.priorityLevels.map((priority) => (
                    <MenuItem key={priority.id} value={priority.id}>
                      {priority.name} (Level {priority.value})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit} variant="contained">Save Changes</Button>
          </DialogActions>
        </Dialog>

        {/* Complete Dialog */}
        <Dialog open={completeDialogOpen} onClose={() => setCompleteDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Complete Activity</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Completion Notes (Optional)"
              multiline
              rows={4}
              value={completeNotes}
              onChange={(e) => setCompleteNotes(e.target.value)}
              fullWidth
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCompleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCompleteSubmit} variant="contained">Mark Complete</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm">
          <DialogTitle>Delete Activity</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this activity?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} variant="contained" color="error">Delete</Button>
          </DialogActions>
        </Dialog>

        {/* Notes Popup */}
        {notesPopupOpen && currentActivity && (
          <NotesPopup
            open={notesPopupOpen}
            onClose={() => setNotesPopupOpen(false)}
            onSave={handleSaveNote}
            onEdit={handleEditNote}
            entityType="Activity"
            entityId={currentActivity.ActivityID}
            entityName={`${currentActivity.AccountName} - ${currentActivity.ActivityTypeName}`}
            showExistingNotes={true}
            maxLength={255}
            required={false}
          />
        )} 

        {/* Status Snackbar */}
        <Snackbar
          open={!!statusMessage}
          autoHideDuration={4000}
          onClose={() => showStatus('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{
            '& .MuiSnackbarContent-root': {
              fontSize: '1.1rem',
              minWidth: '400px',
            }
          }}
        >
          <Alert 
            onClose={() => showStatus('')} 
            severity={statusSeverity} 
            sx={{ 
              width: '100%',
              fontSize: '1.1rem',
              '& .MuiAlert-message': {
                fontSize: '1.1rem',
                fontWeight: 500,
              }
            }}
          >
            {statusMessage}
          </Alert>
        </Snackbar>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              position: 'fixed', 
              top: 16, 
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1300,
              fontSize: '1.1rem',
              minWidth: '400px',
              '& .MuiAlert-message': {
                fontSize: '1.1rem',
                fontWeight: 500,
              }
            }}
            onClose={onClearMessages}
          >
            {error}
          </Alert>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default WorkPage;