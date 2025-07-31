const express = require("express");
const router = express.Router();
const industryController = require("../controllers/industryController");

router.get("/", industryController.getAllIndustries);
router.get("/:id", industryController.getIndustryById);
router.post("/", industryController.createIndustry);
router.put("/:id", industryController.updateIndustry);
router.patch("/:id/deactivate", industryController.deactivateIndustry);
router.patch("/:id/reactivate", industryController.reactivateIndustry);
router.delete("/:id/delete", industryController.deleteIndustry);

module.exports = router;
