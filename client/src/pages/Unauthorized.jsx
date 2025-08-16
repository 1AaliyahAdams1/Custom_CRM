// pages/Unauthorized.jsx
import React from "react";
import {Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  
  console.log("Unauthorized component is rendering");

  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      p={4}
    >
      <Typography variant="h3" gutterBottom>
        403 - Unauthorized
      </Typography>
      <Typography variant="body1" gutterBottom>
        You don't have permission to access this page.
      </Typography>
    </Box>
  );
};

// Make sure we have a default export
export default Unauthorized;