// src/AppRoutes.jsx
import React, { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import PrivateRoute from "./components/PrivateRoute";

// Import Unauthorized directly
import Unauthorized from "./pages/Unauthorized";

// Lazy load other pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Accounts = lazy(() => import("./pages/AccountsPage"));
const Contacts = lazy(() => import("./pages/ContactsPage"));
const Deals = lazy(() => import("./pages/DealsPage"));
const Activities = lazy(() => import("./pages/ActivitiesPage"));

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

const allowedRole = "C-level"; 

const AppRoutes = () => {
  console.log("AppRoutes component is rendering");
  
  return (
    <Routes>
      {/* Public routes - no authentication required */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/unauthorized" 
        element={<Unauthorized />} 
      />

      {/* Protected routes - authentication and role required */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute allowedRoles={[allowedRole]}>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/accounts"
        element={
          <PrivateRoute allowedRoles={[allowedRole]}>
            <Accounts />
          </PrivateRoute>
        }
      />
      <Route
        path="/accounts/:id"
        element={
          <PrivateRoute allowedRoles={[allowedRole]}>
            <AccountsDetailsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/accounts/create"
        element={
          <PrivateRoute allowedRoles={[allowedRole]}>
            <CreateAccountPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/accounts/edit/:id"
        element={
          <PrivateRoute allowedRoles={[allowedRole]}>
            <EditAccountPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/contacts"
        element={
          <PrivateRoute allowedRoles={[allowedRole]}>
            <Contacts />
          </PrivateRoute>
        }
      />
      <Route
        path="/contacts/:id"
        element={
          <PrivateRoute allowedRoles={[allowedRole]}>
            <ContactsDetailsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/contacts/create"
        element={
          <PrivateRoute allowedRoles={[allowedRole]}>
            <CreateContactsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/contacts/edit/:id"
        element={
          <PrivateRoute allowedRoles={[allowedRole]}>
            <EditContactPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/deals"
        element={
          <PrivateRoute allowedRoles={[allowedRole]}>
            <Deals />
          </PrivateRoute>
        }
      />
      <Route
        path="/deals/:id"
        element={
          <PrivateRoute allowedRoles={[allowedRole]}>
            <DealsDetailsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/deals/create"
        element={
          <PrivateRoute allowedRoles={[allowedRole]}>
            <CreateDealPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/deals/edit/:id"
        element={
          <PrivateRoute allowedRoles={[allowedRole]}>
            <EditDealPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/activities"
        element={
          <PrivateRoute allowedRoles={[allowedRole]}>
            <Activities />
          </PrivateRoute>
        }
      />
      <Route
        path="/activities/:id"
        element={
          <PrivateRoute allowedRoles={[allowedRole]}>
            <ActivitiesDetailsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/activities/create"
        element={
          <PrivateRoute allowedRoles={[allowedRole]}>
            <CreateActivitiesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/activities/edit/:id"
        element={
          <PrivateRoute allowedRoles={[allowedRole]}>
            <EditActivityPage />
          </PrivateRoute>
        }
      />

      {/* Catch-all route for 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;