import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Toolbar,
  Tabs,
  Tab,
  Snackbar,
} from "@mui/material";
import {
  History as HistoryIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
  Work as WorkIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import TableView from '../components/tableFormat/TableView';
import { formatters } from '../utils/formatters';
import axios from 'axios';

// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auditlog-tabpanel-${index}`}
      aria-labelledby={`auditlog-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

const AuditLogPage = () => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Data state for each audit log type
  const [accountLogs, setAccountLogs] = useState([]);
  const [contactLogs, setContactLogs] = useState([]);
  const [dealLogs, setDealLogs] = useState([]);
  const [employeeLogs, setEmployeeLogs] = useState([]);
  const [productLogs, setProductLogs] = useState([]);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Fetch audit logs based on type
  const fetchAuditLogs = async (logType) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/audit-logs/${logType}`);
      return response.data;
    } catch (err) {
      console.error(`Error fetching ${logType} audit logs:`, err);
      setError(`Failed to load ${logType} audit logs`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    const loadTabData = async () => {
      switch (currentTab) {
        case 0: // Accounts
          if (accountLogs.length === 0) {
            const data = await fetchAuditLogs('accounts');
            setAccountLogs(data);
          }
          break;
        case 1: // Contacts
          if (contactLogs.length === 0) {
            const data = await fetchAuditLogs('contacts');
            setContactLogs(data);
          }
          break;
        case 2: // Deals
          if (dealLogs.length === 0) {
            const data = await fetchAuditLogs('deals');
            setDealLogs(data);
          }
          break;
        case 3: // Employees
          if (employeeLogs.length === 0) {
            const data = await fetchAuditLogs('employees');
            setEmployeeLogs(data);
          }
          break;
        case 4: // Products
          if (productLogs.length === 0) {
            const data = await fetchAuditLogs('products');
            setProductLogs(data);
          }
          break;
        default:
          break;
      }
    };

    loadTabData();
  }, [currentTab]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const availableTabs = [
    { id: 'accounts', label: 'Accounts', icon: <BusinessIcon />, component: 'accounts' },
    { id: 'contacts', label: 'Contacts', icon: <PeopleIcon />, component: 'contacts' },
    { id: 'deals', label: 'Deals', icon: <AttachMoneyIcon />, component: 'deals' },
    { id: 'employees', label: 'Employees', icon: <WorkIcon />, component: 'employees' },
    { id: 'products', label: 'Products', icon: <InventoryIcon />, component: 'products' },
  ];

  // Column definitions for each audit log type
  const accountColumns = [
    { field: 'AccountName', headerName: 'Account Name', type: 'tooltip', defaultVisible: true },
    { field: 'CountryID', headerName: 'Country ID', defaultVisible: false },
    { field: 'IndustryID', headerName: 'Industry ID', defaultVisible: false },
    { field: 'Website', headerName: 'Website', defaultVisible: true },
    { field: 'PrimaryPhone', headerName: 'Phone', defaultVisible: true },
    { field: 'email', headerName: 'Email', defaultVisible: true },
    { field: 'ChangedByName', headerName: 'Changed By', defaultVisible: true },
    { field: 'ActionTypeID', headerName: 'Action Type', defaultVisible: true },
    { field: 'CreatedAt', headerName: 'Created', type: 'dateTime', defaultVisible: true },
    { field: 'UpdatedAt', headerName: 'Updated', type: 'dateTime', defaultVisible: true },
  ];

  const contactColumns = [
    { field: 'ContactID', headerName: 'Contact ID', defaultVisible: true },
    { field: 'AccountID', headerName: 'Account ID', defaultVisible: true },
    { field: 'PersonID', headerName: 'Person ID', defaultVisible: true },
    { field: 'Still_employed', headerName: 'Still Employed', defaultVisible: true },
    { field: 'JobTitleID', headerName: 'Job Title ID', defaultVisible: false },
    { field: 'WorkEmail', headerName: 'Work Email', defaultVisible: true },
    { field: 'WorkPhone', headerName: 'Work Phone', defaultVisible: true },
    { field: 'ChangedByName', headerName: 'Changed By', defaultVisible: true },
    { field: 'ActionTypeID', headerName: 'Action Type', defaultVisible: true },
    { field: 'UpdatedAt', headerName: 'Updated', type: 'dateTime', defaultVisible: true },
  ];

  const dealColumns = [
    { field: 'DealName', headerName: 'Deal Name', type: 'tooltip', defaultVisible: true },
    { field: 'AccountID', headerName: 'Account ID', defaultVisible: true },
    { field: 'DealStageID', headerName: 'Deal Stage ID', defaultVisible: true },
    { field: 'Value', headerName: 'Value', type: 'currency', defaultVisible: true },
    { field: 'CloseDate', headerName: 'Close Date', type: 'date', defaultVisible: true },
    { field: 'Probability', headerName: 'Probability', defaultVisible: true },
    { field: 'CurrencyID', headerName: 'Currency ID', defaultVisible: false },
    { field: 'ChangedByName', headerName: 'Changed By', defaultVisible: true },
    { field: 'ActionTypeID', headerName: 'Action Type', defaultVisible: true },
    { field: 'UpdatedAt', headerName: 'Updated', type: 'dateTime', defaultVisible: true },
  ];

  const employeeColumns = [
    { field: 'EmployeeName', headerName: 'Employee Name', type: 'tooltip', defaultVisible: true },
    { field: 'EmployeeEmail', headerName: 'Email', defaultVisible: true },
    { field: 'EmployeePhone', headerName: 'Phone', defaultVisible: true },
    { field: 'JobTitleID', headerName: 'Job Title ID', defaultVisible: false },
    { field: 'DepartmentID', headerName: 'Department ID', defaultVisible: false },
    { field: 'HireDate', headerName: 'Hire Date', type: 'date', defaultVisible: true },
    { field: 'TerminationDate', headerName: 'Termination Date', type: 'date', defaultVisible: false },
    { field: 'salary', headerName: 'Salary', type: 'currency', defaultVisible: false },
    { field: 'ChangedByName', headerName: 'Changed By', defaultVisible: true },
    { field: 'ActionTypeID', headerName: 'Action Type', defaultVisible: true },
    { field: 'UpdatedAt', headerName: 'Updated', type: 'dateTime', defaultVisible: true },
  ];

  const productColumns = [
    { field: 'ProductName', headerName: 'Product Name', type: 'tooltip', defaultVisible: true },
    { field: 'AccountID', headerName: 'Account ID', defaultVisible: true },
    { field: 'Description', headerName: 'Description', type: 'tooltip', defaultVisible: true },
    { field: 'Price', headerName: 'Price', type: 'currency', defaultVisible: true },
    { field: 'Cost', headerName: 'Cost', type: 'currency', defaultVisible: true },
    { field: 'SKU', headerName: 'SKU', defaultVisible: true },
    { field: 'CategoryID', headerName: 'Category ID', defaultVisible: false },
    { field: 'ChangedByName', headerName: 'Changed By', defaultVisible: true },
    { field: 'ActionTypeID', headerName: 'Action Type', defaultVisible: true },
    { field: 'UpdatedAt', headerName: 'Updated', type: 'dateTime', defaultVisible: true },
  ];

  // Formatters for audit logs
  const auditLogFormatters = {
    ...formatters,
    ActionTypeID: (value) => {
      const actionTypes = {
        1: { label: 'Created', color: theme.palette.success.main },
        2: { label: 'Updated', color: theme.palette.info.main },
        3: { label: 'Deleted', color: theme.palette.error.main },
        4: { label: 'Exported', color: theme.palette.primary.main },
        5: { label: 'Imported', color: theme.palette.secondary.main },
        6: { label: 'Approved', color: theme.palette.success.dark },
        7: { label: 'Deactivated', color: theme.palette.warning.main },
        8: { label: 'Reactivated', color: theme.palette.success.light },
      };
      const action = actionTypes[value] || { label: 'Unknown', color: theme.palette.grey[500] };
      return (
        <Chip
          label={action.label}
          size="small"
          sx={{
            backgroundColor: action.color,
            color: theme.palette.getContrastText(action.color),
            fontWeight: 500,
          }}
        />
      );
    },
    Still_employed: (value) => {
      return (
        <Chip
          label={value ? 'Yes' : 'No'}
          size="small"
          sx={{
            backgroundColor: value ? theme.palette.success.main : theme.palette.grey[500],
            color: '#fff',
            fontWeight: 500,
          }}
        />
      );
    },
  };

  // Helper function to sort audit log data by UpdatedAt in descending order (newest first)
  const sortDataByDate = (data) => {
    if (!data || data.length === 0) return data;
    return [...data].sort((a, b) => {
      const dateA = new Date(a.UpdatedAt);
      const dateB = new Date(b.UpdatedAt);
      return dateB - dateA; // Descending order (newest first)
    });
  };

  // Get current data and columns based on tab
  const getCurrentTabData = () => {
    switch (currentTab) {
      case 0:
        return { data: sortDataByDate(accountLogs), columns: accountColumns, idField: 'TempAccountID' };
      case 1:
        return { data: sortDataByDate(contactLogs), columns: contactColumns, idField: 'TempContactID' };
      case 2:
        return { data: sortDataByDate(dealLogs), columns: dealColumns, idField: 'TempDealID' };
      case 3:
        return { data: sortDataByDate(employeeLogs), columns: employeeColumns, idField: 'TempEmployeeID' };
      case 4:
        return { data: sortDataByDate(productLogs), columns: productColumns, idField: 'TempProductID' };
      default:
        return { data: [], columns: [], idField: 'id' };
    }
  };

  const { data: currentData, columns: currentColumns, idField } = getCurrentTabData();

  return (
    <Box sx={{ 
      width: "100%", 
      backgroundColor: theme.palette.background.default, 
      minHeight: "100vh", 
      p: 3 
    }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <HistoryIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
          <Typography variant="h4" component="h1" sx={{ 
            color: theme.palette.text.primary,
            fontWeight: 600 
          }}>
            Audit Logs
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ 
          color: theme.palette.text.secondary,
          ml: 7
        }}>
          View historical changes to accounts, contacts, deals, employees, and products
        </Typography>
      </Box>

      <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: theme.palette.divider }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange} 
            sx={{ backgroundColor: theme.palette.background.paper }}
          >
            {availableTabs.map((tab, index) => (
              <Tab
                key={tab.id}
                icon={tab.icon}
                iconPosition="start"
                label={tab.label}
                sx={{
                  color: currentTab === index ? theme.palette.text.primary : theme.palette.text.secondary,
                  '&.Mui-selected': { 
                    color: theme.palette.primary.main, 
                    fontWeight: 600 
                  },
                  textTransform: 'none',
                  fontSize: '1rem',
                  minHeight: 56
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Tab Panels */}
        {availableTabs.map((tab, index) => (
          <TabPanel key={tab.id} value={currentTab} index={index}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ m: 2 }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            {successMessage && (
              <Alert 
                severity="success" 
                sx={{ m: 2 }}
                onClose={() => setSuccessMessage('')}
              >
                {successMessage}
              </Alert>
            )}

            {loading ? (
              <Box display="flex" justifyContent="center" p={8}>
                <CircularProgress />
              </Box>
            ) : (
              <TableView
                data={currentData}
                columns={currentColumns}
                idField={idField}
                selected={[]}
                showSelection={false}
                formatters={auditLogFormatters}
                entityType={`${tab.label.toLowerCase()}-audit`}
                showActions={false}
                defaultSortField="UpdatedAt"
                defaultSortOrder="desc"
              />
            )}


          </TabPanel>
        ))}
      </Paper>

      {/* Status Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSuccessMessage('')} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AuditLogPage;