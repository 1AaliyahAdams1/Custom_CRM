import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import EmployeesPage from "../../pages/Employees/EmployeesPage";
import {
  getAllEmployees,
  deactivateEmployee,
} from "../../services/employeeService";
import {
  createNote,
  updateNote,
  deleteNote,
  getNotesByEntity,
} from "../../services/noteService";
import {
  uploadAttachment,
  getAttachmentsByEntity,
  deleteAttachment,
  downloadAttachment,
} from "../../services/attachmentService";
import ConfirmDialog from "../../components/dialogs/ConfirmDialog";
import NotesPopup from "../../components/NotesComponent";
import AttachmentsPopup from "../../components/AttachmentsComponent";
import { formatters } from "../../utils/formatters";

const EmployeesContainer = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(false);

  const [selected, setSelected] = useState([]);

  // Popups
  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [attachmentsPopupOpen, setAttachmentsPopupOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  // Filters
  const [searchTerm] = useState("");
  const [activeStatusFilter] = useState("");

  // User roles
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const roles = Array.isArray(storedUser.roles) ? storedUser.roles : [];
  const userId = storedUser.UserID || storedUser.id || null;

  const isCLevel = roles.includes("C-level");
  const isSalesManager = roles.includes("Sales Manager");
  const isSalesRep = roles.includes("Sales Representative");

  // ---------------- FETCH EMPLOYEES ----------------
  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      let data = [];

      // All roles can view employees for now
      if (isCLevel || isSalesManager || isSalesRep) {
        console.log("Fetching employees...");
        console.log("User roles:", roles);
        console.log("User ID:", userId);

        const allEmployees = await getAllEmployees();
        console.log("Raw employees response:", allEmployees);
        console.log("Response type:", typeof allEmployees);
        console.log("Is array:", Array.isArray(allEmployees));

        // Handle different response structures
        if (Array.isArray(allEmployees)) {
          data = allEmployees;
        } else if (allEmployees && Array.isArray(allEmployees.data)) {
          data = allEmployees.data;
        } else if (
          allEmployees &&
          allEmployees.employees &&
          Array.isArray(allEmployees.employees)
        ) {
          data = allEmployees.employees;
        } else {
          console.error("Unexpected response structure:", allEmployees);
          throw new Error(
            "Invalid response format - expected array of employees"
          );
        }

        console.log("Processed employees data:", data);
        console.log("Number of employees:", data.length);
      }

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format - expected array");
      }

      setEmployees(data);
    } catch (err) {
      console.error("Error in fetchEmployees:", err);
      console.error("Full error object:", err);
      console.error("Error response:", err.response);

      // Extract the actual error message from the API response
      let errorMessage = "Failed to load employees. Please try again.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.details) {
        errorMessage = err.response.data.details;
      } else if (err.response?.data) {
        // Try to extract any error information from the response data
        errorMessage =
          typeof err.response.data === "string"
            ? err.response.data
            : JSON.stringify(err.response.data);
      } else if (err.response?.status) {
        errorMessage = `Server error (${err.response.status}): ${err.response.statusText}`;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("EmployeesContainer mounted, fetching employees...");
    fetchEmployees();
  }, [refreshFlag]);

  // Debug: Log employees state changes
  useEffect(() => {
    console.log("Employees state updated:", employees);
    console.log("Number of employees:", employees.length);
  }, [employees]);

  // ---------------- FILTERED EMPLOYEES ----------------
  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim() && !activeStatusFilter) {
      return employees;
    }

    const filtered = employees.filter((employee) => {
      let matchesSearch = true;
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        matchesSearch =
          (employee.EmployeeID &&
            employee.EmployeeID.toString().includes(searchTerm)) ||
          (employee.EmployeeName &&
            employee.EmployeeName.toLowerCase().includes(searchLower)) ||
          (employee.EmployeeEmail &&
            employee.EmployeeEmail.toLowerCase().includes(searchLower)) ||
          (employee.EmployeePhone &&
            employee.EmployeePhone.includes(searchTerm)) ||
          (employee.DepartmentID &&
            employee.DepartmentID.toString().includes(searchTerm)) ||
          (employee.JobTitleID &&
            employee.JobTitleID.toString().includes(searchTerm)) ||
          (employee.UserID && employee.UserID.toString().includes(searchTerm));
      }

      let matchesActiveStatus = true;
      if (activeStatusFilter) {
        matchesActiveStatus =
          (activeStatusFilter === "active" && employee.Active === true) ||
          (activeStatusFilter === "inactive" && employee.Active === false);
      }

      return matchesSearch && matchesActiveStatus;
    });

    return filtered;
  }, [employees, searchTerm, activeStatusFilter]);

  // ---------------- SELECTION HANDLERS ----------------
  const handleSelectClick = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) newSelected = [...selected, id];
    else newSelected = selected.filter((sid) => sid !== id);
    setSelected(newSelected);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked)
      setSelected(filteredEmployees.map((e) => e.EmployeeID));
    else setSelected([]);
  };

  // ---------------- CONFIRM/CANCEL HANDLERS -----------
  const confirmDelete = async () => {
    try {
      await deactivateEmployee(employeeToDelete, 1, 1); // Using placeholder values for changedBy and actionTypeId
      setSuccessMessage("Employee deactivated successfully.");
      setRefreshFlag((flag) => !flag);
    } catch (err) {
      console.error("Failed to deactivate employee:", err);
      setError("Failed to deactivate employee. Please try again.");
    } finally {
      setConfirmOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const cancelDelete = () => {
    setConfirmOpen(false);
    setEmployeeToDelete(null);
  };

  // ---------------- EMPLOYEE HANDLERS ----------------
  const handleDeactivate = (employee) => {
    if (!employee || !employee.EmployeeID) {
      setError("Cannot deactivate employee - missing employee data");
      return;
    }
    setEmployeeToDelete(employee);
    setConfirmOpen(true);
  };

  const handleEdit = (employee) => {
    if (!employee?.EmployeeID) {
      setError("Cannot edit employee - missing ID");
      return;
    }
    navigate(`/employees/edit/${employee.EmployeeID}`, { state: { employee } });
  };

  const handleView = (employee) => {
    if (!employee?.EmployeeID) {
      setError("Cannot view employee - missing ID");
      return;
    }
    navigate(`/employees/${employee.EmployeeID}`);
  };

  const handleCreate = () => navigate("/employees/create");

  // ---------------- NOTES HANDLERS ----------------
  const handleAddNote = (employee) => {
    if (!employee.EmployeeID) return;
    setSelectedEmployee(employee);
    setNotesPopupOpen(true);
  };

  const handleSaveNote = async (noteData) => {
    try {
      const notePayload = {
        EntityID: selectedEmployee.EmployeeID,
        EntityType: "Employee",
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
  const handleAddAttachment = (employee) => {
    if (!employee.EmployeeID) return;
    setSelectedEmployee(employee);
    setAttachmentsPopupOpen(true);
  };

  const handleUploadAttachment = async (files) => {
    try {
      const uploadPromises = files.map((file) =>
        uploadAttachment({
          file,
          entityId: selectedEmployee.EmployeeID,
          entityTypeName: "Employee",
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
      <EmployeesPage
        employees={filteredEmployees}
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
        formatters={formatters}
        totalCount={employees.length}
      />

      {/* Notes Popup */}
      <NotesPopup
        open={notesPopupOpen}
        onClose={() => setNotesPopupOpen(false)}
        onSave={handleSaveNote}
        onEdit={handleEditNote}
        onDelete={handleDeleteNote}
        entityType="Employee"
        entityId={selectedEmployee?.EmployeeID}
        entityName={selectedEmployee?.EmployeeName}
        showExistingNotes={true}
      />

      {/* Attachments Popup */}
      <AttachmentsPopup
        open={attachmentsPopupOpen}
        onClose={() => setAttachmentsPopupOpen(false)}
        entityType="Employee"
        entityId={selectedEmployee?.EmployeeID}
        entityName={selectedEmployee?.EmployeeName}
        onUpload={handleUploadAttachment}
        onDelete={handleDeleteAttachment}
        onDownload={handleDownloadAttachment}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Deactivate Employee?"
        description="Are you sure you want to deactivate this employee? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
};

export default EmployeesContainer;
