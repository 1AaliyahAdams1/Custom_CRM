import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  IconButton,
  Divider,
  Tooltip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Handshake as HandshakeIcon,
  People as PeopleIcon,
  Event as EventIcon,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  BarChart as BarChartIcon,
} from "@mui/icons-material";

import { useAuth } from "../hooks/auth/useAuth";
import { ROUTE_ACCESS } from "../utils/auth/routesAccess";

// Navigation items configuration using centralized route access
const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChartIcon,
    accessKey: "dashboard",
  },
  {
    name: "Accounts",
    href: "/accounts",
    icon: BusinessIcon,
    accessKey: "accounts",
  },
  {
    name: "Contacts",
    href: "/contacts",
    icon: PeopleIcon,
    accessKey: "contacts",
  },
  {
    name: "Deals",
    href: "/deals",
    icon: HandshakeIcon,
    accessKey: "deals",
  },
  {
    name: "Activities",
    href: "/activities",
    icon: EventIcon,
    accessKey: "activities",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: SettingsIcon,
    allowedRoles: ["Admin"], // Keep this one as is since it's not in routesAccess
  },
];

const DRAWER_WIDTH_EXPANDED = 256;
const DRAWER_WIDTH_COLLAPSED = 64;

export function AppSidebar() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Get user roles from auth context
  const { roles = [] } = useAuth() || {}; // fallback to empty array

  const drawerWidth = isCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH_EXPANDED;

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  // Check if user has access to a route
  const hasAccess = (item) => {
    // If item has accessKey, use ROUTE_ACCESS configuration
    if (item.accessKey && ROUTE_ACCESS[item.accessKey]) {
      const allowedRoles = ROUTE_ACCESS[item.accessKey];
      return allowedRoles.length === 0 || allowedRoles.some((role) => roles.includes(role));
    }

    // Fallback to direct allowedRoles (for items like Settings)
    if (item.allowedRoles) {
      return item.allowedRoles.length === 0 || item.allowedRoles.some((role) => roles.includes(role));
    }

    // If no access control defined, allow access
    return true;
  };

  const renderNavigationItem = (item, isLogout = false) => {
    // Skip items the user does not have access to
    if (!hasAccess(item)) return null;

    const isActive = location.pathname === item.href;
    const IconComponent = item.icon;

    if (isLogout) {
      // Handle logout button if needed
      return null; // You can implement logout button logic here if needed
    }

    const listItemContent = (
      <ListItemButton
        component={Link}
        to={item.href}
        sx={{
          borderRadius: 2,
          mx: 1.5,
          mb: 0.5,
          minHeight: 44,
          px: isCollapsed ? 1.5 : 2,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.12) : "transparent",
          color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.primary.main,
            transform: "translateX(2px)",
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: isCollapsed ? 0 : 40,
            justifyContent: "center",
            color: "inherit",
            transition: "all 0.3s ease",
          }}
        >
          <IconComponent sx={{ fontSize: 20 }} />
        </ListItemIcon>

        <ListItemText
          primary={item.name}
          primaryTypographyProps={{
            fontSize: "0.875rem",
            fontWeight: isActive ? 600 : 500,
            lineHeight: 1.25,
          }}
          sx={{
            opacity: isCollapsed ? 0 : 1,
            transition: "opacity 0.3s ease",
            ml: isCollapsed ? 0 : 1,
          }}
        />
      </ListItemButton>
    );

    if (isCollapsed) {
      return (
        <Tooltip
          title={item.name}
          placement="right"
          arrow
          key={item.name}
          componentsProps={{
            tooltip: {
              sx: {
                backgroundColor: theme.palette.grey[800],
                color: theme.palette.common.white,
                fontSize: "0.75rem",
                fontWeight: 500,
              },
            },
          }}
        >
          <ListItem disablePadding>{listItemContent}</ListItem>
        </Tooltip>
      );
    }

    return <ListItem disablePadding key={item.name}>{listItemContent}</ListItem>;
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          top: "64px",
          height: "calc(100vh - 64px)",
          overflowX: "hidden",
        },
      }}
    >
      {/* Sidebar Header with Toggle Button */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "space-between",
          p: 2,
          minHeight: 64,
        }}
      >
        {!isCollapsed && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              fontSize: "1rem",
              opacity: isCollapsed ? 0 : 1,
              transition: "opacity 0.3s ease",
            }}
          >
            Navigation
          </Typography>
        )}

        <IconButton
          onClick={toggleSidebar}
          size="small"
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.primary.main,
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
            },
          }}
        >
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>

      <Divider sx={{ mx: 1 }} />

      {/* Navigation Items */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", pt: 1 }}>
        <List sx={{ flex: 1, px: 0 }}>
          {navigation.map((item) => renderNavigationItem(item))}
        </List>
      </Box>

      {/* Footer */}
      {!isCollapsed && (
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: alpha(theme.palette.background.default, 0.5),
          }}
        >
          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "center",
              color: theme.palette.text.secondary,
              fontWeight: 500,
              opacity: isCollapsed ? 0 : 1,
              transition: "opacity 0.3s ease",
            }}
          >
            CRM MVP v2.0
          </Typography>
        </Box>
      )}
    </Drawer>
  );
}

export default AppSidebar;