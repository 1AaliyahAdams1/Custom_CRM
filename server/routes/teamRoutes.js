const express = require("express");
const router = express.Router();

const teamController = require("../controllers/teamController");

//======================================
// Team Routes
//======================================

// Get all teams
router.get("/", teamController.getAllTeams);

// Get team by ID
router.get("/:id", teamController.getTeamById);

// Create a new team
router.post("/", teamController.createTeam);

// Update an existing team
router.put("/:id", teamController.updateTeam);

// Deactivate a team
router.patch("/deactivate/:id", teamController.deactivateTeam);

// Reactivate a team
router.patch("/reactivate/:id", teamController.reactivateTeam);

//======================================
// Team Member Routes
//======================================

// Get team members
router.get("/:id/members", teamController.getTeamMembers);

// Add team member
router.post("/:id/members", teamController.addTeamMember);

// Remove team member
router.delete("/:id/members/:userId", teamController.removeTeamMember);

//======================================
// NEW: Team Filtering Routes
//======================================

// Get team by manager ID
router.get("/manager/:managerId", teamController.getTeamByManagerId);

// Get team member user IDs
router.get("/:id/member-ids", teamController.getTeamMemberUserIds);

// Get team member employees (for assignment)
router.get("/:id/member-employees", teamController.getTeamMemberEmployees);

// Get current user's team members (requires authentication)
router.get("/my/members", teamController.getMyTeamMembers);

module.exports = router;