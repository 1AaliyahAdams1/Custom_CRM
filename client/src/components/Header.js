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


const Header = () => {
  const navigate = useNavigate();
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
    <AppBar position="sticky" sx={{ backgroundColor: "#000", height: "82px" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "flex-end", color: "#fff", height: "200px" }}>

        <Box display="flex" alignItems="center" gap={1}>
          <TriggerEFMSyncButton />

          {user ? (
            <>
              <AccountCircleIcon sx={{ color: "#fff" }} />
              <Typography sx={{ color: "#fff" }}>
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
                  Tour
                </Typography>
              </Box>

              {/* Settings Section - clickable */}
              <Box
                display="flex"
                alignItems="center"
                gap={0.5}
                sx={{
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 1,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    backgroundColor: "rgba(33, 150, 243, 0.15)", // Blue hover like navbar
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

              {/* Logout Section - clickable */}
              <Box
                display="flex"
                alignItems="center"
                gap={0.5}
                sx={{
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 1,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    backgroundColor: "rgba(33, 150, 243, 0.15)", // Blue hover like navbar
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
            <Typography sx={{ color: "#fff" }}>Not logged in</Typography>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;