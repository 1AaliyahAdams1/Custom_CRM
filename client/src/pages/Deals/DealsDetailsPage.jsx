import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Alert, Typography } from "@mui/material";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";
import { fetchDealById, deleteDeal } from "../../services/dealService";

// Memoized mock data to prevent recreation
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
  activities: [
    {
      ActivityID: 1,
      ActivityType: 'Phone Call',
      Description: 'Follow up on deal progress and address customer concerns',
      DueToStart: '2024-03-15T14:00:00Z',
      DueToEnd: '2024-03-15T15:00:00Z',
      Completed: false,
      CreatedAt: '2024-03-10T09:00:00Z'
    },
    {
      ActivityID: 2,
      ActivityType: 'Email',
      Description: 'Send updated proposal with revised pricing structure',
      DueToStart: '2024-03-12T10:00:00Z',
      DueToEnd: '2024-03-12T11:00:00Z',
      Completed: true,
      CreatedAt: '2024-03-08T13:20:00Z'
    },
    {
      ActivityID: 3,
      ActivityType: 'Meeting',
      Description: 'Contract negotiation meeting with decision makers',
      DueToStart: '2024-03-20T13:00:00Z',
      DueToEnd: '2024-03-20T14:30:00Z',
      Completed: false,
      CreatedAt: '2024-03-01T08:15:00Z'
    }
  ],
  notes: [
    {
      NoteID: 1,
      Title: 'Negotiation Status',
      Content: 'Customer is interested but needs board approval for budget over $40k. Suggested phased approach.',
      CreatedBy: 'Sales Rep',
      CreatedAt: '2024-03-08T16:30:00Z',
      UpdatedAt: '2024-03-08T16:30:00Z'
    },
    {
      NoteID: 2,
      Title: 'Technical Requirements',
      Content: 'Customer requires integration with their existing ERP system. Technical team will provide specifications.',
      CreatedBy: 'Technical Consultant',
      CreatedAt: '2024-02-25T11:45:00Z',
      UpdatedAt: '2024-02-25T11:45:00Z'
    }
  ],
  attachments: [
    {
      AttachmentID: 1,
      FileName: 'Deal_Proposal_v2.pdf',
      FileType: 'PDF',
      FileSize: '3.2 MB',
      UploadedBy: 'Sales Manager',
      UploadedAt: '2024-03-05T14:20:00Z'
    },
    {
      AttachmentID: 2,
      FileName: 'Contract_Template.docx',
      FileType: 'DOCX',
      FileSize: '2.1 MB',
      UploadedBy: 'Legal Team',
      UploadedAt: '2024-02-28T09:10:00Z'
    },
    {
      AttachmentID: 3,
      FileName: 'Technical_Specs.xlsx',
      FileType: 'XLSX',
      FileSize: '1.5 MB',
      UploadedBy: 'Solutions Architect',
      UploadedAt: '2024-02-20T15:35:00Z'
    }
  ]
};

