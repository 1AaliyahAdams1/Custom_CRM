import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Grid, Typography, Link as MuiLink, Alert, Button } from "@mui/material";
import { UniversalDetailView } from "../components/DetailsView";
import { fetchAccountById, updateAccount, deactivateAccount } from "../services/accountService";
import NotesPopup from "../components/NotesComponent";
import AttachmentsPopup from "../components/AttachmentsComponent";
import { noteService } from "../services/noteService";
import { attachmentService } from "../services/attachmentService";

// Main fields configuration for accounts
const accountMainFields = [
  {
    key: "AccountName",
    label: "Account Name",
    required: true,
    width: { xs: 12, md: 12, lg: 12 }
  },
  {
    key: "IndustryName",
    label: "Industry",
    type: "select",
    options: [
      "Technology", "Healthcare", "Finance", "Education", "Manufacturing",
      "Retail", "Consulting", "Real Estate", "Non-profit"
    ]
  },
  { key: "PrimaryPhone", label: "Phone", type: "tel" },
  { key: "Website", label: "Website", type: "url" },
  { key: "street_address1", label: "Street Address", type: "textarea", rows: 2 },
  { key: "street_address2", label: "Street Address 2" },
  { key: "street_address3", label: "Street Address 3" },
  { key: "postal_code", label: "Postal Code" },
  {
    key: "CityName",
    label: "City",
    type: "select",
    options: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"]
  },
  {
    key: "CountryName",
    label: "Country",
    type: "select",
    options: ["USA", "Canada", "UK", "Australia", "Germany", "France", "India"]
  },
  {
    key: "StateProvinceName",
    label: "State/Province",
    type: "select",
    options: ["California", "Texas", "Florida", "New York", "Illinois", "Pennsylvania", "Ohio", "Georgia", "North Carolina", "Michigan"]
  },
  { key: "annual_revenue", label: "Annual Revenue", type: "currency" },
  { key: "number_of_employees", label: "Number of Employees", type: "number" },
  { key: "number_of_releases", label: "Number of Releases", type: "number" },
  { key: "number_of_events_anually", label: "Number of Events Annually", type: "number" },
  { key: "number_of_venues", label: "Number of Venues", type: "number" },
  { key: "Active", label: "Status", type: "boolean" },
];

