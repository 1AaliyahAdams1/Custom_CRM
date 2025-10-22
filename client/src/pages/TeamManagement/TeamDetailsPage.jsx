import React, { useEffect, useState, useCallback, useMemo, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Alert, Typography, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { PersonAdd } from "@mui/icons-material";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";
import { 
  getTeamById, 
  updateTeam, 
  deleteTeam,
  getTeamMembers,
  addTeamMember 
} from "../../services/teamService";
import { getAllAttachments } from "../../services/attachmentService";
import { AuthContext } from '../../context/auth/authContext';
import { formatters } from '../../utils/formatters';
import AddMemberDialog from "../../components/dialogs/AddMemberDialog";
import {
  departmentService,
  employeeService,
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
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);

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

  const handleAddMemberClick = useCallback(() => {
    setShowAddMemberDialog(true);
  }, []);

  const customActions = useMemo(() => [
    {
      label: 'Add Member',
      onClick: handleAddMemberClick,
      icon: <PersonAdd />,
      variant: 'outlined',
      color: 'primary'
    }
  ], [handleAddMemberClick]);

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

  const relatedTabs = useMemo(() => {
    const tabs = [
      {
        key: 'members',
        label: 'Team Members',
        entityType: 'member',
        disableActions: true,
        hideActions: true,
        showSelection: false, 
        enableAdd: true,
        addButtonLabel: 'Add Member',
        addFormFields: [
          {
            key: 'EmployeeID',
            label: 'Employee',
            type: 'dropdown',
            optionsService: employeeService,
            displayField: 'FullName',
            valueField: 'EmployeeID',
            required: true
          },
          {
            key: 'Active',
            label: 'Active',
            type: 'boolean',
            defaultValue: true
          }
        ],
        tableConfig: {
          idField: 'TeamMemberID',
          hideActionColumn: true, 
          columns: [
            { 
              field: 'EmployeeName', 
              headerName: 'Employee Name', 
              type: 'text', 
              defaultVisible: true,
            },
            { 
              field: 'UserName', 
              headerName: 'Name', 
              type: 'text', 
              defaultVisible: true,
            },
            { 
              field: 'UserEmail', 
              headerName: 'Email', 
              type: 'email', 
              defaultVisible: true,
            },
            { field: 'JoinedAt', headerName: 'Joined Date', type: 'dateTime', defaultVisible: true },
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
        dataService: async () => {
          try {
            const teamId = parseInt(idRef.current, 10);
            const response = await getTeamMembers(teamId);
            return { data: response?.data || response };
          } catch (error) {
            console.error('Error fetching team members:', error);
            throw error;
          }
        }
      },
    ];
    return tabs;
  }, []);

  const relatedDataActions = useMemo(() => {
    const actions = {
      members: {
        add: async (formData) => {
          try {
            const teamId = parseInt(idRef.current, 10);
            
            const dataToSend = {
              TeamID: teamId,
              EmployeeID: formData.EmployeeID,
              Active: formData.Active !== undefined ? formData.Active : true,
            };
            
            await addTeamMember(dataToSend);
            setSuccessMessage('Team member added successfully');
            
            return { success: true, refresh: true };
          } catch (err) {
            console.error('Error adding team member:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Failed to add team member';
            setError(errorMessage);
            throw new Error(errorMessage);
          }
        }
      }
    };
    return actions;
  }, []);

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

  
const handleAddMember = useCallback(async (memberData) => {
  try {
    console.log('Adding team member:', memberData);
    
    // Call addTeamMember with the correct structure
    await addTeamMember(memberData);
    
    // Refresh the team data to show the new member
    await refreshTeam();
    
    // Close the dialog
    setShowAddMemberDialog(false);
    
    // Show success message
    setSuccessMessage('Member added successfully');
  } catch (error) {
    console.error('Error adding team member:', error);
    // The error will be shown in the dialog
    throw error;
  }
}, [refreshTeam]);
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
        onRefreshRelatedData={handleRefreshRelatedData}
        relatedDataActions={relatedDataActions} 
        customActions={customActions}
      />

      <AddMemberDialog
        open={showAddMemberDialog}
        onClose={() => setShowAddMemberDialog(false)}
        onAddMember={handleAddMember}
        menuRow={team}
      />
    </Box>
  );
}