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
    FormControl,
    InputLabel
} from "@mui/material";
import {
    Person,
    Settings as SettingsIcon,
    Notifications,
    Security,
    Edit,
    Save,
    Visibility,
    NotificationsActive,
    Shield,
    Key,
    Phone,
    Email,
    Business,
    CloudSync,
    Restore,
    CheckCircle
} from "@mui/icons-material";
import theme from "../components/Theme";

const Settings = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [saveStatus, setSaveStatus] = useState({ open: false, message: '', severity: 'success' });
    const [lastSaved, setLastSaved] = useState(null);
    
    // Storage key for settings
    const STORAGE_KEY = 'crm_user_settings';
    
    // Default settings
    const defaultSettings = {
        profile: {
            name: "",
            email: "",
            phone: "",
            department: "",
            bio: ""
        },
        notifications: {
            email: true,
            push: true,
            sms: false,
            marketing: false
        },
        security: {
            twoFactor: true,
            loginAlerts: true,
            sessionTimeout: 30
        },
        general: {
            theme: "light",
            language: "English",
            autoSave: true,
            timezone: "UTC-5"
        }
    };

    // Load settings from memory storage on component mount
    const loadSettings = () => {
        try {
            const stored = window.settingsStorage || {};
            return {
                profile: { ...defaultSettings.profile, ...stored.profile },
                notifications: { ...defaultSettings.notifications, ...stored.notifications },
                security: { ...defaultSettings.security, ...stored.security },
                general: { ...defaultSettings.general, ...stored.general }
            };
        } catch (error) {
            console.error('Error loading settings:', error);
            return defaultSettings;
        }
    };

    // Save settings to memory storage
    const saveSettings = (newSettings) => {
        try {
            // Create global storage if it doesn't exist
            if (!window.settingsStorage) {
                window.settingsStorage = {};
            }
            
            // Save to memory
            window.settingsStorage = {
                ...newSettings,
                lastSaved: new Date().toISOString()
            };
            
            setLastSaved(new Date());
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    };

    // Initialize settings from storage
    const [settings, setSettings] = useState(() => {
        const loaded = loadSettings();
        if (window.settingsStorage?.lastSaved) {
            setLastSaved(new Date(window.settingsStorage.lastSaved));
        }
        return loaded;
    });

    const [hasChanges, setHasChanges] = useState(false);

    // Check for changes
    useEffect(() => {
        const stored = window.settingsStorage || {};
        const currentSettingsString = JSON.stringify(settings);
        const storedSettingsString = JSON.stringify({
            profile: { ...defaultSettings.profile, ...stored.profile },
            notifications: { ...defaultSettings.notifications, ...stored.notifications },
            security: { ...defaultSettings.security, ...stored.security },
            general: { ...defaultSettings.general, ...stored.general }
        });
        
        setHasChanges(currentSettingsString !== storedSettingsString);
    }, [settings]);

    const tabs = [
        { id: "profile", label: "Profile", icon: Person },
        { id: "general", label: "General", icon: SettingsIcon },
        { id: "notifications", label: "Notifications", icon: Notifications },
        { id: "security", label: "Security", icon: Security },
    ];

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const updateSettings = (section, updates) => {
        setSettings(prev => ({
            ...prev,
            [section]: { ...prev[section], ...updates }
        }));
    };

    const handleSaveSettings = () => {
        const success = saveSettings(settings);
        
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
        setSettings(defaultSettings);
        
        // Clear storage
        if (window.settingsStorage) {
            delete window.settingsStorage;
        }
        
        setLastSaved(null);
        
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
                <Typography variant="h5" fontWeight="600" gutterBottom sx={{ color: theme.palette.text.primary }}>
                    Profile Information
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                    Update your personal information and preferences
                </Typography>

                <Card sx={{ mb: 3, bgcolor: theme.palette.background.paper }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box display="flex" alignItems="center" mb={3}>
                            <Avatar
                                sx={{
                                    width: 80,
                                    height: 80,
                                    mr: 3,
                                    bgcolor: theme.palette.primary.main,
                                    fontSize: "1.5rem"
                                }}
                            >
                                {initials}
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight="600" sx={{ color: theme.palette.text.primary }}>
                                    {settings.profile.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                    {settings.profile.department} • {settings.profile.email}
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

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    value={settings.profile.name}
                                    onChange={(e) => updateSettings('profile', { name: e.target.value })}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    label="Email"
                                    value={settings.profile.email}
                                    onChange={(e) => updateSettings('profile', { email: e.target.value })}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    label="Phone"
                                    value={settings.profile.phone}
                                    onChange={(e) => updateSettings('profile', { phone: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Department"
                                    value={settings.profile.department}
                                    onChange={(e) => updateSettings('profile', { department: e.target.value })}
                                    sx={{ mb: 2 }}
                                />
                                <TextField
                                    fullWidth
                                    label="Bio"
                                    multiline
                                    rows={4}
                                    value={settings.profile.bio}
                                    onChange={(e) => updateSettings('profile', { bio: e.target.value })}
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
            <Typography variant="h5" fontWeight="600" gutterBottom sx={{ color: theme.palette.text.primary }}>
                General Settings
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                Manage general application settings and preferences
            </Typography>

            <Card sx={{ bgcolor: theme.palette.background.paper }}>
                <CardContent sx={{ p: 3 }}>
                    <List>
                        <ListItem>
                            <ListItemIcon>
                                <Visibility sx={{ color: theme.palette.text.secondary }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Theme"
                                secondary="Choose your preferred theme"
                            />
                            <ListItemSecondaryAction>
                                <Button 
                                    variant="outlined" 
                                    size="small"
                                    onClick={() => updateSettings('general', { 
                                        theme: settings.general.theme === 'light' ? 'dark' : 'light' 
                                    })}
                                >
                                    {settings.general.theme}
                                </Button>
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemIcon>
                                <Business sx={{ color: theme.palette.text.secondary }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Language"
                                secondary="Select your preferred language"
                            />
                            <ListItemSecondaryAction>
                                <FormControl size="small" sx={{ minWidth: 100 }}>
                                    <Select
                                        value={settings.general.language}
                                        onChange={(e) => updateSettings('general', { language: e.target.value })}
                                    >
                                        <MenuItem value="English">English</MenuItem>
                                        <MenuItem value="Spanish">Spanish</MenuItem>
                                        <MenuItem value="French">French</MenuItem>
                                    </Select>
                                </FormControl>
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemIcon>
                                <SettingsIcon sx={{ color: theme.palette.text.secondary }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Auto-save"
                                secondary="Automatically save changes"
                            />
                            <ListItemSecondaryAction>
                                <Switch 
                                    checked={settings.general.autoSave}
                                    onChange={(e) => updateSettings('general', { autoSave: e.target.checked })}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                    </List>
                </CardContent>
            </Card>
        </Box>
    );

    const NotificationSettings = () => (
        <Box>
            <Typography variant="h5" fontWeight="600" gutterBottom sx={{ color: theme.palette.text.primary }}>
                Notification Preferences
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                Control how and when you receive notifications
            </Typography>

            <Card sx={{ bgcolor: theme.palette.background.paper }}>
                <CardContent sx={{ p: 3 }}>
                    <List>
                        <ListItem>
                            <ListItemIcon>
                                <Email sx={{ color: theme.palette.text.secondary }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Email Notifications"
                                secondary="Receive notifications via email"
                            />
                            <ListItemSecondaryAction>
                                <Switch
                                    checked={settings.notifications.email}
                                    onChange={(e) => updateSettings('notifications', { email: e.target.checked })}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemIcon>
                                <NotificationsActive sx={{ color: theme.palette.text.secondary }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Push Notifications"
                                secondary="Receive push notifications"
                            />
                            <ListItemSecondaryAction>
                                <Switch
                                    checked={settings.notifications.push}
                                    onChange={(e) => updateSettings('notifications', { push: e.target.checked })}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemIcon>
                                <Phone sx={{ color: theme.palette.text.secondary }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="SMS Notifications"
                                secondary="Receive notifications via SMS"
                            />
                            <ListItemSecondaryAction>
                                <Switch
                                    checked={settings.notifications.sms}
                                    onChange={(e) => updateSettings('notifications', { sms: e.target.checked })}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemIcon>
                                <Business sx={{ color: theme.palette.text.secondary }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Marketing Communications"
                                secondary="Receive marketing and promotional emails"
                            />
                            <ListItemSecondaryAction>
                                <Switch
                                    checked={settings.notifications.marketing}
                                    onChange={(e) => updateSettings('notifications', { marketing: e.target.checked })}
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
            <Typography variant="h5" fontWeight="600" gutterBottom sx={{ color: theme.palette.text.primary }}>
                Security & Privacy
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                Manage your security preferences and authentication methods
            </Typography>

            <Card sx={{ bgcolor: theme.palette.background.paper }}>
                <CardContent sx={{ p: 3 }}>
                    <List>
                        <ListItem>
                            <ListItemIcon>
                                <Shield sx={{ color: theme.palette.text.secondary }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Two-Factor Authentication"
                                secondary="Add an extra layer of security"
                            />
                            <ListItemSecondaryAction>
                                <Switch
                                    checked={settings.security.twoFactor}
                                    onChange={(e) => updateSettings('security', { twoFactor: e.target.checked })}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemIcon>
                                <Security sx={{ color: theme.palette.text.secondary }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Login Alerts"
                                secondary="Get notified of new login attempts"
                            />
                            <ListItemSecondaryAction>
                                <Switch
                                    checked={settings.security.loginAlerts}
                                    onChange={(e) => updateSettings('security', { loginAlerts: e.target.checked })}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemIcon>
                                <Key sx={{ color: theme.palette.text.secondary }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Change Password"
                                secondary="Update your account password"
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
                return <NotificationSettings />;
            case 3:
                return <SecuritySettings />;
            default:
                return <ProfileSettings />;
        }
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
                <Box sx={{ mb: 4 }}>
                    <Box display="flex" flexDirection={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} gap={2} mb={4}>
                        <Box>
                            <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: theme.palette.text.primary }}>
                                Settings
                            </Typography>
                            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                                Manage your CRM preferences and configuration
                            </Typography>
                            
                            {/* Storage Status */}
                            <Box display="flex" alignItems="center" gap={1} mt={1}>
                                {lastSaved ? (
                                    <>
                                        <Chip 
                                            icon={<CheckCircle />} 
                                            label={`Saved ${lastSaved.toLocaleString()}`}
                                            size="small" 
                                            color="success"
                                        />
                                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
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
                        
                        {/* Control Buttons */}
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
                                disabled={!hasChanges}
                                startIcon={<CloudSync />}
                                sx={{
                                    background: theme.palette.primary.main,
                                    "&:hover": { background: theme.palette.primary.dark }
                                }}
                            >
                                Save All
                            </Button>
                        </Box>
                    </Box>

                    {hasChanges && (
                        <Alert severity="warning" sx={{ mb: 3 }}>
                            <strong>Unsaved Changes:</strong> Your changes will be lost when you close the browser. 
                            Click "Save All" to persist them in browser memory storage.
                        </Alert>
                    )}

                    <Paper sx={{ bgcolor: theme.palette.background.paper, boxShadow: "0 4px 12px -2px rgba(0,0,0,0.08)" }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs
                                value={activeTab}
                                onChange={handleTabChange}
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{
                                    px: 3,
                                    "& .MuiTab-root": {
                                        minHeight: 64,
                                        textTransform: "none",
                                        fontSize: "1rem",
                                        fontWeight: 500,
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
                                                gap: 1,
                                                color: theme.palette.text.secondary,
                                                "&.Mui-selected": {
                                                    color: theme.palette.primary.main
                                                }
                                            }}
                                        />
                                    );
                                })}
                            </Tabs>
                        </Box>
                        
                        <Box sx={{ p: 3 }}>
                            {renderTabContent()}
                        </Box>
                    </Paper>
                </Box>
            </Container>

            {/* Status Snackbar */}
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