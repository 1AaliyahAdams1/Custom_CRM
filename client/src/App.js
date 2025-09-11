import React, { Suspense } from "react";
import {
  BrowserRouter as Router
} from "react-router-dom";

import { AuthProvider } from "./context/auth/authContext";
import Layout from "./components/Layout";
import LoadingScreen from "./components/LoadingScreen";
import AppRoutes from "./AppRoutes";

function App() {
  return (
    <Router>
      <AuthProvider> 
        <Suspense fallback={<LoadingScreen />}>
          <Layout>
            <AppRoutes />
          </Layout>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App; 