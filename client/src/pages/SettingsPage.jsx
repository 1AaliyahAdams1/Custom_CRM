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
        { id: "general", label: "General", icon: SettingsIcon },
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
                    
                    </List>
                </CardContent>
            </Card>
        </Box>
    );

   
    const renderTabContent = () => {
        switch (activeTab) {
            case 0:
                return <GeneralSettings />;
            default:
               
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