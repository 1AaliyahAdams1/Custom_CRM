
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
  Skeleton,
} from "@mui/material";
import { ArrowBack, Save, Clear } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { getContactDetails, updateContact, getContactsByAccountId } from "../../services/contactService";
import {
  cityService,
  industryService,
  countryService,
  stateProvinceService,
  jobTitleService
} from '../../services/dropdownServices';
import SmartDropdown from '../../components/SmartDropdown';
import theme from "../../components/Theme";


const EditContactPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get contact ID from URL params
  const [cities, setCities] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [countries, setCountries] = useState([]);
  const [stateProvinces, setStateProvinces] = useState([]);

  const [formData, setFormData] = useState({
    ContactID: "",
    AccountID: "",
    AccountName: "",
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
    WorkEmail: "",
    WorkPhone: "",
    Position: "",
    isNewPerson: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

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

  // Fetch contact data when component mounts
  useEffect(() => {
    const loadContact = async () => {
      if (!id) {
        setError("No contact ID provided");
        setLoading(false);
        return;
      }
      try {
        const response = await getContactDetails(id);
        const contactData = response.data;
        console.log(contactData)
        setFormData({
          ContactID: contactData.ContactID || "",
          AccountID: contactData.AccountID || "",
          AccountName: contactData.AccountName || "",
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
          PrimaryEmail: contactData.WorkEmail || "",
          PrimaryPhone: contactData.WorkPhone || "",
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
      <ThemeProvider theme={theme}>
        <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
          <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Skeleton variant="rectangular" width={80} height={40} />
              <Skeleton variant="text" width={200} height={40} />
            </Box>
            <Paper elevation={0} sx={{ p: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                {Array.from({ length: 16 }).map((_, i) => (
                  <Box key={i}>
                    <Skeleton variant="text" width={100} height={20} />
                    <Skeleton variant="rectangular" width="100%" height={56} />
                  </Box>
                ))}
              </Box>
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

              <Typography variant="h4" sx={{ color: '#050505', fontWeight: 600 }}>
                Edit Contact
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
                {saving ? 'Updating...' : 'Update Contact'}
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
                {/* First Name - Required */}
                <Box>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                    disabled={saving}
                  />
                </Box>

                {/* Middle Name */}
                <Box>
                  <TextField
                    fullWidth
                    label="Middle Name"
                    name="middle_name"
                    value={formData.middle_name}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </Box>

                {/* Surname - Required */}
                <Box>
                  <TextField
                    fullWidth
                    label="Surname"
                    name="surname"
                    value={formData.surname}
                    onChange={handleInputChange}
                    required
                    disabled={saving}
                  />
                </Box>

                {/* Account Name - Read Only */}
                <SmartDropdown
                  label="Account"
                  name="AccountName"
                  value={formData.AccountID}
                  onChange={handleInputChange}
                  service={industryService}
                  displayField="AccountName"
                  valueField="AccountID"
                  disabled={saving}
                />

                {/* Title */}
                <SmartDropdown
                  label="Job Title"
                  name="JobTitleID"
                  value={formData.JobTitleID}
                  onChange={handleInputChange}
                  service={industryService}
                  displayField="JobTitleName"
                  valueField="JobTitleID"
                  disabled={saving}
                />

                {/* City */}
                <SmartDropdown
                  label="City"
                  name="CityID"
                  value={formData.PersonCityID}
                  onChange={handleInputChange}
                  service={industryService}
                  displayField="CityName"
                  valueField="CityID"
                  disabled={saving}
                />

                {/* LinkedIn Link */}
                <Box /*sx={{ gridColumn: '1 / -1' }}*/>
                  <TextField
                    fullWidth
                    label="LinkedIn Profile"
                    name="linkedin_link"
                    value={formData.linkedin_link}
                    onChange={handleInputChange}
                    type="url"
                    disabled={saving}
                  />
                </Box>

                {/* State/Province */}
                <SmartDropdown
                  label="State/Province"
                  name="StateProvinceID"
                  value={formData.PersonStateProvinceID}
                  onChange={handleInputChange}
                  service={industryService}
                  displayField="StateProvince_Name"
                  valueField="StateProvinceID"
                  disabled={saving}
                />

                {/* Primary Email */}
                <Box>
                  <TextField
                    fullWidth
                    label="Primary Email"
                    name="PrimaryEmail"
                    value={formData.PrimaryEmail}
                    onChange={handleInputChange}
                    type="email"
                    disabled={saving}
                  />
                </Box>

                {/* Work Phone */}
                <Box>
                  <TextField
                    fullWidth
                    label="Work Phone"
                    name="WorkPhone"
                    value={formData.WorkPhone}
                    onChange={handleInputChange}
                    type="tel"
                    disabled={saving}
                  />
                </Box>

                {/* Personal Email */}
                <Box>
                  <TextField
                    fullWidth
                    label="Personal Email"
                    name="personal_email"
                    value={formData.personal_email}
                    onChange={handleInputChange}
                    type="email"
                    disabled={saving}
                  />
                </Box>

                {/* Personal Mobile */}
                <Box>
                  <TextField
                    fullWidth
                    label="Personal Mobile"
                    name="personal_mobile"
                    value={formData.personal_mobile}
                    onChange={handleInputChange}
                    type="tel"
                    disabled={saving}
                  />
                </Box>

                {/* Still Employed Checkbox - Full Width */}
                <Box sx={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', mt: 1 }}>
                  <input
                    type="checkbox"
                    id="Still_employed"
                    name="Still_employed"
                    checked={formData.Still_employed}
                    onChange={handleInputChange}
                    disabled={saving}
                    style={{
                      marginRight: '12px',
                      width: '18px',
                      height: '18px',
                      accentColor: '#050505'
                    }}
                  />
                  <Typography variant="body1" sx={{ color: '#050505', fontWeight: 500 }}>
                    Still Employed
                  </Typography>
                </Box>
              </Box>
            </form>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};
export default EditContactPage;
