const industryService = require("../services/industryService");

async function getAllIndustries(req, res) {
  const industries = await industryService.getAllIndustries();
  res.json(industries);
}

async function getIndustryById(req, res) {
  const industry = await industryService.getIndustryById(parseInt(req.params.id));
  res.json(industry);
}

async function createIndustry(req, res) {
  await industryService.createIndustry(req.body.IndustryName);
  res.status(201).json({ message: "Industry created" });
}

async function updateIndustry(req, res) {
  await industryService.updateIndustry(parseInt(req.params.id), req.body.IndustryName);
  res.json({ message: "Industry updated" });
}

async function deactivateIndustry(req, res) {
  await industryService.deactivateIndustry(parseInt(req.params.id));
  res.json({ message: "Industry deactivated" });
}

async function reactivateIndustry(req, res) {
  await industryService.reactivateIndustry(parseInt(req.params.id));
  res.json({ message: "Industry reactivated" });
}

async function deleteIndustry(req, res) {
  await industryService.deleteIndustry(parseInt(req.params.id));
  res.json({ message: "Industry deleted" });
}

module.exports = {
  getAllIndustries,
  getIndustryById,
  createIndustry,
  updateIndustry,
  deactivateIndustry,
  reactivateIndustry,
  deleteIndustry,
};
