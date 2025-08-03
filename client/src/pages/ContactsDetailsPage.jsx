//PAGE : Contact Details
//Shows all details related to an individual contact

//IMPORTS
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Button,
  Tooltip,
  Box,
} from "@mui/material";
import { fetchContactById } from "../services/contactService";

function ContactsDetailsPage() {
  // Extract contact ID from URL params
  const { id } = useParams();
  // React Router navigation hook
  const navigate = useNavigate();

  // State to hold contact data
  const [contact, setContact] = useState(null);
  // Loading indicator state
  const [loading, setLoading] = useState(true);
  // Error message state
  const [error, setError] = useState(null);

  // Helper function to format date strings or show '-' if missing
  const formatDate = (str) => (str ? new Date(str).toLocaleString() : "-");

  // Fetch contact details when component mounts or ID changes
  useEffect(() => {
    async function fetchContact() {
      setLoading(true);  // Start loading spinner
      setError(null);    // Clear previous errors
      try {
        const data = await fetchContactById(id);
        // Handle if data is an array or single object
        const contact = Array.isArray(data) ? data[0] : data;
        if (!contact) throw new Error("Contact not found");
        setContact(contact);  // Save contact to state
      } catch (err) {
        setError(err.message || "Failed to fetch contact details");
      } finally {
        setLoading(false); // Stop loading spinner
      }
    }
    fetchContact();
  }, [id]);

  // Show loading spinner while fetching data
  if (loading) return <CircularProgress />;
  // Show error message if fetching failed
  if (error) return <Typography color="error">{error}</Typography>;
  // Show message if no contact found
  if (!contact) return <Typography>No contact found.</Typography>;

  return (
    <Box p={4}>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        ← Back to Contacts
      </Button>

      <Card sx={{ p: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Contact #{contact.ContactID}
          </Typography>

          <Grid container spacing={3}>
            {/* Left Column */}
            <Grid item xs={12} md={6}>
              <Tooltip title="Associated account with this contact" placement="top">
                <Box mb={1.5}>
                  <Typography variant="body2">
                    <strong>Account:</strong> {contact.AccountName || "-"}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title="Full name of the person" placement="top">
                <Box mb={1.5}>
                  <Typography variant="body2">
                    <strong>Person Name:</strong>{" "}
                    {contact.persons
                      ? `${contact.persons.Title || ""} ${contact.persons.first_name || ""} ${contact.persons.middle_name || ""} ${contact.persons.surname || ""}`.trim()
                      : "-"}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title="Work email address" placement="top">
                <Box mb={1.5}>
                  <Typography variant="body2">
                    <strong>Email:</strong> {contact.WorkEmail || "-"}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title="Work phone number" placement="top">
                <Box mb={1.5}>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {contact.WorkPhone || "-"}
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={6}>
              <Tooltip title="Current job title" placement="top">
                <Box mb={1.5}>
                  <Typography variant="body2">
                    <strong>Position:</strong> {contact.JobTitleName || "-"}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title="City where the contact is based" placement="top">
                <Box mb={1.5}>
                  <Typography variant="body2">
                    <strong>City:</strong> {contact.CityName || "-"}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title="Country of residence" placement="top">
                <Box mb={1.5}>
                  <Typography variant="body2">
                    <strong>Country:</strong> {contact.CountryName || "-"}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title="Record creation date" placement="top">
                <Box mb={1.5}>
                  <Typography variant="body2">
                    <strong>Created At:</strong> {formatDate(contact.CreatedAt)}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title="Last update to the contact record" placement="top">
                <Box mb={1.5}>
                  <Typography variant="body2">
                    <strong>Updated At:</strong> {formatDate(contact.UpdatedAt)}
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>

            {/* Attachments */}
            <Grid item xs={12}>
              <Tooltip title="Files uploaded for this contact" placement="top">
                <Box mt={3}>
                  <Typography variant="subtitle1" gutterBottom>
                    Attachments
                  </Typography>
                  {contact.attachments?.length > 0 ? (
                    contact.attachments.map((att) => (
                      <Box key={att.AttachmentID} mb={1}>
                        <Typography variant="body2">
                          <strong>File:</strong>{" "}
                          <a href={att.FilePath} target="_blank" rel="noopener noreferrer">
                            {att.FileName}
                          </a>
                        </Typography>
                        <Typography variant="caption">
                          Uploaded: {new Date(att.UploadedAt).toLocaleString()}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2">No attachments found for this contact.</Typography>
                  )}
                </Box>
              </Tooltip>
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <Tooltip title="Internal notes about this contact" placement="top">
                <Box mt={3}>
                  <Typography variant="subtitle1" gutterBottom>
                    Notes
                  </Typography>
                  {contact.notes?.length > 0 ? (
                    contact.notes.map((note) => (
                      <Box key={note.NoteID} mb={1}>
                        <Typography variant="body2" fontWeight="bold">
                          {note.Content}
                        </Typography>
                        <Typography variant="caption">
                          Created: {new Date(note.CreatedAt).toLocaleString()}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2">No notes found for this contact.</Typography>
                  )}
                </Box>
              </Tooltip>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ContactsDetailsPage;