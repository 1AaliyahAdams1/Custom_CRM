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
  Box,
} from "@mui/material";
import { getContactDetails } from "../services/contactService";

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
        const data = await getContactDetails(id);
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
      {/* Back button navigates back to previous page */}
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        &larr; Back to Contacts
      </Button>

      <Card elevation={3}>
        <CardContent>
          {/* Contact header with ID */}
          <Typography variant="h5" gutterBottom>
            Contact #{contact.ContactID}
          </Typography>

          {/* Grid layout with two columns */}
          <Grid container spacing={2}>
            {/* Left column with main contact info */}
            <Grid item xs={6}>
              <Typography>
                <strong>Account:</strong> {contact.Account || "-"}
              </Typography>
              <Typography>
                <strong>Person Name:</strong> {contact.ContactName || "-"}
              </Typography>
              <Typography>
                <strong>Email:</strong> {contact.PrimaryEmail || "-"}
              </Typography>
              <Typography>
                <strong>Phone:</strong> {contact.PrimaryPhone || "-"}
              </Typography>
            </Grid>

            {/* Right column with additional info */}
            <Grid item xs={6}>
              <Typography>
                <strong>Position:</strong> {contact.Position || "-"}
              </Typography>
              <Typography>
                <strong>City:</strong> {contact.CityName || "-"}
              </Typography>
              <Typography>
                <strong>Country:</strong> {contact.CountryName || "-"}
              </Typography>
              <Typography>
                <strong>Created At:</strong> {formatDate(contact.CreatedAt)}
              </Typography>
              <Typography>
                <strong>Updated At:</strong> {formatDate(contact.UpdatedAt)}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ContactsDetailsPage;