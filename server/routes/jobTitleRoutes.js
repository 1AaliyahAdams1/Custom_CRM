const express = require("express");
const router = express.Router();
const jobTitleController = require("../controllers/jobTitleController");

router.get("/", jobTitleController.getAllJobTitles);
router.get("/:id", jobTitleController.getJobTitleById);
router.post("/", jobTitleController.createJobTitle);
router.put("/:id", jobTitleController.updateJobTitle);
router.patch("/:id/deactivate", jobTitleController.deactivateJobTitle);
router.patch("/:id/reactivate", jobTitleController.reactivateJobTitle);
router.delete("/:id/delete", jobTitleController.deleteJobTitle);

module.exports = router;
