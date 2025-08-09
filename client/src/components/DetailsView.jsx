import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Link as MuiLink,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Chip,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Save,
  Close,
  Delete,
  Business,
  Phone,
  Language,
  LocationOn,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#050505',
      contrastText: '#fafafa',
    },
    secondary: {
      main: '#666666',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#050505',
      secondary: '#666666',
    },
    divider: '#e5e5e5',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #e5e5e5',
          boxShadow: 'none',
          borderRadius: '8px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          fontWeight: 500,
        },
      },
    },
  },
});

/**
 * Universal DetailView Component
 * 
 * @param {Object} props
 * @param {string} props.title - The title to display (e.g., account name, deal name)
 * @param {Object} props.item - The main data object
 * @param {Array} props.mainFields - Array of field configurations for the main details
 * @param {Array} props.relatedTabs - Array of tab configurations for related data
 * @param {Function} props.onBack - Callback for back button
 * @param {Function} props.onSave - Callback for save action (optional)
 * @param {Function} props.onDelete - Callback for delete action (optional)
 * @param {boolean} props.loading - Loading state
 * @param {string} props.error - Error message
 * @param {string} props.subtitle - Optional subtitle (e.g., "ID: 12345")
 * @param {Array} props.headerChips - Optional chips to display in header
 * @param {Object} props.customTheme - Optional custom theme override
 * @param {boolean} props.readOnly - If true, hides edit/delete buttons
 * @param {string} props.entityType - Type of entity for logging/analytics
 */
