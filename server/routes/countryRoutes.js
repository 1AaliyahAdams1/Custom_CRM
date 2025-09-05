const express = require("express");
const router = express.Router();
const countryController = require("../controllers/countryController");

// Get all countries
router.get("/", countryController.getAllCountries);

// Get active countries only
router.get("/active", countryController.getAllActiveCountries);

// Get specific country by ID
router.get("/:id", countryController.getCountryById);

// Create new country
router.post("/", countryController.createCountry);

// Update country
router.put("/:id", countryController.updateCountry);

// Deactivate country (soft delete)
router.patch("/:id/deactivate", countryController.deactivateCountry);

// Reactivate country
router.patch("/:id/reactivate", countryController.reactivateCountry);

// Hard delete country
router.delete("/:id/delete", countryController.hardDeleteCountry);

module.exports = router;

//ROLE ACCESS FOR BACKEND
// const express = require("express");
// const router = express.Router();
// const countryController = require("../controllers/countryController");
// const { authenticateJWT } = require("../middleware/authMiddleware");
// const { authorizeRoleDynamic } = require("../middleware/authorizeRoleMiddleware");

// // Get all countries - restricted to C-level, Sales Manager, Sales Rep
// router.get(
//   "/",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level", "Sales Manager", "Sales Representative"], "country"),
//   countryController.getAllCountries
// );

// // Get active countries only
// router.get(
//   "/active",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level", "Sales Manager", "Sales Representative"], "country"),
//   countryController.getAllActiveCountries
// );

// // Get specific country by ID
// router.get(
//   "/:id",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level", "Sales Manager", "Sales Representative"], "country"),
//   countryController.getCountryById
// );

// // Create new country - only C-level
// router.post(
//   "/",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level"], "country"),
//   countryController.createCountry
// );

// // Update country - only C-level
// router.put(
//   "/:id",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level"], "country"),
//   countryController.updateCountry
// );

// // Deactivate country (soft delete) - only C-level
// router.patch(
//   "/:id/deactivate",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level"], "country"),
//   countryController.deactivateCountry
// );

// // Reactivate country - only C-level
// router.patch(
//   "/:id/reactivate",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level"], "country"),
//   countryController.reactivateCountry
// );

// // Hard delete country - only C-level
// router.delete(
//   "/:id/delete",
//   authenticateJWT,
//   authorizeRoleDynamic(["C-level"], "country"),
//   countryController.hardDeleteCountry
// );

// module.exports = router;