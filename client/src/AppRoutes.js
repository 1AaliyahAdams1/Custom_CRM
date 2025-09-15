import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import PrivateRoute from "./components/auth/PrivateRoute";
import { ROUTE_ACCESS } from "./utils/auth/routesAccess";
import Unauthorized from "./pages/Unauthorized";

// Lazy-loaded pages
const Dashboard = lazy(() => import("./pages/Dashboard"));

// Accounts
const Accounts = lazy(() => import("./components/containers/AccountsContainer"));
const AccountsDetailsPage = lazy(() => import("./pages/Accounts/AccountsDetailsPage"));
const CreateAccountPage = lazy(() => import("./pages/Accounts/CreateAccountPage"));
const EditAccountPage = lazy(() => import("./pages/Accounts/EditAccountPage"));

// Contacts
const Contacts = lazy(() => import("./components/containers/ContactsContainer"));
const ContactsDetailsPage = lazy(() => import("./pages/Contacts/ContactsDetailsPage"));
const CreateContactsPage = lazy(() => import("./pages/Contacts/CreateContactsPage"));
const EditContactPage = lazy(() => import("./pages/Contacts/EditContactPage"));

// Deals
const Deals = lazy(() => import("./components/containers/DealsContainer"));
const DealsDetailsPage = lazy(() => import("./pages/Deals/DealsDetailsPage"));
const CreateDealPage = lazy(() => import("./pages/Deals/CreateDealPage"));
const EditDealPage = lazy(() => import("./pages/Deals/EditDealPage"));
const DealStagePage = lazy(() => import("./pages/Deals/DealStagePage"));

// Activities
const Activities = lazy(() => import("./components/containers/ActivitiesContainer"));
const ActivitiesDetailsPage = lazy(() => import("./pages/Activities/ActivitiesDetailsPage"));
const CreateActivitiesPage = lazy(() => import("./pages/Activities/CreateActivitiesPage"));
const EditActivityPage = lazy(() => import("./pages/Activities/EditActivityPage"));
const ActivityTypePage = lazy(() => import("./pages/Activities/ActivityTypePage"));

// Products
const ProductsContainer = lazy(() => import("./components/containers/ProductsContainer"));
const CreateProduct = lazy(() => import("./pages/Products/CreateProductPage"));

// Geography
const CountryContainer = lazy(() => import("./components/containers/CountryContainer"));

// Industry & Priority
const IndustryContainer = lazy(() => import("./components/containers/IndustryContainer"));
const PriorityLevelContainer = lazy(() => import("./components/containers/PriorityLevelContainer"));

// Other pages
const CompaniesPage = lazy(() => import("./pages/Companies/CompaniesPage"));
const EventsPage = lazy(() => import("./pages/Events/EventsPage"));
const OwnersPage = lazy(() => import("./pages/Owners/OwnersPage"));
const DiscountCodesPage = lazy(() => import("./pages/DiscountCodes/DiscountCodePage"));

