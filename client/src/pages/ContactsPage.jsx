//PAGE : Main Contacts Page
//Combines the UI components onto one page

//IMPORTS
import React, { useEffect, useState } from "react";

import { Box, Typography, Button, CircularProgress, Alert } from "@mui/material";

import { useNavigate } from "react-router-dom";
import ContactsTable from "../components/ContactsTable";
// import ContactFormDialog from "../components/ContactsFormDialog";

import {
  getAllContacts,
  createContact,
  updateContact,
  deleteContact
} from "../services/contactService";

const ContactsPage = () => {
  const navigate = useNavigate();
  // State to hold list of contacts fetched from backend
  const [contacts, setContacts] = useState([]);
  // Loading spinner state during data fetch or operations
  const [loading, setLoading] = useState(false);
  
  // Holds error message string to display errors
  const [error, setError] = useState(null);
  // Holds success message string for user feedback
  const [successMessage, setSuccessMessage] = useState("");

  // Function to fetch contacts from backend API
  const fetchContacts = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const data = await getAllContacts(); // API call to fetch contacts
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

  
  
  // Navigate to create contact page
  const handleOpenCreate = () => {
    navigate("/contacts/create");
  };

  // Navigate to edit contact page with the selected contact ID
  const handleOpenEdit = (contact) => {
    console.log("Opening edit for contact:", contact);
    
    // Check if contact has the required ID field
    if (!contact || !contact.ContactID) {
      console.error("Contact or ContactID is missing:", contact);
      setError("Unable to edit contact - missing contact ID");
      return;
    }
    
    // Navigate to edit page
    navigate(`/contacts/edit/${contact.ContactID}`);
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

  // //Handles form submission for creating or updating a contact
  // const handleSave = async (contactData) => {
  //   setError(null);
  //   try {
  //     if (contactData.ContactID) {
  //       // Update existing contact
  //       await updateContact(contactData.ContactID, contactData);
  //       setSuccessMessage("Contact updated successfully.");
  //     } else {
  //       // Create new contact
  //       await createContact(contactData);
  //       setSuccessMessage("Contact created successfully.");
  //     }
  //     setDialogOpen(false);      // Close dialog after save
  //     await fetchContacts();     // Refresh contact list
  //   } catch (err) {
  //     setError("Failed to save contact. Please try again."); // Show error on failure
  //   }
  // };

  
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

    
    </Box>
  );

  
};



export default ContactsPage;
