import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import PrivateRoute from "./components/auth/PrivateRoute";
import { ROUTE_ACCESS } from "./utils/auth/routesAccess";
import Unauthorized from "./pages/Unauthorized";

// Dashboard
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
const Activities = lazy(() => import("./components/containers/ActivitiesContainer"));



const ProductsContainer = lazy(() => import("./components/containers/ProductsContainer"));
const Reports = lazy(() => import("./pages/ReportsPage"));
const SmartWorkPage = lazy(() => import("./components/containers/workPageContainer"));
const RoleManagement = lazy(() => import("./pages/RoleManagement"));

const CountryContainer = lazy(() => import("./components/containers/CountryContainer"));
const CityPage = lazy(() => import("./pages/GeographicData/CityPage"));
const CurrencyPage = lazy(() => import("./pages/GeographicData/CurrencyPage"));
const StateProvincePage = lazy(() => import("./pages/GeographicData/StateProvincePage"));
const IndustryContainer = lazy(() => import("./components/containers/IndustryContainer"));
const PriorityLevelContainer = lazy(() => import("./components/containers/PriorityLevelContainer"));
const ActivityTypePage = lazy(() => import("./pages/Activities/ActivityTypePage"));
const DealStagePage = lazy(() => import("./pages/Deals/DealStagePage"));

// Activities
const Activities = lazy(() => import("./components/containers/ActivitiesContainer"));
const ActivitiesDetailsPage = lazy(() => import("./pages/Activities/ActivitiesDetailsPage"));
const CreateActivitiesPage = lazy(() => import("./pages/Activities/CreateActivitiesPage"));
const EditActivityPage = lazy(() => import("./pages/Activities/EditActivityPage"));
const ActivityTypePage = lazy(() => import("./pages/Activities/ActivityTypePage"));

// Products
const ProductsContainer = lazy(() => import("./components/containers/ProductsContainer"));
const ProductDetailsPage = lazy(() => import("./pages/Products/ProductDetailsPage"));
const CreateProduct = lazy(() => import("./pages/Products/CreateProductPage"));
const EditProductPage = lazy(() => import("./pages/Products/EditProductPage"));

// Companies
const CompaniesPage = lazy(() => import("./pages/Companies/CompaniesPage"));
const CompaniesDetailsPage = lazy(() => import("./pages/Companies/CompanyDetailsPage"));
const CreateCompanyPage = lazy(() => import("./pages/Companies/AddCompanyPage"));
const EditCompanyPage = lazy(() => import("./pages/Companies/EditCompanyPage"));

// Events
const EventsPage = lazy(() => import("./pages/Events/EventsPage"));
const EventsDetailsPage = lazy(() => import("./pages/Events/EventDetailsPage"));
const DiscountCodesDetailsPage = lazy(() => import("./pages/DiscountCodes/DiscountCodeDetails"));

const CreateAccountPage = lazy(() => import("./pages/Accounts/CreateAccountPage"));
const CreateContactsPage = lazy(() => import("./pages/Contacts/CreateContactsPage"));
const CreateDealPage = lazy(() => import("./pages/Deals/CreateDealPage"));
const CreateActivitiesPage = lazy(() => import("./pages/Activities/CreateActivitiesPage"));
const CreateProduct = lazy(() => import("./pages/Products/CreateProductPage"));
const CreateCompanyPage = lazy(() => import("./pages/Companies/AddCompanyPage"));
const CreateDiscountCodePage = lazy(() => import("./pages/DiscountCodes/CreateDiscountCodePage"));
const EditDiscountCodePage = lazy(() => import("./pages/DiscountCodes/EditDiscountCodePage"));

// Owners
const OwnersPage = lazy(() => import("./pages/Owners/OwnersPage"));

// Geography
const CountryContainer = lazy(() => import("./components/containers/CountryContainer"));

// Industry & Priority
const IndustryContainer = lazy(() => import("./components/containers/IndustryContainer"));
const PriorityLevelContainer = lazy(() => import("./components/containers/PriorityLevelContainer"));

// System Pages
const LoginPage = lazy(() => import("./pages/LoginPage"));
const NotFoundPage = lazy(() => import("./pages/Error"));

// Extra (make sure these exist in your project)
const SmartWorkPage = lazy(() => import("./pages/SmartWorkPage"));
const Reports = lazy(() => import("./pages/ReportsPage"));
const RoleManagement = lazy(() => import("./pages/RoleManagement"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

// Helper
const renderPrivate = (Component, accessRoles) => (
  <PrivateRoute allowedRoles={accessRoles}>{Component}</PrivateRoute>
);

const AppRoutes = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={renderPrivate(<Dashboard />, ROUTE_ACCESS.dashboard)} />

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
      <Route
        path="/products/edit/:id"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.productsEdit}>
            <EditProductPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/products/:id"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.productsDetails}>  
            <ProductDetailsPage />
          </PrivateRoute>
        }
      />
      {/* --- Companies Routes --- */}
      <Route
        path="/companies"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.companies}>
            <CompaniesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/companies/create"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.companiesCreate}>
            <CreateCompanyPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/companies/edit/:id"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.companiesEdit}>
            <EditCompanyPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/companies/:id"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.companiesDetails}> 
            <CompaniesDetailsPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/companies/:id"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.companiesDetails}> 
            <CompaniesDetailsPage />
          </PrivateRoute>
        }
      />


      {/* --- Events Routes --- */}
      <Route
        path="/events"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.events}>
            <EventsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/events/create"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.eventsCreate}>
            <CreateEventPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/events/edit/:id"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.eventsEdit}>
            <EditEventPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/events/:id"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.eventsDetails}>
            <EventsDetailsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/events/:id"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.eventsDetails}>
            <EventsDetailsPage />
          </PrivateRoute>
        }
      />

    
      {/* --- Owners Routes --- */}
      <Route
        path="/owners"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.owners}>
            <OwnersPage />
          </PrivateRoute>
        }
      />
      {/* --- Discount Codes Routes --- */}
      <Route
        path="/discount-codes"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.discountcodes}>
            <DiscountCodesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/discount-codes/create"
        element={   
          <PrivateRoute allowedRoles={ROUTE_ACCESS.discountcodesCreate}>
            <CreateDiscountCodePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/discount-codes/edit/:id"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.discountcodesEdit}>
            <EditDiscountCodePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/discount-codes/:id"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.discountcodesDetails}>
            <DiscountCodesDetailsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/discount-codes/:id"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.discountcodesDetails}>
            <DiscountCodesDetailsPage />
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
      <Route
        path="/countries/currencies"
        element={
          <PrivateRoute allowedRoles={ROUTE_ACCESS.currency}>
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
      <Route
        path="/currencies"
        element={<Navigate to="/countries/currencies" replace />}
      />

      {/* Industry & Priority */}
      <Route path="/industries" element={renderPrivate(<IndustryContainer />, ROUTE_ACCESS.industry)} />
      <Route path="/priority-levels" element={renderPrivate(<PriorityLevelContainer />, ROUTE_ACCESS.priority)} />

      {/* Extra */}
      <Route path="/smart-work" element={renderPrivate(<SmartWorkPage />, ROUTE_ACCESS.smartWork)} />
      <Route path="/reports" element={renderPrivate(<Reports />, ROUTE_ACCESS.reports)} />
      <Route path="/rolemanagement" element={renderPrivate(<RoleManagement />, ROUTE_ACCESS.roles)} />
      <Route path="/settings" element={renderPrivate(<SettingsPage />, ROUTE_ACCESS.settings)} />

      {/* Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
