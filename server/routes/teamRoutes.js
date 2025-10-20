const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");

//======================================
// Team Routes
//======================================

// Get all active teams
router.get("/", teamController.getAllTeams);

// Get team by ID
router.get("/:id", teamController.getTeamById);

// Create new team
router.post("/", teamController.createTeam);

// Update team
router.put("/:id", teamController.updateTeam);

// Deactivate team (soft delete)
router.delete("/:id", teamController.deactivateTeam);

// Reactivate team
router.patch("/:id/reactivate", teamController.reactivateTeam);

module.exports = router;
