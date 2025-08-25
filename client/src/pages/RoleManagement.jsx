import React, { useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    Chip,
    Select,
    MenuItem,
    FormControl,
    TextField,
    Button,
    Grid,
    IconButton,
    Menu,
    InputAdornment,
    Container,
    Paper
} from "@mui/material";
import {
    Search,
    Add,
    People,
    Security,
    PersonAdd,
    Visibility,
    MoreHoriz,
    Edit,
    Delete
} from "@mui/icons-material";
import theme from "../components/Theme";

import WIPBanner from '../components/WIPBanner';

const RoleManagement = () => {
    const mockUsers = [
        {
            id: "1",
            name: "Sarah Johnson",
            email: "sarah.johnson@clevels.com",
            role: "Admin",
            department: "Engineering",
            joinDate: "Jan 2023",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face"
        },
        {
            id: "2", name: "Michael Chen",
            email: "michael.chen@clevels.com",
            role: "Manager",
            department: "Product",
            joinDate: "Mar 2023"
        },
        {
            id: "3", name: "Emily Rodriguez",
            email: "emily.rodriguez@clevels.com",
            role: "Employee",
            department: "Design",
            joinDate: "Jun 2023"
        },
        {
            id: "4", name: "David Kim",
            email: "david.kim@clevels.com",
            role: "Employee",
            department: "Engineering",
            joinDate: "Feb 2023"
        },
        {
            id: "5", name: "Lisa Thompson",
            email: "lisa.thompson@clevels.com",
            role: "Viewer",
            department: "Marketing",
            joinDate: "Aug 2023"
        },
        {
            id: "6", name: "Alex Morgan",
            email: "alex.morgan@clevels.com",
            role: "Manager",
            department: "Sales",
            joinDate: "Apr 2023"
        }
    ];

    const [users, setUsers] = useState(mockUsers);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    const roleColors = {
        Admin: { background: "#050505", color: "#fafafa" },
        Manager: { background: "#333333", color: "#fafafa" },
        Employee: { background: "#666666", color: "#fafafa" },
        Viewer: { background: "#999999", color: "#fafafa" }
    };

    const RoleBadge = ({ role }) => (
        <Chip
            label={role}
            size="small"
            sx={{
                backgroundColor: roleColors[role].background,
                color: roleColors[role].color,
                fontWeight: "500",
                "&:hover": { opacity: 0.9 }
            }}
        />
    );

    const handleRoleChange = (userId, newRole) => {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    };

    const handleMenuClick = (event, user) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedUser(null);
    };

    const handleEdit = (userId) => {
        console.log("Edit user:", userId);
        handleMenuClose();
    };

    const handleRemove = (userId) => {
        setUsers(users.filter(u => u.id !== userId));
        handleMenuClose();
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.department.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === "All" || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const roleStats = {
        Admin: users.filter(u => u.role === "Admin").length,
        Manager: users.filter(u => u.role === "Manager").length,
        Employee: users.filter(u => u.role === "Employee").length,
        Viewer: users.filter(u => u.role === "Viewer").length
    };

    const UserCard = ({ user }) => {
        const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase();

        return (
            <Card
                sx={{
                    mb: 2,
                    bgcolor: theme.palette.background.paper,
                    boxShadow: "0 4px 12px -2px rgba(0,0,0,0.08)",
                    "&:hover": {
                        boxShadow: "0 8px 25px -4px rgba(0,0,0,0.12)",
                        transform: "translateY(-1px)"
                    },
                    transition: "all 0.2s ease-in-out"
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" flex={1}>
                            <Avatar
                                src={user.avatar}
                                sx={{
                                    width: 48,
                                    height: 48,
                                    mr: 2,
                                    border: `2px solid ${theme.palette.divider}`
                                }}
                            >
                                {initials}
                            </Avatar>
                            <Box flex={1} minWidth={0}>
                                <Typography variant="h6" fontWeight="600" noWrap sx={{ color: theme.palette.text.primary }}>
                                    {user.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }} noWrap>
                                    {user.email}
                                </Typography>
                                <Box display="flex" alignItems="center" gap={1} mt={1}>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                        {user.department}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>•</Typography>
                                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                        Joined {user.joinDate}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1} ml={2}>
                            <FormControl size="small">
                                <Select
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                    renderValue={(value) => <RoleBadge role={value} />}
                                    sx={{
                                        minWidth: 120,
                                        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                        "& .MuiSelect-select": {
                                            backgroundColor: theme.palette.background.paper,
                                            borderRadius: 1
                                        }
                                    }}
                                >
                                    {["Admin", "Manager", "Employee", "Viewer"].map(r => (
                                        <MenuItem value={r} key={r}>
                                            <RoleBadge role={r} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <IconButton size="small" onClick={(e) => handleMenuClick(e, user)}>
                                <MoreHoriz sx={{ color: theme.palette.text.primary }} />
                            </IconButton>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        );
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: theme.palette.background.default,
                p: 3
            }}
        >
            <Container maxWidth="xl">
                <WIPBanner />
                <Box sx={{ mb: 4 }}>
                    <Box display="flex" flexDirection={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} gap={2} mb={4}>
                        <Box>
                            <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: theme.palette.text.primary }}>
                                Role Management
                            </Typography>
                            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                                Manage user roles and permissions across your organization
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            sx={{
                                background: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                                "&:hover": {
                                    background: theme.palette.primary.dark || "#000000"
                                }
                            }}
                        >
                            Add User
                        </Button>
                    </Box>

                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {["Total Users", "Admins", "Managers", "Employees"].map((label, idx) => (
                            <Grid item xs={12} sm={6} md={3} key={label}>
                                <Card sx={{ bgcolor: theme.palette.background.paper, boxShadow: "0 4px 12px -2px rgba(0,0,0,0.08)" }}>
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Box>
                                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }} gutterBottom>
                                                    {label}
                                                </Typography>
                                                <Typography variant="h4" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>
                                                    {label === "Total Users" ? users.length :
                                                        label === "Admins" ? roleStats.Admin :
                                                            label === "Managers" ? roleStats.Manager :
                                                                roleStats.Employee}
                                                </Typography>
                                            </Box>
                                            {idx === 0 ? <People sx={{ color: theme.palette.text.secondary }} /> :
                                                idx === 1 ? <Security sx={{ color: theme.palette.text.secondary }} /> :
                                                    idx === 2 ? <PersonAdd sx={{ color: theme.palette.text.secondary }} /> :
                                                        <Visibility sx={{ color: theme.palette.text.secondary }} />}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Filters */}
                    <Paper sx={{ p: 3, mb: 4, bgcolor: theme.palette.background.paper }}>
                        <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={2} alignItems="center">
                            <TextField
                                fullWidth
                                placeholder="Search users by name, email, or department..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search sx={{ color: theme.palette.text.secondary }} />
                                        </InputAdornment>
                                    ),
                                    sx: { backgroundColor: theme.palette.background.default }
                                }}
                            />
                            <FormControl sx={{ minWidth: 200 }}>
                                <Select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    sx={{ backgroundColor: theme.palette.background.default }}
                                >
                                    <MenuItem value="All">All Roles</MenuItem>
                                    {["Admin", "Manager", "Employee", "Viewer"].map(r => (
                                        <MenuItem value={r} key={r}>{r}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Paper>

                    <Grid container spacing={3}>
                        {filteredUsers.map(user => (
                            <Grid item xs={12} lg={6} key={user.id}>
                                <UserCard user={user} />
                            </Grid>
                        ))}
                    </Grid>

                    {filteredUsers.length === 0 && (
                        <Paper sx={{ p: 6, textAlign: "center", bgcolor: theme.palette.background.paper }}>
                            <People sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 2 }} />
                            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.text.primary }}>
                                No users found
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                Try adjusting your search or filter criteria
                            </Typography>
                        </Paper>
                    )}

                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                        <MenuItem onClick={() => handleEdit(selectedUser?.id)}>
                            <Edit fontSize="small" sx={{ mr: 1 }} />
                            Edit User
                        </MenuItem>
                        <MenuItem onClick={() => handleRemove(selectedUser?.id)} sx={{ color: "error.main" }}>
                            <Delete fontSize="small" sx={{ mr: 1 }} />
                            Remove User
                        </MenuItem>
                    </Menu>
                </Box>
            </Container>
        </Box>
    );
};

export default RoleManagement;
