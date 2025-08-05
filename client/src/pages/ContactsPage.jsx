//PAGE : Main Contacts Page
//Combines the UI components onto one page

//IMPORTS
import React, { useEffect, useState } from "react";

import { Box, Typography, Button, CircularProgress, Alert } from "@mui/material";

import { useNavigate } from "react-router-dom";
import ContactsTable from "../components/ContactsTable";

import {
  getAllContacts,
  getContactsByAccountId,
  deactivateContact
} from "../services/contactService";

const ContactsPage = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Function to fetch contacts from backend API
  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllContacts();
      setContacts(data);
    } catch (err) {
      setError("Failed to load contacts. Please try again.");
    } finally {
      setLoading(false);
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

  // Handle edit action
  const handleEdit = (contact) => {
    navigate(`/contacts/edit/${contact.ContactID}`);
  };
  // Navigate to create contact page
  const handleOpenCreate = () => {
    navigate("/contacts/create");
  };


  // Deactivates a contact
  const handleDeactivate = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this contact? This will deactivate it.");
    if (!confirm) return;

    setError(null);
    try {
      console.log("Deactivating (soft deleting) contact with ID:", id);
      await deactivateContact(id);
      setSuccessMessage("Contact deleted successfully."); // message visible to user
      await fetchContacts();
    } catch (error) {
      console.log("Deactivating (soft deleting) contact with ID:", id);
      console.error("Delete failed:", error);
      setError("Failed to delete contact. Please try again.");
    }
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
          loading={loading}
          onEdit={handleEdit}  
          onDelete={handleDeactivate}
        />
      )}

    </Box>
  );


};



export default ContactsPage;