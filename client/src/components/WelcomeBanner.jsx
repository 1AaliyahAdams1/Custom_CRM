import React, { useState, useEffect } from "react";
import { Box, Typography, Paper } from "@mui/material";
import theme from "./Theme";

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const getCurrentDateTime = () => {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const WelcomeBanner = () => {
  const [greeting, setGreeting] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [username, setUsername] = useState("User");

  useEffect(() => {
    // Read user from localStorage immediately
    const storedUser = JSON.parse(localStorage.getItem("user")) || {};
    const name = storedUser.FirstName || storedUser.username || "User";
    setUsername(name);

    // Update greeting and date
    const updateDateTime = () => {
      setGreeting(getTimeBasedGreeting());
      setCurrentDate(getCurrentDateTime());
    };
    updateDateTime();

    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Paper
      elevation={3}
      sx={{
        background: "linear-gradient(135deg, #c0c0c0 0%, #e0e0e0 100%)", // full silver gradient
        color: theme.palette.text.primary,
        borderRadius: 3,
        p: 4,
        mb: 3,
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "#fafafa50",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
              }}
            >
              👤
            </Box>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: theme.palette.text.primary }}>
              {greeting}, {username}!
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
            Welcome to your CRM dashboard
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, opacity: 0.8 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: "#fafafa50",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              📅
            </Box>
            <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
              {currentDate}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default WelcomeBanner;
