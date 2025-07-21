const jobTitleService = require("../services/jobtitleService");

// Get all job titles
async function getAllJobTitles(req, res) {
  try {
    // Validation could go here (e.g., query params)

    const jobTitles = await jobTitleService.getAllJobTitles();
    res.json(jobTitles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get job title by ID
async function getJobTitleById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);

    // Validation for id could go here

    const jobTitle = await jobTitleService.getJobTitleById(id);

    // Handle not found case here if needed
    if (!jobTitle) {
      return res.status(404).json({ error: "Job title not found" });
    }

    res.json(jobTitle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Create a new job title
async function createJobTitle(req, res) {
  try {
    const { jobTitleName, active } = req.body;

    // Validation for jobTitleName and active could go here

    const changedBy = req.user?.username || "System";

    const newJobTitle = await jobTitleService.createJobTitle(jobTitleName, active, changedBy);
    res.status(201).json(newJobTitle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update a job title by ID
async function updateJobTitle(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;

    // Validation for id and data could go here

    const changedBy = req.user?.username || "System";

    const result = await jobTitleService.updateJobTitle(id, data, changedBy);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete (soft delete) a job title by ID
async function deleteJobTitle(req, res) {
  try {
    const id = parseInt(req.params.id, 10);

    // Validation for id could go here

    const changedBy = req.user?.username || "System";

    const result = await jobTitleService.deleteJobTitle(id, changedBy);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllJobTitles,
  getJobTitleById,
  createJobTitle,
  updateJobTitle,
  deleteJobTitle,
};
