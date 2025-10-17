//PAGE : 404 ERROR PAGE
//Used for when a page cannot be found
import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { SearchOff, ArrowBack, Home } from "@mui/icons-material";
import { useSettings } from "../context/SettingsContext";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { currentTheme, getSpacing } = useSettings();

  return (
    // Container box centered vertically and horizontally
    <Box
      sx={{
        minHeight: "100vh",              // Take full viewport height
        display: "flex",                 // Use flexbox layout
        flexDirection: "column",         // Stack children vertically
        alignItems: "center",            // Center horizontally
        justifyContent: "center",        // Center vertically
        textAlign: "center",             // Center text
        p: getSpacing(3),               // Padding around content
        backgroundColor: currentTheme.background.default
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: getSpacing(6),
          maxWidth: 600,
          width: "100%",
          backgroundColor: currentTheme.background.paper,
          borderRadius: 2
        }}
      >
        {/* Icon for visual indication */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: getSpacing(3)
          }}
        >
          <SearchOff
            sx={{
              fontSize: 80,
              color: currentTheme.text.secondary,
              opacity: 0.5
            }}
          />
        </Box>

        {/* Large 404 heading */}
        <Typography
          variant="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: currentTheme.text.primary,
            fontSize: { xs: "4rem", md: "6rem" },
            mb: getSpacing(2)
          }}
        >
          404
        </Typography>

        {/* Message heading */}
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: currentTheme.text.primary,
            mb: getSpacing(2)
          }}
        >
          Oops! Page not found.
        </Typography>

        {/* Additional info text */}
        <Typography
          variant="body1"
          sx={{
            mb: getSpacing(4),
            color: currentTheme.text.secondary,
            fontSize: "1.1rem"
          }}
        >
          The page you are looking for does not exist or has been moved.
        </Typography>

        {/* Navigation buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            flexWrap: "wrap"
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{
              textTransform: "none",
              borderColor: currentTheme.divider,
              color: currentTheme.text.primary,
              "&:hover": {
                borderColor: currentTheme.primary.main,
                backgroundColor: currentTheme.background.default
              }
            }}
          >
            Go Back
          </Button>

          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={() => navigate("/Dashboard")}
            sx={{
              textTransform: "none",
              backgroundColor: currentTheme.primary.main,
              "&:hover": {
                backgroundColor: currentTheme.primary.dark
              }
            }}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default NotFoundPage;