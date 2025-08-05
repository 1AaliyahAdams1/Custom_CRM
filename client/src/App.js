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

// Lazy load create pages
const CreateAccountPage = lazy(() => import("./pages/CreateAccountPage"));
const CreateContactsPage = lazy(() => import("./pages/CreateContactsPage"));
const CreateDealPage = lazy(() => import("./pages/CreateDealPage"));
const CreateActivitiesPage = lazy(() => import("./pages/CreateActivitiesPage"));

// Lazy load edit pages
const EditAccountPage = React.lazy(() => import('./pages/EditAccountPage'));
const EditContactPage = React.lazy(() => import('./pages/EditContactPage'));
const EditDealPage = React.lazy(() => import('./pages/EditDealPage'));
const EditActivityPage = React.lazy(() => import('./pages/EditActivityPage'));




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
            <Route path="/accounts/create" element={<CreateAccountPage />} />

            <Route path="/accounts/create" element={<CreateAccountPage />} />
            <Route path="/accounts/edit/:id" element={<EditAccountPage />} />


            <Route path="/contacts" element={<Contacts />} />
            <Route path="/contacts/:id" element={<ContactsDetailsPage />} />
            <Route path="/contacts/create" element={<CreateContactsPage />} />
            <Route path="/contacts/create" element={<CreateContactsPage />} />
            <Route path="/contacts/edit/:id" element={<EditContactPage />} />


            <Route path="/deals" element={<Deals />} />
            <Route path="/deals/:id" element={<DealsDetailsPage />} />
            <Route path="/deals/create" element={<CreateDealPage />} />
            <Route path="/deals/create" element={<CreateDealPage />} />
            <Route path="/deals/edit/:id" element={<EditDealPage />} />

            <Route path="/activities" element={<Activities />} />
            <Route path="/activities/:id" element={<ActivitiesDetailsPage />} />
            <Route path="/activities/create" element={<CreateActivitiesPage />} />
            <Route path="/activities/create" element={<CreateActivitiesPage />} />
            <Route path="/activities/edit/:id" element={<EditActivityPage />} />

            {/* Catch-all for undefined routes */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </Suspense>
    </Router>
  );
}

export default App;