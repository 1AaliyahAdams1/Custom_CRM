import React, { useState, useEffect } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Container,
    Paper,
    Tab,
    Tabs,
    Avatar,
    Switch,
    TextField,
    Button,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    Grid,
    Alert,
    Snackbar,
    Chip,
    Select,
    MenuItem,
    FormControl
} from "@mui/material";
import {
    Person,
    Settings as SettingsIcon,
    Security,
    Edit,
    Save,
    Visibility,
    Shield,
    Key,
    CloudSync,
    Restore,
    CheckCircle,
    ViewCompact,
    Help,
    ViewList
} from "@mui/icons-material";
import { useSettings } from "../context/SettingsContext";

const Settings = () => {
    const {
        settings,
        updateSettings,
        saveAllSettings,
        resetSettings,
        lastSaved,
        currentTheme,
        getSpacing,
        defaultSettings
    } = useSettings();

    const [activeTab, setActiveTab] = useState(0);
    const [saveStatus, setSaveStatus] = useState({ open: false, message: '', severity: 'success' });
    const [hasChanges, setHasChanges] = useState(false);
    const [isAutoSaving, setIsAutoSaving] = useState(false);

    // Check for changes
    useEffect(() => {
        const stored = window.settingsStorage || {};
        const currentSettingsString = JSON.stringify(settings);
        const storedSettingsString = JSON.stringify({
            profile: { ...defaultSettings.profile, ...stored.profile },
            security: { ...defaultSettings.security, ...stored.security },
            general: { ...defaultSettings.general, ...stored.general }
        });
        
        setHasChanges(currentSettingsString !== storedSettingsString);
    }, [settings]);

    const tabs = [
        { id: "profile", label: "Profile", icon: Person },
        { id: "general", label: "General", icon: SettingsIcon },
        { id: "security", label: "Security", icon: Security },
    ];

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleSaveSettings = () => {
        const success = saveAllSettings();
        
        if (success) {
            setSaveStatus({
                open: true,
                message: 'Settings saved successfully! They will persist during this browser session.',
                severity: 'success'
            });
            setHasChanges(false);
        } else {
            setSaveStatus({
                open: true,
                message: 'Failed to save settings',
                severity: 'error'
            });
        }
    };

    const handleResetSettings = () => {
        resetSettings();
        
        setSaveStatus({
            open: true,
            message: 'Settings reset to defaults and storage cleared',
            severity: 'info'
        });
    };

    const ProfileSettings = () => {
        const initials = settings.profile.name.split(" ").map(n => n[0]).join("").toUpperCase();

        return (
            <Box>
                <Typography variant="h5" fontWeight="600" gutterBottom sx={{ color: currentTheme.text.primary }}>
                    Profile Information
                </Typography>
                <Typography variant="body2" sx={{ color: currentTheme.text.secondary, mb: getSpacing(3) }}>
                    Update your personal information and preferences
                </Typography>

                <Card sx={{ mb: getSpacing(3), bgcolor: currentTheme.background.paper }}>
                    <CardContent sx={{ p: getSpacing(3) }}>
                        <Box display="flex" alignItems="center" mb={getSpacing(3)}>
                            <Avatar
                                sx={{
                                    width: settings.general.compactView ? 60 : 80,
                                    height: settings.general.compactView ? 60 : 80,
                                    mr: getSpacing(3),
                                    bgcolor: currentTheme.primary.main,
                                    fontSize: settings.general.compactView ? "1.2rem" : "1.5rem"
                                }}
                            >
                                {initials}
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight="600" sx={{ color: currentTheme.text.primary }}>
                                    {settings.profile.name || "User Name"}
                                </Typography>
                                <Typography variant="body2" sx={{ color: currentTheme.text.secondary }}>
                                    {settings.profile.department} {settings.profile.department && settings.profile.email ? "•" : ""} {settings.profile.email}
                                </Typography>
                                <Button
                                    size="small"
                                    startIcon={<Edit />}
                                    sx={{ mt: 1 }}
                                >
                                    Change Photo
                                </Button>
                            </Box>
                        </Box>

                        <Grid container spacing={getSpacing(3)}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    value={settings.profile.name}
                                    onChange={(e) => updateSettings('profile', { name: e.target.value })}
                                    sx={{ mb: getSpacing(2) }}
                                    size={settings.general.compactView ? "small" : "medium"}
                                />
                                <TextField
                                    fullWidth
                                    label="Email"
                                    value={settings.profile.email}
                                    onChange={(e) => updateSettings('profile', { email: e.target.value })}
                                    sx={{ mb: getSpacing(2) }}
                                    size={settings.general.compactView ? "small" : "medium"}
                                />
                                <TextField
                                    fullWidth
                                    label="Phone"
                                    value={settings.profile.phone}
                                    onChange={(e) => updateSettings('profile', { phone: e.target.value })}
                                    size={settings.general.compactView ? "small" : "medium"}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Department"
                                    value={settings.profile.department}
                                    onChange={(e) => updateSettings('profile', { department: e.target.value })}
                                    sx={{ mb: getSpacing(2) }}
                                    size={settings.general.compactView ? "small" : "medium"}
                                />
                                <TextField
                                    fullWidth
                                    label="Bio"
                                    multiline
                                    rows={settings.general.compactView ? 3 : 4}
                                    value={settings.profile.bio}
                                    onChange={(e) => updateSettings('profile', { bio: e.target.value })}
                                    size={settings.general.compactView ? "small" : "medium"}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Box>
        );
    };

    const GeneralSettings = () => (
        <Box>
            <Typography variant="h5" fontWeight="600" gutterBottom sx={{ color: currentTheme.text.primary }}>
                General Settings
            </Typography>
            <Typography variant="body2" sx={{ color: currentTheme.text.secondary, mb: getSpacing(3) }}>
                Manage general application settings and preferences
            </Typography>

            <Card sx={{ bgcolor: currentTheme.background.paper }}>
                <CardContent sx={{ p: getSpacing(3) }}>
                    <List>
                        <ListItem sx={{ py: getSpacing(2) }}>
                            <ListItemIcon>
                                <Visibility sx={{ color: currentTheme.text.secondary }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Theme"
                                secondary="Choose between light and dark mode"
                                primaryTypographyProps={{ color: currentTheme.text.primary }}
                                secondaryTypographyProps={{ color: currentTheme.text.secondary }}
                            />
                            <ListItemSecondaryAction>
                                <Button 
                                    variant="outlined" 
                                    size="small"
                                    onClick={() => updateSettings('general', { 
                                        theme: settings.general.theme === 'light' ? 'dark' : 'light' 
                                    })}
                                >
                                    {settings.general.theme === 'light' ? '☀️ Light' : '🌙 Dark'}
                                </Button>
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider sx={{ borderColor: currentTheme.divider }} />
                        
                        <ListItem sx={{ py: getSpacing(2) }}>
                            <ListItemIcon>
                                <CloudSync sx={{ color: currentTheme.text.secondary }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Auto-save"
                                secondary="Automatically save changes after 2 seconds"
                                primaryTypographyProps={{ color: currentTheme.text.primary }}
                                secondaryTypographyProps={{ color: currentTheme.text.secondary }}
                            />
                            <ListItemSecondaryAction>
                                <Switch 
                                    checked={settings.general.autoSave}
                                    onChange={(e) => updateSettings('general', { autoSave: e.target.checked })}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider sx={{ borderColor: currentTheme.divider }} />
                        
                        <ListItem sx={{ py: getSpacing(2) }}>
                            <ListItemIcon>
                                <Help sx={{ color: currentTheme.text.secondary }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Show Tooltips"
                                secondary="Display helpful hints throughout the app"
                                primaryTypographyProps={{ color: currentTheme.text.primary }}
                                secondaryTypographyProps={{ color: currentTheme.text.secondary }}
                            />
                            <ListItemSecondaryAction>
                                <Switch 
                                    checked={settings.general.showTooltips}
                                    onChange={(e) => updateSettings('general', { showTooltips: e.target.checked })}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider sx={{ borderColor: currentTheme.divider }} />
                        
                        <Divider sx={{ borderColor: currentTheme.divider }} />
                        
                        <ListItem sx={{ py: getSpacing(2) }}>
                            <ListItemIcon>
                                <ViewCompact sx={{ color: currentTheme.text.secondary }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Compact View"
                                secondary="Reduce spacing for a denser layout"
                                primaryTypographyProps={{ color: currentTheme.text.primary }}
                                secondaryTypographyProps={{ color: currentTheme.text.secondary }}
                            />
                            <ListItemSecondaryAction>
                                <Switch 
                                    checked={settings.general.compactView}
                                    onChange={(e) => updateSettings('general', { compactView: e.target.checked })}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                    </List>
                </CardContent>
            </Card>
        </Box>
    );

    const SecuritySettings = () => (
        <Box>
            <Typography variant="h5" fontWeight="600" gutterBottom sx={{ color: currentTheme.text.primary }}>
                Security & Privacy
            </Typography>
            <Typography variant="body2" sx={{ color: currentTheme.text.secondary, mb: getSpacing(3) }}>
                Manage your security preferences and authentication methods
            </Typography>

            <Card sx={{ bgcolor: currentTheme.background.paper }}>
                <CardContent sx={{ p: getSpacing(3) }}>
                    <List>
                        <ListItem sx={{ py: getSpacing(2) }}>
                            <ListItemIcon>
                                <Shield sx={{ color: currentTheme.text.secondary }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Two-Factor Authentication"
                                secondary="Add an extra layer of security"
                                primaryTypographyProps={{ color: currentTheme.text.primary }}
                                secondaryTypographyProps={{ color: currentTheme.text.secondary }}
                            />
                            <ListItemSecondaryAction>
                                <Switch
                                    checked={settings.security.twoFactor}
                                    onChange={(e) => updateSettings('security', { twoFactor: e.target.checked })}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider sx={{ borderColor: currentTheme.divider }} />
                        
                        <ListItem sx={{ py: getSpacing(2) }}>
                            <ListItemIcon>
                                <Security sx={{ color: currentTheme.text.secondary }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Login Alerts"
                                secondary="Get notified of new login attempts"
                                primaryTypographyProps={{ color: currentTheme.text.primary }}
                                secondaryTypographyProps={{ color: currentTheme.text.secondary }}
                            />
                            <ListItemSecondaryAction>
                                <Switch
                                    checked={settings.security.loginAlerts}
                                    onChange={(e) => updateSettings('security', { loginAlerts: e.target.checked })}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider sx={{ borderColor: currentTheme.divider }} />
                        
                        <ListItem sx={{ py: getSpacing(2) }}>
                            <ListItemIcon>
                                <Key sx={{ color: currentTheme.text.secondary }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Change Password"
                                secondary="Update your account password"
                                primaryTypographyProps={{ color: currentTheme.text.primary }}
                                secondaryTypographyProps={{ color: currentTheme.text.secondary }}
                            />
                            <ListItemSecondaryAction>
                                <Button variant="outlined" size="small">
                                    Change
                                </Button>
                            </ListItemSecondaryAction>
                        </ListItem>
                    </List>
                </CardContent>
            </Card>
        </Box>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return <ProfileSettings />;
            case 1:
                return <GeneralSettings />;
            case 2:
                return <SecuritySettings />;
            default:
                return <ProfileSettings />;
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: currentTheme.background.default,
                p: getSpacing(3),
                transition: 'all 0.3s ease'
            }}
        >
            <Container maxWidth="xl">
                <Box sx={{ mb: getSpacing(4) }}>
                    <Box display="flex" flexDirection={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} gap={2} mb={getSpacing(4)}>
                        <Box>
                            <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: currentTheme.text.primary }}>
                                Settings
                            </Typography>
                            <Typography variant="body1" sx={{ color: currentTheme.text.secondary }}>
                                Manage your CRM preferences and configuration
                            </Typography>
                            
                            <Box display="flex" alignItems="center" gap={1} mt={1}>
                                {lastSaved ? (
                                    <>
                                        <Chip 
                                            icon={<CheckCircle />} 
                                            label={`Saved ${lastSaved.toLocaleString()}`}
                                            size="small" 
                                            color="success"
                                        />
                                        <Typography variant="caption" sx={{ color: currentTheme.text.secondary }}>
                                            (Browser session storage)
                                        </Typography>
                                    </>
                                ) : (
                                    <Chip 
                                        label="Not saved" 
                                        size="small" 
                                        color="default"
                                    />
                                )}
                            </Box>
                        </Box>
                        
                        <Box display="flex" gap={2} flexWrap="wrap">
                            <Button
                                variant="outlined"
                                onClick={handleResetSettings}
                                startIcon={<Restore />}
                                disabled={!hasChanges && !lastSaved}
                            >
                                Reset
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleSaveSettings}
                                disabled={!hasChanges || settings.general.autoSave}
                                startIcon={<CloudSync />}
                                sx={{
                                    background: currentTheme.primary.main,
                                    "&:hover": { background: currentTheme.primary.dark }
                                }}
                            >
                                Save All
                            </Button>
                        </Box>
                    </Box>

                    {hasChanges && !settings.general.autoSave && (
                        <Alert severity="warning" sx={{ mb: getSpacing(3) }}>
                            <strong>Unsaved Changes:</strong> Your changes will be lost when you close the browser. 
                            Click "Save All" to persist them in browser memory storage.
                        </Alert>
                    )}

                    {hasChanges && settings.general.autoSave && (
                        <Alert severity="info" sx={{ mb: getSpacing(3) }}>
                            <strong>{isAutoSaving ? 'Auto-saving...' : 'Auto-save enabled:'}</strong> Your changes will be automatically saved in 2 seconds.
                        </Alert>
                    )}

                    <Paper sx={{ bgcolor: currentTheme.background.paper, boxShadow: "0 4px 12px -2px rgba(0,0,0,0.08)" }}>
                        <Box sx={{ borderBottom: 1, borderColor: currentTheme.divider }}>
                            <Tabs
                                value={activeTab}
                                onChange={handleTabChange}
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{
                                    px: getSpacing(3),
                                    "& .MuiTab-root": {
                                        minHeight: settings.general.compactView ? 56 : 64,
                                        textTransform: "none",
                                        fontSize: "1rem",
                                        fontWeight: 500,
                                        color: currentTheme.text.secondary,
                                    },
                                    "& .Mui-selected": {
                                        color: currentTheme.primary.main
                                    }
                                }}
                            >
                                {tabs.map((tab, index) => {
                                    const Icon = tab.icon;
                                    return (
                                        <Tab
                                            key={tab.id}
                                            icon={<Icon sx={{ mb: 0.5 }} />}
                                            iconPosition="start"
                                            label={tab.label}
                                            sx={{
                                                flexDirection: "row",
                                                gap: 1
                                            }}
                                        />
                                    );
                                })}
                            </Tabs>
                        </Box>
                        
                        <Box sx={{ p: getSpacing(3) }}>
                            {renderTabContent()}
                        </Box>
                    </Paper>
                </Box>
            </Container>

            <Snackbar
                open={saveStatus.open}
                autoHideDuration={4000}
                onClose={() => setSaveStatus(prev => ({ ...prev, open: false }))}
            >
                <Alert 
                    onClose={() => setSaveStatus(prev => ({ ...prev, open: false }))} 
                    severity={saveStatus.severity}
                >
                    {saveStatus.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Settings;