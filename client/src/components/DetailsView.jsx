import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Link as MuiLink,
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
} from "@mui/material";
import { Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../components/Theme";
import DetailsActions from "./DetailsActions";

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

  const handleTabChange = (event, newValue) => setTab(newValue);

  const handleSave = () => {
    if (onSave) onSave(formData);
    setIsEditing(false);
    console.log(`Saving ${entityType}:`, formData);
  };

  const handleCancel = () => {
    setFormData(item);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (onDelete) onDelete();
    console.log(`Deleting ${entityType}:`, item);
  };

  const handleAddNote = () => {
    if (onAddNote) onAddNote(item);
    console.log(`Adding note to ${entityType}:`, item);
  };

  const handleAddAttachment = () => {
    if (onAddAttachment) onAddAttachment(item);
    console.log(`Adding attachment to ${entityType}:`, item);
  };


  const handleAssignUser = () => {
    console.log(`Assigning user to ${entityType}:`, item);
  };

  const handleClaimAccount = () => {
    console.log(`Claiming account:`, item);
  };

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const renderField = (field) => {
    const value = formData[field.key] || "";

    if (!isEditing) {
      return (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            backgroundColor: "#f5f5f5",
            borderRadius: 1,
            minHeight: "40px",
            display: "flex",
            alignItems: "center",
            wordBreak: "break-word",
          }}
        >
          {field.type === "boolean" ? (
            <Checkbox checked={Boolean(value)} disabled size="small" />
          ) : field.type === "link" && value ? (
            <MuiLink href={value} target="_blank" rel="noopener noreferrer">
              {value}
            </MuiLink>
          ) : field.type === "currency" && value ? (
            `$${parseFloat(value).toLocaleString()}`
          ) : field.type === "date" && value ? (
            new Date(value).toLocaleDateString()
          ) : field.type === "datetime" && value ? (
            new Date(value).toLocaleString()
          ) : (
            value || "—"
          )}
        </Box>
      );
    }

    // Editing mode
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
            InputProps={
              field.type === "currency"
                ? { startAdornment: <span style={{ marginRight: "4px" }}>$</span> }
                : undefined
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
        <Box sx={{ width: "100%", backgroundColor: "#fafafa", minHeight: "100vh", p: 3 }}>
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
        <Box sx={{ width: "100%", backgroundColor: "#fafafa", minHeight: "100vh", p: 3 }}>
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
      <Box sx={{ width: "100%", backgroundColor: "#fafafa", minHeight: "100vh", p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                        sx={{
                          backgroundColor: chip.color || "#000000",
                          color: chip.textColor || "#ffffff",
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </Box>

            {/* Action Buttons */}
            <DetailsActions
              isEditing={isEditing}
              readOnly={readOnly}
              entityType={entityType}
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

        {/* Main Details Section */}
        {mainFields.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: "#050505", fontWeight: 600 }}>
                Details
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
                  gap: 3,
                }}
              >
                {mainFields.map((field) => (
                  <Box
                    key={field.key}
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500, color: "#050505" }}>
                      {field.label}
                      {field.required && isEditing && (
                        <span style={{ color: "#d32f2f", marginLeft: "4px" }}>*</span>
                      )}
                    </Typography>
                    {renderField(field)}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Related Information Tabs */}
        {relatedTabs.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ color: "#050505", fontWeight: 600, mb: 2 }}>
              Related Information
            </Typography>
            <Paper elevation={0} sx={{ border: "1px solid #e5e5e5", borderRadius: "8px", overflow: "hidden" }}>
              <Tabs
                value={tab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  backgroundColor: "#ffffff",
                  borderBottom: "1px solid #e5e5e5",
                  "& .MuiTab-root": { color: "#666666", fontWeight: 500, "&.Mui-selected": { color: "#050505" } },
                  "& .MuiTabs-indicator": { backgroundColor: "#050505" },
                }}
              >
                {relatedTabs.map((relatedTab) => (
                  <Tab key={relatedTab.id} label={relatedTab.label} />
                ))}
              </Tabs>

              <Box sx={{ p: 3 }}>
                {relatedTabs.map((relatedTab, index) => (
                  <Box key={relatedTab.id} sx={{ display: tab === index ? "block" : "none" }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: "#050505", fontWeight: 600 }}>
                          {relatedTab.label}
                        </Typography>
                        {relatedTab.content}
                      </CardContent>
                    </Card>
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
