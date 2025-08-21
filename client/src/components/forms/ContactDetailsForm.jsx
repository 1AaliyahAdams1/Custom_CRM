import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Tabs, Tab, Alert, Typography } from "@mui/material";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";
import { getContactDetails, updateContact } from "../../services/contactService";

const contactMainFields = [
  { key: "Title", label: "Title", type: "select", options: ["Mr.", "Ms.", "Mrs.", "Dr.", "Prof."], width: { xs: 12, md: 3 } },
  { key: "first_name", label: "First Name", required: true, width: { xs: 12, md: 3 } },
  { key: "middle_name", label: "Middle Name", width: { xs: 12, md: 3 } },
  { key: "surname", label: "Last Name", required: true, width: { xs: 12, md: 3 } },
  { key: "JobTitleName", label: "Job Title", type: "select", options: ["CEO", "CTO", "CFO", "Manager", "Director", "VP", "Senior Manager", "Team Lead", "Developer", "Analyst", "Consultant", "Coordinator"] },
  { key: "department", label: "Department", type: "select", options: ["Sales", "Marketing", "Engineering", "HR", "Finance", "Operations", "Customer Service", "Legal", "IT", "R&D"] },
  { key: "WorkEmail", label: "Work Email", type: "email", required: true },
  { key: "PersonalEmail", label: "Personal Email", type: "email" },
  { key: "WorkPhone", label: "Work Phone", type: "tel" },
  { key: "MobilePhone", label: "Mobile Phone", type: "tel" },
  { key: "HomePhone", label: "Home Phone", type: "tel" },
  { key: "street_address1", label: "Street Address", type: "textarea", rows: 2 },
  { key: "street_address2", label: "Street Address 2" },
  { key: "street_address3", label: "Street Address 3" },
  { key: "postal_code", label: "Postal Code" },
  { key: "CityName", label: "City", type: "select", options: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"] },
  { key: "CountryName", label: "Country", type: "select", options: ["USA", "Canada", "UK", "Australia", "Germany", "France", "India"] },
  { key: "StateProvinceName", label: "State/Province", type: "select", options: ["California", "Texas", "Florida", "New York", "Illinois", "Pennsylvania", "Ohio", "Georgia", "North Carolina", "Michigan"] },
  { key: "status", label: "Status", type: "select", options: ["Active", "Inactive", "Lead", "Customer", "Prospect"] },
  { key: "Active", label: "Active", type: "boolean" },
];

export default function ContactDetailsForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // ✅ matches your route `/contacts/:id`

  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    console.log("🔍 Debug: useParams() =", { id });

    const loadContact = async () => {
      if (!id) {
        setError("No contact ID provided in the route.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getContactDetails(id);
        console.log("Debug: getContactDetails response:", data);

        setContact(data?.data || data || null);
      } catch (err) {
        console.error("Error loading contact:", err);
        setError("Failed to load contact");
      } finally {
        setLoading(false);
      }
    };

    loadContact();
  }, [id]);

  const handleSave = async (formData) => {
    try {
      console.log("Debug: Saving contact:", formData);
      setContact(formData);
      await updateContact(id, formData);
      setSuccessMessage("Contact updated successfully!");
    } catch (err) {
      console.error("Error saving contact:", err);
      setError("Failed to save contact.");
    }
  };

  if (loading) return <Box>Loading contact details...</Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!contact) return <Alert severity="warning">Contact not found.</Alert>;

  const getContactDisplayName = (c) =>
    [c.Title, c.first_name, c.middle_name, c.surname].filter(Boolean).join(" ") || `Contact #${c.ContactID}`;

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
        onSave={handleSave}
        entityType="contact"
      />
    </Box>
  );
}
