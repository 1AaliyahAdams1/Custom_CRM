import React from "react";
import { Box, CircularProgress, Typography, useTheme } from "@mui/material";

const LoadingScreen = ({ message = "Loading, please wait..." }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: "100vh",
        bgcolor: theme.palette.grey[100], // Light silver background
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        textAlign: "center",
      }}
    >
      <CircularProgress
        size={60}
        thickness={5}
        sx={{
          color: theme.palette.grey[600], // Darker silver for spinner
        }}
      />
      <Typography
        variant="h6"
        component="p"
        sx={{
          mt: 3,
          fontWeight: 500,
          color: theme.palette.grey[800], // Dark text for contrast
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingScreen;
