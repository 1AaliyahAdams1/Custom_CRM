// PAGE: Account Details
// Shows all details related to an individual account

// IMPORTS
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Button,
  Box,
  Link as MuiLink,
} from "@mui/material";

// SYNCFUSION (Optional fallback button example)
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';

// SERVICE IMPORT
import { fetchAccountById } from "../services/accountService";

// COMPONENT
function AccountDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadAccount() {
      try {
        setLoading(true);
        const res = await fetchAccountById(id);
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        if (!data) throw new Error("Account not found");
        setAccount(data);
      } catch (err) {
        setError(err.message || "Failed to load account");
      } finally {
        setLoading(false);
      }
    }

    loadAccount();
  }, [id]);

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  if (error) return <Typography color="error" sx={{ mt: 4 }}>{error}</Typography>;
  if (!account) return <Typography sx={{ mt: 4 }}>No account found.</Typography>;

  return (
    <Box p={4}>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        &larr; Back to Accounts
      </Button>

      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" gutterBottom>{account.AccountName}</Typography>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography><strong>ID:</strong> {account.AccountID}</Typography>
              <Typography><strong>Industry:</strong> {account.IndustryName || "-"}</Typography>
              <Typography><strong>City:</strong> {account.CityName || "-"}</Typography>
              <Typography><strong>Country:</strong> {account.CountryName || "-"}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography><strong>Phone:</strong> {account.PrimaryPhone || "-"}</Typography>
              <Typography><strong>Website:</strong> {account.Website || "-"}</Typography>
              <Box mt={1}>
                <Typography variant="body2" lineHeight={1.5}>
                  <strong>Address:</strong>{" "}
                  {[
                    account.street_address1,
                    account.street_address2,
                    account.street_address3,
                    account.postal_code,
                  ]
                    .filter(Boolean)
                    .join(", ") || "-"}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* CONTACTS */}
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>Contacts</Typography>
            {account.contacts?.length > 0 ? (
              account.contacts.map((contact) => (
                <Box key={contact.ContactID} mb={2}>
                  <Typography variant="body1" fontWeight="bold">
                    {contact.Title} {contact.first_name} {contact.middle_name} {contact.surname}
                  </Typography>
                  {contact.JobTitleName && (
                    <Typography variant="body2">{contact.JobTitleName}</Typography>
                  )}
                </Box>
              ))
            ) : (
              <Typography variant="body2">No contacts found.</Typography>
            )}
          </Box>

          {/* ATTACHMENTS */}
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>Attachments</Typography>
            {account.attachments?.length > 0 ? (
              account.attachments.map((att) => (
                <Box key={att.AttachmentID} mb={2}>
                  <Typography variant="body2" lineHeight={1.5}>
                    <strong>File:</strong>{" "}
                    <MuiLink href={att.FilePath} target="_blank" rel="noopener noreferrer">
                      {att.FileName}
                    </MuiLink><br />
                    <small>Uploaded: {new Date(att.UploadedAt).toLocaleString()}</small>
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2">No attachments found.</Typography>
            )}
          </Box>

          {/* NOTES */}
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>Notes</Typography>
            {account.notes?.length > 0 ? (
              account.notes.map((note) => (
                <Box key={note.NoteID} mb={2}>
                  <Typography variant="body2" lineHeight={1.5}>
                    <strong>Note:</strong> {note.Content}<br />
                    <small>Created: {new Date(note.CreatedAt).toLocaleString()}</small>
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2">No notes found.</Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default AccountDetailsPage;