const Reports = lazy(() => import("./pages/ReportsPage"));
const SmartWorkPage = lazy(() => import("./pages/SmartWorkPage"));
const RoleManagement = lazy(() => import("./pages/RoleManagement"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const NotFoundPage = lazy(() => import("./pages/Error"));

// Helper
const renderPrivate = (Component, accessRoles) => (
  <PrivateRoute allowedRoles={accessRoles}>{Component}</PrivateRoute>
);

const AppRoutes = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={renderPrivate(<Dashboard />, ROUTE_ACCESS.dashboard)} />

      {/* Accounts */}
      <Route path="/accounts" element={renderPrivate(<Accounts />, ROUTE_ACCESS.accounts)} />
      <Route path="/accounts/unassigned" element={renderPrivate(<Accounts />, ROUTE_ACCESS.accounts)} />
      <Route path="/accounts/:id" element={renderPrivate(<AccountsDetailsPage />, ROUTE_ACCESS.accountsDetails)} />
      <Route path="/accounts/create" element={renderPrivate(<CreateAccountPage />, ROUTE_ACCESS.accountsCreate)} />
      <Route path="/accounts/edit/:id" element={renderPrivate(<EditAccountPage />, ROUTE_ACCESS.accountsEdit)} />

      {/* Contacts */}
      <Route path="/contacts" element={renderPrivate(<Contacts />, ROUTE_ACCESS.contacts)} />
      <Route path="/contacts/:id" element={renderPrivate(<ContactsDetailsPage />, ROUTE_ACCESS.contactsDetails)} />
      <Route path="/contacts/create" element={renderPrivate(<CreateContactsPage />, ROUTE_ACCESS.contactsCreate)} />
      <Route path="/contacts/edit/:id" element={renderPrivate(<EditContactPage />, ROUTE_ACCESS.contactsEdit)} />

      {/* Deals */}
      <Route path="/deals" element={renderPrivate(<Deals />, ROUTE_ACCESS.deals)} />
      <Route path="/deals/:id" element={renderPrivate(<DealsDetailsPage />, ROUTE_ACCESS.dealsDetails)} />
      <Route path="/deals/create" element={renderPrivate(<CreateDealPage />, ROUTE_ACCESS.dealsCreate)} />
      <Route path="/deals/edit/:id" element={renderPrivate(<EditDealPage />, ROUTE_ACCESS.dealsEdit)} />
      <Route path="/deal-stages" element={renderPrivate(<DealStagePage />, ROUTE_ACCESS.dealStage)} />

      {/* Activities */}
      <Route path="/activities" element={renderPrivate(<Activities />, ROUTE_ACCESS.activities)} />
      <Route path="/activities/:id" element={renderPrivate(<ActivitiesDetailsPage />, ROUTE_ACCESS.activitiesDetails)} />
      <Route path="/activities/create" element={renderPrivate(<CreateActivitiesPage />, ROUTE_ACCESS.activitiesCreate)} />
      <Route path="/activities/edit/:id" element={renderPrivate(<EditActivityPage />, ROUTE_ACCESS.activitiesEdit)} />
      <Route path="/activity-types" element={renderPrivate(<ActivityTypePage />, ROUTE_ACCESS.activityTypes)} />

      {/* Products */}
      <Route path="/products" element={renderPrivate(<ProductsContainer />, ROUTE_ACCESS.products)} />
      <Route path="/products/create" element={renderPrivate(<CreateProduct />, ROUTE_ACCESS.productsCreate)} />

      {/* Geography */}
      <Route path="/countries" element={renderPrivate(<CountryContainer />, ROUTE_ACCESS.country)} />
      <Route path="/countries/states" element={renderPrivate(<CountryContainer />, ROUTE_ACCESS.states)} />
      <Route path="/countries/cities" element={renderPrivate(<CountryContainer />, ROUTE_ACCESS.city)} />
      <Route path="/countries/currencies" element={renderPrivate(<CountryContainer />, ROUTE_ACCESS.currency)} />
      {/* Legacy redirects */}
      <Route path="/cities" element={<Navigate to="/countries/cities" replace />} />
      <Route path="/states" element={<Navigate to="/countries/states" replace />} />
      <Route path="/currencies" element={<Navigate to="/countries/currencies" replace />} />

      {/* Industry & Priority */}
      <Route path="/industries" element={renderPrivate(<IndustryContainer />, ROUTE_ACCESS.industry)} />
      <Route path="/priority-levels" element={renderPrivate(<PriorityLevelContainer />, ROUTE_ACCESS.priority)} />

      {/* Other */}
      <Route path="/companies" element={renderPrivate(<CompaniesPage />, ROUTE_ACCESS.companies)} />
      <Route path="/events" element={renderPrivate(<EventsPage />, ROUTE_ACCESS.events)} />
      <Route path="/owners" element={renderPrivate(<OwnersPage />, ROUTE_ACCESS.owners)} />
      <Route path="/discount-codes" element={renderPrivate(<DiscountCodesPage />, ROUTE_ACCESS.discountcodes)} />

      {/* Smart Work */}
      <Route path="/smart-work" element={renderPrivate(<SmartWorkPage />, ROUTE_ACCESS.smartWork)} />

      {/* Reports */}
      <Route path="/reports" element={renderPrivate(<Reports />, ROUTE_ACCESS.reports)} />

      {/* Role Management */}
      <Route path="/rolemanagement" element={renderPrivate(<RoleManagement />, ROUTE_ACCESS.roles)} />

      {/* Settings */}
      <Route path="/settings" element={renderPrivate(<SettingsPage />, ROUTE_ACCESS.settings)} />

      {/* Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
