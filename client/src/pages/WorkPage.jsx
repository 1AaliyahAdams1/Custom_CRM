import React, { useState } from "react";
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
  Checkbox,
  FormControlLabel,
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
  Lock,
} from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import { formatDistanceToNow, format } from "date-fns";
import theme from "../components/Theme";
import NotesPopup from "../components/NotesComponent";

const WorkPage = ({
  activities = [],
  loading = false,
  error,
  successMessage,
  statusMessage,
  statusSeverity = 'info',
  
  // Account and sequence
  userAccounts = [],
  selectedAccountId = null,
  sequenceProgress = null,
  onAccountChange = () => {},
  onToggleSequenceItem = () => {},
  onSequenceItemClick = () => {},
  
  // Filters
  currentSort = 'dueDate',
  currentFilter = 'all',
  onSortChange = () => {},
  onFilterChange = () => {},
  
  // Tabs
  openTabs = [],
  activeTab = 0,
  currentActivity,
  currentTabLoading = false,
  onTabChange = () => {},
  onTabClose = () => {},
  
  // Actions
  onActivityClick = () => {},
  onCompleteActivity = async () => {},
  onSendEmailClick = () => {}, 
  showEmailForm = {},
  onUpdateActivity = async () => {},
  onDeleteActivity = async () => {},
  onDragStart = () => {},
  onDrop = () => {},
  onDragOver = (e) => e.preventDefault(),
  onReorderActivities = () => {},
  
  // Metadata
  activityMetadata = { priorityLevels: [], activityTypes: [] },
  
  // Utility
  onClearMessages = () => {},
  showStatus = () => {},
  
  // Notes
  onAddNote = () => {},
  handleSaveNote = () => {},
  handleEditNote = () => {},
}) => {
  // Local state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completeNotes, setCompleteNotes] = useState("");
  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const [editFormData, setEditFormData] = useState({
    dueToStart: "",
    dueToEnd: "",
    priorityLevelId: ""
  });

  const isSequenceMode = selectedAccountId !== null;

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
        updateData.DueToStart = new Date(editFormData.dueToStart).toISOString();
      }
      
      if (editFormData.dueToEnd) {
        updateData.DueToEnd = new Date(editFormData.dueToEnd).toISOString();
      }
      
      if (editFormData.priorityLevelId) {
        updateData.PriorityLevelID = parseInt(editFormData.priorityLevelId);
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


// Drag and drop handlers
const handleListDragStart = (e, index, activity) => {
  // Allow dragging in both modes now
  setDraggedIndex(index);
  e.dataTransfer.setData("application/json", JSON.stringify(activity));
  e.dataTransfer.effectAllowed = "copyMove";
};

const handleListDragOver = (e, index) => {
  // Only allow reordering in non-sequence mode
  if (isSequenceMode) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy"; // Change to copy for sequence mode
    return;
  }
  
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  setDragOverIndex(index);
};

const handleListDragLeave = () => {
  setDragOverIndex(null);
};

