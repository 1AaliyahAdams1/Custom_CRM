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
  assignSequenceToAccount,
} from "../../services/accountService";
import {
  claimAccount,
  assignUser,
  removeAssignedUser,
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
import { getMyTeamMembers } from '../../services/teamService';

// Components
import ConfirmDialog from "../../components/dialogs/ConfirmDialog";
import NotesPopup from "../../components/dialogs/NotesComponent";
import AttachmentsPopup from "../../components/dialogs/AttachmentsComponent";
import BulkAssignDialog from "../../components/dialogs/BulkAssignDialog";
import BulkClaimDialog from "../../components/dialogs/BulkClaimDialog";
import BulkClaimAndSequenceDialog from "../../components/dialogs/BulkClaimAndSequenceDialog";
import AssignSequenceDialog from "../../components/dialogs/AssignSequenceDialog";
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

  // NEW: Team member state
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamMemberUserIds, setTeamMemberUserIds] = useState([]);
  const [teamDataLoaded, setTeamDataLoaded] = useState(false);

  // Dialogs / Popups
  const [assignUserDialogOpen, setAssignUserDialogOpen] = useState(false);
  const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false);
  const [bulkClaimDialogOpen, setBulkClaimDialogOpen] = useState(false);
  const [bulkClaimAndSequenceDialogOpen, setBulkClaimAndSequenceDialogOpen] = useState(false);
  const [assignSequenceDialogOpen, setAssignSequenceDialogOpen] = useState(false);
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

  const selectedAccountObjects = filteredAccounts.filter((a) =>
    selected.includes(a.AccountID)
  );

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
  const isSalesManager = roles.includes("Sales Manager");

  console.log("🔍 User Info:", { userId, roles, isSalesManager, isCLevel, canViewAll });

  // ---------------- FETCH TEAM MEMBERS ----------------
  const fetchTeamMembers = useCallback(async () => {
    if (!isSalesManager) {
      console.log("👤 Not a Sales Manager, skipping team fetch");
      setTeamMembers([]);
      setTeamMemberUserIds([]);
      setTeamDataLoaded(true);
      return;
    }
    
    try {
      console.log("📞 Fetching team members for Sales Manager...");
      const members = await getMyTeamMembers(); 
      console.log("✅ Team members response:", members);
      
      setTeamMembers(members);
      
      // Extract UserIDs for filtering
      const memberUserIds = members.map(m => m.UserID).filter(Boolean);
      setTeamMemberUserIds(memberUserIds);
      
      console.log("👥 Team member UserIDs:", memberUserIds);
      console.log("📊 Total team members:", members.length);
      
      setTeamDataLoaded(true);
    } catch (err) {
      console.error("❌ Error fetching team members:", err);
      setTeamMembers([]);
      setTeamMemberUserIds([]);
      setTeamDataLoaded(true);
    }
  }, [isSalesManager]);

  // ---------------- FETCH ACCOUNTS ----------------
  const fetchAccounts = async () => {
    if (isSalesManager && !teamDataLoaded) {
      console.log("⏳ Waiting for team data to load...");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let accountsData = [];

      console.log("📦 Fetching accounts - canViewAll:", canViewAll, "isCLevel:", isCLevel, "isSalesManager:", isSalesManager);

      if (canViewAll) {
        const rawData = await getAllAccounts();
        accountsData = Array.isArray(rawData) ? rawData : [];
        
        console.log("📊 Total accounts fetched:", accountsData.length);

        if (isCLevel) {
          console.log("👔 Processing as C-Level user");
          
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
          
        } else if (isSalesManager) {
          console.log("👨‍💼 Processing as Sales Manager");
          console.log("👥 Team member UserIDs to check:", teamMemberUserIds);
          
          accountsData.forEach((acc) => {
            const idsStr = acc.AssignedEmployeeIDs;
            const namesStr = acc.AssignedEmployeeNames;

            if (idsStr && namesStr) {
              const ids = idsStr.split(",").map((id) => id.trim());
              const names = namesStr.split(",").map((n) => n.trim());
              const isOwnedByMe = ids.includes(String(userId));
              
              const isOwnedByTeam = ids.some(id => teamMemberUserIds.includes(parseInt(id)));

              console.log(`Account ${acc.AccountID} (${acc.AccountName}):`, {
                assignedIds: ids,
                isOwnedByMe,
                isOwnedByTeam,
                teamMemberUserIds
              });

              if (isOwnedByMe && ids.length === 1) {
                acc.ownerStatus = "owned";
              } else if (isOwnedByMe && ids.length > 1) {
                acc.ownerStatus = "owned-shared";
                acc.ownerDisplayName = `You + ${ids.length - 1} other${ids.length - 1 > 1 ? "s" : ""}`;
                acc.ownerTooltip = names.join(", ");
              } else if (isOwnedByTeam) {
                if (ids.length === 1) {
                  acc.ownerStatus = "owned-shared";
                  acc.ownerDisplayName = names[0];
                } else {
                  acc.ownerStatus = "owned-shared";
                  acc.ownerDisplayName = `${ids.length} team members`;
                  acc.ownerTooltip = names.join(", ");
                }
              } else {
                acc.ownerStatus = acc.Active !== false ? "unowned" : "n/a";
              }
            } else {
              acc.ownerStatus = acc.Active !== false ? "unowned" : "n/a";
            }
          });
        } else {
          accountsData.forEach((acc) => {
            const idsStr = acc.AssignedEmployeeIDs;
            const namesStr = acc.AssignedEmployeeNames;

            if (idsStr && namesStr) {
              const ids = idsStr.split(",").map((id) => id.trim());
              const isOwnedByMe = ids.includes(String(userId));

              acc.ownerStatus = isOwnedByMe ? "owned" : "unowned";
            } else {
              acc.ownerStatus = acc.Active !== false ? "unowned" : "n/a";
            }
          });
        }
      } else {
        const myAccounts = await fetchActiveAccountsByUser(userId);
        accountsData = Array.isArray(myAccounts) ? myAccounts : [];
        accountsData.forEach((acc) => {
          acc.ownerStatus = "owned";
        });
      }

      setAllAccounts(accountsData);
      filterAccounts(accountsData, currentFilter);
    } catch (err) {
      console.error("Error fetching accounts:", err);
      setError("Failed to load accounts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterAccounts = (accounts, filter) => {
    let filtered = accounts;
    
    switch (filter) {
      case "active":
        filtered = accounts.filter(acc => acc.Active === true || acc.Active === 1);
        break;
      case "inactive":
        filtered = accounts.filter(acc => acc.Active === false || acc.Active === 0);
        break;
      case "my":
        filtered = accounts.filter(acc => acc.ownerStatus === "owned");
        break;
      case "team":
        filtered = accounts.filter(acc => acc.ownerStatus === "owned-shared" || acc.ownerStatus === "owned-by-multiple");
        break;
      case "unassigned":
        filtered = accounts.filter(acc => acc.ownerStatus === "unowned");
        break;
      default:
        filtered = accounts;
    }
    
    setFilteredAccounts(filtered);
  };

  // ---------------- USEEFFECT - FETCH SEQUENCES ----------------
  useEffect(() => {
    const loadSequences = async () => {
      try {
        const seqs = await getAllSequences();
        setSequences(seqs || []);
      } catch (err) {
        console.error("Failed to fetch sequences:", err);
      }
    };
    loadSequences();
  }, []);

  // ---------------- USEEFFECT - FETCH TEAM MEMBERS ----------------
  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  // ---------------- USEEFFECT - FETCH ACCOUNTS ----------------
  useEffect(() => {
    if (isSalesManager && !teamDataLoaded) {
      console.log("⏳ Waiting for team data before fetching accounts...");
      return;
    }
    fetchAccounts();
  }, [refreshFlag, userId, canViewAll, isCLevel, isSalesManager, teamDataLoaded, teamMemberUserIds]);

  // ---------------- USEEFFECT - FILTER ----------------
  useEffect(() => {
    filterAccounts(allAccounts, currentFilter);
  }, [currentFilter]);

  // ---------------- SELECT HANDLERS ----------------
  const handleSelectClick = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllClick = () => {
    if (selected.length === filteredAccounts.length) {
      setSelected([]);
    } else {
      setSelected(filteredAccounts.map((a) => a.AccountID));
    }
  };

  // ---------------- ACTIONS ----------------
  const handleView = (account) => {
    if (!account?.AccountID) return;
    navigate(`/accounts/view/${account.AccountID}`);
  };

  const handleEdit = (account) => {
    if (!account?.AccountID) return;
    navigate(`/accounts/edit/${account.AccountID}`);
  };

  const handleSaveNote = async (noteData) => {
    try {
      await createNote({
        ...noteData,
        entity_type: 'Account',
        entity_id: selectedAccount?.AccountID
      });
      setStatusMessage("Note created successfully");
      setStatusSeverity("success");
      setRefreshFlag((f) => !f);
    } catch (err) {
      console.error("Error creating note:", err);
      setStatusMessage("Failed to create note");
      setStatusSeverity("error");
    }
  };

  const handleEditNote = async (noteId, updatedData) => {
    try {
      await updateNote(noteId, updatedData);
      setStatusMessage("Note updated successfully");
      setStatusSeverity("success");
      setRefreshFlag((f) => !f);
    } catch (err) {
      console.error("Error updating note:", err);
      setStatusMessage("Failed to update note");
      setStatusSeverity("error");
    }
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

  const handleAssignUserToAccount = (account) => {
    setSelectedAccount(account);
    setAssignUserDialogOpen(true);
  };

  // FIXED: Don't trigger refresh until AFTER dialog closes
  const handleConfirmAssignUser = async (employeeId) => {
    if (!selectedAccount) return;
    
    try {
      await assignUser(selectedAccount.AccountID, employeeId);
      
      // Close dialog first
      setAssignUserDialogOpen(false);
      setSelectedAccount(null);
      
      // Then show success message and refresh
      setStatusMessage("User assigned successfully");
      setStatusSeverity("success");
      setRefreshFlag((f) => !f);
    } catch (err) {
      console.error("Error assigning user:", err);
      setStatusMessage(err.message || "Failed to assign user");
      setStatusSeverity("error");
      
      // Still close dialog on error
      setAssignUserDialogOpen(false);
      setSelectedAccount(null);
    }
  };

  const handleUnassignUsers = (account) => {
    setAccountForUnassign(account);
    setUnassignUserDialogOpen(true);
  };

  const handleConfirmUnassignUser = async (account, selectedUserIds) => {
    if (!account?.AccountID) {
      setStatusMessage("Account information is missing");
      setStatusSeverity("error");
      return;
    }

    if (!selectedUserIds || selectedUserIds.length === 0) {
      setStatusMessage("No users selected for unassignment");
      setStatusSeverity("warning");
      return;
    }

    // Close dialog first
    setUnassignUserDialogOpen(false);
    setAccountForUnassign(null);

    try {
      // Unassign users one by one
      const promises = selectedUserIds.map(userId => 
        removeAssignedUser(account.AccountID, userId)
      );
      await Promise.all(promises);
      
      const userCount = selectedUserIds.length;
      setStatusMessage(`${userCount} user${userCount > 1 ? 's' : ''} unassigned successfully`);
      setStatusSeverity("success");
      setRefreshFlag((f) => !f);
    } catch (err) {
      console.error("Error unassigning users:", err);
      setStatusMessage(err.message || "Failed to unassign users");
      setStatusSeverity("error");
    }
  };

  const handleAssignSequence = (account) => {
    setSelectedAccount(account);
    setAssignSequenceDialogOpen(true);
  };

  const handleConfirmAssignSequence = async (sequenceId) => {
    if (!selectedAccount) return;
    
    setBulkLoading(true);
    
    try {
      const result = await assignSequenceToAccount(selectedAccount.AccountID, sequenceId);
      
      let message = "Sequence assigned successfully";
      if (result?.activitiesCreated > 0) {
        message += ` and ${result.activitiesCreated} activities created`;
      }
      
      setStatusMessage(message);
      setStatusSeverity("success");
      setRefreshFlag((f) => !f);
    } catch (err) {
      console.error("Error assigning sequence:", err);
      setStatusMessage(err.message || "Failed to assign sequence");
      setStatusSeverity("error");
    } finally {
      setBulkLoading(false);
      setAssignSequenceDialogOpen(false);
      setSelectedAccount(null);
    }
  };

  // ---------------- BULK ACTIONS ----------------
  const handleBulkDelete = async () => {
    setBulkLoading(true);
    try {
      await Promise.all(selected.map((id) => deactivateAccount(id)));
      setStatusMessage(`${selected.length} account(s) deactivated successfully`);
      setStatusSeverity("success");
      setRefreshFlag((f) => !f);
      setSelected([]);
    } catch (err) {
      console.error("Error in bulk deactivate:", err);
      setStatusMessage("Failed to deactivate some accounts");
      setStatusSeverity("error");
    } finally {
      setBulkLoading(false);
      setBulkDeleteDialogOpen(false);
    }
  };

  const handleBulkClaim = async () => {
    setBulkLoading(true);
    try {
      const result = await bulkClaimAccounts(selected);
      
      let message = "";
      if (result.claimedCount > 0) {
        message = `Successfully claimed ${result.claimedCount} account(s)`;
        if (result.failedCount > 0) {
          message += `. ${result.failedCount} account(s) could not be claimed.`;
        }
        setStatusSeverity("success");
      } else {
        message = "No accounts were claimed.";
        setStatusSeverity("warning");
      }
      
      setStatusMessage(message);
      setRefreshFlag((flag) => !flag);
      setSelected([]);
    } catch (err) {
      console.error("Bulk claim error:", err);
      setStatusMessage(err.message || "Failed to claim accounts");
      setStatusSeverity("error");
    } finally {
      setBulkLoading(false);
      setBulkClaimDialogOpen(false);
    }
  };

  const handleBulkClaimAndSequence = () => {
    setBulkClaimAndSequenceDialogOpen(true);
  };

  const confirmBulkClaimAndSequence = async (sequenceId) => {
    setBulkLoading(true);
    
    try {
      const result = await bulkClaimAccountsAndAddSequence(selected, sequenceId);
      
      let message = "";

      if (result.claimedCount > 0) {
        message = `Successfully claimed ${result.claimedCount} account(s)`;
        if (result.totalActivitiesCreated > 0) {
          message += ` and created ${result.totalActivitiesCreated} activities`;
        }
        if (result.failedCount > 0) {
          message += `. ${result.failedCount} account(s) could not be claimed.`;
        }
        setStatusSeverity("success");
      } else {
        message = "No accounts were claimed.";
        setStatusSeverity("warning");
      }

      setStatusMessage(message);
      setRefreshFlag((flag) => !flag);
      setSelected([]);
    } catch (err) {
      console.error("Bulk claim and sequence error:", err);
      setStatusMessage(err.message || "Failed to claim accounts and assign sequence");
      setStatusSeverity("error");
    } finally {
      setBulkLoading(false);
      setBulkClaimAndSequenceDialogOpen(false);
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
        onCloseStatusMessage={() => setStatusMessage("")}
        selected={selected}
        onSelectClick={handleSelectClick}
        onSelectAllClick={handleSelectAllClick}
        currentFilter={currentFilter}
        setCurrentFilter={setCurrentFilter}
        onRefresh={() => setRefreshFlag((f) => !f)}
        onView={handleView}
        onEdit={handleEdit}
        onCreate={() => navigate("/accounts/create")}
        onDeactivate={handleDeactivateAccount}
        onReactivate={handleReactivateAccount}
        onAssignUser={handleAssignUserToAccount}
        onUnassignUsers={handleUnassignUsers}
        onAddNote={handleAddNote}
        onAddAttachment={handleAddAttachment}
        onClaimAccount={handleClaimAccount}
        onUnclaimAccount={handleUnclaimAccount}
        onAssignSequence={handleAssignSequence}
        onBulkClaimAndSequence={handleBulkClaimAndSequence}
        onBulkClaim={() => setBulkClaimDialogOpen(true)}
        onBulkDelete={() => setBulkDeleteDialogOpen(true)}
        selectedAccount={selectedAccount}
        userName={storedUser.name || storedUser.username || "User"}
        selectedItems={selectedAccountObjects} 
        onClearSelection={() => setSelected([])}  
        userRoles={roles} 
      />

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

    {/* FIXED: Added restrictToTeam and teamMembers props for Sales Manager support */}
    <AssignUserDialog
      open={assignUserDialogOpen}
      onClose={() => {
        setAssignUserDialogOpen(false);
        setSelectedAccount(null);
      }}
      onAssign={handleConfirmAssignUser}
      account={selectedAccount}
      restrictToTeam={isSalesManager}
      teamMembers={teamMembers}
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
      onConfirm={handleBulkClaim}
      selectedItems={selectedAccountObjects}
      loading={bulkLoading}
    />

    <BulkClaimAndSequenceDialog
      open={bulkClaimAndSequenceDialogOpen}
      onClose={() => setBulkClaimAndSequenceDialogOpen(false)}
      onConfirm={confirmBulkClaimAndSequence}
      selectedItems={selectedAccountObjects}
      sequences={sequences}
      loading={bulkLoading}
    />

    <AssignSequenceDialog
      open={assignSequenceDialogOpen}
      onClose={() => {
        setAssignSequenceDialogOpen(false);
        setSelectedAccount(null);
      }}
      onConfirm={handleConfirmAssignSequence}
      account={selectedAccount}
      sequences={sequences}
      loading={bulkLoading}
    />

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