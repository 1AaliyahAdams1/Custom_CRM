import React, { Suspense } from "react";
import {
  BrowserRouter as Router
} from "react-router-dom";

import Layout from "./components/Layout";
import LoadingScreen from "./components/LoadingScreen";
import AppRoutes from "./AppRoutes";

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <Layout>
          <AppRoutes />
        </Layout>
      </Suspense>
    </Router>
  );
}

export default App;