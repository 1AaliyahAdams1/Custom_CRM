import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Alert } from "@mui/material";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";
import NotesPopup from "../../components/NotesComponent";
import AttachmentsPopup from "../../components/AttachmentsComponent";
import { getAllContacts, getContactDetails, updateContact, deactivateContact } from "../../services/contactService";
import { getAllAccounts } from "../../services/accountService";
import {
  cityService,
  industryService,
  countryService,
  stateProvinceService,
  jobTitleService
} from '../../services/dropdownServices';

// Modular validation function for contacts
const validateContactField = (fieldName, value) => {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    // Only first_name and surname are required for display, WorkEmail is essential
    const requiredFields = ['first_name', 'surname'];
    if (requiredFields.includes(fieldName)) {
      return `${fieldName.replace('_', ' ')} is required`;
    }
    return null; // No validation for empty optional fields
  }

  switch (fieldName) {
    case 'WorkEmail':
    case 'PersonalEmail':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) {
        return 'Invalid email format';
      }
      break;

    case 'WorkPhone':
    case 'MobilePhone':
    case 'HomePhone':
      const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,20}$/;
      if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
        return 'Invalid phone number - Phone number requires at least 8 numbers';
      }
      break;

    case 'first_name':
    case 'surname':
      if (value.trim().length < 2) {
        return `${fieldName.replace('_', ' ')} must be at least 2 characters`;
      } else if (value.trim().length > 100) {
        return `${fieldName.replace('_', ' ')} must be 100 characters or less`;
      }
      break;

    case 'middle_name':
      if (value.trim().length > 100) {
        return 'Middle name must be 100 characters or less';
      }
      break;

    case 'street_address1':
    case 'street_address2':
    case 'street_address3':
      if (value.trim().length > 255) {
        return 'Address must be 255 characters or less';
      }
      break;

    case 'postal_code':
      if (value.trim().length > 31) {
        return 'Postal code must be 31 characters or less';
      }
      break;
  }

  return null; // No error
};

// Validate entire contact data
const validateContactData = (formData) => {
  const errors = [];
  const fieldsToValidate = [
    'first_name', 'surname', 'middle_name', 'WorkEmail', 'PersonalEmail', 
    'WorkPhone', 'MobilePhone', 'HomePhone', 'street_address1', 'street_address2', 
    'street_address3', 'postal_code'
  ];

  fieldsToValidate.forEach(field => {
    const error = validateContactField(field, formData[field]);
    if (error) {
      errors.push(error);
    }
  });

  return errors;
};

const contactMainFields = [
  { 
    key: "first_name", 
    label: "First Name", 
    required: true, 
    width: { xs: 12, md: 3 },
    validate: (value) => validateContactField("first_name", value)
  },
  { 
    key: "middle_name", 
    label: "Middle Name", 
    width: { xs: 12, md: 3 },
    validate: (value) => validateContactField("middle_name", value)
  },
  { 
    key: "surname", 
    label: "Last Name", 
    required: true, 
    width: { xs: 12, md: 3 },
    validate: (value) => validateContactField("surname", value)
  },
  { 
    key: "JobTitleID", 
    label: "Job Title", 
    type: "dropdown", 
    service: jobTitleService, 
    displayField: "JobTitleName", 
    valueField: "JobTitleID", 
    width: { xs: 12, md: 3 } 
  },
  { 
    key: "WorkEmail", 
    label: "Work Email", 
    type: "email", 
    width: { xs: 12, md: 6 },
    validate: (value) => validateContactField("WorkEmail", value)
  },
  { 
    key: "PersonalEmail", 
    label: "Personal Email", 
    type: "email", 
    width: { xs: 12, md: 6 },
    validate: (value) => validateContactField("PersonalEmail", value)
  },
  { 
    key: "WorkPhone", 
    label: "Work Phone", 
    type: "tel", 
    width: { xs: 12, md: 4 },
    validate: (value) => validateContactField("WorkPhone", value)
  },
  { 
    key: "MobilePhone", 
    label: "Mobile Phone", 
    type: "tel", 
    width: { xs: 12, md: 4 },
    validate: (value) => validateContactField("MobilePhone", value)
  },
  { 
    key: "HomePhone", 
    label: "Home Phone", 
    type: "tel", 
    width: { xs: 12, md: 4 },
    validate: (value) => validateContactField("HomePhone", value)
  },
  { 
    key: "street_address1", 
    label: "Street Address", 
    type: "textarea", 
    rows: 2, 
    width: { xs: 12, md: 6 },
    validate: (value) => validateContactField("street_address1", value)
  },
  { 
    key: "street_address2", 
    label: "Street Address 2", 
    width: { xs: 12, md: 6 },
    validate: (value) => validateContactField("street_address2", value)
  },
  { 
    key: "street_address3", 
    label: "Street Address 3", 
    width: { xs: 12, md: 6 },
    validate: (value) => validateContactField("street_address3", value)
  },
  { 
    key: "postal_code", 
    label: "Postal Code", 
    width: { xs: 12, md: 6 },
    validate: (value) => validateContactField("postal_code", value)
  },
  { 
    key: "CityID", 
    label: "City", 
    type: "dropdown", 
    service: cityService, 
    displayField: "CityName", 
    valueField: "CityID", 
    width: { xs: 12, md: 4 } 
  },
  { 
    key: "CountryID", 
    label: "Country", 
    type: "dropdown", 
    service: countryService, 
    displayField: "CountryName", 
    valueField: "CountryID", 
    width: { xs: 12, md: 4 } 
  },
  { 
    key: "StateProvinceID", 
    label: "State/Province", 
    type: "dropdown", 
    service: stateProvinceService, 
    displayField: "StateProvince_Name", 
    valueField: "StateProvinceID", 
    width: { xs: 12, md: 4 } 
  },
  { key: "Active", label: "Active", type: "boolean", width: { xs: 12, md: 6 } },
];

