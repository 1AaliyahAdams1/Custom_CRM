import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Alert, Typography } from "@mui/material";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";
import { getContactDetails, deactivateContact } from "../../services/contactService";

// Mock data will replace
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
      Title: 'Follow-up Discussion',
      Content: 'Contact expressed interest in upgrading to premium tier. Need to schedule demo of advanced features.',
      CreatedBy: 'Sales Rep',
      CreatedAt: '2024-03-08T16:30:00Z',
      UpdatedAt: '2024-03-08T16:30:00Z'
    },
    {
      NoteID: 2,
      Title: 'Technical Requirements',
      Content: 'Contact mentioned they need integration with their existing CRM system. They use Salesforce Enterprise edition.',
      CreatedBy: 'Technical Consultant',
      CreatedAt: '2024-02-25T11:45:00Z',
      UpdatedAt: '2024-02-25T11:45:00Z'
    }
  ],
  attachments: [
    {
      AttachmentID: 1,
      FileName: 'Contact_Resume_2024.pdf',
      FileType: 'PDF',
      FileSize: '1.2 MB',
      UploadedBy: 'HR Manager',
      UploadedAt: '2024-03-05T14:20:00Z'
    },
    {
      AttachmentID: 2,
      FileName: 'Meeting_Notes.docx',
      FileType: 'DOCX',
      FileSize: '856 KB',
      UploadedBy: 'Sales Rep',
      UploadedAt: '2024-02-28T09:10:00Z'
    }
  ]
};

export default function ContactDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  
  const idRef = useRef(id);
  const navigateRef = useRef(navigate);

  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");


  useEffect(() => {
    idRef.current = id;
    navigateRef.current = navigate;
  }, [id, navigate]);

  const refreshContact = useCallback(async () => {
    if (!idRef.current) return;
    try {
      setLoading(true);
      const data = await getContactDetails(idRef.current);
      setContact(data?.data || data);
    } catch (err) {
      console.error(err);
      setError("Failed to load contact details");
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    if (!id) {
      setError("No contact ID provided");
      setLoading(false);
      return;
    }
    refreshContact();
  }, [id, refreshContact]);

  
  const handleBack = useCallback(() => {
    navigateRef.current("/contacts");
  }, []);

  // Define main fields
  const mainFields = useMemo(() => [
    { key: 'PersonFullName', label: 'Full Name', type: 'text', required: true },
    { key: 'WorkEmail', label: 'Work Email', type: 'email', required: true },
    { key: 'WorkPhone', label: 'Work Phone', type: 'phone' },
    { key: 'MobilePhone', label: 'Mobile Phone', type: 'phone' },
    { key: 'JobTitleName', label: 'Job Title', type: 'text' },
    { key: 'Department', label: 'Department', type: 'text' },
    { key: 'ReportsTo', label: 'Reports To', type: 'text' },
    { key: 'HomeAddress', label: 'Home Address', type: 'textarea' },
    { key: 'MailingAddress', label: 'Mailing Address', type: 'textarea' },
    { key: 'LeadSource', label: 'Lead Source', type: 'text' },
    { key: 'Still_employed', label: 'Still Employed', type: 'boolean' },
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
    if (!contact) return [];
    
    const chips = [];
    chips.push({
      label: contact.Active ? 'Active' : 'Inactive',
      color: contact.Active ? '#079141ff' : '#999999',
      textColor: '#ffffff'
    });
    if (contact.Still_employed !== undefined) {
      chips.push({
        label: contact.Still_employed ? 'Employed' : 'Not Employed',
        color: contact.Still_employed ? '#2196f3' : '#ff9800',
        textColor: '#ffffff'
      });
    }
    if (contact.JobTitleName) {
      chips.push({
        label: contact.JobTitleName,
        color: '#9c27b0',
        textColor: '#ffffff'
      });
    }
    return chips;
  }, [contact?.Active, contact?.Still_employed, contact?.JobTitleName]);

  // Stable event handlers
  const handleSave = useCallback(async (formData) => {
    try {
      console.log('Saving contact:', formData);
      setSuccessMessage('Contact updated successfully');
      await refreshContact();
    } catch (err) {
      setError('Failed to update contact');
    }
  }, [refreshContact]);

  const handleDelete = useCallback(async (formData) => {
    if (!window.confirm("Are you sure you want to deactivate this contact?")) return;
    try {
      await deactivateContact(formData.ContactID || idRef.current);
      setSuccessMessage('Contact deactivated successfully!');
      setTimeout(() => navigateRef.current('/contacts'), 1500);
    } catch (err) {
      setError('Failed to deactivate contact');
    }
  }, []);

  const handleRefreshRelatedData = useCallback((tabKey) => {
    console.log('Refresh tab data:', tabKey);
  }, []);

  const handleAddNote = useCallback((item) => {
    console.log('Add note to contact:', item);
  }, []);

  const handleAddAttachment = useCallback((item) => {
    console.log('Add attachment to contact:', item);
  }, []);

  if (loading) return <Typography>Loading contact details...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!contact) return <Alert severity="warning">Contact not found.</Alert>;

  return (
    <Box sx={{ width: "100%", p: 2, backgroundColor: "#fafafa", minHeight: "100vh" }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}
      
      <UniversalDetailView
        title={contact.PersonFullName || 'Contact Details'}
        subtitle={`Contact ID: ${contact.ContactID}`}
        item={contact}
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
        entityType="contact"
        relatedDataActions={relatedDataActions}
        onRefreshRelatedData={handleRefreshRelatedData}
      />
    </Box>
  );
}