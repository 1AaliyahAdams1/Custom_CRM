// services/authService.js
const bcrypt = require("bcrypt");
const userRepo = require("../data/userRepository"); // Adjust path as needed

async function login(identifier, password) {
  // Get user by email or username
  const user = await userRepo.getUserByEmailOrUsername(identifier);
  if (!user) {
    throw new Error("User not found");
  }

  // Compare password with stored hash
  const passwordMatches = await bcrypt.compare(password, user.PasswordHash);
  if (!passwordMatches) {
    throw new Error("Invalid password");
  }

  // Remove sensitive info before returning
  const { PasswordHash, Salt, ...safeUser } = user;
  return safeUser;
}


module.exports = {
  login,
};
