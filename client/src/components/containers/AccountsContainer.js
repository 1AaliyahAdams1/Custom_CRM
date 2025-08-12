import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AccountsPage from "../../pages/AccountsPage";
import {
    getAllAccounts,
    fetchActiveAccountsByUser,
    fetchActiveUnassignedAccounts,
    deactivateAccount,
} from "../../services/accountService";

const AccountsContainer = () => {
    const navigate = useNavigate();

    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [refreshFlag, setRefreshFlag] = useState(false);

    // Get user and roles from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user")) || {};
    const roles = Array.isArray(storedUser.roles) ? storedUser.roles : [];
    const userId = storedUser.UserID || storedUser.id || null; // adjust key if needed

    const isCLevel = roles.includes("C-level");
    const isSalesRep = roles.includes("Sales Representative");

    const fetchAccounts = async () => {
        setLoading(true);
        setError(null);

        try {
            let accountsData = [];

            console.log("User Roles:", roles);
            console.log("User ID:", userId);

            if (isCLevel) {
                console.log("Fetching all accounts for C-level user");
                const response = await getAllAccounts();
                accountsData = response.data;
                console.log("All accounts fetched:", accountsData);
            } else if (isSalesRep) {
                console.log("Fetching assigned and unassigned accounts for Sales Representative");

                const assignedRes = await fetchActiveAccountsByUser(userId);
                const unassignedRes = await fetchActiveUnassignedAccounts();

                const assignedAccounts = Array.isArray(assignedRes) ? assignedRes : [];
                const unassignedAccounts = Array.isArray(unassignedRes) ? unassignedRes : [];


                const combined = [...assignedAccounts, ...unassignedAccounts];

                const map = new Map();
                combined.forEach((acc) => {
                    if (!acc.AccountID) {
                        console.warn("Account with missing AccountID:", acc);
                    } else {
                        console.log("Adding AccountID to map:", acc.AccountID);
                        map.set(acc.AccountID, acc);
                    }
                });

                accountsData = Array.from(map.values());

                console.log("Deduplicated accountsData length:", accountsData.length);
                console.log("Deduplicated accountsData:", accountsData);
            } else {
                console.log("No matching role for fetching accounts");
                accountsData = [];
            }

            setAccounts(accountsData);
        } catch (err) {
            console.error("Failed to load accounts:", err);
            setError("Failed to load accounts. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchAccounts();
    }, [refreshFlag]);

    // Handler to deactivate (soft delete) an account
    const handleDeactivate = async (id) => {
        const confirm = window.confirm(
            "Are you sure you want to delete this account? This will deactivate it."
        );
        if (!confirm) return;

        setError(null);
        try {
            await deactivateAccount(id);
            setSuccessMessage("Account deleted successfully.");
            setRefreshFlag((flag) => !flag);
        } catch (error) {
            console.error("Failed to delete account:", error);
            setError("Failed to delete account. Please try again.");
        }
    };

    const handleEdit = (account) => {
        navigate(`/accounts/edit/${account.AccountID}`, { state: { account } });
    };

    const handleView = (accountId) => {
        console.log("Navigating to account details with ID:", accountId);
        navigate(`/accounts/${accountId}`);
    };


    const handleOpenCreate = () => {
        navigate("/accounts/create");
    };

    return (
        <AccountsPage
            accounts={accounts}
            loading={loading}
            error={error}
            successMessage={successMessage}
            setSuccessMessage={setSuccessMessage}
            onDeactivate={handleDeactivate}
            onEdit={handleEdit}
            onView={handleView}
            onCreate={handleOpenCreate}
        />
    );
};

export default AccountsContainer;
