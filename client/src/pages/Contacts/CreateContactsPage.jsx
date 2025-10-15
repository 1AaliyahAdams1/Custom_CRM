import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Box,
  TextField,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Save, Clear } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import SmartDropdown from '../../components/SmartDropdown';
import { createContact } from '../../services/contactService';
import { getAllPersons, createPerson } from '../../services/personService';
import { getAllAccounts } from '../../services/accountService';
import { cityService, jobTitleService } from '../../services/dropdownServices';

// Validation functions
const validateContactField = (fieldName, value) => {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    const requiredFields = ['AccountID', 'PersonID', 'JobTitleID', 'WorkEmail'];
    if (requiredFields.includes(fieldName)) {
      return `${fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`;
    }
    return null;
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

    case 'linkedin_link':
      const urlRegex = /^https?:\/\/.+\..+/;
      if (!urlRegex.test(value.trim())) {
        return 'Invalid URL - URL requires a prefix ( http:// , https:// ) and a suffix ( .com , .co.za , etc )';
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
    case 'Title':
      if (value.trim().length > 100) {
        return `${fieldName.replace('_', ' ')} must be 100 characters or less`;
      }
      break;
  }

  return null;
};

const validateContactData = (contactData, personData, isNewPerson) => {
  const errors = [];

  const contactFieldsToValidate = ['AccountID', 'JobTitleID', 'WorkEmail', 'WorkPhone'];
  contactFieldsToValidate.forEach(field => {
    const error = validateContactField(field, contactData[field]);
    if (error) {
      errors.push(error);
    }
  });

  if (isNewPerson) {
    const personFieldsToValidate = ['first_name', 'surname', 'middle_name', 'Title', 'personal_email', 'personal_mobile', 'linkedin_link'];
    personFieldsToValidate.forEach(field => {
      const error = validateContactField(field, personData[field]);
      if (error) {
        errors.push(error);
      }
    });

    if (!personData.first_name || personData.first_name.trim().length === 0) {
      errors.push('First name is required for new person');
    }
    if (!personData.surname || personData.surname.trim().length === 0) {
      errors.push('Surname is required for new person');
    }
  } else {
    if (!contactData.PersonID) {
      errors.push('Please select a person');
    }
  }

  return errors;
};

const CreateContactsPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [isNewPerson, setIsNewPerson] = useState(true);

  const [personData, setPersonData] = useState({
    Title: '',
    first_name: '',
    middle_name: '',
    surname: '',
    linkedin_link: '',
    personal_email: '',
    personal_mobile: '',
    CityID: '',
  });

  const [contactData, setContactData] = useState({
    AccountID: '',
    PersonID: '',
    JobTitleID: '',
    WorkEmail: '',
    WorkPhone: '',
  });

  const getFieldError = (fieldName, isPersonField = false) => {
    const touchedKey = `${isPersonField ? 'person' : 'contact'}_${fieldName}`;
    
    return touched[touchedKey] && fieldErrors[touchedKey] ? (
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ color: '#ff4444', marginRight: '4px' }}>✗</span>
        {fieldErrors[touchedKey]}
      </span>
    ) : '';
  };

  const isFieldInvalid = (fieldName, isPersonField = false) => {
    const touchedKey = `${isPersonField ? 'person' : 'contact'}_${fieldName}`;
    return touched[touchedKey] && fieldErrors[touchedKey];
  };

  const accountService = {
    getAll: async () => {
      try {
        const res = await getAllAccounts();
        return res.data || [];
      } catch (error) {
        console.error('Error loading accounts:', error);
        return [];
      }
    },
  };

  const personDropdownService = {
    getAll: async () => {
      try {
        const data = await getAllPersons();
        return data || [];
      } catch (error) {
        console.error('Error loading persons:', error);
        return [];
      }
    },
  };

  const handlePersonToggle = (event) => {
    const checked = event.target.checked;
    setIsNewPerson(checked);

    setFieldErrors({});
    setTouched({});
    setError(null);

    if (checked) {
      setPersonData({
        Title: '',
        first_name: '',
        middle_name: '',
        surname: '',
        linkedin_link: '',
        personal_email: '',
        personal_mobile: '',
        CityID: '',
      });
      setContactData((prev) => ({ ...prev, PersonID: '' }));
    } else {
      setPersonData({
        Title: '',
        first_name: '',
        middle_name: '',
        surname: '',
        linkedin_link: '',
        personal_email: '',
        personal_mobile: '',
        CityID: '',
      });
    }
  };

  const handlePersonChange = (e) => {
    const { name, value } = e.target;
    setPersonData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const touchedKey = `person_${name}`;
    setTouched(prev => ({
      ...prev,
      [touchedKey]: true
    }));

    const error = validateContactField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [touchedKey]: error || undefined
    }));

    if (error) setError(null);
  };

  const handlePersonBlur = (e) => {
    const { name, value } = e.target;
    const touchedKey = `person_${name}`;
    
    setTouched(prev => ({
      ...prev,
      [touchedKey]: true
    }));

    const error = validateContactField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [touchedKey]: error || undefined
    }));
  };

  const handleContactChange = (e) => {
    const { name, value, type, checked } = e.target;
    setContactData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    const touchedKey = `contact_${name}`;
    setTouched(prev => ({
      ...prev,
      [touchedKey]: true
    }));

    const error = validateContactField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [touchedKey]: error || undefined
    }));

    if (error) setError(null);
  };

  const handleContactBlur = (e) => {
    const { name, value } = e.target;
    const touchedKey = `contact_${name}`;
    
    setTouched(prev => ({
      ...prev,
      [touchedKey]: true
    }));

    const error = validateContactField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [touchedKey]: error || undefined
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allTouched = {};
    Object.keys(contactData).forEach(key => {
      allTouched[`contact_${key}`] = true;
    });
    if (isNewPerson) {
      Object.keys(personData).forEach(key => {
        allTouched[`person_${key}`] = true;
      });
    }
    setTouched(allTouched);

    const validationErrors = validateContactData(contactData, personData, isNewPerson);
    
    if (validationErrors.length > 0) {
      setError(`Please fix the following errors:\n• ${validationErrors.join('\n• ')}`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let personIdToUse = contactData.PersonID;

      if (isNewPerson) {
        const createdPerson = await createPerson(personData);
        personIdToUse = createdPerson.PersonID || createdPerson.id || createdPerson;
      }

      if (!personIdToUse) {
        setError('Please select or create a person.');
        return;
      }

      const cleanedContactData = {
        AccountID: contactData.AccountID === "" ? null : Number(contactData.AccountID),
        PersonID: Number(personIdToUse),
        JobTitleID: contactData.JobTitleID === "" ? null : Number(contactData.JobTitleID),
        WorkEmail: contactData.WorkEmail === "" ? null : contactData.WorkEmail,
        WorkPhone: contactData.WorkPhone === "" ? null : contactData.WorkPhone,
      };

      await createContact(cleanedContactData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage("Contact created successfully!");
      
      setTimeout(() => {
        navigate('/contacts');
      }, 1500);

    } catch (error) {
      console.error('Error creating contact/person:', error);
      
      if (error.isValidation) {
        setError(error.message);
      } else if (error.response?.status === 409) {
        setError('Contact with this information already exists');
      } else if (error.response?.status === 400) {
        setError(error.response.data?.error || 'Invalid data provided');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later');
      } else {
        setError('Failed to create contact. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/contacts');
  };

  return (
    <Box sx={{ 
      width: '100%', 
      backgroundColor: theme.palette.background.default,
      minHeight: '100vh', 
      p: 3 
    }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" sx={{ 
              color: theme.palette.text.primary,
              fontWeight: 600 
            }}>
              Create New Contact
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
            >
              {isSubmitting ? 'Saving...' : 'Save Contact'}
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
              {/* Account Dropdown - Required */}
              <Box sx={{ gridColumn: '1 / -1' }}>
                <SmartDropdown
                  label="Account"
                  name="AccountID"
                  value={contactData.AccountID}
                  onChange={handleContactChange}
                  service={accountService}
                  displayField="AccountName"
                  valueField="AccountID"
                  placeholder="Search for account..."
                  required
                  disabled={isSubmitting}
                  error={isFieldInvalid('AccountID', false)}
                  helperText={getFieldError('AccountID', false)}
                />
              </Box>

              {/* Person Selection Toggle Card */}
              <Box sx={{ gridColumn: '1 / -1' }}>
                <Card variant="outlined" sx={{ 
                  border: `1px solid ${theme.palette.divider}`
                }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" fontWeight={600} color={theme.palette.text.primary}>
                        Person Information
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={isNewPerson} 
                            onChange={handlePersonToggle} 
                            disabled={isSubmitting}
                          />
                        }
                        label={isNewPerson ? 'Create New Person' : 'Use Existing Person'}
                      />
                    </Box>
                    <Typography variant="body2" color={theme.palette.text.secondary} sx={{ mt: 1 }}>
                      {isNewPerson
                        ? 'Fill in the person details below to create a new person record'
                        : 'Select an existing person from the dropdown'}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Existing Person Dropdown */}
              {!isNewPerson && (
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <SmartDropdown
                    label="Select Person"
                    name="PersonID"
                    value={contactData.PersonID}
                    onChange={handleContactChange}
                    service={personDropdownService}
                    displayField="PersonID"
                    valueField="PersonID"
                    placeholder="Search for person..."
                    required
                    disabled={isSubmitting}
                    customDisplayFormatter={(item) =>
                      `${item.first_name || ''} ${item.surname || ''}`.trim()
                    }
                    error={isFieldInvalid('PersonID', false)}
                    helperText={getFieldError('PersonID', false)}
                  />
                </Box>
              )}

              {/* New Person Fields */}
              {isNewPerson && (
                <>
                  <Box>
                    <TextField
                      fullWidth
                      label="Title (Optional)"
                      name="Title"
                      value={personData.Title}
                      onChange={handlePersonChange}
                      onBlur={handlePersonBlur}
                      disabled={isSubmitting}
                      error={isFieldInvalid('Title', true)}
                      helperText={getFieldError('Title', true)}
                      FormHelperTextProps={{
                        component: 'div'
                      }}
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="first_name"
                      value={personData.first_name}
                      onChange={handlePersonChange}
                      onBlur={handlePersonBlur}
                      required
                      disabled={isSubmitting}
                      error={isFieldInvalid('first_name', true)}
                      helperText={getFieldError('first_name', true)}
                      FormHelperTextProps={{
                        component: 'div'
                      }}
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="Middle Name (Optional)"
                      name="middle_name"
                      value={personData.middle_name}
                      onChange={handlePersonChange}
                      onBlur={handlePersonBlur}
                      disabled={isSubmitting}
                      error={isFieldInvalid('middle_name', true)}
                      helperText={getFieldError('middle_name', true)}
                      FormHelperTextProps={{
                        component: 'div'
                      }}
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="Surname"
                      name="surname"
                      value={personData.surname}
                      onChange={handlePersonChange}
                      onBlur={handlePersonBlur}
                      required
                      disabled={isSubmitting}
                      error={isFieldInvalid('surname', true)}
                      helperText={getFieldError('surname', true)}
                      FormHelperTextProps={{
                        component: 'div'
                      }}
                    />
                  </Box>
                  <Box>
                    <SmartDropdown
                      label="City (Optional)"
                      name="CityID"
                      value={personData.CityID}
                      onChange={handlePersonChange}
                      service={cityService}
                      displayField="CityName"
                      valueField="CityID"
                      placeholder="Search for city..."
                      disabled={isSubmitting}
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="Personal Email (Optional)"
                      name="personal_email"
                      value={personData.personal_email}
                      onChange={handlePersonChange}
                      onBlur={handlePersonBlur}
                      type="email"
                      disabled={isSubmitting}
                      error={isFieldInvalid('personal_email', true)}
                      helperText={getFieldError('personal_email', true)}
                      FormHelperTextProps={{
                        component: 'div'
                      }}
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="Personal Mobile (Optional)"
                      name="personal_mobile"
                      value={personData.personal_mobile}
                      onChange={handlePersonChange}
                      onBlur={handlePersonBlur}
                      disabled={isSubmitting}
                      error={isFieldInvalid('personal_mobile', true)}
                      helperText={getFieldError('personal_mobile', true)}
                      FormHelperTextProps={{
                        component: 'div'
                      }}
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      label="LinkedIn Link (Optional)"
                      name="linkedin_link"
                      value={personData.linkedin_link}
                      onChange={handlePersonChange}
                      onBlur={handlePersonBlur}
                      disabled={isSubmitting}
                      error={isFieldInvalid('linkedin_link', true)}
                      helperText={getFieldError('linkedin_link', true)}
                      FormHelperTextProps={{
                        component: 'div'
                      }}
                    />
                  </Box>
                </>
              )}

              {/* Job Title Dropdown - Required */}
              <Box>
                <SmartDropdown
                  label="Job Title"
                  name="JobTitleID"
                  value={contactData.JobTitleID}
                  onChange={handleContactChange}
                  service={jobTitleService}
                  displayField="JobTitleName"
                  valueField="JobTitleID"
                  placeholder="Search for job title..."
                  required
                  disabled={isSubmitting}
                  error={isFieldInvalid('JobTitleID', false)}
                  helperText={getFieldError('JobTitleID', false)}
                />
              </Box>

              {/* Work Email - Required */}
              <Box>
                <TextField
                  fullWidth
                  label="Work Email"
                  name="WorkEmail"
                  value={contactData.WorkEmail}
                  onChange={handleContactChange}
                  onBlur={handleContactBlur}
                  type="email"
                  required
                  disabled={isSubmitting}
                  error={isFieldInvalid('WorkEmail', false)}
                  helperText={getFieldError('WorkEmail', false)}
                  FormHelperTextProps={{
                    component: 'div'
                  }}
                />
              </Box>

              {/* Work Phone - Optional */}
              <Box>
                <TextField
                  fullWidth
                  label="Work Phone (Optional)"
                  name="WorkPhone"
                  value={contactData.WorkPhone}
                  onChange={handleContactChange}
                  onBlur={handleContactBlur}
                  disabled={isSubmitting}
                  error={isFieldInvalid('WorkPhone', false)}
                  helperText={getFieldError('WorkPhone', false)}
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
  );
};

export default CreateContactsPage;