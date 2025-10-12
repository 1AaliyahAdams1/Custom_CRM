const sequenceService = require("../services/sequenceService");

//======================================
// Get all sequences
//======================================
const getAllSequences = async (req, res) => {
  try {
    const onlyActive = req.query.onlyActive === 'true';
    const sequences = await sequenceService.getAllSequences(onlyActive);
    res.status(200).json(sequences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Get sequence by ID
//======================================
const getSequenceByID = async (req, res) => {
  try {
    const sequenceId = parseInt(req.params.id, 10);
    
    if (!sequenceId || isNaN(sequenceId)) {
      return res.status(400).json({ error: "Valid Sequence ID is required" });
    }

    const sequence = await sequenceService.getSequenceByID(sequenceId);
    
    if (!sequence) {
      return res.status(404).json({ error: "Sequence not found" });
    }

    res.status(200).json(sequence);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Get sequence with items
//======================================
const getSequenceWithItems = async (req, res) => {
  try {
    const sequenceId = parseInt(req.params.id, 10);
    
    if (!sequenceId || isNaN(sequenceId)) {
      return res.status(400).json({ error: "Valid Sequence ID is required" });
    }

    const sequence = await sequenceService.getSequenceWithItems(sequenceId);
    
    if (!sequence) {
      return res.status(404).json({ error: "Sequence not found" });
    }

    res.status(200).json(sequence);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Create sequence
//======================================
const createSequence = async (req, res) => {
  try {
    const result = await sequenceService.createSequence(req.body);
    res.status(201).json(result);
  } catch (err) {
    if (err.message.includes('required') || 
        err.message.includes('must be') || 
        err.message.includes('cannot exceed')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Update sequence
//======================================
const updateSequence = async (req, res) => {
  try {
    const sequenceId = parseInt(req.params.id, 10);
    
    if (!sequenceId || isNaN(sequenceId)) {
      return res.status(400).json({ error: "Valid Sequence ID is required" });
    }

    const result = await sequenceService.updateSequence(sequenceId, req.body);
    res.status(200).json(result);
  } catch (err) {
    if (err.message === "Sequence not found") {
      return res.status(404).json({ error: err.message });
    }
    if (err.message.includes('required') || 
        err.message.includes('must be') || 
        err.message.includes('cannot exceed')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Deactivate sequence
//======================================
const deactivateSequence = async (req, res) => {
  try {
    const sequenceId = parseInt(req.params.id, 10);
    
    if (!sequenceId || isNaN(sequenceId)) {
      return res.status(400).json({ error: "Valid Sequence ID is required" });
    }

    const result = await sequenceService.deactivateSequence(sequenceId);
    res.status(200).json(result);
  } catch (err) {
    if (err.message === "Sequence not found" || err.message === "Sequence is already deactivated") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Reactivate sequence
//======================================
const reactivateSequence = async (req, res) => {
  try {
    const sequenceId = parseInt(req.params.id, 10);
    
    if (!sequenceId || isNaN(sequenceId)) {
      return res.status(400).json({ error: "Valid Sequence ID is required" });
    }

    const result = await sequenceService.reactivateSequence(sequenceId);
    res.status(200).json(result);
  } catch (err) {
    if (err.message === "Sequence not found" || err.message === "Sequence is already active") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Delete sequence
//======================================
const deleteSequence = async (req, res) => {
  try {
    const sequenceId = parseInt(req.params.id, 10);
    
    if (!sequenceId || isNaN(sequenceId)) {
      return res.status(400).json({ error: "Valid Sequence ID is required" });
    }

    const result = await sequenceService.deleteSequence(sequenceId);
    res.status(200).json(result);
  } catch (err) {
    if (err.message === "Sequence not found" || err.message === "Sequence must be deactivated before permanent deletion") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Get sequence item by ID
//======================================
const getSequenceItemByID = async (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId, 10);
    
    if (!itemId || isNaN(itemId)) {
      return res.status(400).json({ error: "Valid Sequence Item ID is required" });
    }

    const item = await sequenceService.getSequenceItemByID(itemId);
    
    if (!item) {
      return res.status(404).json({ error: "Sequence item not found" });
    }

    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Create sequence item
//======================================
const createSequenceItem = async (req, res) => {
  try {
    const result = await sequenceService.createSequenceItem(req.body);
    res.status(201).json(result);
  } catch (err) {
    if (err.message.includes('required') || 
        err.message.includes('cannot be') || 
        err.message.includes('cannot exceed')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Update sequence item
//======================================
const updateSequenceItem = async (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId, 10);
    
    if (!itemId || isNaN(itemId)) {
      return res.status(400).json({ error: "Valid Sequence Item ID is required" });
    }

    const result = await sequenceService.updateSequenceItem(itemId, req.body);
    res.status(200).json(result);
  } catch (err) {
    if (err.message === "Sequence item not found") {
      return res.status(404).json({ error: err.message });
    }
    if (err.message.includes('required') || 
        err.message.includes('cannot be') || 
        err.message.includes('cannot exceed')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Delete sequence item
//======================================
const deleteSequenceItem = async (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId, 10);
    
    if (!itemId || isNaN(itemId)) {
      return res.status(400).json({ error: "Valid Sequence Item ID is required" });
    }

    const result = await sequenceService.deleteSequenceItem(itemId);
    res.status(200).json(result);
  } catch (err) {
    if (err.message === "Sequence item not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Create sequence with items
//======================================
const createSequenceWithItems = async (req, res) => {
  try {
    const { sequence, items } = req.body;
    
    if (!sequence || !items) {
      return res.status(400).json({ error: "Both sequence and items are required" });
    }

    const result = await sequenceService.createSequenceWithItems(sequence, items);
    res.status(201).json(result);
  } catch (err) {
    if (err.message.includes('required') || 
        err.message.includes('must be') || 
        err.message.includes('cannot') || 
        err.message.includes('Duplicate')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Assign sequence to account
//======================================
const assignSequenceToAccount = async (req, res) => {
  try {
    const { accountId, sequenceId } = req.body;
    
    if (!accountId || !sequenceId) {
      return res.status(400).json({ error: "Both accountId and sequenceId are required" });
    }

    const result = await sequenceService.assignSequenceToAccount(accountId, sequenceId);
    res.status(200).json(result);
  } catch (err) {
    if (err.message.includes("not found") || err.message.includes("inactive")) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Unassign sequence from account
//======================================
const unassignSequenceFromAccount = async (req, res) => {
  try {
    const accountId = parseInt(req.params.accountId, 10);
    
    if (!accountId || isNaN(accountId)) {
      return res.status(400).json({ error: "Valid Account ID is required" });
    }

    const result = await sequenceService.unassignSequenceFromAccount(accountId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Get accounts by sequence
//======================================
const getAccountsBySequence = async (req, res) => {
  try {
    const sequenceId = parseInt(req.params.id, 10);
    
    if (!sequenceId || isNaN(sequenceId)) {
      return res.status(400).json({ error: "Valid Sequence ID is required" });
    }

    const accounts = await sequenceService.getAccountsBySequence(sequenceId);
    res.status(200).json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Get all activity types
//======================================
const getAllActivityTypes = async (req, res) => {
  try {
    const activityTypes = await sequenceService.getAllActivityTypes();
    res.status(200).json(activityTypes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllSequences,
  getSequenceByID,
  getSequenceWithItems,
  createSequence,
  updateSequence,
  deactivateSequence,
  reactivateSequence,
  deleteSequence,
  getSequenceItemByID,
  createSequenceItem,
  updateSequenceItem,
  deleteSequenceItem,
  createSequenceWithItems,
  assignSequenceToAccount,
  unassignSequenceFromAccount,
  getAccountsBySequence,
  getAllActivityTypes,
};