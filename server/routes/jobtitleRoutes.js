const express = require("express");
const router = express.Router();
const jobTitleController = require("../controllers/jobtitleController");

router.get("/", jobTitleController.getAllJobTitles);
router.get("/:id", jobTitleController.getJobTitleById);
router.post("/", jobTitleController.createJobTitle);
router.put("/:id", jobTitleController.updateJobTitle);
router.delete("/:id", jobTitleController.deleteJobTitle);

module.exports = router;
