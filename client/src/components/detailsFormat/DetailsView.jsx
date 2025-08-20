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
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Checkbox,
  Paper,
  Chip,
  Button,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../Theme";
import DetailsActions from "./DetailsActions";
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

  useEffect(() => {
    if (item) setFormData(item);
  }, [item]);

  const activeTheme = customTheme || theme;

  const handleTabChange = (_, newValue) => setTab(newValue);

  const updateField = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (onSave) await onSave(formData);
    setIsEditing(false);
  };

  const handleCancel = () => setFormData(item);

  const handleDelete = async () => {
    if (onDelete) await onDelete(formData);
  };

  const handleAddNote = () => {
    if (onAddNote) onAddNote(formData);
  };

  const handleAddAttachment = () => {
    if (onAddAttachment) onAddAttachment(formData);
  };

  const handleClaimAccount = async () => {
    try {
      const result = await claimAccount(formData.AccountID);
      alert(result.message || "Account claimed!");
      setFormData(prev => ({ ...prev, ownerStatus: "owned" }));
    } catch (err) {
      console.error("Failed to claim account:", err);
      alert(err.response?.data?.message || err.message || "Failed to claim account");
    }
  };

  const handleAssignUser = async () => {
    try {
      const userId = prompt("Enter user ID to assign:");
      if (!userId) return;
      const result = await assignUser(formData.AccountID, userId);
      alert(result.message || "User assigned successfully");
    } catch (err) {
      console.error("Failed to assign user:", err);
      alert(err.response?.data?.message || err.message || "Failed to assign user");
    }
  };


  const visibleFields = mainFields.filter(
    (field) =>
      isEditing ||
      (formData[field.key] !== undefined &&
        formData[field.key] !== null &&
        formData[field.key] !== "")
  );

  const renderField = (field) => {
    const value = formData[field.key] || "";

    if (!isEditing) {
      switch (field.type) {
        case "boolean":
          return <Checkbox checked={Boolean(value)} disabled size="small" />;
        case "link":
          return value ? (
            <a href={value.startsWith("http") ? value : `https://${value}`} target="_blank" rel="noopener noreferrer">
              {value}
            </a>
          ) : "—";
        case "currency":
          return value ? `$${parseFloat(value).toLocaleString()}` : "—";
        case "date":
          return value ? new Date(value).toLocaleDateString() : "—";
        case "datetime":
          return value ? new Date(value).toLocaleString() : "—";
        default:
          return value || "—";
      }
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
      case "select":
        return (
          <FormControl size="small" fullWidth required={field.required}>
            <Select
              value={value}
              onChange={(e) => updateField(field.key, e.target.value)}
              displayEmpty
            >
              <MenuItem value="">
                <em>Select {field.label}</em>
              </MenuItem>
              {field.options?.map((option) => (
                <MenuItem key={option.value || option} value={option.value || option}>
                  {option.label || option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
            InputProps={field.type === "currency" ? { startAdornment: <span style={{ marginRight: 4 }}>$</span> } : undefined}
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
              onAssignUser={handleAssignUser}
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
                    {t.content}
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}
