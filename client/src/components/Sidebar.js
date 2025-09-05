import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import WorkspacesOutlineIcon from '@mui/icons-material/WorkspacesOutline';
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
  AdminPanelSettings as AdminPanelSettingsIcon,
  Inventory as InventoryIcon,
  Flag as FlagIcon,
  Settings as SettingsApplicationsIcon,
} from "@mui/icons-material";
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { useAuth } from "../hooks/auth/useAuth";
import { ROUTE_ACCESS } from "../utils/auth/routesAccess";


// Navigation items configuration using centralized route access
const navigation = [
  // {
  //   name: "Dashboard",
  //   href: "/dashboard",
  //   icon: DashboardIcon,
  //   accessKey: "dashboard",
  //   section: "Main",
  // },
  {
    name: "Accounts",
    href: "/accounts",
    icon: BusinessIcon,
    accessKey: "accounts",
    section: "CRM Management",
  },
  {
    name: "Contacts",
    href: "/contacts",
    icon: PeopleIcon,
    accessKey: "contacts",
    section: "CRM Management",
  },
  {
    name: "Deals",
    href: "/deals",
    icon: HandshakeIcon,
    accessKey: "deals",
    section: "CRM Management",
  },
  {
    name: "Activities",
    href: "/activities",
    icon: EventIcon,
    accessKey: "activities",
    section: "CRM Management",
  },
  {
    name: "Products",
    href: "/products",
    icon: InventoryIcon,
    accessKey: "products",
    section: "CRM Management",
  },
  // {
  //   name: "Work Page",
  //   href: "/smart-work",
  //   icon: WorkspacesOutlineIcon,
  //   accessKey: "smartWork",
  //   section: "CRM Management",
  // },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChartIcon,
    accessKey: "reports",
    section: "Analysis & Reports",
  },
  {
    name: "Geographic Data",
    href: "/countries",
    icon: FlagIcon,
    accessKey: "country",
    section: "Misc",
  },
  {
    name: "Industry",
    href: "/industries",
    icon: BusinessIcon,
    accessKey: "industry",
    section: "Misc",
  },
  // {
  //   name: "Role Management",
  //   href: "/rolemanagement",
  //   icon: AdminPanelSettingsIcon,
  //   accessKey: "roles",
  //   section: "Admin",
  // },
  {
    name: "Priority Levels",
    href: "/priority-levels",
    icon: PriorityHighIcon,
    accessKey: "priority",
    section: "Misc",
  },
];


const DRAWER_WIDTH_EXPANDED = 200;
const DRAWER_WIDTH_COLLAPSED = 64;

export function AppSidebar() {
  // Get unique sections from navigation
  const sections = [...new Set(navigation.map(item => item.section))];

  // Track collapsed state per section
  const [collapsedSections, setCollapsedSections] = useState({});

  // Toggle section collapse
  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
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
      return null; // can implement logout button logic here if needed
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
          backgroundColor: isActive ? alpha('#2196F3', 0.2) : "transparent",
          color: isActive ? '#2196F3' : '#ffffff',
          "&:hover": {
            backgroundColor: alpha('#2196F3', 0.15),
            color: '#2196F3',
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
                backgroundColor: '#333333',
                color: '#ffffff',
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
          backgroundColor: "#000000",
          borderRight: `1px solid #333333`,
          top: 0,
          height: "100vh",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Brand Header */}
      {!isCollapsed && (
        <Box
          sx={{
            p: 2,
            pb: 1,
            borderBottom: `1px solid #333333`,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "#ffffff",
              fontSize: "1.1rem",
              textAlign: "center",
              letterSpacing: "0.5px",
            }}
          >
            Entertainment.FM
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: "#2196F3",
              fontSize: "1.1rem",
              textAlign: "center",
              letterSpacing: "0.5px",
            }}
          >
            CRM System
          </Typography>
        </Box>
      )}

      {/* Sidebar Header with Toggle */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "space-between",
          p: 2,
          minHeight: isCollapsed ? 64 : 48,
        }}
      >
        {!isCollapsed && (
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: "#ffffff",
              fontSize: "0.9rem",
              textAlign: "center",
            }}
          >
            Navigation Panel
          </Typography>
        )}
        <IconButton
          onClick={toggleSidebar}
          size="small"
          sx={{
            backgroundColor: alpha("#2196F3", 0.15),
            color: "#2196F3",
            "&:hover": {
              backgroundColor: alpha("#2196F3", 0.25),
            },
          }}
        >
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>

      <Divider sx={{ mx: 1, borderColor: "#333333", display: isCollapsed ? "none" : "block" }} />

      {/* Navigation List - scrollable */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 0,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.2) transparent",
        }}
      >
        {sections.map(section => {
          const isSectionCollapsed = collapsedSections[section];

          return (
            <Box key={section} sx={{ mb: 2 }}>
              {/* Section header */}
              {!isCollapsed && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2,
                    pt: 1,
                    pb: 0.5,
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                  onClick={() => toggleSection(section)}
                >
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: alpha("#ffffff", 0.6),
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {section}
                  </Typography>
                  <IconButton size="small" sx={{ color: alpha("#ffffff", 0.6) }}>
                    {isSectionCollapsed ? <ChevronRight /> : <ChevronLeft />}
                  </IconButton>
                </Box>
              )}

              {/* Section items */}
              {!isSectionCollapsed && (
                <List sx={{ px: 0 }}>
                  {navigation
                    .filter(item => item.section === section)
                    .map(item => renderNavigationItem(item))}
                </List>
              )}

              {/* Optional divider between sections */}
              {!isCollapsed && <Divider sx={{ mx: 1, borderColor: "#333333" }} />}
            </Box>
          );
        })}
      </Box>

      {/* Footer */}
      {!isCollapsed && (
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid #333333`,
            backgroundColor: alpha("#000000", 0.8),
          }}
        >
          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "center",
              color: "#cccccc",
              fontWeight: 500,
            }}
          >
            2025 CRM Prototype v2
          </Typography>
        </Box>
      )}
    </Drawer>

  );
}

export default AppSidebar;