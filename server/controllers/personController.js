const personService = require('../services/personService');

async function getAllPersons(req, res) {
  try {
    const persons = await personService.getAllPersons();
    res.json(persons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getPersonById(req, res) {
  const personId = parseInt(req.params.id, 10);
  if (isNaN(personId)) return res.status(400).json({ error: "Invalid Person ID" });

  try {
    const person = await personService.getPersonById(personId);
    if (!person) return res.status(404).json({ error: "Person not found" });
    res.json(person);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createPerson(req, res) {
  try {
    await personService.createPerson(req.body);
    res.status(201).json({ message: "Person created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updatePerson(req, res) {
  const personId = parseInt(req.params.id, 10);
  if (isNaN(personId)) return res.status(400).json({ error: "Invalid Person ID" });

  try {
    await personService.updatePerson(personId, req.body);
    res.json({ message: "Person updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deactivatePerson(req, res) {
  const personId = parseInt(req.params.id, 10);
  if (isNaN(personId)) return res.status(400).json({ error: "Invalid Person ID" });

  try {
    await personService.deactivatePerson(personId);
    res.json({ message: "Person deactivated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function reactivatePerson(req, res) {
  const personId = parseInt(req.params.id, 10);
  if (isNaN(personId)) return res.status(400).json({ error: "Invalid Person ID" });

  try {
    await personService.reactivatePerson(personId);
    res.json({ message: "Person reactivated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deletePerson(req, res) {
  const personId = parseInt(req.params.id, 10);
  if (isNaN(personId)) return res.status(400).json({ error: "Invalid Person ID" });

  try {
    await personService.deletePerson(personId);
    res.json({ message: "Person deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getAllPersons,
  getPersonById,
  createPerson,
  updatePerson,
  deactivatePerson,
  reactivatePerson,
  deletePerson,
};
