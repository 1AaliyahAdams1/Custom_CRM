import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Alert,
  CircularProgress,
  MenuItem,
  IconButton,
  Tooltip,
} from "@mui/material";
import { ArrowBack, Save, Clear, Add, Delete } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { getTeamById, updateTeam, getTeamMembers, addTeamMember, removeTeamMember } from "../../services/teamService";
import { AuthContext } from '../../context/auth/authContext';
import { employeeService } from '../../services/dropdownServices';
import SmartDropdown from '../../components/SmartDropdown';

const EditTeamPage = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    TeamName: '',
    ManagerID: '',
    Active: true,
  });

  const [existingMembers, setExistingMembers] = useState([]);
  const [newMembers, setNewMembers] = useState([]);
  const [membersToRemove, setMembersToRemove] = useState([]);

  // Fetch team data on component mount
  useEffect(() => {
    const fetchTeam = async () => {
      if (!id) {
        setError("No team ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const teamId = parseInt(id, 10);
        
        if (isNaN(teamId)) {
          throw new Error('Invalid team ID');
        }
        
        const response = await getTeamById(teamId);
        const teamData = response?.data || response;
        
        if (!teamData) {
          throw new Error('Team not found');
        }

        // Populate form with existing data
        setFormData({
          TeamName: teamData.TeamName || '',
          ManagerID: teamData.ManagerID || '',
          Active: teamData.Active !== undefined ? teamData.Active : true,
        });

        // Fetch team members
        const membersResponse = await getTeamMembers(teamId);
        const members = membersResponse?.data || membersResponse || [];
        setExistingMembers(members);
        
      } catch (err) {
        console.error('Error fetching team:', err);
        setError(err.message || 'Failed to load team details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeam();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddNewMember = () => {
    setNewMembers([...newMembers, { UserID: '', tempId: Date.now() }]);
  };

  const handleNewMemberChange = (tempId, value) => {
    setNewMembers(prev => 
      prev.map(member => 
        member.tempId === tempId ? { ...member, UserID: value } : member
      )
    );
  };

  const handleRemoveNewMember = (tempId) => {
    setNewMembers(prev => prev.filter(member => member.tempId !== tempId));
  };

  const handleRemoveExistingMember = (userId) => {
    if (window.confirm('Are you sure you want to remove this member from the team?')) {
      setMembersToRemove(prev => [...prev, userId]);
      setExistingMembers(prev => prev.filter(member => member.UserID !== userId));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to update a team');
      return;
    }

    if (!formData.TeamName.trim()) {
      setError('Team name is required');
      return;
    }

    if (!formData.ManagerID) {
      setError('Manager is required');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const userId = user.UserID;
      
      if (!userId) {
        throw new Error('Could not find user ID in user object');
      }
      
      const teamId = parseInt(id, 10);
      
      // Step 1: Update team basic info
      const dataToSubmit = {
        TeamName: formData.TeamName,
        ManagerID: formData.ManagerID,
        Active: formData.Active,
      };
      
      console.log('Updating team with data:', dataToSubmit);
      
      await updateTeam(teamId, dataToSubmit);

      // Step 2: Remove members marked for removal
      for (const userIdToRemove of membersToRemove) {
        await removeTeamMember({
          TeamID: teamId,
          UserID: userIdToRemove,
        });
      }

      // Step 3: Add new members
      const validNewMembers = newMembers.filter(member => member.UserID);
      for (const member of validNewMembers) {
        await addTeamMember({
          TeamID: teamId,
          UserID: member.UserID,
        });
      }
      
      setSuccessMessage('Team updated successfully!');
      
      setTimeout(() => {
        navigate(`/teams/${teamId}`);
      }, 1500);
      
    } catch (err) {
      console.error('Full error object:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to update team');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate(-1);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        width: '100%', 
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh', 
        p: 3,
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

  return (
    <Box sx={{ 
      width: '100%', 
      backgroundColor: theme.palette.background.default,
      minHeight: '100vh', 
      p: 3 
    }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" sx={{ 
              color: theme.palette.text.primary,
              fontWeight: 600 
            }}>
              Edit Team
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate(`/teams/${id}`)}
              sx={{ minWidth: 'auto' }}
            >
              Back
            </Button>
            <Button
              variant="outlined"
              startIcon={<Clear />}
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        {/* Form */}
        <Paper elevation={0} sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              
              {/* Team Information Section Header */}
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  mb: 1
                }}>
                  Team Information
                </Typography>
              </Box>

              {/* Team Name */}
              <Box>
                <TextField
                  fullWidth
                  label="Team Name"
                  name="TeamName"
                  value={formData.TeamName}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                />
              </Box>

              {/* Manager Dropdown */}
              <Box>
                <SmartDropdown
                  label="Manager"
                  name="ManagerID"
                  value={formData.ManagerID}
                  onChange={handleChange}
                  service={employeeService}
                  displayField="EmployeeName"
                  valueField="UserID"
                  placeholder="Search for manager..."
                  disabled={isSubmitting}
                  required
                />
              </Box>

              {/* Status Section Header */}
              <Box sx={{ gridColumn: '1 / -1', mt: 2 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  mb: 1
                }}>
                  Status
                </Typography>
              </Box>

              {/* Active Status */}
              <Box>
                <TextField
                  fullWidth
                  select
                  label="Active Status"
                  name="Active"
                  value={formData.Active}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  <MenuItem value={true}>Active</MenuItem>
                  <MenuItem value={false}>Inactive</MenuItem>
                </TextField>
              </Box>

              {/* Team Members Section Header */}
              <Box sx={{ gridColumn: '1 / -1', mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 1
                  }}>
                    Team Members
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Add />}
                    onClick={handleAddNewMember}
                    disabled={isSubmitting}
                  >
                    Add Member
                  </Button>
                </Box>
              </Box>

              {/* Existing Team Members */}
              <Box sx={{ gridColumn: '1 / -1' }}>
                {existingMembers.length === 0 && newMembers.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No team members yet. Click "Add Member" to add members to this team.
                  </Typography>
                )}

                {existingMembers.map((member) => (
                  <Box 
                    key={member.UserID} 
                    sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { xs: '1fr auto', sm: '1fr auto' }, 
                      gap: 2, 
                      mb: 2, 
                      alignItems: 'center',
                      p: 2,
                      border: '1px solid',
                      borderColor: theme.palette.divider,
                      borderRadius: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {member.EmployeeName || member.UserName || 'Unknown'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {member.EmployeeEmail || member.UserEmail || ''}
                      </Typography>
                    </Box>
                    <Tooltip title="Remove member">
                      <IconButton
                        onClick={() => handleRemoveExistingMember(member.UserID)}
                        disabled={isSubmitting}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}

                {/* New Members to Add */}
                {newMembers.map((member) => (
                  <Box 
                    key={member.tempId} 
                    sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { xs: '1fr auto', sm: '1fr auto' }, 
                      gap: 2, 
                      mb: 2, 
                      alignItems: 'flex-start' 
                    }}
                  >
                    <Box>
                      <SmartDropdown
                        label="New Team Member"
                        name={`new-member-${member.tempId}`}
                        value={member.UserID}
                        onChange={(e) => handleNewMemberChange(member.tempId, e.target.value)}
                        service={employeeService}
                        displayField="EmployeeName"
                        valueField="UserID"
                        placeholder="Search for team member..."
                        disabled={isSubmitting}
                      />
                    </Box>
                    <Tooltip title="Remove">
                      <IconButton
                        onClick={() => handleRemoveNewMember(member.tempId)}
                        disabled={isSubmitting}
                        sx={{ mt: 1 }}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Box>

            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default EditTeamPage;