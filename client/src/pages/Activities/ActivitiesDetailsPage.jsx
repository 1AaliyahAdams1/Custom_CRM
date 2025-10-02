import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Alert, Typography } from "@mui/material";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";
import { fetchActivityById, deactivateActivity, deleteActivity } from "../../services/activityService";
import { getAllAccounts } from "../../services/accountService";
import { getAllContacts } from "../../services/contactService";
import { getAllDeals } from "../../services/dealService";
import { getAllNotes } from "../../services/noteService";
import { getAllAttachments } from "../../services/attachmentService";

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

  // Service to get the account that this activity belongs to
  const createAccountDataService = useCallback(() => {
    return async () => {
      try {
        const response = await getAllAccounts();
        const allData = response?.data || response;
        const activityAccountId = activity?.AccountID;
        
        if (!activityAccountId) return { data: [] };
        
        // Filter to get the ONE account that matches the activity's AccountID
        const filteredData = allData.filter(item => 
          item.AccountID === activityAccountId
        );
        
        return { data: filteredData };
      } catch (error) {
        console.error('Error fetching and filtering accounts:', error);
        throw error;
      }
    };
  }, [activity?.AccountID]);

  // Service for contacts - filter by the activity's AccountID
  const createContactDataService = useCallback(() => {
    return async () => {
      try {
        const response = await getAllContacts();
        const allData = response?.data || response;
        const activityAccountId = activity?.AccountID;
        
        if (!activityAccountId) return { data: [] };
        
        const filteredData = allData.filter(item => 
          item.AccountID === activityAccountId
        );
        
        return { data: filteredData };
      } catch (error) {
        console.error('Error fetching and filtering contacts:', error);
        throw error;
      }
    };
  }, [activity?.AccountID]);

  // Service for deals - filter by the activity's AccountID or DealID
  const createDealDataService = useCallback(() => {
    return async () => {
      try {
        const response = await getAllDeals();
        const allData = response?.data || response;
        const activityAccountId = activity?.AccountID;
        const activityDealId = activity?.DealID;
        
        if (!activityAccountId && !activityDealId) return { data: [] };
        
        // Filter deals by AccountID or if there's a specific DealID, include that
        const filteredData = allData.filter(item => {
          if (activityDealId && item.DealID === activityDealId) return true;
          if (activityAccountId && item.AccountID === activityAccountId) return true;
          return false;
        });
        
        return { data: filteredData };
      } catch (error) {
        console.error('Error fetching and filtering deals:', error);
        throw error;
      }
    };
  }, [activity?.AccountID, activity?.DealID]);

  // Real API data services with client-side filtering
  const createFilteredDataService = useCallback((serviceFunction, filterField) => {
    return async () => {
      try {
        const response = await serviceFunction();
        const allData = response?.data || response;
        const activityId = parseInt(idRef.current, 10);
        
        const filteredData = allData.filter(item => 
          item[filterField] === activityId
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
        const activityId = parseInt(idRef.current, 10);
        
        // Filter attachments where EntityID = activityId AND EntityTypeID = Activity type
        // Assuming EntityTypeID for "Activity" is 4 (adjust based on your system)
        const ACTIVITY_ENTITY_TYPE_ID = 4; 
        
        const filteredData = allData.filter(item => 
          item.EntityID === activityId && item.EntityTypeID === ACTIVITY_ENTITY_TYPE_ID
        );
        
        return { data: filteredData };
      } catch (error) {
        console.error('Error fetching and filtering attachments:', error);
        throw error;
      }
    };
  }, []);

  const processDealData = useCallback((data) => {
    return data.map(deal => ({
      ...deal,
      SymbolValue: deal.Prefix
        ? `${deal.Symbol}${deal.Value}`
        : `${deal.Value}${deal.Symbol}`
    }));
  }, []);

  // Define related tabs with real API calls
  const relatedTabs = useMemo(() => {
    if (!activity) return [];
    
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
        dataService: createAccountDataService()
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
        dataService: createContactDataService()
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
        dataService: createDealDataService(),
        processData: processDealData
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
        dataService: createAttachmentDataService()
      }
    ];
    return tabs;
  }, [activity, createAccountDataService, createContactDataService, createDealDataService, createFilteredDataService, createAttachmentDataService, processDealData]);

  // Action handlers
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

  // Event handlers
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