const handleListDrop = (e, dropIndex) => {
  e.preventDefault();
  
  // In sequence mode, don't reorder, just ignore the drop in the list
  if (isSequenceMode) {
    setDraggedIndex(null);
    setDragOverIndex(null);
    return;
  }
  
  // Regular reordering for activity list mode
  if (draggedIndex === null || draggedIndex === dropIndex) {
    setDraggedIndex(null);
    setDragOverIndex(null);
    return;
  }

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

  // Activities List View
  const ActivitiesListView = () => (
    <List sx={{ p: 0 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2, color: '#666666' }}>
            Loading {isSequenceMode ? 'sequence items' : 'activities'}...
          </Typography>
        </Box>
      ) : error ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" sx={{ mb: 1 }}>
            Error Loading {isSequenceMode ? 'Sequence' : 'Activities'}
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
            Data is not in the expected format.
          </Typography>
        </Box>
      ) : activities.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Assignment sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            {isSequenceMode ? 'No sequence items yet' : 'No activities found'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {isSequenceMode ? 'The first item will appear when it becomes available' : 'Try adjusting your filter or sort options'}
          </Typography>
          <Button variant="outlined" onClick={() => selectedAccountId ? onAccountChange(null) : onFilterChange('all')}>
            {selectedAccountId ? 'Show All Accounts' : 'Show All'}
          </Button>
        </Box>
      ) : (
        activities.map((activity, index) => (
          <React.Fragment key={activity.SequenceItemID || activity.ActivityID || index}>
            <ListItem
  draggable={true}  // Change from draggable={!isSequenceMode} to always true
  onDragStart={(e) => handleListDragStart(e, index, activity)}
  onDragOver={(e) => handleListDragOver(e, index)}
  onDragLeave={handleListDragLeave}
  onDrop={(e) => handleListDrop(e, index)}
  onDragEnd={handleListDragEnd}
  onClick={() => {
    if (isSequenceMode && activity.SequenceItemID) {
      onSequenceItemClick(activity);
    } else {
      onActivityClick(activity);
    }
  }}
  sx={{
    cursor: 'grab',  // Change from conditional cursor to always 'grab'
    '&:hover': { backgroundColor: '#f5f5f5' },
    borderLeft: `4px solid ${getStatusColor(activity.Status)}`,
    py: 2,
    px: 2,
    backgroundColor: dragOverIndex === index ? '#e3f2fd' : 'transparent',
    borderTop: !isSequenceMode && dragOverIndex === index ? '2px solid #2196f3' : 'none',
    transition: 'all 0.2s ease'
  }}
>
  {isSequenceMode && activity.SequenceItemID && (
    <FormControlLabel
      control={
        <Checkbox
          checked={activity.Completed || activity.Status === 'completed'}
          onChange={(e) => {
            e.stopPropagation();
            onToggleSequenceItem(
              activity.SequenceItemID,
              activity.AccountID,
              activity.Completed || activity.Status === 'completed'
            );
          }}
          icon={<RadioButtonUnchecked />}
          checkedIcon={<CheckCircleOutline />}
          onClick={(e) => e.stopPropagation()}
        />
      }
      label=""
      sx={{ mr: 1 }}
    />
  )}
  {!isSequenceMode && (
    <DragIndicator sx={{ mr: 1, color: '#999', cursor: 'grab' }} />
  )}
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
                        height: 20,
                        textTransform: 'capitalize'
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
                        {formatDueDate(activity.DueToStart || activity.estimatedDueDate)}
                      </Typography>
                      {activity.PriorityLevelValue && (
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
                      )}
                    </Box>
                    {isSequenceMode && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Day {activity.DaysFromStart || 'N/A'}
                      </Typography>
                    )}
                    {!isSequenceMode && activity.SequenceName && (
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

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fafafa' }}>
        
        {/* Page Header */}
        <AppBar position="static" sx={{ backgroundColor: '#fff', color: '#050505', boxShadow: 1 }}>
          <Toolbar>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#050505' }}>
              Work Page
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* Left Panel - Activities List */}
          <Paper sx={{ 
            width: 400,
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 0,
            borderRight: '1px solid #e0e0e0',
            overflow: 'hidden'
          }}>
            {/* Filter Toolbar */}
            <Toolbar sx={{ 
              backgroundColor: '#fff', 
              borderBottom: '1px solid #e0e0e0',
              flexDirection: 'column',
              alignItems: 'stretch',
              py: 2,
              flexShrink: 0
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#050505', fontWeight: 600, flex: 1 }}>
                  {isSequenceMode ? 'Sequence Progress' : 'My Activities'}
                </Typography>
                {!isSequenceMode && (
                  <Tooltip title="Drag activities to reorder or drop into workspace" arrow>
                    <Info sx={{ fontSize: 18, color: '#666666', cursor: 'help' }} />
                  </Tooltip>
                )}
              </Box>
              
              {/* Account Filter */}
              <Box sx={{ mb: 2 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Account</InputLabel>
                  <Select
                    value={selectedAccountId || ''}
                    onChange={(e) => onAccountChange(e.target.value || null)}
                    label="Account"
                  >
                    <MenuItem value="">All Activities</MenuItem>
                    {userAccounts.map((account) => (
                      <MenuItem key={account.AccountID} value={account.AccountID}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Business sx={{ fontSize: 16 }} />
                          {account.AccountName}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Sequence Progress */}
              {isSequenceMode && sequenceProgress && (
                <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Progress
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {sequenceProgress.completedItems} of {sequenceProgress.totalItems}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={sequenceProgress.progress} 
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
                    {sequenceProgress.progress}% complete
                  </Typography>
                </Box>
              )}
              
              {/* Sort and Filter Controls - Only show in All Activities mode */}
              {!isSequenceMode && (
                <>
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
                </>
              )}
              
              <Typography variant="body2" color="text.secondary">
                {Array.isArray(activities) ? activities.length : 0} {isSequenceMode ? 'visible items' : 'activities'}
              </Typography>
            </Toolbar>

            {/* Activities List (Scrollable) */}
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto',
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
          </Paper>

          {/* Right Panel - Tabbed Activity Workspace */}
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
                    {isSequenceMode ? 'Click on a sequence item to start' : 'Click on an activity from the left panel or drag and drop it here'}
                  </Typography>
                  {!isSequenceMode && (
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
                  )}
                </Box>
              ) : (
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
                                  {currentActivity.PriorityLevelValue && (
                                    <Chip
                                      label={`Priority ${currentActivity.PriorityLevelValue} - ${currentActivity.PriorityLevelName}`}
                                      sx={{
                                        backgroundColor: getPriorityColor(currentActivity.PriorityLevelValue),
                                        color: 'white'
                                      }}
                                    />
                                  )}
                                  {currentActivity.SequenceName && (
                                    <Chip
                                      label={`${currentActivity.SequenceName} (Day ${currentActivity.DaysFromStart})`}
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
                              </Box>
                            </Box>

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
                              </Grid><Grid item xs={12} md={6}>
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
              fontSize: '1.1rem',
              '& .MuiAlert-message': {
                fontSize: '1.1rem',
                fontWeight: 500,
                fontSize: '1.1rem',
                fontWeight: 500,
              }
            }}
          >
            {statusMessage}
          </Alert>
        </Snackbar>

        {/* Error Alert */}
        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              position: 'fixed', 
              top: 16, 
              left: '50%',
              transform: 'translateX(-50%)',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1300,
              fontSize: '1.1rem',
              minWidth: '400px',
              fontSize: '1.1rem',
              minWidth: '400px',
              '& .MuiAlert-message': {
                fontSize: '1.1rem',
                fontWeight: 500,
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