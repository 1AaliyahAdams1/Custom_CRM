const authorizeRoleDynamic = require('./hierarchyMiddleware');

const requireRoles = (...roles) => authorizeRoleDynamic(roles);

module.exports = requireRoles;
