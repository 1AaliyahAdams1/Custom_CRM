import React, { Suspense } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";

import theme from "./components/Theme"; 
import { AuthProvider } from "./context/auth/authContext";
import Layout from "./components/Layout";
import LoadingScreen from "./components/LoadingScreen";
import AppRoutes from "./AppRoutes";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider> 
          <Suspense fallback={<LoadingScreen />}>
            <Layout>
              <AppRoutes />
            </Layout>
          </Suspense>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
