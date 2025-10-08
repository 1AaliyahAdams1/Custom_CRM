import React, { Suspense } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";

import theme from "./components/Theme"; 
import { AuthProvider } from "./context/auth/authContext";
import { SettingsProvider } from "./context/SettingsContext";
import Layout from "./components/Layout";
import LoadingScreen from "./components/LoadingScreen";
import AppRoutes from "./AppRoutes";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider> 
          <SettingsProvider>
            <Suspense fallback={<LoadingScreen />}>
              <Layout>
                <AppRoutes />
              </Layout>
            </Suspense>
          </SettingsProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