export default function DealDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Use refs to prevent unnecessary re-renders
  const idRef = useRef(id);
  const navigateRef = useRef(navigate);

  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Update refs when values change
  useEffect(() => {
    idRef.current = id;
    navigateRef.current = navigate;
  }, [id, navigate]);

  const refreshDeal = useCallback(async () => {
    if (!idRef.current) return;
    try {
      setLoading(true);
      const data = await fetchDealById(parseInt(idRef.current, 10));
      setDeal(data?.data || data);
    } catch (err) {
      console.error(err);
      setError("Failed to load deal details");
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies to prevent recreation

  useEffect(() => {
    if (!id) {
      setError("No deal ID provided");
      setLoading(false);
      return;
    }
    refreshDeal();
  }, [id, refreshDeal]);

  // Stable function references
  const handleBack = useCallback(() => {
    navigateRef.current("/deals");
  }, []);

  // Define main fields with stable reference
  const mainFields = useMemo(() => [
    { key: 'DealName', label: 'Deal Name', type: 'text', required: true },
    { key: 'AccountID', label: 'Account ID', type: 'number' },
    { key: 'StageName', label: 'Stage', type: 'text', required: true },
    { key: 'Value', label: 'Deal Value', type: 'currency' },
    { key: 'Symbol', label: 'Currency Symbol', type: 'text' },
    { key: 'LocalName', label: 'Currency', type: 'text' },
    { key: 'CloseDate', label: 'Close Date', type: 'date' },
    { key: 'Progression', label: 'Probability (%)', type: 'percentage' },
    { key: 'Description', label: 'Description', type: 'textarea' },
    { key: 'LeadSource', label: 'Lead Source', type: 'text' },
    { key: 'Type', label: 'Deal Type', type: 'text' },
    { key: 'NextStep', label: 'Next Step', type: 'textarea' },
    { key: 'CompetitorAnalysis', label: 'Competitor Analysis', type: 'textarea' },
    { key: 'Active', label: 'Active', type: 'boolean' },
    { key: 'CreatedAt', label: 'Created At', type: 'datetime' },
    { key: 'UpdatedAt', label: 'Updated At', type: 'datetime' },
  ], []);

  // Create ultra-stable data service functions
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

  // Define related tabs with maximum stability
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
        dataService: createStableDataService('activities', 700)
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
  }, [createStableDataService]);

  // Super stable action handlers
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

  // Header chips with stable reference
  const headerChips = useMemo(() => {
    if (!deal) return [];
    
    const chips = [];
    chips.push({
      label: deal.Active ? 'Active' : 'Inactive',
      color: deal.Active ? '#079141ff' : '#999999',
      textColor: '#ffffff'
    });
    if (deal.StageName) {
      const stageColors = {
        'Prospecting': '#ff9800',
        'Qualification': '#2196f3',
        'Proposal': '#9c27b0',
        'Negotiation': '#f44336',
        'Closed Won': '#4caf50',
        'Closed Lost': '#757575'
      };
      chips.push({
        label: deal.StageName,
        color: stageColors[deal.StageName] || '#2196f3',
        textColor: '#ffffff'
      });
    }
    if (deal.Value && deal.Symbol) {
      const formattedValue = deal.Prefix 
        ? `${deal.Symbol}${deal.Value.toLocaleString()}` 
        : `${deal.Value.toLocaleString()}${deal.Symbol}`;
      chips.push({
        label: formattedValue,
        color: '#4caf50',
        textColor: '#ffffff'
      });
    }
    return chips;
  }, [deal?.Active, deal?.StageName, deal?.Value, deal?.Symbol, deal?.Prefix]);

  // Stable event handlers
  const handleSave = useCallback(async (formData) => {
    try {
      console.log('Saving deal:', formData);
      setSuccessMessage('Deal updated successfully');
      await refreshDeal();
    } catch (err) {
      setError('Failed to update deal');
    }
  }, [refreshDeal]);

  const handleDelete = useCallback(async (formData) => {
    if (!window.confirm("Are you sure you want to delete this deal?")) return;
    try {
      await deleteDeal(formData.DealID || idRef.current);
      setSuccessMessage('Deal deleted successfully!');
      setTimeout(() => navigateRef.current('/deals'), 1500);
    } catch (err) {
      setError('Failed to delete deal');
    }
  }, []);

  const handleRefreshRelatedData = useCallback((tabKey) => {
    console.log('Refresh tab data:', tabKey);
  }, []);

  const handleAddNote = useCallback((item) => {
    console.log('Add note to deal:', item);
  }, []);

  const handleAddAttachment = useCallback((item) => {
    console.log('Add attachment to deal:', item);
  }, []);

  if (loading) return <Typography>Loading deal details...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!deal) return <Alert severity="warning">Deal not found.</Alert>;

  return (
    <Box sx={{ width: "100%", p: 2, backgroundColor: "#fafafa", minHeight: "100vh" }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}
      
      <UniversalDetailView
        title={deal.DealName || 'Deal Details'}
        subtitle={`Deal ID: ${deal.DealID}`}
        item={deal}
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
        entityType="deal"
        relatedDataActions={relatedDataActions}
        onRefreshRelatedData={handleRefreshRelatedData}
      />
    </Box>
  );
}