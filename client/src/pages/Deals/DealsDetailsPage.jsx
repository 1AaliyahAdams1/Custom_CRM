import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Alert, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";
import { fetchDealById, updateDeal, deleteDeal } from "../../services/dealService";
import { getAllAccounts } from "../../services/accountService";
import { getAllContacts } from "../../services/contactService";
import { getAllActivities } from "../../services/activityService";
import { getAllNotes } from "../../services/noteService";
import { getAllAttachments } from "../../services/attachmentService";
import { getAllCurrencies } from "../../services/currencyService";
import { dealStageService } from "../../services/dropdownServices";

export default function DealDetailsPage() {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const idRef = useRef(id);
  const navigateRef = useRef(navigate);

  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

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
  }, []);

  useEffect(() => {
    if (!id) {
      setError("No deal ID provided");
      setLoading(false);
      return;
    }
    refreshDeal();
  }, [id, refreshDeal]);

  const handleBack = useCallback(() => {
    navigateRef.current("/deals");
  }, []);

  // Currency service wrapper for dropdown - wrapped in useMemo
  const currencyService = useMemo(() => ({
    getAll: async () => {
      try {
        const response = await getAllCurrencies();
        return response.data || response;
      } catch {
        return [];
      }
    },
  }), []);

  // Define main fields - aligned with EditDealPage
  const mainFields = useMemo(() => [
    { 
      key: 'AccountName', 
      label: 'Account', 
      type: 'text', 
      required: true, 
      readOnly: true 
    },
    { 
      key: 'DealName', 
      label: 'Deal Name', 
      type: 'text', 
      required: true, 
      editable: true 
    },
    { 
      key: 'DealStageID', 
      label: 'Deal Stage', 
      type: 'dropdown', 
      required: true, 
      editable: true,
      service: dealStageService,
      displayField: 'StageName',
      valueField: 'DealStageID'
    },
    { 
      key: 'Value', 
      label: 'Value', 
      type: 'number', 
      required: true, 
      editable: true 
    },
    { 
      key: 'CurrencyID', 
      label: 'Currency', 
      type: 'dropdown', 
      required: true, 
      editable: true,
      service: currencyService,
      displayField: 'LocalName',
      valueField: 'CurrencyID'
    },
    { 
      key: 'CloseDate', 
      label: 'Close Date', 
      type: 'date', 
      required: true, 
      editable: true 
    },
    { 
      key: 'Probability', 
      label: 'Probability (%)', 
      type: 'number', 
      required: true, 
      editable: true 
    },
    { 
      key: 'CreatedAt', 
      label: 'Created At', 
      type: 'datetime', 
      readOnly: true 
    },
    { 
      key: 'UpdatedAt', 
      label: 'Updated At', 
      type: 'datetime', 
      readOnly: true 
    },
  ], [currencyService]);

  // Service to get the account that this deal belongs to
  const createAccountDataService = useCallback(() => {
    return async () => {
      try {
        const response = await getAllAccounts();
        const allData = response?.data || response;
        const dealAccountId = deal?.AccountID;
        
        if (!dealAccountId) return { data: [] };
        
        // Filter to get the ONE account that matches the deal's AccountID
        const filteredData = allData.filter(item => 
          item.AccountID === dealAccountId
        );
        
        return { data: filteredData };
      } catch (error) {
        console.error('Error fetching and filtering accounts:', error);
        throw error;
      }
    };
  }, [deal?.AccountID]);

  // Real API data services with client-side filtering
  const createFilteredDataService = useCallback((serviceFunction, filterField) => {
    return async () => {
      try {
        const response = await serviceFunction();
        const allData = response?.data || response;
        const dealId = parseInt(idRef.current, 10);
        
        const filteredData = allData.filter(item => 
          item[filterField] === dealId
        );
        
        return { data: filteredData };
      } catch (error) {
        console.error('Error fetching and filtering data:', error);
        throw error;
      }
    };
  }, []);

  // Service for contacts - filter by the deal's AccountID
  const createContactDataService = useCallback(() => {
    return async () => {
      try {
        const response = await getAllContacts();
        const allData = response?.data || response;
        const dealAccountId = deal?.AccountID;
        
        if (!dealAccountId) return { data: [] };
        
        const filteredData = allData.filter(item => 
          item.AccountID === dealAccountId
        );
        
        return { data: filteredData };
      } catch (error) {
        console.error('Error fetching and filtering contacts:', error);
        throw error;
      }
    };
  }, [deal?.AccountID]);

  const createAttachmentDataService = useCallback(() => {
    return async () => {
      try {
        const response = await getAllAttachments();
        const allData = response?.data || response;
        const dealId = parseInt(idRef.current, 10);
        
        // Filter attachments where EntityID = dealId AND EntityTypeID = Deal type
        // Assuming EntityTypeID for "Deal" is 3 (adjust based on your system)
        const DEAL_ENTITY_TYPE_ID = 3; 
        
        const filteredData = allData.filter(item => 
          item.EntityID === dealId && item.EntityTypeID === DEAL_ENTITY_TYPE_ID
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
        key: 'activities',
        label: 'Activities',
        entityType: 'activity',
        tableConfig: {
          idField: 'ActivityID',
          columns: [
            { field: 'ActivityType', headerName: 'Activity Type', type: 'text', defaultVisible: true },
            { field: 'AccountName', headerName: 'Account', type: 'text', defaultVisible: true },
            { field: 'PriorityLevelName', headerName: 'Priority', type: 'text', defaultVisible: true },
            { field: 'DueToStart', headerName: 'Due Start', type: 'date', defaultVisible: true },
            { field: 'DueToEnd', headerName: 'Due End', type: 'date', defaultVisible: true },
            { field: 'Completed', headerName: 'Completed', type: 'boolean', defaultVisible: true },
          ]
        },
        dataService: async () => {
          try {
            // For deals, filter activities by the deal's AccountID
            if (!deal?.AccountID) return { data: [] };
            
            const response = await getAllActivities();
            const allData = response?.data || response;
            
            // Filter by AccountName since activities don't have AccountID
            const accountResponse = await getAllAccounts();
            const accounts = accountResponse?.data || accountResponse;
            const dealAccount = accounts.find(acc => acc.AccountID === deal.AccountID);
            
            if (!dealAccount) return { data: [] };
            
            const filteredData = allData.filter(item => 
              item.AccountName === dealAccount.AccountName
            );
            
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
        dataService: createAttachmentDataService()
      }
    ];
    return tabs;
  }, [deal, createAccountDataService, createContactDataService, createFilteredDataService, createAttachmentDataService]);

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

  // Event handlers
  const handleSave = useCallback(async (formData) => {
    try {
      console.log('Saving deal:', formData);
      
      // Only send the fields that should be updated to the backend
      // Exclude display fields like Symbol, LocalName, AccountName, StageName, etc.
      const updatePayload = {
        DealName: formData.DealName,
        DealStageID: formData.DealStageID,
        Value: formData.Value,
        CurrencyID: formData.CurrencyID,
        CloseDate: formData.CloseDate,
        Probability: formData.Probability,
        AccountID: formData.AccountID, // Include but don't allow editing
      };
      
      console.log('Update payload:', updatePayload);
      
      // Call the updateDeal API with the deal ID and clean payload
      await updateDeal(deal.DealID, updatePayload);
      setSuccessMessage('Deal updated successfully');
      
      // Refresh the deal data from the backend to show updated values
      await refreshDeal();
    } catch (err) {
      console.error('Error updating deal:', err);
      setError('Failed to update deal. Please try again.');
    }
  }, [deal?.DealID, refreshDeal]);

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