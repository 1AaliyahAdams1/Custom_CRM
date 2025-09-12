const ALL = ["C-level", "Sales Manager", "Sales Representative"];
const MANAGEMENT = ["C-level", "Sales Manager"]; 
const CLEVEL = ["C-level"];

export const ROUTE_ACCESS = {
  dashboard: ALL,
  roles: CLEVEL,

  accounts: ALL,
  accountsDetails: ALL,
  accountsCreate: ALL,
  accountsEdit: ALL,

  accountAssign: CLEVEL, 
  accountClaim: ALL, 

  contacts: ALL,
  contactsDetails: ALL,
  contactsCreate: ALL,
  contactsEdit: ALL,

  deals: ALL,
  dealsDetails: ALL,
  dealsCreate: ALL,
  dealsEdit: ALL,
  dealStage: ALL,
  dealStageCreate: MANAGEMENT,

  activities: ALL,
  activitiesDetails: ALL,
  activitiesCreate: ALL,
  activitiesEdit: ALL,

  activityTypes: ALL,
  activityTypesCreate: MANAGEMENT,

  reports: MANAGEMENT,
  smartWork: ALL,

  products: ALL,
  productsCreate: MANAGEMENT,

  country: ALL,
  countryCreate: MANAGEMENT,

  city: ALL,
  cityCreate: MANAGEMENT,

  stateProvince: ALL,
  stateProvinceCreate: MANAGEMENT,

  industry: ALL,
  industryCreate: MANAGEMENT,

  priority: ALL,
  priorityCreate: MANAGEMENT,

  settings: ALL,
};
