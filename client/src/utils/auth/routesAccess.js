const ALL = ["C-level", "Sales Manager", "HR Manager", "Sales Representative", "Reporter", "Customer Support", "Marketing", "Finance"];
const MANAGEMENT = ["C-level", "Sales Manager", "HR Manager"]; 
const HR = ["C-level", "HR Manager"];
const CLEVEL = ["C-level"];

export const ROUTE_ACCESS = {
  // Core
  dashboard: MANAGEMENT,
  roles: HR,
  email: ALL,

  // Sequences
  sequences: ALL,
  sequencesDetails: ALL,
  sequencesCreate: ALL,
  sequencesEdit: ALL,

  // Accounts
  accounts: ALL,
  accountsDetails: ALL,
  accountsCreate: ALL,
  accountsEdit: ALL,

  // Assign logic - UPDATED
  accountAssign: MANAGEMENT,  // Can assign users (C-level to anyone, Sales Manager to team only)
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

  // DealRoom
  dealRoom: ALL,

  // AuditLog
  auditLog: MANAGEMENT,

  // Employees
  employees: MANAGEMENT,
  employeesCreate: MANAGEMENT,
  employeesEdit: MANAGEMENT,
  employeesDetails: MANAGEMENT,

  // Category
  category: MANAGEMENT,
  categoryCreate: MANAGEMENT,
  categoryEdit: MANAGEMENT,

  // Department
  department: MANAGEMENT,
  departmentCreate: MANAGEMENT,
  departmentEdit: MANAGEMENT,
  
  // Teams - NEW
  teams: MANAGEMENT,
  teamsCreate: MANAGEMENT,
  teamsEdit: MANAGEMENT,
};

// UPDATED: Claim rules now consider team ownership for Sales Managers
export const CLAIM_RULES = {
  "Sales Representative": (item) => item.ownerStatus === "unowned",
  "Sales Manager": (item) => item.ownerStatus === "unowned",  // Can only claim unowned
  "HR Manager": (item) => item.ownerStatus === "unowned",
  "Reporter": (item) => item.ownerStatus === "unowned",   
  "Customer Support": (item) => item.ownerStatus === "unowned",   
  "C-level": (item) => item.ownerStatus === "unowned" || item.ownerStatus === "n/a",
};

// NEW: Define visibility rules for different roles
export const ACCOUNT_VISIBILITY = {
  "Sales Representative": ["owned", "unowned"],
  "Sales Manager": ["owned", "team-owned", "unowned"],  // Can see team accounts
  "HR Manager": ["owned", "unowned"],
  "C-level": ["all"],  // Can see everything
  "Reporter": ["owned", "unowned"],
  "Customer Support": ["owned", "unowned"],
  "Marketing": ["owned", "unowned"],
  "Finance": ["owned", "unowned"],
};

// NEW: Helper function to check if user can see an account
export const canViewAccount = (account, userRoles, userId, teamMemberIds = []) => {
  if (!account) return false;
  
  // C-level can see everything
  if (userRoles.includes("C-level")) return true;
  
  const idsStr = account.AssignedEmployeeIDs;
  
  // Unowned accounts are visible to everyone
  if (!idsStr) return true;
  
  const ids = idsStr.split(",").map(id => id.trim());
  const isOwnedByMe = ids.includes(String(userId));
  
  // User can see their own accounts
  if (isOwnedByMe) return true;
  
  // Sales Manager can see team accounts
  if (userRoles.includes("Sales Manager")) {
    const isOwnedByTeam = ids.some(id => teamMemberIds.includes(parseInt(id)));
    if (isOwnedByTeam) return true;
  }
  
  return false;
};

// NEW: Helper function to check if user can assign to an account
export const canAssignToAccount = (account, userRoles, userId, teamMemberIds = []) => {
  if (!userRoles.includes("Sales Manager") && !userRoles.includes("C-level")) {
    return false;
  }
  
  // C-level can assign to any account
  if (userRoles.includes("C-level")) return true;
  
  // Sales Manager can assign to owned, team-owned, or unowned accounts
  if (userRoles.includes("Sales Manager")) {
    const idsStr = account.AssignedEmployeeIDs;
    
    // Can assign to unowned
    if (!idsStr) return true;
    
    const ids = idsStr.split(",").map(id => id.trim());
    const isOwnedByMe = ids.includes(String(userId));
    const isOwnedByTeam = ids.some(id => teamMemberIds.includes(parseInt(id)));
    
    // Can assign to own accounts or team accounts
    return isOwnedByMe || isOwnedByTeam;
  }
  
  return false;
};