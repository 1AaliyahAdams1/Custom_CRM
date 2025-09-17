import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Alert } from "@mui/material";
import { Visibility, Edit, Delete, Download, Phone, Email } from "@mui/icons-material";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";
import NotesPopup from "../../components/NotesComponent";
import AttachmentsPopup from "../../components/AttachmentsComponent";
import { fetchAccountById, updateAccount, deactivateAccount, getAllAccounts } from "../../services/accountService";
import {  getNotesByEntity } from "../../services/noteService";
import { getAttachmentsByEntity } from "../../services/attachmentService";
import {
  cityService,
  industryService,
  countryService,
  stateProvinceService
} from '../../services/dropdownServices';

// imports for the related data services
import { getContactsByAccountId } from "../../services/contactService";
import { fetchDealById } from "../../services/dealService";
import { fetchActivityById} from "../../services/activityService";

const accountService = { getAll: async () => (await getAllAccounts()).data }

// Define the main fields for the account form
const accountMainFields = [
  { key: "AccountName", label: "Account Name", required: true, width: { xs: 12, md: 6 } },
  {
    key: "ParentAccountName", label: "Parent Account", type: "dropdown",
    service: accountService, displayField: "ParentAccountName", valueField: "AccountID", width: { xs: 12, md: 6 }
  },
  { key: "CountryID", label: "Country", type: "dropdown", service: countryService, displayField: "CountryName", valueField: "CountryID", width: { xs: 12, md: 4 } },
  { key: "StateProvinceID", label: "State/Province", type: "dropdown", service: stateProvinceService, displayField: "StateProvince_Name", valueField: "StateProvinceID", width: { xs: 12, md: 4 } },
  { key: "CityID", label: "City", type: "dropdown", service: cityService, displayField: "CityName", valueField: "CityID", width: { xs: 12, md: 4 } },
  { key: "IndustryID", label: "Industry", type: "dropdown", service: industryService, displayField: "IndustryName", valueField: "IndustryID", width: { xs: 12, md: 4 } },
  { key: "street_address1", label: "Street Address 1", width: { xs: 12, md: 6 } },
  { key: "street_address2", label: "Street Address 2", width: { xs: 12, md: 6 } },
  { key: "street_address3", label: "Street Address 3", width: { xs: 12, md: 6 } },
  { key: "postal_code", label: "Postal Code", width: { xs: 12, md: 6 } },
  { key: "PrimaryPhone", label: "Primary Phone", type: "tel", width: { xs: 12, md: 6 } },
  { key: "fax", label: "Fax", type: "tel", width: { xs: 12, md: 6 } },
  { key: "email", label: "Email", type: "email", width: { xs: 12, md: 6 } },
  { key: "Website", label: "Website", type: "url", width: { xs: 12, md: 6 } },
  { key: "annual_revenue", label: "Annual Revenue", type: "number", width: { xs: 12, md: 6 } },
  { key: "number_of_employees", label: "Number of Employees", type: "number", width: { xs: 12, md: 6 } },
  { key: "number_of_venues", label: "Number of Venues", type: "number", width: { xs: 12, md: 6 } },
  { key: "number_of_releases", label: "Number of Releases", type: "number", width: { xs: 12, md: 6 } },
  { key: "number_of_events_anually", label: "Number of Events Annually", type: "number", width: { xs: 12, md: 6 } },
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
      setAccount(formData);
      await updateAccount(accountId, formData);
      setSuccessMessage("Account updated successfully!");
    } catch (err) {
      setError("Failed to save account.");
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

  // Action handlers for table rows
  const handleViewContact = (contact) => {
    navigate(`/contacts/${contact.ContactID}`);
  };

  const handleEditContact = (contact) => {
    navigate(`/contacts/${contact.ContactID}/edit`);
  };

  const handleViewDeal = (deal) => {
    navigate(`/deals/${deal.DealID}`);
  };

  const handleViewActivity = (activity) => {
    navigate(`/activities/${activity.ActivityID}`);
  };

  const handleDownloadAttachment = (attachment) => {
    if (attachment.FilePath) {
      window.open(attachment.FilePath, '_blank');
    }
  };

  // Define the related tabs with table configurations
  // const relatedTabs = [
  //   {
  //     label: "Contacts",
  //     dataService: (accountData) => getContactsByAccountId(accountData.AccountID),
  //     columns: [
  //       { key: "FirstName", label: "First Name" },
  //       { key: "LastName", label: "Last Name" },
  //       { key: "Title", label: "Title" },
  //       { key: "email", label: "Email", type: "email" },
  //       { key: "phone", label: "Phone", type: "phone" },
  //       { key: "Active", label: "Status", type: "status" },
  //     ],
  //     actions: [
  //       { 
  //         label: "View", 
  //         icon: <Visibility />, 
  //         onClick: handleViewContact,
  //         color: "primary"
  //       },
  //       { 
  //         label: "Edit", 
  //         icon: <Edit />, 
  //         onClick: handleEditContact,
  //         color: "secondary"
  //       },
  //     ]
  //   },
  //   {
  //     label: "Deals",
  //     dataService: (accountData) => fetchDealById (accountData.AccountID),
  //     columns: [
  //       { key: "DealName", label: "Deal Name" },
  //       { key: "Stage", label: "Stage", type: "status" },
  //       { key: "Amount", label: "Amount", type: "currency" },
  //       { key: "Probability", label: "Probability (%)", type: "number" },
  //       { key: "CloseDate", label: "Close Date", type: "date" },
  //       { key: "OwnerName", label: "Owner" },
  //     ],
  //     actions: [
  //       { 
  //         label: "View", 
  //         icon: <Visibility />, 
  //         onClick: handleViewDeal,
  //         color: "primary"
  //       },
  //     ]
  //   },
  //   {
  //     label: "Activities",
  //     dataService: (accountData) => fetchActivityById(accountData.AccountID),
  //     columns: [
  //       { key: "Subject", label: "Subject" },
  //       { key: "ActivityType", label: "Type" },
  //       { key: "Status", label: "Status", type: "status" },
  //       { key: "DueDate", label: "Due Date", type: "datetime" },
  //       { key: "AssignedToName", label: "Assigned To" },
  //       { key: "Priority", label: "Priority", type: "status" },
  //     ],
  //     actions: [
  //       { 
  //         label: "View", 
  //         icon: <Visibility />, 
  //         onClick: handleViewActivity,
  //         color: "primary"
  //       },
  //     ]
  //   },
  //   {
  //     label: "Note",
  //     dataService: (accountData) =>getNotesByEntity.fetchByEntity("account", accountData.AccountID),
  //     columns: [
  //       { key: "Subject", label: "Subject" },
  //       { key: "NoteText", label: "Note" },
  //       { key: "CreatedByName", label: "Created By" },
  //       { key: "CreatedDate", label: "Created Date", type: "datetime" },
  //     ],
  //   },
  //   {
  //     label: "Attachments",
  //     dataService: (accountData) =>getAttachmentsByEntity                         .fetchByEntity("account", accountData.AccountID),
  //     columns: [
  //       { key: "FileName", label: "File Name" },
  //       { key: "FileSize", label: "Size" },
  //       { key: "FileType", label: "Type" },
  //       { key: "UploadedByName", label: "Uploaded By" },
  //       { key: "UploadedDate", label: "Uploaded Date", type: "datetime" },
  //     ],
  //     actions: [
  //       { 
  //         label: "Download", 
  //         icon: <Download />, 
  //         onClick: handleDownloadAttachment,
  //         color: "primary"
  //       },
  //     ]
  //   },
  // ];

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
        onSave={handleSave}
        onDelete={handleDelete}
        onAddNote={handleAddNote}
        onAddAttachment={handleAddAttachment}
        loading={loading}
        error={error}
        entityType="account"
        headerChips={headerChips}
        // relatedTabs={relatedTabs} // table configurations
      />

      <NotesPopup open={notesPopupOpen} onClose={() => setNotesPopupOpen(false)} entityType="account" entityId={account?.AccountID} />
      <AttachmentsPopup open={attachmentsPopupOpen} onClose={() => setAttachmentsPopupOpen(false)} entityType="account" entityId={account?.AccountID} />
    </Box>
  );
}