import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Grid, Typography, Link as MuiLink, Alert } from "@mui/material";
import { UniversalDetailView } from "../components/DetailsView";
import { fetchAccountById } from "../services/accountService";

// Main fields configuration for accounts
const accountMainFields = [
  { key: "AccountName", label: "Account Name", required: true },
  { key: "AccountID", label: "Account ID", readOnly: true },
  { key: "IndustryName", label: "Industry", type: "select", options: [
    "Technology", "Healthcare", "Finance", "Education", "Manufacturing", 
    "Retail", "Consulting", "Real Estate", "Non-profit"
  ]},
  { key: "PrimaryPhone", label: "Phone", type: "tel" },
  { key: "Website", label: "Website", type: "url" },
  { key: "street_address1", label: "Street Address", type: "textarea", rows: 2 },
  { key: "street_address2", label: "Street Address 2" },
  { key: "street_address3", label: "Street Address 3" },
  { key: "postal_code", label: "Postal Code" },
  { key: "CityName", label: "City" },
  { key: "CountryName", label: "Country" },
  { key: "Active", label: "Status", type: "boolean" },
];

export default function AccountDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAccount = async () => {
      if (!id) {
        setError("No account ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetchAccountById(id);
        console.log("Fetched account details:", response.data);
        setAccount(response.data);
      } catch (error) {
        console.error("Failed to fetch account:", error);
        setError("Failed to load account details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [id]);

  const handleBack = () => {
    navigate('/accounts');
  };

  const handleSave = async (formData) => {
    try {
      console.log("Saving account:", formData);
      // Here you would typically update the account in your backend
      // await updateAccount(id, formData);
      setAccount(formData);
      // Optionally show success message
    } catch (error) {
      console.error("Failed to save account:", error);
      // Handle error - maybe set error state or show notification
    }
  };

  const handleDelete = async () => {
    try {
      console.log("Deleting account:", account.AccountID);
      // Here you would typically delete the account from your backend
      // await deleteAccount(account.AccountID);
      navigate('/accounts');
    } catch (error) {
      console.error("Failed to delete account:", error);
      // Handle error - maybe set error state or show notification
    }
  };

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
  };

  const formatAddress = (account) => {
    if (!account) return "-";
    const addressParts = [
      account.street_address1,
      account.street_address2,
      account.street_address3,
      account.postal_code
    ].filter(Boolean);
    return addressParts.length > 0 ? addressParts.join(", ") : "-";
  };

  // Create related tabs content using your existing logic
  const relatedTabs = [
    {
      id: "contacts",
      label: "Contacts",
      content: (
        <Box>
          {account?.contacts && account.contacts.length > 0 ? (
            <Grid container spacing={2}>
              {account.contacts.map((contact) => (
                <Grid item xs={12} md={6} key={contact.ContactID}>
                  <Box sx={{ 
                    border: '1px solid #e5e5e5', 
                    borderRadius: 2, 
                    p: 2, 
                    backgroundColor: '#ffffff'
                  }}>
                    <Typography variant="h6" sx={{ color: '#050505', fontWeight: 600, mb: 1 }}>
                      {[contact.Title, contact.first_name, contact.middle_name, contact.surname]
                        .filter(Boolean).join(' ')}
                    </Typography>
                    {contact.JobTitleName && (
                      <Typography variant="body2" sx={{ color: '#666666', mb: 2 }}>
                        {contact.JobTitleName}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, minWidth: '80px' }}>
                          Email:
                        </Typography>
                        <Typography variant="body2">
                          {contact.email ? (
                            <MuiLink href={`mailto:${contact.email}`}>
                              {contact.email}
                            </MuiLink>
                          ) : "-"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, minWidth: '80px' }}>
                          Phone:
                        </Typography>
                        <Typography variant="body2">
                          {contact.phone ? (
                            <MuiLink href={`tel:${contact.phone}`}>
                              {contact.phone}
                            </MuiLink>
                          ) : "-"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, minWidth: '80px' }}>
                          Department:
                        </Typography>
                        <Typography variant="body2">{contact.department || "-"}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, minWidth: '80px' }}>
                          Status:
                        </Typography>
                        <Typography variant="body2">{contact.status || "-"}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">No contacts found for this account.</Alert>
          )}
        </Box>
      ),
    },
    {
      id: "attachments",
      label: "Attachments",
      content: (
        <Box>
          {account?.attachments && account.attachments.length > 0 ? (
            <Grid container spacing={2}>
              {account.attachments.map((attachment) => (
                <Grid item xs={12} md={6} key={attachment.AttachmentID}>
                  <Box sx={{ 
                    border: '1px solid #e5e5e5', 
                    borderRadius: 2, 
                    p: 2, 
                    backgroundColor: '#ffffff'
                  }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                      <MuiLink 
                        href={attachment.FilePath} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        sx={{ color: '#050505', '&:hover': { color: '#333333' } }}
                      >
                        {attachment.FileName}
                      </MuiLink>
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666666' }}>
                      <strong>Uploaded:</strong> {formatDate(attachment.UploadedAt)}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">No attachments found for this account.</Alert>
          )}
        </Box>
      ),
    },
    {
      id: "notes",
      label: "Notes",
      content: (
        <Box>
          {account?.notes && account.notes.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {account.notes.map((note) => (
                <Box key={note.NoteID} sx={{ 
                  border: '1px solid #e5e5e5', 
                  borderRadius: 2, 
                  p: 2, 
                  backgroundColor: '#ffffff'
                }}>
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    {note.Content}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666' }}>
                    <strong>Created:</strong> {formatDate(note.CreatedAt)}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Alert severity="info">No notes found for this account.</Alert>
          )}
        </Box>
      ),
    },
  ];

  // Generate header chips based on account data
  const headerChips = [];
  if (account) {
    // Status chip
    headerChips.push({
      label: account.Active ? 'Active' : 'Inactive',
      color: account.Active ? '#10b981' : '#6b7280',
      textColor: '#ffffff'
    });

    // Industry chip
    if (account.IndustryName) {
      headerChips.push({
        label: account.IndustryName,
        color: '#3b82f6',
        textColor: '#ffffff'
      });
    }

    // Location chip
    if (account.CityName || account.CountryName) {
      headerChips.push({
        label: [account.CityName, account.CountryName].filter(Boolean).join(', '),
        color: '#6b7280',
        textColor: '#ffffff'
      });
    }
  }

  return (
    <UniversalDetailView
      title={account?.AccountName || 'Account Details'}
      subtitle={account?.AccountID ? `ID: ${account.AccountID}` : undefined}
      item={account}
      mainFields={accountMainFields}
      relatedTabs={relatedTabs}
      onBack={handleBack}
      onSave={handleSave}
      onDelete={handleDelete}
      loading={loading}
      error={error}
      entityType="account"
      headerChips={headerChips}
    />
  );
}