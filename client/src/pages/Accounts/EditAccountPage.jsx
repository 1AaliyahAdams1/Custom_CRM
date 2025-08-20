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
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { fetchAccountById, updateAccount, getAllAccounts } from "../../services/accountService";
import { 
  cityService, 
  industryService, 
  countryService, 
  stateProvinceService 
} from '../../services/dropdownServices';
import SmartDropdown from '../../components/SmartDropdown';

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
  }
});

const EditAccount = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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
      } catch {
        setError('Failed to load dropdown data');
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
        const response = await fetchAccountById(id);
        const accountData = response.data;
        setFormData({
          AccountName: accountData.AccountName || "",
          CityID: accountData.CityID || "",
          CountryID: accountData.CountryID || "",
          StateProvinceID: accountData.StateProvinceID || "",
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
      } catch {
        setError("Failed to load account data");
      } finally {
        setLoading(false);
      }
    };
    loadAccount();
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
      setError(null);
      await updateAccount(id, formData);
      setSuccessMessage("Account updated successfully!");
      console.log("Server id response:", id);
      console.log("Server formdata response:", formData);
      setTimeout(() => navigate("/accounts"), 1500);
    } catch {
      setError("Failed to update account");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ p: 3 }}>
          <Skeleton variant="rectangular" width="100%" height={400} />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4">Edit Account</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate(-1)}>Back</Button>
              <Button variant="outlined" startIcon={<Clear />} onClick={() => navigate("/accounts")} disabled={saving}>Cancel</Button>
              <Button variant="contained" startIcon={saving ? <CircularProgress size={20} /> : <Save />} onClick={handleSubmit} disabled={saving}>
                {saving ? 'Updating...' : 'Update Account'}
              </Button>
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {successMessage && <Alert severity="success" sx={{ mb: 3 }}>{successMessage}</Alert>}

          <Paper elevation={0} sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>

                <TextField sx={{ gridColumn: '1 / -1' }}
                  fullWidth
                  label="Account Name"
                  name="AccountName"
                  value={formData.AccountName}
                  onChange={handleInputChange}
                  disabled={saving}
                />

                <SmartDropdown sx={{ gridColumn: '1 / -1' }}
                  label="Parent Account"
                  name="ParentAccount"
                  value={formData.ParentAccount}
                  onChange={handleInputChange}
                  service={{ getAll: async () => (await getAllAccounts()).data }}
                  displayField="AccountName"
                  valueField="AccountID"
                  disabled={saving}
                />

                <SmartDropdown
                  label="Country"
                  name="CountryID"
                  value={formData.CountryID}
                  onChange={handleInputChange}
                  service={countryService}
                  displayField="CountryName"
                  valueField="CountryID"
                  disabled={saving}
                />

                <SmartDropdown
                  label="State/Province"
                  name="StateProvinceID"
                  value={formData.StateProvinceID}
                  onChange={handleInputChange}
                  service={stateProvinceService}
                  displayField="StateProvince_Name"
                  valueField="StateProvinceID"
                  disabled={saving}
                />

                <SmartDropdown
                  label="City"
                  name="CityID"
                  value={formData.CityID}
                  onChange={handleInputChange}
                  service={cityService}
                  displayField="CityName"
                  valueField="CityID"
                  disabled={saving}
                />

                <SmartDropdown
                  label="Industry"
                  name="IndustryID"
                  value={formData.IndustryID}
                  onChange={handleInputChange}
                  service={industryService}
                  displayField="IndustryName"
                  valueField="IndustryID"
                  disabled={saving}
                />

                <TextField
                  fullWidth
                  label="Street Address 1"
                  name="street_address1"
                  value={formData.street_address1}
                  onChange={handleInputChange}
                  disabled={saving}
                />

                <TextField
                  fullWidth
                  label="Street Address 2"
                  name="street_address2"
                  value={formData.street_address2}
                  onChange={handleInputChange}
                  disabled={saving}
                />

                <TextField
                  fullWidth
                  label="Street Address 3"
                  name="street_address3"
                  value={formData.street_address3}
                  onChange={handleInputChange}
                  disabled={saving}
                />

                <TextField
                  fullWidth
                  label="Postal Code"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  disabled={saving}
                />

                <TextField
                  fullWidth
                  label="Primary Phone"
                  name="PrimaryPhone"
                  value={formData.PrimaryPhone}
                  onChange={handleInputChange}
                  disabled={saving}
                />

                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={saving}
                />

                <TextField
                  fullWidth
                  label="Fax"
                  name="fax"
                  value={formData.fax}
                  onChange={handleInputChange}
                  disabled={saving}
                />

                <TextField
                  fullWidth
                  label="Website"
                  name="Website"
                  value={formData.Website}
                  onChange={handleInputChange}
                  disabled={saving}
                />

                <TextField
                  fullWidth
                  label="Annual Revenue"
                  name="annual_revenue"
                  type="number"
                  value={formData.annual_revenue}
                  onChange={handleInputChange}
                  disabled={saving}
                />

                <TextField
                  fullWidth
                  label="Number of Employees"
                  name="number_of_employees"
                  type="number"
                  value={formData.number_of_employees}
                  onChange={handleInputChange}
                  disabled={saving}
                />

                <TextField
                  fullWidth
                  label="Number of Releases"
                  name="number_of_releases"
                  type="number"
                  value={formData.number_of_releases}
                  onChange={handleInputChange}
                  disabled={saving}
                />

                <TextField
                  fullWidth
                  label="Number of Events Annually"
                  name="number_of_events_anually"
                  type="number"
                  value={formData.number_of_events_anually}
                  onChange={handleInputChange}
                  disabled={saving}
                />

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
            </form>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default EditAccount;
