const activityRepository = require("../data/activityRepository");
const activityContactRepo = require("../data/activityContactRepo");
const notesRepo = require("../data/noteRepository");
const attachmentsRepo = require("../data/attachmentRepository");


async function getActivityDetails(id) {
  try {
    // Business logic for validating input data,
    // applying rules or modifying activityData before creation
    const activity = await activityRepository.getActivityDetails(id);
    if (!activity) {
      throw new Error("Activity not found");
    }

    const [notes, attachments, activityContacts] = await Promise.all([
      notesRepo.getNotes(id, "Activity"),
      attachmentsRepo.getAttachments(id, "Activity"),
      activityContactRepo.getContactsByActivityId(id),
    ]);

    return {
      ...activity,
      notes,
      attachments,
      activityContacts,
    };
  } catch (error) {
    throw error;
  }
}

async function createActivity(activityData) {
  try {
    // Business logic for validating input data,
    // applying rules or modifying activityData before creation
    return await activityRepository.createActivity(activityData);
  } catch (error) {
    throw error;
  }
}

async function updateActivity(id, activityData) {
  try {
    // Business logic for validating update data,
    // checking permissions, detecting changes, etc.
    return await activityRepository.updateActivity(id, activityData);
  } catch (error) {
    throw error;
  }
}

async function deleteActivity(id) {
  try {
    // Business logic to check if deletion is allowed,
    // handle cascading deletes or archiving
    return await activityRepository.deleteActivity(id);
  } catch (error) {
    throw error;
  }
}

async function getActivityDetails(id) {
  try {
    // Business logic to enrich or transform details can be added here
    return await activityRepository.getActivityDetails(id);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAllActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityDetails,
};
