const roleRepo = require("../../data/auth/roleRepository");

async function getUserRoles(userId) {
  return await roleRepo.getUserRoles(userId);
}

module.exports = {
  getUserRoles,
};