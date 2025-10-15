import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
  Typography,
  Button,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

import EmployeeDetailsForm from "../../components/forms/EmployeeDetailsForm";
import ActivityDetailsForm from "../../components/forms/ActivityDetailsForm";
import NotesForm from "../../components/forms/NoteDetailsForm";
import AttachmentsForm from "../../components/forms/AttachmentDetailsForm";

import {
  getEmployeeById,
  deactivateEmployee,
} from "../../services/employeeService";

export default function EmployeeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const tabs = ["Activities", "Notes", "Attachments"];

  const refreshEmployee = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching employee with ID:", id);

      if (!id) {
        throw new Error("No employee ID provided");
      }

      const data = await getEmployeeById(id);
      console.log("Employee data received:", data);

      if (!data) {
        throw new Error("Employee not found");
      }

      setEmployee(data);
    } catch (err) {
      console.error("Error fetching employee:", err);

      // Extract the actual error message from the API response
      let errorMessage = "Failed to load employee details";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 404) {
        errorMessage = `Employee with ID ${id} not found. Please check the employee ID and try again.`;
      } else if (err.response?.status) {
        errorMessage = `Server error (${err.response.status}): ${err.response.statusText}`;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      setError(
        "No employee ID provided. Please navigate from the employees list."
      );
      setLoading(false);
      return;
    }

    // Validate that the ID is a valid number
    if (isNaN(parseInt(id))) {
      setError(
        `Invalid employee ID: "${id}". Please ensure you're navigating from the employees list.`
      );
      setLoading(false);
      return;
    }

    refreshEmployee();
  }, [id, refreshEmployee]);

  const handleTabChange = (_, newValue) => setActiveTab(newValue);
  const handleBack = () => navigate("/employees");

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to deactivate this employee?"))
      return;
    try {
      await deactivateEmployee(employee, 1, 1); // Using placeholder values for changedBy and actionTypeId
      setSuccessMessage("Employee deactivated successfully!");
      setTimeout(() => navigate("/employees"), 1500);
    } catch (err) {
      console.error(err);
      setError("Failed to deactivate employee");
    }
  };

  const renderTabContent = () => {
    if (!employee) return null;
    switch (tabs[activeTab]) {
      case "Activities":
        return <ActivityDetailsForm employeeId={id} />;
      case "Notes":
        return (
          <NotesForm
            entityType="employee"
            entityId={employee.EmployeeID}
            onSaved={refreshEmployee}
          />
        );
      case "Attachments":
        return (
          <AttachmentsForm
            entityType="employee"
            entityId={employee.EmployeeID}
            onUploaded={refreshEmployee}
          />
        );
      default:
        return null;
    }
  };

  if (loading) return <Typography>Loading employee details...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!employee) return <Alert severity="warning">Employee not found.</Alert>;

  return (
    <Box
      sx={{
        width: "100%",
        p: 2,
        backgroundColor: "#fafafa",
        minHeight: "100vh",
      }}>
      {/* Back Button */}
      <Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{
            color: "#000", // Text color
            borderColor: "#000", // Border color
            "&:hover": {
              backgroundColor: "#000", // Black background on hover
              color: "#fff", // White text on hover
              borderColor: "#000",
            },
          }}>
          Back to Employees
        </Button>
      </Box>

      {/* Employee Panel */}
      <Card sx={{ borderRadius: 2, overflow: "hidden", mb: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <EmployeeDetailsForm employeeId={id} />
        </CardContent>
      </Card>

      {/* Related Tabs */}
      <Card sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider" }}>
          {tabs.map((tab, idx) => (
            <Tab key={idx} label={tab} />
          ))}
        </Tabs>
        <Box sx={{ p: 2 }}>{renderTabContent()}</Box>
      </Card>

      {/* Success Message */}
      {successMessage && (
        <Alert
          severity="success"
          sx={{ mt: 2 }}
          onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}
    </Box>
  );
}
