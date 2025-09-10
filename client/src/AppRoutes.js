// src/AppRoutes.jsx
import { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import PrivateRoute from "./components/auth/PrivateRoute";
import { ROUTE_ACCESS } from "./utils/auth/routesAccess";

// Import Unauthorized directly
import Unauthorized from "./pages/Unauthorized";

// Lazy load pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Accounts = lazy(() => import("./components/containers/AccountsContainer"));
const Contacts = lazy(() => import("./components/containers/ContactsContainer"));
const Deals = lazy(() => import("./components/containers/DealsContainer"));
const Activities = lazy(() => import("./components/containers/ActivitiesContainer"));

const ProductsContainer = lazy(() => import("./components/containers/ProductsContainer"));
const Reports = lazy(() => import("./pages/ReportsPage"));
const SmartWorkPage = lazy(() => import("./pages/SmartWorkPage"));
const RoleManagement = lazy(() => import("./pages/RoleManagement"));

const CountryContainer = lazy(() => import("./components/containers/CountryContainer"));
const CityPage = lazy(() => import("./pages/GeographicData/CityPage"));
const StateProvincePage = lazy(() => import("./pages/GeographicData/StateProvincePage"));
const IndustryContainer = lazy(() => import("./components/containers/IndustryContainer"));
const PriorityLevelContainer = lazy(() => import("./components/containers/PriorityLevelContainer"));
const ActivityTypePage = lazy(() => import("./pages/Activities/ActivityTypePage"));
const DealStagePage = lazy(() => import("./pages/Deals/DealStagePage"));

const AccountsDetailsPage = lazy(() => import("./pages/Accounts/AccountsDetailsPage"));
const ContactsDetailsPage = lazy(() => import("./pages/Contacts/ContactsDetailsPage"));
const DealsDetailsPage = lazy(() => import("./pages/Deals/DealsDetailsPage"));
const ActivitiesDetailsPage = lazy(() => import("./pages/Activities/ActivitiesDetailsPage"));

const CreateAccountPage = lazy(() => import("./pages/Accounts/CreateAccountPage"));
const CreateContactsPage = lazy(() => import("./pages/Contacts/CreateContactsPage"));
const CreateDealPage = lazy(() => import("./pages/Deals/CreateDealPage"));
const CreateActivitiesPage = lazy(() => import("./pages/Activities/CreateActivitiesPage"));
const CreateProduct = lazy(() => import("./pages/Products/CreateProductPage"));

const EditAccountPage = lazy(() => import("./pages/Accounts/EditAccountPage"));
const EditContactPage = lazy(() => import("./pages/Contacts/EditContactPage"));
const EditDealPage = lazy(() => import("./pages/Deals/EditDealPage"));
const EditActivityPage = lazy(() => import("./pages/Activities/EditActivityPage"));

const LoginPage = lazy(() => import("./pages/LoginPage"));
const NotFoundPage = lazy(() => import("./pages/Error"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

const AppRoutes = () => {
  console.log("AppRoutes component is rendering");

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected routes with dynamic allowedRoles from ROUTE_ACCESS */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.dashboard}>
            <Dashboard />
          </PrivateRoute>
        }
      />

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
      <Route
        path="/deal-stages"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.dealStage}>
            <DealStagePage />
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
      <Route
        path="/activity-types"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.activityTypes}>
            <ActivityTypePage />
          </PrivateRoute>
        }
      />
      {/* --- Products Routes --- */}
      <Route
        path="/products"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.products}>
            <ProductsContainer />
          </PrivateRoute>
        }
      />
      <Route
        path="/products/create"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.productsCreate}>
            <CreateProduct />
          </PrivateRoute>
        }
      />

      {/* --- Geography Routes (Updated) --- */}
      {/* Main geography route - shows countries by default */}
      <Route
        path="/countries"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.country}>
            <CountryContainer />
          </PrivateRoute>
        }
      />

      {/* Geography sub-routes - all use the same container but with different tabs */}
      <Route
        path="/countries/states"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.states}>
            <CountryContainer />
          </PrivateRoute>
        }
      />

      <Route
        path="/countries/cities"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.city}>
            <CountryContainer />
          </PrivateRoute>
        }
      />

      {/* Legacy routes - redirect to new structure */}
      <Route
        path="/cities"
        element={<Navigate to="/countries/cities" replace />}
      />

      <Route
        path="/states"
        element={<Navigate to="/countries/states" replace />}
      />

      {/* --- Industry Routes --- */}
      <Route
        path="/industries"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.industry}>
            <IndustryContainer />
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

      {/* --- Role Management Route --- */}

      <Route
        path="/rolemanagement"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.roles}>
            <RoleManagement />
          </PrivateRoute>
        }
      />
      <Route
        path="/priority-levels"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.priority}>
            <PriorityLevelContainer />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.settings}>
            <SettingsPage />
          </PrivateRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;