//PAGE : 404 ERROR PAGE
//Used for when a page cannot be found
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    // Container box centered vertically and horizontally
    <Box
      sx={{
        height: "80vh",              // Take most of viewport height
        display: "flex",             // Use flexbox layout
        flexDirection: "column",     // Stack children vertically
        alignItems: "center",        // Center horizontally
        justifyContent: "center",    // Center vertically
        textAlign: "center",         // Center text
        p: 3,                       // Padding around content
      }}
    >
      {/* Large 404 heading */}
      <Typography variant="h2" gutterBottom>
        404
      </Typography>

      {/* Message heading */}
      <Typography variant="h5" gutterBottom>
        Oops! Page not found.
      </Typography>

      {/* Additional info text */}
      <Typography sx={{ mb: 3 }}>
        The page you are looking for does not exist.
      </Typography>

      {/* Button to navigate back to homepage */}
      <Button variant="contained" onClick={() => navigate("/Dashboard")}>
        Go to Home
      </Button>
    </Box>
  );
};

export default NotFoundPage;
