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
import BulkClaimAndSequenceDialog from "../../components/dialogs/BulkClaimAndSequenceDialog";
import BulkActionsToolbar from "../../components/tableFormat/BulkActionsToolbar";
import BulkClaimDialog from "../../components/dialogs/BulkClaimDialog";
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

  const [sequences, setSequences] = useState([])

  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [accountToReactivate, setAccountToReactivate] = useState(null);
  const [accountForUnassign, setAccountForUnassign] = useState(null);
  const [unassignUserDialogOpen, setUnassignUserDialogOpen] = useState(false);


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
            const assignedIdsStr = acc.AssignedEmployeeIDs;
            const assignedNamesStr = acc.AssignedEmployeeNames;
            
            if (assignedIdsStr && assignedNamesStr) {
              const assignedIds = assignedIdsStr.split(',').map(id => id.trim());
              const assignedNames = assignedNamesStr.split(',').map(name => name.trim());
              
              const isOwnedByMe = assignedIds.some(id => String(id) === String(userId));
              
              if (isOwnedByMe && assignedIds.length === 1) {
                acc.ownerStatus = "owned";
              } else if (isOwnedByMe && assignedIds.length > 1) {
                acc.ownerStatus = "owned-shared";
                acc.ownerDisplayName = `You + ${assignedIds.length - 1} other${assignedIds.length - 1 > 1 ? 's' : ''}`;
                acc.ownerTooltip = assignedNames.join(', ');
                acc.assignedUserCount = assignedIds.length;
                acc.allAssignedNames = assignedNames;
              } else if (assignedIds.length === 1) {
                acc.ownerStatus = `owned-by-${assignedNames[0]}`;
                acc.ownerDisplayName = assignedNames[0];
              } else {
                acc.ownerStatus = "owned-by-multiple";
                acc.ownerDisplayName = `${assignedIds.length} users`;
                acc.ownerTooltip = assignedNames.join(', ');
                acc.assignedUserCount = assignedIds.length;
                acc.allAssignedNames = assignedNames;
              }
            } else {
              acc.ownerStatus = acc.Active !== false ? "unowned" : "n/a";
            }
          });
        } else {
          // SALES REP VIEW - Now includes shared ownership logic
          const assignedRes = await fetchActiveAccountsByUser(userId);
          const unassignedRes = await fetchActiveUnassignedAccounts();
          const assignedAccounts = Array.isArray(assignedRes) ? assignedRes : [];
          const unassignedAccounts = Array.isArray(unassignedRes) ? unassignedRes : [];

          assignedAccounts.forEach((acc) => {
            const assignedIdsStr = acc.AssignedEmployeeIDs;
            const assignedNamesStr = acc.AssignedEmployeeNames;
            
            if (assignedIdsStr && assignedNamesStr) {
              const assignedIds = assignedIdsStr.split(',').map(id => id.trim());
              const assignedNames = assignedNamesStr.split(',').map(name => name.trim());
              
              if (assignedIds.length === 1) {
                // Only this user is assigned
                acc.ownerStatus = "owned";
              } else {
                // Multiple users assigned (shared account)
                acc.ownerStatus = "owned-shared";
                acc.ownerDisplayName = `You + ${assignedIds.length - 1} other${assignedIds.length - 1 > 1 ? 's' : ''}`;
                acc.ownerTooltip = assignedNames.join(', ');
                acc.assignedUserCount = assignedIds.length;
                acc.allAssignedNames = assignedNames;
              }
            } else {
              acc.ownerStatus = "owned";
            }
          });
          
          unassignedAccounts.forEach((acc) => (acc.ownerStatus = "unowned"));

          const map = new Map();
          [...assignedAccounts, ...unassignedAccounts].forEach((acc) => {
            if (acc.AccountID) map.set(acc.AccountID, acc);
          });
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

  const fetchSequences = useCallback(async () => {
    try {
      const response = await getAllSequences();
      setSequences(response);
    } catch (err) {
      console.error('Error fetching sequences:', err);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [refreshFlag, canViewAll, isCLevel]);

  useEffect(() => {
    fetchSequences();
  }, [fetchSequences]);

  // ---------------- FILTER ----------------
  const applyFilter = (accounts, filterType) => {
    switch (filterType) {
      case "my":
        return accounts.filter((acc) => acc.ownerStatus === "owned" || acc.ownerStatus === "owned-shared");
      case "unassigned":
        return accounts.filter(
          (acc) => acc.ownerStatus === "unowned" || acc.ownerStatus === "n/a"
        );
      case "all":
      default:
        return accounts;
    }
  };

  const handleFilterChange = (filterType) => {
    setCurrentFilter(filterType);
    setFilteredAccounts(applyFilter(allAccounts, filterType));
    setSelected([]);
  };

  // ---------------- ACCOUNT ACTIONS ----------------
  const handleDeactivateClick = (id) => {
    const account = filteredAccounts.find(acc => acc.AccountID === id);
    
    if (!account) {
      setStatusMessage("Account not found");
      setStatusSeverity("error");
      return;
    }
    
    if (!hasAccess("accountsEdit")) return;
    
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const confirmDeactivate = async () => {
    if (!accountToDelete) return;
    setBulkLoading(true);
    try {
      await deactivateAccount(accountToDelete.AccountID);
      setStatusMessage("Account deactivated successfully");
      setStatusSeverity("success");
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      setStatusMessage(err.message || "Failed to deactivate account");
      setStatusSeverity("error");
    } finally {
      setBulkLoading(false);
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    }
  };

  const handleReactivateClick = (id) => {
    const account = filteredAccounts.find(acc => acc.AccountID === id);
    
    if (!account) {
      setStatusMessage("Account not found");
      setStatusSeverity("error");
      return;
    }
    
    if (!hasAccess("accountsEdit")) return;
    
    setAccountToReactivate(account);
    setReactivateDialogOpen(true);
  };

  const confirmReactivate = async () => {
    if (!accountToReactivate) return;
    setBulkLoading(true);
    try {
      await reactivateAccount(accountToReactivate.AccountID);
      setStatusMessage("Account reactivated successfully");
      setStatusSeverity("success");
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      console.error("Reactivate error:", err);
      setStatusMessage(err.message || "Failed to reactivate account");
      setStatusSeverity("error");
    } finally {
      setBulkLoading(false);
      setReactivateDialogOpen(false);
      setAccountToReactivate(null);
    }
  };

  const handleEdit = (account) => {
    if (!hasAccess("accountsEdit")) return;
    navigate(`/accounts/edit/${account.AccountID}`, { state: { account } });
  };

  const handleView = (account) => {
    if (!hasAccess("accountsDetails")) return;
    account?.AccountID && navigate(`/accounts/${account.AccountID}`);
  };

  const handleCreate = () => {
    if (!hasAccess("accountsCreate")) return;
    navigate("/accounts/create");
  };

  // ---------------- NOTES ----------------
  const handleAddNote = (account) => {
    setSelectedAccount(account);
    setNotesPopupOpen(true);
  };

  const handleSaveNote = async (noteData) => {
    setStatusMessage("Note added successfully!");
    setStatusSeverity("success");
    setRefreshFlag((flag) => !flag);
  };

  const handleEditNote = async (noteData) => {
    setStatusMessage("Note updated successfully!");
    setStatusSeverity("success");
    setRefreshFlag((flag) => !flag);
  };

  const handleDeactivateNote = async (noteId) => {
    try {
      await deactivateNote(noteId);
      setStatusMessage("Note deactivated successfully!");
      setStatusSeverity("success");
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      setStatusMessage(err.message || "Failed to deactivate note");
      setStatusSeverity("error");
      throw err;
    }
  };

  const handleReactivateNote = async (noteId) => {
    try {
      await reactivateNote(noteId);
      setStatusMessage("Note reactivated successfully!");
      setStatusSeverity("success");
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      setStatusMessage(err.message || "Failed to reactivate note");
      setStatusSeverity("error");
      throw err;
    }
  };

  // ---------------- ATTACHMENTS ----------------
  const handleAddAttachment = (account) => {
    setSelectedAccount(account);
    setAttachmentsPopupOpen(true);
  };

  const handleUploadAttachment = async (files) => {
    try {
      await Promise.all(
        files.map((file) =>
          uploadAttachment({
            file,
            entityId: selectedAccount.AccountID,
            entityTypeName: "Account",
          })
        )
      );
      setStatusMessage(`${files.length} attachment(s) uploaded successfully!`);
      setStatusSeverity("success");
      setAttachmentsPopupOpen(false);
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      setStatusMessage(err.message || "Failed to upload attachments");
      setStatusSeverity("error");
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await deleteAttachment(attachmentId);
      setStatusMessage("Attachment deleted successfully!");
      setStatusSeverity("success");
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      setStatusMessage(err.message || "Failed to delete attachment");
      setStatusSeverity("error");
    }
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      await downloadAttachment(attachment);
    } catch (err) {
      setStatusMessage(err.message || "Failed to download attachment");
      setStatusSeverity("error");
    }
  };

  // ---------------- CLAIM / ASSIGN / UNASSIGN ----------------
  const handleClaimAccount = async (account) => {
    if (!hasAccess("accountClaim")) return;
    try {
      await claimAccount(account.AccountID);
      setStatusMessage(`Account claimed: ${account.AccountName}`);
      setStatusSeverity("success");
      const updateAccounts = (accounts) =>
        accounts.map((a) =>
          a.AccountID === account.AccountID ? { ...a, ownerStatus: "owned" } : a
        );
      setAllAccounts(updateAccounts);
      setFilteredAccounts(updateAccounts);
    } catch (err) {
      setStatusMessage(err.message || "Failed to claim account");
      setStatusSeverity("error");
    }
  };

  const handleAssignUser = async (employeeId, account) => {
    if (!hasAccess("accountAssign")) return;
    try {
      await assignUser(account.AccountID, employeeId);
      
      const employeeName = "User";
      
      const updateAccounts = (accounts) =>
        accounts.map((a) =>
          a.AccountID === account.AccountID 
            ? { 
                ...a, 
                AssignedEmployeeID: employeeId,
                AssignedEmployeeName: employeeName,
                ownerStatus: employeeId === userId ? "owned" : `owned by ${employeeName}`
              } 
            : a
        );
      
      setAllAccounts(updateAccounts);
      setFilteredAccounts(updateAccounts);
      
      setStatusMessage(`User assigned to ${account.AccountName}`);
      setStatusSeverity("success");
      
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      setStatusMessage(err.message || "Failed to assign user");
      setStatusSeverity("error");
    }
  };

  const handleUnclaimAccount = async (account) => {
    if (!hasAccess("accountUnclaim")) return;
    try {
      await unclaimAccount(account.AccountID);
      setStatusMessage(`Account unclaimed: ${account.AccountName}`);
      setStatusSeverity("success");

      const updateAccounts = (accounts) =>
        accounts.map((a) =>
          a.AccountID === account.AccountID ? { ...a, ownerStatus: "unowned" } : a
        );

      setAllAccounts(updateAccounts);
      setFilteredAccounts(updateAccounts);
    } catch (err) {
      setStatusMessage(err.message || "Failed to unclaim account");
      setStatusSeverity("error");
    }
  };

  // Handle Unassign Users
  const handleUnassignUsers = (account) => {
    if (!hasAccess("accountAssign")) return;
    setAccountForUnassign(account);
    setUnassignUserDialogOpen(true);
  };

  // Confirm Unassign Users
  const confirmUnassignUsers = async (account, selectedUserIds) => {
    setBulkLoading(true);
    try {
      await removeSpecificUsers(account.AccountID, selectedUserIds);
      
      setStatusMessage(`Successfully unassigned ${selectedUserIds.length} user(s) from ${account.AccountName}`);
      setStatusSeverity("success");
      
      setRefreshFlag((flag) => !flag);
      setUnassignUserDialogOpen(false);
      setAccountForUnassign(null);
    } catch (err) {
      console.error("Error unassigning users:", err);
      setStatusMessage(err.message || "Failed to unassign users");
      setStatusSeverity("error");
      throw err;
    } finally {
      setBulkLoading(false);
    }
  };

  // ---------------- SELECTION ----------------
  const handleSelectClick = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSelectAllClick = (event) => {
    setSelected(event.target.checked ? filteredAccounts.map((a) => a.AccountID) : []);
  };

  // ---------------- BULK ACTIONS ----------------
  const selectedAccountObjects = filteredAccounts.filter((a) =>
    selected.includes(a.AccountID)
  );

  const handleBulkClaim = () => {
    if (!hasAccess("accountClaim")) return;
    if (selected.length === 0) {
      setStatusMessage("Please select accounts to claim");
      setStatusSeverity("warning");
      return;
    }
    setBulkClaimDialogOpen(true);
  };

  const confirmBulkClaim = async (accountIds) => {
    setBulkLoading(true);

    try {
      const result = await bulkClaimAccounts(accountIds);
      
      let message = '';
      if (result.claimedCount > 0) {
        message = `Successfully claimed ${result.claimedCount} account(s)`;
        
        if (result.claimed && result.claimed.length > 0) {
          const claimedNames = result.claimed
            .slice(0, 3)
            .map(a => a.accountName)
            .join(', ');
          message += `: ${claimedNames}`;
          if (result.claimed.length > 3) {
            message += ` and ${result.claimed.length - 3} more`;
          }
        }
        
        if (result.failedCount > 0) {
          message += `. ${result.failedCount} account(s) could not be claimed`;
        }
        
        setStatusMessage(message);
        setStatusSeverity("success");
      } else {
        message = "No accounts were claimed";
        if (result.failed && result.failed.length > 0) {
          const firstReason = result.failed[0].reason;
          message += `. Reason: ${firstReason}`;
        }
        setStatusMessage(message);
        setStatusSeverity("warning");
      }
      
      setRefreshFlag((flag) => !flag);
      setSelected([]);
      setBulkClaimDialogOpen(false);
      
    } catch (err) {
      console.error("Bulk claim error:", err);
      
      if (err.message && err.message.includes("authentication")) {
        setStatusMessage("Authentication error. Please log in again and try.");
        setStatusSeverity("error");
      } else {
        setStatusMessage(err.message || "Failed to claim selected accounts");
        setStatusSeverity("error");
      }
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkClaimAndSequence = () => {
    if (!hasAccess("accountClaim")) return;
    if (selected.length === 0) {
      setStatusMessage("Please select accounts to claim and assign sequence");
      setStatusSeverity("warning");
      return;
    }
    setBulkClaimSequenceDialogOpen(true);
  };

  const confirmBulkClaimAndSequence = async (accountIds, sequenceId) => {
    setBulkLoading(true);
    
    try {
      const result = await bulkClaimAccountsAndAddSequence(accountIds, sequenceId);
      
      if (result.claimedCount > 0) {
        let message = `Successfully claimed ${result.claimedCount} account(s)`;
        
        if (result.totalActivitiesCreated > 0) {
          message += ` and created ${result.totalActivitiesCreated} activities`;
        }
        
        if (result.failedCount > 0) {
          message += `. ${result.failedCount} account(s) could not be claimed.`;
        }
        
        setStatusMessage(message);
        setStatusSeverity("success");
      } else {
        setStatusMessage("No accounts were claimed");
        setStatusSeverity("warning");
      }
      
      setRefreshFlag((flag) => !flag);
      setSelected([]);
      setBulkClaimSequenceDialogOpen(false);
    } catch (err) {
      console.error("Bulk claim and sequence error:", err);
      setStatusMessage(err.message || "Failed to claim accounts and assign sequence");
      setStatusSeverity("error");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkAssign = () => {
    if (!hasAccess("accountAssign")) return;
    if (selected.length === 0) {
      setStatusMessage("Please select accounts to assign");
      setStatusSeverity("warning");
      return;
    }
    setBulkAssignDialogOpen(true);
  };

  const confirmBulkAssign = async (employeeId) => {
    setBulkLoading(true);
    const selectedItems = filteredAccounts.filter((a) =>
      selected.includes(a.AccountID)
    );
    try {
      await Promise.all(selectedItems.map((a) => assignUser(a.AccountID, employeeId)));
      setStatusMessage(`Successfully assigned ${selectedItems.length} account(s)`);
      setStatusSeverity("success");
      setRefreshFlag((flag) => !flag);
      setSelected([]);
      setBulkAssignDialogOpen(false);
    } catch (err) {
      setStatusMessage(err.message || "Failed to assign selected accounts");
      setStatusSeverity("error");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDeactivate = () => {
    if (!hasAccess("accountsEdit")) return;
    if (selected.length === 0) {
      setStatusMessage("Please select accounts to deactivate");
      setStatusSeverity("warning");
      return;
    }
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDeactivate = async () => {
    setBulkLoading(true);
    const selectedItems = filteredAccounts.filter((a) =>
      selected.includes(a.AccountID)
    );
    try {
      await Promise.all(selectedItems.map((a) => deactivateAccount(a.AccountID)));
      setStatusMessage(`Successfully deactivated ${selectedItems.length} account(s)`);
      setStatusSeverity("success");
      setSelected([]);
      setRefreshFlag((flag) => !flag);
      setBulkDeleteDialogOpen(false);
    } catch (err) {
      setStatusMessage(err.message || "Failed to deactivate selected accounts");
      setStatusSeverity("error");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkExport = () => {
    console.log("Exporting accounts:", selectedAccountObjects);
  };

  const handleClearSelection = () => setSelected([]);

  return (
    <>
      <AccountsPage
        accounts={filteredAccounts}
        loading={loading}
        error={error}
        statusMessage={statusMessage}
        statusSeverity={statusSeverity}
        setStatusMessage={setStatusMessage}
        selected={selected}
        selectedItems={selectedAccountObjects}
        onSelectClick={handleSelectClick}
        onSelectAllClick={handleSelectAllClick}
        onDeactivate={handleDeactivateClick}
        onReactivate={handleReactivateClick}
        onEdit={handleEdit}
        onView={handleView}
        onCreate={handleCreate}
        onAddNote={handleAddNote}
        onAddAttachment={handleAddAttachment}
        onClaimAccount={handleClaimAccount}
        onAssignUser={handleAssignUser}
        onUnclaimAccount={handleUnclaimAccount}
        onUnassignUsers={handleUnassignUsers}
        onFilterChange={handleFilterChange}
        onBulkClaim={handleBulkClaim}
        onBulkClaimAndSequence={handleBulkClaimAndSequence}
        onBulkAssign={handleBulkAssign}
        onBulkDeactivate={handleBulkDeactivate}
        onBulkExport={handleBulkExport}
        onClearSelection={handleClearSelection}
        bulkLoading={bulkLoading}
        userRoles={roles}
        hasAccess={hasAccess}
        notesPopupOpen={notesPopupOpen}
        setNotesPopupOpen={setNotesPopupOpen}
        attachmentsPopupOpen={attachmentsPopupOpen}
        setAttachmentsPopupOpen={setAttachmentsPopupOpen}
        selectedAccount={selectedAccount}
        setSelectedAccount={setSelectedAccount}
        bulkAssignDialogOpen={bulkAssignDialogOpen}
        setBulkAssignDialogOpen={setBulkAssignDialogOpen}
        bulkClaimDialogOpen={bulkClaimDialogOpen}
        setBulkClaimDialogOpen={setBulkClaimDialogOpen}
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        bulkDeleteDialogOpen={bulkDeleteDialogOpen}
        setBulkDeleteDialogOpen={setBulkDeleteDialogOpen}
        confirmDeactivate={confirmDeactivate}
        confirmBulkDeactivate={confirmBulkDeactivate}
        confirmBulkClaim={confirmBulkClaim}
        confirmBulkAssign={confirmBulkAssign}
        handleSaveNote={handleSaveNote}
        handleEditNote={handleEditNote}
        handleDeactivateNote={handleDeactivateNote}
        handleReactivateNote={handleReactivateNote}
        handleUploadAttachment={handleUploadAttachment}
        handleDeleteAttachment={handleDeleteAttachment}
        handleDownloadAttachment={handleDownloadAttachment}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Deactivate Account"
        message={`Are you sure you want to deactivate "${accountToDelete?.AccountName}"?`}
        onConfirm={confirmDeactivate}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setAccountToDelete(null);
        }}
        confirmText="Deactivate"
        cancelText="Cancel"
      />

      <ConfirmDialog
        open={reactivateDialogOpen}
        title="Reactivate Account"
        message={`Are you sure you want to reactivate "${accountToReactivate?.AccountName}"?`}
        onConfirm={confirmReactivate}
        onCancel={() => {
          setReactivateDialogOpen(false);
          setAccountToReactivate(null);
        }}
        confirmText="Reactivate"
        cancelText="Cancel"
      />

      <ConfirmDialog
        open={bulkDeleteDialogOpen}
        title="Deactivate Accounts"
        message={`Are you sure you want to deactivate ${selected.length} account(s)?`}
        onConfirm={confirmBulkDeactivate}
        onCancel={() => setBulkDeleteDialogOpen(false)}
        confirmText="Deactivate All"
        cancelText="Cancel"
      />

      <BulkAssignDialog
        open={bulkAssignDialogOpen}
        onClose={() => setBulkAssignDialogOpen(false)}
        onConfirm={confirmBulkAssign}
        selectedCount={selected.length}
      />

      <BulkClaimDialog
        open={bulkClaimDialogOpen}
        onClose={() => setBulkClaimDialogOpen(false)}
        onConfirm={confirmBulkClaim}
        selectedItems={selectedAccountObjects}
        loading={bulkLoading}
      />

      <BulkClaimAndSequenceDialog
        open={bulkClaimAndSequenceDialogOpen}
        onClose={() => setBulkClaimSequenceDialogOpen(false)}
        onConfirm={confirmBulkClaimAndSequence}
        selectedItems={selectedAccountObjects}
        sequences={sequences}
        loading={bulkLoading}
      />

      <UnassignUserDialog
        open={unassignUserDialogOpen}
        onClose={() => {
          setUnassignUserDialogOpen(false);
          setAccountForUnassign(null);
        }}
        onConfirm={confirmUnassignUsers}
        account={accountForUnassign}
        loading={bulkLoading}
      />
    </>
  );
};

export default AccountsContainer;