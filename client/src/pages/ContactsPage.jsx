//PAGE : Main Contacts Page
//Combines the UI components onto one page

//IMPORTS
import React, { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress, Alert } from "@mui/material";

import ContactsTable from "../components/ContactsTable";
import ContactFormDialog from "../components/ContactsFormDialog";

import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
} from "../services/contactService";

const ContactsPage = () => {
  // State to hold list of contacts fetched from backend
  const [contacts, setContacts] = useState([]);
  // Loading spinner state during data fetch or operations
  const [loading, setLoading] = useState(false);
  // Controls whether the add/edit dialog is open
  const [dialogOpen, setDialogOpen] = useState(false);
  // Holds the contact currently selected for editing (null when adding)
  const [selectedContact, setSelectedContact] = useState(null);
  // Holds error message string to display errors
  const [error, setError] = useState(null);
  // Holds success message string for user feedback
  const [successMessage, setSuccessMessage] = useState("");

  // Function to fetch contacts from backend API
  const fetchContacts = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const data = await getContacts(); // API call to fetch contacts
      setContacts(data); // Save data to state
    } catch (err) {
      setError("Failed to load contacts. Please try again."); // Show error message
    } finally {
      setLoading(false); // Turn off loading spinner
    }
  };

  // Fetch contacts when component first mounts
  useEffect(() => {
    fetchContacts();
  }, []);

  // Automatically clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Opens the dialog for adding a new contact
  const handleOpenCreate = () => {
    setSelectedContact(null); // Clear selected contact (create mode)
    setError(null);           // Clear any errors
    setDialogOpen(true);      // Open dialog
  };

  // Opens the dialog to edit an existing contact
  const handleOpenEdit = (contact) => {
    setSelectedContact(contact); // Set the contact to be edited
    setError(null);              // Clear any errors
    setDialogOpen(true);         // Open dialog
  };

  // Deletes a contact after user confirmation
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this contact?");
    if (!confirmDelete) return; // Cancel if user declines

    setError(null);
    try {
      await deleteContact(id);           // Call API to delete contact
      setSuccessMessage("Contact deleted successfully."); // Show success message
      await fetchContacts();             // Refresh list
    } catch (err) {
      setError("Failed to delete contact. Please try again."); // Show error
    }
  };

  // Handles form submission for creating or updating a contact
  const handleSave = async (contactData) => {
    setError(null);
    try {
      if (contactData.ContactID) {
        // Update existing contact
        await updateContact(contactData.ContactID, contactData);
        setSuccessMessage("Contact updated successfully.");
      } else {
        // Create new contact
        await createContact(contactData);
        setSuccessMessage("Contact created successfully.");
      }
      setDialogOpen(false);      // Close dialog after save
      await fetchContacts();     // Refresh contact list
    } catch (err) {
      setError("Failed to save contact. Please try again."); // Show error on failure
    }
  };

  // Closes the add/edit contact dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedContact(null); // Clear selected contact when dialog closes
  };

  return (
    <Box p={4}>
      {/* Page title */}
      <Typography variant="h4" gutterBottom>
        Contacts
      </Typography>

      {/* Error message alert, dismissible */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Success message alert, dismissible */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      {/* Button to open dialog for adding a new contact */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenCreate}
        sx={{ mb: 2 }}
        disabled={loading} // Disable while loading
      >
        Add Contact
      </Button>

      {/* Show loading spinner or contacts table */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <ContactsTable
          contacts={contacts}
          onEdit={handleOpenEdit}   // Pass edit handler to table
          onDelete={handleDelete}    // Pass delete handler to table
        />
      )}

      {/* Dialog component for add/edit contact form */}
      <ContactFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        contact={selectedContact}
        onSubmit={handleSave}
      />
    </Box>
  );
};

export default ContactsPage;
