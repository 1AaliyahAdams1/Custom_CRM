const jobTitleService = require("../services/jobTitleService");

async function getAllJobTitles(req, res) {
  try {
    const jobTitles = await jobTitleService.getAllJobTitles();
    res.json(jobTitles);
  } catch (err) {
    console.error("Error getting all job titles:", err);
    res.status(500).json({ error: "Failed to get job titles" });
  }
}

async function getJobTitleById(req, res) {
  try {
    const jobTitle = await jobTitleService.getJobTitleById(req.params.id);
    res.json(jobTitle);
  } catch (err) {
    console.error("Error getting job title by ID:", err);
    res.status(500).json({ error: "Failed to get job title" });
  }
}

async function createJobTitle(req, res) {
  try {
    await jobTitleService.createJobTitle(req.body.JobTitleName);
    res.status(201).json({ message: "Job title created" });
  } catch (err) {
    console.error("Error creating job title:", err);
    res.status(500).json({ error: "Failed to create job title" });
  }
}

async function updateJobTitle(req, res) {
  try {
    await jobTitleService.updateJobTitle(req.params.id, req.body.JobTitleName);
    res.json({ message: "Job title updated" });
  } catch (err) {
    console.error("Error updating job title:", err);
    res.status(500).json({ error: "Failed to update job title" });
  }
}

async function deactivateJobTitle(req, res) {
  try {
    await jobTitleService.deactivateJobTitle(req.params.id);
    res.json({ message: "Job title deactivated" });
  } catch (err) {
    console.error("Error deactivating job title:", err);
    res.status(500).json({ error: "Failed to deactivate job title" });
  }
}

async function reactivateJobTitle(req, res) {
  try {
    await jobTitleService.reactivateJobTitle(req.params.id);
    res.json({ message: "Job title reactivated" });
  } catch (err) {
    console.error("Error reactivating job title:", err);
    res.status(500).json({ error: "Failed to reactivate job title" });
  }
}

async function deleteJobTitle(req, res) {
  try {
    await jobTitleService.deleteJobTitle(req.params.id);
    res.json({ message: "Job title deleted" });
  } catch (err) {
    console.error("Error deleting job title:", err);
    res.status(500).json({ error: "Failed to delete job title" });
  }
}

module.exports = {
  getAllJobTitles,
  getJobTitleById,
  createJobTitle,
  updateJobTitle,
  deactivateJobTitle,
  reactivateJobTitle,
  deleteJobTitle,
};
