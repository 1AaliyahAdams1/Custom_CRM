const roleService = require("../services/roleService");

async function getRolesByUserId(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const roles = await roleService.getUserRoles(userId);
    res.json({ roles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching roles" });
  }
}

module.exports = { getRolesByUserId };
