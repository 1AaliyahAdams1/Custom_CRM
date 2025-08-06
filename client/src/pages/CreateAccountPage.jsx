import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
} from '@mui/material';
import { ArrowBack, Save, Clear } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { createAccount } from '../services/accountService'; 
import { 
  cityService, 
  industryService, 
  countryService, 
  stateProvinceService 
} from '../services/dropdownServices';




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

const CreateAccount = () => {
  const navigate = useNavigate();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.AccountName.trim()) {
      setError("Account name is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const cleanedData = {
        ...formData,
        CityID: formData.CityID === "" ? null : parseInt(formData.CityID),
        IndustryID: formData.IndustryID === "" ? null : parseInt(formData.IndustryID),
        number_of_employees: formData.number_of_employees === "" ? null : parseInt(formData.number_of_employees),
        annual_revenue: formData.annual_revenue === "" ? null : parseFloat(formData.annual_revenue),
        number_of_venues: formData.number_of_venues === "" ? null : parseInt(formData.number_of_venues),
        number_of_releases: formData.number_of_releases === "" ? null : parseInt(formData.number_of_releases),
        number_of_events_anually: formData.number_of_events_anually === "" ? null : parseInt(formData.number_of_events_anually),
        ParentAccount: formData.ParentAccount || null,
      };

      console.log('Creating account:', cleanedData);
      
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage("Account created successfully!");
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate('/accounts');
      }, 1500);
      
    } catch (error) {
      console.error('Error creating account:', error);
      setError('Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/accounts');
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              
              <Typography variant="h4" sx={{ color: '#050505', fontWeight: 600 }}>
                Create New Account
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ minWidth: 'auto' }}
              >
                Back
              </Button>
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
                onClick={handleSubmit}
                disabled={isSubmitting}
                sx={{
                  backgroundColor: '#050505',
                  '&:hover': { backgroundColor: '#333333' },
                }}
              >
                {isSubmitting ? 'Saving...' : 'Save Account'}
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
                    disabled={isSubmitting}
                  />
                </Box>

                {/* City ID */}
                <Box>
                  <FormControl fullWidth disabled={isSubmitting}>
                  <InputLabel id="cityID-label">City ID</InputLabel>
                  <Select 
                    labelId="cityID-label" 
                    name="CityID" 
                    value={formData.CityID} 
                    onChange={handleInputChange} 
                    disabled={isSubmitting}>
                    <MenuItem value="">Select a city</MenuItem>
                    {cities
                      .filter(city => !formData.StateProvinceID || city.stateProvinceId === parseInt(formData.StateProvinceID))
                      .map((city) => (
                        <MenuItem key={city.id} value={city.id}>
                    {city.name}
                  </MenuItem>
                    ))} 

                  </Select>
                  </FormControl>

                </Box>

                {/* Industry ID */}
                <Box>
                  <FormControl fullWidth disabled={isSubmitting}>
                    <InputLabel id="industryID-label">Industry</InputLabel>
                    <Select
                      labelId="industryID-label"
                      name="IndustryID"
                      value={formData.IndustryID}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    >
                      <MenuItem value="">Select an industry</MenuItem>
                      {industries.map((industry) => (
                        <MenuItem key={industry.id} value={industry.id}>
                          {industry.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                {/* Country ID */}
                <Box>
                  <FormControl fullWidth disabled={isSubmitting}>
                    <InputLabel id="countryID-label">Country</InputLabel>
                    <Select
                      labelId="countryID-label"
                      name="CountryID"
                      value={formData.CountryID}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    >
                      <MenuItem value="">Select a country</MenuItem>
                      {countries.map((country) => (
                        <MenuItem key={country.id} value={country.id}>
                          {country.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                {/* State Province ID */}
                <Box>
                  <FormControl fullWidth disabled={isSubmitting}>
                    <InputLabel id="stateProvinceID-label">State/Province</InputLabel>
                    <Select
                      labelId="stateProvinceID-label"
                      name="StateProvinceID"
                      value={formData.StateProvinceID}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    >
                      <MenuItem value="">Select a state/province</MenuItem>
                      {stateProvinces
                        .filter(sp => !formData.CountryID || sp.countryId === parseInt(formData.CountryID)) 
                        .map((stateProvince) => (
                          <MenuItem key={stateProvince.id} value={stateProvince.id}>
                            {stateProvince.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Box>

                
                {/* Street Address  */}
                <Box /*sx={{ gridColumn: '1 / -1' }}*/>
                  <TextField
                    fullWidth
                    label="Street Address 1 "
                    name="street_address1"
                    value={formData.street_address1}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </Box>
                <Box >
                  <TextField
                    fullWidth
                    label="Street Address 2 "
                    name="street_address2"
                    value={formData.street_address2}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </Box>
                <Box >
                  <TextField
                    fullWidth
                    label="Street Address 3 "
                    name="street_address3"
                    value={formData.street_address3}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </Box>

                {/* Postal code */}
                <Box>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    name="PostalCode"
                    
                    value={formData.postal_code}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </Box>
                {/* Primary Phone */}
                <Box>
                  <TextField
                    fullWidth
                    label="Primary Phone"
                    name="PrimaryPhone"
                    type="tel"
                    value={formData.PrimaryPhone}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </Box>

                
                {/* Email */}
                <Box>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </Box>
                {/* Fax */}
                <Box>
                  <TextField
                    fullWidth
                    label="Fax"
                    name="fax"
                    
                    value={formData.fax}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </Box>
                

                {/* Website */}
                <Box>
                  <TextField
                    fullWidth
                    label="Website"
                    name="Website"
                    type="url"
                    value={formData.Website}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </Box>
                
                
                {/* #Employees */}
                <Box>
                  <TextField
                    fullWidth
                    label="Number of Employees"
                    name="number_of_employees"
                    
                    value={formData.number_of_employees}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </Box>
                {/* Annual Revenue */}
                <Box>
                  <TextField
                    fullWidth
                    label="Annual Revenue"
                    name="annual_revenue"
                    
                    value={formData.annual_revenue}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </Box>
                {/* # of Releases */}
                <Box>
                  <TextField
                    fullWidth
                    label="Number of Releases"
                    name="number_of_releases"
                    
                    value={formData.number_of_releases}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </Box>
                {/* # of Events Annually */}
                <Box>
                  <TextField
                    fullWidth
                    label="Number of Events Annually"
                    name="number_of_events_anually"
                    
                    value={formData.number_of_events_anually}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
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

export default CreateAccount;