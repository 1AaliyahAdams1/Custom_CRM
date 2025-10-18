import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Alert, Typography } from "@mui/material";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";
import api from "../../utils/api";

export default function SequenceItemDetailPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  
  const idRef = useRef(itemId);
  const navigateRef = useRef(navigate);

  const [sequenceItem, setSequenceItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    idRef.current = itemId;
    navigateRef.current = navigate;
  }, [itemId, navigate]);

  const refreshSequenceItem = useCallback(async () => {
    if (!idRef.current) return;
    try {
      setLoading(true);
      const response = await api.get(`/sequences/items/${idRef.current}`);
      setSequenceItem(response.data);
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
    refreshSequenceItem();
  }, [itemId, refreshSequenceItem]);

  const handleBack = useCallback(() => {
    navigateRef.current("/sequences/items");
  }, []);

  // Define main fields
  const mainFields = useMemo(() => [
    { key: 'SequenceItemID', label: 'Item ID', type: 'text', readOnly: true },
    { key: 'SequenceName', label: 'Sequence', type: 'text', readOnly: true },
    { key: 'ActivityTypeName', label: 'Activity Type', type: 'text', required: true },
    { key: 'SequenceItemDescription', label: 'Description', type: 'textarea', required: true },
    { key: 'DaysFromStart', label: 'Days From Start', type: 'number', required: true },
    { key: 'Active', label: 'Active', type: 'boolean' },
    { key: 'CreatedAt', label: 'Created At', type: 'datetime', readOnly: true },
    { key: 'UpdatedAt', label: 'Updated At', type: 'datetime', readOnly: true },
  ], []);

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
      const payload = {
        ActivityTypeID: formData.ActivityTypeID,
        SequenceItemDescription: formData.SequenceItemDescription,
        DaysFromStart: formData.DaysFromStart,
      };
      
      await api.put(`/sequences/items/${idRef.current}`, payload);
      setSuccessMessage('Sequence item updated successfully');
      await refreshSequenceItem();
    } catch (err) {
      setError('Failed to update sequence item');
    }
  }, [refreshSequenceItem]);

  const handleDelete = useCallback(async () => {
    try {
      await api.delete(`/sequences/items/${idRef.current}`);
      navigateRef.current('/sequences/items');
    } catch (err) {
      setError('Failed to delete sequence item');
    }
  }, []);

  if (loading) return <Typography>Loading sequence item details...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!sequenceItem) return <Alert severity="warning">Sequence item not found.</Alert>;

  return (
    <Box sx={{ width: "100%", p: 2, backgroundColor: "#fafafa", minHeight: "100vh" }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}
      
      <UniversalDetailView
        title={sequenceItem.SequenceItemDescription || 'Sequence Item Details'}
        subtitle={`Item ID: ${sequenceItem.SequenceItemID}`}
        item={sequenceItem}
        mainFields={mainFields}
        relatedTabs={[]}
        onBack={handleBack}
        onSave={handleSave}
        onDelete={handleDelete}
        loading={loading}
        error={error}
        headerChips={headerChips}
        entityType="sequence-item"
      />
    </Box>
  );
}