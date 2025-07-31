const jobTitleService = require("../services/jobTitleService");

async function getAllJobTitles(req, res) {
  const jobTitles = await jobTitleService.getAllJobTitles();
  res.json(jobTitles);
}

async function getJobTitleById(req, res) {
  const jobTitle = await jobTitleService.getJobTitleById(parseInt(req.params.id));
  res.json(jobTitle);
}

async function createJobTitle(req, res) {
  await jobTitleService.createJobTitle(req.body.JobTitleName);
  res.status(201).json({ message: "Job title created" });
}

async function updateJobTitle(req, res) {
  await jobTitleService.updateJobTitle(parseInt(req.params.id), req.body.JobTitleName);
  res.json({ message: "Job title updated" });
}

async function deactivateJobTitle(req, res) {
  await jobTitleService.deactivateJobTitle(parseInt(req.params.id));
  res.json({ message: "Job title deactivated" });
}

async function reactivateJobTitle(req, res) {
  await jobTitleService.reactivateJobTitle(parseInt(req.params.id));
  res.json({ message: "Job title reactivated" });
}

async function deleteJobTitle(req, res) {
  await jobTitleService.deleteJobTitle(parseInt(req.params.id));
  res.json({ message: "Job title deleted" });
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
