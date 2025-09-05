import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AccountsPage from "../../pages/Accounts/AccountsPage";
import {
  getAllAccounts,
  fetchActiveAccountsByUser,
  fetchActiveUnassignedAccounts,
  deactivateAccount,
} from "../../services/accountService";
import { claimAccount, assignUser } from "../../services/assignService";
import { 
  createNote, 
  updateNote, 
  deleteNote, 
  getNotesByEntity 
} from "../../services/noteService";
import { 
  uploadAttachment, 
  getAttachmentsByEntity, 
  deleteAttachment, 
  downloadAttachment 
} from "../../services/attachmentService";
import ConfirmDialog from "../../components/ConfirmDialog";
import NotesPopup from "../../components/NotesComponent";
import AttachmentsPopup from "../../components/AttachmentsComponent";

const AccountsContainer = () => {
  const navigate = useNavigate();

  // ---------------- STATE ----------------
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(false);

  const [selected, setSelected] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusSeverity, setStatusSeverity] = useState("success");

  // Popups
  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [attachmentsPopupOpen, setAttachmentsPopupOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Delete confirm dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  // ---------------- USER ROLES ----------------
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const roles = Array.isArray(storedUser.roles) ? storedUser.roles : [];
  const userId = storedUser.UserID || storedUser.id || null;
  const isCLevel = roles.includes("C-level");
  const isSalesRep = roles.includes("Sales Representative");

  // ---------------- FETCH ACCOUNTS ----------------
  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      let accountsData = [];

      if (isCLevel) {
        const response = await getAllAccounts();
        accountsData = response.data || [];
        accountsData.forEach((acc) => (acc.ownerStatus = "n/a"));
      } else if (isSalesRep) {
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

      setAccounts(accountsData);
    } catch {
      setError("Failed to load accounts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [refreshFlag]);

  // ---------------- ACCOUNT ACTIONS ----------------
  const handleDeactivateClick = (account) => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const confirmDeactivate = async () => {
    if (!accountToDelete) return;
    setError(null);
    try {
      await deactivateAccount(accountToDelete.AccountID);
      setSuccessMessage("Account deleted successfully.");
      setRefreshFlag((flag) => !flag);
    } catch {
      setError("Failed to delete account. Please try again.");
    } finally {
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    }
  };

  const handleEdit = (account) =>
    navigate(`/accounts/edit/${account.AccountID}`, { state: { account } });

  const handleView = (account) =>
    account?.AccountID && navigate(`/accounts/${account.AccountID}`);

  const handleCreate = () => navigate("/accounts/create");

  // ---------------- CLAIM / ASSIGN ----------------
  const handleClaimAccount = async (account) => {
    try {
      await claimAccount(account.AccountID);
      setStatusMessage(`Account claimed: ${account.AccountName}`);
      setStatusSeverity("success");
      setAccounts((prev) =>
        prev.map((a) =>
          a.AccountID === account.AccountID ? { ...a, ownerStatus: "owned" } : a
        )
      );
    } catch (err) {
      setStatusMessage(err.message || "Failed to claim account");
      setStatusSeverity("error");
    }
  };

  const handleAssignUser = async (employeeId, account) => {
    try {
      await assignUser(account.AccountID, employeeId);
      setSuccessMessage(`User assigned to ${account.AccountName}`);
    } catch (err) {
      setError(err.message || "Failed to assign user");
      throw err;
    }
  };

  // ---------------- SELECTION ----------------
  const handleSelectClick = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) newSelected = [...selected, id];
    else newSelected = selected.filter((sid) => sid !== id);
    setSelected(newSelected);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) setSelected(accounts.map((a) => a.AccountID));
    else setSelected([]);
  };

  // ---------------- NOTES ----------------
  const handleAddNote = (account) => {
    setSelectedAccount(account);
    setNotesPopupOpen(true);
  };

  const handleSaveNote = async (noteData) => {
    try {
      const notePayload = {
        EntityID: selectedAccount.AccountID,
        EntityType: "Account",
        Content: noteData.Content,
      };
      await createNote(notePayload);
      setSuccessMessage("Note added successfully!");
      setNotesPopupOpen(false);
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      setError(err.message || "Failed to save note");
    }
  };

  const handleEditNote = async (noteData) => {
    try {
      await updateNote(noteData.NoteID, noteData);
      setSuccessMessage("Note updated successfully!");
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      setError(err.message || "Failed to update note");
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId);
      setSuccessMessage("Note deleted successfully!");
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      setError(err.message || "Failed to delete note");
    }
  };

  // ---------------- ATTACHMENTS ----------------
  const handleAddAttachment = (account) => {
    setSelectedAccount(account);
    setAttachmentsPopupOpen(true);
  };

  const handleUploadAttachment = async (files) => {
    try {
      const uploadPromises = files.map(file => 
        uploadAttachment({
          file,
          entityId: selectedAccount.AccountID,
          entityTypeName: "Account"
        })
      );
      await Promise.all(uploadPromises);
      setSuccessMessage(`${files.length} attachment(s) uploaded successfully!`);
      setAttachmentsPopupOpen(false);
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      setError(err.message || "Failed to upload attachments");
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await deleteAttachment(attachmentId);
      setSuccessMessage("Attachment deleted successfully!");
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      setError(err.message || "Failed to delete attachment");
    }
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      await downloadAttachment(attachment);
    } catch (err) {
      setError(err.message || "Failed to download attachment");
    }
  };

  return (
    <>
      <AccountsPage
        accounts={accounts}
        loading={loading}
        error={error}
        successMessage={successMessage}
        setSuccessMessage={setSuccessMessage}
        statusMessage={statusMessage}
        statusSeverity={statusSeverity}
        setStatusMessage={setStatusMessage}
        selected={selected}
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
      />

      {/* Notes Popup */}
      <NotesPopup
        open={notesPopupOpen}
        onClose={() => setNotesPopupOpen(false)}
        onSave={handleSaveNote}
        onEdit={handleEditNote}
        onDelete={handleDeleteNote}
        entityType="Account"
        entityId={selectedAccount?.AccountID}
        entityName={selectedAccount?.AccountName}
        showExistingNotes={true}
      />

      {/* Attachments Popup */}
      <AttachmentsPopup
        open={attachmentsPopupOpen}
        onClose={() => setAttachmentsPopupOpen(false)}
        entityType="Account"
        entityId={selectedAccount?.AccountID}
        entityName={selectedAccount?.AccountName}
        onUpload={handleUploadAttachment}
        onDelete={handleDeleteAttachment}
        onDownload={handleDownloadAttachment}
      />

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Account"
        description={`Are you sure you want to delete "${accountToDelete?.AccountName}"?`}
        onConfirm={confirmDeactivate}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  );
};

export default AccountsContainer;