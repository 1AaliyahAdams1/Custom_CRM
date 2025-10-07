import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth/authService";
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import TourIcon from '@mui/icons-material/Tour';
import TriggerEFMSyncButton from './TriggerEFMSyncButton';
import { startTour } from "../hooks/useOnboarding";
import { useSettings } from "../context/SettingsContext";

const Header = () => {
  const navigate = useNavigate();
  const { currentTheme } = useSettings();
  
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate("/login");
  };

  const handleTour = () => {
    setTimeout(() => {
      startTour();
    }, 300);
  };

  useEffect(() => {
    const onStorageChange = () => {
      const savedUser = localStorage.getItem("user");
      setUser(savedUser ? JSON.parse(savedUser) : null);
    };

    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, []);

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        backgroundColor: currentTheme.background.paper,
        borderBottom: `1px solid ${currentTheme.divider}`,
        height: "82px",
        transition: 'all 0.3s ease'
      }}
    >
      <Toolbar 
        sx={{ 
          display: "flex", 
          justifyContent: "flex-end", 
          color: currentTheme.text.primary, 
          height: "100%",
          transition: 'all 0.3s ease'
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <TriggerEFMSyncButton />

          {user ? (
            <>
              <AccountCircleIcon sx={{ color: currentTheme.text.primary }} />
              <Typography sx={{ color: currentTheme.text.primary }}>
                {user.Username}
              </Typography>

              <Box
                display="flex"
                alignItems="center"
                gap={0.5}
                sx={{
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 1,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  color: currentTheme.text.primary,
                  "&:hover": {
                    backgroundColor: "rgba(33, 150, 243, 0.15)",
                    color: '#2196F3',
                  }
                }}
                onClick={handleTour}
              >
                <TourIcon sx={{ color: "inherit", fontSize: 20 }} />
                <Typography
                  sx={{
                    color: "inherit",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  User Guide
                </Typography>
              </Box>

              <Box
                display="flex"
                alignItems="center"
                gap={0.5}
                sx={{
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 1,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  color: currentTheme.text.primary,
                  "&:hover": {
                    backgroundColor: "rgba(33, 150, 243, 0.15)",
                    color: '#2196F3',
                  }
                }}
                onClick={() => navigate("/settings")}
              >
                <SettingsIcon sx={{ color: "inherit", fontSize: 20 }} />
                <Typography
                  sx={{
                    color: "inherit",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  Settings
                </Typography>
              </Box>

              <Box
                display="flex"
                alignItems="center"
                gap={0.5}
                sx={{
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 1,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  color: currentTheme.text.primary,
                  "&:hover": {
                    backgroundColor: "rgba(33, 150, 243, 0.15)",
                    color: '#2196F3',
                  }
                }}
                onClick={handleLogout}
              >
                <LogoutIcon sx={{ color: "inherit", fontSize: 20 }} />
                <Typography
                  sx={{
                    color: "inherit",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  Logout
                </Typography>
              </Box>
            </>
          ) : (
            <Typography sx={{ color: currentTheme.text.primary }}>Not logged in</Typography>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;