const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepo = require("../../data/auth/authRepository"); 
const roleRepo = require("../../data/roleRepository"); 

async function generateToken(user, roles) {
  return jwt.sign(
    {
      userId: user.UserID,
      username: user.Username,
      roles: roles,  // Array of role names
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

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

  // Fetch roles for the user
  const roles = await roleRepo.getUserRoles(user.UserID);

  // Generate JWT token with roles included
  const token = await generateToken(user, roles);

  // Remove sensitive info before returning
  const { PasswordHash, Salt, ...safeUser } = user;

  return { user: safeUser, token };
}

module.exports = {
  login,
};
