import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DealsPage from "../../pages/Deals/DealsPage";
import {
    getAllDeals,
    fetchDealsByUser,
    deactivateDeal,
} from "../../services/dealService";

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

    const storedUser = JSON.parse(localStorage.getItem("user")) || {};
    const roles = Array.isArray(storedUser.roles) ? storedUser.roles : [];
    const userId = storedUser.UserID || storedUser.id || null;

    const isCLevel = roles.includes("C-level");
    const isSalesRep = roles.includes("Sales Representative");

    // Fetch deals
    const fetchDeals = async () => {
        setLoading(true);
        setError(null);

        try {
            let dealsData = [];

            if (isCLevel) {
                dealsData = (await getAllDeals(true)) || [];
            } else if (isSalesRep && userId) {
                dealsData = (await fetchDealsByUser(userId)) || [];
            } else {
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

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Filtering + search
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

    // Handlers
    const handleSelectClick = (id) => {
        setSelectedDeals((prev) =>
            prev.includes(id) ? prev.filter((dealId) => dealId !== id) : [...prev, id]
        );
    };

    const handleSelectAllClick = (checked) => {
        if (checked) {
            setSelectedDeals(filteredDeals.map((deal) => deal.DealID));
        } else {
            setSelectedDeals([]);
        }
    };

    const handleDeactivate = async (id) => {
        const confirm = window.confirm(
            "Are you sure you want to deactivate this deal?"
        );
        if (!confirm) return;

        try {
            await deactivateDeal(id);
            setSuccessMessage("Deal deactivated successfully.");
            setRefreshFlag((flag) => !flag);
        } catch (error) {
            console.error("Failed to deactivate deal:", error);
            setError("Failed to deactivate deal. Please try again.");
        }
    };

    const handleEdit = (deal) => {
        navigate(`/deals/edit/${deal.DealID}`);
    };

    const handleView = (deal) => {
        if (!deal?.DealID) {
            console.error("Cannot view deal - missing ID:", deal);
            return;
        }
        // Navigate to the details page by ID
        navigate(`/deals/${deal.DealID}`);
    };


    const handleOpenCreate = () => {
        navigate("/deals/create");
    };

    const handleAddNote = (deal) => {
        navigate(`/deals/${deal.DealID}/notes`);
    };

    const handleAddAttachment = (deal) => {
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
            selectedDeals={selectedDeals}
            setSearchTerm={setSearchTerm}
            setStatusFilter={setStatusFilter}
            setSuccessMessage={setSuccessMessage}
            onSelectClick={handleSelectClick}
            onSelectAllClick={handleSelectAllClick}
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
