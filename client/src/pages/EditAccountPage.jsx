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
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
} from '@mui/material';
import { ArrowBack, Save, Clear } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { fetchAccountById, updateAccount,getAllAccounts } from "../services/accountService";
import { 
  cityService, 
  industryService, 
  countryService, 
  stateProvinceService 
} from '../services/dropdownServices';
import SmartDropdown from '../components/SmartDropdown';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [cities, setCities] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [countries, setCountries] = useState([]);
  const [stateProvinces, setStateProvinces] = useState([]);
  
  const [formData, setFormData] = useState({
    AccountName: "",
    CityID: "",
    CountryID: "",
    StateProvinceID: "",
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

  useEffect(() => {
      const loadDropdownData = async () => {
        try {
          const [citiesData, industriesData, countriesData, stateProvincesData] = await Promise.all([
            cityService.getAll(),
            industryService.getAll(),
            countryService.getAll(),
            stateProvinceService.getAll()
          ]);
          
          
          setCities(citiesData);
          setIndustries(industriesData);
          setCountries(countriesData);
          setStateProvinces(stateProvincesData);
        } catch (error) {
          console.error('Error loading dropdown data:', error);
        }
      };
  
      loadDropdownData();
    }, []);

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
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                {/* Account Name - Required */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    fullWidth
                    label="Account Name"
                    name="AccountName"
                    value={formData.AccountName}
                    onChange={handleInputChange}
                    required
                    disabled={saving}
                  />
                </Box>
                {/* Parent Account Dropdown */}
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <SmartDropdown
                      label="Parent Account"
                      name="ParentAccount"
                      value={formData.ParentAccount}
                      onChange={handleInputChange}
                      service={{
                        getAll: async () => {
                          const response = await getAllAccounts();
                         
                           return response.data || response;
                        }
                      }}
                      displayField="AccountName"
                      valueField=""
                      disabled={isSubmitting}
                    />
                    </Box>

               {/* Country ID */}
                <Box>
                  <SmartDropdown
                    label="Country"
                    name="CountryID"
                    value={formData.CountryID}
                    onChange={handleInputChange}
                    service={countryService}
                    displayField="name"
                    valueField="id"
                    disabled={isSubmitting}
                  />
                </Box>
                {/* State Province ID */}
                  <Box>
                    <SmartDropdown
                      label="State/Province"
                      name="StateProvinceID"
                      value={formData.StateProvinceID}
                      onChange={handleInputChange}
                      service={{
                      getAll: async () => {
                      const allStates = await stateProvinceService.getAll();
                      // Filter by selected country if one is selected
                      return formData.CountryID 
                          ? allStates.filter(state => state.countryId === parseInt(formData.CountryID))
                            : allStates;
                      }
                    }}
                      displayField="name"
                      valueField="id"
                      disabled={isSubmitting}
                    />
                  </Box>
                {/* City Dropdown */}
                  <Box>
                    <SmartDropdown
                      label="City"
                      name="CityID"
                      value={formData.CityID}
                      onChange={handleInputChange}
                      service={cityService}
                      displayField="name"
                      valueField="id"
                      disabled={isSubmitting}
                    />
                    </Box>
                {/* Industry Dropdown */}
                  <Box>
                    <SmartDropdown
                      label="Industry"
                      name="IndustryID"
                      value={formData.IndustryID}
                      onChange={handleInputChange}
                      service={industryService}
                      displayField="name"
                      valueField="id"
                      disabled={isSubmitting}
                    />
                    </Box>
               
                               
                {/* Street Address1  */}
                  <Box >
                    <TextField
                      fullWidth
                      label="Street Address 1 "
                      name="street_address1"
                      value={formData.street_address1}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                  </Box>

                

                

                {/* Street Address 2*/}
                <Box item xs={12}>
                  <TextField
                    fullWidth
                    label="Street Address 2"
                    name="street_address2"
                    value={formData.street_address2}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </Box>

                {/* Street Address 3 */}
                {<Box item xs={12}>
                  <TextField
                    fullWidth
                    label="Street Address 3"
                    name="street_address3"
                    value={formData.street_address3}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </Box> } 

                {/* Postal Code */}
                <Box item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </Box>
                {/* Primary Phone */}
                <Box item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Primary Phone"
                    name="PrimaryPhone"
                    type="tel"
                    value={formData.PrimaryPhone}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </Box>
                {/* Email */}
                <Box item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </Box>

                {/* Fax */}
                <Box item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Fax"
                    name="fax"
                    type="tel"
                    value={formData.fax}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </Box>

                

                {/* Website */}
                <Box item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Website"
                    name="Website"
                    type="url"
                    value={formData.Website}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </Box>

                

                {/* Annual Revenue */}
                <Box item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Annual Revenue"
                    name="annual_revenue"
                    type="number"
                    value={formData.annual_revenue}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </Box>
                {/* Number of Employees */}
                <Box item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Number of Employees"
                    name="number_of_employees"
                    type="number"
                    value={formData.number_of_employees}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </Box>

                

                {/* Number of Releases */}
                <Box item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Number of Releases"
                    name="number_of_releases"
                    type="number"
                    value={formData.number_of_releases}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </Box>

                {/* Number of Events Annually */}
                <Box item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Number of Events Annually"
                    name="number_of_events_anually"
                    type="number"
                    value={formData.number_of_events_anually}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </Box>
                {/* Number of Venues */}
                <Box item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Number of Venues"
                    name="number_of_venues"
                    type="number"
                    value={formData.number_of_venues}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </Box>
                
               

                

                
              </Box>
            </form>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default EditAccount;