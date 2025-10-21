const teamService = require('../services/teamService');

//======================================
// Get all teams
//======================================
const getAllTeams = async (req, res) => {
    try {
        const data = await teamService.getAllTeams();
        res.status(200).json(data);
    }
    catch (err) {
        console.error("Error in getAllTeams controller:", err);
        res.status(500).json({ error: err.message });
    }
};

//======================================
// Get team by ID
//======================================
const getTeamById = async (req, res) => {
    const teamId = req.params.id;
    try {
        const data = await teamService.getTeamById(teamId);
        if (!data) {
            return res.status(404).json({ error: "Team not found" });
        }
        res.status(200).json(data);
    }
    catch (err) {
        console.error("Error in getTeamById controller:", err);
        res.status(500).json({ error: err.message });
    }
};

//======================================
// Create a new team
//======================================
const createTeam = async (req, res) => {
    try {
        const { data, changedBy, actionTypeId, loggedInUserId } = req.body;
        
        if (!data) {
            return res.status(400).json({ error: "Request data is required" });
        }

        const { TeamName, ManagerID } = data;

        if (!TeamName) {
            return res.status(400).json({ error: "Team name is required" });
        }
        if (!ManagerID) {
            return res.status(400).json({ error: "Manager ID is required" });
        }

        const newTeam = await teamService.createTeam({
            TeamName,
            ManagerID
        });
        
        res.status(201).json(newTeam);
    }
    catch (err) {
        console.error("Error in createTeam controller:", err);
        res.status(500).json({ error: err.message });
    }
};

//======================================
// Update an existing team
//======================================
const updateTeam = async (req, res) => {
    const teamId = req.params.id;
    
    try {
        const { data } = req.body;
        
        if (!data) {
            return res.status(400).json({ error: "Request data is required" });
        }

        const { TeamName, ManagerID, Active } = data;

        if (!TeamName) {
            return res.status(400).json({ error: "Team name is required" });
        }
        if (ManagerID === undefined) {
            return res.status(400).json({ error: "Manager ID is required" });
        }

        const updatedTeam = await teamService.updateTeam(teamId, {
            TeamName,
            ManagerID,
            Active: Active !== undefined ? Active : 1
        });

        if (!updatedTeam) {
            return res.status(404).json({ error: "Team not found" });
        }
        
        res.status(200).json(updatedTeam);
    }
    catch (err) {
        console.error("Error in updateTeam controller:", err);
        res.status(500).json({ error: err.message });
    }
};

//======================================
// Deactivate a team
//======================================
const deactivateTeam = async (req, res) => {
    const teamId = req.params.id;
    try {
        const result = await teamService.deactivateTeam(teamId);
        if (!result) {
            return res.status(404).json({ error: "Team not found" });
        }
        res.status(200).json({ message: "Team deactivated successfully" });
    }
    catch (err) {
        console.error("Error in deactivateTeam controller:", err);
        res.status(500).json({ error: err.message });
    }
};

//======================================
// Reactivate a team
//======================================
const reactivateTeam = async (req, res) => {
    const teamId = req.params.id;
    try {
        const result = await teamService.reactivateTeam(teamId);
        if (!result) {
            return res.status(404).json({ error: "Team not found" });
        }
        res.status(200).json({ message: "Team reactivated successfully" });
    }
    catch (err) {
        console.error("Error in reactivateTeam controller:", err);
        res.status(500).json({ error: err.message });
    }
};

//======================================
// Get team members
//======================================
const getTeamMembers = async (req, res) => {
    const teamId = req.params.id;
    try {
        const members = await teamService.getTeamMembers(teamId);
        res.status(200).json(members);
    }
    catch (err) {
        console.error("Error in getTeamMembers controller:", err);
        res.status(500).json({ error: err.message });
    }
};

//======================================
// Add team member
//======================================
const addTeamMember = async (req, res) => {
    const teamId = req.params.id;
    const { userId } = req.body;
    
    try {
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const result = await teamService.addTeamMember(teamId, userId);
        res.status(201).json({ message: "Member added successfully", TeamMemberID: result });
    }
    catch (err) {
        console.error("Error in addTeamMember controller:", err);
        res.status(500).json({ error: err.message });
    }
};

//======================================
// Remove team member
//======================================
const removeTeamMember = async (req, res) => {
    const teamId = req.params.id;
    const userId = req.params.userId;
    
    try {
        const result = await teamService.removeTeamMember(teamId, userId);
        if (!result) {
            return res.status(404).json({ error: "Team member not found" });
        }
        res.status(200).json({ message: "Member removed successfully" });
    }
    catch (err) {
        console.error("Error in removeTeamMember controller:", err);
        res.status(500).json({ error: err.message });
    }
};

//======================================
// Get team by manager ID
//======================================
const getTeamByManagerId = async (req, res) => {
  try {
    const managerId = req.user?.UserID || req.user?.id || req.params.managerId;
    
    if (!managerId) {
      return res.status(401).json({ error: "Manager ID not found" });
    }
    
    const team = await teamService.getTeamByManagerId(managerId);
    
    if (!team) {
      return res.status(404).json({ error: "No team found for this manager" });
    }
    
    res.status(200).json(team);
  } catch (err) {
    console.error("Error in getTeamByManagerId controller:", err);
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Get team member user IDs
//======================================
const getTeamMemberUserIds = async (req, res) => {
  const teamId = req.params.id;
  try {
    const userIds = await teamService.getTeamMemberUserIds(teamId);
    res.status(200).json(userIds);
  } catch (err) {
    console.error("Error in getTeamMemberUserIds controller:", err);
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Get team member employees (for assignment dropdown)
//======================================
const getTeamMemberEmployees = async (req, res) => {
  const teamId = req.params.id;
  try {
    const employees = await teamService.getTeamMemberEmployeeIds(teamId);
    res.status(200).json(employees);
  } catch (err) {
    console.error("Error in getTeamMemberEmployees controller:", err);
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Get current user's team members (for Sales Managers)
// FIXED: Better error handling and validation
//======================================
const getMyTeamMembers = async (req, res) => {
  try {
    const userId = req.user?.UserID || req.user?.id;
    
    console.log("🔍 getMyTeamMembers called for userId:", userId);
    
    if (!userId) {
      return res.status(401).json({ 
        error: "User not authenticated",
        teamMembers: []
      });
    }
    
    // Get the user's team
    const team = await teamService.getTeamByManagerId(userId);
    
    console.log("📋 Team found:", team);
    
    if (!team) {
      console.log("⚠️ No team found for manager, returning empty array");
      return res.status(200).json([]); // Return empty array instead of 404
    }
    
    // Validate TeamID exists and is a number
    if (!team.TeamID || typeof team.TeamID !== 'number') {
      console.error("❌ Invalid TeamID:", team.TeamID);
      return res.status(500).json({ 
        error: "Invalid team data",
        teamMembers: []
      });
    }
    
    console.log("✅ Valid TeamID:", team.TeamID, "- Fetching members...");
    
    // Get team member employees
    const employees = await teamService.getTeamMemberEmployeeIds(team.TeamID);
    
    console.log("👥 Team members found:", employees.length);
    
    res.status(200).json(employees);
  } catch (err) {
    console.error("❌ Error in getMyTeamMembers controller:", err);
    res.status(500).json({ 
      error: err.message,
      teamMembers: []
    });
  }
};

module.exports = {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deactivateTeam,
  reactivateTeam,
  getTeamMembers,
  addTeamMember,
  removeTeamMember,
  getTeamByManagerId,
  getTeamMemberUserIds,
  getTeamMemberEmployees,
  getMyTeamMembers
};