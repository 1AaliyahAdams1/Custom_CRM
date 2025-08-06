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
  Skeleton,
  Grid,
} from '@mui/material';
import { ArrowBack, Save, Clear } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { fetchAccountById, updateAccount } from "../services/accountService";

// Monochrome theme for MUI components
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#050505',
      contrastText: '#fafafa',
    },
    secondary: {
      main: '#666666',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#050505',
      secondary: '#666666',
    },
    divider: '#e5e5e5',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid #e5e5e5',
          borderRadius: '8px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#ffffff',
            '& fieldset': { borderColor: '#e5e5e5' },
            '&:hover fieldset': { borderColor: '#cccccc' },
            '&.Mui-focused fieldset': { borderColor: '#050505' },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        outlined: {
          borderColor: '#e5e5e5',
          color: '#050505',
          '&:hover': {
            borderColor: '#cccccc',
            backgroundColor: '#f5f5f5',
          },
        },
      },
    },
  },
});

const EditAccount = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
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
  const [successMessage, setSuccessMessage] = useState('');

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
        const response= await fetchAccountById(id);

        // Populate form with fetched data
        const accountData = response.data;
        setFormData({
          AccountName: accountData.AccountName || "",
          CityID: accountData.CityID || "",
          street_address1: accountData.street_address1 || "",
          // street_address2: accountData.street_address2 || "",
          // street_address3: accountData.street_address3 || "",
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

        
    //     // Mock data - replace with actual API call
    //     const mockAccountData = {
    //       AccountName: "Sample Account",
    //       CityID: "1",
    //       street_address1: "123 Main St",
    //       street_address2: "Suite 100",
    //       street_address3: "",
    //       postal_code: "12345",
    //       PrimaryPhone: "(555) 123-4567",
    //       IndustryID: "2",
    //       Website: "https://example.com",
    //       fax: "(555) 123-4568",
    //       email: "contact@example.com",
    //       number_of_employees: "50",
    //       annual_revenue: "1000000",
    //       number_of_venues: "3",
    //       number_of_releases: "12",
    //       number_of_events_anually: "24",
    //       ParentAccount: "",
    //     };
        
    //     setFormData(mockAccountData);
    //   } catch (error) {
    //     console.error("Failed to fetch account:", error);
    //     setError("Failed to load account data. Please try again.");
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    loadAccount();
  }, [id]);

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
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      <ThemeProvider theme={theme}>
        <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
          <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Skeleton variant="rectangular" width={80} height={40} />
              <Skeleton variant="text" width={200} height={40} />
            </Box>
            <Paper elevation={0} sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {Array.from({ length: 16 }).map((_, i) => (
                  <Grid item xs={12} sm={6} key={i}>
                    <Skeleton variant="text" width={100} height={20} />
                    <Skeleton variant="rectangular" width="100%" height={56} />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ minWidth: 'auto' }}
              >
                Back
              </Button>
              <Typography variant="h4" sx={{ color: '#050505', fontWeight: 600 }}>
                Edit Account
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                onClick={handleSubmit}
                disabled={saving}
                sx={{
                  backgroundColor: '#050505',
                  '&:hover': { backgroundColor: '#333333' },
                }}
              >
                {saving ? 'Updating...' : 'Update Account'}
              </Button>
            </Box>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Success Alert */}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          )}

          {/* Form */}
          <Paper elevation={0} sx={{ p: 3 }}>
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
                    disabled={saving}
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
                    disabled={saving}
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
                    disabled={saving}
                  />
                </Grid>

                {/* Primary Phone */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Primary Phone"
                    name="PrimaryPhone"
                    type="tel"
                    value={formData.PrimaryPhone}
                    onChange={handleInputChange}
                    disabled={saving}
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
                    disabled={saving}
                  />
                </Grid>

                {/* Street Address 2
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street Address 2"
                    name="street_address2"
                    value={formData.street_address2}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </Grid>

                {/* Street Address 3 */}
                {/* <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street Address 3"
                    name="street_address3"
                    value={formData.street_address3}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </Grid> */} 

                {/* Postal Code */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </Grid>

                {/* Fax */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Fax"
                    name="fax"
                    type="tel"
                    value={formData.fax}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </Grid>

                {/* Email */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </Grid>

                {/* Website */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Website"
                    name="Website"
                    type="url"
                    value={formData.Website}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </Grid>

                {/* Number of Employees */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Number of Employees"
                    name="number_of_employees"
                    type="number"
                    value={formData.number_of_employees}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </Grid>

                {/* Annual Revenue */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Annual Revenue"
                    name="annual_revenue"
                    type="number"
                    value={formData.annual_revenue}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </Grid>

                {/* Number of Venues */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Number of Venues"
                    name="number_of_venues"
                    type="number"
                    value={formData.number_of_venues}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </Grid>

                {/* Number of Releases */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Number of Releases"
                    name="number_of_releases"
                    type="number"
                    value={formData.number_of_releases}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </Grid>

                {/* Number of Events Annually */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Number of Events Annually"
                    name="number_of_events_anually"
                    type="number"
                    value={formData.number_of_events_anually}
                    onChange={handleInputChange}
                    disabled={saving}
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
                    disabled={saving}
                  />
                </Grid>

                {/* Footer Action Buttons */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2, pt: 2, borderTop: '1px solid #e5e5e5' }}>
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
                      disabled={saving}
                      startIcon={saving ? <CircularProgress size={20} /> : null}
                      sx={{
                        backgroundColor: '#050505',
                        '&:hover': { backgroundColor: '#333333' },
                        minWidth: 140,
                      }}
                    >
                      {saving ? 'Updating...' : 'Update Account'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default EditAccount;