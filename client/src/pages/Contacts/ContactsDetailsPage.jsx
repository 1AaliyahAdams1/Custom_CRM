import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Alert, Typography } from "@mui/material";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";
import { getContactDetails, deactivateContact } from "../../services/contactService";
import { getAllAccounts } from "../../services/accountService";
import { getAllDeals } from "../../services/dealService";
import { getAllActivities } from "../../services/activityService";
import { getAllNotes } from "../../services/noteService";
import { getAllAttachments } from "../../services/attachmentService";

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

  // Real API data services with client-side filtering
  const createFilteredDataService = useCallback((serviceFunction, filterField, useAccountId = false) => {
    return async () => {
      try {
        const response = await serviceFunction();
        const allData = response?.data || response;
        
        // For account-based filtering use the contact's AccountID
        if (useAccountId) {
          const accountId = contact?.AccountID;
          if (!accountId) return { data: [] };
          
          const filteredData = allData.filter(item => 
            item[filterField] === accountId
          );
          return { data: filteredData };
        }
        
        // For contact-based filtering
        const contactId = parseInt(idRef.current, 10);
        const filteredData = allData.filter(item => 
          item[filterField] === contactId
        );
        
        return { data: filteredData };
      } catch (error) {
        console.error('Error fetching and filtering data:', error);
        throw error;
      }
    };
  }, [contact?.AccountID]);

  const createAttachmentDataService = useCallback(() => {
    return async () => {
      try {
        const response = await getAllAttachments();
        const allData = response?.data || response;
        const contactId = parseInt(idRef.current, 10);
        
        // Filter attachments where EntityID = contactId AND EntityTypeID = Contact type
        // Assuming EntityTypeID for "Contact" is 2 (adjust based on your system)
        const CONTACT_ENTITY_TYPE_ID = 2; 
        
        const filteredData = allData.filter(item => 
          item.EntityID === contactId && item.EntityTypeID === CONTACT_ENTITY_TYPE_ID
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
        dataService: createFilteredDataService(getAllDeals, 'AccountID', true),
        processData: processDealData
      },
      {
        key: 'activities',
        label: 'Activities',
        entityType: 'activity',
        tableConfig: {
          idField: 'ActivityID',
          columns: [
            { field: 'TypeName', headerName: 'Activity Type', type: 'text', defaultVisible: true },
            { field: 'ActivityDescription', headerName: 'Description', type: 'truncated', maxWidth: 300, defaultVisible: true },
            { field: 'StartDate', headerName: 'Start Date', type: 'date', defaultVisible: true },
            { field: 'EndDate', headerName: 'End Date', type: 'date', defaultVisible: true },
            { field: 'Status', headerName: 'Status', type: 'text', defaultVisible: true },
            { field: 'Priority', headerName: 'Priority', type: 'text', defaultVisible: true },
            { field: 'CreatedAt', headerName: 'Created', type: 'dateTime', defaultVisible: true },
          ]
        },
        dataService: createFilteredDataService(getAllActivities, 'ContactID')
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
  }, [createFilteredDataService, createAttachmentDataService, processDealData]);

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

  // Event handlers
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