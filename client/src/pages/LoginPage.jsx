//PAGE: Login Page
//NOTE : There is no functionality yet

//IMPORTS
import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography } from "@mui/material";

const LoginPage = () => {
  const navigate = useNavigate(); // Hook to programmatically navigate between routes

  // Handles form submission for login
  const handleLogin = (e) => {
    e.preventDefault();           // Prevents default form submit behavior (page reload)
    navigate("/dashboard");       // Redirect user to dashboard on login (no actual auth here)
  };

  return (
    // Container Box to center the form and set width and margin
    <Box sx={{ width: 300, mx: "auto", mt: 20 }}>
      {/* Page title */}
      <Typography variant="h5" mb={2}>Login</Typography>

      {/* Login form */}
      <form onSubmit={handleLogin}>
        {/* Email input field */}
        <TextField
          label="Email"
          name="email"
          fullWidth               // Input takes full container width
          margin="normal"         // Adds vertical margin
        />
        {/* Password input field */}
        <TextField
          label="Password"
          name="password"
          type="password"         // Masks input characters
          fullWidth
          margin="normal"
        />
        {/* Submit button */}
        <Button
          type="submit"
          variant="contained"
          fullWidth               // Button takes full container width
          sx={{ mt: 2 }}          // Adds top margin
        >
          Login
        </Button>
      </form>
    </Box>
  );
};

export default LoginPage;
