import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Tabs, Tab, Alert, Typography } from "@mui/material";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";
import { updateContact } from "../../services/contactService";

const contactMainFields = [
  { key: "Title", label: "Title", type: "select", options: ["Mr.", "Ms.", "Mrs.", "Dr.", "Prof."], width: { xs: 12, md: 3 } },
  { key: "first_name", label: "First Name", required: true, width: { xs: 12, md: 3 } },
  { key: "middle_name", label: "Middle Name", width: { xs: 12, md: 3 } },
  { key: "surname", label: "Last Name", required: true, width: { xs: 12, md: 3 } },
  { key: "JobTitleName", label: "Job Title", type: "select", options: ["CEO","CTO","CFO","Manager","Director","VP","Senior Manager","Team Lead","Developer","Analyst","Consultant","Coordinator"] },
  { key: "department", label: "Department", type: "select", options: ["Sales","Marketing","Engineering","HR","Finance","Operations","Customer Service","Legal","IT","R&D"] },
  { key: "WorkEmail", label: "Work Email", type: "email", required: true },
  { key: "PersonalEmail", label: "Personal Email", type: "email" },
  { key: "WorkPhone", label: "Work Phone", type: "tel" },
  { key: "MobilePhone", label: "Mobile Phone", type: "tel" },
  { key: "HomePhone", label: "Home Phone", type: "tel" },
  { key: "street_address1", label: "Street Address", type: "textarea", rows: 2 },
  { key: "street_address2", label: "Street Address 2" },
  { key: "street_address3", label: "Street Address 3" },
  { key: "postal_code", label: "Postal Code" },
  { key: "CityName", label: "City", type: "select", options: ["New York","Los Angeles","Chicago","Houston","Phoenix","Philadelphia","San Antonio","San Diego","Dallas","San Jose"] },
  { key: "CountryName", label: "Country", type: "select", options: ["USA","Canada","UK","Australia","Germany","France","India"] },
  { key: "StateProvinceName", label: "State/Province", type: "select", options: ["California","Texas","Florida","New York","Illinois","Pennsylvania","Ohio","Georgia","North Carolina","Michigan"] },
  { key: "status", label: "Status", type: "select", options: ["Active","Inactive","Lead","Customer","Prospect"] },
  { key: "Active", label: "Active", type: "boolean" },
];

export default function ContactDetailsForm({ contacts = [] }) {
  const navigate = useNavigate();
  const [activeContactIndex, setActiveContactIndex] = useState(0);
  const [contactData, setContactData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      if (!Array.isArray(contacts)) throw new Error("Invalid contacts data");
      setContactData(contacts);
    } catch (err) {
      setError(err.message || "Failed to load contact(s)");
    } finally {
      setLoading(false);
    }
  }, [contacts]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleSave = async (formData, index) => {
    try {
      const updatedContacts = [...contactData];
      updatedContacts[index] = formData;
      setContactData(updatedContacts);
      await updateContact(formData.ContactID, formData);
      setSuccessMessage("Contact updated successfully!");
    } catch (err) {
      setError("Failed to save contact. Please try again.");
    }
  };

  const handleTabChange = (_, newIndex) => setActiveContactIndex(newIndex);

  if (loading) return <Typography>Loading contact details...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!contactData || !contactData.length) return <Alert severity="warning">No contact records found.</Alert>;

  const multipleContacts = contactData.length > 1;
  const currentContact = contactData[activeContactIndex];

  const getContactDisplayName = (contact) =>
    [contact.Title, contact.first_name, contact.middle_name, contact.surname].filter(Boolean).join(" ") || `Contact #${contact.ContactID}`;

  return (
    <Box>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      {multipleContacts && (
        <Tabs
          value={activeContactIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
        >
          {contactData.map((c, idx) => (
            <Tab key={idx} label={getContactDisplayName(c)} />
          ))}
        </Tabs>
      )}

      <UniversalDetailView
        title={getContactDisplayName(currentContact)}
        subtitle={currentContact?.ContactID ? `Contact ID: ${currentContact.ContactID}` : undefined}
        item={currentContact}
        mainFields={contactMainFields}
        onSave={(formData) => handleSave(formData, activeContactIndex)}
        entityType="contact"
        setFormData={(updatedData) => {
          const newContacts = [...contactData];
          newContacts[activeContactIndex] = updatedData; // reactive updates
          setContactData(newContacts);
        }}
      />
    </Box>
  );
}
