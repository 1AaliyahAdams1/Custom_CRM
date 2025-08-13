// ContactsPage.jsx (presentational only, no internal search/filter UI)

// IMPORTS
import React from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Toolbar,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import UniversalTable from '../components/TableView';

// Monochrome theme for MUI components
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
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f0f0f0',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
          '&.Mui-selected': {
            backgroundColor: '#e0e0e0',
            '&:hover': {
              backgroundColor: '#d5d5d5',
            },
          },
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

const ContactsPage = ({
  contacts,
  loading,
  error,
  successMessage,
  selected,
  handleSelectClick,
  handleSelectAllClick,
  handleEdit,
  handleOpenCreate,
  handleView,
  handleDeactivate,
  onAddNote,
  onAddAttachment,
}) => {

  const columns = [
    {
      field: 'AccountName',
      headerName: 'Account Name',
      width: 120
    },
    {
      field: 'PersonFullName',
      headerName: 'Person',
      width: 300,
      type: 'string'
    },
    {
      field: 'WorkEmail',
      headerName: 'Email',
      width: 200,
      type: 'string'
    },
    {
      field: 'WorkPhone',
      headerName: 'Phone',
      width: 150,
      type: 'string'
    },
    {
      field: 'Still_employed',
      headerName: 'Still Employed',
      width: 140,
      type: 'boolean',
      valueGetter: (params) =>
        params.row?.Still_employed === true ? "Yes" :
          params.row?.Still_employed === false ? "No" : "N/A"
    },
    {
      field: 'JobTitleName',
      headerName: 'Job Title',
      width: 130
    },
    {
      field: 'CreatedAt',
      headerName: 'Created At',
      width: 180,
      type: 'dateTime'
    },
    {
      field: 'UpdatedAt',
      headerName: 'Updated At',
      width: 180,
      type: 'dateTime'
    }
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <Paper
          elevation={0}
          sx={{
            width: '100%',
            mb: 2,
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        >
          <Toolbar
            sx={{
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #e5e5e5',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
              py: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <Typography variant="h6" component="div" sx={{ color: '#050505', fontWeight: 600 }}>
                Contacts
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
                onClick={handleOpenCreate}
                disabled={loading}
                sx={{
                  backgroundColor: '#050505',
                  color: '#ffffff',
                  '&:hover': { backgroundColor: '#333333' },
                  '&:disabled': {
                    backgroundColor: '#cccccc',
                    color: '#666666',
                  },
                }}
              >
                Add Contact
              </Button>
            </Box>
          </Toolbar>

          {loading ? (
            <Box display="flex" justifyContent="center" p={8}>
              <CircularProgress />
            </Box>
          ) : (
            <UniversalTable
              data={contacts}
              columns={columns}
              idField="ContactID"
              selected={selected}
              onSelectClick={handleSelectClick}
              onSelectAllClick={handleSelectAllClick}
              showSelection={true}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeactivate}
              onAddNote={onAddNote}
              onAddAttachment={onAddAttachment}
              formatters={formatters}
            />
          )}

          <Box sx={{
            p: 2,
            borderTop: '1px solid #e5e5e5',
            backgroundColor: '#fafafa',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="body2" sx={{ color: '#666666' }}>
              Showing {contacts.length} contacts
            </Typography>
            {selected.length > 0 && (
              <Typography variant="body2" sx={{ color: '#050505', fontWeight: 500 }}>
                {selected.length} selected
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

const formatters = {
  CreatedAt: (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date)) return "-";
    return date.toLocaleDateString();
  },
};

export default ContactsPage;

