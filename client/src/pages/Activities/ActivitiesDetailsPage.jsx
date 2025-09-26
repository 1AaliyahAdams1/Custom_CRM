import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Alert, Typography } from "@mui/material";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";
import { fetchActivityById, deactivateActivity, deleteActivity } from "../../services/activityService";

// mock data will replace actual API calls for related entities
const MOCK_DATA = {
  accounts: [
    {
      AccountID: 1,
      AccountName: 'TechCorp Solutions',
      CityName: 'San Francisco',
      StateProvince_Name: 'California',
      CountryName: 'United States',
      street_address: '123 Tech Street, Suite 500',
      postal_code: '94102',
      PrimaryPhone: '+1-555-0201',
      IndustryName: 'Technology',
      fax: '+1-555-0202',
      email: 'contact@techcorp.com',
      Website: 'https://techcorp.com',
      number_of_employees: 250,
      number_of_venues: 5,
      number_of_releases: 12,
      number_of_events_anually: 24,
      annual_revenue: 5000000,
      ParentAccountName: 'TechCorp Holdings',
      CreatedAt: '2024-01-10T08:00:00Z',
      UpdatedAt: '2024-03-01T10:30:00Z',
      ownerStatus: 'owned',
      Active: true
    },
    {
      AccountID: 2,
      AccountName: 'Global Enterprises Inc',
      CityName: 'New York',
      StateProvince_Name: 'New York',
      CountryName: 'United States',
      street_address: '456 Business Ave, Floor 20',
      postal_code: '10001',
      PrimaryPhone: '+1-555-0301',
      IndustryName: 'Financial Services',
      fax: '+1-555-0302',
      email: 'info@globalent.com',
      Website: 'https://globalenterprises.com',
      number_of_employees: 1000,
      number_of_venues: 15,
      number_of_releases: 8,
      number_of_events_anually: 50,
      annual_revenue: 15000000,
      ParentAccountName: null,
      CreatedAt: '2024-02-01T09:15:00Z',
      UpdatedAt: '2024-03-05T14:20:00Z',
      ownerStatus: 'unowned',
      Active: true
    }
  ],
  contacts: [
    {
      ContactID: 1,
      PersonFullName: 'John Smith',
      WorkEmail: 'john.smith@techcorp.com',
      WorkPhone: '+1-555-0101',
      JobTitleName: 'Sales Manager',
      Still_employed: true,
      CreatedAt: '2024-01-15T10:30:00Z',
      Active: true
    },
    {
      ContactID: 2,
      PersonFullName: 'Sarah Johnson',
      WorkEmail: 'sarah.johnson@globalent.com',
      WorkPhone: '+1-555-0102',
      JobTitleName: 'Marketing Director',
      Still_employed: true,
      CreatedAt: '2024-02-01T14:20:00Z',
      Active: true
    },
    {
      ContactID: 3,
      PersonFullName: 'Mike Wilson',
      WorkEmail: 'mike.wilson@techcorp.com',
      WorkPhone: '+1-555-0103',
      JobTitleName: 'IT Manager',
      Still_employed: true,
      CreatedAt: '2023-11-20T09:15:00Z',
      Active: true
    }
  ],
  deals: [
    {
      DealID: 1,
      DealName: 'Q1 Software License Renewal',
      StageName: 'Negotiation',
      Value: 50000,
      Symbol: '$',
      Prefix: true,
      LocalName: 'USD',
      CloseDate: '2024-03-31T00:00:00Z',
      Progression: 75,
      CreatedAt: '2024-01-10T08:00:00Z',
      Active: true
    },
    {
      DealID: 2,
      DealName: 'Enterprise Support Package',
      StageName: 'Proposal',
      Value: 25000,
      Symbol: '$',
      Prefix: true,
      LocalName: 'USD',
      CloseDate: '2024-04-15T00:00:00Z',
      Progression: 60,
      CreatedAt: '2024-02-05T11:30:00Z',
      Active: true
    }
  ],
  notes: [
    {
      NoteID: 1,
      Title: 'Activity Follow-up',
      Content: 'Follow up completed successfully. Customer confirmed their interest and requested additional information.',
      CreatedBy: 'Sales Rep',
      CreatedAt: '2024-03-08T16:30:00Z',
      UpdatedAt: '2024-03-08T16:30:00Z'
    },
    {
      NoteID: 2,
      Title: 'Meeting Summary',
      Content: 'Productive meeting with key stakeholders. Identified next steps and timeline for implementation.',
      CreatedBy: 'Account Manager',
      CreatedAt: '2024-02-25T11:45:00Z',
      UpdatedAt: '2024-02-25T11:45:00Z'
    }
  ],
  attachments: [
    {
      AttachmentID: 1,
      FileName: 'Meeting_Agenda.pdf',
      FileType: 'PDF',
      FileSize: '1.1 MB',
      UploadedBy: 'Sales Rep',
      UploadedAt: '2024-03-05T14:20:00Z'
    },
    {
      AttachmentID: 2,
      FileName: 'Call_Summary.docx',
      FileType: 'DOCX',
      FileSize: '756 KB',
      UploadedBy: 'Account Manager',
      UploadedAt: '2024-02-28T09:10:00Z'
    },
    {
      AttachmentID: 3,
      FileName: 'Follow_up_Tasks.xlsx',
      FileType: 'XLSX',
      FileSize: '892 KB',
      UploadedBy: 'Project Manager',
      UploadedAt: '2024-02-20T15:35:00Z'
    }
  ]
};

