import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AccountsPage from "../../pages/Accounts/AccountsPage";

// Services
import {
  getAllAccounts,
  fetchActiveAccountsByUser,
  fetchActiveUnassignedAccounts,
  deactivateAccount,
} from "../../services/accountService";
import {
  claimAccount,
  assignUser,
  removeAssignedUser,
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

// Components
import ConfirmDialog from "../../components/dialogs/ConfirmDialog";
import NotesPopup from "../../components/NotesComponent";
import AttachmentsPopup from "../../components/AttachmentsComponent";
import BulkAssignDialog from "../../components/dialogs/BulkAssignDialog";
import BulkClaimDialog from "../../components/dialogs/BulkClaimDialog";

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
  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [attachmentsPopupOpen, setAttachmentsPopupOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accountToDelete, setAccountToDelete] = useState(null);

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
          accountsData = await getAllAccounts();
          accountsData.forEach((acc) => (acc.ownerStatus = "n/a"));
        } else {
          const assignedRes = await fetchActiveAccountsByUser(userId);
          const unassignedRes = await fetchActiveUnassignedAccounts();
          const assignedAccounts = Array.isArray(assignedRes) ? assignedRes : [];
          const unassignedAccounts = Array.isArray(unassignedRes) ? unassignedRes : [];

          assignedAccounts.forEach((acc) => (acc.ownerStatus = "owned"));
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
    } catch {
      setError("Failed to load accounts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [refreshFlag]);

  // ---------------- FILTER ----------------
  const applyFilter = (accounts, filterType) => {
    switch (filterType) {
      case "my":
        return accounts.filter((acc) => acc.ownerStatus === "owned");
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
  const handleDeactivateClick = (account) => {
    if (!hasAccess("accountsEdit")) return;
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const confirmDeactivate = async () => {
    if (!accountToDelete) return;
    setBulkLoading(true);
    try {
      await deactivateAccount(accountToDelete.AccountID);
      setStatusMessage("Account deleted successfully");
      setStatusSeverity("success");
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      setStatusMessage(err.message || "Failed to delete account");
      setStatusSeverity("error");
    } finally {
      setBulkLoading(false);
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
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
    try {
      await createNote({
        EntityID: selectedAccount.AccountID,
        EntityType: "Account",
        Content: noteData.Content || noteData,
      });
      setStatusMessage("Note added successfully!");
      setStatusSeverity("success");
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      setStatusMessage(err.message || "Failed to save note");
      setStatusSeverity("error");
      throw err;
    }
  };

  const handleEditNote = async (noteData) => {
    try {
      await updateNote(noteData.NoteID, {
        EntityID: selectedAccount.AccountID,
        EntityType: "Account",
        Content: noteData.Content,
      });
      setStatusMessage("Note updated successfully!");
      setStatusSeverity("success");
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      setStatusMessage(err.message || "Failed to update note");
      setStatusSeverity("error");
      throw err;
    }
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

  // ---------------- CLAIM / ASSIGN ----------------
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
      await removeAssignedUser(account.AccountID);
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
    setBulkClaimDialogOpen(true);
  };

  const confirmBulkClaim = async (claimableAccounts) => {
    setBulkLoading(true);
    try {
      await Promise.all(claimableAccounts.map((acc) => claimAccount(acc.AccountID)));
      setStatusMessage(`Successfully claimed ${claimableAccounts.length} account(s)`);
      setStatusSeverity("success");
      setRefreshFlag((flag) => !flag);
      setSelected([]);
      setBulkClaimDialogOpen(false);
    } catch (err) {
      setStatusMessage(err.message || "Failed to claim selected accounts");
      setStatusSeverity("error");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkAssign = () => {
    if (!hasAccess("accountAssign")) return;
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
      onEdit={handleEdit}
      onView={handleView}
      onCreate={handleCreate}
      onAddNote={handleAddNote}
      onAddAttachment={handleAddAttachment}
      onClaimAccount={handleClaimAccount}
      onAssignUser={handleAssignUser}
      onUnclaimAccount={handleUnclaimAccount}
      onFilterChange={handleFilterChange}
      onBulkClaim={handleBulkClaim}
      onBulkAssign={handleBulkAssign}
      onBulkDeactivate={handleBulkDeactivate}
      onBulkExport={handleBulkExport}
      onClearSelection={handleClearSelection}
      bulkLoading={bulkLoading}
      userRoles={roles}
      hasAccess={hasAccess}
      // Popups
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
  );
};

export default AccountsContainer;
