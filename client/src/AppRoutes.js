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


const AccountsDetailsPage = lazy(() => import("./pages/Accounts/AccountsDetailsPage"));
const ContactsDetailsPage = lazy(() => import("./pages/Contacts/ContactsDetailsPage"));
const DealsDetailsPage = lazy(() => import("./pages/Deals/DealsDetailsPage"));
const ActivitiesDetailsPage = lazy(() => import("./pages/Activities/ActivitiesDetailsPage"));
const ProductDetailsPage = lazy(() => import("./pages/Products/ProductDetailsPage"));
const CompaniesDetailsPage = lazy(() => import("./pages/Companies/CompanyDetailsPage"));
const EventsDetailsPage = lazy(() => import("./pages/Events/EventDetailsPage"));
const DiscountCodesDetailsPage = lazy(() => import("./pages/DiscountCodes/DiscountCodeDetailsPage"));

const CreateAccountPage = lazy(() => import("./pages/Accounts/CreateAccountPage"));
const CreateContactsPage = lazy(() => import("./pages/Contacts/CreateContactsPage"));
const CreateDealPage = lazy(() => import("./pages/Deals/CreateDealPage"));
const CreateActivitiesPage = lazy(() => import("./pages/Activities/CreateActivitiesPage"));
const CreateProduct = lazy(() => import("./pages/Products/CreateProductPage"));
const CreateCompanyPage = lazy(() => import("./pages/Companies/AddCompanyPage"));
const CreateDiscountCodePage = lazy(() => import("./pages/DiscountCodes/CreateDiscountCodePage"));
const CreateEventPage = lazy(() => import("./pages/Events/CreateEventPage"));

const EditAccountPage = lazy(() => import("./pages/Accounts/EditAccountPage"));
const EditContactPage = lazy(() => import("./pages/Contacts/EditContactPage"));
const EditDealPage = lazy(() => import("./pages/Deals/EditDealPage"));
const EditActivityPage = lazy(() => import("./pages/Activities/EditActivityPage"));
const EditProductPage = lazy(() => import("./pages/Products/EditProductPage"));
const EditCompanyPage = lazy(() => import("./pages/Companies/EditCompanyPage"));
const EditDiscountCodePage = lazy(() => import("./pages/DiscountCodes/EditDiscountCodePage"));
const EditEventPage = lazy(() => import("./pages/Events/EditEventsPage"));

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
