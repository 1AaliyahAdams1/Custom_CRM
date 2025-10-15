import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Alert } from "@mui/material";
import { UniversalDetailView } from "../../components/detailsFormat/DetailsView";
import NotesPopup from "../../components/NotesComponent";
import AttachmentsPopup from "../../components/AttachmentsComponent";
import {
  getEmployeeById,
  updateEmployee,
  deactivateEmployee,
} from "../../services/employeeService";

const employeeMainFields = [
  {
    key: "EmployeeName",
    label: "Employee Name",
    required: true,
    width: { xs: 12, md: 6 },
  },
  {
    key: "EmployeeEmail",
    label: "Employee Email",
    type: "email",
    width: { xs: 12, md: 6 },
  },
  {
    key: "EmployeePhone",
    label: "Employee Phone",
    type: "tel",
    width: { xs: 12, md: 6 },
  },
  {
    key: "HireDate",
    label: "Hire Date",
    type: "date",
    required: true,
    width: { xs: 12, md: 6 },
  },
  { key: "Salary", label: "Salary", type: "number", width: { xs: 12, md: 6 } },
  { key: "Department", label: "Department", width: { xs: 12, md: 6 } },
  { key: "JobTitle", label: "Job Title", width: { xs: 12, md: 6 } },
  {
    key: "UserID",
    label: "User ID",
    type: "number",
    required: true,
    width: { xs: 12, md: 6 },
  },
  { key: "Active", label: "Active", type: "boolean", width: { xs: 12, md: 6 } },
];

export default function EmployeeDetailsForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [attachmentsPopupOpen, setAttachmentsPopupOpen] = useState(false);

  useEffect(() => {
    const loadEmployee = async () => {
      if (!id) {
        setError("No employee ID provided in the route.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getEmployeeById(id);
        console.log("Debug: getEmployeeById response:", data);

        const employeeData = data?.data || data;
        if (!employeeData) {
          throw new Error("Employee not found");
        }

        setEmployee(employeeData);
      } catch (err) {
        console.error("Error loading employee:", err);
        setError(err.message || "Failed to load employee");
      } finally {
        setLoading(false);
      }
    };

    loadEmployee();
  }, [id]);

  const handleSave = async (formData) => {
    try {
      console.log("Debug: Saving employee:", formData);
      setError(null);

      // Optimistic UI update
      setEmployee(formData);

      await updateEmployee(id, formData, 1, 1); // Using placeholder values for changedBy and actionTypeId
      setSuccessMessage("Employee updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error saving employee:", err);
      setError(err.message || "Failed to save employee.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to deactivate this employee?"))
      return;

    try {
      setError(null);
      await deactivateEmployee(employee, 1, 1); // Using placeholder values for changedBy and actionTypeId
      setSuccessMessage("Employee deactivated successfully!");
      setTimeout(() => navigate("/employees"), 1500);
    } catch (err) {
      console.error("Error deactivating employee:", err);
      setError(err.message || "Failed to deactivate employee.");
    }
  };

  const handleBack = () => navigate("/employees");
  const handleAddNote = () => setNotesPopupOpen(true);
  const handleAddAttachment = () => setAttachmentsPopupOpen(true);

  if (loading) return <Box>Loading employee details...</Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!employee) return <Alert severity="warning">Employee not found.</Alert>;

  const getEmployeeDisplayName = (e) =>
    e.EmployeeName || `Employee #${e.EmployeeID}`;

  // Header chips
  const headerChips = [];
  if (employee) {
    headerChips.push({
      label: employee.Active ? "Active" : "Inactive",
      color: employee.Active ? "#10b981" : "#6b7280",
      textColor: "#fff",
    });

    if (employee.Department) {
      headerChips.push({
        label: employee.Department,
        color: "#3b82f6",
        textColor: "#fff",
      });
    }

    if (employee.JobTitle) {
      headerChips.push({
        label: employee.JobTitle,
        color: "#6b7280",
        textColor: "#fff",
      });
    }
  }

  return (
    <Box>
      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      <UniversalDetailView
        title={getEmployeeDisplayName(employee)}
        subtitle={
          employee?.EmployeeID
            ? `Employee ID: ${employee.EmployeeID}`
            : undefined
        }
        item={employee}
        mainFields={employeeMainFields}
        onBack={handleBack}
        onSave={handleSave}
        onDelete={handleDelete}
        onAddNote={handleAddNote}
        onAddAttachment={handleAddAttachment}
        entityType="employee"
        headerChips={headerChips}
        relatedTabs={[]} // Add related tabs if needed
      />

      <NotesPopup
        open={notesPopupOpen}
        onClose={() => setNotesPopupOpen(false)}
        entityType="employee"
        entityId={employee?.EmployeeID}
      />
      <AttachmentsPopup
        open={attachmentsPopupOpen}
        onClose={() => setAttachmentsPopupOpen(false)}
        entityType="employee"
        entityId={employee?.EmployeeID}
      />
    </Box>
  );
}
