import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ContactsPage from "../../pages/ContactsPage";
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
        // Fetch all contacts for C-level users
        const allContacts = await getAllContacts();
        data = allContacts;
      } else if (isSalesRep && userId) {
        // Fetch contacts assigned to this Sales Rep
        const userContacts = await fetchContactsByUser(userId);
        data = userContacts;
      } else {
        // No matching role, show empty list or customize as needed
        data = [];
      }

      // Add full name to each contact
      const processedData = data.map(contact => ({
        ...contact,
        PersonFullName: [
          contact.first_name || '',
          contact.middle_name || '',
          contact.surname || ''
        ].filter(part => part.trim() !== '').join(' ')
      }));

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
    return contacts.filter((contact) => {
      const matchesSearch =
        (contact.ContactID && contact.ContactID.toString().includes(searchTerm)) ||
        (contact.AccountID && contact.AccountID.toString().includes(searchTerm)) ||
        (contact.PersonID && contact.PersonID.toString().includes(searchTerm)) ||
        (contact.WorkEmail && contact.WorkEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contact.WorkPhone && contact.WorkPhone.includes(searchTerm)) ||
        (contact.JobTitleID && contact.JobTitleID.toString().includes(searchTerm));

      const matchesEmploymentStatus = !employmentStatusFilter ||
        (employmentStatusFilter === 'employed' && contact.Still_employed === true) ||
        (employmentStatusFilter === 'not_employed' && contact.Still_employed === false) ||
        (employmentStatusFilter === 'unknown' && contact.Still_employed == null);

      return matchesSearch && matchesEmploymentStatus;
    });
  }, [contacts, searchTerm, employmentStatusFilter]);

  const handleSelectClick = (event, id) => {
    // ... your existing logic
  };

  const handleSelectAllClick = (event) => {
    // ... your existing logic
  };

  const handleEdit = (contact) => {
    navigate(`/contacts/edit/${contact.ContactID}`);
  };

  const handleOpenCreate = () => {
    navigate("/contacts/create");
  };

  const handleView = (contact) => {
    navigate(`/contacts/${contact.ContactID}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setEmploymentStatusFilter('');
  };

  const handleDeactivate = async (id) => {
    // ... your existing logic
  };

  const handleAddNote = (contact) => {
    //navigate(`/contacts/${contact.ContactID}/add-note`);
  };

  const handleAddAttachment = (contact) => {
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
      contacts={contacts}
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
