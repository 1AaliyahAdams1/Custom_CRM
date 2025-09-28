const express = require("express");
const router = express.Router();
const dealController = require("../controllers/dealController");
router.get("/", dealController.getAllDeals);
router.get("/user/:userId", dealController.getDealsByUser); 
router.get("/:id", dealController.getDealById);
router.post("/", dealController.createDeal);
router.put("/:id", dealController.updateDeal);
router.patch("/:id/deactivate", dealController.deactivateDeal);
router.patch("/:id/reactivate", dealController.reactivateDeal);
router.delete("/:id/delete", dealController.deleteDeal);
router.get("/account/:accountId", dealController.getDealsByAccountID);

module.exports = router;







//ROLE BASED ACCESS BACKEND
// const express = require("express");
// const router = express.Router();
// const dealController = require("../controllers/dealController");
// const { authenticateJWT } = require("../middleware/authMiddleware");
// const { authorizeRoleDynamic } = require("../middleware/authorizeRoleMiddleware");

// // Get all deals - only C-level and Sales Manager allowed
// router.get(
//   "/",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level", "Sales Manager"], "deal"),
//   dealController.getAllDeals
// );

// // Get specific deal by ID - C-level, Sales Manager, Sales Representative allowed
// router.get(
//   "/:id",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level", "Sales Manager", "Sales Representative"], "deal"),
//   dealController.getDealById
// );

// // Create new deal - only C-level allowed
// router.post(
//   "/",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level"], "deal"),
//   dealController.createDeal
// );

// // Update deal - only C-level allowed
// router.put(
//   "/:id",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level"], "deal"),
//   dealController.updateDeal
// );

// // Deactivate deal - only C-level allowed
// router.patch(
//   "/:id/deactivate",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level"], "deal"),
//   dealController.deactivateDeal
// );

// // Reactivate deal - only C-level allowed
// router.patch(
//   "/:id/reactivate",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level"], "deal"),
//   dealController.reactivateDeal
// );

// // Permanently delete deal - only C-level allowed
// router.delete(
//   "/:id/delete",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level"], "deal"),
//   dealController.deleteDeal
// );

// module.exports = router;
