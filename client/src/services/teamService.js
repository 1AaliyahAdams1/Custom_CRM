import api from '../utils/api';
console.log('api object:', api); 
const RESOURCE = '/teams';

//======================================
// Get all teams
//======================================
export async function getAllTeams() {
  try {
    const response = await api.get(RESOURCE);
    return response.data;
  } catch (error) {
    console.error('Error fetching all teams:', error);
    throw error;
  }
}

//======================================
// Get team by ID
//======================================
export async function getTeamById(teamId) {
  if (!teamId) throw new Error('Team ID is required');
  try {
    const response = await api.get(`${RESOURCE}/${teamId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching team with ID ${teamId}:`, error);
    throw error;
  }
}

//======================================
// Create a new team
//======================================
export async function createTeam(teamData) {
  if (!teamData.TeamName) throw new Error('Team name is required');
  if (!teamData.ManagerID) throw new Error('Manager ID is required');
  
  try {
    const response = await api.post(RESOURCE, teamData);
    return response.data;
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
}

//======================================
// Update an existing team
//======================================
export async function updateTeam(teamId, teamData) {
  if (!teamId) throw new Error('Team ID is required');
  if (!teamData.TeamName) throw new Error('Team name is required');
  if (teamData.ManagerID === undefined) throw new Error('Manager ID is required');
  
  try {
    const response = await api.put(`${RESOURCE}/${teamId}`, teamData);
    return response.data;
  } catch (error) {
    console.error(`Error updating team with ID ${teamId}:`, error);
    throw error;
  }
}

//======================================
// Deactivate a team
//======================================
export async function deactivateTeam(teamId) {
  if (!teamId) throw new Error('Team ID is required');
  try {
    const response = await api.patch(`${RESOURCE}/deactivate/${teamId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deactivating team with ID ${teamId}:`, error);
    throw error;
  }
}

//======================================
// Reactivate a team
//======================================
export async function reactivateTeam(teamId) {
  if (!teamId) throw new Error('Team ID is required');
  try {
    const response = await api.patch(`${RESOURCE}/reactivate/${teamId}`);
    return response.data;
  } catch (error) {
    console.error(`Error reactivating team with ID ${teamId}:`, error);
    throw error;
  }
}

//======================================
// Delete a team
//======================================
export async function deleteTeam(teamId) {
  if (!teamId) throw new Error('Team ID is required');
  try {
    const response = await api.delete(`${RESOURCE}/${teamId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting team with ID ${teamId}:`, error);
    throw error;
  }
}

//======================================
// Get team members
//======================================
export async function getTeamMembers(teamId) {
  if (!teamId) throw new Error('Team ID is required');
  try {
    const response = await api.get(`${RESOURCE}/${teamId}/members`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching team members for team ${teamId}:`, error);
    throw error;
  }
}

//======================================
// Add team member
//======================================
export async function addTeamMember(teamId, userId) {
  if (!teamId) throw new Error('Team ID is required');
  if (!userId) throw new Error('User ID is required');
  
  try {
    const response = await api.post(`${RESOURCE}/${teamId}/members`, { userId });
    return response.data;
  } catch (error) {
    console.error(`Error adding member to team ${teamId}:`, error);
    throw error;
  }
}

//======================================
// Remove team member
//======================================
export async function removeTeamMember(teamId, userId) {
  if (!teamId) throw new Error('Team ID is required');
  if (!userId) throw new Error('User ID is required');
  
  try {
    const response = await api.delete(`${RESOURCE}/${teamId}/members/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error removing member from team ${teamId}:`, error);
    throw error;
  }
}

//======================================
// Get available users for team
//======================================
export async function getAvailableUsers(teamId) {
  if (!teamId) throw new Error('Team ID is required');
  try {
    const response = await api.get(`${RESOURCE}/${teamId}/available-members`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching available users for team ${teamId}:`, error);
    throw error;
  }
}