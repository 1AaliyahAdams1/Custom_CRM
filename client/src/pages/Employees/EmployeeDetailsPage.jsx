import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import { Edit, ArrowBack, Person, Work, LocationOn, CalendarToday, AttachMoney } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { getEmployeeById } from "../../services/employeeService";
import { formatters } from "../../utils/formatters";

const EmployeeDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const roles = Array.isArray(storedUser.roles) ? storedUser.roles : [];

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const data = await getEmployeeById(id);
      setEmployee(data);
    } catch (err) {
      console.error("Error fetching employee:", err);
      setError("Failed to load employee details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/employees/edit/${id}`, { state: { employee } });
  };

  const handleBack = () => {
    navigate("/employees");
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh" 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !employee) {
    return (
      <Box sx={{ 
        width: "100%", 
        backgroundColor: theme.palette.background.default,
        minHeight: "100vh", 
        p: 3 
      }}>
        <Alert severity="error">{error || "Employee not found"}</Alert>
        <Button onClick={handleBack} sx={{ mt: 2 }}>
          Back to Employees
        </Button>
      </Box>
    );
  }

  const InfoRow = ({ label, value, icon: Icon }) => (
    <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
      {Icon && (
        <Icon sx={{ 
          mr: 2, 
          mt: 0.5, 
          color: theme.palette.text.secondary,
          fontSize: 20 
        }} />
      )}
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" sx={{ 
          color: theme.palette.text.secondary,
          display: "block",
          mb: 0.5 
        }}>
          {label}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {value || "—"}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ 
      width: "100%", 
      backgroundColor: theme.palette.background.default,
      minHeight: "100vh", 
      p: 3 
    }}>
      <Paper sx={{ maxWidth: 1200, mx: "auto", p: 4, borderRadius: 2 }}>
        {/* Header */}
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          mb: 4 
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={handleBack}
            >
              Back
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Employee Details
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={handleEdit}
          >
            Edit Employee
          </Button>
        </Box>

        {/* Status Chip */}
        <Box sx={{ mb: 3 }}>
          <Chip
            label={employee.Active ? "Active" : "Inactive"}
            sx={{
              backgroundColor: employee.Active ? "#079141ff" : "#999999",
              color: "white",
              fontWeight: 600,
            }}
          />
        </Box>

        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Person sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Personal Information
                  </Typography>
                </Box>
                <InfoRow label="Name" value={employee.EmployeeName} />
                <InfoRow label="Email" value={employee.EmployeeEmail} />
                <InfoRow label="Phone" value={employee.EmployeePhone} />
                <InfoRow label="User ID" value={employee.UserID} />
              </CardContent>
            </Card>
          </Grid>

          {/* Employment Information */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Work sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Employment Information
                  </Typography>
                </Box>
                <InfoRow label="Job Title" value={employee.JobTitleName} />
                <InfoRow label="Department" value={employee.DepartmentName} />
                <InfoRow label="Team" value={employee.TeamName} />
                <InfoRow 
                  label="Hire Date" 
                  value={employee.HireDate ? formatters.date(employee.HireDate) : null} 
                />
                <InfoRow 
                  label="Termination Date" 
                  value={employee.TerminationDate ? formatters.date(employee.TerminationDate) : null} 
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Compensation */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <AttachMoney sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Compensation
                  </Typography>
                </Box>
                <InfoRow 
                  label="Salary" 
                  value={employee.salary ? formatters.currency(employee.salary) : null} 
                />
                <InfoRow 
                  label="Holidays Per Annum" 
                  value={employee.Holidays_PA ? `${employee.Holidays_PA} days` : null} 
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Location */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <LocationOn sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Location
                  </Typography>
                </Box>
                <InfoRow label="City" value={employee.CityName} />
                <InfoRow label="State/Province" value={employee.StateProvinceName} />
              </CardContent>
            </Card>
          </Grid>

          {/* System Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <CalendarToday sx={{ mr: 1, color: theme.palette.primary.main }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    System Information
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoRow 
                      label="Created At" 
                      value={employee.CreatedAt ? formatters.dateTime(employee.CreatedAt) : null} 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoRow 
                      label="Updated At" 
                      value={employee.UpdatedAt ? formatters.dateTime(employee.UpdatedAt) : null} 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <InfoRow 
                      label="Employee ID" 
                      value={employee.EmployeeID} 
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default EmployeeDetails;