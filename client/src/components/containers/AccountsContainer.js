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
import BulkClaimDialog from "../../components/dialogs/BulkClaimDialog";
import BulkClaimAndSequenceDialog from "../../components/dialogs/BulkClaimAndSequenceDialog";
import BulkActionsToolbar from "../../components/tableFormat/BulkActionsToolbar";
import UnassignUserDialog from "../../components/dialogs/UnAssignUserDialog";
import AssignUserDialog from "../../components/dialogs/AssignUserDialog";

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
  const [assignUserDialogOpen, setAssignUserDialogOpen] = useState(false);
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
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [accountToClaim, setAccountToClaim] = useState(null);
  const [unclaimDialogOpen, setUnclaimDialogOpen] = useState(false);
  const [accountToUnclaim, setAccountToUnclaim] = useState(null);

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
            const idsStr = acc.AssignedEmployeeIDs;
            const namesStr = acc.AssignedEmployeeNames;

            if (idsStr && namesStr) {
              const ids = idsStr.split(",").map((id) => id.trim());
              const names = namesStr.split(",").map((n) => n.trim());
              const isOwnedByMe = ids.includes(String(userId));

              if (isOwnedByMe && ids.length === 1) {
                acc.ownerStatus = "owned";
              } else if (isOwnedByMe && ids.length > 1) {
              } else if (isOwnedByMe && ids.length > 1) {
                acc.ownerStatus = "owned-shared";
                acc.ownerDisplayName = `You + ${ids.length - 1} other${ids.length - 1 > 1 ? "s" : ""}`;
                acc.ownerTooltip = names.join(", ");
              } else if (ids.length === 1) {
                acc.ownerStatus = `owned-by-${names[0]}`;
                acc.ownerDisplayName = names[0];
                acc.ownerDisplayName = `You + ${ids.length - 1} other${ids.length - 1 > 1 ? "s" : ""}`;
                acc.ownerTooltip = names.join(", ");
              } else if (ids.length === 1) {
                acc.ownerStatus = `owned-by-${names[0]}`;
                acc.ownerDisplayName = names[0];
              } else {
                acc.ownerStatus = "owned-by-multiple";
                acc.ownerDisplayName = `${ids.length} users`;
                acc.ownerTooltip = names.join(", ");
                acc.ownerDisplayName = `${ids.length} users`;
                acc.ownerTooltip = names.join(", ");
              }
            } else {
              acc.ownerStatus = acc.Active !== false ? "unowned" : "n/a";
            }
          }}});
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


  // ---------------- SELECTION HANDLERS ----------------
  const handleSelectClick = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredAccounts.map((acc) => acc.AccountID);
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  // ---------------- ACTION HANDLERS ----------------
  const handleView = (account) => {
    console.log("View account:", account);
    navigate(`/accounts/${account.AccountID}`);
  };

  //  Navigate with just the ID
  const handleEdit = (account) => {
    console.log("Edit account:", account);
    navigate(`/accounts/edit/${account.AccountID}`);
  };

  const handleAddNote = (account) => {
    setSelectedAccount(account);
    setNotesPopupOpen(true);
  };

  const handleAddAttachment = (account) => {
    setSelectedAccount(account);
    setAttachmentsPopupOpen(true);
  };

  const handleClaimAccount = async (account) => {
    setAccountToClaim(account);
    setClaimDialogOpen(true);
  };

  const handleConfirmClaim = async () => {
    if (!accountToClaim) return;
    try {
      await claimAccount(accountToClaim.AccountID, userId);
      setStatusMessage("Account claimed successfully");
      setStatusSeverity("success");
      setRefreshFlag((f) => !f);
    } catch (err) {
      console.error("Error claiming account:", err);
      setStatusMessage("Failed to claim account");
      setStatusSeverity("error");
    } finally {
      setClaimDialogOpen(false);
      setAccountToClaim(null);
    }
  };

  const handleUnclaimAccount = async (account) => {
    setAccountToUnclaim(account);
    setUnclaimDialogOpen(true);
  };

  const handleConfirmUnclaim = async () => {
    if (!accountToUnclaim) return;
    try {
      await unclaimAccount(accountToUnclaim.AccountID, userId);
      setStatusMessage("Account unclaimed successfully");
      setStatusSeverity("success");
      setRefreshFlag((f) => !f);
    } catch (err) {
      console.error("Error unclaiming account:", err);
      setStatusMessage("Failed to unclaim account");
      setStatusSeverity("error");
    } finally {
      setUnclaimDialogOpen(false);
      setAccountToUnclaim(null);
    }
  };

  const handleDeactivateAccount = async (account) => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDeactivate = async () => {
    if (!accountToDelete) return;
    try {
      await deactivateAccount(accountToDelete.AccountID);
      setStatusMessage("Account deactivated successfully");
      setStatusSeverity("success");
      setRefreshFlag((f) => !f);
    } catch (err) {
      console.error("Error deactivating account:", err);
      setStatusMessage("Failed to deactivate account");
      setStatusSeverity("error");
    } finally {
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    }
  };

  const handleReactivateAccount = async (account) => {
    setAccountToReactivate(account);
    setReactivateDialogOpen(true);
  };

  const handleConfirmReactivate = async () => {
    if (!accountToReactivate) return;
    try {
      await reactivateAccount(accountToReactivate.AccountID);
      setStatusMessage("Account reactivated successfully");
      setStatusSeverity("success");
      setRefreshFlag((f) => !f);
    } catch (err) {
      console.error("Error reactivating account:", err);
      setStatusMessage("Failed to reactivate account");
      setStatusSeverity("error");
    } finally {
      setReactivateDialogOpen(false);
      setAccountToReactivate(null);
    }
  };

  //  This is for SINGLE account assignment (from action menu)
  const handleAssignUserToAccount = (account) => {
    setSelectedAccount(account);
    setAssignUserDialogOpen(true); // Changed from setBulkAssignDialogOpen
  };

  const handleConfirmAssignUser = async (employeeId) => {
    if (!selectedAccount) return;
    try {
      await assignUser(selectedAccount.AccountID, employeeId);
      setStatusMessage("User assigned successfully");
      setStatusSeverity("success");
      setRefreshFlag((f) => !f);
    } catch (err) {
      console.error("Error assigning user:", err);
      setStatusMessage("Failed to assign user");
      setStatusSeverity("error");
    } finally {
      setAssignUserDialogOpen(false); // Changed from setBulkAssignDialogOpen
      setSelectedAccount(null);
    }
  };

  const handleUnassignUsers = (account) => {
    setAccountForUnassign(account);
    setUnassignUserDialogOpen(true);
  };

  const handleConfirmUnassignUser = async (accountId, employeeId) => {
    try {
      await removeAssignedUser(accountId, employeeId);
      setStatusMessage("User unassigned successfully");
      setStatusSeverity("success");
      setRefreshFlag((f) => !f);
    } catch (err) {
      console.error("Error unassigning user:", err);
      setStatusMessage("Failed to unassign user");
      setStatusSeverity("error");
    } finally {
      setUnassignUserDialogOpen(false);
      setAccountForUnassign(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    try {
      await Promise.all(selected.map((id) => deactivateAccount(id)));
      setStatusMessage("Selected accounts deactivated successfully");
      setStatusSeverity("success");
      setSelected([]);
      setRefreshFlag((f) => !f);
    } catch (err) {
      console.error("Error in bulk delete:", err);
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
      setSelected([]);
      setRefreshFlag((f) => !f);
    } catch (err) {
      console.error("Error in bulk claim:", err);
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
        onSelectClick={handleSelectClick}
        onSelectAllClick={handleSelectAllClick}
        currentFilter={currentFilter}
        setCurrentFilter={setCurrentFilter}
        onRefresh={() => setRefreshFlag((f) => !f)}
        onView={handleView}
        onEdit={handleEdit}
        onDeactivate={handleDeactivateAccount}
        onReactivate={handleReactivateAccount}
        onAssignUser={handleAssignUserToAccount}
        onUnassignUsers={handleUnassignUsers}
        onAddNote={handleAddNote}
        onAddAttachment={handleAddAttachment}
        onClaimAccount={handleClaimAccount}
        onUnclaimAccount={handleUnclaimAccount}
        onBulkClaim={() => setBulkClaimDialogOpen(true)}
        onBulkDelete={() => setBulkDeleteDialogOpen(true)}
        selectedAccount={selectedAccount}
        userName={storedUser.name || storedUser.username || "User"}
      />

      {/* DIALOGS */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Deactivate Account"
        content="Are you sure you want to deactivate this account?"
        onClose={() => {
          setDeleteDialogOpen(false);
          setAccountToDelete(null);
        }}
        onConfirm={handleConfirmDeactivate}
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
        onClose={() => {
          setReactivateDialogOpen(false);
          setAccountToReactivate(null);
        }}
        onConfirm={handleConfirmReactivate}
      />

      <ConfirmDialog
        open={claimDialogOpen}
        title="Claim Account"
        content={`Are you sure you want to claim ownership of "${accountToClaim?.AccountName}"?`}
        onClose={() => {
          setClaimDialogOpen(false);
          setAccountToClaim(null);
        }}
        onConfirm={handleConfirmClaim}
      />

      <ConfirmDialog
        open={unclaimDialogOpen}
        title="Unclaim Account"
        content={`Are you sure you want to remove yourself from "${accountToUnclaim?.AccountName}"?`}
        onClose={() => {
          setUnclaimDialogOpen(false);
          setAccountToUnclaim(null);
        }}
        onConfirm={handleConfirmUnclaim}
      />

      <UnassignUserDialog
        open={unassignUserDialogOpen}
        account={accountForUnassign}
        onClose={() => {
          setUnassignUserDialogOpen(false);
          setAccountForUnassign(null);
        }}
        onConfirm={handleConfirmUnassignUser}
      />

      {/* Separate single assign dialog */}
      <AssignUserDialog
        open={assignUserDialogOpen}
        onClose={() => {
          setAssignUserDialogOpen(false);
          setSelectedAccount(null);
        }}
        onAssign={handleConfirmAssignUser}
        account={selectedAccount}
      />

      <BulkAssignDialog
        open={bulkAssignDialogOpen}
        onClose={() => setBulkAssignDialogOpen(false)}
        onAssign={(employeeId) => {
          // Handle bulk assignment
          console.log("Bulk assign to employee:", employeeId);
        }}
      />

      <BulkClaimDialog
        open={bulkClaimDialogOpen}
        onClose={() => setBulkClaimDialogOpen(false)}
        onClaim={handleBulkClaim}
      />

      {/*  Pass all required service functions */}
      <NotesPopup
        open={notesPopupOpen}
        onClose={() => {
          setNotesPopupOpen(false);
          setSelectedAccount(null);
        }}
        account={selectedAccount}
        entityType="Account"
        entityId={selectedAccount?.AccountID}
        entityName={selectedAccount?.AccountName}
        onSave={createNote}
        onEdit={updateNote}
        onDeactivate={deactivateNote}
        onReactivate={reactivateNote}
        onRefresh={() => setRefreshFlag((f) => !f)}
      />

      {/*  Pass all required service functions */}
      <AttachmentsPopup
        open={attachmentsPopupOpen}
        onClose={() => {
          setAttachmentsPopupOpen(false);
          setSelectedAccount(null);
        }}
        account={selectedAccount}
        entityType="account"
        entityId={selectedAccount?.AccountID}
        entityName={selectedAccount?.AccountName}
        userName={storedUser.name || storedUser.username || "User"}
        onUpload={uploadAttachment}
        onDelete={deleteAttachment}
        onDownload={downloadAttachment}
        onRefresh={() => setRefreshFlag((f) => !f)}
      />
    </>
  )};

export default AccountsContainer;
