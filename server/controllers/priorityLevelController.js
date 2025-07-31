const priorityLevelService = require("../services/priorityLevelService");

async function getAllPriorityLevels(req, res) {
  const data = await priorityLevelService.getAllPriorityLevels();
  res.json(data);
}

async function getPriorityLevelById(req, res) {
  const data = await priorityLevelService.getPriorityLevelById(parseInt(req.params.id));
  res.json(data);
}

async function createPriorityLevel(req, res) {
  await priorityLevelService.createPriorityLevel(req.body);
  res.status(201).json({ message: "Priority level created" });
}

async function updatePriorityLevel(req, res) {
  await priorityLevelService.updatePriorityLevel(parseInt(req.params.id), req.body);
  res.json({ message: "Priority level updated" });
}

async function deactivatePriorityLevel(req, res) {
  await priorityLevelService.deactivatePriorityLevel(parseInt(req.params.id));
  res.json({ message: "Priority level deactivated" });
}

async function reactivatePriorityLevel(req, res) {
  await priorityLevelService.reactivatePriorityLevel(parseInt(req.params.id));
  res.json({ message: "Priority level reactivated" });
}

async function deletePriorityLevel(req, res) {
  await priorityLevelService.deletePriorityLevel(parseInt(req.params.id));
  res.json({ message: "Priority level deleted" });
}

module.exports = {
  getAllPriorityLevels,
  getPriorityLevelById,
  createPriorityLevel,
  updatePriorityLevel,
  deactivatePriorityLevel,
  reactivatePriorityLevel,
  deletePriorityLevel,
};
