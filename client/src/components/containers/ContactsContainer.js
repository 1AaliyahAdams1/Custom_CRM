import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ContactsPage from "../../pages/Contacts/ContactsPage";
import {
  getAllContacts,
  fetchContactsByUser,
  deactivateContact,
} from "../../services/contactService";
import { noteService } from "../../services/noteService";
import { attachmentService } from "../../services/attachmentService";
import ConfirmDialog from "../../components/ConfirmDialog";
import { formatters } from '../../utils/formatters';


const ContactsContainer = () => {
  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(false);

  const [selected, setSelected] = useState([]);

  // Popups
  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [attachmentsPopupOpen, setAttachmentsPopupOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupError, setPopupError] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);


  // Filters
  const [searchTerm] = useState("");
  const [employmentStatusFilter] = useState("");

  // User roles
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const roles = Array.isArray(storedUser.roles) ? storedUser.roles : [];
  const userId = storedUser.UserID || storedUser.id || null;

  const isCLevel = roles.includes("C-level");
  const isSalesRep = roles.includes("Sales Representative");

  // ---------------- FETCH CONTACTS ----------------
  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      let data = [];

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

      // Add PersonFullName for search
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
      setContacts(processedData);
    } catch (err) {
      setError("Failed to load contacts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [refreshFlag]);

  // ---------------- FILTERED CONTACTS ----------------
  const filteredContacts = useMemo(() => {

    // If no search term and no filter, return all contacts
    if (!searchTerm.trim() && !employmentStatusFilter) {
      return contacts;
    }

    const filtered = contacts.filter((contact) => {
      // Search matching - only apply if searchTerm is not empty
      let matchesSearch = true;
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        matchesSearch =
          (contact.ContactID && contact.ContactID.toString().includes(searchTerm)) ||
          (contact.AccountID && contact.AccountID.toString().includes(searchTerm)) ||
          (contact.PersonID && contact.PersonID.toString().includes(searchTerm)) ||
          (contact.WorkEmail && contact.WorkEmail.toLowerCase().includes(searchLower)) ||
          (contact.WorkPhone && contact.WorkPhone.includes(searchTerm)) ||
          (contact.JobTitleID && contact.JobTitleID.toString().includes(searchTerm)) ||
          (contact.PersonFullName && contact.PersonFullName.toLowerCase().includes(searchLower)) ||
          (contact.AccountName && contact.AccountName.toLowerCase().includes(searchLower));
      }

      // Employment status matching - only apply if filter is selected
      let matchesEmploymentStatus = true;
      if (employmentStatusFilter) {
        matchesEmploymentStatus =
          (employmentStatusFilter === "employed" && contact.Still_employed === true) ||
          (employmentStatusFilter === "not_employed" && contact.Still_employed === false) ||
          (employmentStatusFilter === "unknown" && contact.Still_employed == null);
      }

      const matches = matchesSearch && matchesEmploymentStatus;
      return matches;
    });

    return filtered;
  }, [contacts, searchTerm, employmentStatusFilter]);

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
  //-----------------CONFIRM/CANCEL HANDLERS-----------

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
    setPopupError(null);
  };

  const handleSaveNote = async (noteData) => {
    try {
      setPopupLoading(true);
      await noteService.createNote(noteData);
      setSuccessMessage("Note added successfully!");
      setNotesPopupOpen(false);
      setRefreshFlag((f) => !f);
    } catch (err) {
      setPopupError(err.message || "Failed to save note");
    } finally {
      setPopupLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      setPopupLoading(true);
      await noteService.deleteNote(noteId);
      setSuccessMessage("Note deleted successfully!");
      setRefreshFlag((f) => !f);
    } catch (err) {
      setPopupError(err.message || "Failed to delete note");
    } finally {
      setPopupLoading(false);
    }
  };

  const handleEditNote = async (noteData) => {
    try {
      setPopupLoading(true);
      await noteService.updateNote(noteData.NoteID, noteData);
      setSuccessMessage("Note updated successfully!");
      setNotesPopupOpen(false);
      setRefreshFlag((f) => !f);
    } catch (err) {
      setPopupError(err.message || "Failed to update note");
    } finally {
      setPopupLoading(false);
    }
  };

  // ---------------- ATTACHMENTS HANDLERS ----------------
  const handleAddAttachment = (contact) => {
    if (!contact.ContactID) return;
    setSelectedContact(contact);
    setAttachmentsPopupOpen(true);
    setPopupError(null);
  };

  const handleUploadAttachment = async (attachments) => {
    try {
      setPopupLoading(true);
      for (const attachment of attachments) {
        await attachmentService.uploadAttachment(attachment);
      }
      setSuccessMessage(`${attachments.length} attachment(s) uploaded successfully!`);
      setAttachmentsPopupOpen(false);
      setRefreshFlag((f) => !f);
    } catch (err) {
      setPopupError(err.message || "Failed to upload attachments");
    } finally {
      setPopupLoading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      setPopupLoading(true);
      await attachmentService.deleteAttachment(attachmentId);
      setSuccessMessage("Attachment deleted successfully!");
      setRefreshFlag((f) => !f);
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
        notesPopupOpen={notesPopupOpen}
        setNotesPopupOpen={setNotesPopupOpen}
        attachmentsPopupOpen={attachmentsPopupOpen}
        setAttachmentsPopupOpen={setAttachmentsPopupOpen}
        selectedContact={selectedContact}
        popupLoading={popupLoading}
        popupError={popupError}
        handleSaveNote={handleSaveNote}
        handleDeleteNote={handleDeleteNote}
        handleEditNote={handleEditNote}
        handleUploadAttachment={handleUploadAttachment}
        handleDeleteAttachment={handleDeleteAttachment}
        handleDownloadAttachment={handleDownloadAttachment}
        formatters={formatters}
        totalCount={contacts.length}
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