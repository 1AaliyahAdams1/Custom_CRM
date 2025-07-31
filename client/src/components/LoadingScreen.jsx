import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const LoadingScreen = ({ message = "Loading, please wait..." }) => {
  return (
    <Box
      sx={{
        height: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "primary.main",
        px: 2,
        textAlign: "center",
      }}
    >
      <CircularProgress color="primary" size={60} thickness={5} />
      <Typography
        variant="h6"
        component="p"
        sx={{ mt: 3, fontWeight: "medium", color: "primary.main" }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingScreen;
