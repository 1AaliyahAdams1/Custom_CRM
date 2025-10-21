

const teamRepository = require("../data/teamRepository");

//==========================
// Get all teams
//==========================
async function getAllTeams() {
    return await teamRepository.getAllTeams();
};

//==========================
// Get team by ID
//==========================
async function getTeamById(teamId) {
    return await teamRepository.getTeamById(teamId);
};

//==========================
// Create a new team
//==========================
async function createTeam(teamName) {
    if (!teamData.TeamName) throw new Error("TeamName is required");
    if (!teamData.ManagerID) throw new Error("ManagerID is required");
    return await teamRepository.createTeam(teamName);
};

//==========================
// Update an existing team
//==========================
async function updateTeam(teamId, teamName) {
    if (!teamId) throw new Error("teamId is required");
    if (!teamData.TeamName) throw new Error("TeamName is required");
    if (teamData.ManagerID === undefined) throw new Error("ManagerID is required");
    return await teamRepository.updateTeam(teamId, teamName);
};

//==========================
// Deactivate a team
//==========================
async function deactivateTeam(teamId) {
    if (!teamId) throw new Error("teamId is required");
    return await teamRepository.deactivateTeam(teamId);
};
//==========================
// Reactivate a team
//==========================
async function reactivateTeam(teamId) {
     if (!teamId) throw new Error("teamId is required");
    return await teamRepository.reactivateTeam(teamId);
};

//==========================
// Delete a team
//==========================
async function deleteTeam(teamId) {
    if (!teamId) throw new Error("teamId is required");
    return await teamRepository.deleteTeam(teamId);
}

//==========================
// Get team members
//==========================
async function getTeamMembers(teamId) {
    if (!teamId) throw new Error("teamId is required");
    return await teamRepository.getTeamMembers(teamId);
}

//==========================
// Add team member
//==========================
async function addTeamMember(teamId, userId) {
    if (!teamId) throw new Error("teamId is required");
    if (!userId) throw new Error("userId is required");
    return await teamRepository.addTeamMember(teamId, userId);
}

//==========================
// Remove team member
//==========================
async function removeTeamMember(teamId, userId) {
    if (!teamId) throw new Error("teamId is required");
    if (!userId) throw new Error("userId is required");
    return await teamRepository.removeTeamMember(teamId, userId);
}

//==========================
// Get available users
//==========================
async function getAvailableUsers(teamId) {
    if (!teamId) throw new Error("teamId is required");
    return await teamRepository.getAvailableUsers(teamId);
}

module.exports = {
    getAllTeams,
    getTeamById,    
    createTeam,
    updateTeam,
    deactivateTeam,
    reactivateTeam,
    deleteTeam,
    getTeamMembers,
    addTeamMember,
    removeTeamMember,
    getAvailableUsers
};