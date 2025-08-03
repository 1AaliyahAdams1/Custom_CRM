//PAGE : Main Contacts Page
//Combines the UI components onto one page

//IMPORTS
import React, { useEffect, useState } from "react";


// Syncfusion component imports
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { MessageComponent } from "@syncfusion/ej2-react-notifications";

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

  // // Opens the dialog for adding a new contact
  // const handleOpenCreate = () => {
  //   setSelectedContact(null); // Clear selected contact (create mode)
  //   setError(null);           // Clear any errors
  //   setDialogOpen(true);      // Open dialog
  // };
  
  // Navigate to create contact page
  const handleOpenCreate = () => {
    navigate("/contacts/create");
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

  //Handles form submission for creating or updating a contact
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

  // Render the ContactsPage component
  return (
    <div style={{ padding: '24px' }}>
      {/* Page Title */}
      <h1 style={{ 
        fontSize: '2.125rem', 
        fontWeight: 400, 
        lineHeight: 1.235, 
        marginBottom: '16px',
        margin: '0 0 16px 0'
      }}>
        Contacts
      </h1>

      {/* Display error alert if any error */}
      {error && (
        <div style={{ marginBottom: '16px' }}>
          <MessageComponent 
            severity="Error" 
            showCloseIcon={true}
            closed={() => setError(null)}
          >
            {error}
          </MessageComponent>
        </div>
      )}

      {/* Display success alert on successful operation */}
      {successMessage && (
        <div style={{ marginBottom: '16px' }}>
          <MessageComponent 
            severity="Success" 
            showCloseIcon={true}
            closed={() => setSuccessMessage("")}
          >
            {successMessage}
          </MessageComponent>
        </div>
      )}

      {/* Button to add a new contact */}
      <div style={{ marginBottom: '16px' }}>
        <ButtonComponent 
          isPrimary={true}
          onClick={handleOpenCreate}
          disabled={loading}  // Disable button while loading
        >
          Add Contact
        </ButtonComponent>
      </div>

      {/* Show loading spinner or accounts table depending on loading state */}
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: '32px' 
        }}>
          {/* Simple CSS loading spinner since CircularProgress needs a different approach */}
          <div className="loading-spinner" style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 2s linear infinite'
          }}></div>
          <style>
            {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      ) : (
        <ContactsTable
          contacts={contacts}
          onEdit={handleOpenEdit}   // Edit button callback
          onDelete={handleDelete}    // Delete button callback
        />
      )}

      {/* Dialog for adding/editing an contact */}
      <ContactFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        contact={selectedContact}
        onSubmit={handleSave}
      />
    </div>
  );

  
};


export default ContactsPage;
