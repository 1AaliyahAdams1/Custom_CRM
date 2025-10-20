const teamService = require('../services/teamService');

//======================================
// Get all active teams
//======================================
async function getAllTeams(req, res) {
  try {
    console.log('📡 Controller: Getting all teams request received');
    console.log('📡 Controller: Request URL:', req.url);
    console.log('📡 Controller: Request method:', req.method);
    
    const teams = await teamService.getAllTeams();
    console.log('📡 Controller: Teams from service:', teams);
    console.log('📡 Controller: Teams count:', teams.length);
    
    const response = {
      success: true,
      data: teams,
      message: 'Teams retrieved successfully'
    };
    
    console.log('📡 Controller: Sending response:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('❌ Controller error getting teams:', error);
    console.error('❌ Controller error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve teams',
      message: 'Internal server error'
    });
  }
}

//======================================
// Get team by ID
//======================================
async function getTeamById(req, res) {
  try {
    const { id } = req.params;
    console.log('📡 Controller: Getting team by ID request received:', id);
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Team ID is required',
        message: 'Bad request'
      });
    }
    
    const team = await teamService.getTeamById(id);
    
    res.status(200).json({
      success: true,
      data: team,
      message: 'Team retrieved successfully'
    });
  } catch (error) {
    console.error('Controller error getting team by ID:', error);
    
    if (error.message === 'Team not found') {
      return res.status(404).json({
        success: false,
        error: error.message,
        message: 'Team not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve team',
      message: 'Internal server error'
    });
  }
}

//======================================
// Create new team
//======================================
async function createTeam(req, res) {
  try {
    const teamData = req.body;
    console.log('📡 Controller: Creating team request received:', teamData);
    
    // Validate required fields
    if (!teamData.TeamName || !teamData.ManagerID) {
      return res.status(400).json({
        success: false,
        error: 'TeamName and ManagerID are required',
        message: 'Bad request'
      });
    }
    
    const newTeam = await teamService.createTeam(teamData);
    
    res.status(201).json({
      success: true,
      data: newTeam,
      message: 'Team created successfully'
    });
  } catch (error) {
    console.error('Controller error creating team:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create team',
      message: 'Internal server error'
    });
  }
}

//======================================
// Update team
//======================================
async function updateTeam(req, res) {
  try {
    const { id } = req.params;
    const teamData = req.body;
    console.log('📡 Controller: Updating team request received:', id, teamData);
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Team ID is required',
        message: 'Bad request'
      });
    }
    
    if (!teamData.TeamName || !teamData.ManagerID) {
      return res.status(400).json({
        success: false,
        error: 'TeamName and ManagerID are required',
        message: 'Bad request'
      });
    }
    
    const updatedTeam = await teamService.updateTeam(id, teamData);
    
    res.status(200).json({
      success: true,
      data: updatedTeam,
      message: 'Team updated successfully'
    });
  } catch (error) {
    console.error('Controller error updating team:', error);
    
    if (error.message === 'Team not found or already inactive') {
      return res.status(404).json({
        success: false,
        error: error.message,
        message: 'Team not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update team',
      message: 'Internal server error'
    });
  }
}

//======================================
// Deactivate team
//======================================
async function deactivateTeam(req, res) {
  try {
    const { id } = req.params;
    console.log('📡 Controller: Deactivating team request received:', id);
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Team ID is required',
        message: 'Bad request'
      });
    }
    
    const result = await teamService.deactivateTeam(id);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Team deactivated successfully'
    });
  } catch (error) {
    console.error('Controller error deactivating team:', error);
    
    if (error.message === 'Team not found') {
      return res.status(404).json({
        success: false,
        error: error.message,
        message: 'Team not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to deactivate team',
      message: 'Internal server error'
    });
  }
}

//======================================
// Reactivate team
//======================================
async function reactivateTeam(req, res) {
  try {
    const { id } = req.params;
    console.log('📡 Controller: Reactivating team request received:', id);
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Team ID is required',
        message: 'Bad request'
      });
    }
    
    const result = await teamService.reactivateTeam(id);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Team reactivated successfully'
    });
  } catch (error) {
    console.error('Controller error reactivating team:', error);
    
    if (error.message === 'Team not found') {
      return res.status(404).json({
        success: false,
        error: error.message,
        message: 'Team not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to reactivate team',
      message: 'Internal server error'
    });
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
