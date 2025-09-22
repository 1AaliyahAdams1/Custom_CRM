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
  FormControlLabel,
  Checkbox,
  Skeleton,
} from '@mui/material';
import { ArrowBack, Save, Clear, Delete, CloudUpload, Edit } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import SmartDropdown from '../../components/SmartDropdown';
import theme from "../../components/Theme";

// Mock services - replace with actual services when frontend services are made
const venueService = {
  getAll: async () => {
    return [
      { VenueId: 1, VenueName: 'Madison Square Garden', CityID: 1, CountryID: 1 },
      { VenueId: 2, VenueName: 'Wembley Stadium', CityID: 8, CountryID: 3 },
      { VenueId: 3, VenueName: 'Rogers Centre', CityID: 5, CountryID: 2 },
      { VenueId: 4, VenueName: 'Cape Town Stadium', CityID: 11, CountryID: 8 },
      { VenueId: 5, VenueName: 'Hollywood Bowl', CityID: 2, CountryID: 1 },
    ];
  }
};

const companyService = {
  getAll: async () => {
    return [
      { ParentCompanyID: 1, ParentCompanyName: 'Live Nation Entertainment' },
      { ParentCompanyID: 2, ParentCompanyName: 'AEG Presents' },
      { ParentCompanyID: 3, ParentCompanyName: 'Ticketmaster' },
      { ParentCompanyID: 4, ParentCompanyName: 'Eventbrite' },
      { ParentCompanyID: 5, ParentCompanyName: 'StubHub' },
    ];
  }
};

const countryService = {
  getAll: async () => {
    return [
      { CountryID: 1, CountryName: 'United States' },
      { CountryID: 2, CountryName: 'Canada' },
      { CountryID: 3, CountryName: 'United Kingdom' },
      { CountryID: 4, CountryName: 'Germany' },
      { CountryID: 5, CountryName: 'France' },
      { CountryID: 6, CountryName: 'Australia' },
      { CountryID: 7, CountryName: 'Japan' },
      { CountryID: 8, CountryName: 'South Africa' },
    ];
  }
};

const cityService = {
  getByCountry: async (countryId) => {
    const cities = {
      1: [ // United States
        { CityID: 1, CityName: 'New York' },
        { CityID: 2, CityName: 'Los Angeles' },
        { CityID: 3, CityName: 'Chicago' },
        { CityID: 4, CityName: 'Houston' },
      ],
      2: [ // Canada
        { CityID: 5, CityName: 'Toronto' },
        { CityID: 6, CityName: 'Vancouver' },
        { CityID: 7, CityName: 'Montreal' },
      ],
      3: [ // United Kingdom
        { CityID: 8, CityName: 'London' },
        { CityID: 9, CityName: 'Manchester' },
        { CityID: 10, CityName: 'Birmingham' },
      ],
      8: [ // South Africa
        { CityID: 11, CityName: 'Cape Town' },
        { CityID: 12, CityName: 'Johannesburg' },
        { CityID: 13, CityName: 'Durban' },
      ]
    };
    return cities[countryId] || [];
  }
};

// Mock event service
const eventService = {
  getById: async (eventId) => {
    // Mock event data - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
    
    return {
      EventID: eventId,
      EventName: "Summer Music Festival 2025",
      VenueId: 1,
      VenueName: "Madison Square Garden",
      CountryID: 1,
      CityID: 1,
      City: "New York",
      Country: "United States",
      ParentCompanyID: 1,
      ParentCompanyName: "Live Nation Entertainment",
      EventDate: "2025-07-15T19:00",
      IsWeekly: false,
      Image1: "festival-image.jpg",
      CreatedDate: "2025-01-15T10:30:00",
      UpdatedDate: "2025-01-20T14:22:00",
      DateOfEdit: "2025-01-20T14:22:00"
    };
  }
};

