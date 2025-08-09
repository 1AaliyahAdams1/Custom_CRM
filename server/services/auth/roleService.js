const roleRepo = require("../../data/roleRepo");

async function getUserRoles(userId) {
  return await roleRepo.getUserRoles(userId);
}

module.exports = {
  getUserRoles,
};