export default function ActivitiesDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
 
  const idRef = useRef(id);
  const navigateRef = useRef(navigate);

  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

 
  useEffect(() => {
    idRef.current = id;
    navigateRef.current = navigate;
  }, [id, navigate]);

  const refreshActivity = useCallback(async () => {
    if (!idRef.current) return;
    try {
      setLoading(true);
      const data = await fetchActivityById(parseInt(idRef.current, 10));
      
      // Handle data migration from old boolean Completed to new Status field
      let activityData = data?.data || data;
      if (activityData && !activityData.Status && typeof activityData.Completed === 'boolean') {
        // Migrate old boolean completed field to new status
        activityData.Status = activityData.Completed ? 'complete' : 'incomplete';
      }
      
      setActivity(activityData);
    } catch (err) {
      console.error(err);
      setError("Failed to load activity details");
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    if (!id) {
      setError("No activity ID provided");
      setLoading(false);
      return;
    }
    refreshActivity();
  }, [id, refreshActivity]);

 
  const handleBack = useCallback(() => {
    navigateRef.current("/activities");
  }, []);

  // Define main fields 
  const mainFields = useMemo(() => [
    { key: 'Subject', label: 'Subject', type: 'text', required: true },
    { key: 'ActivityType', label: 'Activity Type', type: 'text', required: true },
    { key: 'Status', label: 'Status', type: 'text' },
    { key: 'Priority', label: 'Priority', type: 'text' },
    { key: 'Description', label: 'Description', type: 'textarea' },
    { key: 'DueToStart', label: 'Due To Start', type: 'datetime' },
    { key: 'DueToEnd', label: 'Due To End', type: 'datetime' },
    { key: 'CompletedAt', label: 'Completed At', type: 'datetime' },
    { key: 'AccountID', label: 'Account ID', type: 'number' },
    { key: 'ContactID', label: 'Contact ID', type: 'number' },
    { key: 'DealID', label: 'Deal ID', type: 'number' },
    { key: 'AssignedTo', label: 'Assigned To', type: 'text' },
    { key: 'Location', label: 'Location', type: 'text' },
    { key: 'Completed', label: 'Completed', type: 'boolean' },
    { key: 'CreatedAt', label: 'Created At', type: 'datetime' },
    { key: 'UpdatedAt', label: 'Updated At', type: 'datetime' },
  ], []);

 
  const dataServiceRefs = useRef({});
  
  const createStableDataService = useCallback((dataKey, delay = 500) => {
    const cacheKey = `${dataKey}_${delay}`;
    if (!dataServiceRefs.current[cacheKey]) {
      dataServiceRefs.current[cacheKey] = async () => {
        await new Promise(resolve => setTimeout(resolve, delay));
        return { data: MOCK_DATA[dataKey] };
      };
    }
    return dataServiceRefs.current[cacheKey];
  }, []);

 
  const processDealData = useCallback((data) => {
    return data.map(deal => ({
      ...deal,
      SymbolValue: deal.Prefix
        ? `${deal.Symbol}${deal.Value}`
        : `${deal.Value}${deal.Symbol}`
    }));
  }, []);

  // Define related tabs
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
            { field: 'CityName', headerName: 'City', defaultVisible: true },
            { field: 'StateProvince_Name', headerName: 'State Province', defaultVisible: false },
            { field: 'CountryName', headerName: 'Country', defaultVisible: true },
            { field: 'street_address', headerName: 'Street', type: 'truncated', maxWidth: 200, defaultVisible: false },
            { field: 'postal_code', headerName: 'Postal Code', defaultVisible: false },
            { field: 'PrimaryPhone', headerName: 'Phone', defaultVisible: true },
            { field: 'IndustryName', headerName: 'Industry', defaultVisible: false },
            { field: 'fax', headerName: 'Fax', defaultVisible: false },
            { field: 'email', headerName: 'Email', defaultVisible: false },
            { field: 'Website', headerName: 'Website', type: 'link', defaultVisible: false },
            { field: 'number_of_employees', headerName: '# Employees', defaultVisible: false },
            { field: 'number_of_venues', headerName: '# Venues', defaultVisible: false },
            { field: 'number_of_releases', headerName: '# Releases', defaultVisible: false },
            { field: 'number_of_events_anually', headerName: '# Events Annually', defaultVisible: false },
            { field: 'annual_revenue', headerName: 'Annual Revenue', defaultVisible: false },
            { field: 'ParentAccountName', headerName: 'Parent Account', defaultVisible: false },
            { field: 'CreatedAt', headerName: 'Created', type: 'dateTime', defaultVisible: true },
            { field: 'UpdatedAt', headerName: 'Updated', type: 'dateTime', defaultVisible: false },
            {
              field: 'ownerStatus',
              headerName: 'Ownership',
              type: 'chip',
              chipLabels: { owned: 'Owned', unowned: 'Unowned', 'n/a': 'N/A' },
              chipColors: { owned: '#079141ff', unowned: '#999999', 'n/a': '#999999' },
              defaultVisible: true,
            },
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
        dataService: createStableDataService('accounts', 500)
      },
      {
        key: 'contacts',
        label: 'Contacts',
        entityType: 'contact',
        tableConfig: {
          idField: 'ContactID',
          columns: [
            { field: 'PersonFullName', headerName: 'Name', type: 'clickable', defaultVisible: true },
            { field: 'WorkEmail', headerName: 'Email', type: 'email', defaultVisible: true },
            { field: 'WorkPhone', headerName: 'Phone', type: 'phone', defaultVisible: true },
            { field: 'JobTitleName', headerName: 'Job Title', type: 'text', defaultVisible: true },
            { field: 'Still_employed', headerName: 'Still Employed', type: 'boolean', defaultVisible: true },
            { field: 'CreatedAt', headerName: 'Created', type: 'dateTime', defaultVisible: true },
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
        dataService: createStableDataService('contacts', 600)
      },
      {
        key: 'deals',
        label: 'Deals',
        entityType: 'deal',
        tableConfig: {
          idField: 'DealID',
          columns: [
            { field: 'DealName', headerName: 'Deal Name', type: 'clickable', defaultVisible: true },
            { field: 'StageName', headerName: 'Stage', type: 'text', defaultVisible: true },
            { field: 'SymbolValue', headerName: 'Amount', type: 'text', defaultVisible: true },
            { field: 'LocalName', headerName: 'Currency', type: 'text', defaultVisible: true },
            { field: 'CloseDate', headerName: 'Close Date', type: 'date', defaultVisible: true },
            { field: 'Progression', headerName: 'Probability (%)', type: 'percentage', defaultVisible: true },
            { field: 'CreatedAt', headerName: 'Created', type: 'dateTime', defaultVisible: true },
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
        dataService: createStableDataService('deals', 700),
        processData: processDealData
      },
      {
        key: 'notes',
        label: 'Notes',
        entityType: 'note',
        tableConfig: {
          idField: 'NoteID',
          columns: [
            { field: 'Title', headerName: 'Title', type: 'text', defaultVisible: true },
            { field: 'Content', headerName: 'Content', type: 'truncated', maxWidth: 400, defaultVisible: true },
            { field: 'CreatedBy', headerName: 'Created By', type: 'text', defaultVisible: true },
            { field: 'CreatedAt', headerName: 'Created', type: 'dateTime', defaultVisible: true },
            { field: 'UpdatedAt', headerName: 'Updated', type: 'dateTime', defaultVisible: false },
          ]
        },
        dataService: createStableDataService('notes', 400)
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
            { field: 'UploadedBy', headerName: 'Uploaded By', type: 'text', defaultVisible: true },
            { field: 'UploadedAt', headerName: 'Uploaded', type: 'dateTime', defaultVisible: true },
          ]
        },
        dataService: createStableDataService('attachments', 300)
      }
    ];
    return tabs;
  }, [createStableDataService, processDealData]);

  //  action handlers
  const relatedDataActions = useMemo(() => {
    const actions = {
      account: {
        view: (account) => navigateRef.current(`/accounts/${account.AccountID}`),
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
      contact: {
        view: (contact) => navigateRef.current(`/contacts/${contact.ContactID}`),
        edit: (contact) => navigateRef.current(`/contacts/${contact.ContactID}/edit`),
        delete: async (contact) => {
          console.log('Delete contact:', contact);
        },
        addNote: (contact) => {
          console.log('Add note to contact:', contact);
        },
        addAttachment: (contact) => {
          console.log('Add attachment to contact:', contact);
        }
      },
      deal: {
        view: (deal) => navigateRef.current(`/deals/${deal.DealID}`),
        edit: (deal) => navigateRef.current(`/deals/${deal.DealID}/edit`),
        delete: async (deal) => {
          console.log('Delete deal:', deal);
        },
        addNote: (deal) => {
          console.log('Add note to deal:', deal);
        },
        addAttachment: (deal) => {
          console.log('Add attachment to deal:', deal);
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
    if (!activity) return [];
    
    const chips = [];
    
    // Status chip (prioritize new Status field over old Completed boolean)
    const status = activity.Status || (activity.Completed ? 'complete' : 'incomplete');
    const statusColors = {
      'complete': '#4caf50',
      'incomplete': '#ff9800', 
      'in-progress': '#2196f3',
      'cancelled': '#f44336',
      'on-hold': '#9e9e9e'
    };
    chips.push({
      label: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
      color: statusColors[status] || '#9e9e9e',
      textColor: '#ffffff'
    });
    
    // Activity type chip
    if (activity.ActivityType) {
      const typeColors = {
        'Phone Call': '#2196f3',
        'Email': '#ff9800',
        'Meeting': '#9c27b0',
        'Task': '#4caf50',
        'Follow-up': '#795548',
        'Demo': '#e91e63'
      };
      chips.push({
        label: activity.ActivityType,
        color: typeColors[activity.ActivityType] || '#607d8b',
        textColor: '#ffffff'
      });
    }
    
    // Priority chip
    if (activity.Priority) {
      const priorityColors = {
        'High': '#f44336',
        'Medium': '#ff9800',
        'Low': '#4caf50'
      };
      chips.push({
        label: `${activity.Priority} Priority`,
        color: priorityColors[activity.Priority] || '#9e9e9e',
        textColor: '#ffffff'
      });
    }
    
    return chips;
  }, [activity?.Status, activity?.Completed, activity?.ActivityType, activity?.Priority]);

  //  event handlers
  const handleSave = useCallback(async (formData) => {
    try {
      console.log('Saving activity:', formData);
      setSuccessMessage('Activity updated successfully');
      await refreshActivity();
    } catch (err) {
      setError('Failed to update activity');
    }
  }, [refreshActivity]);

  const handleDelete = useCallback(async (formData) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) return;
    try {
      // Try deleteActivity first, fallback to deactivateActivity
      const deleteFunc = deleteActivity || deactivateActivity;
      await deleteFunc(formData.ActivityID || idRef.current);
      setSuccessMessage('Activity deleted successfully!');
      setTimeout(() => navigateRef.current('/activities'), 1500);
    } catch (err) {
      setError('Failed to delete activity');
    }
  }, []);

  const handleRefreshRelatedData = useCallback((tabKey) => {
    console.log('Refresh tab data:', tabKey);
  }, []);

  const handleAddNote = useCallback((item) => {
    console.log('Add note to activity:', item);
  }, []);

  const handleAddAttachment = useCallback((item) => {
    console.log('Add attachment to activity:', item);
  }, []);

  if (loading) return <Typography>Loading activity details...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!activity) return <Alert severity="warning">Activity not found.</Alert>;

  return (
    <Box sx={{ width: "100%", p: 2, backgroundColor: "#fafafa", minHeight: "100vh" }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}
      
      <UniversalDetailView
        title={activity.Subject || activity.ActivityType || 'Activity Details'}
        subtitle={`Activity ID: ${activity.ActivityID}`}
        item={activity}
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
        entityType="activity"
        relatedDataActions={relatedDataActions}
        onRefreshRelatedData={handleRefreshRelatedData}
      />
    </Box>
  );
}