export default function AccountDetailView() {
  const { id } = useParams();
  console.log("Account ID param:", id);
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // State for popups
  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [attachmentsPopupOpen, setAttachmentsPopupOpen] = useState(false);
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupError, setPopupError] = useState(null);
  

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
      setAccount(formData);
      await updateAccount(id, formData)
      setSuccessMessage("Account updated successfully!");
    } catch (error) {
      console.error("Failed to save account:", error);
    }
  };

  const handleDelete = async () => {
    try {
      console.log("Deactivating (soft deleting) account with ID:", id);
      await deactivateAccount(id);
      navigate('/accounts');
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  // Notes handlers
  const handleAddNote = () => {
    setNotesPopupOpen(true);
    setPopupError(null);
  };

  const handleSaveNote = async (noteData) => {
    try {
      setPopupLoading(true);
      setPopupError(null);
      
      await noteService.createNote(noteData);
      
      // Refresh account data to show new note
      const response = await fetchAccountById(id);
      setAccount(response.data);
      
      setSuccessMessage('Note added successfully!');
      setNotesPopupOpen(false);
    } catch (error) {
      setPopupError(error.message || 'Failed to save note');
    } finally {
      setPopupLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      setPopupLoading(true);
      setPopupError(null);
      
      await noteService.deleteNote(noteId);
      
      // Refresh account data
      const response = await fetchAccountById(id);
      setAccount(response.data);
      
      setSuccessMessage('Note deleted successfully!');
    } catch (error) {
      setPopupError(error.message || 'Failed to delete note');
    } finally {
      setPopupLoading(false);
    }
  };

  const handleEditNote = async (noteData) => {
    try {
      setPopupLoading(true);
      setPopupError(null);
      
      await noteService.updateNote(noteData.NoteID, noteData);
      
      // Refresh account data
      const response = await fetchAccountById(id);
      setAccount(response.data);
      
      setSuccessMessage('Note updated successfully!');
    } catch (error) {
      setPopupError(error.message || 'Failed to update note');
    } finally {
      setPopupLoading(false);
    }
  };

  // Attachments handlers
  const handleAddAttachment = () => {
    setAttachmentsPopupOpen(true);
    setPopupError(null);
  };

  const handleUploadAttachment = async (attachmentDataArray) => {
    try {
      setPopupLoading(true);
      setPopupError(null);
      
      // Upload each file
      for (const attachmentData of attachmentDataArray) {
        await attachmentService.uploadAttachment(attachmentData);
      }
      
      // Refresh account data to show new attachments
      const response = await fetchAccountById(id);
      setAccount(response.data);
      
      setSuccessMessage(`${attachmentDataArray.length} attachment(s) uploaded successfully!`);
      setAttachmentsPopupOpen(false);
    } catch (error) {
      setPopupError(error.message || 'Failed to upload attachments');
    } finally {
      setPopupLoading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      setPopupLoading(true);
      setPopupError(null);
      
      await attachmentService.deleteAttachment(attachmentId);
      
      // Refresh account data
      const response = await fetchAccountById(id);
      setAccount(response.data);
      
      setSuccessMessage('Attachment deleted successfully!');
    } catch (error) {
      setPopupError(error.message || 'Failed to delete attachment');
    } finally {
      setPopupLoading(false);
    }
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      // Use the service to handle download
      await attachmentService.downloadAttachment(attachment);
    } catch (error) {
      setPopupError(error.message || 'Failed to download attachment');
    }
  };

  // Navigation handlers 
  const handleContactClick = (contactId) => {
    navigate(`/contacts/${contactId}`);
  };

  const handleDealClick = (dealId) => {
    navigate(`/deals/${dealId}`);
  };

  const handleActivityClick = (activityId) => {
    navigate(`/activities/${activityId}`);
  };

  const handleAttachmentClick = (attachmentId) => {
    navigate(`/attachments/${attachmentId}`);
  };

  const handleNoteClick = (noteId) => {
    navigate(`/notes/${noteId}`);
  };

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
  };

  // Create related tabs 
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
                  <Box
                    sx={{
                      border: '1px solid #e5e5e5',
                      borderRadius: 2,
                      p: 2,
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        transform: 'translateY(-2px)',
                        borderColor: '#cccccc'
                      }
                    }}
                    onClick={() => handleContactClick(contact.ContactID)}
                  >
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
                            <MuiLink
                              href={`mailto:${contact.email}`}
                              onClick={(e) => e.stopPropagation()}
                            >
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
                            <MuiLink
                              href={`tel:${contact.phone}`}
                              onClick={(e) => e.stopPropagation()}
                            >
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

                    {/* Action buttons at bottom */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 2, pt: 2, borderTop: '1px solid #f0f0f0' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: '#e5e5e5',
                          color: '#666666',
                          '&:hover': { borderColor: '#cccccc', backgroundColor: '#f5f5f5' }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContactClick(contact.ContactID);
                        }}
                      >
                        View Details
                      </Button>
                      {contact.email && (
                        <Button
                          size="small"
                          variant="text"
                          href={`mailto:${contact.email}`}
                          onClick={(e) => e.stopPropagation()}
                          sx={{ color: '#666666' }}
                        >
                          Email
                        </Button>
                      )}
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
      id: "deals",
      label: "Deals",
      content: (
        <Box>
          {account?.deals && account.deals.length > 0 ? (
            <Grid container spacing={2}>
              {account.deals.map((deal) => (
                <Grid item xs={12} md={6} key={deal.DealID}>
                  <Box
                    sx={{
                      border: '1px solid #e5e5e5',
                      borderRadius: 2,
                      p: 2,
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        transform: 'translateY(-2px)',
                        borderColor: '#cccccc'
                      }
                    }}
                    onClick={() => handleDealClick(deal.DealID)}
                  >
                    <Typography variant="h6" sx={{ color: '#050505', fontWeight: 600, mb: 1 }}>
                      {deal.DealName || 'Unnamed Deal'}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, minWidth: '80px' }}>
                          Value:
                        </Typography>
                        <Typography variant="body2">
                          ${deal.DealValue?.toLocaleString() || '-'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, minWidth: '80px' }}>
                          Stage:
                        </Typography>
                        <Typography variant="body2">{deal.Stage || "-"}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, minWidth: '80px' }}>
                          Close Date:
                        </Typography>
                        <Typography variant="body2">{formatDate(deal.CloseDate)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, minWidth: '80px' }}>
                          Probability:
                        </Typography>
                        <Typography variant="body2">{deal.Probability ? `${deal.Probability}%` : "-"}</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ pt: 2, borderTop: '1px solid #f0f0f0' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: '#e5e5e5',
                          color: '#666666',
                          '&:hover': { borderColor: '#cccccc', backgroundColor: '#f5f5f5' }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDealClick(deal.DealID);
                        }}
                      >
                        View Deal
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">No deals found for this account.</Alert>
          )}
        </Box>
      ),
    },
    {
      id: "activities",
      label: "Activities",
      content: (
        <Box>
          {account?.activities && account.activities.length > 0 ? (
            <Grid container spacing={2}>
              {account.activities.map((activity) => (
                <Grid item xs={12} key={activity.ActivityID}>
                  <Box
                    sx={{
                      border: '1px solid #e5e5e5',
                      borderRadius: 2,
                      p: 2,
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        transform: 'translateY(-2px)',
                        borderColor: '#cccccc'
                      }
                    }}
                    onClick={() => handleActivityClick(activity.ActivityID)}
                  >
                    <Typography variant="h6" sx={{ color: '#050505', fontWeight: 600, mb: 1 }}>
                      {activity.ActivityType || 'Activity'}: {activity.Subject || 'No Subject'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666666', mb: 2 }}>
                      {activity.Description || 'No description available'}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, minWidth: '100px' }}>
                          Date:
                        </Typography>
                        <Typography variant="body2">{formatDate(activity.ActivityDate)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, minWidth: '100px' }}>
                          Status:
                        </Typography>
                        <Typography variant="body2">{activity.Status || "-"}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, minWidth: '100px' }}>
                          Priority:
                        </Typography>
                        <Typography variant="body2">{activity.Priority || "-"}</Typography>
                      </Box>
                    </Box>

                    <Box sx={{ pt: 2, borderTop: '1px solid #f0f0f0' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: '#e5e5e5',
                          color: '#666666',
                          '&:hover': { borderColor: '#cccccc', backgroundColor: '#f5f5f5' }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActivityClick(activity.ActivityID);
                        }}
                      >
                        View Activity
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">No activities found for this account.</Alert>
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
                  <Box
                    sx={{
                      border: '1px solid #e5e5e5',
                      borderRadius: 2,
                      p: 2,
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        transform: 'translateY(-2px)',
                        borderColor: '#cccccc'
                      }
                    }}
                    onClick={() => handleAttachmentClick(attachment.AttachmentID)}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, color: '#050505' }}>
                      {attachment.FileName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666666', mb: 2 }}>
                      <strong>Uploaded:</strong> {formatDate(attachment.UploadedAt)}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, pt: 2, borderTop: '1px solid #f0f0f0' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: '#e5e5e5',
                          color: '#666666',
                          '&:hover': { borderColor: '#cccccc', backgroundColor: '#f5f5f5' }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAttachmentClick(attachment.AttachmentID);
                        }}
                      >
                        View Details
                      </Button>
                      {attachment.FilePath && (
                        <Button
                          size="small"
                          variant="text"
                          href={attachment.FilePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          sx={{ color: '#666666' }}
                        >
                          Download
                        </Button>
                      )}
                    </Box>
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
                <Box
                  key={note.NoteID}
                  sx={{
                    border: '1px solid #e5e5e5',
                    borderRadius: 2,
                    p: 2,
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)',
                      borderColor: '#cccccc'
                    }
                  }}
                  onClick={() => handleNoteClick(note.NoteID)}
                >
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    {note.Content}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666666', mb: 2 }}>
                    <strong>Created:</strong> {formatDate(note.CreatedAt)}
                    {note.CreatedBy && ` by ${note.CreatedBy}`}
                  </Typography>

                  <Box sx={{ pt: 2, borderTop: '1px solid #f0f0f0' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: '#e5e5e5',
                        color: '#666666',
                        '&:hover': { borderColor: '#cccccc', backgroundColor: '#f5f5f5' }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNoteClick(note.NoteID);
                      }}
                    >
                      View Note
                    </Button>
                  </Box>
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
    <Box>
      {/* Success Alert */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      <UniversalDetailView
        title={account?.AccountName || 'Account Details'}
        subtitle={account?.AccountID ? `ID: ${account.AccountID}` : undefined}
        item={account}
        mainFields={accountMainFields}
        relatedTabs={relatedTabs}
        onBack={handleBack}
        onSave={handleSave}
        onDelete={handleDelete}
        onAddAttachment={handleAddAttachment}
        onAddNote={handleAddNote}
        loading={loading}
        error={error}
        entityType="account"
        headerChips={headerChips}
      />

      {/* Notes Popup */}
      <NotesPopup
        open={notesPopupOpen}
        onClose={() => setNotesPopupOpen(false)}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
        onEdit={handleEditNote}
        entityType="account"
        entityId={account?.AccountID}
        entityName={account?.AccountName}
        existingNotes={account?.notes || []}
        loading={popupLoading}
        error={popupError}
      />

      {/* Attachments Popup */}
      <AttachmentsPopup
        open={attachmentsPopupOpen}
        onClose={() => setAttachmentsPopupOpen(false)}
        onUpload={handleUploadAttachment}
        onDelete={handleDeleteAttachment}
        onDownload={handleDownloadAttachment}
        entityType="account"
        entityId={account?.AccountID}
        entityName={account?.AccountName}
        existingAttachments={account?.attachments || []}
        loading={popupLoading}
        error={popupError}
      />
    </Box>
  );
}