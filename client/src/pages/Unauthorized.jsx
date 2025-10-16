// pages/Unauthorized.jsx
import React from "react";
import { Typography, Box, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowBack } from "@mui/icons-material";
import { useSettings } from "../context/SettingsContext";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { currentTheme, getSpacing } = useSettings();
  
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: getSpacing(4),
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: getSpacing(3)
          }}
        >
          <Lock
            sx={{
              fontSize: 80,
              color: currentTheme.text.secondary,
              opacity: 0.5
            }}
          />
        </Box>

        <Typography
          variant="h3"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: currentTheme.text.primary,
            mb: getSpacing(2)
          }}
        >
          403 - Unauthorized
        </Typography>

        <Typography
          variant="body1"
          gutterBottom
          sx={{
            color: currentTheme.text.secondary,
            mb: getSpacing(4),
            fontSize: "1.1rem"
          }}
        >
          You don't have permission to access this page.
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: currentTheme.text.secondary,
            mb: getSpacing(4)
          }}
        >
          If you believe this is an error, please contact your administrator or try logging in again.
        </Typography>

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
            onClick={() => navigate("/")}
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

export default Unauthorized;