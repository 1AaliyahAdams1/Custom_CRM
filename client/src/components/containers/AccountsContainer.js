import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AccountsPage from "../../pages/Accounts/AccountsPage";

// Services
import {
  getAllAccounts,
  fetchActiveAccountsByUser,
  fetchActiveUnassignedAccounts,
  deactivateAccount,
  reactivateAccount,
  bulkClaimAccounts,
  getAllSequences,
  bulkClaimAccountsAndAddSequence,
} from "../../services/accountService";
import {
  claimAccount,
  assignUser,
  removeAssignedUser,
  removeSpecificUsers,
  unclaimAccount,
} from "../../services/assignService";
import {
  createNote,
  updateNote,
  deactivateNote,
  reactivateNote,
} from "../../services/noteService";
import {
  uploadAttachment,
  deleteAttachment,
  downloadAttachment,
} from "../../services/attachmentService";
import { getAllEmployees } from "../../services/employeeService";

// Components
import ConfirmDialog from "../../components/dialogs/ConfirmDialog";
import NotesPopup from "../../components/NotesComponent";
import AttachmentsPopup from "../../components/AttachmentsComponent";
import BulkAssignDialog from "../../components/dialogs/BulkAssignDialog";
import BulkClaimDialog from "../../components/dialogs/BulkClaimDialog";
import BulkClaimAndSequenceDialog from "../../components/dialogs/BulkClaimAndSequenceDialog";
import BulkActionsToolbar from "../../components/tableFormat/BulkActionsToolbar";
import UnassignUserDialog from "../../components/dialogs/UnAssignUserDialog";

// Utils
import { ROUTE_ACCESS } from "../../utils/auth/routesAccess";

