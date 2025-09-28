import React from "react";
import { Paper, Typography, Box } from "@mui/material";

const ChartCard = ({ title, children }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 3,
        p: 3,
        height: "100%",
        background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {title && (
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", mb: 2, color: "#2c3e50" }}
        >
          {title}
        </Typography>
      )}
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Paper>
  );
};

export default ChartCard;
