import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Toolbar,
  Snackbar,
  Avatar,
} from "@mui/material";
import {
  Info as InfoIcon,
  Edit as EditIcon,
  Note as NoteIcon,
  AttachFile as AttachFileIcon,
  PowerOff as PowerOffIcon,
  Power as PowerIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  CalendarToday as CalendarIcon,
  Repeat as RepeatIcon,
} from "@mui/icons-material";

import { Add } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import TableView from '../../components/tableFormat/TableView';
import theme from "../../components/Theme";
import { formatters } from '../../utils/formatters';

const EventsPage = ({
  events = [],
  loading = false,
  error,
  setError,
  successMessage,
  setSuccessMessage,
  statusMessage,
  statusSeverity,
  setStatusMessage,
  selected = [],
  onSelectClick,
  onSelectAllClick,
  onDeactivate,
  onReactivate,
  onDelete,
  onBulkDeactivate,
  onEdit,
  onView,
  onCreate,
  onAddNote,
  onAddAttachment,
  onAssignUser,
  showStatus,
  // Popup props (for future use if needed)
  notesPopupOpen,
  setNotesPopupOpen,
  attachmentsPopupOpen,
  setAttachmentsPopupOpen,
  selectedEvent,
  popupLoading,
  popupError,
  handleSaveNote,
  handleDeleteNote,
  handleEditNote,
  handleUploadAttachment,
  handleDeleteAttachment,
  handleDownloadAttachment,
}) => {
  
  const columns = [
    { 
      field: 'EventName', 
      headerName: 'Event Name', 
      type: 'clickable',
      defaultVisible: true,
      onClick: onView,
      clickableStyle: {
        fontWeight: 600,
        fontSize: '0.95rem'
      }
    },
    { 
      field: 'VenueName', 
      headerName: 'Venue', 
      type: 'tooltip', 
      defaultVisible: true 
    },
    { 
      field: 'City', 
      headerName: 'City', 
      type: 'tooltip', 
      defaultVisible: true 
    },
    { 
      field: 'Country', 
      headerName: 'Country', 
      type: 'tooltip', 
      defaultVisible: true 
    },
    { 
      field: 'ParentCompanyName', 
      headerName: 'Parent Company', 
      type: 'truncated', 
      maxWidth: 200, 
      defaultVisible: true 
    },
    { 
      field: 'EventDate', 
      headerName: 'Event Date', 
      type: 'date', 
      defaultVisible: true 
    },
    {
      field: 'IsWeekly',
      headerName: 'Recurring',
      type: 'chip',
      chipLabels: { true: 'Weekly', false: 'One-time' },
      chipColors: { true: '#2196f3', false: '#757575' },
      defaultVisible: true,
    },
    { 
      field: 'CreatedDate', 
      headerName: 'Created', 
      type: 'dateTime', 
      defaultVisible: false 
    },
    { 
      field: 'UpdatedDate', 
      headerName: 'Updated', 
      type: 'dateTime', 
      defaultVisible: false 
    },
    { 
      field: 'DateOfEdit', 
      headerName: 'Last Edited', 
      type: 'dateTime', 
      defaultVisible: false 
    },
    { 
      field: 'EventID', 
      headerName: 'Event ID', 
      defaultVisible: false 
    },
    { 
      field: 'VenueId', 
      headerName: 'Venue ID', 
      defaultVisible: false 
    },
    { 
      field: 'CityID', 
      headerName: 'City ID', 
      defaultVisible: false 
    },
    { 
      field: 'CountryID', 
      headerName: 'Country ID', 
      defaultVisible: false 
    },
    { 
      field: 'ParentCompanyID', 
      headerName: 'Parent Company ID', 
      defaultVisible: false 
    },
    { 
      field: 'Image1', 
      headerName: 'Event Image', 
      type: 'image', 
      defaultVisible: false 
    }
  ];

  // Enhanced menu items for events
  const getMenuItems = (event) => {
    const baseItems = [
      {
        label: 'View Details',
        icon: <InfoIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onView && onView(event),
        show: !!onView,
      },
      {
        label: 'Edit',
        icon: <EditIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onEdit && onEdit(event),
        show: !!onEdit,
      },
      {
        label: 'Add Notes',
        icon: <NoteIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onAddNote && onAddNote(event),
        show: !!onAddNote,
      },
      {
        label: 'Add Attachments',
        icon: <AttachFileIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onAddAttachment && onAddAttachment(event),
        show: !!onAddAttachment,
      },
    ];

    // Add delete option
    baseItems.push({
      label: 'Delete',
      icon: <DeleteIcon sx={{ mr: 1, color: '#f44336' }} />,
      onClick: () => onDelete && onDelete(event.EventID),
      show: !!onDelete,
    });

    return baseItems;
  };

  // Custom formatters for event-specific fields
  const eventFormatters = {
    ...formatters,
    EventName: (value, row) => {
      if (!value) return 'N/A';
      return (
        <Box
          component="span"
          onClick={(e) => {
            e.stopPropagation();
            if (onView) {
              onView(row);
            }
          }}
          sx={{
            color: 'primary.main',
            cursor: 'pointer',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {value}
        </Box>
      );
    },
    EventDate: (value) => {
      if (!value) return 'N/A';
      try {
        const date = new Date(value);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch {
        return value;
      }
    },
    CreatedDate: (value) => {
      if (!value) return 'N/A';
      try {
        const date = new Date(value);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return value;
      }
    },
    UpdatedDate: (value) => {
      if (!value) return 'N/A';
      try {
        const date = new Date(value);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return value;
      }
    },
    DateOfEdit: (value) => {
      if (!value) return 'N/A';
      try {
        const date = new Date(value);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return value;
      }
    },
    IsWeekly: (value) => {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {value && <RepeatIcon sx={{ fontSize: '1rem', color: '#2196f3' }} />}
          <Chip
            label={value ? 'Weekly' : 'One-time'}
            size="small"
            sx={{
              backgroundColor: value ? '#2196f3' : '#757575',
              color: '#fff',
              fontWeight: 500,
            }}
          />
        </Box>
      );
    },
    Image1: (value) => {
      if (!value) return 'No Image';
      return (
        <Avatar
          src={value}
          alt="Event Image"
          variant="rounded"
          sx={{ width: 40, height: 30 }}
        >
          <EventIcon />
        </Avatar>
      );
    },
    ParentCompanyName: (value) => {
      if (!value) return 'N/A';
      return (
        <span title={value}>
          {value.length > 25 ? `${value.substring(0, 25)}...` : value}
        </span>
      );
    }
  };

  // Tooltip messages for events
  const tooltips = {
    search: "Search events by name, venue, location, company, or any visible field",
    filter: "Show advanced filtering options to narrow down events by date, location, or type",
    columns: "Customize which event information columns are visible",
    actions: "Available actions for this event",
    actionMenu: {
      view: "View detailed event information including venue details and schedules",
      edit: "Edit event details, dates, and venue information",
      addNote: "Add internal notes about this event or planning details",
      addAttachment: "Attach documents, images, or files related to this event",
      delete: "Delete this event from the system"
    }
  };

  // Calculate some stats for display
  const weeklyEventsCount = events.filter(event => event.IsWeekly).length;
  const upcomingEventsCount = events.filter(event => {
    if (!event.EventDate) return false;
    try {
      return new Date(event.EventDate) > new Date();
    } catch {
      return false;
    }
  }).length;

  const navigate = useNavigate();
  
  const handleCreateEvent = () => {
    navigate('/events/create');
  };
  

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            onClose={() => setError && setError('')}
          >
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert 
            severity="success" 
            sx={{ mb: 2 }}
            onClose={() => setSuccessMessage && setSuccessMessage('')}
          >
            {successMessage}
          </Alert>
        )}

        <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
          <Toolbar sx={{ 
            backgroundColor: '#fff', 
            borderBottom: '1px solid #e5e5e5', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: 2, 
            py: 2 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              {/* <EventIcon sx={{ color: 'primary.main', fontSize: '1.5rem' }} /> */}
              <Typography variant="h6" component="div" sx={{ color: '#050505', fontWeight: 600 }}>
                Events
              </Typography>
              {events.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`${events.length} total events`} 
                    size="small" 
                    sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }} 
                  />
                  {weeklyEventsCount > 0 && (
                    <Chip 
                      label={`${weeklyEventsCount} recurring`} 
                      size="small" 
                      icon={<RepeatIcon sx={{ fontSize: '0.75rem !important' }} />}
                      sx={{ backgroundColor: '#e8f5e8', color: '#2e7d32' }} 
                    />
                  )}
                  {upcomingEventsCount > 0 && (
                    <Chip 
                      label={`${upcomingEventsCount} upcoming`} 
                      size="small" 
                      icon={<CalendarIcon sx={{ fontSize: '0.75rem !important' }} />}
                      sx={{ backgroundColor: '#fff3e0', color: '#f57c00' }} 
                    />
                  )}
                </Box>
              )}
              {selected.length > 0 && (
                <Chip 
                  label={`${selected.length} selected`} 
                  size="small" 
                  sx={{ backgroundColor: '#e0e0e0', color: '#050505' }} 
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateEvent}
                sx={{
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  }
                }}
              >
                Add Event
              </Button>
              {selected.length > 0 && onBulkDeactivate && (
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={onBulkDeactivate}
                >
                  Bulk Actions ({selected.length})
                </Button>
              )}
            </Box>
          </Toolbar>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={8}>
              <CircularProgress size={40} />
              <Typography variant="body1" sx={{ ml: 2, color: '#666' }}>
                Loading events...
              </Typography>
            </Box>
          ) : events.length === 0 ? (
            <Box display="flex" flex-direction="column" justifyContent="center" alignItems="center" p={8}>
              <EventIcon sx={{ fontSize: '4rem', color: '#ccc', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                No Events Found
              </Typography>
              {/* <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', mb: 3 }}>
                Get started by adding your first event to the system.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onCreate}
              >
                Add First Event
              </Button> */}
            </Box>
          ) : (
            <TableView
              data={events}
              columns={columns}
              idField="EventID"
              selected={selected}
              onSelectClick={onSelectClick}
              onSelectAllClick={onSelectAllClick}
              showSelection={true}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddNote={onAddNote}
              onAddAttachment={onAddAttachment}
              onAssignUser={onAssignUser}
              formatters={eventFormatters}
              tooltips={tooltips}
              entityType="events"
              menuItems={getMenuItems}
            />
          )}

          <Box sx={{ 
            p: 2, 
            borderTop: '1px solid #e5e5e5', 
            backgroundColor: '#fafafa', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Typography variant="body2" sx={{ color: '#666666' }}>
              {events.length === 0 ? 'No events' : 
               events.length === 1 ? 'Showing 1 event' : 
               `Showing ${events.length} events`}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              {selected.length > 0 && (
                <Typography variant="body2" sx={{ color: '#050505', fontWeight: 500 }}>
                  {selected.length} selected
                </Typography>
              )}
              {weeklyEventsCount > 0 && (
                <Typography variant="body2" sx={{ color: '#666666' }}>
                  {weeklyEventsCount} recurring events
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Status Snackbar */}
        <Snackbar
          open={!!statusMessage}
          autoHideDuration={4000}
          onClose={() => setStatusMessage && setStatusMessage('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setStatusMessage && setStatusMessage('')} 
            severity={statusSeverity || 'info'} 
            sx={{ width: '100%' }}
          >
            {statusMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default EventsPage;