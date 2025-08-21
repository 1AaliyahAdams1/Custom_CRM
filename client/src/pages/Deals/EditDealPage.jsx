import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Skeleton
} from '@mui/material';
import { ArrowBack, Save, Clear } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import theme from "../../components/Theme";
import SmartDropdown from '../../components/SmartDropdown';
import { fetchDealById, updateDeal } from "../../services/dealService";
import { dealStageService } from '../../services/dropdownServices';
import { getAllAccounts } from '../../services/accountService';

const EditDealPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    DealID: "",
    AccountID: "",
    DealStageID: "",
    DealName: "",
    Value: "",
    CloseDate: "",
    Probability: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const loadDeal = async () => {
      if (!id) return setError("No deal ID provided");

      try {
        const response = await fetchDealById(id);
        const dealData = response.data;
        setFormData({
          DealID: dealData.DealID || "",
          AccountID: dealData.AccountID || "",
          DealStageID: dealData.DealStageID || "",
          DealName: dealData.DealName || "",
          Value: dealData.Value || "",
          CloseDate: dealData.CloseDate || "",
          Probability: dealData.Probability || "",
        });
      } catch {
        setError("Failed to load deal data");
      } finally {
        setLoading(false);
      }
    };
    loadDeal();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateDeal(id, formData);
      setSuccessMessage("Deal updated successfully!");
      setTimeout(() => navigate("/deals"), 1500);
    } catch {
      setError("Failed to update deal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', minHeight: '100vh', p: 3, backgroundColor: '#fafafa' }}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {loading ? (
            <Box sx={{ p: 3 }}>
              <Skeleton variant="rectangular" width="100%" height={400} />
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Edit Deal</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(-1)}>Back</Button>
                  <Button variant="outlined" startIcon={<Clear />} onClick={() => navigate("/deals")} disabled={saving}>Cancel</Button>
                  <Button variant="contained" startIcon={saving ? <CircularProgress size={20} /> : <Save />} onClick={handleSubmit} disabled={saving}>
                    {saving ? 'Updating...' : 'Update Deal'}
                  </Button>
                </Box>
              </Box>

              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
              {successMessage && <Alert severity="success" sx={{ mb: 3 }}>{successMessage}</Alert>}

              <Paper elevation={0} sx={{ p: 3 }}>
                <form onSubmit={handleSubmit}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Deal ID"
                      name="DealID"
                      value={formData.DealID}
                      onChange={handleInputChange}
                      disabled={saving}
                    />

                    <SmartDropdown
                      label="Account"
                      name="AccountID"
                      value={formData.AccountID}
                      onChange={handleInputChange}
                      service={{ getAll: async () => (await getAllAccounts()).data }}
                      displayField="AccountName"
                      valueField="AccountID"
                      disabled={saving}
                    />

                    <SmartDropdown
                      label="Deal Stage"
                      name="DealStageID"
                      value={formData.DealStageID}
                      onChange={handleInputChange}
                      service={dealStageService}
                      displayField="StageName"
                      valueField="DealStageID"
                      disabled={saving}
                    />

                    <TextField
                      fullWidth
                      label="Deal Name"
                      name="DealName"
                      value={formData.DealName}
                      onChange={handleInputChange}
                      disabled={saving}
                    />

                    <TextField
                      fullWidth
                      label="Value"
                      name="Value"
                      type="number"
                      value={formData.Value}
                      onChange={handleInputChange}
                      disabled={saving}
                    />

                    <TextField
                      fullWidth
                      label="Close Date"
                      name="CloseDate"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={formData.CloseDate}
                      onChange={handleInputChange}
                      disabled={saving}
                    />

                    <TextField
                      fullWidth
                      label="Probability (%)"
                      name="Probability"
                      type="number"
                      value={formData.Probability}
                      onChange={handleInputChange}
                      disabled={saving}
                    />
                  </Box>
                </form>
              </Paper>
            </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default EditDealPage;
