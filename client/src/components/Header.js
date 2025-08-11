import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth/authService";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

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

  useEffect(() => {
    const onStorageChange = () => {
      const savedUser = localStorage.getItem("user");
      setUser(savedUser ? JSON.parse(savedUser) : null);
    };

    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, []);

  return (
    <AppBar position="static" sx={{ backgroundColor: "#000" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", color: "#fff" }}>
        <Typography variant="h6" sx={{ color: "#fff" }}>
          Entertainment.FM CRM
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
          {user ? (
            <>
              <Typography sx={{ color: "#fff" }}>
                {user.FirstName} {user.LastName}
              </Typography>
              <Button onClick={handleLogout} sx={{ color: "#fff" }}>
                Logout
              </Button>
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
