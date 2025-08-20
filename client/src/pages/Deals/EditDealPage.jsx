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
import { fetchDealById, updateDeal } from "../../services/dealService";

const EditDealPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get deal ID from URL params
  
  const [formData, setFormData] = useState({
    DealID: "",
    AccountID: "",
    DealStageID: "",
    DealName: "",
    Value: "",
    CloseDate: "",
    Probability: "",
    CreatedAt: "",
    UpdatedAt: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch account data when component mounts
  useEffect(() => {
    const loadDeal = async () => {
      if (!id) {
        setError("No deal ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetchDealById(id);
        
        // Populate form with fetched data
        const dealData = response.data;
        setFormData({
          DealID: dealData.DealID || "",
          AccountID: dealData.AccountID || "",
          DealStageID: dealData.DealStageID || "",
          DealName: dealData.DealName || "",
          Value: dealData.Value || "",
          CloseDate: dealData.CloseDate || "",
          Probability: dealData.Probability || "",
          CreatedAt: dealData.CreatedAt|| "",
          UpdatedAt: dealData.UpdatedAt || "",
          
        });
      } catch (error) {
        console.error("Failed to fetch deal:", error);
        setError("Failed to load deal data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadDeal();
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
    if (!formData.DealName.trim()) {
      setError("Deal name is required");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      // Add dealID to formData for the update
      const updateData = {
        ...formData,
        DealID: id
      };
      
      await updateDeal(id, updateData);
      setSuccessMessage("Deal updated successfully!");
      
      // Navigate back to deals page after a short delay
      setTimeout(() => {
        navigate("/deals");
      }, 1500);
      
    } catch (error) {
      console.error("Failed to update deal:", error);
      setError("Failed to update deal. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel - navigate back to deals page
  const handleCancel = () => {
    navigate("/deals");
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
            {/* Deal Id- Required */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Deal ID"
                name="DealID"
                value={formData.DealID}
                onChange={handleInputChange}
                required
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

            {/* DealStageID */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Deal Stage ID"
                name="DealStageID"
                value={formData.DealStageID}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>

            {/* Deal Name */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Deal Name"
                name="DealName"
                value={formData.DealName}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>

            {/* Value */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Value"
                name="Value"
                value={formData.Value}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>

            {/* Close Date */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Close Date"
                name="CloseDate"
                value={formData.CloseDate}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>

            {/* Probability */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Probability"
                name="Probability"
                value={formData.Probability}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>

            {/* Created At
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Created At"
                name="CreatedAt"
                value={formData.CreatedAt}
                onChange={handleInputChange}
                variant="outlined"
                type ="datetime-local"
              />
            </Grid> */}

            {/* Updated At
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Updated At"
                name="UpdatedAt"
                value={formData.UpdatedAt}
                onChange={handleInputChange}
                variant="outlined"
               type="datetime-local"
              />
            </Grid> */}

            

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

export default EditDealPage;