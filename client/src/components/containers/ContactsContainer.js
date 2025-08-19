import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ContactsPage from "../../pages/Contacts/ContactsPage";
import {
  getAllContacts,
  fetchContactsByUser,
  deactivateContact,
} from "../../services/contactService";

const ContactsContainer = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [employmentStatusFilter, setEmploymentStatusFilter] = useState('');
  const [refreshFlag, setRefreshFlag] = useState(false);

  // Get user and roles from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const roles = Array.isArray(storedUser.roles) ? storedUser.roles : [];
  const userId = storedUser.UserID || storedUser.id || null;
  
  const isCLevel = roles.includes("C-level");
  const isSalesRep = roles.includes("Sales Representative");

  // Fetch contacts based on role
  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      let data = [];

      if (isCLevel) {
        console.log("Fetching all contacts for C-level user...");
        const allContacts = await getAllContacts();
        console.log("getAllContacts() returned:", allContacts);
        data = allContacts;
      } else if (isSalesRep && userId) {
        console.log("Fetching contacts for Sales Rep user:", userId);
        const userContacts = await fetchContactsByUser(userId);
        console.log("fetchContactsByUser() returned:", userContacts);
        data = userContacts;
      } else {
        console.log("No matching role or user ID");
        data = [];
      }

      console.log("Raw contacts data from API:", data);
      console.log("Sample contact (first item):", data[0]);

      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error("API did not return an array:", data);
        throw new Error("Invalid response format - expected array");
      }

      // Add full name to each contact
      const processedData = data.map((contact, index) => {
        console.log(`Processing contact ${index}:`, contact);
        console.log(`ContactID for contact ${index}:`, contact.ContactID, "Type:", typeof contact.ContactID);
        
        if (!contact.ContactID) {
          console.warn(`Contact ${index} missing ContactID:`, contact);
        }

        return {
          ...contact,
          PersonFullName: [
            contact.first_name || '',
            contact.middle_name || '',
            contact.surname || ''
          ].filter(part => part.trim() !== '').join(' ')
        };
      });

      console.log("Processed contacts data:", processedData);
      console.log("First processed contact ContactID:", processedData[0]?.ContactID);
      setContacts(processedData);
    } catch (err) {
      console.error("Failed to load contacts:", err);
      setError("Failed to load contacts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // filteredContacts and handlers from your original code remain here

  const filteredContacts = useMemo(() => {
    console.log("Filtering contacts. Raw contacts:", contacts);
    console.log("Search term:", searchTerm, "Employment filter:", employmentStatusFilter);
    
    const filtered = contacts.filter((contact) => {
      console.log("Filtering contact:", contact, "ContactID:", contact.ContactID);
      
      const matchesSearch =
        (contact.ContactID && contact.ContactID.toString().includes(searchTerm)) ||
        (contact.AccountID && contact.AccountID.toString().includes(searchTerm)) ||
        (contact.PersonID && contact.PersonID.toString().includes(searchTerm)) ||
        (contact.WorkEmail && contact.WorkEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contact.WorkPhone && contact.WorkPhone.includes(searchTerm)) ||
        (contact.JobTitleID && contact.JobTitleID.toString().includes(searchTerm)) ||
        (contact.PersonFullName && contact.PersonFullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contact.AccountName && contact.AccountName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesEmploymentStatus = !employmentStatusFilter ||
        (employmentStatusFilter === 'employed' && contact.Still_employed === true) ||
        (employmentStatusFilter === 'not_employed' && contact.Still_employed === false) ||
        (employmentStatusFilter === 'unknown' && contact.Still_employed == null);

      const passes = matchesSearch && matchesEmploymentStatus;
      console.log("Contact", contact.ContactID, "passes filter:", passes);
      return passes;
    });
    
    console.log("Filtered contacts:", filtered);
    return filtered;
  }, [contacts, searchTerm, employmentStatusFilter]);

  const handleSelectClick = (event, id) => {
    // ... your existing logic
  };

  const handleSelectAllClick = (event) => {
    // ... your existing logic
  };

  const handleEdit = (contact) => {
    console.log("Editing contact:", contact);
    if (!contact.ContactID) {
      console.error("Cannot edit contact - missing ContactID:", contact);
      setError("Cannot edit contact - missing ID");
      return;
    }
    navigate(`/contacts/edit/${contact.ContactID}`);
  };

  const handleOpenCreate = () => {
    navigate("/contacts/create");
  };

  const handleView = (contact) => {
    console.log("Viewing contact:", contact);
    console.log("ContactID:", contact.ContactID, "Type:", typeof contact.ContactID);
    
    if (!contact.ContactID) {
      console.error("Cannot view contact - missing ContactID:", contact);
      setError("Cannot view contact - missing ID");
      return;
    }
    
    navigate(`/contacts/${contact.ContactID}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setEmploymentStatusFilter('');
  };

  useEffect(() => {
    fetchContacts();
  }, [refreshFlag]);

  const handleDeactivate = async (id) => {
    if (!id) {
      setError("Cannot delete contact - missing ID");
      return;
    }

    const confirm = window.confirm(
      "Are you sure you want to delete this contact? This will deactivate it."
    );
    if (!confirm) return;

    setError(null);
    try {
      await deactivateContact(id);
      setSuccessMessage("Contact deleted successfully.");
      setRefreshFlag((flag) => !flag);
    } catch (error) {
      console.error("Failed to delete contact:", error);
      setError("Failed to delete contact. Please try again.");
    }
  };

  const handleAddNote = (contact) => {
    if (!contact.ContactID) {
      console.error("Cannot add note - missing ContactID:", contact);
      return;
    }
    //navigate(`/contacts/${contact.ContactID}/add-note`);
  };

  const handleAddAttachment = (contact) => {
    if (!contact.ContactID) {
      console.error("Cannot add attachment - missing ContactID:", contact);
      return;
    }
    //navigate(`/contacts/${contact.ContactID}/add-attachment`);
  };

  const formatters = {
    CreatedAt: (value) => {
      if (!value) return "-";
      const date = new Date(value);
      if (isNaN(date)) return "-";
      return date.toLocaleDateString();
    },
  };

  return (
    <ContactsPage
      contacts={filteredContacts} 
      loading={loading}
      error={error}
      successMessage={successMessage}
      selected={selected}
      searchTerm={searchTerm}
      employmentStatusFilter={employmentStatusFilter}
      filteredContacts={filteredContacts}
      handleSelectClick={handleSelectClick}
      handleSelectAllClick={handleSelectAllClick}
      handleEdit={handleEdit}
      handleOpenCreate={handleOpenCreate}
      handleView={handleView}
      clearFilters={clearFilters}
      handleDeactivate={handleDeactivate}
      setSearchTerm={setSearchTerm}
      setEmploymentStatusFilter={setEmploymentStatusFilter}
      formatters={formatters}
      onAddNote={handleAddNote}
      onAddAttachment={handleAddAttachment}
    />
  );
};

export default ContactsContainer;