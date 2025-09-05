import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DealsPage from "../../pages/Deals/DealsPage";
import {
  getAllDeals,
  fetchDealsByUser,
  deactivateDeal,
} from "../../services/dealService";
import ConfirmDialog from "../../components/ConfirmDialog";

const DealsContainer = () => {
  const navigate = useNavigate();

  const [deals, setDeals] = useState([]);
  const [selectedDeals, setSelectedDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(false);

  // Delete confirm dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const roles = Array.isArray(storedUser.roles) ? storedUser.roles : [];
  const userId = storedUser.UserID || storedUser.id || null;

  const isCLevel = roles.includes("C-level");
  const isSalesRep = roles.includes("Sales Representative");

  // ---------------- FETCH DEALS ----------------
  const fetchDeals = async () => {
    setLoading(true);
    setError(null);

    try {
      let dealsData = [];

      if (isCLevel) {
        dealsData = (await getAllDeals(true)) || [];
      } else if (isSalesRep && userId) {
        dealsData = (await fetchDealsByUser(userId)) || [];
      }

      setDeals(dealsData);
    } catch {
      setError("Failed to load deals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [refreshFlag]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // ---------------- FILTERING + SEARCH ----------------
  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const matchesSearch =
        (deal.DealName &&
          deal.DealName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (deal.AccountID &&
          deal.AccountID.toString().includes(searchTerm)) ||
        (deal.DealStageID &&
          deal.DealStageID.toString().includes(searchTerm)) ||
        (deal.Value && deal.Value.toString().includes(searchTerm));

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "Active" && deal.Status === "Active") ||
        (statusFilter === "Inactive" && deal.Status === "Inactive");

      return matchesSearch && matchesStatus;
    });
  }, [deals, searchTerm, statusFilter]);

  // ---------------- HANDLERS ----------------
  const handleSelectClick = (id) => {
    setSelectedDeals((prev) =>
      prev.includes(id) ? prev.filter((dealId) => dealId !== id) : [...prev, id]
    );
  };

  const handleSelectAllClick = (checked) => {
    setSelectedDeals(checked ? filteredDeals.map((deal) => deal.DealID) : []);
  };

  const handleDeactivateClick = (deal) => {
    setDealToDelete(deal);
    setDeleteDialogOpen(true);
  };

  const confirmDeactivate = async () => {
    if (!dealToDelete) return;

    try {
      await deactivateDeal(dealToDelete.DealID);
      setSuccessMessage("Deal deactivated successfully.");
      setRefreshFlag((flag) => !flag);
    } catch {
      setError("Failed to deactivate deal. Please try again.");
    } finally {
      setDeleteDialogOpen(false);
      setDealToDelete(null);
    }
  };

  const handleEdit = (deal) => navigate(`/deals/edit/${deal.DealID}`);

  const handleView = (deal) => {
    if (!deal?.DealID) return;
    navigate(`/deals/${deal.DealID}`);
  };

  const handleOpenCreate = () => navigate("/deals/create");

  const handleAddNote = (deal) => navigate(`/deals/${deal.DealID}/notes`);

  const handleAddAttachment = (deal) =>
    navigate(`/deals/${deal.DealID}/attachments`);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
  };

  return (
    <>
      <DealsPage
        deals={filteredDeals}
        loading={loading}
        error={error}
        successMessage={successMessage}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        selectedDeals={selectedDeals}
        setSearchTerm={setSearchTerm}
        setStatusFilter={setStatusFilter}
        setSuccessMessage={setSuccessMessage}
        onSelectClick={handleSelectClick}
        onSelectAllClick={handleSelectAllClick}
        onDeactivate={handleDeactivateClick} 
        onEdit={handleEdit}
        onView={handleView}
        onCreate={handleOpenCreate}
        onAddNote={handleAddNote}
        onAddAttachment={handleAddAttachment}
        clearFilters={clearFilters}
        totalCount={deals.length}
      />

      {/*Confirm deactivate dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Deactivate Deal"
        description={`Are you sure you want to deactivate this deal${
          dealToDelete?.DealName ? ` (“${dealToDelete.DealName}”)` : ""
        }?`}
        onConfirm={confirmDeactivate}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  );
};

export default DealsContainer;