export function UniversalDetailView({
  title,
  item,
  mainFields = [],
  relatedTabs = [],
  onBack,
  onSave,
  onDelete,
  loading = false,
  error = null,
  subtitle,
  headerChips = [],
  customTheme,
  readOnly = false,
  entityType = "entity"
}) {
  const [tab, setTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(item || {});

  // Update formData when item changes
  useEffect(() => {
    if (item) {
      setFormData(item);
    }
  }, [item]);

  const activeTheme = customTheme || theme;

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    setIsEditing(false);
    console.log(`Saving ${entityType}:`, formData);
  };

  const handleCancel = () => {
    setFormData(item);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    console.log(`Deleting ${entityType}:`, item);
  };

  const updateField = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const renderField = (field) => {
    const value = formData[field.key] || "";

    if (!isEditing) {
      // Read-only display
      return (
        <Box sx={{ 
          px: 2, 
          py: 1.5, 
          backgroundColor: '#f5f5f5', 
          borderRadius: 1, 
          minHeight: '40px', 
          display: 'flex', 
          alignItems: 'center',
          wordBreak: 'break-word'
        }}>
          {field.type === "boolean" ? (
            <Checkbox checked={Boolean(value)} disabled size="small" />
          ) : field.type === "link" && value ? (
            <MuiLink href={value} target="_blank" rel="noopener noreferrer">
              {value}
            </MuiLink>
          ) : field.type === "currency" && value ? (
            `${parseFloat(value).toLocaleString()}`
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

    // Editing mode - render appropriate input
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
            InputProps={field.type === "currency" ? {
              startAdornment: <span style={{ marginRight: '4px' }}>$</span>
            } : undefined}
          />
        );

      case "date":
        return (
          <TextField
            type="date"
            value={value ? new Date(value).toISOString().split('T')[0] : ""}
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

      case "email":
        return (
          <TextField
            type="email"
            value={value}
            onChange={(e) => updateField(field.key, e.target.value)}
            placeholder={field.placeholder || field.label}
            size="small"
            fullWidth
            required={field.required}
          />
        );

      case "tel":
        return (
          <TextField
            type="tel"
            value={value}
            onChange={(e) => updateField(field.key, e.target.value)}
            placeholder={field.placeholder || field.label}
            size="small"
            fullWidth
            required={field.required}
          />
        );

      case "url":
      case "link":
        return (
          <TextField
            type="url"
            value={value}
            onChange={(e) => updateField(field.key, e.target.value)}
            placeholder={field.placeholder || field.label}
            size="small"
            fullWidth
            required={field.required}
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
        <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress />
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={activeTheme}>
        <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="outlined" onClick={onBack} startIcon={<ArrowBack />}>
            Back
          </Button>
        </Box>
      </ThemeProvider>
    );
  }

  if (!item) {
    return (
      <ThemeProvider theme={activeTheme}>
        <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            {entityType} not found
          </Alert>
          <Button variant="outlined" onClick={onBack} startIcon={<ArrowBack />}>
            Back
          </Button>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={activeTheme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
             
              <Box>
                <Typography variant="h4" sx={{ color: '#050505', fontWeight: 600, mb: 0.5 }}>
                  {title}
                </Typography>
                {subtitle && (
                  <Typography variant="body2" sx={{ color: '#666666', mb: 1 }}>
                    {subtitle}
                  </Typography>
                )}
                {headerChips.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {headerChips.map((chip, index) => (
                      <Chip
                        key={index}
                        label={chip.label}
                        size="small"
                        sx={{
                          backgroundColor: chip.color || '#000000',
                          color: chip.textColor || '#ffffff',
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
               
            </Box>
            
            
            {!readOnly && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isEditing ? (
                  <>
                    <Button
                      variant="outlined"
                      onClick={handleCancel}
                      startIcon={<Close />}
                      sx={{ borderColor: '#e5e5e5', color: '#666666' }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSave}
                      startIcon={<Save />}
                      sx={{ backgroundColor: '#050505', '&:hover': { backgroundColor: '#333333' } }}
                    >
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                  <Button
                variant="outlined"
                onClick={onBack}
                startIcon={<ArrowBack />}
                sx={{
                  borderColor: '#e5e5e5',
                  color: '#666666',
                  '&:hover': {
                    borderColor: '#cccccc',
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                Back
              </Button>
                    {onSave && (
                      <Button
                        variant="contained"
                        onClick={() => setIsEditing(true)}
                        startIcon={<Edit />}
                        sx={{ backgroundColor: '#050505', '&:hover': { backgroundColor: '#333333' } }}
                      >
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="outlined"
                        onClick={handleDelete}
                        startIcon={<Delete />}
                        sx={{ borderColor: '#d32f2f', color: '#d32f2f', '&:hover': { backgroundColor: '#ffebee' } }}
                      >
                        Delete
                      </Button>
                    )}
                  </>
                )}
              </Box>
              
            )}
          </Box>
          
        </Box>
        

        {/* Main Entity Details */}
        {/* {mainFields.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#050505', fontWeight: 600 }}>
                Details
              </Typography>
              <Grid container spacing={3}>
                {mainFields.map((field) => (
                  <Grid 
                    item 
                    xs={12} 
                    md={field.width?.md || 6} 
                    lg={field.width?.lg || 4} 
                    key={field.key}
                    {...(field.width || { xs: 12 })}
                    key={field.key}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#050505' }}>
                        {field.label}
                        {field.required && isEditing && (
                          <span style={{ color: '#d32f2f', marginLeft: '4px' }}>*</span>
                        )}
                      </Typography>
                      {renderField(field)}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )} */}
        {mainFields.length > 0 && (
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom sx={{ color: '#050505', fontWeight: 600 }}>
        Details
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
        {mainFields.map((field) => {
          // Determine grid column span based on field configuration
          const getGridColumn = (field) => {
            // If fullWidth is specified, span all columns
            if (field.fullWidth) {
              return '1 / -1';
            }
            
            // Check legacy width configuration
            if (field.width) {
              // If xs: 12, span full width
              if (field.width.xs === 12 && (!field.width.sm || field.width.sm === 12)) {
                return '1 / -1';
              }
              // If md: 8 or lg: 8, span 2 columns on larger screens  
              if (field.width.md === 8 || field.width.lg === 8) {
                return { xs: '1 / -1', md: '1 / 3' };
              }
              // If md: 6 or lg: 6, span 2 columns on 3-column grid
              if (field.width.md === 6 || field.width.lg === 6) {
                return { xs: '1 / -1', sm: '1 / 3' };
              }
            }
            
            // Default: single column
            return 'auto';
          };

          return (
            <Box 
              key={field.key}
              sx={{ 
                gridColumn: getGridColumn(field),
                display: 'flex', 
                flexDirection: 'column', 
                gap: 1 
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#050505' }}>
                {field.label}
                {field.required && isEditing && (
                  <span style={{ color: '#d32f2f', marginLeft: '4px' }}>*</span>
                )}
              </Typography>
              {renderField(field)}
            </Box>
          );
        })}
      </Box>
    </CardContent>
  </Card>
)}

        {/* Related Information Tabs */}
        {relatedTabs.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ color: '#050505', fontWeight: 600, mb: 2 }}>
              Related Information
            </Typography>
            <Paper
              elevation={0}
              sx={{
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            >
              <Tabs
                value={tab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  backgroundColor: '#ffffff',
                  borderBottom: '1px solid #e5e5e5',
                  '& .MuiTab-root': {
                    color: '#666666',
                    fontWeight: 500,
                    '&.Mui-selected': {
                      color: '#050505',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#050505',
                  },
                }}
              >
                {relatedTabs.map((relatedTab) => (
                  <Tab key={relatedTab.id} label={relatedTab.label} />
                ))}
              </Tabs>

              <Box sx={{ p: 3 }}>
                {relatedTabs.map((relatedTab, index) => (
                  <Box key={relatedTab.id} sx={{ display: tab === index ? 'block' : 'none' }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: '#050505', fontWeight: 600 }}>
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