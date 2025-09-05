import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Alert } from "@mui/material";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";
import NotesPopup from "../../components/NotesComponent";
import AttachmentsPopup from "../../components/AttachmentsComponent";
import { fetchDealById, updateDeal, deactivateDeal } from "../../services/dealService";
import { getAllAccounts } from "../../services/accountService";
import { dealStageService, currencyService } from "../../services/dropdownServices";

const accountService = { getAll: async () => (await getAllAccounts()).data };

const dealMainFields = [
  { key: "AccountID", label: "Account", type: "dropdown", service: accountService, displayField: "AccountName", valueField: "AccountID", width: { xs: 12, md: 6 } },
  { key: "DealStageID", label: "Deal Stage", type: "dropdown", service: dealStageService, displayField: "StageName", valueField: "DealStageID", width: { xs: 12, md: 6 } },
  { key: "DealName", label: "Deal Name", type: "text", required: true, width: { xs: 12, md: 6 } },
  { key: "Value", label: "Value", type: "number", width: { xs: 12, md: 6 } },
  { key: "CloseDate", label: "Close Date", type: "date", width: { xs: 12, md: 6 } },
  { key: "Probability", label: "Probability (%)", type: "number", min: 0, max: 100, width: { xs: 12, md: 6 } },
  { key: "CurrencyID", label: "Currency", type: "dropdown", service: currencyService, displayField: "CurrencyCode", valueField: "CurrencyID", width: { xs: 12, md: 6 } },
  { key: "Description", label: "Description", type: "textarea", rows: 3, width: { xs: 12 } },
];

export default function DealDetailsForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [attachmentsPopupOpen, setAttachmentsPopupOpen] = useState(false);

  useEffect(() => {
    const fetchDeal = async () => {
      if (!id) {
        setError("No deal ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetchDealById(id);
        const dealData = response?.data || response;
        
        if (!dealData) {
          throw new Error("Deal not found");
        }
        
        setDeal(dealData);
      } catch (err) {
        console.error("Error loading deal:", err);
        setError(err.message || "Failed to load deal details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDeal();
  }, [id]);

  const handleSave = async (formData) => {
    try {
      setError(null);
      
      // Optimistic UI update
      setDeal(formData);
      
      await updateDeal(id, formData);
      setSuccessMessage("Deal updated successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error saving deal:", err);
      setError(err.message || "Failed to update deal");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to deactivate this deal?")) return;

    try {
      setError(null);
      await deactivateDeal(id);
      setSuccessMessage("Deal deactivated successfully!");
      setTimeout(() => navigate("/deals"), 1500);
    } catch (err) {
      console.error("Error deactivating deal:", err);
      setError(err.message || "Failed to deactivate deal");
    }
  };

  const handleBack = () => navigate("/deals");
  const handleAddNote = () => setNotesPopupOpen(true);
  const handleAddAttachment = () => setAttachmentsPopupOpen(true);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        Loading deal details...
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!deal) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Deal not found.</Alert>
      </Box>
    );
  }

  // Header chips
  const headerChips = [];
  if (deal) {
    if (deal.StageName) {
      // Color code by deal stage
      const stageColors = {
        'Qualified': '#3b82f6',
        'Proposal': '#f59e0b',
        'Negotiation': '#ef4444',
        'Closed Won': '#10b981',
        'Closed Lost': '#6b7280'
      };
      headerChips.push({
        label: deal.StageName,
        color: stageColors[deal.StageName] || '#6b7280',
        textColor: '#fff'
      });
    }

    if (deal.Value && deal.CurrencyCode) {
      headerChips.push({
        label: `${deal.CurrencyCode} ${deal.Value.toLocaleString()}`,
        color: '#059669',
        textColor: '#fff'
      });
    }

    if (deal.Probability !== null && deal.Probability !== undefined) {
      headerChips.push({
        label: `${deal.Probability}% Probability`,
        color: '#7c3aed',
        textColor: '#fff'
      });
    }
  }

  const relatedTabs = []; // Add related tabs if needed

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      <UniversalDetailView
        title={deal.DealName || "Deal Details"}
        subtitle={deal?.DealID ? `ID: ${deal.DealID}` : undefined}
        item={deal}
        mainFields={dealMainFields}
        relatedTabs={relatedTabs}
        onBack={handleBack}
        onSave={handleSave}
        onDelete={handleDelete}
        onAddNote={handleAddNote}
        onAddAttachment={handleAddAttachment}
        entityType="deal"
        headerChips={headerChips}
        sx={{
          "& .MuiGrid-root": {
            alignItems: "start", // align grid fields naturally
          },
        }}
      />

      <NotesPopup 
        open={notesPopupOpen} 
        onClose={() => setNotesPopupOpen(false)} 
        entityType="deal" 
        entityId={deal?.DealID} 
      />
      <AttachmentsPopup 
        open={attachmentsPopupOpen} 
        onClose={() => setAttachmentsPopupOpen(false)} 
        entityType="deal" 
        entityId={deal?.DealID} 
      />
    </Box>
  );
}