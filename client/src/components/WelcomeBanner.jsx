import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Avatar, useTheme } from "@mui/material";

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
  const theme = useTheme();
  const [greeting, setGreeting] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [username, setUsername] = useState("User");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user")) || {};
    const name = storedUser.FirstName || storedUser.Username || "User";
    setUsername(name);

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
      elevation={4}
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main}33 0%, ${theme.palette.primary.dark}1A 100%)`,
        color: theme.palette.text.primary,
        borderRadius: 3,
        p: { xs: 3, md: 5 },
        mb: 4,
        boxShadow: theme.shadows[4],
        transition: "all 0.3s ease",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: theme.palette.secondary.main,
                fontSize: "1.5rem",
              }}
            >
              {username.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              {greeting}, {username}!
            </Typography>
          </Box>
          <Typography variant="h6" color="text.secondary">
            Welcome to your CRM dashboard
          </Typography>
        </Box>

        <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              opacity: 0.85,
              mt: { xs: 2, md: 0 },
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: theme.palette.background.default,
                color: theme.palette.text.primary,
              }}
            >
              📅
            </Avatar>
            <Typography variant="body1" color="text.primary">
              {currentDate}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default WelcomeBanner;
