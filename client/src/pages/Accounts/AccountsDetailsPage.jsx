import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Alert, Typography } from "@mui/material";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";
import { fetchAccountById } from "../../services/accountService";

// MOck data will replace with API calls :(
const MOCK_DATA = {
  contacts: [
    {
      ContactID: 1,
      PersonFullName: 'John Smith',
      WorkEmail: 'john.smith@example.com',
      WorkPhone: '+1-555-0101',
      JobTitleName: 'Sales Manager',
      Still_employed: true,
      CreatedAt: '2024-01-15T10:30:00Z',
      Active: true
    },
    {
      ContactID: 2,
      PersonFullName: 'Sarah Johnson',
      WorkEmail: 'sarah.johnson@example.com',
      WorkPhone: '+1-555-0102',
      JobTitleName: 'Marketing Director',
      Still_employed: true,
      CreatedAt: '2024-02-01T14:20:00Z',
      Active: true
    },
    {
      ContactID: 3,
      PersonFullName: 'Mike Wilson',
      WorkEmail: 'mike.wilson@example.com',
      WorkPhone: '+1-555-0103',
      JobTitleName: 'IT Manager',
      Still_employed: false,
      CreatedAt: '2023-11-20T09:15:00Z',
      Active: false
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
    },
    {
      DealID: 3,
      DealName: 'Training Services',
      StageName: 'Closed Won',
      Value: 15000,
      Symbol: '$',
      Prefix: true,
      LocalName: 'USD',
      CloseDate: '2024-02-28T00:00:00Z',
      Progression: 100,
      CreatedAt: '2024-01-20T16:45:00Z',
      Active: true
    }
  ],
  activities: [
    {
      ActivityID: 1,
      ActivityType: 'Phone Call',
      Description: 'Follow up on software renewal discussion and pricing concerns',
      DueToStart: '2024-03-15T14:00:00Z',
      DueToEnd: '2024-03-15T15:00:00Z',
      Completed: false,
      CreatedAt: '2024-03-10T09:00:00Z'
    },
    {
      ActivityID: 2,
      ActivityType: 'Email',
      Description: 'Send proposal for enterprise support package with detailed feature breakdown',
      DueToStart: '2024-03-12T10:00:00Z',
      DueToEnd: '2024-03-12T11:00:00Z',
      Completed: true,
      CreatedAt: '2024-03-08T13:20:00Z'
    },
    {
      ActivityID: 3,
      ActivityType: 'Meeting',
      Description: 'Quarterly business review with stakeholders to discuss usage and future needs',
      DueToStart: '2024-03-20T13:00:00Z',
      DueToEnd: '2024-03-20T14:30:00Z',
      Completed: false,
      CreatedAt: '2024-03-01T08:15:00Z'
    }
  ],
  notes: [
    {
      NoteID: 1,
      Title: 'Contract Renewal Discussion',
      Content: 'Customer expressed interest in upgrading to premium tier. Need to schedule demo of advanced features.',
      CreatedBy: 'Sales Rep',
      CreatedAt: '2024-03-08T16:30:00Z',
      UpdatedAt: '2024-03-08T16:30:00Z'
    },
    {
      NoteID: 2,
      Title: 'Technical Requirements',
      Content: 'IT team requires integration with their existing CRM system. They use Salesforce Enterprise edition.',
      CreatedBy: 'Technical Consultant',
      CreatedAt: '2024-02-25T11:45:00Z',
      UpdatedAt: '2024-02-25T11:45:00Z'
    }
  ],
  attachments: [
    {
      AttachmentID: 1,
      FileName: 'Contract_Proposal_2024.pdf',
      FileType: 'PDF',
      FileSize: '2.4 MB',
      UploadedBy: 'Account Manager',
      UploadedAt: '2024-03-05T14:20:00Z'
    },
    {
      AttachmentID: 2,
      FileName: 'Technical_Specifications.docx',
      FileType: 'DOCX',
      FileSize: '1.8 MB',
      UploadedBy: 'Technical Consultant',
      UploadedAt: '2024-02-28T09:10:00Z'
    },
    {
      AttachmentID: 3,
      FileName: 'Integration_Diagram.png',
      FileType: 'PNG',
      FileSize: '856 KB',
      UploadedBy: 'Solutions Architect',
      UploadedAt: '2024-02-20T15:35:00Z'
    }
  ]
};

