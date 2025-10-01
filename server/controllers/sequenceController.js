const sequenceRepo = require("../data/sequenceRepository");

//======================================
// Get all sequences
//======================================
const getAllSequences = async (req, res) => {
  try {
    const onlyActive = req.query.onlyActive === 'true';
    const sequences = await sequenceRepo.getAllSequences();
    
    const filteredSequences = onlyActive 
      ? sequences.filter(s => s.Active)
      : sequences;
    
    res.status(200).json(filteredSequences);
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

    const sequence = await sequenceRepo.getSequenceDetails(sequenceId);
    
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

    const data = await sequenceRepo.getSequenceWithItems(sequenceId);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//======================================
// Create sequence
//======================================
const createSequence = async (req, res) => {
  try {
    const changedBy = req.user?.UserID || req.body.changedBy || 1;
    const result = await sequenceRepo.createSequence(req.body, changedBy);
    res.status(201).json(result);
  } catch (err) {
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

    const changedBy = req.user?.UserID || req.body.changedBy || 1;
    const result = await sequenceRepo.updateSequence(sequenceId, req.body, changedBy);
    res.status(200).json(result);
  } catch (err) {
    if (err.message === "Sequence not found") {
      return res.status(404).json({ error: err.message });
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

    const changedBy = req.user?.UserID || req.body.changedBy || 1;
    const result = await sequenceRepo.deactivateSequence(sequenceId, changedBy);
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

    const changedBy = req.user?.UserID || req.body.changedBy || 1;
    const result = await sequenceRepo.reactivateSequence(sequenceId, changedBy);
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

    const changedBy = req.user?.UserID || req.body.changedBy || 1;
    const result = await sequenceRepo.deleteSequence(sequenceId, changedBy);
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

    const item = await sequenceRepo.getSequenceItemDetails(itemId);
    
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
    const changedBy = req.user?.UserID || req.body.changedBy || 1;
    const result = await sequenceRepo.createSequenceItem(req.body, changedBy);
    res.status(201).json(result);
  } catch (err) {
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

    const changedBy = req.user?.UserID || req.body.changedBy || 1;
    const result = await sequenceRepo.updateSequenceItem(itemId, req.body, changedBy);
    res.status(200).json(result);
  } catch (err) {
    if (err.message === "Sequence item not found") {
      return res.status(404).json({ error: err.message });
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

    const changedBy = req.user?.UserID || req.body.changedBy || 1;
    const result = await sequenceRepo.deleteSequenceItem(itemId, changedBy);
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

    const changedBy = req.user?.UserID || req.body.changedBy || 1;
    const result = await sequenceRepo.createSequenceWithItems(sequence, items, changedBy);
    res.status(201).json(result);
  } catch (err) {
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

    const changedBy = req.user?.UserID || req.body.changedBy || 1;
    const result = await sequenceRepo.assignSequenceToAccount(accountId, sequenceId, changedBy);
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

    const changedBy = req.user?.UserID || req.body.changedBy || 1;
    const result = await sequenceRepo.unassignSequenceFromAccount(accountId, changedBy);
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

    const accounts = await sequenceRepo.getAccountsBySequence(sequenceId);
    res.status(200).json(accounts);
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
};