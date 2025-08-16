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
import { formatters } from '../utils/formatters';
import UniversalTable from '../components/TableView';
import theme from "../components/Theme";


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
  const handleAssignUser = (account) => {
  console.log("Assigning user to account:", account);
  // Add  assign user logic here
  
};

  const columns = [
    {
      field: 'AccountName',
      headerName: 'Account Name',
    },
    {
      field: 'PersonFullName',
      headerName: 'Person',
      type: 'string'
    },
    {
      field: 'WorkEmail',
      headerName: 'Email',
      type: 'string'
    },
    {
      field: 'WorkPhone',
      headerName: 'Phone',
      type: 'string'
    },
    {
      field: 'JobTitleName',
      headerName: 'Job Title',
    },
    {
      field: 'CreatedAt',
      headerName: 'Created At',
      type: 'dateTime',
    },
    {
      field: 'UpdatedAt',
      headerName: 'Updated At',
      type: 'dateTime',
    },
    {
      field: 'Still_employed',
      headerName: 'Still Employed',
      type: 'boolean',
    },
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
              onAssignUser={handleAssignUser}
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


export default ContactsPage;