const AccountsContainer = () => {
  const navigate = useNavigate();

  // ---------------- STATE ----------------
  const [allAccounts, setAllAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusSeverity, setStatusSeverity] = useState("success");
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [selected, setSelected] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Dialogs / Popups
  const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false);
  const [bulkClaimDialogOpen, setBulkClaimDialogOpen] = useState(false);
  const [bulkClaimAndSequenceDialogOpen, setBulkClaimSequenceDialogOpen] = useState(false);
  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [attachmentsPopupOpen, setAttachmentsPopupOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [accountToReactivate, setAccountToReactivate] = useState(null);
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [accountForUnassign, setAccountForUnassign] = useState(null);
  const [unassignUserDialogOpen, setUnassignUserDialogOpen] = useState(false);
  const [sequences, setSequences] = useState([]);

  // ---------------- USER ROLES ----------------
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const roles = Array.isArray(storedUser.roles) ? storedUser.roles : [];
  const userId = storedUser.UserID || storedUser.id || null;

  // ---------------- ACCESS HELPER ----------------
  const hasAccess = (routeKey) => {
    if (!ROUTE_ACCESS[routeKey]) return false;
    return roles.some((role) => ROUTE_ACCESS[routeKey].includes(role));
  };

  const isCLevel = hasAccess("accountAssign");
  const canViewAll = hasAccess("accounts");

  // ---------------- FETCH ACCOUNTS ----------------
  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      let accountsData = [];

      if (canViewAll) {
        if (isCLevel) {
          const rawData = await getAllAccounts();
          accountsData = Array.isArray(rawData) ? rawData : [];

          accountsData.forEach((acc) => {
            const idsStr = acc.AssignedEmployeeIDs;
            const namesStr = acc.AssignedEmployeeNames;

            if (idsStr && namesStr) {
              const ids = idsStr.split(",").map((id) => id.trim());
              const names = namesStr.split(",").map((n) => n.trim());
              const isOwnedByMe = ids.includes(String(userId));

              if (isOwnedByMe && ids.length === 1) {
                acc.ownerStatus = "owned";
              } else if (isOwnedByMe && ids.length > 1) {
                acc.ownerStatus = "owned-shared";
                acc.ownerDisplayName = `You + ${ids.length - 1} other${ids.length - 1 > 1 ? "s" : ""}`;
                acc.ownerTooltip = names.join(", ");
              } else if (ids.length === 1) {
                acc.ownerStatus = `owned-by-${names[0]}`;
                acc.ownerDisplayName = names[0];
              } else {
                acc.ownerStatus = "owned-by-multiple";
                acc.ownerDisplayName = `${ids.length} users`;
                acc.ownerTooltip = names.join(", ");
              }
            } else {
              acc.ownerStatus = acc.Active !== false ? "unowned" : "n/a";
            }
          });
        } else {
          const assignedRes = await fetchActiveAccountsByUser(userId);
          const unassignedRes = await fetchActiveUnassignedAccounts();
          const assigned = Array.isArray(assignedRes) ? assignedRes : [];
          const unassigned = Array.isArray(unassignedRes) ? unassignedRes : [];

          assigned.forEach((a) => {
            const ids = a.AssignedEmployeeIDs?.split(",") || [];
            a.ownerStatus = ids.length > 1 ? "owned-shared" : "owned";
          });

          unassigned.forEach((a) => (a.ownerStatus = "unowned"));

          const map = new Map();
          [...assigned, ...unassigned].forEach((a) => map.set(a.AccountID, a));
          accountsData = Array.from(map.values());
        }
      }

      setAllAccounts(accountsData);
      setFilteredAccounts(applyFilter(accountsData, currentFilter));
    } catch (err) {
      console.error("Error fetching accounts:", err);
      setError("Failed to load accounts. Please try again.");
      setAllAccounts([]);
      setFilteredAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- FILTER ----------------
  const applyFilter = (accounts, filter) => {
    if (filter === "all") return accounts;
    if (filter === "owned") return accounts.filter((a) => a.ownerStatus?.includes("owned"));
    if (filter === "unowned") return accounts.filter((a) => a.ownerStatus === "unowned");
    return accounts;
  };

  const fetchSequences = useCallback(async () => {
    try {
      const res = await getAllSequences();
      setSequences(res);
    } catch (err) {
      console.error("Error fetching sequences:", err);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [refreshFlag, canViewAll, isCLevel]);

  useEffect(() => {
    fetchSequences();
  }, [fetchSequences]);

  // ---------------- ACTION HANDLERS ----------------
  const handleDeactivateAccount = async () => {
    if (!accountToDelete) return;
    try {
      await deactivateAccount(accountToDelete.AccountID);
      setStatusMessage("Account deactivated successfully");
      setStatusSeverity("success");
      setRefreshFlag((f) => !f);
    } catch {
      setStatusMessage("Failed to deactivate account");
      setStatusSeverity("error");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleReactivateAccount = async () => {
    if (!accountToReactivate) return;
    try {
      await reactivateAccount(accountToReactivate.AccountID);
      setStatusMessage("Account reactivated successfully");
      setStatusSeverity("success");
      setRefreshFlag((f) => !f);
    } catch {
      setStatusMessage("Failed to reactivate account");
      setStatusSeverity("error");
    } finally {
      setReactivateDialogOpen(false);
    }
  };

  const handleAssignUser = async (employeeId) => {
    if (!selectedAccount) return;
    try {
      await assignUser(selectedAccount.AccountID, employeeId);
      setStatusMessage("User assigned successfully");
      setStatusSeverity("success");
      setRefreshFlag((f) => !f);
    } catch {
      setStatusMessage("Failed to assign user");
      setStatusSeverity("error");
    } finally {
      setBulkAssignDialogOpen(false);
    }
  };

  const handleUnassignUser = async (accountId, employeeId) => {
    try {
      await removeAssignedUser(accountId, employeeId);
      setStatusMessage("User unassigned successfully");
      setStatusSeverity("success");
      setRefreshFlag((f) => !f);
    } catch {
      setStatusMessage("Failed to unassign user");
      setStatusSeverity("error");
    } finally {
      setUnassignUserDialogOpen(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    try {
      await Promise.all(selected.map((id) => deactivateAccount(id)));
      setStatusMessage("Selected accounts deactivated successfully");
      setStatusSeverity("success");
      setRefreshFlag((f) => !f);
    } catch {
      setStatusMessage("Bulk delete failed");
      setStatusSeverity("error");
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  const handleBulkClaim = async (employeeId) => {
    try {
      await bulkClaimAccounts(selected, employeeId);
      setStatusMessage("Accounts claimed successfully");
      setStatusSeverity("success");
      setRefreshFlag((f) => !f);
    } catch {
      setStatusMessage("Bulk claim failed");
      setStatusSeverity("error");
    } finally {
      setBulkClaimDialogOpen(false);
    }
  };

  // ---------------- RENDER ----------------
  return (
    <>
      <AccountsPage
        accounts={filteredAccounts}
        loading={loading}
        error={error}
        statusMessage={statusMessage}
        statusSeverity={statusSeverity}
        selected={selected}
        setSelected={setSelected}
        currentFilter={currentFilter}
        setCurrentFilter={setCurrentFilter}
        onRefresh={() => setRefreshFlag((f) => !f)}
        onDeactivate={(acc) => {
          setAccountToDelete(acc);
          setDeleteDialogOpen(true);
        }}
        onReactivate={(acc) => {
          setAccountToReactivate(acc);
          setReactivateDialogOpen(true);
        }}
        onAssignUser={(acc) => {
          setSelectedAccount(acc);
          setBulkAssignDialogOpen(true);
        }}
        onUnassignUser={(acc) => {
          setAccountForUnassign(acc);
          setUnassignUserDialogOpen(true);
        }}
        onBulkClaim={() => setBulkClaimDialogOpen(true)}
        onBulkDelete={() => setBulkDeleteDialogOpen(true)}
        onNotesPopup={(acc) => {
          setSelectedAccount(acc);
          setNotesPopupOpen(true);
        }}
        onAttachmentsPopup={(acc) => {
          setSelectedAccount(acc);
          setAttachmentsPopupOpen(true);
        }}
      />

      {/* DIALOGS */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Deactivate Account"
        content="Are you sure you want to deactivate this account?"
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeactivateAccount}
      />

      <ConfirmDialog
        open={bulkDeleteDialogOpen}
        title="Bulk Deactivate Accounts"
        content="Are you sure you want to deactivate all selected accounts?"
        onClose={() => setBulkDeleteDialogOpen(false)}
        onConfirm={handleBulkDelete}
      />

      <ConfirmDialog
        open={reactivateDialogOpen}
        title="Reactivate Account"
        content="Do you want to reactivate this account?"
        onClose={() => setReactivateDialogOpen(false)}
        onConfirm={handleReactivateAccount}
      />

      <UnassignUserDialog
        open={unassignUserDialogOpen}
        account={accountForUnassign}
        onClose={() => setUnassignUserDialogOpen(false)}
        onConfirm={handleUnassignUser}
      />

      <BulkAssignDialog
        open={bulkAssignDialogOpen}
        onClose={() => setBulkAssignDialogOpen(false)}
        onAssign={handleAssignUser}
      />

      <BulkClaimDialog
        open={bulkClaimDialogOpen}
        onClose={() => setBulkClaimDialogOpen(false)}
        onClaim={handleBulkClaim}
      />

      <NotesPopup
        open={notesPopupOpen}
        onClose={() => setNotesPopupOpen(false)}
        account={selectedAccount}
        onSave={() => setRefreshFlag((f) => !f)}
      />

      <AttachmentsPopup
        open={attachmentsPopupOpen}
        onClose={() => setAttachmentsPopupOpen(false)}
        account={selectedAccount}
      />
    </>
  );
};

export default AccountsContainer;
