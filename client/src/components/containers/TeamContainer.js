import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAllTeams,
  deactivateTeam,
  reactivateTeam,
} from "../../services/teamService";

import {
  getAllCities
} from "../../services/cityService";

import {
  getAllEmployees
} from "../../services/employeeService";

import TeamsPage from "../../pages/TeamManagement/TeamPage";


const TeamsContainer = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [selected, setSelected] = useState([]);

  // Fetch teams on mount
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all data in parallel
      const [teamsData, cities, users] = await Promise.all([
        getAllTeams(),
        getAllCities(),
        getAllEmployees()
      ]);

      console.log("Total teams fetched:", teamsData.length);
      console.log("All team names:", teamsData.map(t => t.TeamName));

      // Enrich team data with names (in case JOIN didn't work)
      const enrichedTeams = teamsData.map(team => ({
        ...team,
        ManagerName: team.ManagerName || users.find(u => u.UserID === team.ManagerID)?.FirstName + ' ' + users.find(u => u.UserID === team.ManagerID)?.LastName || 'N/A',
        CityName: team.CityName || cities.find(c => c.CityID === team.CityID)?.CityName || 'N/A',
        MemberCount: team.MemberCount || 0
      }));

      console.log("Enriched teams sample:", enrichedTeams[0]);

      setTeams(enrichedTeams);
    } catch (err) {
      setError("Failed to load teams. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate("/teams/create");
  };

  const handleView = (team) => {
    // Navigate to team details page (with members)
    navigate(`/teams/${team.TeamID}`);
  };

  const handleEdit = (team) => {
    // Navigate to edit page with team data
    navigate(`/teams/edit/${team.TeamID}`, { 
      state: { team } 
    });
  };

  const handleDeactivate = async (team) => {
    if (window.confirm(`Are you sure you want to deactivate ${team.TeamName}?`)) {
      try {
        await deactivateTeam(team.TeamID);
        setSuccessMessage(`${team.TeamName} has been deactivated.`);
        fetchTeams();
      } catch (err) {
        setError("Failed to deactivate team.");
        console.error(err);
      }
    }
  };

  const handleReactivate = async (team) => {
    if (window.confirm(`Are you sure you want to reactivate ${team.TeamName}?`)) {
      try {
        await reactivateTeam(team.TeamID);
        setSuccessMessage(`${team.TeamName} has been reactivated.`);
        fetchTeams();
      } catch (err) {
        setError("Failed to reactivate team.");
        console.error(err);
      }
    }
  };

  const handleAddNote = (team) => {
    // TODO: Implement note functionality
    console.log("Add note for team:", team);
    // You might want to open a modal or navigate to a notes page
  };

  const handleAddAttachment = (team) => {
    // TODO: Implement attachment functionality
    console.log("Add attachment for team:", team);
    // You might want to open a file upload modal
  };

  const handleFilterChange = async (filterType) => {
    setLoading(true);
    try {
      // Fetch all data again
      const [teamsData, cities, users] = await Promise.all([
        getAllTeams(),
        getAllCities(),
        getAllEmployees()
      ]);

      // Enrich team data
      const enrichedTeams = teamsData.map(team => ({
        ...team,
        ManagerName: team.ManagerName || users.find(u => u.UserID === team.ManagerID)?.FirstName + ' ' + users.find(u => u.UserID === team.ManagerID)?.LastName || 'N/A',
        CityName: team.CityName || cities.find(c => c.CityID === team.CityID)?.CityName || 'N/A',
        MemberCount: team.MemberCount || 0
      }));

      // Apply filter logic
      let filtered = enrichedTeams;
      if (filterType === "active") {
        filtered = enrichedTeams.filter(team => team.Active === true);
      } else if (filterType === "inactive") {
        filtered = enrichedTeams.filter(team => team.Active === false);
      } else if (filterType === "myTeams") {
        // TODO: Filter teams where current user is manager or member
        // You'll need to get current user ID from context/auth
        // const currentUserId = getCurrentUserId();
        // filtered = enrichedTeams.filter(team => team.ManagerID === currentUserId);
        filtered = enrichedTeams; // Placeholder
      }
      
      setTeams(filtered);
    } catch (err) {
      setError("Failed to filter teams.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClick = (id) => {
    setSelected(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAllClick = (checked) => {
    if (checked) {
      setSelected(teams.map(team => team.TeamID));
    } else {
      setSelected([]);
    }
  };

  return (
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
      onFilterChange={handleFilterChange}
      onDeactivate={handleDeactivate}
      onReactivate={handleReactivate}
      onEdit={handleEdit}
      onView={handleView}
      onCreate={handleCreate}
      onAddNote={handleAddNote}
      onAddAttachment={handleAddAttachment}
    />
  );
};

export default TeamsContainer;