export default function AccountDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
 
  const idRef = useRef(id);
  const navigateRef = useRef(navigate);

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

 
  useEffect(() => {
    idRef.current = id;
    navigateRef.current = navigate;
  }, [id, navigate]);

  const refreshAccount = useCallback(async () => {
    if (!idRef.current) return;
    try {
      setLoading(true);
      const data = await fetchAccountById(parseInt(idRef.current, 10));
      setAccount(data?.data || data);
    } catch (err) {
      console.error(err);
      setError("Failed to load account details");
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies to prevent recreation

  useEffect(() => {
    if (!id) {
      setError("No account ID provided");
      setLoading(false);
      return;
    }
    refreshAccount();
  }, [id, refreshAccount]);

  
  const handleBack = useCallback(() => {
    navigateRef.current("/accounts");
  }, []);

  // Define main fields
  const mainFields = useMemo(() => [
    { key: 'AccountName', label: 'Account Name', type: 'text', required: true },
    { key: 'AccountType', label: 'Account Type', type: 'text' },
    { key: 'Industry', label: 'Industry', type: 'text' },
    { key: 'Website', label: 'Website', type: 'link' },
    { key: 'Phone', label: 'Phone', type: 'phone' },
    { key: 'Email', label: 'Email', type: 'email' },
    { key: 'BillingAddress', label: 'Billing Address', type: 'textarea' },
    { key: 'ShippingAddress', label: 'Shipping Address', type: 'textarea' },
    { key: 'AnnualRevenue', label: 'Annual Revenue', type: 'currency' },
    { key: 'NumberOfEmployees', label: 'Number of Employees', type: 'number' },
    { key: 'Description', label: 'Description', type: 'textarea' },
    { key: 'Active', label: 'Active', type: 'boolean' },
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
        key: 'contacts',
        label: 'Contacts',
        entityType: 'contact',
        tableConfig: {
          idField: 'ContactID',
          columns: [
            { field: 'PersonFullName', headerName: 'Name', type: 'text', defaultVisible: true },
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
        dataService: createStableDataService('contacts', 500)
      },
      {
        key: 'deals',
        label: 'Deals',
        entityType: 'deal',
        tableConfig: {
          idField: 'DealID',
          columns: [
            { field: 'DealName', headerName: 'Deal Name', type: 'text', defaultVisible: true },
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
        key: 'activities',
        label: 'Activities',
        entityType: 'activity',
        tableConfig: {
          idField: 'ActivityID',
          columns: [
            { field: 'ActivityType', headerName: 'Activity Type', type: 'text', defaultVisible: true },
            { field: 'Description', headerName: 'Description', type: 'truncated', maxWidth: 300, defaultVisible: true },
            { field: 'DueToStart', headerName: 'Due To Start', type: 'date', defaultVisible: true },
            { field: 'DueToEnd', headerName: 'Due To End', type: 'date', defaultVisible: true },
            { field: 'Completed', headerName: 'Completed', type: 'boolean', defaultVisible: true },
            { field: 'CreatedAt', headerName: 'Created', type: 'dateTime', defaultVisible: true },
          ]
        },
        dataService: createStableDataService('activities', 600)
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

  // action handlers
  const relatedDataActions = useMemo(() => {
    const actions = {
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
    if (!account) return [];
    
    const chips = [];
    chips.push({
      label: account.Active ? 'Active' : 'Inactive',
      color: account.Active ? '#079141ff' : '#999999',
      textColor: '#ffffff'
    });
    if (account.AccountType) {
      chips.push({
        label: account.AccountType,
        color: '#2196f3',
        textColor: '#ffffff'
      });
    }
    return chips;
  }, [account?.Active, account?.AccountType]);

  // event handlers
  const handleSave = useCallback(async (formData) => {
    try {
      console.log('Saving account:', formData);
      setSuccessMessage('Account updated successfully');
      await refreshAccount();
    } catch (err) {
      setError('Failed to update account');
    }
  }, [refreshAccount]);

  const handleDelete = useCallback(async (formData) => {
    try {
      console.log('Deleting account:', formData);
      navigateRef.current('/accounts');
    } catch (err) {
      setError('Failed to delete account');
    }
  }, []);

  const handleRefreshRelatedData = useCallback((tabKey) => {
    console.log('Refresh tab data:', tabKey);
  }, []);

  const handleAddNote = useCallback((item) => {
    console.log('Add note to account:', item);
  }, []);

  const handleAddAttachment = useCallback((item) => {
    console.log('Add attachment to account:', item);
  }, []);

  if (loading) return <Typography>Loading account details...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!account) return <Alert severity="warning">Account not found.</Alert>;

  return (
    <Box sx={{ width: "100%", p: 2, backgroundColor: "#fafafa", minHeight: "100vh" }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}
      
      <UniversalDetailView
        title={account.AccountName || 'Account Details'}
        subtitle={`Account ID: ${account.AccountID}`}
        item={account}
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
        entityType="account"
        relatedDataActions={relatedDataActions}
        onRefreshRelatedData={handleRefreshRelatedData}
      />
    </Box>
  );
}