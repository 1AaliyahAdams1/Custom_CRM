const express = require("express");
const router = express.Router();
const { getRolesByUserId } = require("../../controllers/auth/roleController");
const authController = require("../../controllers/auth/authController.js");
const { authenticateJWT } = require("../../middleware/authMiddleware.js");
const { authorizeRole } = require("../../middleware/authorizeRoleMiddleware.js"); 

// Existing routes
router.get("/roles", authenticateJWT, getRolesByUserId);
router.post("/login", authController.login);

// Debug route to test authentication
router.get("/debug", authenticateJWT, (req, res) => {
  console.log("=== Debug Route Hit ===");
  console.log("User from JWT:", req.user);
  console.log("Headers:", req.headers);

  res.json({
    message: "Authentication working!",
    user: req.user,
    timestamp: new Date().toISOString(),
  });
});

// Debug route to test role authorization
router.get(
  "/debug-roles",
  authenticateJWT,
  authorizeRole(["Clevel", "Sales Management"]), // use exact role names
  (req, res) => {
    console.log("=== Debug Roles Route Hit ===");
    console.log("User passed role check:", req.user);

    res.json({
      message: "Role authorization working!",
      user: req.user,
      roles: req.user.roles,
      timestamp: new Date().toISOString(),
    });
  }
);

module.exports = router;
