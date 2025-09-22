import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Alert } from "@mui/material";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";
import NotesPopup from "../../components/NotesComponent";
import AttachmentsPopup from "../../components/AttachmentsComponent";
import { fetchAccountById, updateAccount, deactivateAccount, getAllAccounts } from "../../services/accountService";
import { noteService } from "../../services/noteService";
import { attachmentService } from "../../services/attachmentService";
import {
  cityService,
  industryService,
  countryService,
  stateProvinceService
} from '../../services/dropdownServices';

const accountService = { getAll: async () => (await getAllAccounts()).data }

// Modular validation function - validates individual fields
const validateField = (fieldName, value) => {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    // Only AccountName is required
    if (fieldName === 'AccountName') {
      return 'Account name is required';
    }
    return null; // No validation for empty optional fields
  }

  switch (fieldName) {
    case 'AccountName':
      if (value.trim().length < 2) {
        return 'Account name must be at least 2 characters';
      } else if (value.trim().length > 255) {
        return 'Account name must be 255 characters or less';
      }
      break;

    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) {
        return 'Invalid email format';
      }
      break;

    case 'PrimaryPhone':
      const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,20}$/;
      if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
        return 'Invalid Phone Number - Phone number requires at least 8 numbers';
      }
      break;

    case 'fax':
      const faxRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,20}$/;
      if (!faxRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
        return 'Invalid Fax - Fax number requires at least 8 numbers';
      }
      break;

    case 'Website':
      const urlRegex = /^https?:\/\/.+\..+/;
      if (!urlRegex.test(value.trim())) {
        return 'Invalid Website - Website requires a prefix ( http:// , https:// ) and a suffix ( .com , .co.za , etc )';
      }
      break;

    case 'number_of_employees':
    case 'number_of_venues':
    case 'number_of_releases':
    case 'number_of_events_anually':
      const num = parseInt(value);
      if (isNaN(num) || num < 0) {
        return `${fieldName.replace(/_/g, ' ')} must be a non-negative number`;
      } else if (num > 1000000) {
        return `${fieldName.replace(/_/g, ' ')} must be less than 1,000,000`;
      }
      break;

    case 'annual_revenue':
      const revenue = parseFloat(value);
      if (isNaN(revenue) || revenue < 0) {
        return 'Annual revenue must be a non-negative number';
      } else if (revenue > 999999999999) {
        return 'Annual revenue must be less than 1 trillion';
      }
      break;
  }

  return null; // No error
};

// Validate entire form data
const validateAccountData = (formData) => {
  const errors = [];
  const fieldsToValidate = ['AccountName', 'email', 'PrimaryPhone', 'fax', 'Website', 
    'number_of_employees', 'number_of_venues', 'number_of_releases', 
    'number_of_events_anually', 'annual_revenue'];

  fieldsToValidate.forEach(field => {
    const error = validateField(field, formData[field]);
    if (error) {
      errors.push(error);
    }
  });

  return errors;
};

// Define the main fields for the account form with validation
const accountMainFields = [
  { 
    key: "AccountName", 
    label: "Account Name", 
    required: true, 
    width: { xs: 12, md: 6 },
    validate: (value) => validateField("AccountName", value)
  },
  {
    key: "ParentAccountName", 
    label: "Parent Account", 
    type: "dropdown",
    service: accountService, 
    displayField: "ParentAccountName", 
    valueField: "AccountID", 
    width: { xs: 12, md: 6 }
  },
  { 
    key: "CountryID", 
    label: "Country", 
    type: "dropdown", 
    service: countryService, 
    displayField: "CountryName", 
    valueField: "CountryID", 
    width: { xs: 12, md: 4 } 
  },
  { 
    key: "StateProvinceID", 
    label: "State/Province", 
    type: "dropdown", 
    service: stateProvinceService, 
    displayField: "StateProvince_Name", 
    valueField: "StateProvinceID", 
    width: { xs: 12, md: 4 } 
  },
  { 
    key: "CityID", 
    label: "City", 
    type: "dropdown", 
    service: cityService, 
    displayField: "CityName", 
    valueField: "CityID", 
    width: { xs: 12, md: 4 } 
  },
  { 
    key: "IndustryID", 
    label: "Industry", 
    type: "dropdown", 
    service: industryService, 
    displayField: "IndustryName", 
    valueField: "IndustryID", 
    width: { xs: 12, md: 4 } 
  },
  { key: "street_address1", label: "Street Address 1", width: { xs: 12, md: 6 } },
  { key: "street_address2", label: "Street Address 2", width: { xs: 12, md: 6 } },
  { key: "street_address3", label: "Street Address 3", width: { xs: 12, md: 6 } },
  { key: "postal_code", label: "Postal Code", width: { xs: 12, md: 6 } },
  { 
    key: "PrimaryPhone", 
    label: "Primary Phone", 
    type: "tel", 
    width: { xs: 12, md: 6 },
    validate: (value) => validateField("PrimaryPhone", value)
  },
  { 
    key: "fax", 
    label: "Fax", 
    type: "tel", 
    width: { xs: 12, md: 6 },
    validate: (value) => validateField("fax", value)
  },
  { 
    key: "email", 
    label: "Email", 
    type: "email", 
    width: { xs: 12, md: 6 },
    validate: (value) => validateField("email", value)
  },
  { 
    key: "Website", 
    label: "Website", 
    type: "url", 
    width: { xs: 12, md: 6 },
    validate: (value) => validateField("Website", value)
  },
  { 
    key: "annual_revenue", 
    label: "Annual Revenue", 
    type: "number", 
    width: { xs: 12, md: 6 },
    validate: (value) => validateField("annual_revenue", value)
  },
  { 
    key: "number_of_employees", 
    label: "Number of Employees", 
    type: "number", 
    width: { xs: 12, md: 6 },
    validate: (value) => validateField("number_of_employees", value)
  },
  { 
    key: "number_of_venues", 
    label: "Number of Venues", 
    type: "number", 
    width: { xs: 12, md: 6 },
    validate: (value) => validateField("number_of_venues", value)
  },
  { 
    key: "number_of_releases", 
    label: "Number of Releases", 
    type: "number", 
    width: { xs: 12, md: 6 },
    validate: (value) => validateField("number_of_releases", value)
  },
  { 
    key: "number_of_events_anually", 
    label: "Number of Events Annually", 
    type: "number", 
    width: { xs: 12, md: 6 },
    validate: (value) => validateField("number_of_events_anually", value)
  },
  { key: "Active", label: "Active", type: "boolean", width: { xs: 12, md: 6 } },
];

