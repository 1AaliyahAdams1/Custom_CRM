import React, { useState, useEffect, useMemo } from 'react';
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
import { useTheme } from '@mui/material/styles';
import SmartDropdown from '../../components/SmartDropdown';
import { fetchDealById, updateDeal } from "../../services/dealService";
import { dealStageService } from '../../services/dropdownServices';
import { getAllAccounts } from '../../services/accountService';
import { getAllCurrencies } from '../../services/currencyService';

const EditDealPage = () => {
  const theme = useTheme();
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
    CurrencyID: "",
  });
  const [accounts, setAccounts] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Memoized function to get account name from AccountID
  const accountName = useMemo(() => {
    // Add null checks and ensure accounts is an array
    if (!Array.isArray(accounts) || accounts.length === 0 || !formData.AccountID) {
      return 'No account selected';
    }
    const account = accounts.find(acc => acc.AccountID === formData.AccountID);
    return account ? account.AccountName : 'Unknown Account';
  }, [accounts, formData.AccountID]);

  // Service wrapper for currency dropdown
  const currencyService = {
    getAll: async () => {
      try {
        const response = await getAllCurrencies();
        return response.data || response;
      } catch {
        return [];
      }
    },
  };

  useEffect(() => {
    const loadDealAndAccounts = async () => {
      if (!id) {
        setError("No deal ID provided");
        setLoading(false);
        return;
      }

      try {
        // Fetch both deal data and accounts data
        const [dealResponse, accountsResponse] = await Promise.all([
          fetchDealById(id),
          getAllAccounts()
        ]);

        const dealData = dealResponse.data;
        
        // Debug: Log the deal data to see what's being returned
        console.log('Deal Data from API:', dealData);
        console.log('DealName:', dealData.DealName);
        console.log('Probability:', dealData.Probability);
        console.log('CurrencyID:', dealData.CurrencyID);
        
        // Format the CloseDate to YYYY-MM-DD for the date input
        let formattedCloseDate = dealData.CloseDate || "";
        if (formattedCloseDate) {
          formattedCloseDate = formattedCloseDate.split('T')[0];
        }

        setFormData({
          DealID: dealData.DealID || "",
          AccountID: dealData.AccountID || "",
          DealStageID: dealData.DealStageID || "",
          DealName: dealData.DealName || "",
          Value: dealData.Value || "",
          CloseDate: formattedCloseDate,
          Probability: dealData.Probability || "",
          CurrencyID: dealData.CurrencyID || "",
        });

        console.log('Form Data after setting:', {
          DealName: dealData.DealName,
          Probability: dealData.Probability,
          CurrencyID: dealData.CurrencyID
        });

        // Ensure we set accounts as an array
        const accountsData = accountsResponse?.data || accountsResponse || [];
        setAccounts(Array.isArray(accountsData) ? accountsData : []);
      } catch (err) {
        console.error("Error loading deal:", err);
        setError("Failed to load deal data");
      } finally {
        setLoading(false);
      }
    };
    loadDealAndAccounts();
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
    } catch (err) {
      console.error("Error updating deal:", err);
      setError("Failed to update deal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{
      width: '100%',
      minHeight: '100vh',
      p: 3,
      backgroundColor: theme.palette.background.default
    }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {loading ? (
          <Box sx={{ p: 3 }}>
            <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={400} />
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" sx={{
                fontWeight: 600,
                color: theme.palette.text.primary
              }}>
                Edit Deal
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(-1)}>Back</Button>
                <Button variant="outlined" startIcon={<Clear />} onClick={() => navigate("/deals")} disabled={saving}>Cancel</Button>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {saving ? 'Updating...' : 'Update Deal'}
                </Button>
              </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
            {successMessage && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>{successMessage}</Alert>}

            <Paper elevation={0} sx={{
              p: 3,
              backgroundColor: theme.palette.background.paper
            }}>
              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Read-only Account field */}
                  <Box sx={{
                    p: 2,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f8f9fa',
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`
                  }}>
                    <Typography variant="caption" sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 500,
                      display: 'block',
                      mb: 0.5
                    }}>
                      Account
                    </Typography>
                    <Typography variant="body1" sx={{
                      fontWeight: 500,
                      color: theme.palette.text.primary
                    }}>
                      {accountName}
                    </Typography>
                  </Box>

                  {/* Read-only Deal Name field */}
                  <Box sx={{
                    p: 2,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f8f9fa',
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`
                  }}>
                    <Typography variant="caption" sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 500,
                      display: 'block',
                      mb: 0.5
                    }}>
                      Deal Name
                    </Typography>
                    <Typography variant="body1" sx={{
                      fontWeight: 500,
                      color: theme.palette.text.primary
                    }}>
                      {formData.DealName || 'No deal name'}
                    </Typography>
                  </Box>

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
                    label="Value"
                    name="Value"
                    type="number"
                    value={formData.Value}
                    onChange={handleInputChange}
                    disabled={saving}
                  />

                  <SmartDropdown
                    label="Currency"
                    name="CurrencyID"
                    value={formData.CurrencyID}
                    onChange={handleInputChange}
                    service={currencyService}
                    displayField="LocalName"
                    valueField="CurrencyID"
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
  );
};

export default EditDealPage;