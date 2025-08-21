const assignedUserService = require("../services/assignUserService");
const employeeRepository = require("../data/employeeRepository");

async function claimAccount(req, res) {
  try {
    const userId = req.user.userId; 
    const accountId = req.params.id;

    await assignedUserService.claimAccount(userId, accountId);
    
    res.status(200).json({ 
      message: "Account claimed successfully",
      accountId: accountId,
      userId: userId 
    });

  } catch (err) {
    console.error("Error claiming account:", err);
    res.status(400).json({ 
      error: err.message || "Failed to claim account" 
    });
  }
}

async function assignUser(req, res) {
  try {
    const { employeeId } = req.body; // Expect employeeId from frontend
    const accountId = req.params.id;

    if (!employeeId) {
      return res.status(400).json({ error: "employeeId is required" });
    }

    // Convert employeeId to userId using your existing repository function
    const userId = await employeeRepository.getUserIdByEmployeeId(employeeId);
    
    if (!userId) {
      return res.status(400).json({ error: "No user found for this employee" });
    }

    // Now pass the userId to the service
    await assignedUserService.assignUser(userId, accountId);
    
    res.status(200).json({ 
      message: "User assigned successfully",
      accountId: accountId,
      employeeId: employeeId,
      userId: userId 
    });

  } catch (err) {
    console.error("Error assigning user:", err);
    res.status(400).json({ 
      error: err.message || "Failed to assign user" 
    });
  }
}

module.exports = { claimAccount, assignUser };