const EditEvent = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [availableCities, setAvailableCities] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [eventData, setEventData] = useState(null);

  const [formData, setFormData] = useState({
    EventName: "",
    VenueId: "",
    CountryID: "",
    CityID: "",
    ParentCompanyID: "",
    EventDate: "",
    IsWeekly: false,
    Image1: null,
  });

  // Load event data on component mount
  useEffect(() => {
    loadEventData();
  }, [eventId]);

  const loadEventData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual service call
      const event = await eventService.getById(eventId);
      
      setEventData(event);
      
      // Populate form with existing data
      setFormData({
        EventName: event.EventName || "",
        VenueId: event.VenueId ? event.VenueId.toString() : "",
        CountryID: event.CountryID ? event.CountryID.toString() : "",
        CityID: event.CityID ? event.CityID.toString() : "",
        ParentCompanyID: event.ParentCompanyID ? event.ParentCompanyID.toString() : "",
        EventDate: event.EventDate ? event.EventDate.slice(0, 16) : "", // Format for datetime-local input
        IsWeekly: event.IsWeekly || false,
        Image1: null, // File input starts empty, but we track existing image
      });

      // Set current image if exists
      if (event.Image1) {
        setCurrentImageUrl(event.Image1);
      }

      // Load cities for the selected country
      if (event.CountryID) {
        const cities = await cityService.getByCountry(event.CountryID);
        setAvailableCities(cities);
      }

    } catch (error) {
      console.error('Error loading event:', error);
      if (error.response?.status === 404) {
        setError('Event not found');
      } else {
        setError('Failed to load event data. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced error display with icon
  const getFieldError = (fieldName) => {
    return touched[fieldName] && fieldErrors[fieldName] ? (
      <span style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ color: '#ff4444', marginRight: '4px' }}>✗</span>
        {fieldErrors[fieldName][0]}
      </span>
    ) : '';
  };

  const isFieldInvalid = (fieldName) => {
    return touched[fieldName] && fieldErrors[fieldName] && fieldErrors[fieldName].length > 0;
  };

  const validateField = (name, value) => {
    const errors = [];

    switch (name) {
      case 'EventName':
        if (!value || value.trim().length === 0) {
          errors.push('Event name is required');
        } else if (value.trim().length < 2) {
          errors.push('Event name must be at least 2 characters');
        } else if (value.trim().length > 200) {
          errors.push('Event name must be 200 characters or less');
        }
        break;

      case 'VenueId':
        if (!value) {
          errors.push('Venue is required');
        }
        break;

      case 'CountryID':
        if (!value) {
          errors.push('Country is required');
        }
        break;

      case 'CityID':
        if (!value) {
          errors.push('City is required');
        }
        break;

      case 'ParentCompanyID':
        if (!value) {
          errors.push('Parent company is required');
        }
        break;

      case 'EventDate':
        if (!value) {
          errors.push('Event date is required');
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (selectedDate < today) {
            errors.push('Event date cannot be in the past');
          }
        }
        break;
    }

    return errors;
  };

  const validateForm = () => {
    const newFieldErrors = {};
    let isValid = true;

    const requiredFields = ['EventName', 'VenueId', 'CountryID', 'CityID', 'ParentCompanyID', 'EventDate'];
    
    requiredFields.forEach(field => {
      const errors = validateField(field, formData[field]);
      if (errors.length > 0) {
        newFieldErrors[field] = errors;
        isValid = false;
      }
    });

    setFieldErrors(newFieldErrors);
    return isValid;
  };

  const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Handle country change - load cities
    if (name === 'CountryID' && value) {
      try {
        const cities = await cityService.getByCountry(parseInt(value));
        setAvailableCities(cities);
        // Reset city selection when country changes (unless it's the initial load)
        if (formData.CountryID !== value) {
          setFormData(prev => ({
            ...prev,
            CountryID: value,
            CityID: ""
          }));
        }
      } catch (error) {
        console.error('Error loading cities:', error);
        setAvailableCities([]);
      }
    } else if (name === 'CountryID' && !value) {
      setAvailableCities([]);
      setFormData(prev => ({
        ...prev,
        CountryID: "",
        CityID: ""
      }));
    }

    if (touched[name] && type !== 'checkbox') {
      const errors = validateField(name, newValue);
      setFieldErrors(prev => ({
        ...prev,
        [name]: errors.length > 0 ? errors : undefined
      }));
    }

    if (error) {
      setError(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPG, PNG, or GIF)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }

      setSelectedImage(file);
      setFormData(prev => ({
        ...prev,
        Image1: file
      }));
      setError(null);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const errors = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: errors.length > 0 ? errors : undefined
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const allTouched = {};
    ['EventName', 'VenueId', 'CountryID', 'CityID', 'ParentCompanyID', 'EventDate'].forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (!validateForm()) {
      setError("Please fix the errors below before submitting");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        EventID: eventId,
        VenueId: parseInt(formData.VenueId),
        CountryID: parseInt(formData.CountryID),
        CityID: parseInt(formData.CityID),
        ParentCompanyID: parseInt(formData.ParentCompanyID),
      };

      // TODO: Replace with actual service call
      // If image is selected, handle image upload separately
      // if (formData.Image1) {
      //   const imageFormData = new FormData();
      //   imageFormData.append('image', formData.Image1);
      //   await updateEventImage(eventId, imageFormData);
      // }
      
      // await updateEvent(eventId, submitData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccessMessage("Event updated successfully!");

      // Navigate after a short delay
      setTimeout(() => {
        navigate('/events');
      }, 1500);

    } catch (error) {
      console.error('Error updating event:', error);
      
      if (error.isValidation) {
        setError(error.message);
      } else if (error.response?.status === 409) {
        setError('Event with this name already exists at this venue on this date');
      } else if (error.response?.status === 400) {
        setError(error.response.data?.error || 'Invalid data provided');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later');
      } else {
        setError('Failed to update event. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      // TODO: Replace with actual service call
      // await deleteEvent(eventId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage("Event deleted successfully!");
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate('/events');
      }, 1500);

    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Failed to delete event. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    navigate('/events');
  };

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
          <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 3 }} />
            <Paper elevation={0} sx={{ p: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                <Skeleton variant="rectangular" height={56} sx={{ gridColumn: '1 / -1' }} />
                <Skeleton variant="rectangular" height={56} />
                <Skeleton variant="rectangular" height={56} />
                <Skeleton variant="rectangular" height={56} />
                <Skeleton variant="rectangular" height={56} />
                <Skeleton variant="rectangular" height={56} />
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4" sx={{ color: '#050505', fontWeight: 600 }}>
                Edit Event
              </Typography>
              {eventData && (
                <Typography variant="h6" sx={{ color: '#666', fontWeight: 400 }}>
                  #{eventData.EventID}
                </Typography>
              )}
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
                disabled={isSubmitting || isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={isDeleting ? <CircularProgress size={20} /> : <Delete />}
                onClick={handleDelete}
                disabled={isSubmitting || isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
              <Button
                variant="contained"
                startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
                onClick={handleSubmit}
                disabled={isSubmitting || isDeleting}
                sx={{
                  backgroundColor: '#050505',
                  '&:hover': { backgroundColor: '#333333' },
                }}
              >
                {isSubmitting ? 'Saving...' : 'Update Event'}
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          )}

          <Paper elevation={0} sx={{ p: 3 }}>
            {/* Event Metadata */}
            {eventData && (
              <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                {/* <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                  <strong>Created:</strong> {new Date(eventData.CreatedDate).toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                  <strong>Last Updated:</strong> {new Date(eventData.UpdatedDate).toLocaleString()}
                </Typography>
                {eventData.DateOfEdit && (
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    <strong>Last Edited:</strong> {new Date(eventData.DateOfEdit).toLocaleString()}
                  </Typography>
                )} */}
              </Box>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                
                {/* Event Name - Full width */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <TextField
                    fullWidth
                    label="Event Name"
                    name="EventName"
                    value={formData.EventName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    disabled={isSubmitting || isDeleting}
                    error={isFieldInvalid('EventName')}
                    helperText={getFieldError('EventName')}
                    placeholder="Enter the event name"
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                {/* Venue */}
                <Box>
                  <SmartDropdown
                    label="Venue"
                    name="VenueId"
                    value={formData.VenueId}
                    onChange={handleInputChange}
                    service={venueService}
                    displayField="VenueName"
                    valueField="VenueId"
                    required={true}
                    fullWidth={true}
                    placeholder="Search or select a venue"
                    disabled={isSubmitting || isDeleting}
                    error={isFieldInvalid('VenueId')}
                    helperText={getFieldError('VenueId')}
                  />
                </Box>

                {/* Parent Company */}
                <Box>
                  <SmartDropdown
                    label="Parent Company"
                    name="ParentCompanyID"
                    value={formData.ParentCompanyID}
                    onChange={handleInputChange}
                    service={companyService}
                    displayField="ParentCompanyName"
                    valueField="ParentCompanyID"
                    required={true}
                    fullWidth={true}
                    placeholder="Search or select a company"
                    disabled={isSubmitting || isDeleting}
                    error={isFieldInvalid('ParentCompanyID')}
                    helperText={getFieldError('ParentCompanyID')}
                  />
                </Box>

                {/* Country */}
                <Box>
                  <SmartDropdown
                    label="Country"
                    name="CountryID"
                    value={formData.CountryID}
                    onChange={handleInputChange}
                    service={countryService}
                    displayField="CountryName"
                    valueField="CountryID"
                    required={true}
                    fullWidth={true}
                    placeholder="Search or select a country"
                    disabled={isSubmitting || isDeleting}
                    error={isFieldInvalid('CountryID')}
                    helperText={getFieldError('CountryID')}
                  />
                </Box>

                {/* City */}
                <Box>
                  <SmartDropdown
                    label="City"
                    name="CityID"
                    value={formData.CityID}
                    onChange={handleInputChange}
                    service={{
                      getAll: async () => availableCities
                    }}
                    displayField="CityName"
                    valueField="CityID"
                    required={true}
                    fullWidth={true}
                    placeholder={!formData.CountryID ? 'Select country first' : 'Search or select a city'}
                    disabled={isSubmitting || isDeleting || !formData.CountryID}
                    error={isFieldInvalid('CityID')}
                    helperText={!formData.CountryID ? 'Please select a country first' : getFieldError('CityID')}
                  />
                </Box>

                {/* Event Date */}
                <Box>
                  <TextField
                    fullWidth
                    label="Event Date"
                    name="EventDate"
                    type="datetime-local"
                    value={formData.EventDate}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    disabled={isSubmitting || isDeleting}
                    error={isFieldInvalid('EventDate')}
                    helperText={getFieldError('EventDate')}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    FormHelperTextProps={{
                      component: 'div'
                    }}
                  />
                </Box>

                {/* Weekly Event Checkbox */}
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="IsWeekly"
                        checked={formData.IsWeekly}
                        onChange={handleInputChange}
                        disabled={isSubmitting || isDeleting}
                        sx={{ color: '#050505' }}
                      />
                    }
                    label="This is a weekly recurring event"
                  />
                </Box>

                {/* Image Upload - Full width */}
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Box sx={{ mb: 2 }}>
                    {/* <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                      Event Image
                    </Typography>
                    
                    {currentImageUrl && !selectedImage && (
                      <Box sx={{ mb: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                          Current image: {currentImageUrl}
                        </Typography>
                      </Box>
                    )}
                    
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUpload />}
                      disabled={isSubmitting || isDeleting}
                      sx={{ mr: 2 }}
                    >
                      {currentImageUrl ? 'Replace Image' : 'Upload Image'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </Button>
                    
                    {selectedImage && (
                      <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                        New image: {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
                      </Typography>
                    )}
                    
                    <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                      Optional: Upload an image for the event (JPG, PNG, GIF - Max 5MB)
                    </Typography> */}
                  </Box>
                </Box>

              </Box>

              {/* Form Summary */}
              <Box sx={{ 
                mt: 4, 
                pt: 3, 
                borderTop: '1px solid #e0e0e0',
                backgroundColor: '#f8f9fa',
                borderRadius: 1,
                p: 2
              }}>
                <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                  <strong>Required fields:</strong> Event Name, Venue, Parent Company, Country, City, Event Date
                </Typography>
                {/* <Typography variant="body2" sx={{ color: '#666' }}>
                  <strong>Optional fields:</strong> Weekly Recurring, Event Image
                </Typography> */}
              </Box>
            </form>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default EditEvent;