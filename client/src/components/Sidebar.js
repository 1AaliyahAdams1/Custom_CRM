import React, { useState, useMemo } from "react";
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
  AdminPanelSettings as AdminPanelSettingsIcon,
  Inventory as InventoryIcon,
  Flag as FlagIcon,
} from "@mui/icons-material";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import WorkspacesOutlineIcon from "@mui/icons-material/WorkspacesOutline";

import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import WorkIcon from '@mui/icons-material/Work';
import DiscountIcon from '@mui/icons-material/Discount';

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
  {
    name: "Companies",
    href: "/companies",
    icon: CorporateFareIcon,
    accessKey: "companies",
    section: "CRM Management",
  },
  {
    name: "Events",
    href: "/events",
    icon: EventIcon,
    accessKey: "events",
    section: "CRM Management",
  },
  {
    name: "Owners",
    href: "/owners",
    icon: WorkIcon,
    accessKey: "owners",
    section: "CRM Management",
  },
  {
    name: "Discount Codes",
    href: "/discount-codes",
    icon: DiscountIcon,
    accessKey: "discountcodes",
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


// Sidebar width
const DRAWER_WIDTH_EXPANDED = 200;
const DRAWER_WIDTH_COLLAPSED = 64;

// Navigation configuration
const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: DashboardIcon, accessKey: "dashboard", section: "Main" },
  { name: "Accounts", href: "/accounts", icon: BusinessIcon, accessKey: "accounts", section: "CRM Management" },
  { name: "Contacts", href: "/contacts", icon: PeopleIcon, accessKey: "contacts", section: "CRM Management" },
  { name: "Deals", href: "/deals", icon: HandshakeIcon, accessKey: "deals", section: "CRM Management" },
  { name: "Activities", href: "/activities", icon: EventIcon, accessKey: "activities", section: "CRM Management" },
  { name: "Products", href: "/products", icon: InventoryIcon, accessKey: "products", section: "CRM Management" },
  { name: "Smart Work", href: "/smart-work", icon: WorkspacesOutlineIcon, accessKey: "smartWork", section: "CRM Management" },
  { name: "Reports", href: "/reports", icon: BarChartIcon, accessKey: "reports", section: "Analysis & Reports" },
  { name: "Geographic Data", href: "/countries", icon: FlagIcon, accessKey: "country", section: "Misc" },
  { name: "Industry", href: "/industries", icon: BusinessIcon, accessKey: "industry", section: "Misc" },
  { name: "Role Management", href: "/rolemanagement", icon: AdminPanelSettingsIcon, accessKey: "roles", section: "Admin" },
  { name: "Priority Levels", href: "/priority-levels", icon: PriorityHighIcon, accessKey: "priority", section: "Misc" },
];

export function AppSidebar() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const roles = user?.roles || [];

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState(
    NAV_ITEMS.reduce((acc, item) => ({ ...acc, [item.section]: false }), {})
  );

  const drawerWidth = isCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH_EXPANDED;

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleSection = (section) => setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  // Check role access for a route
  const hasAccess = (accessKey) => {
    if (!accessKey || !ROUTE_ACCESS[accessKey]) return true;
    const allowedRoles = ROUTE_ACCESS[accessKey].map(r => r.toLowerCase());
    const userRoles = roles.map(r => r.toLowerCase());
    return allowedRoles.some(role => userRoles.includes(role));
  };

  // Filter navigation by access
  const accessibleNavigation = useMemo(() => NAV_ITEMS.filter(item => hasAccess(item.accessKey)), [roles]);

  // Get unique sections that have at least one accessible item
  const sections = useMemo(() => {
    const secSet = new Set();
    accessibleNavigation.forEach(item => secSet.add(item.section));
    return Array.from(secSet);
  }, [accessibleNavigation]);

  // Render individual navigation item
  const renderNavigationItem = (item) => {
    const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + "/");
    const IconComponent = item.icon;

    const content = (
      <ListItemButton
        component={Link}
        to={item.href}
        sx={{
          borderRadius: 2,
          mx: 1.5,
          mb: 0.5,
          minHeight: 44,
          px: isCollapsed ? 1.5 : 2,
          transition: "all 0.3s",
          backgroundColor: isActive ? alpha('#2196F3', 0.2) : "transparent",
          color: isActive ? '#2196F3' : '#ffffff',
          "&:hover": {
            backgroundColor: alpha('#2196F3', 0.15),
            color: '#2196F3',
            transform: "translateX(2px)",
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 40, justifyContent: "center", color: "inherit" }}>
          <IconComponent sx={{ fontSize: 20 }} />
        </ListItemIcon>
        <ListItemText
          primary={item.name}
          primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: isActive ? 600 : 500 }}
          sx={{ opacity: isCollapsed ? 0 : 1, ml: isCollapsed ? 0 : 1 }}
        />
      </ListItemButton>
    );

    if (isCollapsed) {
      return (
        <Tooltip title={item.name} placement="right" arrow key={item.href}>
          <ListItem disablePadding>{content}</ListItem>
        </Tooltip>
      );
    }

    return <ListItem disablePadding key={item.href}>{content}</ListItem>;
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#000000",
          borderRight: `1px solid #333333`,
          height: "100vh",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Brand */}
      {!isCollapsed && (
        <Box sx={{ p: 2, pb: 1, borderBottom: `1px solid #333333` }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#ffffff", textAlign: "center" }}>
            Entertainment.FM
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#2196F3", textAlign: "center" }}>
            CRM System
          </Typography>
        </Box>
      )}

      {/* Sidebar Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: isCollapsed ? "center" : "space-between", p: 2, minHeight: 48 }}>
        {!isCollapsed && <Typography sx={{ fontWeight: 600, color: "#ffffff" }}>Navigation Panel</Typography>}
        <IconButton onClick={toggleSidebar} size="small" sx={{ backgroundColor: alpha("#2196F3", 0.15), color: "#2196F3", "&:hover": { backgroundColor: alpha("#2196F3", 0.25) } }}>
          {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>

      <Divider sx={{ mx: 1, borderColor: "#333333", display: isCollapsed ? "none" : "block" }} />

      {/* Navigation Sections */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {sections.map(section => {
          const items = accessibleNavigation.filter(item => item.section === section);
          if (items.length === 0) return null;
          const isSectionCollapsed = collapsedSections[section];

          return (
            <Box key={section} sx={{ mb: 2 }}>
              {!isCollapsed && (
                <Box onClick={() => toggleSection(section)} sx={{ display: "flex", justifyContent: "space-between", px: 2, pt: 1, cursor: "pointer" }}>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: alpha("#ffffff", 0.6), textTransform: "uppercase" }}>
                    {section}
                  </Typography>
                  <IconButton size="small" sx={{ color: alpha("#ffffff", 0.6) }}>
                    {isSectionCollapsed ? <ChevronRight /> : <ChevronLeft />}
                  </IconButton>
                </Box>
              )}
              {!isSectionCollapsed && <List sx={{ px: 0 }}>{items.map(renderNavigationItem)}</List>}
              {!isCollapsed && <Divider sx={{ mx: 1, borderColor: "#333333" }} />}
            </Box>
          );
        })}
      </Box>

      {/* Footer */}
      {!isCollapsed && (
        <Box sx={{ p: 2, borderTop: `1px solid #333333` }}>
          <Typography variant="caption" sx={{ display: "block", textAlign: "center", color: "#cccccc" }}>
            2025 CRM Prototype v2
          </Typography>
        </Box>
      )}
    </Drawer>
  );
}

export default AppSidebar;
