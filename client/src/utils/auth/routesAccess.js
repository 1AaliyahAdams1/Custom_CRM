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

// Define visibility rules for different roles
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

// NEW: Contact visibility rules - Sales Manager sees own + team contacts
export const CONTACT_VISIBILITY = {
  "Sales Representative": ["owned"],
  "Sales Manager": ["owned", "team-owned"],  // Can see team contacts
  "HR Manager": ["all"],
  "C-level": ["all"],
  "Reporter": ["owned"],
  "Customer Support": ["owned"],
  "Marketing": ["owned"],
  "Finance": ["owned"],
};

// NEW: Activity visibility rules - Sales Manager sees own + team activities
export const ACTIVITY_VISIBILITY = {
  "Sales Representative": ["owned"],
  "Sales Manager": ["owned", "team-owned"],  // Can see team activities
  "HR Manager": ["all"],
  "C-level": ["all"],
  "Reporter": ["owned"],
  "Customer Support": ["owned"],
  "Marketing": ["owned"],
  "Finance": ["owned"],
};

// NEW: Employee visibility rules - Sales Manager sees only team members
export const EMPLOYEE_VISIBILITY = {
  "Sales Representative": ["self"],
  "Sales Manager": ["self", "team-members"],  // Can see team members only
  "HR Manager": ["all"],
  "C-level": ["all"],
  "Reporter": ["self"],
  "Customer Support": ["self"],
  "Marketing": ["self"],
  "Finance": ["self"],
};

// NEW: Team visibility rules - Sales Manager sees only their teams
export const TEAM_VISIBILITY = {
  "Sales Representative": ["none"],  // Sales reps don't manage teams
  "Sales Manager": ["own-teams"],  // Can see only teams they manage
  "HR Manager": ["all"],
  "C-level": ["all"],
  "Reporter": ["none"],
  "Customer Support": ["none"],
  "Marketing": ["none"],
  "Finance": ["none"],
};

// Helper function to check if user can see an account
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

// Helper function to check if user can assign to an account
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

// NEW: Helper function to check if user can view a contact
export const canViewContact = (contact, userRoles, userId, teamMemberIds = []) => {
  if (!contact) return false;
  
  // C-level and HR Manager can see everything
  if (userRoles.includes("C-level") || userRoles.includes("HR Manager")) return true;
  
  const ownerId = contact.ownerId || contact.AssignedEmployeeID;
  
  // User can see their own contacts
  if (ownerId === userId || String(ownerId) === String(userId)) return true;
  
  // Sales Manager can see team contacts
  if (userRoles.includes("Sales Manager")) {
    const isOwnedByTeam = teamMemberIds.includes(parseInt(ownerId));
    if (isOwnedByTeam) return true;
  }
  
  return false;
};

// NEW: Helper function to check if user can view an activity
export const canViewActivity = (activity, userRoles, userId, teamMemberIds = []) => {
  if (!activity) return false;
  
  // C-level and HR Manager can see everything
  if (userRoles.includes("C-level") || userRoles.includes("HR Manager")) return true;
  
  const ownerId = activity.ownerId || activity.createdBy || activity.AssignedEmployeeID;
  
  // User can see their own activities
  if (ownerId === userId || String(ownerId) === String(userId)) return true;
  
  // Sales Manager can see team activities
  if (userRoles.includes("Sales Manager")) {
    const isOwnedByTeam = teamMemberIds.includes(parseInt(ownerId));
    if (isOwnedByTeam) return true;
  }
  
  return false;
};

// NEW: Helper function to check if user can view an employee
export const canViewEmployee = (employee, userRoles, userId, teamMemberIds = []) => {
  if (!employee) return false;
  
  // C-level and HR Manager can see all employees
  if (userRoles.includes("C-level") || userRoles.includes("HR Manager")) return true;
  
  const employeeId = employee.id || employee.employeeId;
  
  // User can see themselves
  if (employeeId === userId || String(employeeId) === String(userId)) return true;
  
  // Sales Manager can see only their team members
  if (userRoles.includes("Sales Manager")) {
    const isTeamMember = teamMemberIds.includes(parseInt(employeeId));
    if (isTeamMember) return true;
  }
  
  return false;
};

// NEW: Helper function to check if user can view a team
export const canViewTeam = (team, userRoles, userId, userManagedTeamIds = []) => {
  if (!team) return false;
  
  // C-level and HR Manager can see all teams
  if (userRoles.includes("C-level") || userRoles.includes("HR Manager")) return true;
  
  const teamId = team.id || team.teamId;
  
  // Sales Manager can see only teams they manage
  if (userRoles.includes("Sales Manager")) {
    const isOwnTeam = userManagedTeamIds.includes(parseInt(teamId));
    if (isOwnTeam) return true;
  }
  
  return false;
};

// NEW: Helper function to get assignable users for Sales Manager
// Sales Manager can only assign to themselves or their team members
export const getAssignableUsers = (allUsers, userRoles, userId, teamMemberIds = []) => {
  // C-level can assign to anyone
  if (userRoles.includes("C-level")) return allUsers;
  
  // Sales Manager can assign to self + team members
  if (userRoles.includes("Sales Manager")) {
    return allUsers.filter(user => {
      const userIdNum = user.id || user.employeeId;
      return userIdNum === userId || teamMemberIds.includes(parseInt(userIdNum));
    });
  }
  
  // HR Manager can assign to anyone
  if (userRoles.includes("HR Manager")) return allUsers;
  
  // Other roles can only assign to themselves
  return allUsers.filter(user => {
    const userIdNum = user.id || user.employeeId;
    return userIdNum === userId;
  });
};

// NEW: Helper function to filter lists based on visibility rules
export const filterByVisibility = (items, itemType, userRoles, userId, teamMemberIds = [], userManagedTeamIds = []) => {
  if (!items || !Array.isArray(items)) return [];
  
  switch (itemType) {
    case 'accounts':
      return items.filter(item => canViewAccount(item, userRoles, userId, teamMemberIds));
    
    case 'contacts':
      return items.filter(item => canViewContact(item, userRoles, userId, teamMemberIds));
    
    case 'activities':
      return items.filter(item => canViewActivity(item, userRoles, userId, teamMemberIds));
    
    case 'employees':
      return items.filter(item => canViewEmployee(item, userRoles, userId, teamMemberIds));
    
    case 'teams':
      return items.filter(item => canViewTeam(item, userRoles, userId, userManagedTeamIds));
    
    default:
      return items;
  }
};