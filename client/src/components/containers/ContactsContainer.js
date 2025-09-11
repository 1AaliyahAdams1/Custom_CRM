import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ContactsPage from "../../pages/Contacts/ContactsPage";
import {
  getAllContacts,
  fetchContactsByUser,
  deactivateContact,
} from "../../services/contactService";
import {
  getAllAccounts,
  fetchActiveAccountsByUser,
  fetchActiveUnassignedAccounts,
} from "../../services/accountService";
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
import { formatters } from '../../utils/formatters';

const ContactsContainer = () => {
  const navigate = useNavigate();

  const [allContacts, setAllContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [accountOwnership, setAccountOwnership] = useState(new Map()); // Map of AccountID -> ownerStatus
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(false);

  const [selected, setSelected] = useState([]);

  // Popups
  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [attachmentsPopupOpen, setAttachmentsPopupOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);

  // User roles
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const roles = Array.isArray(storedUser.roles) ? storedUser.roles : [];
  const userId = storedUser.UserID || storedUser.id || null;

  const isCLevel = roles.includes("C-level");
  const isSalesRep = roles.includes("Sales Representative");

  // Helper function to normalize boolean values
  const normalizeBoolean = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower === 'true' || lower === '1' || lower === 'yes') return true;
      if (lower === 'false' || lower === '0' || lower === 'no') return false;
    }
    if (typeof value === 'number') {
      return value === 1;
    }
    return null;
  };

  // ---------------- IMPROVED FILTER LOGIC ----------------
  const applyFilter = (contacts, filterType) => {
    console.log('=== CONTACTS FILTER DEBUG ===');
    console.log('Applying filter:', filterType, 'to contacts:', contacts.length);
    console.log('Account ownership map size:', accountOwnership.size);
    console.log('User roles:', roles);
    console.log('User ID:', userId);
    
    let filteredContacts;
    switch (filterType) {
      case 'my':
        // Contacts from accounts I own
        if (isSalesRep) {
          filteredContacts = contacts.filter(contact => {
            const ownerStatus = accountOwnership.get(contact.AccountID);
            console.log(`Contact ${contact.PersonFullName} (Account: ${contact.AccountID}) - Owner Status: ${ownerStatus}`);
            return ownerStatus === 'owned';
          });
        } else {
          // Non-sales reps might not have "owned" accounts
          filteredContacts = [];
        }
        break;
        
      case 'team':
        if (isCLevel) {
          // C-level sees all contacts
          filteredContacts = contacts;
        } else if (isSalesRep) {
          // Sales rep sees contacts from owned and unassigned accounts
          filteredContacts = contacts.filter(contact => {
            const ownerStatus = accountOwnership.get(contact.AccountID);
            return ownerStatus === 'owned' || ownerStatus === 'unowned';
          });
        } else {
          // Other roles see all contacts (adjust as needed)
          filteredContacts = contacts;
        }
        break;
        
      case 'unassigned':
        if (isCLevel) {
          // C-level sees contacts from unassigned accounts only
          filteredContacts = contacts.filter(contact => {
            const ownerStatus = accountOwnership.get(contact.AccountID);
            console.log(`Unassigned filter - Contact ${contact.PersonFullName}: ${ownerStatus}`);
            return ownerStatus === 'unowned'; // Changed from 'n/a' || 'unowned' to just 'unowned'
          });
        } else if (isSalesRep) {
          // Sales rep sees contacts from unassigned accounts
          filteredContacts = contacts.filter(contact => {
            const ownerStatus = accountOwnership.get(contact.AccountID);
            return ownerStatus === 'unowned';
          });
        } else {
          filteredContacts = [];
        }
        break;

      case 'employed':
        // Currently employed contacts
        filteredContacts = contacts.filter(contact => {
          const employed = normalizeBoolean(contact.Still_employed);
          console.log(`Employment filter - Contact ${contact.PersonFullName}: Still_employed = ${contact.Still_employed} (normalized: ${employed})`);
          return employed === true;
        });
        break;

      case 'not_employed':
        // Not currently employed contacts
        filteredContacts = contacts.filter(contact => {
          const employed = normalizeBoolean(contact.Still_employed);
          console.log(`Not employed filter - Contact ${contact.PersonFullName}: Still_employed = ${contact.Still_employed} (normalized: ${employed})`);
          return employed === false;
        });
        break;
        
      case 'all':
      default:
        filteredContacts = contacts;
        break;
    }
    
    console.log(`Filter "${filterType}" returned:`, filteredContacts.length, 'contacts');
    
    // Additional debugging for employment status
    if (filterType === 'employed' || filterType === 'not_employed') {
      console.log('Employment status breakdown:');
      const employmentStats = contacts.reduce((stats, contact) => {
        const employed = normalizeBoolean(contact.Still_employed);
        if (employed === true) stats.employed++;
        else if (employed === false) stats.notEmployed++;
        else stats.unknown++;
        return stats;
      }, { employed: 0, notEmployed: 0, unknown: 0 });
      console.log('Employment stats:', employmentStats);
    }
    
    console.log('=== END CONTACTS FILTER DEBUG ===');
    return filteredContacts;
  };

  // ---------------- IMPROVED ACCOUNT OWNERSHIP FETCH ----------------
  const fetchAccountOwnership = async () => {
    console.log('=== FETCHING ACCOUNT OWNERSHIP ===');
    try {
      const ownershipMap = new Map();

      if (isCLevel) {
        console.log('Fetching all accounts for C-level user');
        const response = await getAllAccounts();
        const accountsData = response.data || response || []; // Handle different response formats
        console.log('All accounts received:', accountsData.length);
        
        // For C-level, we need to determine which accounts are assigned vs unassigned
        // First, get all assigned accounts
        const assignedRes = await fetchActiveAccountsByUser(userId);
        const assignedAccounts = Array.isArray(assignedRes) ? assignedRes : [];
        const assignedAccountIds = new Set(assignedAccounts.map(acc => acc.AccountID));
        
        // Then get unassigned accounts
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
            ownershipMap.set(acc.AccountID, 'unknown'); // Fallback
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
      
      // Debug: Show some entries
      let debugCount = 0;
      for (let [accountId, status] of ownershipMap.entries()) {
        if (debugCount < 5) {
          console.log(`Account ${accountId}: ${status}`);
          debugCount++;
        }
      }
      
      setAccountOwnership(ownershipMap);
      return ownershipMap;
    } catch (err) {
      console.error('Failed to fetch account ownership:', err);
      setError('Failed to load account information for filtering');
      return new Map();
    }
  };

  // ---------------- FETCH CONTACTS ----------------
  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      let data = [];

      // First fetch account ownership information
      const ownershipMap = await fetchAccountOwnership();

      if (isCLevel) {
        const allContacts = await getAllContacts();
        data = allContacts;
      } else if (isSalesRep && userId) {
        const userContacts = await fetchContactsByUser(userId);
        data = userContacts;
      }

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format - expected array");
      }

      console.log('Raw contacts received:', data.length);

      // Process contacts with PersonFullName
      const processedData = data.map((contact) => ({
        ...contact,
        PersonFullName: [
          contact.first_name || "",
          contact.middle_name || "",
          contact.surname || "",
        ]
          .filter((part) => part.trim() !== "")
          .join(" "),
      }));

      setAllContacts(processedData);
      const filtered = applyFilter(processedData, currentFilter);
      setFilteredContacts(filtered);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError("Failed to load contacts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- FILTER HANDLER ----------------
  const handleFilterChange = (filterType) => {
    console.log('Filter changed to:', filterType);
    setCurrentFilter(filterType);
    const filtered = applyFilter(allContacts, filterType);
    setFilteredContacts(filtered);
    setSelected([]);
  };

  useEffect(() => {
    fetchContacts();
  }, [refreshFlag]);

  useEffect(() => {
    if (allContacts.length > 0 && accountOwnership.size > 0) {
      const filtered = applyFilter(allContacts, currentFilter);
      setFilteredContacts(filtered);
    }
  }, [allContacts, currentFilter, accountOwnership]);

  // ---------------- SELECTION HANDLERS ----------------
  const handleSelectClick = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) newSelected = [...selected, id];
    else newSelected = selected.filter((sid) => sid !== id);
    setSelected(newSelected);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) setSelected(filteredContacts.map((c) => c.ContactID));
    else setSelected([]);
  };

  // ---------------- CONFIRM/CANCEL HANDLERS -----------
  const confirmDelete = async () => {
    try {
      await deactivateContact(contactToDelete);
      setSuccessMessage("Contact deleted successfully.");
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      console.error("Failed to delete contact:", err);
      setError("Failed to delete contact. Please try again.");
    } finally {
      setConfirmOpen(false);
      setContactToDelete(null);
    }
  };

  const cancelDelete = () => {
    setConfirmOpen(false);
    setContactToDelete(null);
  };

  // ---------------- CONTACT HANDLERS ----------------
  const handleDeactivate = (id) => {
    if (!id) {
      setError("Cannot delete contact - missing ID");
      return;
    }
    setContactToDelete(id);
    setConfirmOpen(true);
  };

  const handleEdit = (contact) => {
    if (!contact?.ContactID) {
      setError("Cannot edit contact - missing ID");
      return;
    }
    navigate(`/contacts/edit/${contact.ContactID}`, { state: { contact } });
  };

  const handleView = (contact) => {
    if (!contact?.ContactID) {
      setError("Cannot view contact - missing ID");
      return;
    }
    navigate(`/contacts/${contact.ContactID}`);
  };

  const handleCreate = () => navigate("/contacts/create");

  // ---------------- NOTES HANDLERS ----------------
  const handleAddNote = (contact) => {
    if (!contact.ContactID) return;
    setSelectedContact(contact);
    setNotesPopupOpen(true);
  };

  const handleSaveNote = async (noteData) => {
    try {
      const notePayload = {
        EntityID: selectedContact.ContactID,
        EntityType: "Contact",
        Content: noteData.Content,
      };
      await createNote(notePayload);
      setSuccessMessage("Note added successfully!");
      setNotesPopupOpen(false);
      setRefreshFlag((f) => !f);
    } catch (err) {
      setError(err.message || "Failed to save note");
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId);
      setSuccessMessage("Note deleted successfully!");
      setRefreshFlag((f) => !f);
    } catch (err) {
      setError(err.message || "Failed to delete note");
    }
  };

  const handleEditNote = async (noteData) => {
    try {
      await updateNote(noteData.NoteID, noteData);
      setSuccessMessage("Note updated successfully!");
      setNotesPopupOpen(false);
      setRefreshFlag((f) => !f);
    } catch (err) {
      setError(err.message || "Failed to update note");
    }
  };

  // ---------------- ATTACHMENTS HANDLERS ----------------
  const handleAddAttachment = (contact) => {
    if (!contact.ContactID) return;
    setSelectedContact(contact);
    setAttachmentsPopupOpen(true);
  };

  const handleUploadAttachment = async (files) => {
    try {
      const uploadPromises = files.map(file => 
        uploadAttachment({
          file,
          entityId: selectedContact.ContactID,
          entityTypeName: "Contact"
        })
      );
      await Promise.all(uploadPromises);
      setSuccessMessage(`${files.length} attachment(s) uploaded successfully!`);
      setAttachmentsPopupOpen(false);
      setRefreshFlag((f) => !f);
    } catch (err) {
      setError(err.message || "Failed to upload attachments");
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await deleteAttachment(attachmentId);
      setSuccessMessage("Attachment deleted successfully!");
      setRefreshFlag((f) => !f);
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
      <ContactsPage
        contacts={filteredContacts}
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
        onFilterChange={handleFilterChange}
        userRoles={roles}
        formatters={formatters}
        totalCount={allContacts.length}
        currentFilter={currentFilter}
      />

      {/* Notes Popup */}
      <NotesPopup
        open={notesPopupOpen}
        onClose={() => setNotesPopupOpen(false)}
        onSave={handleSaveNote}
        onEdit={handleEditNote}
        onDelete={handleDeleteNote}
        entityType="Contact"
        entityId={selectedContact?.ContactID}
        entityName={selectedContact?.PersonFullName}
        showExistingNotes={true}
      />

      {/* Attachments Popup */}
      <AttachmentsPopup
        open={attachmentsPopupOpen}
        onClose={() => setAttachmentsPopupOpen(false)}
        entityType="Contact"
        entityId={selectedContact?.ContactID}
        entityName={selectedContact?.PersonFullName}
        onUpload={handleUploadAttachment}
        onDelete={handleDeleteAttachment}
        onDownload={handleDownloadAttachment}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Contact?"
        description="Are you sure you want to delete this contact? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
};

export default ContactsContainer;