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
        ActivityTypeID: row.ActivityTypeID,
        ActivityTypeName: row.ActivityTypeName,
        SequenceItemDescription: row.SequenceItemDescription,
        DaysFromStart: row.DaysFromStart,
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

  if (SequenceName.trim().length < 1) {
    throw new Error("Sequence name is required");
  }

  if (SequenceName.length > 255) {
    throw new Error("Sequence name cannot exceed 255 characters");
  }

  if (SequenceDescription && SequenceDescription.length > 4000) {
    throw new Error("Sequence description cannot exceed 4000 characters");
  }

  return await sequenceRepo.createSequence(sequenceData, null);
};

//======================================
// Update sequence
//======================================
const updateSequence = async (sequenceId, sequenceData) => {
  const { SequenceName, SequenceDescription } = sequenceData;

  if (SequenceName !== undefined) {
    if (!SequenceName || SequenceName.trim().length === 0) {
      throw new Error("Sequence name is required");
    }
    if (SequenceName.trim().length < 1) {
      throw new Error("Sequence name must be at least 3 characters long");
    }
    if (SequenceName.length > 255) {
      throw new Error("Sequence name cannot exceed 255 characters");
    }
  }

  if (SequenceDescription && SequenceDescription.length > 4000) {
    throw new Error("Sequence description cannot exceed 4000 characters");
  }

  return await sequenceRepo.updateSequence(sequenceId, sequenceData, null);
};

//======================================
// Get all sequence items
//======================================
const getAllSequenceItems = async () => {
  return await sequenceRepo.getAllSequenceItems();
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
  const { SequenceID, ActivityTypeID, SequenceItemDescription, DaysFromStart } = itemData;

  if (!SequenceID) {
    throw new Error("Sequence ID is required");
  }

  if (!ActivityTypeID) {
    throw new Error("Activity Type is required");
  }

  if (!SequenceItemDescription || SequenceItemDescription.trim().length === 0) {
    throw new Error("Sequence item description is required");
  }

  if (SequenceItemDescription.length > 255) {
    throw new Error("Sequence item description cannot exceed 255 characters");
  }

  if (DaysFromStart === undefined || DaysFromStart === null) {
    throw new Error("Days from start is required");
  }

  if (DaysFromStart < 0) {
    throw new Error("Days from start cannot be negative");
  }

  if (DaysFromStart > 32767) {
    throw new Error("Days from start cannot exceed 32767");
  }

  return await sequenceRepo.createSequenceItem(itemData, null);
};

//======================================
// Update sequence item
//======================================
const updateSequenceItem = async (itemId, itemData) => {
  const { ActivityTypeID, SequenceItemDescription, DaysFromStart } = itemData;

  if (ActivityTypeID !== undefined && !ActivityTypeID) {
    throw new Error("Activity Type is required");
  }

  if (SequenceItemDescription !== undefined) {
    if (!SequenceItemDescription || SequenceItemDescription.trim().length === 0) {
      throw new Error("Sequence item description is required");
    }
    if (SequenceItemDescription.length > 255) {
      throw new Error("Sequence item description cannot exceed 255 characters");
    }
  }

  if (DaysFromStart !== undefined) {
    if (DaysFromStart < 0) {
      throw new Error("Days from start cannot be negative");
    }
    if (DaysFromStart > 32767) {
      throw new Error("Days from start cannot exceed 32767");
    }
  }

  return await sequenceRepo.updateSequenceItem(itemId, itemData, null);
};

//======================================
// Delete sequence item
//======================================
const deleteSequenceItem = async (itemId) => {
  return await sequenceRepo.deleteSequenceItem(itemId, null);
};

//======================================
// Create sequence with items
//======================================
const createSequenceWithItems = async (sequenceData, items) => {
  const { SequenceName, SequenceDescription } = sequenceData;

  // Validate sequence
  if (!SequenceName || SequenceName.trim().length === 0) {
    throw new Error("Sequence name is required");
  }

  if (SequenceName.trim().length < 1) {
    throw new Error("Sequence name is required");
  }

  if (SequenceName.length > 255) {
    throw new Error("Sequence name cannot exceed 255 characters");
  }

  if (SequenceDescription && SequenceDescription.length > 4000) {
    throw new Error("Sequence description cannot exceed 4000 characters");
  }

  // Validate items
  if (!items || items.length === 0) {
    throw new Error("At least one sequence item is required");
  }

  // Validate each item
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    if (!item.ActivityTypeID) {
      throw new Error(`Item ${i + 1}: Activity Type is required`);
    }

    if (!item.SequenceItemDescription || item.SequenceItemDescription.trim().length === 0) {
      throw new Error(`Item ${i + 1}: Description is required`);
    }

    if (item.SequenceItemDescription.length > 255) {
      throw new Error(`Item ${i + 1}: Description cannot exceed 255 characters`);
    }

    if (item.DaysFromStart === undefined || item.DaysFromStart === null) {
      throw new Error(`Item ${i + 1}: Days from start is required`);
    }

    if (item.DaysFromStart < 0) {
      throw new Error(`Item ${i + 1}: Days from start cannot be negative`);
    }

    if (item.DaysFromStart > 32767) {
      throw new Error(`Item ${i + 1}: Days from start cannot exceed 32767`);
    }
  }

  return await sequenceRepo.createSequenceWithItems(sequenceData, items, null);
};

//======================================
// Deactivate sequence item
//======================================
const deactivateSequenceItem = async (itemId) => {
  return await sequenceRepo.deactivateSequenceItem(itemId, null);
};

//======================================
// Reactivate sequence item
//======================================
const reactivateSequenceItem = async (itemId) => {
  return await sequenceRepo.reactivateSequenceItem(itemId, null);
};

//======================================
// Assign sequence to account
//======================================
const assignSequenceToAccount = async (accountId, sequenceId) => {
  if (!accountId || !sequenceId) {
    throw new Error("Both AccountID and SequenceID are required");
  }

  return await sequenceRepo.assignSequenceToAccount(accountId, sequenceId, null);
};

//======================================
// Unassign sequence from account
//======================================
const unassignSequenceFromAccount = async (accountId) => {
  if (!accountId) {
    throw new Error("AccountID is required");
  }

  return await sequenceRepo.unassignSequenceFromAccount(accountId, null);
};

//======================================
// Get accounts using a sequence
//======================================
const getAccountsBySequence = async (sequenceId) => {
  return await sequenceRepo.getAccountsBySequence(sequenceId);
};

//======================================
// Get all activity types (for dropdown)
//======================================
const getAllActivityTypes = async () => {
  return await sequenceRepo.getAllActivityTypes();
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
  deactivateSequenceItem,
  reactivateSequenceItem,
  deleteSequenceItem,
  createSequenceWithItems,
  assignSequenceToAccount,
  unassignSequenceFromAccount,
  getAccountsBySequence,
  getAllActivityTypes,
  getAllSequenceItems,
};