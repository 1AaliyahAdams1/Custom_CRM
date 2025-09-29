const sequenceRepo = require("../data/sequenceRepository");

//======================================
// Get all sequences
//======================================
const getAllSequences = async (onlyActive = true) => {
  const sequences = await sequenceRepo.getAllSequences();
  if (onlyActive) {
    return sequences.filter(seq => seq.Active);
  }
  return sequences;
};

//======================================
// Get sequence by ID
//======================================
const getSequenceByID = async (sequenceId) => {
  return await sequenceRepo.getSequenceDetails(sequenceId);
};

//======================================
// Get sequence with all items
//======================================
const getSequenceWithItems = async (sequenceId) => {
  const data = await sequenceRepo.getSequenceWithItems(sequenceId);
  
  if (!data || data.length === 0) {
    return null;
  }

  // Transform flat result into nested structure
  const sequence = {
    SequenceID: data[0].SequenceID,
    SequenceName: data[0].SequenceName,
    SequenceDescription: data[0].SequenceDescription,
    CreatedAt: data[0].SequenceCreatedAt,
    UpdatedAt: data[0].SequenceUpdatedAt,
    Active: data[0].SequenceActive,
    Items: []
  };

  // Add items if they exist
  data.forEach(row => {
    if (row.SequenceItemID) {
      sequence.Items.push({
        SequenceItemID: row.SequenceItemID,
        TypeID: row.TypeID,
        ActivityTypeName: row.ActivityTypeName,
        SequenceItemDescription: row.SequenceItemDescription,
        DaysFromStart: row.DaysFromStart,
        PriorityLevelID: row.PriorityLevelID,
        PriorityLevelName: row.PriorityLevelName,
        PriorityLevelValue: row.PriorityLevelValue,
        CreatedAt: row.ItemCreatedAt,
        UpdatedAt: row.ItemUpdatedAt,
        Active: row.ItemActive
      });
    }
  });

  return sequence;
};

//======================================
// Create sequence
//======================================
const createSequence = async (sequenceData) => {
  const { SequenceName, SequenceDescription } = sequenceData;

  if (!SequenceName) {
    throw new Error("Sequence name is required");
  }

  return await sequenceRepo.createSequence(sequenceData, null);
};

//======================================
// Update sequence
//======================================
const updateSequence = async (sequenceId, sequenceData) => {
  return await sequenceRepo.updateSequence(sequenceId, sequenceData, null);
};

//======================================
// Deactivate sequence
//======================================
const deactivateSequence = async (sequenceId) => {
  return await sequenceRepo.deactivateSequence(sequenceId, null);
};

//======================================
// Reactivate sequence
//======================================
const reactivateSequence = async (sequenceId) => {
  return await sequenceRepo.reactivateSequence(sequenceId, null);
};

//======================================
// Delete sequence
//======================================
const deleteSequence = async (sequenceId) => {
  return await sequenceRepo.deleteSequence(sequenceId, null);
};

//======================================
// Get sequence item by ID
//======================================
const getSequenceItemByID = async (itemId) => {
  return await sequenceRepo.getSequenceItemDetails(itemId);
};

//======================================
// Create sequence item
//======================================
const createSequenceItem = async (itemData) => {
  const { SequenceID, TypeID, SequenceItemDescription, DaysFromStart, PriorityLevelID } = itemData;

  if (!SequenceID || !TypeID || !SequenceItemDescription || DaysFromStart === undefined || !PriorityLevelID) {
    throw new Error("Missing required sequence item fields");
  }

  return await sequenceRepo.createSequenceItem(itemData, null);
};

//======================================
// Update sequence item
//======================================
const updateSequenceItem = async (itemId, itemData) => {
  return await sequenceRepo.updateSequenceItem(itemId, itemData, null);
};

//======================================
// Delete sequence item
//======================================
const deleteSequenceItem = async (itemId) => {
  return await sequenceRepo.deleteSequenceItem(itemId, null);
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
};