const teamRepository = require('../data/teamRepository');

//======================================
// Get all active teams
//======================================
async function getAllTeams() {
  try {
    console.log('📡 Service: Fetching all active teams');
    const teams = await teamRepository.getAllTeams();
    console.log('📡 Service: Retrieved', teams.length, 'teams');
    console.log('📡 Service: Teams data:', teams);
    return teams;
  } catch (error) {
    console.error('❌ Service error fetching teams:', error);
    console.error('❌ Service error stack:', error.stack);
    throw error;
  }
}

//======================================
// Get team by ID
//======================================
async function getTeamById(teamId) {
  try {
    console.log('📡 Service: Fetching team by ID:', teamId);
    
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    
    const team = await teamRepository.getTeamById(teamId);
    
    if (!team) {
      throw new Error('Team not found');
    }
    
    return team;
  } catch (error) {
    console.error('Service error fetching team by ID:', error);
    throw error;
  }
}

//======================================
// Create new team
//======================================
async function createTeam(teamData) {
  try {
    console.log('📡 Service: Creating new team:', teamData);
    
    // Validate required fields
    if (!teamData.TeamName || !teamData.ManagerID) {
      throw new Error('TeamName and ManagerID are required');
    }
    
    // Additional validation can be added here
    if (teamData.TeamName.length > 100) {
      throw new Error('Team name must be 100 characters or less');
    }
    
    const newTeam = await teamRepository.createTeam(teamData);
    console.log('📡 Service: Created team successfully');
    return newTeam;
  } catch (error) {
    console.error('Service error creating team:', error);
    throw error;
  }
}

//======================================
// Update team
//======================================
async function updateTeam(teamId, teamData) {
  try {
    console.log('📡 Service: Updating team ID:', teamId, 'with data:', teamData);
    
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    
    // Validate required fields
    if (!teamData.TeamName || !teamData.ManagerID) {
      throw new Error('TeamName and ManagerID are required');
    }
    
    const updatedTeam = await teamRepository.updateTeam(teamId, teamData);
    console.log('📡 Service: Updated team successfully');
    return updatedTeam;
  } catch (error) {
    console.error('Service error updating team:', error);
    throw error;
  }
}

//======================================
// Deactivate team
//======================================
async function deactivateTeam(teamId) {
  try {
    console.log('📡 Service: Deactivating team ID:', teamId);
    
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    
    const result = await teamRepository.deactivateTeam(teamId);
    console.log('📡 Service: Deactivated team successfully');
    return result;
  } catch (error) {
    console.error('Service error deactivating team:', error);
    throw error;
  }
}

//======================================
// Reactivate team
//======================================
async function reactivateTeam(teamId) {
  try {
    console.log('📡 Service: Reactivating team ID:', teamId);
    
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    
    const result = await teamRepository.reactivateTeam(teamId);
    console.log('📡 Service: Reactivated team successfully');
    return result;
  } catch (error) {
    console.error('Service error reactivating team:', error);
    throw error;
  }
}

//======================================
// Exports
//======================================
module.exports = {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deactivateTeam,
  reactivateTeam
};
