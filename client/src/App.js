import React, { Suspense, useMemo } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";

import { createAppTheme } from "./components/Theme";
import { AuthProvider } from "./context/auth/authContext";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import Layout from "./components/Layout";
import LoadingScreen from "./components/LoadingScreen";
import AppRoutes from "./AppRoutes";


// Inner component that has access to settings context
function AppContent() {
  const { settings } = useSettings();

  // Create dynamic theme based on settings
  const theme = useMemo(
    () => createAppTheme(settings.general.theme),
    [settings.general.theme]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Suspense fallback={<LoadingScreen />}>
        <Layout>
          <AppRoutes />
        </Layout>
      </Suspense>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <AppContent />
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;