export default function AccountDetailsForm({ accountId }) {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [attachmentsPopupOpen, setAttachmentsPopupOpen] = useState(false);

  useEffect(() => {
    const fetchAccount = async () => {
      if (!accountId) return setError("No account ID provided");
      try {
        setLoading(true);
        const data = await fetchAccountById(accountId);
        setAccount(data?.data || data);
      } catch (err) {
        console.error(err);
        setError("Failed to load account details");
      } finally {
        setLoading(false);
      }
    };
    fetchAccount();
  }, [accountId]);

  const handleBack = () => navigate("/accounts");

  const handleSave = async (formData) => {
    try {
      // Validate before save but don't clear form data on validation error
      const validationErrors = validateAccountData(formData);
      
      if (validationErrors.length > 0) {
        setError(`Please fix the following errors:\n• ${validationErrors.join('\n• ')}`);
        // Don't update account state here - keep the form data intact
        return false;
      }

      // Only update account state after successful validation and save
      await updateAccount(accountId, formData);
      setAccount(formData);
      setSuccessMessage("Account updated successfully!");
      setError(null);
      return true;
    } catch (err) {
      console.error('Save error:', err);
      
      // Don't update account state on error - keep the form data intact
      if (err.isValidation) {
        setError(err.message);
      } else if (err.response?.status === 409) {
        setError('Account with this information already exists');
      } else if (err.response?.status === 400) {
        setError(err.response.data?.error || 'Invalid data provided');
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later');
      } else {
        setError('Failed to save account. Please try again.');
      }
      return false;
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to deactivate this account?")) return;
    try {
      await deactivateAccount(accountId);
      navigate("/accounts");
    } catch (err) {
      setError("Failed to deactivate account.");
    }
  };

  const handleAddNote = () => setNotesPopupOpen(true);
  const handleAddAttachment = () => setAttachmentsPopupOpen(true);

  // Header chips
  const headerChips = [];
  if (account) {
    headerChips.push({ label: account.Active ? "Active" : "Inactive", color: account.Active ? "#10b981" : "#6b7280", textColor: "#fff" });
    if (account.IndustryName) headerChips.push({ label: account.IndustryName, color: "#3b82f6", textColor: "#fff" });
    if (account.CityName || account.CountryName) headerChips.push({ label: [account.CityName, account.CountryName].filter(Boolean).join(", "), color: "#6b7280", textColor: "#fff" });
  }

  if (loading) return <Box>Loading account details...</Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!account) return <Alert severity="warning">Account not found.</Alert>;

  return (
    <Box>
      {successMessage && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>{successMessage}</Alert>}

      <UniversalDetailView
        title={account.AccountName || "Account Details"}
        subtitle={account.AccountID ? `Account ID: ${account.AccountID}` : undefined}
        item={account}
        mainFields={accountMainFields}
        // onBack={handleBack}
        onSave={handleSave}
        onDelete={handleDelete}
        onAddNote={handleAddNote}
        onAddAttachment={handleAddAttachment}
        loading={loading}
        error={error}
        entityType="account"
        headerChips={headerChips}
        relatedTabs={[]} // Add related tabs like contacts, deals, activities if needed
      />

      <NotesPopup open={notesPopupOpen} onClose={() => setNotesPopupOpen(false)} entityType="account" entityId={account?.AccountID} />
      <AttachmentsPopup open={attachmentsPopupOpen} onClose={() => setAttachmentsPopupOpen(false)} entityType="account" entityId={account?.AccountID} />
    </Box>
  );
}