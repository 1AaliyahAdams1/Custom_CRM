import api from '../utils/api';

const RESOURCE = '/audit-logs';

//======================================
// Get all temp accounts audit logs
//======================================
export async function getAllTempAccounts() {
  try {
    const response = await api.get(`${RESOURCE}/accounts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching account audit logs:', error);
    throw error;
  }
}

//======================================
// Get all temp contacts audit logs
//======================================
export async function getAllTempContacts() {
  try {
    const response = await api.get(`${RESOURCE}/contacts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching contact audit logs:', error);
    throw error;
  }
}

//======================================
// Get all temp deals audit logs
//======================================
export async function getAllTempDeals() {
  try {
    const response = await api.get(`${RESOURCE}/deals`);
    return response.data;
  } catch (error) {
    console.error('Error fetching deal audit logs:', error);
    throw error;
  }
}

//======================================
// Get all temp employees audit logs
//======================================
export async function getAllTempEmployees() {
  try {
    const response = await api.get(`${RESOURCE}/employees`);
    return response.data;
  } catch (error) {
    console.error('Error fetching employee audit logs:', error);
    throw error;
  }
}

//======================================
// Get all temp products audit logs
//======================================
export async function getAllTempProducts() {
  try {
    const response = await api.get(`${RESOURCE}/products`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product audit logs:', error);
    throw error;
  }
}

//======================================
// Bulk fetch all audit logs
//======================================
export async function getAllAuditLogs() {
  try {
    const [accounts, contacts, deals, employees, products] = await Promise.all([
      getAllTempAccounts(),
      getAllTempContacts(),
      getAllTempDeals(),
      getAllTempEmployees(),
      getAllTempProducts(),
    ]);

    return {
      accounts,
      contacts,
      deals,
      employees,
      products,
    };
  } catch (error) {
    console.error('Error fetching all audit logs:', error);
    throw error;
  }
}

//======================================
// Export default object with all functions
//======================================
export default {
  getAllTempAccounts,
  getAllTempContacts,
  getAllTempDeals,
  getAllTempEmployees,
  getAllTempProducts,
  getAllAuditLogs,
};