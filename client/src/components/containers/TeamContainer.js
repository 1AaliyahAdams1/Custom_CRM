import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import TeamsPage from "../../pages/TeamManagement/TeamPage";
import ConfirmDialog from "../../components/dialogs/ConfirmDialog";
import { 
 getAllTeams,
  updateTeam, 
  addTeamMember 
} from "../../services/teamService";
import { AuthContext } from "../../context/auth/authContext";

export default function TeamsContainer() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [selected, setSelected] = useState([]);
  const [currentFilter, setCurrentFilter] = useState("all");
  
  // Confirm dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [teamToAction, setTeamToAction] = useState(null);

  // Fetch teams
  const fetchTeams = async (filter = "all") => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllTeams();
      let data = response?.data || response || [];
      
      // Apply filters
      if (filter === "active") {
        data = data.filter(team => team.Active === true);
      } else if (filter === "inactive") {
        data = data.filter(team => team.Active === false);
      } else if (filter === "myTeams" && user?.UserID) {
        data = data.filter(team => team.OwnerID === user.UserID);
      }
      
      setTeams(data);
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError(err.message || "Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams(currentFilter);
  }, [currentFilter, user]);

  // Selection handlers
  const handleSelectClick = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(teams.map(team => team.TeamID));
    } else {
      setSelected([]);
    }
  };

  // Filter handler
  const handleFilterChange = (filter) => {
    setCurrentFilter(filter);
    setSelected([]);
  };

  // View team details
  const handleView = (team) => {
    navigate(`/teams/${team.TeamID}`);
  };

  // Edit team
 const handleEdit = (team) => {
  navigate(`/teams/edit/${team.TeamID}`);
};

  // Create team
  const handleCreate = () => {
    navigate('/teams/new');
  };

  // Deactivate team - open confirm dialog
  const handleDeactivate = (team) => {
    setTeamToAction(team);
    setConfirmAction('deactivate');
    setConfirmDialogOpen(true);
  };

  // Reactivate team - open confirm dialog
  const handleReactivate = (team) => {
    setTeamToAction(team);
    setConfirmAction('reactivate');
    setConfirmDialogOpen(true);
  };

  // Confirm action handler
  const handleConfirmAction = async () => {
    if (!user?.UserID) {
      setError('You must be logged in to perform this action');
      setConfirmDialogOpen(false);
      return;
    }

    try {
      const teamId = teamToAction.TeamID;
      const changedBy = user.UserID;
      const actionTypeId = 2; // Update action

      if (confirmAction === 'deactivate') {
        // Deactivate the team
        await updateTeam(teamId, { Active: false }, changedBy, actionTypeId);
        setSuccessMessage(`Team "${teamToAction.TeamName}" has been deactivated successfully`);
      } else if (confirmAction === 'reactivate') {
        // Reactivate the team
        await updateTeam(teamId, { Active: true }, changedBy, actionTypeId);
        setSuccessMessage(`Team "${teamToAction.TeamName}" has been reactivated successfully`);
      }

      // Refresh teams list
      await fetchTeams(currentFilter);
      
      // Clear selection if the team was selected
      setSelected(prev => prev.filter(id => id !== teamId));
      
    } catch (err) {
      console.error('Error performing action:', err);
      setError(err.response?.data?.error || err.message || 'Failed to perform action');
    } finally {
      setConfirmDialogOpen(false);
      setTeamToAction(null);
      setConfirmAction(null);
    }
  };

  // Cancel confirmation
  const handleCancelConfirm = () => {
    setConfirmDialogOpen(false);
    setTeamToAction(null);
    setConfirmAction(null);
  };

  // Get confirmation dialog content
  const getConfirmDialogContent = () => {
    if (confirmAction === 'deactivate') {
      return {
        title: 'Deactivate Team',
        description: `Are you sure you want to deactivate "${teamToAction?.TeamName}"? This team will no longer be active in the system.`
      };
    } else if (confirmAction === 'reactivate') {
      return {
        title: 'Reactivate Team',
        description: `Are you sure you want to reactivate "${teamToAction?.TeamName}"? This team will become active again.`
      };
    }
    return { title: '', description: '' };
  };

  const confirmContent = getConfirmDialogContent();

   // Add member handler
 const handleAddMember = async (employeeId, team) => {
    try {
      if (!user?.UserID) {
        setError('You must be logged in to add members');
        return;
      }

      console.log('Adding member - EmployeeID:', employeeId, 'Team:', team);
      
      // Ensure we have both required pieces of data
      if (!employeeId) {
        throw new Error('Employee ID is required');
      }
      
      if (!team?.TeamID) {
        throw new Error('Team ID is required');
      }

      // Create the member data object with UserID
      const memberData = {
        TeamID: team.TeamID,
        EmployeeID: employeeId,
        UserID: user.UserID, // Add the current user's ID
        ActionTypeID: 1, // Create action
      };

      console.log('Sending member data:', memberData);
      await addTeamMember(memberData);
      setSuccessMessage(`Member added to "${team.TeamName}" successfully`);
      await fetchTeams(currentFilter);
    } catch (err) {
      console.error('Error adding team member:', err);
      setError(err.response?.data?.error || err.message || 'Failed to add team member');
      throw err;
    }
  };

  return (
    <>
      <TeamsPage
        teams={teams}
        loading={loading}
        error={error}
        successMessage={successMessage}
        setSuccessMessage={setSuccessMessage}
        setError={setError}
        selected={selected}
        onSelectClick={handleSelectClick}
        onSelectAllClick={handleSelectAllClick}
        onDeactivate={handleDeactivate}
        onReactivate={handleReactivate}
        onEdit={handleEdit}
        onView={handleView}
        onCreate={handleCreate}
        onAddMember={handleAddMember}
        onFilterChange={handleFilterChange}
        userRoles={user?.roles || []}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        title={confirmContent.title}
        description={confirmContent.description}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelConfirm}
      />
    </>
  );
}