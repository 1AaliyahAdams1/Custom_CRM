import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Grid, Typography, Link as MuiLink, Alert, Button } from "@mui/material";
import { UniversalDetailView } from "../../components/DetailsView";
import { getContactDetails, updateContact, deactivateContact } from "../../services/contactService";

// Main fields configuration for contacts
const contactMainFields = [
  {
    key: "Title",
    label: "Title",
    type: "select",
    options: ["Mr.", "Ms.", "Mrs.", "Dr.", "Prof."],
    width: { xs: 12, md: 3, lg: 3 }
  },
  {
    key: "first_name",
    label: "First Name",
    required: true,
    width: { xs: 12, md: 3, lg: 3 }
  },
  {
    key: "middle_name",
    label: "Middle Name",
    width: { xs: 12, md: 3, lg: 3 }
  },
  {
    key: "surname",
    label: "Last Name",
    required: true,
    width: { xs: 12, md: 3, lg: 3 }
  },
  {
    key: "JobTitleName",
    label: "Job Title",
    type: "select",
    options: [
      "CEO", "CTO", "CFO", "Manager", "Director", "VP", "Senior Manager",
      "Team Lead", "Developer", "Analyst", "Consultant", "Coordinator"
    ]
  },
  {
    key: "department",
    label: "Department",
    type: "select",
    options: [
      "Sales", "Marketing", "Engineering", "HR", "Finance", "Operations",
      "Customer Service", "Legal", "IT", "Research & Development"
    ]
  },
  { key: "WorkEmail", label: "Work Email", type: "email", required: true },
  { key: "PersonalEmail", label: "Personal Email", type: "email" },
  { key: "WorkPhone", label: "Work Phone", type: "tel" },
  { key: "MobilePhone", label: "Mobile Phone", type: "tel" },
  { key: "HomePhone", label: "Home Phone", type: "tel" },
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
  {
    key: "status",
    label: "Status",
    type: "select",
    options: ["Active", "Inactive", "Lead", "Customer", "Prospect"]
  },
  { key: "Active", label: "Active", type: "boolean" },
];

