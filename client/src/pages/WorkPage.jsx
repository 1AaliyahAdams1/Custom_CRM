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
  Toolbar,
  AppBar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
  Info,
  CheckCircleOutline,
  RadioButtonUnchecked,
  Note,
  Email,
  Phone,
  ExpandMore,
  Event,
  History,
  Schedule,
} from "@mui/icons-material";
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from "@mui/material/styles";
import { formatDistanceToNow, format } from "date-fns";
import theme from "../components/Theme";
import NotesPopup from "../components/NotesComponent";

const WorkPage = ({
  activities = [],
  loading = false,
  error,
  statusMessage,
  statusSeverity = 'info',

  // Filters
  currentSort = 'dueDate',
  currentFilter = 'all',
  onSortChange = () => { },
  onFilterChange = () => { },

  // Tabs
  openTabs = [],
  activeTab = 0,
  currentTabData = null,
  currentTabLoading = false,
  onTabChange = () => { },
  onTabClose = () => { },

  // Actions
  onActivityClick = () => { },
  onCompleteActivity = async () => { },
  onUpdateActivity = async () => { },
  onUpdateDueDateWithCascade = async () => { },
  onDeleteActivity = async () => { },
  onSendEmailClick = () => { },
  onAddNoteClick = () => { },
  onDragStart = () => { },
  onDrop = () => { },
  onDragOver = (e) => e.preventDefault(),
  onReorderActivities = () => { },
  draggedIndex = null,

  // Metadata
  activityMetadata = { priorityLevels: [], activityTypes: [] },

  // Utility
  onClearMessages = () => { },
  showStatus = () => { },

  userId,
  refreshCurrentTabData = async () => { },
}) => {
  // Local state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editDialogActivity, setEditDialogActivity] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogActivity, setDeleteDialogActivity] = useState(null);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completeDialogActivity, setCompleteDialogActivity] = useState(null);
  const [completeNotes, setCompleteNotes] = useState("");
  const [dueDateDialogOpen, setDueDateDialogOpen] = useState(false);
  const [dueDateDialogActivity, setDueDateDialogActivity] = useState(null);
  const [newDueDate, setNewDueDate] = useState("");

  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [notesDialogActivity, setNotesDialogActivity] = useState(null);


  const [dragOverIndex, setDragOverIndex] = useState(null);

  const navigate = useNavigate();

  const [editFormData, setEditFormData] = useState({
    priorityLevelId: ""
  });

  // Sort and filter options
  const sortOptions = [
    { value: 'dueDate', label: 'Due Date', icon: <Today />, tooltip: 'Overdue first, then today' },
    { value: 'priority', label: 'Priority', icon: <PriorityHigh />, tooltip: 'Highest priority first' },
    { value: 'account', label: 'Account', icon: <Business />, tooltip: 'Alphabetical by account' },
    { value: 'type', label: 'Type', icon: <Assignment />, tooltip: 'By activity type' },
  ];

  const filterOptions = [
    { value: 'all', label: 'All', tooltip: 'Show all activities' },
    { value: 'overdue', label: 'Overdue', tooltip: 'Show overdue only' },
    { value: 'today', label: 'Today', tooltip: 'Show today only' },
    { value: 'high-priority', label: 'High Priority', tooltip: 'Priority 3+' },
  ];

  // Helper functions
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'overdue':
        return '#f44336';
      case 'today':
        return '#ff9800';
      case 'completed':
        return '#4caf50';
      case 'upcoming':
        return '#2196f3';
      default:
        return '#757575';
    }
  };

  const getPriorityColor = (priorityValue) => {
    const priority = parseInt(priorityValue) || 1;
    switch (priority) {
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

  const isCallActivity = (activity) => {
    return activity && (activity.TypeID === 1 || activity.ActivityTypeID === 1);
  };

  const hasValidPhone = (account) => {
    return account && account.PrimaryPhone && account.PrimaryPhone.trim() !== '';
  };

  const formatPhoneForTel = (phone) => {
    if (!phone) return '';
    return phone.replace(/[\s\-\(\)]/g, '');
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
  const handleEditClick = (activity) => {
    setEditDialogActivity(activity);
    setEditFormData({
      priorityLevelId: activity.PriorityLevelID || ""
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editDialogActivity) return;

    try {
      const updateData = {};

      if (editFormData.priorityLevelId) {
        updateData.PriorityLevelID = parseInt(editFormData.priorityLevelId);
      }

      await onUpdateActivity(editDialogActivity.ActivityID, updateData);
      setEditDialogOpen(false);
      setEditDialogActivity(null);
    } catch (err) {
      console.error("Edit submission error:", err);
    }
  };

  const handleCompleteClick = (activity) => {
    setCompleteDialogActivity(activity);
    setCompleteDialogOpen(true);
    setCompleteNotes("");
  };

  const handleCompleteSubmit = async () => {
    if (!completeDialogActivity) return;

    try {
      await onCompleteActivity(completeDialogActivity.ActivityID, completeNotes);
      setCompleteDialogOpen(false);
      setCompleteDialogActivity(null);
      setCompleteNotes("");
    } catch (err) {
      console.error("Complete submission error:", err);
    }
  };

  const handleDeleteClick = (activity) => {
    setDeleteDialogActivity(activity);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialogActivity) return;

    try {
      await onDeleteActivity(deleteDialogActivity.ActivityID);
      setDeleteDialogOpen(false);
      setDeleteDialogActivity(null);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleDueDateClick = (activity) => {
    setDueDateDialogActivity(activity);
    setNewDueDate(activity.DueToStart ?
      format(new Date(activity.DueToStart), "yyyy-MM-dd'T'HH:mm") : "");
    setDueDateDialogOpen(true);
  };

  const handleDueDateSubmit = async () => {
    if (!dueDateDialogActivity || !newDueDate) return;

    try {
      await onUpdateDueDateWithCascade(dueDateDialogActivity.ActivityID, newDueDate);
      setDueDateDialogOpen(false);
      setDueDateDialogActivity(null);
      setNewDueDate("");
    } catch (err) {
      console.error("Due date update error:", err);
    }
  };

  const handleNotesDialogOpen = (activity) => {
    setNotesDialogActivity(activity);
    setNotesDialogOpen(true);
  };

  const handleNotesDialogClose = () => {
    setNotesDialogOpen(false);
    setNotesDialogActivity(null);
  };


  // Drag and drop handlers
  const handleListDragStart = (e, index, activity) => {
    e.dataTransfer.setData("application/json", JSON.stringify(activity));
    e.dataTransfer.effectAllowed = "copyMove";
    onDragStart(e, index, activity);
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
      setDragOverIndex(null);
      return;
    }

    onReorderActivities(draggedIndex, dropIndex);
    setDragOverIndex(null);
  };

  const handleListDragEnd = () => {
    setDragOverIndex(null);
  };

  // Custom tab panel
  const CustomTabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`account-tabpanel-${index}`}
      aria-labelledby={`account-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ height: '100%', overflow: 'auto' }}>{children}</Box>}
    </div>
  );

  // Activity card component
  const ActivityCard = ({ activity, showActions = true, section = 'current' }) => {
    // Helper to format date properly
    const formatDate = (dateString) => {
      if (!dateString) return 'Unknown date';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Unknown date';
        return format(date, "MMM d, yyyy 'at' h:mm a");
      } catch {
        return 'Unknown date';
      }
    };

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {activity.ActivityTypeName}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                <Chip
                  label={activity.Status}
                  size="small"
                  sx={{
                    backgroundColor: getStatusColor(activity.Status),
                    color: 'white'
                  }}
                />
                {activity.PriorityLevelValue && (
                  <Chip
                    label={`P${activity.PriorityLevelValue} - ${activity.PriorityLevelName}`}
                    size="small"
                    sx={{
                      backgroundColor: getPriorityColor(activity.PriorityLevelValue),
                      color: 'white'
                    }}
                  />
                )}
                {activity.SequenceItemDescription && (
                  <Chip
                    label={`Day ${activity.DaysFromStart}`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
              {activity.SequenceItemDescription && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {activity.SequenceItemDescription}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                <strong>Due:</strong> {activity.DueToStart
                  ? formatDate(activity.DueToStart)
                  : 'No due date'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDueDate(activity.DueToStart)}
              </Typography>
              {section === 'previous' && activity.CompletedAt && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Completed:</strong> {formatDate(activity.CompletedAt)}
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>

        {showActions && (
          <CardActions sx={{ p: 2, pt: 0, gap: 1, flexWrap: 'wrap' }}>
            {section === 'current' && (
              <>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CheckCircle />}
                  onClick={() => handleCompleteClick(activity)}
                  disabled={activity.Completed}
                >
                  Complete
                </Button>

                {isCallActivity(activity) && hasValidPhone(currentTabData?.account) && (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    component="a"
                    href={`tel:${formatPhoneForTel(currentTabData.account.PrimaryPhone)}`}
                    startIcon={<Phone />}
                  >
                    Call
                  </Button>
                )}

                {isEmailActivity(activity) && (
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<Email />}
                    onClick={() => onSendEmailClick(activity)}
                  >
                    Email
                  </Button>
                )}

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Note />}
                  onClick={() => handleNotesDialogOpen(activity)}
                >
                  Add Note
                </Button>


                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => handleEditClick(activity)}
                >
                  Edit
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<Delete />}
                  onClick={() => handleDeleteClick(activity)}
                >
                  Delete
                </Button>
              </>
            )}

            {section === 'upcoming' && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Event />}
                onClick={() => handleDueDateClick(activity)}
              >
                Change Due Date
              </Button>
            )}
          </CardActions>
        )}
      </Card>
    );
  };

  // Activities List View (Left Panel)
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
      ) : activities.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Assignment sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No activities due today or overdue
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Great job staying on top of your work!
          </Typography>
        </Box>
      ) : (
        activities.map((activity, index) => (
          <React.Fragment key={activity.ActivityID || index}>
            <ListItem
              draggable={true}
              onDragStart={(e) => handleListDragStart(e, index, activity)}
              onDragOver={(e) => handleListDragOver(e, index)}
              onDragLeave={handleListDragLeave}
              onDrop={(e) => handleListDrop(e, index)}
              onDragEnd={handleListDragEnd}
              onClick={() => onActivityClick(activity)}
              sx={{
                cursor: 'grab',
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
                        {formatDueDate(activity.DueToStart)}
                      </Typography>
                      {activity.PriorityLevelValue && (
                        <Chip
                          size="small"
                          label={`P${activity.PriorityLevelValue}`}
                          sx={{
                            backgroundColor: getPriorityColor(activity.PriorityLevelValue),
                            color: 'white',
                            fontSize: '0.6rem',
                            height: 16
                          }}
                        />
                      )}
                    </Box>
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

  // Account Tab Content 
  const AccountTabContent = () => {
    if (!currentTabData) return null;

    const { account, previousActivities, currentActivities, upcomingActivities } = currentTabData;

    return (
      <Box sx={{ p: 3 }}>
        {/* Account Header */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 600, mb: 1, cursor: 'pointer', '&:hover': { textDecoration: 'underline', color: 'primary.main' } }}
            onClick={() => navigate(`/accounts/${account.AccountID}`)}
          >
            {account.AccountName || 'Unknown Account'}
          </Typography>
          {account.PrimaryPhone && (
            <Typography variant="body2" color="text.secondary">
              <Phone sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
              {account.PrimaryPhone}
            </Typography>
          )}
        </Box>

        {/* Previous Activities Section */}
<Accordion defaultExpanded={false} sx={{ mb: 2 }}>
  <AccordionSummary expandIcon={<ExpandMore />}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <History />
      <Typography variant="h6">
        Activity History ({previousActivities.length})
      </Typography>
    </Box>
  </AccordionSummary>
  <AccordionDetails>
    <Box sx={{ maxHeight: '400px', overflowY: 'auto', pr: 1 }}>
      {previousActivities.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No completed activities yet
        </Typography>
      ) : (
        previousActivities.map((activity, idx) => {
          const formatDate = (dateString) => {
            if (!dateString) return 'Unknown date';
            try {
              const date = new Date(dateString);
              if (isNaN(date.getTime())) return 'Unknown date';
              return format(date, "MMM d, yyyy");
            } catch {
              return 'Unknown date';
            }
          };

          const notes = activity.Notes || []; // ensure Notes is an array

          return (
            <Box key={activity.ActivityID} sx={{ mb: 2 }}>
              {/* Activity summary line */}
              <Typography variant="body2" sx={{ mb: 0.5, color: '#333', fontWeight: 500 }}>
                <strong>{activity.ActivityTypeName}</strong>
                {activity.SequenceItemDescription && ` - ${activity.SequenceItemDescription}`}
                {' • Completed on '}
                {formatDate(activity.CompletedAt)}
                {notes.length > 0 && ` • Notes: ${notes.map(n => n.Content).join('; ')}`}
              </Typography>

              {/* Notes detailed below */}
              {notes.length > 0 && (
                <Box sx={{ pl: 2, mt: 1, mb: 1 }}>
                  {notes.map((note, noteIdx) => (
                    <Box key={noteIdx} sx={{ mb: 0.5 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontStyle: 'italic',
                          backgroundColor: '#f5f5f5',
                          p: 1,
                          borderRadius: 1,
                          borderLeft: '3px solid #2196f3'
                        }}
                      >
                        {note.Content}
                      </Typography>
                      {note.CreatedAt && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ pl: 1, display: 'block', mt: 0.5 }}
                        >
                          Added {formatDate(note.CreatedAt)}
                          {note.CreatedBy && ` by User ${note.CreatedBy}`}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              )}

              {idx < previousActivities.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          );
        })
      )}
    </Box>
  </AccordionDetails>
</Accordion>



        {/* Current Activities Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Today />
            <Typography variant="h6">
              Current Activities ({currentActivities.length})
            </Typography>
          </Box>
          {currentActivities.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#f5f5f5' }}>
              {/* ... existing content ... */}
            </Paper>
          ) : (
            <Box sx={{ maxHeight: '500px', overflowY: 'auto', pr: 1 }}>
              {currentActivities.map((activity) => (
                <ActivityCard
                  key={activity.ActivityID}
                  activity={activity}
                  showActions={true}
                  section="current"
                />
              ))}
            </Box>
          )}
        </Box>
        {/* Upcoming Activities Section */}
        <Accordion defaultExpanded={true} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule />
                <Typography variant="h6">
                  Upcoming Activities ({upcomingActivities.length})
                </Typography>
              </Box>
              {upcomingActivities.length > 0 && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Event />}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Use the FIRST upcoming activity as the reference point
                    handleDueDateClick(upcomingActivities[0]);
                  }}
                  sx={{ mr: 1 }}
                >
                  Change Due Date
                </Button>
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ maxHeight: '400px', overflowY: 'auto', pr: 1 }}>
              {upcomingActivities.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No upcoming activities scheduled
                </Typography>
              ) : (
                upcomingActivities.map((activity) => (
                  <ActivityCard
                    key={activity.ActivityID}
                    activity={activity}
                    showActions={false}
                    section="upcoming"
                  />
                ))
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    );
  };

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
                  My Activities
                </Typography>
                <Tooltip title="Due today or overdue only. Drag to reorder or drop into workspace" arrow>
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
                {activities.length} activities
              </Typography>
            </Toolbar>

            {/* Activities List (Scrollable) */}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <ActivitiesListView />
            </Box>
          </Paper>

          {/* Right Panel - Tabbed Workspace */}
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
                      key={`${tab.accountId}-${index}`}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                          <Business sx={{ fontSize: 18 }} />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {tab.accountName}
                          </Typography>
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
              sx={{ flex: 1, overflowY: 'auto', p: 2 }}
              onDrop={onDrop}
              onDragOver={onDragOver}
            >
              {openTabs.length === 0 ? (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                    textAlign: 'center'
                  }}
                >
                  <Assignment sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    No accounts open
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Click on an activity from the left panel or drag and drop it here
                  </Typography>

                  <Box
                    sx={{
                      border: '2px dashed #ddd',
                      borderRadius: 2,
                      p: 4,
                      backgroundColor: '#fafafa',
                      minWidth: 300
                    }}
                  >
                    <DragIndicator sx={{ color: '#ccc', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Drop activities here to open accounts
                    </Typography>
                  </Box>
                </Box>
              ) : (
                openTabs.map((tab, index) => (
                  <CustomTabPanel key={`${tab.accountId}-${index}`} value={activeTab} index={index}>
                    {currentTabLoading ? (
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '100%',
                          flexDirection: 'column',
                          gap: 2
                        }}
                      >
                        <CircularProgress />
                        <Typography variant="body2" color="text.secondary">
                          Loading account activities...
                        </Typography>
                      </Box>
                    ) : (
                      <AccountTabContent />
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

        {/* Due Date Dialog */}
        <Dialog open={dueDateDialogOpen} onClose={() => setDueDateDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Change Due Date for Sequence</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                This will adjust ALL upcoming activities in the sequence. All activities will maintain
                their relative timing (Day 1, Day 3, etc.) from the new start date.
              </Alert>
              {dueDateDialogActivity && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Adjusting start date for: <strong>{dueDateDialogActivity.ActivityTypeName}</strong>
                  {dueDateDialogActivity.DaysFromStart && ` (Day ${dueDateDialogActivity.DaysFromStart})`}
                </Typography>
              )}
              <TextField
                label="New Due Date"
                type="datetime-local"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDueDateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDueDateSubmit} variant="contained" color="primary">
              Update All Activities
            </Button>
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

        {/* Notes Dialog */}

        {notesDialogActivity && (
          <NotesPopup
            open={notesDialogOpen}
            onClose={handleNotesDialogClose}
            entityType="Activity"
            entityId={notesDialogActivity.ActivityID}
            entityName={notesDialogActivity.ActivityTypeName}
            mode="create"
            showExistingNotes={true}
            maxLength={255}
            required={false}
            onSave={async (newNote) => {
              showStatus('Note saved successfully', 'success');
              if (refreshCurrentTabData) {
                await refreshCurrentTabData();
              }
            }}
          />
        )}


        {/* Status Snackbar */}
        <Snackbar
          open={!!statusMessage}
          autoHideDuration={4000}
          onClose={() => showStatus('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => showStatus('')}
            severity={statusSeverity}
            sx={{ width: '100%' }}
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
              minWidth: '400px',
            }}
            onClose={onClearMessages}
          >
            {error}
          </Alert>
        )}
      </Box>
    </ThemeProvider >
  );
};

export default WorkPage;