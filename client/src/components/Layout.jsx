import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  const location = useLocation();
  const hideLayout = location.pathname === "/login";
  const user = localStorage.getItem("user");
  const showLayout = !hideLayout && user;

  // State to track header height and sidebar width
  const [headerHeight, setHeaderHeight] = useState(64); // default MUI appbar height
  const [sidebarWidth, setSidebarWidth] = useState(240); // default sidebar width

  // Optional: detect header scroll behavior
  const [headerHidden, setHeaderHidden] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setHeaderHidden(window.scrollY > 100); // hide header after 100px
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {showLayout && (
        <Sidebar
          width={sidebarWidth}
          sx={{
            flexShrink: 0,
            transition: "width 0.3s",
          }}
        />
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          marginLeft: 0, // sidebar pushes content, so no hard margin
          transition: "margin 0.3s",
        }}
      >
        {showLayout && (
          <Header
            sx={{
              height: headerHeight,
              transform: headerHidden ? "translateY(-100%)" : "translateY(0)",
              transition: "transform 0.3s",
              position: "sticky",
              top: 0,
              zIndex: 1200,
            }}
          />
        )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: `calc(100vh - ${headerHidden ? 0 : headerHeight}px)`,
            overflowY: "auto",
            p: 3,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
