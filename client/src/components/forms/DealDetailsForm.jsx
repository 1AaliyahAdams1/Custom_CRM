import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Alert } from "@mui/material";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";
import { fetchDealById, updateDeal, deactivateDeal } from "../../services/dealService";
import { getAllAccounts } from "../../services/accountService";
import { dealStageService } from "../../services/dropdownServices";

const accountService = {getAll: async () => (await getAllAccounts()).data}

const dealMainFields = [
  { key: "AccountID", label: "Account", type: "dropdown", service: accountService, displayField: "AccountName", valueField: "AccountID", width: { xs: 12, md: 6 } },
  { key: "DealStageID", label: "Deal Stage", type: "dropdown", service: dealStageService, displayField: "StageName", valueField: "DealStageID", width: { xs: 12, md: 6 } },
  { key: "DealName", label: "Deal Name", type: "text", required: true, width: { xs: 12, md: 6 } },
  { key: "Value", label: "Value", type: "number", width: { xs: 12, md: 6 } },
  { key: "CloseDate", label: "Close Date", type: "date", width: { xs: 12, md: 6 } },
  { key: "Probability", label: "Probability (%)", type: "number", width: { xs: 12, md: 6 } },
  { key: "CurrencyID", label: "Currency", type: "text", width: { xs: 12, md: 6 } },
];

export default function DealDetailsForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchDeal = async () => {
      if (!id) return setError("No deal ID provided");

      try {
        setLoading(true);
        setError(null);
        const response = await fetchDealById(id);
        const dealData = response?.data || response;
        if (!dealData) throw new Error("Deal not found");
        setDeal(dealData);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load deal details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDeal();
  }, [id]);

  const handleSave = async (formData) => {
    try {
      await updateDeal(id, formData);
      setDeal(formData);
      setSuccessMessage("Deal updated successfully!");
    } catch (err) {
      console.error(err);
      setError(`Failed to update deal: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to deactivate this deal?")) return;

    try {
      await deactivateDeal(id);
      setSuccessMessage("Deal deactivated successfully!");
      setTimeout(() => navigate("/deals"), 1500);
    } catch (err) {
      console.error(err);
      setError(`Failed to deactivate deal: ${err.message}`);
    }
  };

  const relatedTabs = []; // Add related tabs if needed

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        Loading deal details...
      </Box>
    );
  if (error)
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  if (!deal)
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Deal not found.</Alert>
      </Box>
    );

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
        onSave={handleSave}
        onDelete={handleDelete}
        entityType="deal"
        sx={{
          "& .MuiGrid-root": {
            alignItems: "start", // align grid fields naturally
          },
        }}
      />
    </Box>
  );
}
