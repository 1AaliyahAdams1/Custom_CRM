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
        // Extract from nested data object (matching employee pattern)
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

        // Call service with full teamData object
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

module.exports = {
    getAllTeams,
    getTeamById,
    createTeam,
    updateTeam,
    deactivateTeam,
    reactivateTeam,
    getTeamMembers,
    addTeamMember,
    removeTeamMember
};