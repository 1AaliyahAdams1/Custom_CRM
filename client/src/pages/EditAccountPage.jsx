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
import { fetchAccountById, updateAccount } from "../services/accountService";

const EditAccountPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get account ID from URL params
  
  const [formData, setFormData] = useState({
    AccountName: "",
    CityID: "",
    street_address1: "",
    street_address2: "",
    street_address3: "",
    postal_code: "",
    PrimaryPhone: "",
    IndustryID: "",
    Website: "",
    fax: "",
    email: "",
    number_of_employees: "",
    annual_revenue: "",
    number_of_venues: "",
    number_of_releases: "",
    number_of_events_anually: "",
    ParentAccount: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch account data when component mounts
  useEffect(() => {
    const loadAccount = async () => {
      if (!id) {
        setError("No account ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetchAccountById(id);
        
        // Populate form with fetched data
        const accountData = response.data;
        setFormData({
          AccountName: accountData.AccountName || "",
          CityID: accountData.CityID || "",
          street_address1: accountData.street_address1 || "",
          street_address2: accountData.street_address2 || "",
          street_address3: accountData.street_address3 || "",
          postal_code: accountData.postal_code || "",
          PrimaryPhone: accountData.PrimaryPhone || "",
          IndustryID: accountData.IndustryID || "",
          Website: accountData.Website || "",
          fax: accountData.fax || "",
          email: accountData.email || "",
          number_of_employees: accountData.number_of_employees || "",
          annual_revenue: accountData.annual_revenue || "",
          number_of_venues: accountData.number_of_venues || "",
          number_of_releases: accountData.number_of_releases || "",
          number_of_events_anually: accountData.number_of_events_anually || "",
          ParentAccount: accountData.ParentAccount || "",
        });
      } catch (error) {
        console.error("Failed to fetch account:", error);
        setError("Failed to load account data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadAccount();
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.AccountName.trim()) {
      setError("Account name is required");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      // Add AccountID to formData for the update
      const updateData = {
        ...formData,
        AccountID: id
      };
      
      await updateAccount(id, updateData);
      setSuccessMessage("Account updated successfully!");
      
      // Navigate back to accounts page after a short delay
      setTimeout(() => {
        navigate("/accounts");
      }, 1500);
      
    } catch (error) {
      console.error("Failed to update account:", error);
      setError("Failed to update account. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel - navigate back to accounts page
  const handleCancel = () => {
    navigate("/accounts");
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
        Edit Deal
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
          <Grid container spacing={3}>
            {/* Account Name - Required */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Account Name"
                name="AccountName"
                value={formData.AccountName}
                onChange={handleInputChange}
                required
                variant="outlined"
              />
            </Grid>

            {/* City ID */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City ID"
                name="CityID"
                value={formData.CityID}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>

            {/* Street Address 1 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address 1"
                name="street_address1"
                value={formData.street_address1}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>

            {/* Street Address 2 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address 2"
                name="street_address2"
                value={formData.street_address2}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>

            {/* Street Address 3 */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address 3"
                name="street_address3"
                value={formData.street_address3}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>

            {/* Postal Code */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                variant="outlined"
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

            {/* Industry ID */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Industry ID"
                name="IndustryID"
                value={formData.IndustryID}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>

            {/* Website */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Website"
                name="Website"
                value={formData.Website}
                onChange={handleInputChange}
                variant="outlined"
                type="url"
              />
            </Grid>

            {/* Fax */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fax"
                name="fax"
                value={formData.fax}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                variant="outlined"
                type="email"
              />
            </Grid>

            {/* Number of Employees */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Employees"
                name="number_of_employees"
                value={formData.number_of_employees}
                onChange={handleInputChange}
                variant="outlined"
                type="number"
              />
            </Grid>

            {/* Annual Revenue */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Annual Revenue"
                name="annual_revenue"
                value={formData.annual_revenue}
                onChange={handleInputChange}
                variant="outlined"
                type="number"
              />
            </Grid>

            {/* Number of Venues */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Venues"
                name="number_of_venues"
                value={formData.number_of_venues}
                onChange={handleInputChange}
                variant="outlined"
                type="number"
              />
            </Grid>

            {/* Number of Releases */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Releases"
                name="number_of_releases"
                value={formData.number_of_releases}
                onChange={handleInputChange}
                variant="outlined"
                type="number"
              />
            </Grid>

            {/* Number of Events Annually */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Events Annually"
                name="number_of_events_anually"
                value={formData.number_of_events_anually}
                onChange={handleInputChange}
                variant="outlined"
                type="number"
              />
            </Grid>

            {/* Parent Account */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Parent Account"
                name="ParentAccount"
                value={formData.ParentAccount}
                onChange={handleInputChange}
                variant="outlined"
              />
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
                  {saving ? "Updating..." : "Update Account"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default EditAccountPage;