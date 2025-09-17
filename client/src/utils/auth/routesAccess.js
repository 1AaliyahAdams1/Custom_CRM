const ALL = ["C-level", "Sales Manager", "Sales Representative", "Customer Support", "Reporter"];
const MANAGEMENT = ["C-level", "Sales Manager"]; 
const HR = ["HR", "C-level"];
const CLEVEL = ["C-level"];

export const ROUTE_ACCESS = {
  // Core
  dashboard: ALL,
  roles: HR,

  // Accounts
  accounts: ALL,
  accountsDetails: ALL,
  accountsCreate: ALL,
  accountsEdit: ALL,

  //Assign logic
  accountAssign: CLEVEL, 
  accountClaim: ALL, 
  accountUnclaim: ALL, 

  // Contacts
  contacts: ALL,
  contactsDetails: ALL,
  contactsCreate: ALL,
  contactsEdit: ALL,

  // Deals
  deals: ALL,
  dealsDetails: ALL,
  dealsCreate: ALL,
  dealsEdit: ALL,
  dealStage: ALL,
  dealStageCreate: MANAGEMENT,

  // Activities
  activities: ALL,
  activitiesDetails: ALL,
  activitiesCreate: ALL,
  activitiesEdit: ALL,
  activityTypes: ALL,
  activityTypesCreate: MANAGEMENT,

  // Reports & Smart Work
  reports: MANAGEMENT,
  smartWork: ALL,

  // Products
  products: ALL,
  productsCreate: ALL,

  // Geography
  country: ALL,
  countryCreate: ALL,
  city: ALL,
  cityCreate: ALL,
  stateProvince: ALL,
  stateProvinceCreate: ALL,
  currency: ALL,
  currencyCreate: ALL,

  // Industry & Priority
  industry: ALL,
  industryCreate: ALL,
  priority: ALL,
  priorityCreate: ALL,

  // Companies
  companies: MANAGEMENT,
  companiesDetails: MANAGEMENT,
  companiesCreate: MANAGEMENT,
  companiesEdit: MANAGEMENT,

  // Events
  events: ALL,
  eventsDetails: ALL,
  eventsCreate: ALL,
  eventsEdit: ALL,

  // Owners
  owners: MANAGEMENT,
  ownersCreate: MANAGEMENT,

  // Discount Codes
  discountcodes: MANAGEMENT,
  discountcodesCreate: MANAGEMENT,

  // Settings
  settings: ALL,
};

export const CLAIM_RULES = {
  "Sales Representative": (item) => item.ownerStatus === "unowned",
  "Sales Manager": (item) => item.ownerStatus === "unowned", 
  "Reporter": (item) => item.ownerStatus === "unowned",   
  "Customer Support": (item) => item.ownerStatus === "unowned",   
  "C-level": (item) =>
    item.ownerStatus === "unowned" || item.ownerStatus === "n/a",
};