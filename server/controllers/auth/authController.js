const authService = require("../../services/auth/authService");

async function login(req, res) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Email/Username and password are required." });
    }

    const user = await authService.login(identifier, password);

    // user is already safe (no PasswordHash or Salt)
    res.json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    // Return error for invalid credentials or other issues
    res.status(401).json({ message: error.message || "Authentication failed" });
  }
}

module.exports = {
  login,
};
