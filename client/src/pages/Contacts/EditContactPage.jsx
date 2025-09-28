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
import { getAllAccounts } from "../../services/accountService";
import {
  cityService,
  industryService,
  countryService,
  stateProvinceService,
  jobTitleService
} from '../../services/dropdownServices';
import SmartDropdown from '../../components/SmartDropdown';
import theme from "../../components/Theme";

// Modular validation function for contacts
const validateContactField = (fieldName, value) => {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    // Required fields validation
    const requiredFields = ['first_name', 'surname', 'WorkEmail'];
    if (requiredFields.includes(fieldName)) {
      return `${fieldName.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, str => str.toUpperCase())} is required`;
    }
    return null; // No validation for empty optional fields
  }

  switch (fieldName) {
    case 'WorkEmail':
    case 'personal_email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) {
        return 'Invalid email format';
      }
      break;

    case 'WorkPhone':
    case 'personal_mobile':
      const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,20}$/;
      if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
        return 'Invalid phone number - Phone number requires at least 8 numbers';
      }
      break;

    case 'first_name':
    case 'surname':
      if (value.trim().length < 2) {
        return `${fieldName.replace('_', ' ')} must be at least 2 characters`;
      } else if (value.trim().length > 100) {
        return `${fieldName.replace('_', ' ')} must be 100 characters or less`;
      }
      break;

    case 'middle_name':
      if (value.trim().length > 100) {
        return 'Middle name must be 100 characters or less';
      }
      break;
  }

  return null; // No error
};

// Validate entire contact data
const validateContactData = (formData) => {
  const errors = [];
  const fieldsToValidate = ['first_name', 'surname', 'middle_name', 'WorkEmail', 'WorkPhone', 'personal_email', 'personal_mobile'];

  fieldsToValidate.forEach(field => {
    const error = validateContactField(field, formData[field]);
    if (error) {
      errors.push(error);
    }
  });

  return errors;
};

const EditContactPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get contact ID from URL params
  const [cities, setCities] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [countries, setCountries] = useState([]);
  const [stateProvinces, setStateProvinces] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [formData, setFormData] = useState({
    ContactID: "",
    AccountID: "",
    AccountName: "",
    PersonID: "",
    first_name: "",
    middle_name: "",
    surname: "",
    JobTitleID: "",
    JobTitleName: "",
    WorkEmail: "",
    WorkPhone: "",
    CityID: "",
    CityName: "",
    StateProvinceID: "",
    StateProvince_Name: "",
    CountryID: "",
    CountryName: "",
    Active: "",
    CreatedAt: "",
    UpdatedAt: "",
    personal_mobile: "",
    personal_email: "",
    isNewPerson: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Enhanced error display with icon
  const getFieldError = (fieldName) => {
    return touched[fieldName] && fieldErrors[fieldName] ? (
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ color: '#ff4444', marginRight: '4px' }}>✗</span>
        {fieldErrors[fieldName]}
      </span>
    ) : '';
  };

  const isFieldInvalid = (fieldName) => {
    return touched[fieldName] && fieldErrors[fieldName];
  };

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
          first_name: contactData.first_name || "",
          middle_name: contactData.middle_name || "",
          surname: contactData.surname || "",
          JobTitleID: contactData.JobTitleID || "",
          JobTitleName: contactData.JobTitleName || "",
          WorkEmail: contactData.WorkEmail || "",
          WorkPhone: contactData.WorkPhone || "", 
          CityID: contactData.CityID || "",
          CityName: contactData.CityName || "",
          StateProvinceID: contactData.StateProvinceID || "",
          StateProvince_Name: contactData.StateProvince_Name || "",
          CountryID: contactData.CountryID || "",
          CountryName: contactData.CountryName || "",
          Active: contactData.Active || "",
          CreatedAt: contactData.CreatedAt || "",
          UpdatedAt: contactData.UpdatedAt || "",
          personal_mobile: contactData.personal_mobile || "",
          personal_email: contactData.personal_email || "",
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

  // Handle input changes with validation
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Real-time validation for touched fields
    if (touched[name]) {
      const error = validateContactField(name, value);
      setFieldErrors(prev => ({
        ...prev,
        [name]: error || undefined
      }));
    }

    if (error) setError(null);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateContactField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error || undefined
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate form before submission
    const validationErrors = validateContactData(formData);
    
    if (validationErrors.length > 0) {
      setError(`Please fix the following errors:\n• ${validationErrors.join('\n• ')}`);
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
      
      if (error.isValidation) {
        setError(error.message);
      } else if (error.response?.status === 409) {
        setError('Contact with this information already exists');
      } else if (error.response?.status === 400) {
        setError(error.response.data?.error || 'Invalid data provided');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later');
      } else {
        setError('Failed to update contact. Please try again.');
      }
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
                {/* First Name */}
                <Box>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    disabled={saving}
                    error={isFieldInvalid('first_name')}
                    helperText={getFieldError('first_name')}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                {/* Middle Name */}
                <Box>
                  <TextField
                    fullWidth
                    label="Middle Name (Optional)"
                    name="middle_name"
                    value={formData.middle_name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    disabled={saving}
                    error={isFieldInvalid('middle_name')}
                    helperText={getFieldError('middle_name')}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                {/* Surname */}
                <Box>
                  <TextField
                    fullWidth
                    label="Surname"
                    name="surname"
                    value={formData.surname}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    disabled={saving}
                    error={isFieldInvalid('surname')}
                    helperText={getFieldError('surname')}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                {/* Account Name */}
                <SmartDropdown
                  label="Account"
                  name="AccountName"
                  value={formData.AccountID}
                  onChange={handleInputChange}
                  service={{ getAll: async () => (await getAllAccounts()).data }}
                  displayField="AccountName"
                  valueField="AccountID"
                  disabled={saving}
                />

                {/* Job Title */}
                <SmartDropdown
                  label="Job Title"
                  name="JobTitleID"
                  value={formData.JobTitleID}
                  onChange={handleInputChange}
                  service={jobTitleService}
                  displayField="JobTitleName"
                  valueField="JobTitleID"
                  disabled={saving}
                />

                {/* City */}
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

                {/* State/Province */}
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

                {/* Work Email */}
                <Box>
                  <TextField
                    fullWidth
                    label="Work Email"
                    name="WorkEmail"
                    value={formData.WorkEmail}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    type="email"
                    required
                    disabled={saving}
                    error={isFieldInvalid('WorkEmail')}
                    helperText={getFieldError('WorkEmail')}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                {/* Work Mobile */}
                <Box>
                  <TextField
                    fullWidth
                    label="Work Phone (Optional)"
                    name="WorkPhone"
                    value={formData.WorkPhone}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    type="tel"
                    disabled={saving}
                    error={isFieldInvalid('WorkPhone')}
                    helperText={getFieldError('WorkPhone')}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                {/* Personal Email */}
                <Box>
                  <TextField
                    fullWidth
                    label="Personal Email (Optional)"
                    name="personal_email"
                    value={formData.personal_email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    type="email"
                    disabled={saving}
                    error={isFieldInvalid('personal_email')}
                    helperText={getFieldError('personal_email')}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                {/* Personal Mobile */}
                <Box>
                  <TextField
                    fullWidth
                    label="Personal Mobile (Optional)"
                    name="personal_mobile"
                    value={formData.personal_mobile}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    type="tel"
                    disabled={saving}
                    error={isFieldInvalid('personal_mobile')}
                    helperText={getFieldError('personal_mobile')}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
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
export default EditContactPage;