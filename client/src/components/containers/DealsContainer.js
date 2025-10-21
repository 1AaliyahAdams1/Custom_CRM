import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DealsPage from "../../pages/Deals/DealsPage";
import {
  getAllDeals,
  fetchDealsByUser,
  deactivateDeal,
  reactivateDeal,
} from "../../services/dealService";
import {
  getAllAccounts,
  fetchActiveAccountsByUser,
  fetchActiveUnassignedAccounts,
} from "../../services/accountService";
import { 
  createNote, 
  updateNote, 
  deactivateNote,
  reactivateNote,
} from "../../services/noteService";
import { 
  uploadAttachment, 
  getAttachmentsByEntity, 
  deleteAttachment, 
  downloadAttachment 
} from "../../services/attachmentService";
import ConfirmDialog from "../../components/dialogs/ConfirmDialog";
import NotesPopup from "../../components/dialogs/NotesComponent";
import AttachmentsPopup from "../../components/dialogs/AttachmentsComponent";

const DealsContainer = () => {
  const navigate = useNavigate();

  const [allDeals, setAllDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [accountOwnership, setAccountOwnership] = useState(new Map()); // Map of AccountID -> ownerStatus
  const [selectedDeals, setSelectedDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(false);

  // Popups
  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [attachmentsPopupOpen, setAttachmentsPopupOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);

  // Delete confirm dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState(null);
  
  // Reactivate dialog
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [dealToReactivate, setDealToReactivate] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const roles = Array.isArray(storedUser.roles) ? storedUser.roles : [];
  const userId = storedUser.UserID || storedUser.id || null;

  const isCLevel = roles.includes("C-level");
  const isSalesRep = roles.includes("Sales Representative");

  // ---------------- FILTER LOGIC ----------------
  const applyFilter = (deals, filterType) => {
    console.log('=== DEALS FILTER DEBUG ===');
    console.log('Applying filter:', filterType, 'to deals:', deals.length);
    console.log('Account ownership map size:', accountOwnership.size);
    
    let filteredDeals;
    switch (filterType) {
      case 'my':
        // Deals from accounts I own
        if (isSalesRep) {
          filteredDeals = deals.filter(deal => {
            const ownerStatus = accountOwnership.get(deal.AccountID);
            console.log(`Deal ${deal.DealName} (Account: ${deal.AccountID}) - Owner Status: ${ownerStatus}`);
            return ownerStatus === 'owned';
          });
        } else {
          // Non-sales reps might not have "owned" accounts
          filteredDeals = [];
        }
        break;
        
      case 'team':
        if (isCLevel) {
          // C-level sees all deals
          filteredDeals = deals;
        } else if (isSalesRep) {
          // Sales rep sees deals from owned and unassigned accounts
          filteredDeals = deals.filter(deal => {
            const ownerStatus = accountOwnership.get(deal.AccountID);
            return ownerStatus === 'owned' || ownerStatus === 'unowned';
          });
        } else {
          // Other roles see all deals (adjust as needed)
          filteredDeals = deals;
        }
        break;
        
      case 'unassigned':
        if (isCLevel) {
          // C-level sees deals from unassigned accounts only
          filteredDeals = deals.filter(deal => {
            const ownerStatus = accountOwnership.get(deal.AccountID);
            console.log(`Unassigned filter - Deal ${deal.DealName}: ${ownerStatus}`);
            return ownerStatus === 'unowned';
          });
        } else if (isSalesRep) {
          // Sales rep sees deals from unassigned accounts
          filteredDeals = deals.filter(deal => {
            const ownerStatus = accountOwnership.get(deal.AccountID);
            return ownerStatus === 'unowned';
          });
        } else {
          filteredDeals = [];
        }
        break;
        
      case 'all':
      default:
        filteredDeals = deals;
        break;
    }
    
    console.log(`Filter "${filterType}" returned:`, filteredDeals.length, 'deals');
    console.log('=== END DEALS FILTER DEBUG ===');
    return filteredDeals;
  };

  // ---------------- FETCH ACCOUNT OWNERSHIP ----------------
  const fetchAccountOwnership = async () => {
    console.log('=== FETCHING ACCOUNT OWNERSHIP FOR DEALS ===');
    try {
      const ownershipMap = new Map();

      if (isCLevel) {
        console.log('Fetching all accounts for C-level user');
        const response = await getAllAccounts();
        const accountsData = response.data || response || [];
        console.log('All accounts received:', accountsData.length);
        
        // For C-level, determine which accounts are assigned vs unassigned
        const assignedRes = await fetchActiveAccountsByUser(userId);
        const assignedAccounts = Array.isArray(assignedRes) ? assignedRes : [];
        const assignedAccountIds = new Set(assignedAccounts.map(acc => acc.AccountID));
        
        const unassignedRes = await fetchActiveUnassignedAccounts();
        const unassignedAccounts = Array.isArray(unassignedRes) ? unassignedRes : [];
        const unassignedAccountIds = new Set(unassignedAccounts.map(acc => acc.AccountID));
        
        // Mark each account appropriately
        accountsData.forEach(acc => {
          if (assignedAccountIds.has(acc.AccountID)) {
            ownershipMap.set(acc.AccountID, 'owned');
          } else if (unassignedAccountIds.has(acc.AccountID)) {
            ownershipMap.set(acc.AccountID, 'unowned');
          } else {
            ownershipMap.set(acc.AccountID, 'unknown');
          }
        });
        
      } else if (isSalesRep) {
        console.log('Fetching accounts for Sales Rep');
        
        const assignedRes = await fetchActiveAccountsByUser(userId);
        const unassignedRes = await fetchActiveUnassignedAccounts();

        const assignedAccounts = Array.isArray(assignedRes) ? assignedRes : [];
        const unassignedAccounts = Array.isArray(unassignedRes) ? unassignedRes : [];

        console.log('Assigned accounts:', assignedAccounts.length);
        console.log('Unassigned accounts:', unassignedAccounts.length);

        assignedAccounts.forEach(acc => {
          ownershipMap.set(acc.AccountID, 'owned');
        });

        unassignedAccounts.forEach(acc => {
          ownershipMap.set(acc.AccountID, 'unowned');
        });
      }

      console.log('Account ownership map created with', ownershipMap.size, 'entries');
      
      setAccountOwnership(ownershipMap);
      return ownershipMap;
    } catch (err) {
      console.error('Failed to fetch account ownership:', err);
      setError('Failed to load account information for filtering');
      return new Map();
    }
  };

  // ---------------- FETCH DEALS ----------------
  const fetchDeals = async () => {
    setLoading(true);
    setError(null);

    try {
      let dealsData = [];

      // First fetch account ownership information
      const ownershipMap = await fetchAccountOwnership();

      if (isCLevel) {
        dealsData = (await getAllDeals(true)) || [];
      } else if (isSalesRep && userId) {
        dealsData = (await fetchDealsByUser(userId)) || [];
      }

      console.log('Raw deals received:', dealsData.length);

      setAllDeals(dealsData);
      const filtered = applyFilter(dealsData, currentFilter);
      setFilteredDeals(filtered);
    } catch {
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

  useEffect(() => {
    if (allDeals.length > 0 && accountOwnership.size > 0) {
      const filtered = applyFilter(allDeals, currentFilter);
      setFilteredDeals(filtered);
    }
  }, [allDeals, currentFilter, accountOwnership]);

  // ---------------- FILTER HANDLER ----------------
  const handleFilterChange = (filterType) => {
    console.log('Filter changed to:', filterType);
    setCurrentFilter(filterType);
    const filtered = applyFilter(allDeals, filterType);
    setFilteredDeals(filtered);
    setSelectedDeals([]);
  };

  // ---------------- FILTERING + SEARCH ----------------
  const finalFilteredDeals = useMemo(() => {
    return filteredDeals.filter((deal) => {
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
  }, [filteredDeals, searchTerm, statusFilter]);

  // ---------------- HANDLERS ----------------
  const handleSelectClick = (id) => {
    setSelectedDeals((prev) =>
      prev.includes(id) ? prev.filter((dealId) => dealId !== id) : [...prev, id]
    );
  };

  const handleSelectAllClick = (checked) => {
    setSelectedDeals(checked ? finalFilteredDeals.map((deal) => deal.DealID) : []);
  };

  const handleDeactivateClick = (deal) => {
    setDealToDelete(deal);
    setDeleteDialogOpen(true);
  };

  const confirmDeactivate = async () => {
    if (!dealToDelete) return;

    try {
      await deactivateDeal(dealToDelete.DealID);
      setSuccessMessage("Deal deactivated successfully.");
      setRefreshFlag((flag) => !flag);
    } catch {
      setError("Failed to deactivate deal. Please try again.");
    } finally {
      setDeleteDialogOpen(false);
      setDealToDelete(null);
    }
  };

  const handleReactivateDeal = async (deal) => {
    setDealToReactivate(deal);
    setReactivateDialogOpen(true);
  };

  const confirmReactivate = async () => {
    if (!dealToReactivate) return;

    try {
      await reactivateDeal(dealToReactivate.DealID);
      setSuccessMessage("Deal reactivated successfully.");
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      console.error("Error reactivating deal:", err);
      setError("Failed to reactivate deal. Please try again.");
    } finally {
      setReactivateDialogOpen(false);
      setDealToReactivate(null);
    }
  };

  const handleEdit = (deal) => navigate(`/deals/edit/${deal.DealID}`);

  const handleView = (deal) => {
    if (!deal?.DealID) return;
    navigate(`/deals/${deal.DealID}`);
  };

  const handleOpenCreate = () => navigate("/deals/create");

  // ---------------- NOTES ----------------
  const handleAddNote = (deal) => {
    setSelectedDeal(deal);
    setNotesPopupOpen(true);
  };

  const handleSaveNote = async (noteData) => {
    try {
      const notePayload = {
        EntityID: selectedDeal.DealID,
        EntityType: "Deal",
        Content: noteData.Content || noteData,
      };
      await createNote(notePayload);
      setSuccessMessage("Note added successfully!");
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      setError(err.message || "Failed to save note");
      throw err;
    }
  };

  const handleEditNote = async (noteData) => {
    try {
      await updateNote(noteData.NoteID, {
        EntityID: selectedDeal.DealID,
        EntityType: "Deal",
        Content: noteData.Content,
      });
      setSuccessMessage("Note updated successfully!");
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      setError(err.message || "Failed to update note");
      throw err;
    }
  };

  const handleDeactivateNote = async (noteId) => {
    try {
      await deactivateNote(noteId);
      setSuccessMessage("Note deactivated successfully!");
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      setError(err.message || "Failed to deactivate note");
      throw err;
    }
  };

  const handleReactivateNote = async (noteId) => {
    try {
      await reactivateNote(noteId);
      setSuccessMessage("Note reactivated successfully!");
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      setError(err.message || "Failed to reactivate note");
      throw err;
    }
  };

  // ---------------- ATTACHMENTS ----------------
  const handleAddAttachment = (deal) => {
    setSelectedDeal(deal);
    setAttachmentsPopupOpen(true);
  };

  const handleUploadAttachment = async (files) => {
    try {
      const uploadPromises = files.map(file => 
        uploadAttachment({
          file,
          entityId: selectedDeal.DealID,
          entityTypeName: "Deal"
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

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
  };

  return (
    <>
      <DealsPage
        deals={finalFilteredDeals}
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
        onDeactivate={handleDeactivateClick}
        onReactivate={handleReactivateDeal}
        onEdit={handleEdit}
        onView={handleView}
        onCreate={handleOpenCreate}
        onAddNote={handleAddNote}
        onAddAttachment={handleAddAttachment}
        onFilterChange={handleFilterChange}
        clearFilters={clearFilters}
        totalCount={allDeals.length}
        currentFilter={currentFilter}
      />

      {/* Notes Popup */}
      <NotesPopup
        open={notesPopupOpen}
        onClose={() => setNotesPopupOpen(false)}
        onSave={handleSaveNote}
        onEdit={handleEditNote}
        onDeactivate={handleDeactivateNote}
        onReactivate={handleReactivateNote}
        entityType="Deal"
        entityId={selectedDeal?.DealID}
        entityName={selectedDeal?.DealName}
        showExistingNotes={true}
      />

      {/* Attachments Popup */}
      <AttachmentsPopup
        open={attachmentsPopupOpen}
        onClose={() => setAttachmentsPopupOpen(false)}
        entityType="Deal"
        entityId={selectedDeal?.DealID}
        entityName={selectedDeal?.DealName}
        onUpload={handleUploadAttachment}
        onDelete={handleDeleteAttachment}
        onDownload={handleDownloadAttachment}
      />

      {/* Confirm deactivate dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Deactivate Deal"
        description={`Are you sure you want to deactivate this deal${
          dealToDelete?.DealName ? ` ("${dealToDelete.DealName}")` : ""
        }?`}
        onConfirm={confirmDeactivate}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      {/* Confirm reactivate dialog */}
      <ConfirmDialog
        open={reactivateDialogOpen}
        title="Reactivate Deal"
        description={`Are you sure you want to reactivate this deal${
          dealToReactivate?.DealName ? ` ("${dealToReactivate.DealName}")` : ""
        }?`}
        onConfirm={confirmReactivate}
        onCancel={() => {
          setReactivateDialogOpen(false);
          setDealToReactivate(null);
        }}
      />
    </>
  );
};

export default DealsContainer;