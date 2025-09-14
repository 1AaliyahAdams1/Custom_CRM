// UniversalDetailView.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  TextField,
  FormControlLabel,
  Switch,
  Checkbox,
  Paper,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from "@mui/material";
import { 
  ArrowBack, 
  Visibility, 
  Edit, 
  Delete, 
  Download,
  Phone,
  Email,
  Launch
} from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../Theme";
import DetailsActions from "./DetailsActions";
import SmartDropdown from "../../components/SmartDropdown";
import AssignUserDialog from "../AssignUserDialog";
import { claimAccount, assignUser } from "../../services/assignService";

export function UniversalDetailView({
  title,
  item,
  mainFields = [],
  relatedTabs = [],
  onBack,
  onSave,
  onDelete,
  onAddNote,
  onAddAttachment,
  loading = false,
  error = null,
  subtitle,
  headerChips = [],
  customTheme,
  readOnly = false,
  entityType = "entity",
}) {
  const [tab, setTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(item || {});
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusSeverity, setStatusSeverity] = useState("success");
  const [tabData, setTabData] = useState({});
  const [tabLoading, setTabLoading] = useState({});

  useEffect(() => {
    if (item) setFormData(item);
  }, [item]);

  useEffect(() => {
    // Load data for the active tab if it has a dataService
    if (relatedTabs[tab] && relatedTabs[tab].dataService && !tabData[tab]) {
      loadTabData(tab);
    }
  }, [tab, relatedTabs, tabData]);

  const activeTheme = customTheme || theme;

  const handleTabChange = (_, newValue) => setTab(newValue);

  const updateField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (onSave) await onSave(formData);
    setIsEditing(false);
  };

  const handleCancel = () => setIsEditing(false);

  const handleDelete = async () => {
    if (onDelete) await onDelete(formData);
  };

  const handleAddNote = () => onAddNote?.(formData);
  const handleAddAttachment = () => onAddAttachment?.(formData);

  const handleClaimAccount = async () => {
    try {
      await claimAccount(formData.AccountID);
      setStatusMessage(`Account claimed: ${formData.AccountName}`);
      setStatusSeverity("success");
      setFormData((prev) => ({ ...prev, ownerStatus: "owned" }));
    } catch (err) {
      setStatusMessage(err.message || "Failed to claim account");
      setStatusSeverity("error");
    }
  };

  const handleAssignUser = async (employeeId) => {
    try {
      await assignUser(formData.AccountID, employeeId);
      setStatusMessage(`User assigned to ${formData.AccountName}`);
      setStatusSeverity("success");
    } catch (err) {
      console.error(err);
      setStatusMessage(err.message || "Failed to assign user");
      setStatusSeverity("error");
      throw err;
    }
  };

  const loadTabData = async (tabIndex) => {
    const tabConfig = relatedTabs[tabIndex];
    if (!tabConfig?.dataService) return;

    setTabLoading(prev => ({ ...prev, [tabIndex]: true }));
    try {
      let data;
      if (typeof tabConfig.dataService === 'function') {
        data = await tabConfig.dataService(formData);
      } else {
        // Assume it's a service object with a method
        data = await tabConfig.dataService.fetchData(formData);
      }
      setTabData(prev => ({ ...prev, [tabIndex]: data?.data || data || [] }));
    } catch (err) {
      console.error(`Failed to load ${tabConfig.label} data:`, err);
      setTabData(prev => ({ ...prev, [tabIndex]: [] }));
    } finally {
      setTabLoading(prev => ({ ...prev, [tabIndex]: false }));
    }
  };

  const formatCellValue = (value, column) => {
    if (value === null || value === undefined || value === '') return '-';

    switch (column.type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'datetime':
        return new Date(value).toLocaleString();
      case 'currency':
        return `$${parseFloat(value).toLocaleString()}`;
      case 'email':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>{value}</span>
            <IconButton size="small" href={`mailto:${value}`}>
              <Email fontSize="small" />
            </IconButton>
          </Box>
        );
      case 'phone':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>{value}</span>
            <IconButton size="small" href={`tel:${value}`}>
              <Phone fontSize="small" />
            </IconButton>
          </Box>
        );
      case 'link':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>{value}</span>
            <IconButton size="small" href={value} target="_blank" rel="noopener noreferrer">
              <Launch fontSize="small" />
            </IconButton>
          </Box>
        );
      case 'status':
        const statusColors = {
          active: 'success',
          inactive: 'error',
          pending: 'warning',
          completed: 'success',
          open: 'info',
          closed: 'success',
          won: 'success',
          lost: 'error'
        };
        return (
          <Chip 
            label={value} 
            color={statusColors[value?.toLowerCase()] || 'default'} 
            size="small" 
            variant="outlined"
          />
        );
      case 'boolean':
        return <Checkbox checked={Boolean(value)} disabled size="small" />;
      default:
        return value;
    }
  };

  const renderTableTab = (tabConfig, tabIndex) => {
    const data = tabData[tabIndex] || [];
    const isLoading = tabLoading[tabIndex];

    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      );
    }

    if (!data.length) {
      return (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="textSecondary">
            No {tabConfig.label.toLowerCase()} found
          </Typography>
        </Box>
      );
    }

    return (
      <TableContainer component={Paper} elevation={0}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {tabConfig.columns.map((column, idx) => (
                <TableCell key={idx} sx={{ fontWeight: 600 }}>
                  {column.label}
                </TableCell>
              ))}
              {tabConfig.actions && (
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIdx) => (
              <TableRow key={row.id || rowIdx} hover>
                {tabConfig.columns.map((column, colIdx) => (
                  <TableCell key={colIdx}>
                    {formatCellValue(row[column.key], column)}
                  </TableCell>
                ))}
                {tabConfig.actions && (
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {tabConfig.actions.map((action, actionIdx) => (
                        <Tooltip key={actionIdx} title={action.label}>
                          <IconButton 
                            size="small" 
                            onClick={() => action.onClick(row)}
                            color={action.color || 'default'}
                          >
                            {action.icon}
                          </IconButton>
                        </Tooltip>
                      ))}
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const visibleFields = mainFields.filter(
    (field) =>
      isEditing ||
      (formData[field.key] !== undefined &&
        formData[field.key] !== null &&
        formData[field.key] !== "")
  );

  const renderField = (field) => {
    const value = formData[field.key] ?? "";

    if (!isEditing) {
      if (field.type === "boolean") return <Checkbox checked={Boolean(value)} disabled size="small" />;
      if (field.type === "link" && value)
        return (
          <a href={value} target="_blank" rel="noopener noreferrer">
            {value}
          </a>
        );
      if (field.type === "currency" && value) return `$${parseFloat(value).toLocaleString()}`;
      if (field.type === "date" && value) return new Date(value).toLocaleDateString();
      if (field.type === "datetime" && value) return new Date(value).toLocaleString();
      if (field.type === "dropdown" && item?.[field.displayField]) return item[field.displayField];

      return value || "-";
    }

    // Edit mode
    switch (field.type) {
      case "textarea":
        return (
          <TextField
            multiline
            rows={field.rows || 4}
            value={value}
            onChange={(e) => updateField(field.key, e.target.value)}
            placeholder={field.placeholder || field.label}
            size="small"
            fullWidth
            required={field.required}
          />
        );
      case "boolean":
        return (
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(value)}
                onChange={(e) => updateField(field.key, e.target.checked)}
                size="small"
              />
            }
            label={value ? "Yes" : "No"}
          />
        );
      case "number":
      case "currency":
        return (
          <TextField
            type="number"
            value={value}
            onChange={(e) => updateField(field.key, e.target.value)}
            placeholder={field.placeholder || field.label}
            size="small"
            fullWidth
            required={field.required}
            InputProps={
              field.type === "currency" ? { startAdornment: <span style={{ marginRight: 4 }}>$</span> } : undefined
            }
          />
        );
      case "date":
        return (
          <TextField
            type="date"
            value={value ? new Date(value).toISOString().split("T")[0] : ""}
            onChange={(e) => updateField(field.key, e.target.value)}
            size="small"
            fullWidth
            required={field.required}
            InputLabelProps={{ shrink: true }}
          />
        );
      case "datetime":
        return (
          <TextField
            type="datetime-local"
            value={value ? new Date(value).toISOString().slice(0, 16) : ""}
            onChange={(e) => updateField(field.key, e.target.value)}
            size="small"
            fullWidth
            required={field.required}
            InputLabelProps={{ shrink: true }}
          />
        );
      case "dropdown":
        return (
          <SmartDropdown
            label={field.label}
            name={field.key}
            value={value}
            onChange={(e) => updateField(field.key, e.target.value)}
            service={field.service}
            displayField={field.displayField}
            valueField={field.valueField}
            required={field.required}
            fullWidth
            placeholder={field.placeholder || `Select ${field.label}`}
          />
        );
      default:
        return (
          <TextField
            type="text"
            value={value}
            onChange={(e) => updateField(field.key, e.target.value)}
            placeholder={field.placeholder || field.label}
            size="small"
            fullWidth
            required={field.required}
          />
        );
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={activeTheme}>
        <Box sx={{ width: "100%", backgroundColor: "#fafafa", p: 3 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress />
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  if (error || !item) {
    return (
      <ThemeProvider theme={activeTheme}>
        <Box sx={{ width: "100%", backgroundColor: "#fafafa", p: 3 }}>
          <Alert severity={error ? "error" : "warning"} sx={{ mb: 2 }}>
            {error || `${entityType} not found`}
          </Alert>
          {onBack && (
            <Button variant="outlined" onClick={onBack} startIcon={<ArrowBack />}>
              Back
            </Button>
          )}
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={activeTheme}>
      <Box sx={{ width: "100%", backgroundColor: "#fafafa", p: 3 }}>
        {/* Status Message */}
        {statusMessage && (
          <Alert severity={statusSeverity} sx={{ mb: 2 }} onClose={() => setStatusMessage("")}>
            {statusMessage}
          </Alert>
        )}

        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ color: "#050505", fontWeight: 600, mb: 0.5 }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" sx={{ color: "#666666", mb: 1 }}>
                  {subtitle}
                </Typography>
              )}
              {headerChips.length > 0 && (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {headerChips.map((chip, index) => (
                    <Chip
                      key={index}
                      label={chip.label}
                      size="small"
                      sx={{ backgroundColor: chip.color || "#000000", color: chip.textColor || "#ffffff" }}
                    />
                  ))}
                </Box>
              )}
            </Box>

            <DetailsActions
              isEditing={isEditing}
              readOnly={readOnly}
              entityType={entityType}
              currentRow={formData}
              onBack={onBack}
              onEdit={() => setIsEditing(true)}
              onSave={handleSave}
              onCancel={handleCancel}
              onDelete={handleDelete}
              onAddNote={handleAddNote}
              onAddAttachment={handleAddAttachment}
              onAssignUser={() => setAssignDialogOpen(true)}
              onClaimAccount={handleClaimAccount}
            />
          </Box>
        </Box>

        {/* Main Fields */}
        {visibleFields.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="h6" sx={{ color: "#050505", fontWeight: 600 }}>
                Details
              </Typography>
              {visibleFields.map((field) => (
                <Box key={field.key} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: "#050505" }}>
                    {field.label}
                    {field.required && isEditing && <span style={{ color: "#d32f2f", marginLeft: 4 }}>*</span>}
                  </Typography>
                  {renderField(field)}
                </Box>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Related Tabs */}
        {relatedTabs.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ color: "#050505", fontWeight: 600, mb: 2 }}>
              Related Information
            </Typography>
            <Paper elevation={0} sx={{ border: "1px solid #e5e5e5", borderRadius: 2, overflow: "hidden" }}>
              <Tabs
                value={tab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e5e5e5" }}
              >
                {relatedTabs.map((t, i) => (
                  <Tab key={i} label={t.label} />
                ))}
              </Tabs>
              <Box sx={{ p: 3 }}>
                {relatedTabs.map((t, i) => (
                  <Box key={i} sx={{ display: tab === i ? "block" : "none" }}>
                    {/* Check if it's a table configuration or regular content */}
                    {t.columns && t.dataService ? (
                      renderTableTab(t, i)
                    ) : (
                      t.content
                    )}
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        )}

        {/* Assign User Dialog */}
        <AssignUserDialog
          open={assignDialogOpen}
          onClose={() => setAssignDialogOpen(false)}
          menuRow={formData}
          onAssign={handleAssignUser}
        />
      </Box>
    </ThemeProvider>
  );
}