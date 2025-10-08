// src/context/SettingsContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  // Default settings
  const defaultSettings = {
    profile: {
      name: "",
      email: "",
      phone: "",
      department: "",
      bio: ""
    },
    security: {
      twoFactor: true,
      loginAlerts: true,
      sessionTimeout: 30
    },
    general: {
      theme: "light",
      autoSave: true,
      showTooltips: true,
      itemsPerPage: 25,
      compactView: false
    }
  };

  // Load settings from memory storage
  const loadSettings = () => {
    try {
      const stored = window.settingsStorage || {};
      return {
        profile: { ...defaultSettings.profile, ...stored.profile },
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
      if (!window.settingsStorage) {
        window.settingsStorage = {};
      }
      
      window.settingsStorage = {
        ...newSettings,
        lastSaved: new Date().toISOString()
      };
      
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  };

  // Initialize settings
  const [settings, setSettings] = useState(() => loadSettings());
  const [lastSaved, setLastSaved] = useState(() => {
    return window.settingsStorage?.lastSaved 
      ? new Date(window.settingsStorage.lastSaved) 
      : null;
  });

  // Update settings function
  const updateSettings = (section, updates) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        [section]: { ...prev[section], ...updates }
      };
      
      // Auto-save if enabled
      if (newSettings.general.autoSave) {
        setTimeout(() => {
          saveSettings(newSettings);
          setLastSaved(new Date());
        }, 2000);
      }
      
      return newSettings;
    });
  };

  // Manual save function
  const saveAllSettings = () => {
    const success = saveSettings(settings);
    if (success) {
      setLastSaved(new Date());
    }
    return success;
  };

  // Reset settings function
  const resetSettings = () => {
    setSettings(defaultSettings);
    if (window.settingsStorage) {
      delete window.settingsStorage;
    }
    setLastSaved(null);
  };

  // Get theme colors based on current theme setting
  const getThemeColors = (themeMode) => {
    if (themeMode === 'dark') {
      return {
        background: {
          default: '#121212',
          paper: '#1e1e1e'
        },
        text: {
          primary: '#ffffff',
          secondary: '#b0b0b0'
        },
        primary: {
          main: '#90caf9',
          dark: '#42a5f5'
        },
        divider: '#333333'
      };
    }
    return {
      background: {
        default: '#f5f5f5',
        paper: '#ffffff'
      },
      text: {
        primary: '#000000',
        secondary: '#666666'
      },
      primary: {
        main: '#1976d2',
        dark: '#115293'
      },
      divider: '#e0e0e0'
    };
  };

  // Get spacing based on compact view
  const getSpacing = (base) => {
    return settings.general.compactView ? base * 0.7 : base;
  };

  const currentTheme = getThemeColors(settings.general.theme);

  const value = {
    settings,
    updateSettings,
    saveAllSettings,
    resetSettings,
    lastSaved,
    currentTheme,
    getSpacing,
    defaultSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};