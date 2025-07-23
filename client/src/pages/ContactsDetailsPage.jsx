//PAGE : Contact Details
//Shows all details related to an individual contact

//IMPORTS
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import {
//   Card,
//   CardContent,
//   Typography,
//   Grid,
//   CircularProgress,
//   Button,
//   Box,
// } from "@mui/material";

// Syncfusion component imports
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
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

  /// Show loading spinner while fetching data
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <div className="e-spinner-pane">
          <div className="e-spinner-inner">
            <div className="e-spin-material"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error message if fetching failed
  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <span style={{ color: '#d32f2f', fontSize: '16px' }}>{error}</span>
      </div>
    );
  }

  // Show message if no contact found
  if (!contact) {
    return (
      <div style={{ padding: '20px' }}>
        <span style={{ fontSize: '16px' }}>No contact found.</span>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px' }}>
      {/* Back button navigates back to previous page */}
      <ButtonComponent 
        cssClass="e-outline" 
        content="← Back to Contacts"
        onClick={() => navigate(-1)}
        style={{ marginBottom: '24px' }}
      />

      {/* Card-style container using Syncfusion's design patterns */}
      <div className="e-card" style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}>
        {/* Contact header with ID */}
        <div className="e-card-header">
          <div className="e-card-header-title" style={{ 
            fontSize: '1.5rem', 
            fontWeight: '500', 
            marginBottom: '24px',
            color: '#333'
          }}>
            Contact #{contact.ContactID}
          </div>
        </div>

        {/* Card content */}
        <div className="e-card-content">
          {/* Grid layout with two columns */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '24px'
          }}>
            {/* Left column with main contact info */}
            <div>
              <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>Account:</strong> {contact.Account || "-"}
              </div>
              <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>Person Name:</strong> {contact.ContactName || "-"}
              </div>
              <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>Email:</strong> {contact.PrimaryEmail || "-"}
              </div>
              <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>Phone:</strong> {contact.PrimaryPhone || "-"}
              </div>
            </div>

            {/* Right column with additional info */}
            <div>
              <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>Position:</strong> {contact.Position || "-"}
              </div>
              <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>City:</strong> {contact.CityName || "-"}
              </div>
              <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>Country:</strong> {contact.CountryName || "-"}
              </div>
              <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>Created At:</strong> {formatDate(contact.CreatedAt)}
              </div>
              <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>Updated At:</strong> {formatDate(contact.UpdatedAt)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactsDetailsPage;
