import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Alert, Typography } from "@mui/material";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";
import { fetchSequenceById, fetchSequenceWithItems } from "../../services/sequenceService";

export default function SequencesDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const idRef = useRef(id);
  const navigateRef = useRef(navigate);

  const [sequence, setSequence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

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
        const allData = response?.data || response;
        
        // Filter out the sequence info and keep only items
        const items = allData.filter(item => item.SequenceItemID);
        
        // Remove duplicates based on SequenceItemID
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
            { field: 'PriorityLevelName', headerName: 'Priority', type: 'text', defaultVisible: true },
            { field: 'PriorityLevelValue', headerName: 'Priority Value', type: 'number', defaultVisible: true },
            { field: 'ItemCreatedAt', headerName: 'Created', type: 'dateTime', defaultVisible: true },
            {
              field: 'ItemActive',
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

  // Action handlers for sequence items
  const relatedDataActions = useMemo(() => {
    const actions = {
      sequenceItem: {
        view: (item) => {
          console.log('View sequence item:', item);
        },
        edit: (item) => {
          console.log('Edit sequence item:', item);
        },
        delete: async (item) => {
          console.log('Delete sequence item:', item);
        },
        addNote: (item) => {
          console.log('Add note to sequence item:', item);
        },
        addAttachment: (item) => {
          console.log('Add attachment to sequence item:', item);
        }
      },
      note: {
        view: (note) => {
          console.log('View note:', note);
        },
        edit: (note) => {
          console.log('Edit note:', note);
        },
        delete: async (note) => {
          console.log('Delete note:', note);
        }
      },
      attachment: {
        view: (attachment) => {
          console.log('View attachment:', attachment);
        },
        delete: async (attachment) => {
          console.log('Delete attachment:', attachment);
        }
      }
    };
    return actions;
  }, []);

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
      console.log('Saving sequence:', formData);
      setSuccessMessage('Sequence updated successfully');
      await refreshSequence();
    } catch (err) {
      setError('Failed to update sequence');
    }
  }, [refreshSequence]);

  const handleDelete = useCallback(async (formData) => {
    try {
      console.log('Deleting sequence:', formData);
      navigateRef.current('/sequences');
    } catch (err) {
      setError('Failed to delete sequence');
    }
  }, []);

  const handleRefreshRelatedData = useCallback((tabKey) => {
    console.log('Refresh tab data:', tabKey);
  }, []);

  const handleAddNote = useCallback((item) => {
    console.log('Add note to sequence:', item);
  }, []);

  const handleAddAttachment = useCallback((item) => {
    console.log('Add attachment to sequence:', item);
  }, []);

  if (loading) return <Typography>Loading sequence details...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!sequence) return <Alert severity="warning">Sequence not found.</Alert>;

  return (
    <Box sx={{ width: "100%", p: 2, backgroundColor: "#fafafa", minHeight: "100vh" }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
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
        onAddNote={handleAddNote}
        onAddAttachment={handleAddAttachment}
        loading={loading}
        error={error}
        headerChips={headerChips}
        entityType="sequence"
        relatedDataActions={relatedDataActions}
        onRefreshRelatedData={handleRefreshRelatedData}
      />
    </Box>
  );
}