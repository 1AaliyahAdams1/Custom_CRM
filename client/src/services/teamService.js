import api from '../utils/api';
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
    // Wrap in data object to match controller expectations
    const response = await api.post(RESOURCE, { data: teamData });
    return response.data;
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
}

//======================================
// Update an existing team
//======================================
export async function updateTeam(teamId, teamData, changedBy, actionTypeId) {
  if (!teamId) throw new Error('Team ID is required');
  if (!teamData.TeamName) throw new Error('Team name is required');
  if (teamData.ManagerID === undefined) throw new Error('Manager ID is required');
  
  try {
    // Wrap data to match backend expectations (like createTeam does)
    const response = await api.put(`${RESOURCE}/${teamId}`, {
      data: teamData,
      changedBy,
      actionTypeId
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating team with ID ${teamId}:`, error);
    console.error('Request payload:', { data: teamData, changedBy, actionTypeId });
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
export async function addTeamMember(data) {
  if (!data.TeamID) throw new Error('Team ID is required');
  if (!data.UserID) throw new Error('User ID is required');
  
  try {
    // Backend expects { userId } in body (lowercase)
    const response = await api.post(`${RESOURCE}/${data.TeamID}/members`, {
      userId: data.UserID
    });
    return response.data;
  } catch (error) {
    console.error('Error adding team member:', error);
    throw error;
  }
}

//======================================
// Remove team member  
//======================================
export async function removeTeamMember(data) {
  if (!data.TeamID) throw new Error('Team ID is required');
  if (!data.UserID) throw new Error('User ID is required');
  
  try {
    // UserID goes in URL params, not body
    const response = await api.delete(`${RESOURCE}/${data.TeamID}/members/${data.UserID}`);
    return response.data;
  } catch (error) {
    console.error('Error removing team member:', error);
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

//======================================
// NEW: Get team by manager ID
//======================================
export async function getTeamByManagerId(managerId) {
  if (!managerId) throw new Error('Manager ID is required');
  try {
    const response = await api.get(`${RESOURCE}/manager/${managerId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching team for manager ${managerId}:`, error);
    throw error;
  }
}

//======================================
// NEW: Get team member user IDs
//======================================
export async function getTeamMemberUserIds(teamId) {
  if (!teamId) throw new Error('Team ID is required');
  try {
    const response = await api.get(`${RESOURCE}/${teamId}/member-ids`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching member IDs for team ${teamId}:`, error);
    throw error;
  }
}

//======================================
// NEW: Get team member employees (for assignment dropdown)
//======================================
export async function getTeamMemberEmployees(teamId) {
  if (!teamId) throw new Error('Team ID is required');
  try {
    const response = await api.get(`${RESOURCE}/${teamId}/member-employees`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching member employees for team ${teamId}:`, error);
    throw error;
  }
}

//======================================
// NEW: Get current user's team members (for Sales Managers)
//======================================
export async function getMyTeamMembers() {
  try {
    const response = await api.get(`${RESOURCE}/my/members`);
    return response.data;
  } catch (error) {
    console.error('Error fetching my team members:', error);
    throw error;
  }
}