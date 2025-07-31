// app.js is the main file that sets up the app and controls page navigation.

//IMPORTS
import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

// COMPONENTS
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import LoadingScreen from "./components/LoadingScreen";


// Lazy load main pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Accounts = lazy(() => import("./pages/AccountsPage"));
const Contacts = lazy(() => import("./pages/ContactsPage"));
const Deals = lazy(() => import("./pages/DealsPage"));
const Activities = lazy(() => import("./pages/ActivitiesPage"));

// Lazy load detail pages
const AccountsDetailsPage = lazy(() => import("./pages/AccountsDetailsPage"));
const ContactsDetailsPage = lazy(() => import("./pages/ContactsDetailsPage"));
const DealsDetailsPage = lazy(() => import("./pages/DealsDetailsPage"));
const ActivitiesDetailsPage = lazy(() => import("./pages/ActivitiesDetailsPage"));

// Login page
const LoginPage = lazy(() => import("./pages/LoginPage"));

//404 Error Page
const NotFoundPage = lazy(() => import("./pages/Error"));

//Layout component: shows Header and Sidebar except on /login page
const Layout = ({ children }) => {
  const location = useLocation();
  const hideLayout = location.pathname === "/login";

  return (
    <>
      {!hideLayout && <Header />}
      {!hideLayout && <Sidebar />}
      <main
        style={{
          marginLeft: hideLayout ? 0 : "200px",
          marginTop: hideLayout ? 0 : "60px",
          padding: "20px",
        }}
      >
        {children}
      </main>
    </>
  );
};

// Main App component with routing configuration
function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <Layout>
          <Routes>
            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* After login - dashboard and other pages */}
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/accounts" element={<Accounts />} />
            <Route path="/accounts/:id" element={<AccountsDetailsPage />} />

            <Route path="/contacts" element={<Contacts />} />
            <Route path="/contacts/:id" element={<ContactsDetailsPage />} />

            <Route path="/deals" element={<Deals />} />
            <Route path="/deals/:id" element={<DealsDetailsPage />} />

            <Route path="/activities" element={<Activities />} />
            <Route path="/activities/:id" element={<ActivitiesDetailsPage />} />

            {/* Catch-all for undefined routes */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </Suspense>
    </Router>
  );
}

export default App;