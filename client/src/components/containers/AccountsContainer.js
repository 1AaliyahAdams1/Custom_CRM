import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AccountsPage from "../../pages/Accounts/AccountsPage";
import {
  getAllAccounts,
  fetchActiveAccountsByUser,
  fetchActiveUnassignedAccounts,
  deactivateAccount,
} from "../../services/accountService";
import { noteService } from "../../services/noteService";
import SmartDropdown from '../../components/SmartDropdown';
import { attachmentService } from "../../services/attachmentService";


const AccountsContainer = () => {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(false);

  const [selected, setSelected] = useState([]);

  // Popups
  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [attachmentsPopupOpen, setAttachmentsPopupOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupError, setPopupError] = useState(null);

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

        // Remove duplicates by AccountID
        const map = new Map();
        [...assignedAccounts, ...unassignedAccounts].forEach((acc) => {
          if (acc.AccountID) map.set(acc.AccountID, acc);
        });
        accountsData = Array.from(map.values());
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

  // ---------------- ACCOUNT HANDLERS ----------------
  const handleDeactivate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;
    setError(null);
    try {
      await deactivateAccount(id);
      setSuccessMessage("Account deleted successfully.");
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      console.error("Failed to delete account:", err);
      setError("Failed to delete account. Please try again.");
    }
  };

  const handleEdit = (account) => {
    navigate(`/accounts/edit/${account.AccountID}`, { state: { account } });
  };

  const handleView = (account) => {
    if (!account?.AccountID) {
      console.error("Cannot view account - missing ID:", account);
      return;
    }
    navigate(`/accounts/${account.AccountID}`);
  };

  const handleCreate = () => navigate("/accounts/create");

  const handleClaimAccount = (account) => {
    console.log("Claim account:", account);
  };

  const handleAssignUser = (account) => {
    console.log("Assign user to account:", account);
  };

  // ---------------- SELECTION HANDLERS ----------------
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

  // ---------------- NOTES HANDLERS ----------------
  const handleAddNote = (account) => {
    setSelectedAccount(account);
    setNotesPopupOpen(true);
    setPopupError(null);
  };

  const handleSaveNote = async (noteData) => {
    try {
      setPopupLoading(true);
      setPopupError(null);
      await noteService.createNote(noteData);
      setSuccessMessage("Note added successfully!");
      setNotesPopupOpen(false);
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      setPopupError(err.message || "Failed to save note");
    } finally {
      setPopupLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      setPopupLoading(true);
      setPopupError(null);
      await noteService.deleteNote(noteId);
      setSuccessMessage("Note deleted successfully!");
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      setPopupError(err.message || "Failed to delete note");
    } finally {
      setPopupLoading(false);
    }
  };

  const handleEditNote = async (noteData) => {
    try {
      setPopupLoading(true);
      setPopupError(null);
      await noteService.updateNote(noteData.NoteID, noteData);
      setSuccessMessage("Note updated successfully!");
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      setPopupError(err.message || "Failed to update note");
    } finally {
      setPopupLoading(false);
    }
  };

  // ---------------- ATTACHMENTS HANDLERS ----------------
  const handleAddAttachment = (account) => {
    setSelectedAccount(account);
    setAttachmentsPopupOpen(true);
    setPopupError(null);
  };

  const handleUploadAttachment = async (attachments) => {
    try {
      setPopupLoading(true);
      setPopupError(null);
      for (const attachment of attachments) {
        await attachmentService.uploadAttachment(attachment);
      }
      setSuccessMessage(`${attachments.length} attachment(s) uploaded successfully!`);
      setAttachmentsPopupOpen(false);
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      setPopupError(err.message || "Failed to upload attachments");
    } finally {
      setPopupLoading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      setPopupLoading(true);
      setPopupError(null);
      await attachmentService.deleteAttachment(attachmentId);
      setSuccessMessage("Attachment deleted successfully!");
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      setPopupError(err.message || "Failed to delete attachment");
    } finally {
      setPopupLoading(false);
    }
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      await attachmentService.downloadAttachment(attachment);
    } catch (err) {
      setPopupError(err.message || "Failed to download attachment");
    }
  };

  return (
    <AccountsPage
      accounts={accounts}
      loading={loading}
      error={error}
      successMessage={successMessage}
      setSuccessMessage={setSuccessMessage}
      selected={selected}
      onSelectClick={handleSelectClick}
      onSelectAllClick={handleSelectAllClick}
      onDeactivate={handleDeactivate}
      onEdit={handleEdit}
      onView={handleView}
      onCreate={handleCreate}
      onAddNote={handleAddNote}
      onAddAttachment={handleAddAttachment}
      onClaimAccount={handleClaimAccount}
      onAssignUser={handleAssignUser}
      notesPopupOpen={notesPopupOpen}
      setNotesPopupOpen={setNotesPopupOpen}
      attachmentsPopupOpen={attachmentsPopupOpen}
      setAttachmentsPopupOpen={setAttachmentsPopupOpen}
      selectedAccount={selectedAccount}
      popupLoading={popupLoading}
      popupError={popupError}
      handleSaveNote={handleSaveNote}
      handleDeleteNote={handleDeleteNote}
      handleEditNote={handleEditNote}
      handleUploadAttachment={handleUploadAttachment}
      handleDeleteAttachment={handleDeleteAttachment}
      handleDownloadAttachment={handleDownloadAttachment}
    />
  );
};

export default AccountsContainer;
