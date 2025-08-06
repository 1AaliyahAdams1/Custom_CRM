
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Grid,
} from "@mui/material";
import { getContactDetails, updateContact ,getContactsByAccountId} from "../services/contactService";

const EditContactPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get contact ID from URL params
  
  const [formData, setFormData] = useState({
    ContactID: "",
    AccountID: "",
    PersonID: "",
    Title: "",
    first_name: "",
    middle_name: "",
    surname: "",
    linkedin_link: "",
    personal_email: "",
    personal_mobile: "",
    PersonCityID: "",
    PersonStateProvinceID: "",
    Still_employed: false,
    JobTitleID: "",
    PrimaryEmail: "",
    PrimaryPhone: "",
    Position: "",
    isNewPerson: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch contact data when component mounts
  useEffect(() => {
    const loadContact = async () => {
      if (!id) {
        setError("No contact ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getContactsByAccountId(id);
        
        // Populate form with fetched data
        const contactData = response.data;
        setFormData({
          ContactID: contactData.ContactID || "",
          AccountID: contactData.AccountID || "",
          PersonID: contactData.PersonID || "",
          Title: contactData.Title || "",
          first_name: contactData.first_name || "",
          middle_name: contactData.middle_name || "",
          surname: contactData.surname || "",
          linkedin_link: contactData.linkedin_link || "",
          personal_email: contactData.personal_email || "",
          personal_mobile: contactData.personal_mobile || "",
          PersonCityID: contactData.PersonCityID || "",
          PersonStateProvinceID: contactData.PersonStateProvinceID || "",
          Still_employed: contactData.Still_employed || false,
          JobTitleID: contactData.JobTitleID || "",
          PrimaryEmail: contactData.PrimaryEmail || "",
          PrimaryPhone: contactData.PrimaryPhone || "",
          Position: contactData.Position || "",
          isNewPerson: contactData.isNewPerson || true,
        });
      } catch (error) {
        console.error("Failed to fetch contact:", error);
        setError("Failed to load contact data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadContact();
  }, [id]);

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.first_name.trim() || !formData.surname.trim()) {
      setError("First name and surname are required");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      // Add ContactID to formData for the update
      const updateData = {
        ...formData,
        ContactID: id
      };
      
      await updateContact(id, updateData);
      setSuccessMessage("Contact updated successfully!");
      
      // Navigate back to contacts page after a short delay
      setTimeout(() => {
        navigate("/contacts");
      }, 1500);
      
    } catch (error) {
      console.error("Failed to update contact:", error);
      setError("Failed to update contact. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel - navigate back to contacts page
  const handleCancel = () => {
    navigate("/contacts");
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Edit Contact
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Success Alert */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
           {/* Contact ID */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ContactID"
                name="ContactID"
                value={formData.ContactID}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
          {/* Account ID */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Account ID"
                name="AccountID"
                value={formData.AccountID}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>

            {/* Person ID */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Person ID"
                name="PersonID"
                value={formData.PersonID}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>

            {/* Person City ID */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Person City ID"
                name="PersonCityID"
                value={formData.PersonCityID}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>

            {/* Person State/Province ID */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Person State/Province ID"
                name="PersonStateProvinceID"
                value={formData.PersonStateProvinceID}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
          <Grid container spacing={3}>
            {/* Title */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Title"
                name="Title"
                value={formData.Title}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>

            {/* First Name - Required */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
                variant="outlined"
              />
            </Grid>

            {/* Middle Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Middle Name"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>

            {/* Surname - Required */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Surname"
                name="surname"
                value={formData.surname}
                onChange={handleInputChange}
                required
                variant="outlined"
              />
            </Grid>

            {/* Position */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Position"
                name="Position"
                value={formData.Position}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>

            {/* Job Title ID */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Job Title ID"
                name="JobTitleID"
                value={formData.JobTitleID}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>

            {/* Work Email */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="Work Email"
                value={formData.WorkEmail}
                onChange={handleInputChange}
                variant="outlined"
                type="email"
              />
            </Grid>

            {/* Personal Email */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Personal Email"
                name="personal_email"
                value={formData.personal_email}
                onChange={handleInputChange}
                variant="outlined"
                type="email"
              />
            </Grid>

            {/* Primary Phone */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Primary Phone"
                name="PrimaryPhone"
                value={formData.PrimaryPhone}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>

            {/* Personal Mobile */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Personal Mobile"
                name="personal_mobile"
                value={formData.personal_mobile}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>

            {/* LinkedIn Link */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="LinkedIn Profile"
                name="linkedin_link"
                value={formData.linkedin_link}
                onChange={handleInputChange}
                variant="outlined"
                type="url"
              />
            </Grid>

            

            {/* Still Employed Checkbox */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <input
                  type="checkbox"
                  id="Still_employed"
                  name="Still_employed"
                  checked={formData.Still_employed}
                  onChange={handleInputChange}
                  style={{ marginRight: '8px' }}
                />
                <label htmlFor="Still_employed">Still Employed</label>
              </Box>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end" mt={2}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : null}
                >
                  {saving ? "Updating..." : "Update Contact"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default EditContactPage;
