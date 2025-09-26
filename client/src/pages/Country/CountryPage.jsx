import React, { useState } from "react";

import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Toolbar,
  Snackbar,
} from "@mui/material";
import {
  Info as InfoIcon,
  Edit as EditIcon,
  Note as NoteIcon,
  AttachFile as AttachFileIcon,
  PowerOff as PowerOffIcon,
  Power as PowerIcon,
  Delete as DeleteIcon,
  Public as PublicIcon,
} from "@mui/icons-material";

import { Add } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import TableView from '../../components/tableFormat/TableView';
import theme from "../../components/Theme";
import { formatters } from '../../utils/formatters';

const CountryPage = ({
  countries = [],
  loading = false,
  error,
  setError,
  successMessage,
  setSuccessMessage,
  statusMessage,
  statusSeverity,
  setStatusMessage,
  selected = [],
  onSelectClick,
  onSelectAllClick,
  onDeactivate,
  onReactivate,
  onDelete,
  onBulkDeactivate,
  onEdit,
  onView,
  onCreate,
  onAddNote,
  onAddAttachment,
  onAssignUser,
  showStatus,
  // Popup props (for future use if needed)
  notesPopupOpen,
  setNotesPopupOpen,
  attachmentsPopupOpen,
  setAttachmentsPopupOpen,
  selectedCountry,
  popupLoading,
  popupError,
  handleSaveNote,
  handleDeleteNote,
  handleEditNote,
  handleUploadAttachment,
  handleDeleteAttachment,
  handleDownloadAttachment,
}) => {
  
  const columns = [
    { 
      field: 'CountryName', 
      headerName: 'Country Name', 
      type: 'tooltip', 
      defaultVisible: true,
      icon: <PublicIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
    },
    { 
      field: 'CountryCode', 
      headerName: 'Country Code', 
      type: 'chip',
      chipLabels: (value) => value,
      chipColors: () => '#000000ff',
      defaultVisible: true 
    },
    { 
      field: 'CurrencyName', 
      headerName: 'Currency', 
      defaultVisible: true 
    },
    { 
      field: 'CurrencyCode', 
      headerName: 'Currency Code', 
      defaultVisible: false 
    },
    // { 
    //   field: 'Region', 
    //   headerName: 'Region', 
    //   defaultVisible: true 
    // },
    // { 
    //   field: 'ClientCount', 
    //   headerName: 'Active Clients', 
    //   type: 'number',
    //   defaultVisible: true 
    // },
    // { 
    //   field: 'TotalRevenue', 
    //   headerName: 'Total Revenue', 
    //   type: 'currency', 
    //   defaultVisible: true 
    // },
    { 
      field: 'CreatedAt', 
      headerName: 'Added', 
      type: 'dateTime', 
      defaultVisible: false 
    },
    { 
      field: 'UpdatedAt', 
      headerName: 'Last Updated', 
      type: 'dateTime', 
      defaultVisible: false 
    },
    {
      field: 'Active',
      headerName: 'Status',
      type: 'chip',
      chipLabels: { 
        true: 'Active ', 
        false: 'Inactive' 
      },
      chipColors: { 
        true: '#079141ff', 
        false: '#999999' 
      },
      defaultVisible: true,
    },
  ];

  // Enhanced menu items for countries
  const getMenuItems = (country) => {
    const baseItems = [
      {
        label: 'View Details',
        icon: <InfoIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onView && onView(country),
        show: !!onView,
      },
      {
        label: 'Edit',
        icon: <EditIcon sx={{ mr: 1, color: '#000' }} />,
        onClick: () => onEdit && onEdit(country),
        show: !!onEdit,
      },
    //   { not sure if we'll need this adding it just incase
    //     label: 'Add Notes',
    //     icon: <NoteIcon sx={{ mr: 1, color: '#000' }} />,
    //     onClick: () => onAddNote && onAddNote(country),
    //     show: !!onAddNote,
    //   },
    //   {
    //     label: 'Add Attachments',
    //     icon: <AttachFileIcon sx={{ mr: 1, color: '#000' }} />,
    //     onClick: () => onAddAttachment && onAddAttachment(country),
    //     show: !!onAddAttachment,
    //   },
    ];

    // Add reactivate/deactivate based on current business status
    if (country.Active) {
      baseItems.push({
        label: 'Mark as Inactive',
        icon: <PowerOffIcon sx={{ mr: 1, color: '#8c8c8bff' }} />,
        onClick: () => onDeactivate && onDeactivate(country.CountryID),
        show: !!onDeactivate,
        tooltip: 'Mark this country as having no active clients'
      });
    } else {
      baseItems.push({
        label: 'Mark as Active ',
        icon: <PowerIcon sx={{ mr: 1, color: '#4caf50' }} />,
        onClick: () => onReactivate && onReactivate(country.CountryID),
        show: !!onReactivate,
        tooltip: 'Mark this country as having active clients'
      });
    }

    // Add delete option (only for countries with no clients)
    baseItems.push({
      label: 'Delete',
      icon: <DeleteIcon sx={{ mr: 1, color: '#f44336' }} />,
      onClick: () => onDelete && onDelete(country.CountryID),
      show: !!onDelete,
      disabled: (country) => (country.ClientCount && country.ClientCount > 0),
      tooltip: country.ClientCount > 0 
        ? 'Cannot delete country with active clients' 
        : 'Permanently delete this country'
    });

    return baseItems;
  };

  // Custom formatters for country-specific fields
  const countryFormatters = {
    ...formatters,
    CountryCode: (value) => {
      if (!value) return 'N/A';
      return (
        <Chip
          label={value}
          size="small"
          sx={{
            backgroundColor: '#000000ff',
            color: '#fff',
            fontWeight: 500,
            fontFamily: 'monospace',
          }}
        />
      );
    },
    TotalRevenue: (value) => {
      if (!value || value === 0) return 'No Revenue';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    },
    ClientCount: (value, row) => {
      if (!value || value === 0) {
        return (
          <Chip
            label="No Clients"
            size="small"
            sx={{
              backgroundColor: '#f5f5f5',
              color: '#666',
              fontWeight: 500,
            }}
          />
        );
      }
      return (
        <Chip
          label={`${value} Client${value !== 1 ? 's' : ''}`}
          size="small"
          sx={{
            backgroundColor: value > 5 ? '#4caf50' : value > 1 ? '#ff9800' : '#2196f3',
            color: '#fff',
            fontWeight: 500,
          }}
        />
      );
    },
    Active: (value, row) => {
      // Determine status based on client count and active flag
      const hasClients = row.ClientCount && row.ClientCount > 0;
      const isActive = value && hasClients;
      
      let label, color, tooltip;
      
      if (isActive) {
        label = 'Active Countries';
        color = '#000000ff';
        tooltip = `Active business with ${row.ClientCount} client${row.ClientCount !== 1 ? 's' : ''}`;
      } else if (hasClients && !value) {
        label = 'Clients Paused';
        color = '#000000ff';
        tooltip = `Business paused but has ${row.ClientCount} client${row.ClientCount !== 1 ? 's' : ''}`;
      } else if (value && !hasClients) {
        label = 'Potential Clients';
        color = '#000000ff';
        tooltip = 'Country is set up but has no active clients';
      } else {
        label = 'No Clients';
        color = '#999999';
        tooltip = 'No active business or clients in this country';
      }

      return (
        <Chip
          label={label}
          size="small"
          title={tooltip}
          sx={{
            backgroundColor: color,
            color: '#fff',
            fontWeight: 500,
            cursor: 'help'
          }}
        />
      );
    }
  };

  // Calculate summary statistics
  const activeCountries = countries.filter(c => c.Active && c.ClientCount > 0).length;
  const readyCountries = countries.filter(c => c.Active && (!c.ClientCount || c.ClientCount === 0)).length;
  const inactiveCountries = countries.filter(c => !c.Active).length;
  const totalClients = countries.reduce((sum, c) => sum + (c.ClientCount || 0), 0);
  const totalRevenue = countries.reduce((sum, c) => sum + (c.TotalRevenue || 0), 0);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            onClose={() => setError && setError('')}
          >
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert 
            severity="success" 
            sx={{ mb: 2 }}
            onClose={() => setSuccessMessage && setSuccessMessage('')}
          >
            {successMessage}
          </Alert>
        )}

        {/* Summary Cards */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Paper sx={{ p: 2, minWidth: 200, flex: 1 }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
              {activeCountries}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Countries
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, minWidth: 200, flex: 1 }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
              {readyCountries}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Potential Clients
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, minWidth: 200, flex: 1 }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
              {totalClients}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Clients
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, minWidth: 200, flex: 1 }}>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(totalRevenue)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Revenue
            </Typography>
          </Paper>
        </Box>

        <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
          <Toolbar sx={{ 
            backgroundColor: '#fff', 
            borderBottom: '1px solid #e5e5e5', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: 2, 
            py: 2 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              
              <Typography variant="h6" component="div" sx={{ color: '#050505', fontWeight: 600 }}>
                Countries
              </Typography>
              {selected.length > 0 && (
                <Chip 
                  label={`${selected.length} selected`} 
                  size="small" 
                  sx={{ backgroundColor: '#e0e0e0', color: '#050505' }} 
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onCreate}
              >
                Add Country
              </Button>
              {selected.length > 0 && (
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={onBulkDeactivate}
                >
                  Mark Selected as No Business
                </Button>
              )}
            </Box>
          </Toolbar>

          {loading ? (
            <Box display="flex" justifyContent="center" p={8}>
              <CircularProgress />
            </Box>
          ) : (
            <TableView
              data={countries}
              columns={columns}
              idField="CountryID"
              selected={selected}
              onSelectClick={onSelectClick}
              onSelectAllClick={onSelectAllClick}
              showSelection={true}
              onView={onView}
              onCreate={onCreate}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddNote={onAddNote}
              onAddAttachment={onAddAttachment}
              onAssignUser={onAssignUser}
              formatters={countryFormatters}
              entityType="country"
              getMenuItems={getMenuItems}
            />
          )}

          <Box sx={{ 
            p: 2, 
            borderTop: '1px solid #e5e5e5', 
            backgroundColor: '#fafafa', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ color: '#666666' }}>
                Showing {countries.length} countries
              </Typography>
              <Typography variant="body2" sx={{ color: '#666666' }}>
                • {activeCountries} with active business
              </Typography>
              <Typography variant="body2" sx={{ color: '#666666' }}>
                • {readyCountries} ready for business
              </Typography>
              <Typography variant="body2" sx={{ color: '#666666' }}>
                • {inactiveCountries} inactive
              </Typography>
            </Box>
            {selected.length > 0 && (
              <Typography variant="body2" sx={{ color: '#050505', fontWeight: 500 }}>
                {selected.length} selected
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Status Snackbar */}
        <Snackbar
          open={!!statusMessage}
          autoHideDuration={4000}
          onClose={() => setStatusMessage && setStatusMessage('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setStatusMessage && setStatusMessage('')} 
            severity={statusSeverity} 
            sx={{ width: '100%' }}
          >
            {statusMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default CountryPage;