export default function ContactDetailView() {
  const { id } = useParams();
  console.log("Contact ID param:", id);
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchContact = async () => {
      if (!id) {
        setError("No contact ID provided");
        setLoading(false);
        return;
      }

      // Validate that ID is a number
      const contactId = parseInt(id, 10);
      if (isNaN(contactId) || contactId <= 0) {
        setError(`Invalid contact ID: "${id}". Expected a positive number.`);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("Fetching contact with ID:", contactId, "(original param:", id, ")");

        // Fix: Handle the API response structure properly
        const response = await getContactDetails(contactId);
        console.log("Raw API response:", response);

        // The response might be structured differently
        // Check if response has a data property or if it's the data directly
        let contactData;
        if (response && response.data) {
          contactData = response.data;
        } else if (response && typeof response === 'object') {
          contactData = response;
        } else {
          throw new Error('Invalid response format');
        }

        console.log("Processed contact data:", contactData);
        setContact(contactData);
      } catch (error) {
        console.error("Failed to fetch contact:", error);
        // More specific error handling
        if (error.response) {
          if (error.response.status === 404) {
            setError(`Contact with ID ${id} not found.`);
          } else if (error.response.status === 403) {
            setError("You don't have permission to view this contact.");
          } else {
            setError(`Failed to load contact details: ${error.response.data?.error || error.message}`);
          }
        } else if (error.request) {
          setError("Network error. Please check your connection and try again.");
        } else {
          setError(`Failed to load contact details: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [id]);

  const handleBack = () => {
    navigate('/contacts');
  };

  const handleSave = async (formData) => {
    try {
      console.log("Saving contact:", formData);
      await updateContact(id, formData);
      setContact(formData);
      setSuccessMessage("Contact updated successfully!");
    } catch (error) {
      console.error("Failed to save contact:", error);
      setError(`Failed to update contact: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to deactivate this contact?')) {
      return;
    }

    try {
      console.log("Deactivating contact with ID:", id);
      await deactivateContact(id);
      setSuccessMessage("Contact deactivated successfully!");
      // Navigate after a short delay to show the success message
      setTimeout(() => {
        navigate('/contacts');
      }, 1500);
    } catch (error) {
      console.error("Failed to delete contact:", error);
      setError(`Failed to deactivate contact: ${error.response?.data?.error || error.message}`);
    }
  };

  // Handle adding notes
  const handleAddNote = (contact) => {
    console.log("Adding note for contact:", contact);
    // Navigate to notes page 
    navigate(`/contacts/${contact.ContactID}/notes/create`);
  };

  // Handle adding attachments
  const handleAddAttachment = (contact) => {
    console.log("Adding attachment for contact:", contact);
    // Navigate to attachments page 
    navigate(`/contacts/${contact.ContactID}/attachments/upload`);
  };

  // Navigation handlers 
  const handleAccountClick = (accountId) => {
    navigate(`/accounts/${accountId}`);
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
      id: "account",
      label: "Account",
      content: (
        <Box>
          {contact?.account ? (
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
              onClick={() => handleAccountClick(contact.account.AccountID)}
            >
              <Typography variant="h6" sx={{ color: '#050505', fontWeight: 600, mb: 1 }}>
                {contact.account.AccountName}
              </Typography>
              {contact.account.IndustryName && (
                <Typography variant="body2" sx={{ color: '#666666', mb: 2 }}>
                  Industry: {contact.account.IndustryName}
                </Typography>
              )}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, minWidth: '80px' }}>
                    Phone:
                  </Typography>
                  <Typography variant="body2">
                    {contact.account.PrimaryPhone ? (
                      <MuiLink
                        href={`tel:${contact.account.PrimaryPhone}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {contact.account.PrimaryPhone}
                      </MuiLink>
                    ) : "-"}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, minWidth: '80px' }}>
                    Website:
                  </Typography>
                  <Typography variant="body2">
                    {contact.account.Website ? (
                      <MuiLink
                        href={contact.account.Website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {contact.account.Website}
                      </MuiLink>
                    ) : "-"}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, minWidth: '80px' }}>
                    Location:
                  </Typography>
                  <Typography variant="body2">
                    {[contact.account.CityName, contact.account.CountryName].filter(Boolean).join(', ') || "-"}
                  </Typography>
                </Box>
              </Box>

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
                    handleAccountClick(contact.account.AccountID);
                  }}
                >
                  View Account
                </Button>
              </Box>
            </Box>
          ) : (
            <Alert severity="info">No account associated with this contact.</Alert>
          )}
        </Box>
      ),
    },
    {
      id: "deals",
      label: "Deals",
      content: (
        <Box>
          {contact?.deals && contact.deals.length > 0 ? (
            <Grid container spacing={2}>
              {contact.deals.map((deal) => (
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
            <Alert severity="info">No deals found for this contact.</Alert>
          )}
        </Box>
      ),
    },
    {
      id: "activities",
      label: "Activities",
      content: (
        <Box>
          {contact?.activities && contact.activities.length > 0 ? (
            <Grid container spacing={2}>
              {contact.activities.map((activity) => (
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
            <Alert severity="info">No activities found for this contact.</Alert>
          )}
        </Box>
      ),
    },
    {
      id: "attachments",
      label: "Attachments",
      content: (
        <Box>
          {contact?.attachments && contact.attachments.length > 0 ? (
            <Grid container spacing={2}>
              {contact.attachments.map((attachment) => (
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
            <Alert severity="info">No attachments found for this contact.</Alert>
          )}
        </Box>
      ),
    },
    {
      id: "notes",
      label: "Notes",
      content: (
        <Box>
          {contact?.notes && contact.notes.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {contact.notes.map((note) => (
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
            <Alert severity="info">No notes found for this contact.</Alert>
          )}
        </Box>
      ),
    },
  ];

  // Generate header chips based on contact data
  const headerChips = [];
  if (contact) {
    // Status chip
    headerChips.push({
      label: contact.Active ? 'Active' : 'Inactive',
      color: contact.Active ? '#10b981' : '#6b7280',
      textColor: '#ffffff'
    });

    // Status chip (if different from Active)
    if (contact.status && contact.status !== (contact.Active ? 'Active' : 'Inactive')) {
      headerChips.push({
        label: contact.status,
        color: '#3b82f6',
        textColor: '#ffffff'
      });
    }

    // Job title chip
    if (contact.JobTitleName) {
      headerChips.push({
        label: contact.JobTitleName,
        color: '#8b5cf6',
        textColor: '#ffffff'
      });
    }

    // Department chip
    if (contact.department) {
      headerChips.push({
        label: contact.department,
        color: '#f59e0b',
        textColor: '#ffffff'
      });
    }

    // Location chip
    if (contact.CityName || contact.CountryName) {
      headerChips.push({
        label: [contact.CityName, contact.CountryName].filter(Boolean).join(', '),
        color: '#6b7280',
        textColor: '#ffffff'
      });
    }
  }

  // Generate contact display name
  const getContactDisplayName = () => {
    if (!contact) return 'Contact Details';
    const nameParts = [contact.Title, contact.first_name, contact.middle_name, contact.surname]
      .filter(Boolean);
    return nameParts.length > 0 ? nameParts.join(' ') : 'Contact Details';
  };

  // Early return for loading and error states
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Loading contact details...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={handleBack}>
          Back to Contacts
        </Button>
      </Box>
    );
  }

  if (!contact) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Contact not found.
        </Alert>
        <Button variant="outlined" onClick={handleBack}>
          Back to Contacts
        </Button>
      </Box>
    );
  }

  return (
    <>
      {/* Success Alert */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      <UniversalDetailView
        title={getContactDisplayName()}
        subtitle={contact?.ContactID ? `Contact ID: ${contact.ContactID}` : undefined}
        item={contact}
        mainFields={contactMainFields}
        relatedTabs={relatedTabs}
        onBack={handleBack}
        onSave={handleSave}
        onDelete={handleDelete}
        onAddAttachment={handleAddAttachment}
        onAddNote={handleAddNote}
        loading={loading}
        error={error}
        entityType="contact"
        headerChips={headerChips}
      />
    </>
  );
}