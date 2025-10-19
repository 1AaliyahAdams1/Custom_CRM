import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Alert, Typography } from "@mui/material";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";
import { 
  fetchSequenceById, 
  fetchSequenceWithItems,
  updateSequence,
  deactivateSequence,
  reactivateSequence,
  updateSequenceItem
} from "../../services/sequenceService";
import ConfirmDialog from "../../components/dialogs/ConfirmDialog";

export default function SequencesDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const idRef = useRef(id);
  const navigateRef = useRef(navigate);

  const [sequence, setSequence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: null,
  });

  useEffect(() => {
    idRef.current = id;
    navigateRef.current = navigate;
  }, [id, navigate]);

  const refreshSequence = useCallback(async () => {
    if (!idRef.current) return;
    try {
      setLoading(true);
      const data = await fetchSequenceById(parseInt(idRef.current, 10));
      setSequence(data?.data || data);
    } catch (err) {
      console.error(err);
      setError("Failed to load sequence details");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!id) {
      setError("No sequence ID provided");
      setLoading(false);
      return;
    }
    refreshSequence();
  }, [id, refreshSequence]);

  const handleBack = useCallback(() => {
    navigateRef.current("/sequences");
  }, []);

  // Define main fields
  const mainFields = useMemo(() => [
    { key: 'SequenceName', label: 'Sequence Name', type: 'text', required: true },
    { key: 'SequenceDescription', label: 'Description', type: 'textarea' },
    { key: 'Active', label: 'Active', type: 'boolean' },
    { key: 'CreatedAt', label: 'Created At', type: 'datetime' },
    { key: 'UpdatedAt', label: 'Updated At', type: 'datetime' },
  ], []);

  // Create data service for sequence items
  const createSequenceItemsDataService = useCallback(() => {
    return async () => {
      try {
        const sequenceId = parseInt(idRef.current, 10);
        const response = await fetchSequenceWithItems(sequenceId);
        const sequenceData = response?.data || response;
        
        console.log('Sequence data received:', sequenceData);
        
        let items = [];
        
        if (sequenceData && typeof sequenceData === 'object') {
          items = sequenceData.Items || 
                  sequenceData.items || 
                  sequenceData.SequenceItems || 
                  sequenceData.sequenceItems ||
                  [];
        } else if (Array.isArray(sequenceData)) {
          items = sequenceData;
        }
        
        if (!Array.isArray(items)) {
          console.warn('Could not find items array in response. Expected Items property. Got:', sequenceData);
          return { data: [] };
        }
        
        const uniqueItems = items.reduce((acc, current) => {
          const exists = acc.find(item => item.SequenceItemID === current.SequenceItemID);
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, []);
        
        return { data: uniqueItems };
      } catch (error) {
        console.error('Error fetching sequence items:', error);
        throw error;
      }
    };
  }, []);

  // Action handlers for sequence items
  const relatedDataActions = useMemo(() => ({
    'sequence-items': { 
      view: (item) => {
        navigate(`/sequences/items/${item.SequenceItemID}`);
      },
      edit: (item) => {
        navigate(`/sequences/items/edit/${item.SequenceItemID}`);
      },
      delete: async (item) => {
        setConfirmDialog({
          open: true,
          title: 'Deactivate Sequence Item',
          description: `Are you sure you want to deactivate "${item.SequenceItemDescription || 'this sequence item'}"? This action can be reversed.`,
          onConfirm: async () => {
            try {
              await updateSequenceItem(item.SequenceItemID, {
                SequenceID: item.SequenceID,
                ActivityTypeID: item.ActivityTypeID,
                SequenceItemDescription: item.SequenceItemDescription,
                DaysFromStart: item.DaysFromStart,
                Active: false
              });
              setSuccessMessage('Sequence item deactivated successfully');
              await refreshSequence();
              setConfirmDialog({ open: false, title: '', description: '', onConfirm: null });
            } catch (err) {
              setError(err.message || 'Failed to deactivate sequence item');
              setConfirmDialog({ open: false, title: '', description: '', onConfirm: null });
            }
          }
        });
      },
      reactivate: async (item) => {
        setConfirmDialog({
          open: true,
          title: 'Reactivate Sequence Item',
          description: `Are you sure you want to reactivate "${item.SequenceItemDescription || 'this sequence item'}"?`,
          onConfirm: async () => {
            try {
              await updateSequenceItem(item.SequenceItemID, {
                SequenceID: item.SequenceID,
                ActivityTypeID: item.ActivityTypeID,
                SequenceItemDescription: item.SequenceItemDescription,
                DaysFromStart: item.DaysFromStart,
                Active: true
              });
              setSuccessMessage('Sequence item reactivated successfully');
              await refreshSequence();
              setConfirmDialog({ open: false, title: '', description: '', onConfirm: null });
            } catch (err) {
              setError(err.message || 'Failed to reactivate sequence item');
              setConfirmDialog({ open: false, title: '', description: '', onConfirm: null });
            }
          }
        });
      },
    },
    // Also add by entityType to ensure it works
    'sequenceItem': { 
      view: (item) => {
        navigate(`/sequences/items/${item.SequenceItemID}`);
      },
      edit: (item) => {
        navigate(`/sequences/items/edit/${item.SequenceItemID}`);
      },
      delete: async (item) => {
        setConfirmDialog({
          open: true,
          title: 'Deactivate Sequence Item',
          description: `Are you sure you want to deactivate "${item.SequenceItemDescription || 'this sequence item'}"? This action can be reversed.`,
          onConfirm: async () => {
            try {
              await updateSequenceItem(item.SequenceItemID, {
                SequenceID: item.SequenceID,
                ActivityTypeID: item.ActivityTypeID,
                SequenceItemDescription: item.SequenceItemDescription,
                DaysFromStart: item.DaysFromStart,
                Active: false
              });
              setSuccessMessage('Sequence item deactivated successfully');
              await refreshSequence();
              setConfirmDialog({ open: false, title: '', description: '', onConfirm: null });
            } catch (err) {
              setError(err.message || 'Failed to deactivate sequence item');
              setConfirmDialog({ open: false, title: '', description: '', onConfirm: null });
            }
          }
        });
      },
      reactivate: async (item) => {
        setConfirmDialog({
          open: true,
          title: 'Reactivate Sequence Item',
          description: `Are you sure you want to reactivate "${item.SequenceItemDescription || 'this sequence item'}"?`,
          onConfirm: async () => {
            try {
              await updateSequenceItem(item.SequenceItemID, {
                SequenceID: item.SequenceID,
                ActivityTypeID: item.ActivityTypeID,
                SequenceItemDescription: item.SequenceItemDescription,
                DaysFromStart: item.DaysFromStart,
                Active: true
              });
              setSuccessMessage('Sequence item reactivated successfully');
              await refreshSequence();
              setConfirmDialog({ open: false, title: '', description: '', onConfirm: null });
            } catch (err) {
              setError(err.message || 'Failed to reactivate sequence item');
              setConfirmDialog({ open: false, title: '', description: '', onConfirm: null });
            }
          }
        });
      },
    },
  }), [navigate, refreshSequence]);

  // Define related tabs
  const relatedTabs = useMemo(() => {
    const tabs = [
      {
        key: 'sequence-items',
        label: 'Sequence Items',
        entityType: 'sequenceItem',
        tableConfig: {
          idField: 'SequenceItemID',
          columns: [
            { field: 'DaysFromStart', headerName: 'Day', type: 'number', defaultVisible: true },
            { field: 'ActivityTypeName', headerName: 'Activity Type', type: 'text', defaultVisible: true },
            { field: 'SequenceItemDescription', headerName: 'Description', type: 'truncated', maxWidth: 300, defaultVisible: true },
            { field: 'CreatedAt', headerName: 'Created', type: 'dateTime', defaultVisible: true },
            {
              field: 'Active',
              headerName: 'Active',
              type: 'chip',
              chipLabels: { true: 'Active', false: 'Inactive' },
              chipColors: { true: '#079141ff', false: '#999999' },
              defaultVisible: true,
            }
          ]
        },
        dataService: createSequenceItemsDataService()
      }
    ];
    return tabs;
  }, [createSequenceItemsDataService]);

  // Header chips 
  const headerChips = useMemo(() => {
    if (!sequence) return [];
    
    const chips = [];
    chips.push({
      label: sequence.Active ? 'Active' : 'Inactive',
      color: sequence.Active ? '#079141ff' : '#999999',
      textColor: '#ffffff'
    });
    return chips;
  }, [sequence?.Active]);

  // Event handlers
  const handleSave = useCallback(async (formData) => {
    try {
      console.log('Saving sequence with data:', formData);
      
      const updatePayload = {
        SequenceName: formData.SequenceName,
        SequenceDescription: formData.SequenceDescription,
        Active: formData.Active
      };
      
      await updateSequence(parseInt(idRef.current, 10), updatePayload);
      
      setSuccessMessage('Sequence updated successfully');
      await refreshSequence();
    } catch (err) {
      console.error('Error updating sequence:', err);
      setError(err.message || 'Failed to update sequence');
      throw err;
    }
  }, [refreshSequence]);

  const handleDelete = useCallback(async (formData) => {
    setConfirmDialog({
      open: true,
      title: 'Deactivate Sequence',
      description: `Are you sure you want to deactivate "${formData.SequenceName}"? This action can be reversed.`,
      onConfirm: async () => {
        try {
          await deactivateSequence(parseInt(idRef.current, 10));
          setSuccessMessage('Sequence deactivated successfully');
          await refreshSequence();
          setConfirmDialog({ open: false, title: '', description: '', onConfirm: null });
        } catch (err) {
          setError(err.message || 'Failed to deactivate sequence');
          setConfirmDialog({ open: false, title: '', description: '', onConfirm: null });
        }
      }
    });
  }, [refreshSequence]);

  const handleReactivate = useCallback(async (formData) => {
    setConfirmDialog({
      open: true,
      title: 'Reactivate Sequence',
      description: `Are you sure you want to reactivate "${formData.SequenceName}"?`,
      onConfirm: async () => {
        try {
          await reactivateSequence(parseInt(idRef.current, 10));
          setSuccessMessage('Sequence reactivated successfully');
          await refreshSequence();
          setConfirmDialog({ open: false, title: '', description: '', onConfirm: null });
        } catch (err) {
          setError(err.message || 'Failed to reactivate sequence');
          setConfirmDialog({ open: false, title: '', description: '', onConfirm: null });
        }
      }
    });
  }, [refreshSequence]);

  const handleRefreshRelatedData = useCallback((tabKey) => {
    console.log('Refresh tab data:', tabKey);
    refreshSequence();
  }, [refreshSequence]);

  if (loading) return <Typography>Loading sequence details...</Typography>;
  if (error && !sequence) return <Alert severity="error">{error}</Alert>;
  if (!sequence) return <Alert severity="warning">Sequence not found.</Alert>;

  return (
    <Box sx={{ width: "100%", p: 2, backgroundColor: "#fafafa", minHeight: "100vh" }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <UniversalDetailView
        title={sequence.SequenceName || 'Sequence Details'}
        subtitle={`Sequence ID: ${sequence.SequenceID}`}
        item={sequence}
        mainFields={mainFields}
        relatedTabs={relatedTabs}
        onBack={handleBack}
        onSave={handleSave}
        onDelete={handleDelete}
        onReactivate={handleReactivate}
        loading={loading}
        error={null}
        headerChips={headerChips}
        entityType="sequence"
        relatedDataActions={relatedDataActions}
        onRefreshRelatedData={handleRefreshRelatedData}
        // Don't pass these - let relatedDataActions control everything
      />
      
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ open: false, title: '', description: '', onConfirm: null })}
      />
    </Box>
  );
}