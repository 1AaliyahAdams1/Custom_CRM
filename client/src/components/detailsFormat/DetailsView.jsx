import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
import { useTheme } from "@mui/material/styles";
import DetailsActions from "./DetailsActions";
import SmartDropdown from "../../components/SmartDropdown";
import AssignUserDialog from "../dialogs/AssignUserDialog";
import TableView from "../../components/tableFormat/TableView";
import { formatters } from "../../utils/formatters";
import { claimAccount, assignUser } from "../../services/assignService";

export const UniversalDetailView = React.memo(function UniversalDetailView({
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
  onRefreshRelatedData,
  relatedDataActions = {},
}) {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(item || {});
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusSeverity, setStatusSeverity] = useState("success");
  
  const [tabData, setTabData] = useState({});
  const [tabLoading, setTabLoading] = useState({});
  const [tabSelected, setTabSelected] = useState({});
  const [tabErrors, setTabErrors] = useState({});
  const [displayNames, setDisplayNames] = useState({});

  const relatedTabsRef = useRef(relatedTabs);
  const itemRef = useRef(item);
  const formDataRef = useRef(formData);
  const tabSelectedRef = useRef(tabSelected);

  useEffect(() => {
    relatedTabsRef.current = relatedTabs;
    itemRef.current = item;
    formDataRef.current = formData;
    tabSelectedRef.current = tabSelected;
  }, [relatedTabs, item, formData, tabSelected]);

  useEffect(() => {
  const fetchDisplayNames = async () => {
    if (!item || isEditing) return;
    
    const dropdownFields = mainFields.filter(field => field.type === 'dropdown');
    const names = {};
    
    for (const field of dropdownFields) {
      const value = item[field.key];
      
      // Skip if no value or if display field already exists in item
      if (!value || item[field.displayField]) {
        if (item[field.displayField]) {
          names[field.key] = item[field.displayField];
        }
        continue;
      }
      
      // Fetch the display name using the service
      if (field.service) {
        try {
          const response = await field.service(value);
          const data = response?.data || response;
          names[field.key] = data?.[field.displayField] || value;
        } catch (err) {
          console.error(`Failed to fetch ${field.label}:`, err);
          names[field.key] = value; // Fallback to showing the ID
        }
      }
    }
    
    setDisplayNames(names);
  };
  
  fetchDisplayNames();
}, [item, mainFields, isEditing]);


  useEffect(() => {
    if (item) setFormData(item);
  }, [item]);

  const handleTabChange = useCallback((_, newValue) => {
    setTab(newValue);
  }, []);

  const updateField = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    if (onSave) await onSave(formDataRef.current);
    setIsEditing(false);
  }, [onSave]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleDelete = useCallback(async () => {
    if (onDelete) await onDelete(formDataRef.current);
  }, [onDelete]);

  const handleAddNote = useCallback(() => {
    if (onAddNote) onAddNote(formDataRef.current);
  }, [onAddNote]);

  const handleAddAttachment = useCallback(() => {
    if (onAddAttachment) onAddAttachment(formDataRef.current);
  }, [onAddAttachment]);

  const handleClaimAccount = useCallback(async () => {
    try {
      await claimAccount(formDataRef.current.AccountID);
      setStatusMessage(`Account claimed: ${formDataRef.current.AccountName}`);
      setStatusSeverity("success");
      setFormData((prev) => ({ ...prev, ownerStatus: "owned" }));
    } catch (err) {
      setStatusMessage(err.message || "Failed to claim account");
      setStatusSeverity("error");
    }
  }, []);

  const handleAssignUser = useCallback(async (employeeId) => {
    try {
      await assignUser(formDataRef.current.AccountID, employeeId);
      setStatusMessage(`User assigned to ${formDataRef.current.AccountName}`);
      setStatusSeverity("success");
    } catch (err) {
      console.error(err);
      setStatusMessage(err.message || "Failed to assign user");
      setStatusSeverity("error");
      throw err;
    }
  }, []);

  const loadTabData = useCallback(async (tabIndex) => {
    const tabConfig = relatedTabsRef.current[tabIndex];
    if (!tabConfig?.dataService) return;

    const tabKey = tabConfig.key || tabIndex;
    
    setTabLoading(prev => ({ ...prev, [tabKey]: true }));
    setTabErrors(prev => ({ ...prev, [tabKey]: null }));
    
    try {
      let data;
      if (typeof tabConfig.dataService === 'function') {
        data = await tabConfig.dataService(formDataRef.current);
      } else {
        data = await tabConfig.dataService.fetchData(formDataRef.current);
      }
      
      let processedData = data?.data || data || [];
      if (tabConfig.processData && typeof tabConfig.processData === 'function') {
        processedData = tabConfig.processData(processedData);
      }
      
      setTabData(prev => ({ ...prev, [tabKey]: processedData }));
      
      if (!tabSelectedRef.current[tabKey]) {
        setTabSelected(prev => ({ ...prev, [tabKey]: [] }));
      }
    } catch (err) {
      console.error(`Failed to load ${tabConfig.label} data:`, err);
      setTabErrors(prev => ({ ...prev, [tabKey]: err.message || `Failed to load ${tabConfig.label}` }));
      setTabData(prev => ({ ...prev, [tabKey]: [] }));
    } finally {
      setTabLoading(prev => ({ ...prev, [tabKey]: false }));
    }
  }, []);

  useEffect(() => {
    const currentTab = relatedTabsRef.current[tab];
    const tabKey = currentTab?.key || tab;
    
    if (currentTab?.dataService && !tabData[tabKey]) {
      loadTabData(tab);
    }
  }, [tab, loadTabData]);

  const refreshTabData = useCallback((tabIndex) => {
    const tabKey = relatedTabsRef.current[tabIndex]?.key || tabIndex;
    setTabData(prev => ({ ...prev, [tabKey]: undefined }));
    loadTabData(tabIndex);
  }, [loadTabData]);

  const handleTabSelectClick = useCallback((tabKey, id) => {
    setTabSelected(prev => ({
      ...prev,
      [tabKey]: prev[tabKey]?.includes(id) 
        ? prev[tabKey].filter(i => i !== id)
        : [...(prev[tabKey] || []), id]
    }));
  }, []);

  const handleTabSelectAllClick = useCallback((tabKey, tableConfig, event) => {
    const currentData = tabData[tabKey] || [];
    
    if (event.target.checked) {
      const allIds = currentData.map(item => item[tableConfig.idField]);
      setTabSelected(prev => ({
        ...prev,
        [tabKey]: allIds
      }));
    } else {
      setTabSelected(prev => ({
        ...prev,
        [tabKey]: []
      }));
    }
  }, [tabData]);

  const createTabActionHandler = useCallback((tabKey, actionType) => {
    return (item) => {
      const tabConfig = relatedTabsRef.current.find(tab => (tab.key || relatedTabsRef.current.indexOf(tab)) === tabKey);
      const actions = relatedDataActions[tabKey] || relatedDataActions[tabConfig?.entityType];
      
      if (actions && actions[actionType]) {
        return actions[actionType](item, formDataRef.current);
      }
      
      switch (actionType) {
        case 'view':
          console.log(`View ${tabKey}:`, item);
          break;
        case 'edit':
          console.log(`Edit ${tabKey}:`, item);
          break;
        case 'delete':
          console.log(`Delete ${tabKey}:`, item);
          if (onRefreshRelatedData) onRefreshRelatedData(tabKey);
          break;
        case 'addNote':
          console.log(`Add note to ${tabKey}:`, item);
          break;
        case 'addAttachment':
          console.log(`Add attachment to ${tabKey}:`, item);
          break;
        default:
          console.log(`Action ${actionType} on ${tabKey}:`, item);
      }
    };
  }, [relatedDataActions, onRefreshRelatedData]);

  const formatCellValue = useCallback((value, column) => {
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
  }, []);

  const renderTabContent = useCallback((tabConfig, tabIndex) => {
    const tabKey = tabConfig.key || tabIndex;
    
    if (tabConfig.tableConfig) {
      const data = tabData[tabKey] || [];
      const isLoading = tabLoading[tabKey];
      const error = tabErrors[tabKey];
      const selected = tabSelected[tabKey] || [];
      const config = tabConfig.tableConfig;

      if (error) {
        return (
          <Box sx={{ p: 2 }}>
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            <Button onClick={() => refreshTabData(tabIndex)} variant="outlined">
              Retry
            </Button>
          </Box>
        );
      }

      if (isLoading) {
        return (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        );
      }

      return (
        <Box sx={{ p: 2 }}>
          <TableView
            data={data}
            columns={config.columns}
            idField={config.idField}
            selected={selected}
            onSelectClick={(id) => handleTabSelectClick(tabKey, id)}
            onSelectAllClick={(event) => handleTabSelectAllClick(tabKey, config, event)}
            showSelection={true}
            onView={createTabActionHandler(tabKey, 'view')}
            onEdit={createTabActionHandler(tabKey, 'edit')}
            onDelete={createTabActionHandler(tabKey, 'delete')}
            onAddNote={createTabActionHandler(tabKey, 'addNote')}
            onAddAttachment={createTabActionHandler(tabKey, 'addAttachment')}
            formatters={formatters}
            entityType={tabConfig.entityType || 'item'}
            tooltips={{
              search: `Search ${tabConfig.label?.toLowerCase()} for this ${entityType}`,
              filter: `Filter ${tabConfig.label?.toLowerCase()} by various criteria`,
              columns: `Customize visible columns for ${tabConfig.label?.toLowerCase()}`,
              actionMenu: {
                view: `View detailed information for this ${tabConfig.entityType || 'item'}`,
                edit: `Edit this ${tabConfig.entityType || 'item'}'s information`,
                delete: `Delete or deactivate this ${tabConfig.entityType || 'item'}`,
                addNote: `Add internal notes or comments`,
                addAttachment: `Attach files or documents`
              }
            }}
          />
          
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.default,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Showing {data.length} {tabConfig.label?.toLowerCase()} for {formData.AccountName || formData.name || title}
            </Typography>
            {selected.length > 0 && (
              <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
                {selected.length} selected
              </Typography>
            )}
          </Box>
        </Box>
      );
    }

    if (tabConfig.columns && tabConfig.dataService) {
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
                          <Tooltip key={actionIdx} title={<span>{action.label}</span>}>
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
    }

    return tabConfig.content;
  }, [tabData, tabLoading, tabErrors, tabSelected, refreshTabData, handleTabSelectClick, handleTabSelectAllClick, createTabActionHandler, formatCellValue, formData, title, entityType, theme]);

  const visibleFields = useMemo(() => {
    return mainFields.filter(
      (field) =>
        isEditing ||
        (formData[field.key] !== undefined &&
          formData[field.key] !== null &&
          formData[field.key] !== "")
    );
  }, [mainFields, isEditing, formData]);

  const renderField = useCallback((field) => {
  const value = formData[field.key] ?? "";

  if (!isEditing) {
    if (field.type === "boolean") return <Checkbox checked={Boolean(value)} disabled size="small" />;
    if (field.type === "link" && value)
      return (
        <a href={value} target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      );
    if (field.type === "currency" && value) return `${parseFloat(value).toLocaleString()}`;
    if (field.type === "date" && value) return new Date(value).toLocaleDateString();
    if (field.type === "datetime" && value) return new Date(value).toLocaleString();
    
    // UPDATED DROPDOWN LOGIC FOR VIEW MODE
    if (field.type === "dropdown") {
      // First check if we have the display name in the item itself
      if (item?.[field.displayField]) {
        return item[field.displayField];
      }
      // Then check our fetched display names
      if (displayNames[field.key]) {
        return displayNames[field.key];
      }
      // If still loading, show a spinner
      if (value && !displayNames[field.key] && displayNames[field.key] !== value) {
        return <CircularProgress size={16} />;
      }
      // Fallback to the value (ID)
      return value || "-";
    }

    return value || "-";
  }

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
          service={field.optionsService || field.service}
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
}, [formData, isEditing, updateField, item, displayNames]);

  if (loading) {
    return (
      <Box sx={{ width: "100%", backgroundColor: theme.palette.background.default, p: 3 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error || !item) {
    return (
      <Box sx={{ width: "100%", backgroundColor: theme.palette.background.default, p: 3 }}>
        <Alert severity={error ? "error" : "warning"} sx={{ mb: 2 }}>
          {error || `${entityType} not found`}
        </Alert>
        {onBack && (
          <Button variant="outlined" onClick={onBack} startIcon={<ArrowBack />}>
            Back
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", backgroundColor: theme.palette.background.default, p: 3 }}>
      {statusMessage && (
        <Alert severity={statusSeverity} sx={{ mb: 2 }} onClose={() => setStatusMessage("")}>
          {statusMessage}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 0.5 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
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

      {visibleFields.length > 0 && (
        <Card sx={{ mb: 3, bgcolor: theme.palette.background.paper }}>
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
              Details
            </Typography>
            {visibleFields.map((field) => (
              <Box key={field.key} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
                  {field.label}
                  {field.required && isEditing && <span style={{ color: "#d32f2f", marginLeft: 4 }}>*</span>}
                </Typography>
                {renderField(field)}
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {relatedTabs.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 2 }}>
            Related Information
          </Typography>
          <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: "hidden" }}>
            <Tabs
              value={tab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                backgroundColor: theme.palette.background.paper, 
                borderBottom: `1px solid ${theme.palette.divider}` 
              }}
            >
              {relatedTabs.map((t, i) => {
                const tabKey = t.key || i;
                const count = tabData[tabKey]?.length || 0;
                const label = count > 0 ? `${t.label} (${count})` : t.label;
                
                return (
                  <Tab 
                    key={i} 
                    label={label}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 500,
                      '&.Mui-selected': {
                        color: theme.palette.text.primary,
                      }
                    }}
                  />
                );
              })}
            </Tabs>
            <Box>
              {relatedTabs.map((t, i) => (
                <Box key={i} sx={{ display: tab === i ? "block" : "none" }}>
                  {renderTabContent(t, i)}
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      )}

      <AssignUserDialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        menuRow={formData}
        onAssign={handleAssignUser}
      />
    </Box>
  );
});