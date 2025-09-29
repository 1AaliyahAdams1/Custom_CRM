import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Alert, Typography } from "@mui/material";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";
import { fetchAccountById } from "../../services/accountService";
import { getAllContacts } from "../../services/contactService";
import { getAllDeals } from "../../services/dealService";
import { getAllActivities } from "../../services/activityService";

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
  }, []);

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

  // Real API data services with client-side filtering
  const createFilteredDataService = useCallback((serviceFunction, filterField) => {
    return async () => {
      try {
        const response = await serviceFunction();
        const allData = response?.data || response;
        const accountId = parseInt(idRef.current, 10);
        
        // Filter data by AccountID
        const filteredData = allData.filter(item => 
          item[filterField] === accountId
        );
        
        return { data: filteredData };
      } catch (error) {
        console.error('Error fetching and filtering data:', error);
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
        dataService: createFilteredDataService(getAllContacts, 'AccountID')
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
        dataService: createFilteredDataService(getAllDeals, 'AccountID'),
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
        dataService: createFilteredDataService(getAllActivities, 'AccountID')
      }
    ];
    return tabs;
  }, [createFilteredDataService, processDealData]);

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