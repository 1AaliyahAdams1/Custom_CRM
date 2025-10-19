import React, { useEffect, useState, useCallback, useMemo, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Alert, Typography, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";
import { getEmployeeById, updateEmployee, deleteEmployee } from "../../services/employeeService";
import { getAllActivities } from "../../services/activityService";
import { getAllNotes } from "../../services/noteService";
import { getAllAttachments } from "../../services/attachmentService";
import { AuthContext } from '../../context/auth/authContext';
import { formatters } from '../../utils/formatters';


// Import service objects from dropdownServices
import {
  cityService,
  countryService,
  stateProvinceService,
  departmentService,  
  jobTitleService,
} from '../../services/dropdownServices';
import { getAllAccounts } from "../../services/accountService";

export default function EmployeeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
   const { user } = useContext(AuthContext);
  
  const idRef = useRef(id);

  const navigateRef = useRef(navigate);

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    idRef.current = id;
    navigateRef.current = navigate;
  }, [id, navigate]);

  const refreshEmployee = useCallback(async () => {
    if (!idRef.current) return;
    try {
      setLoading(true);
      const employeeId = parseInt(idRef.current, 10);
       if (isNaN(employeeId)) {
        throw new Error('Invalid employee ID');
      }
      
      const data = await getEmployeeById(employeeId);
      setEmployee(data?.data || data);
    } catch (err) {
      console.error(err);
      setError("Failed to load employee details");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) {
      setError("No employee ID provided");
      setLoading(false);
      return;
    }
    refreshEmployee();
  }, [id, refreshEmployee]);

  const handleBack = useCallback(() => {
    navigateRef.current("/employees");
  }, []);

  

  // Define main fields
  const mainFields = useMemo(() => [
    // Personal Information
    { key: 'EmployeeName', label: 'Full Name', type: 'text', required: true },
    { key: 'EmployeeEmail', label: 'Email Address', type: 'email', required: true },
    { key: 'EmployeePhone', label: 'Phone Number', type: 'phone' },
    { key: 'UserID', label: 'User ID', type: 'text' },

    // Employment Information
    { 
      key: 'DepartmentID', 
      label: 'Department', 
      type: 'dropdown',
      // service: getDepartmentById,          
    optionsService: departmentService,
      displayField: 'DepartmentName',
      valueField: 'DepartmentID',
      required: true 
    },
    { 
      key: 'JobTitleID', 
      label: 'Job Title', 
      type: 'dropdown',
      // service: getJobTitleById,             
    optionsService: jobTitleService,
      displayField: 'JobTitleName',
      valueField: 'JobTitleID',
      required: true 
    },
    { key: 'HireDate', label: 'Hire Date', type: 'date', required: true },
    { key: 'TerminationDate', label: 'Termination Date', type: 'date' },

    // Compensation
    { key: 'salary', label: 'Salary', type: 'currency' },
    { key: 'Holidays_PA', label: 'Holidays Per Annum', type: 'number' },

    // Location
    { 
      key: 'CountryID', 
      label: 'Country', 
      type: 'dropdown',
      // service: getCountryDetails,
      optionsService: countryService,
      displayField: 'CountryName',
      valueField: 'CountryID'
    },
    { 
      key: 'StateProvinceID', 
      label: 'State/Province', 
      type: 'dropdown',
      // service: getStateProvinceDetails,
      optionsService:  stateProvinceService,
      displayField: 'StateProvince_Name',
      valueField: 'StateProvinceID'
    },
    { 
      key: 'CityID', 
      label: 'City', 
      type: 'dropdown',
      // service: getCityDetails,
      optionsService:cityService, 
      displayField: 'CityName',
      valueField: 'CityID'
    },

    // Status
    { key: 'Active', label: 'Active Status', type: 'boolean' },

    // System Information
    { key: 'CreatedAt', label: 'Created At', type: 'datetime' },
    { key: 'UpdatedAt', label: 'Updated At', type: 'datetime' },
  ], []);

  

  // Real API data services with client-side filtering
  const createFilteredDataService = useCallback((serviceFunction, filterField) => {
    return async () => {
      try {
        const response = await serviceFunction();
        const allData = response?.data || response;
        const employeeId = parseInt(idRef.current, 10);
        
        // Filter data by EmployeeID
        const filteredData = allData.filter(item => 
          item[filterField] === employeeId
        );
        
        return { data: filteredData };
      } catch (error) {
        console.error('Error fetching and filtering data:', error);
        throw error;
      }
    };
  }, []);

  const createAttachmentDataService = useCallback(() => {
    return async () => {
      try {
        const response = await getAllAttachments();
        const allData = response?.data || response;
        const employeeId = parseInt(idRef.current, 10);
        
        // Filter attachments where EntityID = employeeId AND EntityTypeID = Employee type
        const EMPLOYEE_ENTITY_TYPE_ID = 4; // Adjust based on your EntityType IDs
        
        const filteredData = allData.filter(item => 
          item.EntityID === employeeId && item.EntityTypeID === EMPLOYEE_ENTITY_TYPE_ID
        );
        
        return { data: filteredData };
      } catch (error) {
        console.error('Error fetching and filtering attachments:', error);
        throw error;
      }
    };
  }, []);

  // Define related tabs with real API calls
  const relatedTabs = useMemo(() => {
    const tabs = [
      {
              key: 'accounts',
              label: 'Accounts',
              entityType: 'account',
              tableConfig: {
                idField: 'AccountID',
                columns: [
                  { 
                    field: 'AccountName', 
                    headerName: 'Name', 
                    type: 'clickable', 
                    defaultVisible: true,
                  },
                  { field: 'AccountType', headerName: 'Account Type', type: 'text', defaultVisible: true },
                  { field: 'Industry', headerName: 'Industry', type: 'text', defaultVisible: true },
                  { field: 'Phone', headerName: 'Phone', type: 'phone', defaultVisible: true },
                  { field: 'Email', headerName: 'Email', type: 'email', defaultVisible: true },
                  { field: 'Website', headerName: 'Website', type: 'link', defaultVisible: false },
                  { field: 'BillingAddress', headerName: 'Billing Address', type: 'truncated', maxWidth: 200, defaultVisible: false },
                  { field: 'AnnualRevenue', headerName: 'Annual Revenue', type: 'currency', defaultVisible: false },
                  { field: 'NumberOfEmployees', headerName: '# Employees', type: 'number', defaultVisible: false },
                  { field: 'CreatedAt', headerName: 'Created', type: 'dateTime', defaultVisible: true },
                  { field: 'UpdatedAt', headerName: 'Updated', type: 'dateTime', defaultVisible: false },
                  {
                    field: 'Active',
                    headerName: 'Active',
                    type: 'chip',
                    chipLabels: { true: 'Active', false: 'Inactive' },
                    chipColors: { true: '#079141ff', false: '#999999' },
                    defaultVisible: true,
                  }
                ]
              },
              dataService: createFilteredDataService(getAllAccounts, 'AccountID')
            },
      {
        key: 'activities',
        label: 'Activities',
        entityType: 'activity',
        tableConfig: {
          idField: 'ActivityID',
          columns: [
            { field: 'ActivityType', headerName: 'Activity Type', type: 'text', defaultVisible: true },
            { field: 'Subject', headerName: 'Subject', type: 'text', defaultVisible: true },
            { field: 'PriorityLevelName', headerName: 'Priority', type: 'text', defaultVisible: true },
            { field: 'DueToStart', headerName: 'Due Start', type: 'date', defaultVisible: true },
            { field: 'DueToEnd', headerName: 'Due End', type: 'date', defaultVisible: true },
            { field: 'Completed', headerName: 'Completed', type: 'boolean', defaultVisible: true },
            { field: 'Active', headerName: 'Active', type: 'boolean', defaultVisible: true },
          ]
        },
        dataService: async () => {
          try {
            const employeeData = await getEmployeeById(parseInt(idRef.current, 10));
            const currentEmployee = employeeData?.data || employeeData;
            
            if (!currentEmployee?.EmployeeName) {
              console.error('No employee name found');
              return { data: [] };
            }
            
            console.log('Filtering activities for employee:', currentEmployee.EmployeeName);
            
            const response = await getAllActivities();
            const allData = response?.data || response;
            
            // Filter by employee name - adjust field name based on your API
            const filteredData = allData.filter(item => 
              item.AssignedToName === currentEmployee.EmployeeName ||
              item.EmployeeName === currentEmployee.EmployeeName
            );
            
            console.log('Found activities:', filteredData.length);
            
            return { data: filteredData };
          } catch (error) {
            console.error('Error fetching activities:', error);
            return { data: [] };
          }
        }
      },
      {
        key: 'notes',
        label: 'Notes',
        entityType: 'note',
        tableConfig: {
          idField: 'NoteID',
          columns: [
            { field: 'Content', headerName: 'Content', type: 'truncated', maxWidth: 400, defaultVisible: true },
            { field: 'EntityID', headerName: 'Entity ID', type: 'text', defaultVisible: true },
            { field: 'EntityTypeID', headerName: 'Entity Type', type: 'text', defaultVisible: true },
            { field: 'CreatedAt', headerName: 'Created', type: 'dateTime', defaultVisible: true }
          ]
        },
        dataService: createFilteredDataService(getAllNotes, 'EntityID')
      },
      {
        key: 'attachments',
        label: 'Attachments',
        entityType: 'attachment',
        tableConfig: {
          idField: 'AttachmentID',
          columns: [
            { field: 'FileName', headerName: 'File Name', type: 'text', defaultVisible: true },
            { field: 'FileType', headerName: 'Type', type: 'text', defaultVisible: true },
            { field: 'FileSize', headerName: 'Size', type: 'text', defaultVisible: true },
            { field: 'UploadedByFirstName', headerName: 'Uploaded By', type: 'text', defaultVisible: true },
            { field: 'UploadedAt', headerName: 'Uploaded', type: 'dateTime', defaultVisible: true },
          ]
        },
        dataService: createAttachmentDataService(),
      },
    ];
    return tabs;
  }, [createFilteredDataService, createAttachmentDataService]);

  // Action handlers
  const relatedDataActions = useMemo(() => {
    const actions = {
      accounts:{
        view: (account) =>  navigateRef.current(`/accounts/${account.AccountID}`),
        edit: (account) => navigateRef.current(`/accounts/${account.AccountID}/edit`),
        delete: async (account) => {
          console.log('Delete account:', account);
        },
        addNote: (account) => {
          console.log('Add note to account:', account);
        },
        addAttachment: (account) => {
          console.log('Add attachment to account:', account);
        }
      },
      activity: {
        view: (activity) => navigateRef.current(`/activities/${activity.ActivityID}`),
        edit: (activity) => navigateRef.current(`/activities/${activity.ActivityID}/edit`),
        delete: async (activity) => {
          console.log('Delete activity:', activity);
        },
        addNote: (activity) => {
          console.log('Add note to activity:', activity);
        },
        addAttachment: (activity) => {
          console.log('Add attachment to activity:', activity);
        }
      },
      note: {
        view: (note) => {
          console.log('View note:', note);
        },
        edit: (note) => {
          console.log('Edit note:', note);
        },
        delete: async (note) => {
          console.log('Delete note:', note);
        }
      },
      attachment: {
        view: (attachment) => {
          console.log('View attachment:', attachment);
        },
        delete: async (attachment) => {
          console.log('Delete attachment:', attachment);
        }
      }
    };
    return actions;
  }, []);

  // Header chips 
  const headerChips = useMemo(() => {
    if (!employee) return [];
    
    const chips = [];
    
    // Active/Inactive status
    chips.push({
      label: employee.Active ? 'Active' : 'Inactive',
      color: employee.Active ? '#079141ff' : '#999999',
      textColor: '#ffffff'
    });
    
    // Department
    if (employee.DepartmentName) {
      chips.push({
        label: employee.DepartmentName,
        color: '#2196f3',
        textColor: '#ffffff'
      });
    }
    
    // Job Title
    if (employee.JobTitleName) {
      chips.push({
        label: employee.JobTitleName,
        color: '#673ab7',
        textColor: '#ffffff'
      });
    }
    
    return chips;
  }, [employee]);

  // Event handlers
   const handleSave = useCallback(async (formData) => {
    try {
      if (!user?.UserID) {
        setError('You must be logged in to update an employee');
        return;
      }

      console.log('Saving employee data:', formData);
      
      // Clean the formData - remove display fields and only send what the backend needs
      const dataToSend = {
        EmployeeName: formData.EmployeeName,
        EmployeeEmail: formData.EmployeeEmail,
        EmployeePhone: formData.EmployeePhone || null,
        DepartmentID: formData.DepartmentID,
        JobTitleID: formData.JobTitleID,
        HireDate: formData.HireDate,
        TerminationDate: formData.TerminationDate || null,
        salary: formData.salary || null,
        Holidays_PA: formData.Holidays_PA || null,
        CountryID: formData.CountryID || null,
        StateProvinceID: formData.StateProvinceID || null,
        CityID: formData.CityID || null,
        Active: formData.Active !== undefined ? formData.Active : true,
        UserID: formData.UserID || null,
        // TeamID: formData.TeamID || null,
      };
      
      console.log('Cleaned data to send:', dataToSend);
      
    const employeeId = parseInt(idRef.current, 10);
    const changedBy = user.UserID;
    const actionTypeId = 2;
      
      await updateEmployee(employeeId, dataToSend, changedBy, actionTypeId);
    setSuccessMessage('Employee updated successfully');
    await refreshEmployee();
  } catch (err) {
    console.error('Error updating employee:', err);
    console.error('Error response:', err.response?.data);
    setError(err.response?.data?.error || err.message || 'Failed to update employee');
    throw err;
  }
  }, [refreshEmployee, user]); 

  const handleDelete = useCallback(async (formData) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee(parseInt(idRef.current, 10));
        navigateRef.current('/employees');
      } catch (err) {
        console.error('Error deleting employee:', err);
        setError('Failed to delete employee');
        throw err;
      }
    }
  }, []);

  const handleRefreshRelatedData = useCallback((tabKey) => {
    console.log('Refresh tab data:', tabKey);
  }, []);

  const handleAddNote = useCallback((item) => {
    console.log('Add note to employee:', item);
  }, []);

  const handleAddAttachment = useCallback((item) => {
    console.log('Add attachment to employee:', item);
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        width: "100%", 
        p: 2, 
        backgroundColor: theme.palette.background.default, 
        minHeight: "100vh",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2, color: theme.palette.text.secondary }}>
          Loading employee details...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        width: "100%", 
        p: 2, 
        backgroundColor: theme.palette.background.default, 
        minHeight: "100vh" 
      }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box sx={{ 
        width: "100%", 
        p: 2, 
        backgroundColor: theme.palette.background.default, 
        minHeight: "100vh" 
      }}>
        <Alert severity="warning">Employee not found.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: "100%", 
      p: 2, 
      backgroundColor: theme.palette.background.default, 
      minHeight: "100vh" 
    }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}
      
      <UniversalDetailView
        title={employee.EmployeeName || 'Employee Details'}
        subtitle={employee.EmployeeEmail || `Employee ID: ${employee.EmployeeID}`}
        item={employee}
        mainFields={mainFields}
        relatedTabs={relatedTabs}
        onBack={handleBack}
        onSave={handleSave}
        onDelete={handleDelete}
        onAddNote={handleAddNote}
        onAddAttachment={handleAddAttachment}
        loading={loading}
        error={error}
        headerChips={headerChips}
        entityType="employee"
        relatedDataActions={relatedDataActions}
        onRefreshRelatedData={handleRefreshRelatedData}
      />
    </Box>
  );
}

