import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Alert, Typography } from "@mui/material";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";
import api from "../../utils/api";
import { getAllActivityTypes } from "../../services/sequenceService";

export default function SequenceItemDetailPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  
  const idRef = useRef(itemId);
  const navigateRef = useRef(navigate);

  const [sequenceItem, setSequenceItem] = useState(null);
  const [activityTypes, setActivityTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  useEffect(() => {
    idRef.current = itemId;
    navigateRef.current = navigate;
  }, [itemId, navigate]);

  // Load activity types for dropdown
  const loadActivityTypes = useCallback(async () => {
    try {
      const types = await getAllActivityTypes();
      setActivityTypes(types || []);
    } catch (err) {
      console.error("Failed to load activity types:", err);
    }
  }, []);

  const refreshSequenceItem = useCallback(async () => {
    if (!idRef.current) return;
    try {
      setLoading(true);
      const response = await api.get(`/sequences/items/${idRef.current}`);
      setSequenceItem(response.data);
      // Reset validation on refresh
      setValidationErrors({});
      setTouchedFields({});
    } catch (err) {
      console.error(err);
      setError("Failed to load sequence item details");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!itemId) {
      setError("No sequence item ID provided");
      setLoading(false);
      return;
    }
    
    // Load both activity types and sequence item
    Promise.all([
      loadActivityTypes(),
      refreshSequenceItem()
    ]);
  }, [itemId, loadActivityTypes, refreshSequenceItem]);

  const handleBack = useCallback(() => {
    navigateRef.current("/sequences/items");
  }, []);

  // Validation function
  const validateField = useCallback((fieldKey, value) => {
    const errors = [];

    switch (fieldKey) {
      case 'ActivityTypeID':
        if (!value) {
          errors.push('Activity Type is required');
        }
        break;
      
      case 'SequenceItemDescription':
        if (!value || value.trim() === '') {
          errors.push('Description is required');
        } else if (value.length > 255) {
          errors.push('Description cannot exceed 255 characters');
        }
        break;
      
      case 'DaysFromStart':
        if (value === undefined || value === null || value === '') {
          errors.push('Days from start is required');
        } else {
          const numValue = value.toString().trim();
          const days = parseInt(numValue, 10);
          if (isNaN(days) || numValue !== days.toString()) {
            errors.push('Must be a valid number');
          } else if (days < 0) {
            errors.push('Cannot be negative');
          } else if (days > 32767) {
            errors.push('Cannot exceed 32,767');
          }
        }
        break;
      
      default:
        break;
    }

    return errors;
  }, []);

  // Validate all required fields before save
  const validateAllFields = useCallback((formData) => {
    const allErrors = {};
    let isValid = true;

    // Validate ActivityTypeID
    const activityTypeErrors = validateField('ActivityTypeID', formData.ActivityTypeID);
    if (activityTypeErrors.length > 0) {
      allErrors.ActivityTypeID = activityTypeErrors[0];
      isValid = false;
    }

    // Validate SequenceItemDescription
    const descErrors = validateField('SequenceItemDescription', formData.SequenceItemDescription);
    if (descErrors.length > 0) {
      allErrors.SequenceItemDescription = descErrors[0];
      isValid = false;
    }

    // Validate DaysFromStart
    const daysErrors = validateField('DaysFromStart', formData.DaysFromStart);
    if (daysErrors.length > 0) {
      allErrors.DaysFromStart = daysErrors[0];
      isValid = false;
    }

    if (!isValid) {
      setValidationErrors(allErrors);
      
      // Mark all fields as touched to show errors
      setTouchedFields({
        ActivityTypeID: true,
        SequenceItemDescription: true,
        DaysFromStart: true,
        Active: true
      });
    }

    return isValid;
  }, [validateField]);

  // Handle field change with validation - THIS IS THE KEY FIX
  const handleFieldChange = useCallback((fieldKey, value) => {
    // Mark field as touched when user changes it
    setTouchedFields(prev => ({ ...prev, [fieldKey]: true }));

    // Validate the field immediately if it's already been touched
    const errors = validateField(fieldKey, value);
    
    setValidationErrors(prev => ({
      ...prev,
      [fieldKey]: errors.length > 0 ? errors[0] : null
    }));

    // Clear general error message when user starts typing
    if (error) setError(null);
  }, [validateField, error]);

  // Handle field blur - validate on blur
  const handleFieldBlur = useCallback((fieldKey, value) => {
    // Mark field as touched
    setTouchedFields(prev => ({ ...prev, [fieldKey]: true }));

    // Validate the field
    const errors = validateField(fieldKey, value);
    
    setValidationErrors(prev => ({
      ...prev,
      [fieldKey]: errors.length > 0 ? errors[0] : null
    }));
  }, [validateField]);

  // Create a service-like object that SmartDropdown expects
  const activityTypeService = useMemo(() => ({
    getAll: async () => activityTypes,
  }), [activityTypes]);

  // Service function to get activity type by ID (for displaying in view mode)
  const getActivityTypeById = useCallback(async (typeId) => {
    if (!typeId) return null;
    const type = activityTypes.find(t => t.TypeID === typeId);
    return type || { TypeID: typeId, TypeName: 'Unknown' };
  }, [activityTypes]);

  // Define main fields - 4 editable fields + read-only timestamp fields WITH VALIDATION
  const mainFields = useMemo(() => [
    { 
      key: 'ActivityTypeID',
      label: 'Activity Type',
      type: 'dropdown',
      required: true,
      optionsService: activityTypeService,
      displayField: 'TypeName',
      valueField: 'TypeID',
      service: getActivityTypeById,
      // Validation props - SHOW ERROR ONLY WHEN TOUCHED
      error: touchedFields.ActivityTypeID && validationErrors.ActivityTypeID ? true : false,
      helperText: touchedFields.ActivityTypeID && validationErrors.ActivityTypeID ? validationErrors.ActivityTypeID : '',
      onChange: (value) => handleFieldChange('ActivityTypeID', value),
      onBlur: (value) => handleFieldBlur('ActivityTypeID', value),
    },
    { 
      key: 'SequenceItemDescription',
      label: 'Description',
      type: 'textarea',
      required: true,
      rows: 4,
      // Validation props - SHOW ERROR ONLY WHEN TOUCHED
      error: touchedFields.SequenceItemDescription && validationErrors.SequenceItemDescription ? true : false,
      helperText: touchedFields.SequenceItemDescription && validationErrors.SequenceItemDescription ? validationErrors.SequenceItemDescription : '',
      onChange: (value) => handleFieldChange('SequenceItemDescription', value),
      onBlur: (value) => handleFieldBlur('SequenceItemDescription', value),
    },
    { 
      key: 'DaysFromStart',
      label: 'Days From Start',
      type: 'text',
      required: true,
      inputProps: {
        inputMode: 'numeric',
        pattern: '[0-9]*'
      },
      // Validation props - SHOW ERROR ONLY WHEN TOUCHED
      error: touchedFields.DaysFromStart && validationErrors.DaysFromStart ? true : false,
      helperText: touchedFields.DaysFromStart && validationErrors.DaysFromStart ? validationErrors.DaysFromStart : '',
      onChange: (value) => handleFieldChange('DaysFromStart', value),
      onBlur: (value) => handleFieldBlur('DaysFromStart', value),
    },
    { 
      key: 'Active',
      label: 'Active',
      type: 'boolean'
    },
    { 
      key: 'CreatedAt',
      label: 'Created At',
      type: 'datetime',
      readOnly: true
    },
    { 
      key: 'UpdatedAt',
      label: 'Updated At',
      type: 'datetime',
      readOnly: true
    },
  ], [activityTypeService, getActivityTypeById, touchedFields, validationErrors, handleFieldChange, handleFieldBlur]);

  // Header chips 
  const headerChips = useMemo(() => {
    if (!sequenceItem) return [];
    
    const chips = [];
    
    chips.push({
      label: sequenceItem.Active ? 'Active' : 'Inactive',
      color: sequenceItem.Active ? '#079141ff' : '#999999',
      textColor: '#ffffff'
    });
    
    if (sequenceItem.DaysFromStart !== undefined) {
      chips.push({
        label: `Day ${sequenceItem.DaysFromStart}`,
        color: '#2196f3',
        textColor: '#ffffff'
      });
    }
    
    return chips;
  }, [sequenceItem?.Active, sequenceItem?.DaysFromStart]);

  // Event handlers
  const handleSave = useCallback(async (formData) => {
    try {
      // Validate all fields before saving
      const isValid = validateAllFields(formData);
      
      if (!isValid) {
        setError('Please fix all validation errors before saving');
        return;
      }

      const payload = {
        ActivityTypeID: formData.ActivityTypeID,
        SequenceItemDescription: formData.SequenceItemDescription,
        DaysFromStart: parseInt(formData.DaysFromStart, 10),
        Active: formData.Active
      };
      
      await api.put(`/sequences/items/${idRef.current}`, payload);
      setSuccessMessage('Sequence item updated successfully');
      setValidationErrors({});
      setTouchedFields({});
      await refreshSequenceItem();
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.error || 'Failed to update sequence item');
    }
  }, [validateAllFields, refreshSequenceItem]);

  const handleDelete = useCallback(async () => {
    try {
      await api.delete(`/sequences/items/${idRef.current}`);
      navigateRef.current('/sequences/items');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete sequence item');
    }
  }, []);

  if (loading) return <Typography>Loading sequence item details...</Typography>;
  if (error && !sequenceItem) return <Alert severity="error">{error}</Alert>;
  if (!sequenceItem) return <Alert severity="warning">Sequence item not found.</Alert>;

  return (
    <Box sx={{ width: "100%", p: 2, backgroundColor: "#fafafa", minHeight: "100vh" }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}
      
      <UniversalDetailView
        title={sequenceItem.SequenceItemDescription || 'Sequence Item Details'}
        subtitle={`Item ID: ${sequenceItem.SequenceItemID} | Sequence: ${sequenceItem.SequenceName || 'N/A'}`}
        item={sequenceItem}
        mainFields={mainFields}
        relatedTabs={[]}
        onBack={handleBack}
        onSave={handleSave}
        onDelete={handleDelete}
        loading={loading}
        error={null}
        headerChips={headerChips}
        entityType="sequence-item"
      />
    </Box>
  );
}