// src/AppRoutes.jsx
import { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import PrivateRoute from "./components/auth/PrivateRoute";
import { ROUTE_ACCESS } from "./utils/auth/routesAccess";

// Import Unauthorized directly
import Unauthorized from "./pages/Unauthorized";

// Lazy load pages
// const Dashboard = lazy(() => import("./pages/Dashboard"));
const Accounts = lazy(() => import("./components/containers/AccountsContainer"));
const Contacts = lazy(() => import("./components/containers/ContactsContainer"));
const Deals = lazy(() => import("./components/containers/DealsContainer"));
const Activities = lazy(() => import("./components/containers/ActivitiesContainer"));
const Reports = lazy(() => import("./pages/ReportsPage"));
const SmartWorkPage = lazy(() => import("./pages/SmartWorkPage"));

const AccountsDetailsPage = lazy(() => import("./pages/AccountsDetailsPage"));
const ContactsDetailsPage = lazy(() => import("./pages/ContactsDetailsPage"));
const DealsDetailsPage = lazy(() => import("./pages/DealsDetailsPage"));
const ActivitiesDetailsPage = lazy(() => import("./pages/ActivitiesDetailsPage"));

const CreateAccountPage = lazy(() => import("./pages/CreateAccountPage"));
const CreateContactsPage = lazy(() => import("./pages/CreateContactsPage"));
const CreateDealPage = lazy(() => import("./pages/CreateDealPage"));
const CreateActivitiesPage = lazy(() => import("./pages/CreateActivitiesPage"));

const EditAccountPage = lazy(() => import("./pages/EditAccountPage"));
const EditContactPage = lazy(() => import("./pages/EditContactPage"));
const EditDealPage = lazy(() => import("./pages/EditDealPage"));
const EditActivityPage = lazy(() => import("./pages/EditActivityPage"));

const LoginPage = lazy(() => import("./pages/LoginPage"));
const NotFoundPage = lazy(() => import("./pages/Error"));

const AppRoutes = () => {
  console.log("AppRoutes component is rendering");

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected routes with dynamic allowedRoles from ROUTE_ACCESS
      <Route
        path="/dashboard"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.dashboard}>
            <Dashboard />
          </PrivateRoute>
        }
      /> */}

      {/* --- Accounts Routes --- */}
      <Route
        path="/accounts"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.accounts}>
            <Accounts />
          </PrivateRoute>
        }

      />
      <Route
        path="/accounts/unassigned"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.accounts}>
            <Accounts />
          </PrivateRoute>
        }
      />

      <Route
        path="/accounts/:id"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.accountsDetails}>
            <AccountsDetailsPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/accounts/create"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.accountsCreate}>
            <CreateAccountPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/accounts/edit/:id"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.accountsEdit}>
            <EditAccountPage />
          </PrivateRoute>
        }
        
      />
      {/* --- Contacts Routes --- */}
      <Route
        path="/contacts"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.contacts}>
            <Contacts />
          </PrivateRoute>
        }
      />
      <Route
        path="/contacts/:id"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.contactsDetails}>
            <ContactsDetailsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/contacts/create"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.contactsCreate}>
            <CreateContactsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/contacts/edit/:id"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.contactsEdit}>
            <EditContactPage />
          </PrivateRoute>
        }
      />
        {/* --- Deal Routes --- */}
      <Route
        path="/deals"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.deals}>
            <Deals />
          </PrivateRoute>
        }
      />
      <Route
        path="/deals/:id"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.dealsDetails}>
            <DealsDetailsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/deals/create"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.dealsCreate}>
            <CreateDealPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/deals/edit/:id"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.dealsEdit}>
            <EditDealPage />
          </PrivateRoute>
        }
      />
        {/* --- Activity Routes --- */}
      <Route
        path="/activities"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.activities}>
            <Activities />
          </PrivateRoute>
        }
      />
      <Route
        path="/activities/:id"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.activitiesDetails}>
            <ActivitiesDetailsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/activities/create"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.activitiesCreate}>
            <CreateActivitiesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/activities/edit/:id"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.activitiesEdit}>
            <EditActivityPage />
          </PrivateRoute>
        }
      />
      {/* --- Smart Work Routes --- */}
      <Route
        path="/smart-work"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.smartWork}>
            <SmartWorkPage />
          </PrivateRoute>
        } 
        />        
      
      {/* --- Reports Routes --- */}
      <Route
        path="/reports"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.reports}>
            <Reports />
          </PrivateRoute>
        }
      />
      {/* --- Work Page Route --- */}
           


      {/* Catch all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
