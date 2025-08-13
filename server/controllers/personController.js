const personService = require("../services/personService");

async function getAllPersons(req, res) {
  try {
    const persons = await personService.getAllPersons();
    res.json(persons);
  } catch (err) {
    console.error("Error getting all persons:", err);
    res.status(500).json({ error: "Failed to get persons" });
  }
}

async function getPersonById(req, res) {
  try {
    const person = await personService.getPersonById(req.params.id);
    res.json(person);
  } catch (err) {
    console.error("Error getting person by ID:", err);
    res.status(500).json({ error: "Failed to get person" });
  }
}

async function createPerson(req, res) {
  try {
    const result = await personService.createPerson(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error("Error creating person:", err);
    res.status(500).json({ error: "Failed to create person" });
  }
}


async function updatePerson(req, res) {
  try {
    await personService.updatePerson(req.params.id, req.body);
    res.json({ message: "Person updated successfully" });
  } catch (err) {
    console.error("Error updating person:", err);
    res.status(500).json({ error: "Failed to update person" });
  }
}

async function deactivatePerson(req, res) {
  try {
    await personService.deactivatePerson(req.params.id);
    res.json({ message: "Person deactivated successfully" });
  } catch (err) {
    console.error("Error deactivating person:", err);
    res.status(500).json({ error: "Failed to deactivate person" });
  }
}

async function reactivatePerson(req, res) {
  try {
    await personService.reactivatePerson(req.params.id);
    res.json({ message: "Person reactivated successfully" });
  } catch (err) {
    console.error("Error reactivating person:", err);
    res.status(500).json({ error: "Failed to reactivate person" });
  }
}

async function deletePerson(req, res) {
  try {
    await personService.deletePerson(req.params.id);
    res.json({ message: "Person deleted successfully" });
  } catch (err) {
    console.error("Error deleting person:", err);
    res.status(500).json({ error: "Failed to delete person" });
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