export default function ContactDetailsForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [attachmentsPopupOpen, setAttachmentsPopupOpen] = useState(false);

  useEffect(() => {
    const loadContact = async () => {
      if (!id) {
        setError("No contact ID provided in the route.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getContactDetails(id);
        console.log("Debug: getContactDetails response:", data);

        const contactData = data?.data || data;
        if (!contactData) {
          throw new Error("Contact not found");
        }

        setContact(contactData);
      } catch (err) {
        console.error("Error loading contact:", err);
        setError(err.message || "Failed to load contact");
      } finally {
        setLoading(false);
      }
    };

    loadContact();
  }, [id]);

  const handleSave = async (formData) => {
    try {
      // Validate before save but don't clear form data on validation error
      const validationErrors = validateContactData(formData);
      
      if (validationErrors.length > 0) {
        setError(`Please fix the following errors:\n• ${validationErrors.join('\n• ')}`);
        // Don't update contact state here - keep the form data intact
        return false;
      }

      console.log("Debug: Saving contact:", formData);
      setError(null);
      
      // Only update contact state after successful validation and save
      await updateContact(id, formData);
      setContact(formData);
      setSuccessMessage("Contact updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
      return true;
    } catch (err) {
      console.error("Error saving contact:", err);
      
      // Don't update contact state on error - keep the form data intact
      if (err.isValidation) {
        setError(err.message);
      } else if (err.response?.status === 409) {
        setError('Contact with this information already exists');
      } else if (err.response?.status === 400) {
        setError(err.response.data?.error || 'Invalid data provided');
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later');
      } else {
        setError('Failed to save contact. Please try again.');
      }
      return false;
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;
    
    try {
      setError(null);
      await deactivateContact(id);
      setSuccessMessage("Contact deleted successfully!");
      setTimeout(() => navigate("/contacts"), 1500);
    } catch (err) {
      console.error("Error deleting contact:", err);
      setError(err.message || "Failed to delete contact.");
    }
  };

  const handleBack = () => navigate("/contacts");
  const handleAddNote = () => setNotesPopupOpen(true);
  const handleAddAttachment = () => setAttachmentsPopupOpen(true);

  if (loading) return <Box>Loading contact details...</Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!contact) return <Alert severity="warning">Contact not found.</Alert>;

  const getContactDisplayName = (c) =>
    [c.Title, c.first_name, c.middle_name, c.surname].filter(Boolean).join(" ") || `Contact #${c.ContactID}`;

  // Header chips
  const headerChips = [];
  if (contact) {
    headerChips.push({ 
      label: contact.Active ? "Active" : "Inactive", 
      color: contact.Active ? "#10b981" : "#6b7280", 
      textColor: "#fff" 
    });
    
    if (contact.JobTitleName) {
      headerChips.push({ 
        label: contact.JobTitleName, 
        color: "#3b82f6", 
        textColor: "#fff" 
      });
    }
    
    if (contact.CityName || contact.CountryName) {
      headerChips.push({ 
        label: [contact.CityName, contact.CountryName].filter(Boolean).join(", "), 
        color: "#6b7280", 
        textColor: "#fff" 
      });
    }
  }

  return (
    <Box>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      <UniversalDetailView
        title={getContactDisplayName(contact)}
        subtitle={contact?.ContactID ? `Contact ID: ${contact.ContactID}` : undefined}
        item={contact}
        mainFields={contactMainFields}
        onBack={handleBack}
        onSave={handleSave}
        onDelete={handleDelete}
        onAddNote={handleAddNote}
        onAddAttachment={handleAddAttachment}
        entityType="contact"
        headerChips={headerChips}
        relatedTabs={[]} // Add related tabs if needed
      />

      <NotesPopup 
        open={notesPopupOpen} 
        onClose={() => setNotesPopupOpen(false)} 
        entityType="contact" 
        entityId={contact?.ContactID} 
      />
      <AttachmentsPopup 
        open={attachmentsPopupOpen} 
        onClose={() => setAttachmentsPopupOpen(false)} 
        entityType="contact" 
        entityId={contact?.ContactID} 
      />
    </Box>
  );
}