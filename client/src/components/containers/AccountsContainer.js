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
import BulkAssignDialog from "../../components/BulkAssignDialog"; 
import BulkClaimDialog from "../../components/BulkClaimDialog"; 

const AccountsContainer = () => {
  const navigate = useNavigate();

  // ---------------- STATE ----------------
  const [allAccounts, setAllAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(false);

  const [selected, setSelected] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusSeverity, setStatusSeverity] = useState("success");

  // Bulk operations state
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false);
  const [bulkClaimDialogOpen, setBulkClaimDialogOpen] = useState(false);

  // Popups
  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [attachmentsPopupOpen, setAttachmentsPopupOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Delete confirm dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // ---------------- USER ROLES ----------------
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const roles = Array.isArray(storedUser.roles) ? storedUser.roles : [];
  const userId = storedUser.UserID || storedUser.id || null;
  const isCLevel = roles.includes("C-level");
  const isSalesRep = roles.includes("Sales Representative");

  // ---------------- FILTER LOGIC ----------------
  const applyFilter = (accounts, filterType) => {
    console.log('=== FILTER DEBUG ===');
    console.log('Applying filter:', filterType, 'to accounts:', accounts.length);
    
    const ownerStatusValues = [...new Set(accounts.map(acc => acc.ownerStatus))];
    console.log('All ownerStatus values found:', ownerStatusValues);
    
    let filteredAccounts;
    switch (filterType) {
      case 'my':
        filteredAccounts = accounts.filter(acc => acc.ownerStatus === 'owned');
        break;
        
      case 'team':
        if (isCLevel) {
          filteredAccounts = accounts;
        } else if (isSalesRep) {
          filteredAccounts = accounts.filter(acc => 
            acc.ownerStatus === 'owned' || acc.ownerStatus === 'unowned'
          );
        } else {
          filteredAccounts = accounts;
        }
        break;
        
      case 'unassigned':
        if (isCLevel) {
          filteredAccounts = accounts.filter(acc => 
            acc.ownerStatus === 'n/a' || acc.ownerStatus === 'unowned'
          );
        } else {
          filteredAccounts = accounts.filter(acc => acc.ownerStatus === 'unowned');
        }
        break;
        
      case 'all':
      default:
        filteredAccounts = accounts;
        break;
    }
    
    console.log(`Filter "${filterType}" returned:`, filteredAccounts.length, 'accounts');
    console.log('=== END FILTER DEBUG ===');
    return filteredAccounts;
  };

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
        console.log('=== FETCHING ACCOUNTS DATA ===');
        console.log('User ID:', userId);
        
        const assignedRes = await fetchActiveAccountsByUser(userId);
        const unassignedRes = await fetchActiveUnassignedAccounts();

        console.log('Assigned API response:', assignedRes);
        console.log('Unassigned API response:', unassignedRes);

        const assignedAccounts = Array.isArray(assignedRes) ? assignedRes : [];
        const unassignedAccounts = Array.isArray(unassignedRes) ? unassignedRes : [];

        console.log('Assigned accounts count:', assignedAccounts.length);
        console.log('Unassigned accounts count:', unassignedAccounts.length);

        assignedAccounts.forEach((acc) => (acc.ownerStatus = "owned"));
        unassignedAccounts.forEach((acc) => (acc.ownerStatus = "unowned"));

        console.log('Sample assigned account:', assignedAccounts[0]);
        console.log('Sample unassigned account:', unassignedAccounts[0]);

        const map = new Map();
        [...assignedAccounts, ...unassignedAccounts].forEach((acc) => {
          if (acc.AccountID) map.set(acc.AccountID, acc);
        });
        accountsData = Array.from(map.values());
        
        console.log('Final merged accounts count:', accountsData.length);
        console.log('=== END FETCHING ACCOUNTS DATA ===');
      }

      setAllAccounts(accountsData);
      const filtered = applyFilter(accountsData, currentFilter);
      setFilteredAccounts(filtered);
    } catch {
      setError("Failed to load accounts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- FILTER HANDLER ----------------
  const handleFilterChange = (filterType) => {
    setCurrentFilter(filterType);
    const filtered = applyFilter(allAccounts, filterType);
    setFilteredAccounts(filtered);
    setSelected([]);
  };

  useEffect(() => {
    fetchAccounts();
  }, [refreshFlag]);

  useEffect(() => {
    const filtered = applyFilter(allAccounts, currentFilter);
    setFilteredAccounts(filtered);
  }, [allAccounts, currentFilter]);

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

  // ---------------- BULK ACTIONS ----------------
  const handleBulkClaim = async (selectedItems) => {
    setBulkClaimDialogOpen(true);
  };

  const confirmBulkClaim = async (claimableAccounts) => {
    console.log('=== BULK CLAIM DEBUG ===');
    console.log('Starting bulk claim for accounts:', claimableAccounts);
    setBulkLoading(true);
    
    try {
      console.log('Creating claim promises...');
      const claimPromises = claimableAccounts.map((account, index) => {
        console.log(`Claiming account ${index + 1}:`, account.AccountID, account.AccountName);
        return claimAccount(account.AccountID);
      });
      
      console.log('Executing all claim promises...');
      const results = await Promise.all(claimPromises);
      console.log('All claims completed successfully:', results);
      
      setStatusMessage(`Successfully claimed ${claimableAccounts.length} account${claimableAccounts.length !== 1 ? 's' : ''}`);
      setStatusSeverity("success");
      
      // Update accounts status
      const updateAccounts = (accounts) =>
        accounts.map((account) =>
          claimableAccounts.some(claimed => claimed.AccountID === account.AccountID)
            ? { ...account, ownerStatus: "owned" }
            : account
        );
      
      setAllAccounts(updateAccounts);
      setFilteredAccounts(prev => updateAccounts(prev));
      setSelected([]);
      
      // Close the dialog
      console.log('Closing bulk claim dialog...');
      setBulkClaimDialogOpen(false);
      
      console.log('Bulk claim completed successfully');
      
    } catch (err) {
      console.error('=== BULK CLAIM ERROR ===');
      console.error('Full error object:', err);
      console.error('Error message:', err?.message);
      console.error('Error response:', err?.response?.data);
      
      // Get the actual error message from the backend
      let errorMessage = "Failed to claim selected accounts";
      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setStatusMessage(errorMessage);
      setStatusSeverity("error");
      
      // Don't close dialog on error so user can see what happened
    } finally {
      console.log('Setting bulk loading to false...');
      setBulkLoading(false);
      console.log('=== END BULK CLAIM DEBUG ===');
    }
  };

  const handleBulkAssign = async (selectedItems) => {
    setBulkAssignDialogOpen(true);
  };

  const confirmBulkAssign = async (employeeId) => {
    setBulkLoading(true);
    const selectedItems = filteredAccounts.filter(account => 
      selected.includes(account.AccountID)
    );

    try {
      const assignPromises = selectedItems.map(account => 
        assignUser(account.AccountID, employeeId)
      );
      
      await Promise.all(assignPromises);
      
      setSuccessMessage(`Successfully assigned ${selectedItems.length} account${selectedItems.length !== 1 ? 's' : ''}`);
      setSelected([]);
      setBulkAssignDialogOpen(false);
      setRefreshFlag(flag => !flag);
      
    } catch (err) {
      setError(err.message || "Failed to assign selected accounts");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDeactivate = async (selectedItems) => {
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDeactivate = async () => {
    setBulkLoading(true);
    const selectedItems = filteredAccounts.filter(account => 
      selected.includes(account.AccountID)
    );

    try {
      const deletePromises = selectedItems.map(account => 
        deactivateAccount(account.AccountID)
      );
      
      await Promise.all(deletePromises);
      
      setSuccessMessage(`Successfully deactivated ${selectedItems.length} account${selectedItems.length !== 1 ? 's' : ''}`);
      setSelected([]);
      setBulkDeleteDialogOpen(false);
      setRefreshFlag(flag => !flag);
      
    } catch (err) {
      setError(err.message || "Failed to deactivate selected accounts");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkExport = async (selectedItems) => {
    // Implementation for exporting selected accounts
    console.log("Exporting accounts:", selectedItems);
  };

  const handleClearSelection = () => {
    setSelected([]);
  };

  // ---------------- CLAIM / ASSIGN ----------------
  const handleClaimAccount = async (account) => {
  try {
    console.log('=== SINGLE CLAIM DEBUG ===');
    console.log('Claiming account:', account.AccountID, account.AccountName);
    
    await claimAccount(account.AccountID);
    
    setStatusMessage(`Account claimed: ${account.AccountName}`);
    setStatusSeverity("success");
    
    const updateAccounts = (accounts) =>
      accounts.map((a) =>
        a.AccountID === account.AccountID ? { ...a, ownerStatus: "owned" } : a
      );
    
    setAllAccounts(updateAccounts);
    setFilteredAccounts(prev => updateAccounts(prev));
    
    console.log('Single claim completed successfully');
    
  } catch (err) {
    console.error('=== SINGLE CLAIM ERROR ===');
    console.error('Error claiming account:', err);
    console.error('Error message:', err?.message);
    
    const errorMessage = err?.message || "Failed to claim account";
    setStatusMessage(errorMessage);
    setStatusSeverity("error");
  }
};

  const handleAssignUser = async (employeeId, account) => {
    try {
      await assignUser(account.AccountID, employeeId);
      setSuccessMessage(`User assigned to ${account.AccountName}`);
      setRefreshFlag((flag) => !flag);
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
    if (event.target.checked) setSelected(filteredAccounts.map((a) => a.AccountID));
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

  // Get selected account objects for bulk operations
  const selectedAccountObjects = filteredAccounts.filter(account => 
    selected.includes(account.AccountID)
  );

  return (
    <>
      <AccountsPage
        accounts={filteredAccounts}
        loading={loading}
        error={error}
        successMessage={successMessage}
        setSuccessMessage={setSuccessMessage}
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
        onFilterChange={handleFilterChange}
        
        // Bulk action handlers
        onBulkClaim={handleBulkClaim}
        onBulkAssign={handleBulkAssign}
        onBulkDeactivate={handleBulkDeactivate}
        onBulkExport={handleBulkExport}
        onClearSelection={handleClearSelection}
        bulkLoading={bulkLoading}
        userRoles={roles}
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

      {/* Bulk Assign Dialog */}
      <BulkAssignDialog
        open={bulkAssignDialogOpen}
        onClose={() => setBulkAssignDialogOpen(false)}
        selectedItems={selectedAccountObjects}
        onConfirm={confirmBulkAssign}
        loading={bulkLoading}
      />

      {/* Bulk Claim Dialog */}
      <BulkClaimDialog
        open={bulkClaimDialogOpen}
        onClose={() => setBulkClaimDialogOpen(false)}
        selectedItems={selectedAccountObjects}
        onConfirm={confirmBulkClaim}
        loading={bulkLoading}
      />

      {/* Single delete dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Account"
        description={`Are you sure you want to delete "${accountToDelete?.AccountName}"?`}
        onConfirm={confirmDeactivate}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      {/* Bulk delete dialog */}
      <ConfirmDialog
        open={bulkDeleteDialogOpen}
        title="Bulk Delete Accounts"
        description={`Are you sure you want to deactivate ${selected.length} selected account${selected.length !== 1 ? 's' : ''}? This action cannot be undone.`}
        onConfirm={confirmBulkDeactivate}
        onCancel={() => setBulkDeleteDialogOpen(false)}
      />
    </>
  );
};

export default AccountsContainer;