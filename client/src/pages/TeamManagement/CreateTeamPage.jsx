import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  MenuItem,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import { ArrowBack, Save, Close, Clear, Add, Delete } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { createTeam, addTeamMember } from "../../services/teamService";
import { AuthContext } from '../../context/auth/authContext';
import { employeeService } from '../../services/dropdownServices';
import SmartDropdown from '../../components/SmartDropdown';

const CreateTeamPage = () => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    TeamName: '',
    ManagerID: '',
  });

  const [teamMembers, setTeamMembers] = useState([
    { UserID: '', name: '' }
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index][field] = value;
    setTeamMembers(updatedMembers);
  };

  const handleAddMember = () => {
    setTeamMembers([...teamMembers, { UserID: '', name: '' }]);
  };

  const handleRemoveMember = (index) => {
    const updatedMembers = teamMembers.filter((_, i) => i !== index);
    setTeamMembers(updatedMembers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to create a team');
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

      // Step 1: Create the team
      const teamResponse = await createTeam({
        TeamName: formData.TeamName,
        ManagerID: formData.ManagerID,
      });

      const newTeamId = teamResponse.TeamID;

      // Step 2: Add team members if any are selected
      const membersToAdd = teamMembers.filter(member => member.UserID);
      
      if (membersToAdd.length > 0) {
        for (const member of membersToAdd) {
          await addTeamMember({
            TeamID: newTeamId,
            UserID: member.UserID,
          });
        }
      }

      setSuccessMessage('Team created successfully!');

      setTimeout(() => {
        navigate('/teams');
      }, 1500);

    } catch (err) {
      console.error('Full error object:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to create team');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate(-1);
    }
  };

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
              Create New Team
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
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
              {isSubmitting ? 'Saving...' : 'Save Team'}
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
                />
              </Box>

              {/* Team Members Section Header */}
              <Box sx={{ gridColumn: '1 / -1', mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    mb: 1
                  }}>
                    Team Members (Optional)
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Add />}
                    onClick={handleAddMember}
                    disabled={isSubmitting}
                  >
                    Add Member
                  </Button>
                </Box>
              </Box>

              {/* Team Members List */}
              <Box sx={{ gridColumn: '1 / -1' }}>
                {teamMembers.map((member, index) => (
                  <Box key={index} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr auto', sm: '1fr auto' }, gap: 2, mb: 2, alignItems: 'flex-start' }}>
                    <Box>
                      <SmartDropdown
                        label={`Team Member ${index + 1}`}
                        name={`member-${index}`}
                        value={member.UserID}
                        onChange={(e) => handleMemberChange(index, 'UserID', e.target.value)}
                        service={employeeService}
                        displayField="EmployeeName"
                        valueField="UserID"
                        placeholder="Search for team member..."
                        disabled={isSubmitting}
                      />
                    </Box>
                    {index > 0 && (
                      <Tooltip title="Remove member">
                        <IconButton
                          onClick={() => handleRemoveMember(index)}
                          disabled={isSubmitting}
                          sx={{ mt: 1 }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    )}
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

export default CreateTeamPage;