import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DealsPage from "../../pages/DealsPage";
import {
  getAllDeals,
  getDealsByUser,
  deactivateDeal,
} from "../../services/dealService";

const DealsContainer = () => {
  const navigate = useNavigate();

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const roles = Array.isArray(storedUser.roles) ? storedUser.roles : [];
  const userId = storedUser.UserID || storedUser.id || null;

  const isCLevel = roles.includes("C-level");
  const isSalesRep = roles.includes("Sales Representative");

  const fetchDeals = async () => {
    setLoading(true);
    setError(null);

    try {
      let dealsData = [];

      console.log("User Roles:", roles);
      console.log("User ID:", userId);

      if (isCLevel) {
        console.log("Fetching all deals for C-level user");
        const response = await getAllDeals(true);
        dealsData = response || [];
      } else if (isSalesRep && userId) {
        console.log("Fetching deals for Sales Representative");
        const response = await getDealsByUser(userId);
        dealsData = response || [];
      } else {
        console.log("No matching role for fetching deals");
        dealsData = [];
      }

      setDeals(dealsData);
    } catch (err) {
      console.error("Failed to load deals:", err);
      setError("Failed to load deals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [refreshFlag]);

  // Automatically clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Filter and search logic
  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const matchesSearch =
        (deal.DealName &&
          deal.DealName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (deal.AccountID && deal.AccountID.toString().includes(searchTerm)) ||
        (deal.DealStageID &&
          deal.DealStageID.toString().includes(searchTerm)) ||
        (deal.Value && deal.Value.toString().includes(searchTerm));

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "high" && deal.Probability >= 75) ||
        (statusFilter === "medium" &&
          deal.Probability >= 50 &&
          deal.Probability < 75) ||
        (statusFilter === "low" && deal.Probability < 50);

      return matchesSearch && matchesStatus;
    });
  }, [deals, searchTerm, statusFilter]);

  // Handler to deactivate (soft delete) a deal
  const handleDeactivate = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this deal? This will deactivate it."
    );
    if (!confirm) return;

    setError(null);
    try {
      console.log("Deactivating (soft deleting) deal with ID:", id);
      await deactivateDeal(id);
      setSuccessMessage("Deal deleted successfully.");
      setRefreshFlag((flag) => !flag);
    } catch (error) {
      console.error("Failed to delete deal:", error);
      setError("Failed to delete deal. Please try again.");
    }
  };

  const handleEdit = (deal) => {
    navigate(`/deals/edit/${deal.DealID}`, { state: { deal } });
  };

  const handleView = (dealId) => {
    console.log("Navigating to deal details with ID:", dealId);
    navigate(`/deals/${dealId}`);
  };

  const handleOpenCreate = () => {
    navigate("/deals/create");
  };

  const handleAddNote = (deal) => {
    console.log("Adding note for deal:", deal);
    navigate(`/deals/${deal.DealID}/notes`);
  };

  const handleAddAttachment = (deal) => {
    console.log("Adding attachment for deal:", deal);
    navigate(`/deals/${deal.DealID}/attachments`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
  };

  return (
    <DealsPage
      deals={filteredDeals}
      loading={loading}
      error={error}
      successMessage={successMessage}
      searchTerm={searchTerm}
      statusFilter={statusFilter}
      setSuccessMessage={setSuccessMessage}
      setSearchTerm={setSearchTerm}
      setStatusFilter={setStatusFilter}
      onDeactivate={handleDeactivate}
      onEdit={handleEdit}
      onView={handleView}
      onCreate={handleOpenCreate}
      onAddNote={handleAddNote}
      onAddAttachment={handleAddAttachment}
      clearFilters={clearFilters}
      totalCount={deals.length}
    />
  );
};

export default DealsContainer;
