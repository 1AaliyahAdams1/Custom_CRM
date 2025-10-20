import React, { useEffect, useState, useCallback, useMemo, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Alert, Typography, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";
import { getTeamById, updateTeam, deleteTeam } from "../../services/teamService";
import { getAllActivities } from "../../services/activityService";
import { getAllNotes } from "../../services/noteService";
import { getAllAttachments } from "../../services/attachmentService";
import { AuthContext } from '../../context/auth/authContext';
import { formatters } from '../../utils/formatters';

// Import service objects from dropdownServices
import {
  departmentService,
} from '../../services/dropdownServices';

export default function TeamDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  
  const idRef = useRef(id);
  const navigateRef = useRef(navigate);

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    idRef.current = id;
    navigateRef.current = navigate;
  }, [id, navigate]);

  const refreshTeam = useCallback(async () => {
    if (!idRef.current) return;
    try {
      setLoading(true);
      const teamId = parseInt(idRef.current, 10);
      if (isNaN(teamId)) {
        throw new Error('Invalid team ID');
      }
      
      const data = await getTeamById(teamId);
      setTeam(data?.data || data);
    } catch (err) {
      console.error(err);
      setError("Failed to load team details");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) {
      setError("No team ID provided");
      setLoading(false);
      return;
    }
    refreshTeam();
  }, [id, refreshTeam]);

  const handleBack = useCallback(() => {
    navigateRef.current("/teams");
  }, []);

  // Define main fields
  const mainFields = useMemo(() => [
    { key: 'TeamName', label: 'Team Name', type: 'text', required: true },
    { key: 'Description', label: 'Description', type: 'textarea' },
    { 
      key: 'DepartmentID', 
      label: 'Department', 
      type: 'dropdown',
      optionsService: departmentService,
      displayField: 'DepartmentName',
      valueField: 'DepartmentID',
      required: true 
    },
    { key: 'Active', label: 'Active Status', type: 'boolean' },
    { key: 'CreatedAt', label: 'Created At', type: 'datetime' },
    { key: 'UpdatedAt', label: 'Updated At', type: 'datetime' },
  ], []);

  // Real API data services with client-side filtering
  const createFilteredDataService = useCallback((serviceFunction, filterField) => {
    return async () => {
      try {
        const response = await serviceFunction();
        const allData = response?.data || response;
        const teamId = parseInt(idRef.current, 10);
        
        const filteredData = allData.filter(item => 
          item[filterField] === teamId
        );
        
        return { data: filteredData };
      } catch (error) {
        console.error('Error fetching and filtering data:', error);
        throw error;
      }
    };
  }, []);

  const createAttachmentDataService = useCallback(() => {
    return async () => {
      try {
        const response = await getAllAttachments();
        const allData = response?.data || response;
        const teamId = parseInt(idRef.current, 10);
        
        // Filter attachments where EntityID = teamId AND EntityTypeID = Team type
        const TEAM_ENTITY_TYPE_ID = 5; // Adjust based on your EntityType IDs
        
        const filteredData = allData.filter(item => 
          item.EntityID === teamId && item.EntityTypeID === TEAM_ENTITY_TYPE_ID
        );
        
        return { data: filteredData };
      } catch (error) {
        console.error('Error fetching and filtering attachments:', error);
        throw error;
      }
    };
  }, []);

  // Define related tabs with real API calls
  const relatedTabs = useMemo(() => {
    const tabs = [
      {
        key: 'employees',
        label: 'Team Members',
        entityType: 'employee',
        tableConfig: {
          idField: 'EmployeeID',
          columns: [
            { 
              field: 'EmployeeName', 
              headerName: 'Name', 
              type: 'clickable', 
              defaultVisible: true,
            },
            { field: 'EmployeeEmail', headerName: 'Email', type: 'email', defaultVisible: true },
            { field: 'EmployeePhone', headerName: 'Phone', type: 'phone', defaultVisible: true },
            { field: 'JobTitleName', headerName: 'Job Title', type: 'text', defaultVisible: true },
            { field: 'DepartmentName', headerName: 'Department', type: 'text', defaultVisible: true },
            { field: 'HireDate', headerName: 'Hire Date', type: 'date', defaultVisible: true },
            { field: 'CreatedAt', headerName: 'Created', type: 'dateTime', defaultVisible: false },
            { field: 'UpdatedAt', headerName: 'Updated', type: 'dateTime', defaultVisible: false },
            {
              field: 'Active',
              headerName: 'Active',
              type: 'chip',
              chipLabels: { true: 'Active', false: 'Inactive' },
              chipColors: { true: '#079141ff', false: '#999999' },
              defaultVisible: true,
            }
          ]
        },
        dataService: createFilteredDataService(async () => {
          // Fetch employees filtered by team
          const response = await fetch(`/api/employees/team/${idRef.current}`);
          if (!response.ok) throw new Error('Failed to fetch team employees');
          return response.json();
        }, 'TeamID')
      },
      {
        key: 'activities',
        label: 'Activities',
        entityType: 'activity',
        tableConfig: {
          idField: 'ActivityID',
          columns: [
            { field: 'ActivityType', headerName: 'Activity Type', type: 'text', defaultVisible: true },
            { field: 'Subject', headerName: 'Subject', type: 'text', defaultVisible: true },
            { field: 'PriorityLevelName', headerName: 'Priority', type: 'text', defaultVisible: true },
            { field: 'DueToStart', headerName: 'Due Start', type: 'date', defaultVisible: true },
            { field: 'DueToEnd', headerName: 'Due End', type: 'date', defaultVisible: true },
            { field: 'Completed', headerName: 'Completed', type: 'boolean', defaultVisible: true },
            { field: 'Active', headerName: 'Active', type: 'boolean', defaultVisible: true },
          ]
        },
        dataService: async () => {
          try {
            const teamData = await getTeamById(parseInt(idRef.current, 10));
            const currentTeam = teamData?.data || teamData;
            
            if (!currentTeam?.TeamName) {
              console.error('No team name found');
              return { data: [] };
            }
            
            const response = await getAllActivities();
            const allData = response?.data || response;
            
            const filteredData = allData.filter(item => 
              item.TeamName === currentTeam.TeamName
            );
            
            return { data: filteredData };
          } catch (error) {
            console.error('Error fetching activities:', error);
            return { data: [] };
          }
        }
      },
      {
        key: 'notes',
        label: 'Notes',
        entityType: 'note',
        tableConfig: {
          idField: 'NoteID',
          columns: [
            { field: 'Content', headerName: 'Content', type: 'truncated', maxWidth: 400, defaultVisible: true },
            { field: 'EntityID', headerName: 'Entity ID', type: 'text', defaultVisible: true },
            { field: 'EntityTypeID', headerName: 'Entity Type', type: 'text', defaultVisible: true },
            { field: 'CreatedAt', headerName: 'Created', type: 'dateTime', defaultVisible: true }
          ]
        },
        dataService: createFilteredDataService(getAllNotes, 'EntityID')
      },
      {
        key: 'attachments',
        label: 'Attachments',
        entityType: 'attachment',
        tableConfig: {
          idField: 'AttachmentID',
          columns: [
            { field: 'FileName', headerName: 'File Name', type: 'text', defaultVisible: true },
            { field: 'FileType', headerName: 'Type', type: 'text', defaultVisible: true },
            { field: 'FileSize', headerName: 'Size', type: 'text', defaultVisible: true },
            { field: 'UploadedByFirstName', headerName: 'Uploaded By', type: 'text', defaultVisible: true },
            { field: 'UploadedAt', headerName: 'Uploaded', type: 'dateTime', defaultVisible: true },
          ]
        },
        dataService: createAttachmentDataService(),
      },
    ];
    return tabs;
  }, [createFilteredDataService, createAttachmentDataService]);

  // Action handlers
  const relatedDataActions = useMemo(() => {
    const actions = {
      employee: {
        view: (employee) => navigateRef.current(`/employees/${employee.EmployeeID}`),
        edit: (employee) => navigateRef.current(`/employees/${employee.EmployeeID}/edit`),
        delete: async (employee) => {
          console.log('Delete employee:', employee);
        },
        addNote: (employee) => {
          console.log('Add note to employee:', employee);
        },
        addAttachment: (employee) => {
          console.log('Add attachment to employee:', employee);
        }
      },
      activity: {
        view: (activity) => navigateRef.current(`/activities/${activity.ActivityID}`),
        edit: (activity) => navigateRef.current(`/activities/${activity.ActivityID}/edit`),
        delete: async (activity) => {
          console.log('Delete activity:', activity);
        },
        addNote: (activity) => {
          console.log('Add note to activity:', activity);
        },
        addAttachment: (activity) => {
          console.log('Add attachment to activity:', activity);
        }
      },
      note: {
        view: (note) => {
          console.log('View note:', note);
        },
        edit: (note) => {
          console.log('Edit note:', note);
        },
        delete: async (note) => {
          console.log('Delete note:', note);
        }
      },
      attachment: {
        view: (attachment) => {
          console.log('View attachment:', attachment);
        },
        delete: async (attachment) => {
          console.log('Delete attachment:', attachment);
        }
      }
    };
    return actions;
  }, []);

  // Header chips 
  const headerChips = useMemo(() => {
    if (!team) return [];
    
    const chips = [];
    
    chips.push({
      label: team.Active ? 'Active' : 'Inactive',
      color: team.Active ? '#079141ff' : '#999999',
      textColor: '#ffffff'
    });
    
    if (team.DepartmentName) {
      chips.push({
        label: team.DepartmentName,
        color: '#2196f3',
        textColor: '#ffffff'
      });
    }
    
    return chips;
  }, [team]);

  // Event handlers
  const handleSave = useCallback(async (formData) => {
    try {
      if (!user?.UserID) {
        setError('You must be logged in to update a team');
        return;
      }

      console.log('Saving team data:', formData);
      
      const dataToSend = {
        TeamName: formData.TeamName,
        Description: formData.Description || null,
        DepartmentID: formData.DepartmentID,
        Active: formData.Active !== undefined ? formData.Active : true,
      };
      
      console.log('Cleaned data to send:', dataToSend);
      
      const teamId = parseInt(idRef.current, 10);
      const changedBy = user.UserID;
      const actionTypeId = 2;
      
      await updateTeam(teamId, dataToSend, changedBy, actionTypeId);
      setSuccessMessage('Team updated successfully');
      await refreshTeam();
    } catch (err) {
      console.error('Error updating team:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || err.message || 'Failed to update team');
      throw err;
    }
  }, [refreshTeam, user]); 

  const handleDelete = useCallback(async (formData) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await deleteTeam(parseInt(idRef.current, 10));
        navigateRef.current('/teams');
      } catch (err) {
        console.error('Error deleting team:', err);
        setError('Failed to delete team');
        throw err;
      }
    }
  }, []);

  const handleRefreshRelatedData = useCallback((tabKey) => {
    console.log('Refresh tab data:', tabKey);
  }, []);

  const handleAddNote = useCallback((item) => {
    console.log('Add note to team:', item);
  }, []);

  const handleAddAttachment = useCallback((item) => {
    console.log('Add attachment to team:', item);
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        width: "100%", 
        p: 2, 
        backgroundColor: theme.palette.background.default, 
        minHeight: "100vh",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2, color: theme.palette.text.secondary }}>
          Loading team details...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        width: "100%", 
        p: 2, 
        backgroundColor: theme.palette.background.default, 
        minHeight: "100vh" 
      }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!team) {
    return (
      <Box sx={{ 
        width: "100%", 
        p: 2, 
        backgroundColor: theme.palette.background.default, 
        minHeight: "100vh" 
      }}>
        <Alert severity="warning">Team not found.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: "100%", 
      p: 2, 
      backgroundColor: theme.palette.background.default, 
      minHeight: "100vh" 
    }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}
      
      <UniversalDetailView
        title={team.TeamName || 'Team Details'}
        subtitle={team.Description || `Team ID: ${team.TeamID}`}
        item={team}
        mainFields={mainFields}
        relatedTabs={relatedTabs}
        onBack={handleBack}
        onSave={handleSave}
        onDelete={handleDelete}
        onAddNote={handleAddNote}
        onAddAttachment={handleAddAttachment}
        loading={loading}
        error={error}
        headerChips={headerChips}
        entityType="team"
        relatedDataActions={relatedDataActions}
        onRefreshRelatedData={handleRefreshRelatedData}
      />
    </Box>
  );
}