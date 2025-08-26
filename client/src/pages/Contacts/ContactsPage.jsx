<<<<<<< HEAD
// ContactsPage.jsx 
=======
// ContactsPage.jsx
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
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
import { ThemeProvider } from "@mui/material/styles";
<<<<<<< HEAD
import { formatters } from '../../utils/formatters';
import TableView from '../../components/TableView'; 
import theme from "../../components/Theme";

const ContactsPage = ({
  contacts = [], 
  loading = false,
  error,
  successMessage,
  setSuccessMessage, 
  selected = [], 
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
=======
import TableView from '../../components/tableFormat/TableView';
import theme from "../../components/Theme";
import { formatters } from '../../utils/formatters';

const ContactsPage = ({
  contacts = [],
  loading = false,
  error,
  successMessage,
  setSuccessMessage,
  selected = [],
  onSelectClick,
  onSelectAllClick,
  onDeactivate,
  onEdit,
  onView,
  onCreate,
  onAddNote,
  onAddAttachment,
  notesPopupOpen,
  setNotesPopupOpen,
  attachmentsPopupOpen,
  setAttachmentsPopupOpen,
  selectedContact,
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
    { field: 'AccountName', headerName: 'Account', type: 'tooltip' },
    { field: 'PersonFullName', headerName: 'Person', type: 'tooltip' },
    { field: 'WorkEmail', headerName: 'Email' },
    { field: 'WorkPhone', headerName: 'Phone' },
    { field: 'JobTitleName', headerName: 'Job Title' },
    { field: 'Still_employed', headerName: 'Still Employed', type: 'boolean' },
    { field: 'CreatedAt', headerName: 'Created', type: 'dateTime' },
    { field: 'UpdatedAt', headerName: 'Updated', type: 'dateTime' },
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
<<<<<<< HEAD
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert 
            severity="success" 
            sx={{ mb: 2 }} 
=======
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {successMessage && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
            onClose={() => setSuccessMessage && setSuccessMessage("")}
          >
            {successMessage}
          </Alert>
        )}

<<<<<<< HEAD
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            mb: 2,
            border: '0px solid #e5e5e5', 
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
=======
        <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
          <Toolbar sx={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e5e5', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, py: 2 }}>
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <Typography variant="h6" component="div" sx={{ color: '#050505', fontWeight: 600 }}>
                Contacts
              </Typography>
              {selected.length > 0 && (
<<<<<<< HEAD
                <Chip
                  label={`${selected.length} selected`}
                  size="small"
                  sx={{ backgroundColor: '#e0e0e0', color: '#050505' }}
                />
              )}
            </Box>

=======
                <Chip label={`${selected.length} selected`} size="small" sx={{ backgroundColor: '#e0e0e0', color: '#050505' }} />
              )}
            </Box>
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Add />}
<<<<<<< HEAD
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
=======
                onClick={onCreate}
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
              >
                Add Contact
              </Button>
            </Box>
          </Toolbar>

          {loading ? (
<<<<<<< HEAD
            <Box display="flex" justifyContent="center" p={8}>
              <CircularProgress />
            </Box>
=======
            <Box display="flex" justifyContent="center" p={8}><CircularProgress /></Box>
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
          ) : (
            <TableView
              data={contacts}
              columns={columns}
              idField="ContactID"
              selected={selected}
<<<<<<< HEAD
              onSelectClick={handleSelectClick}
              onSelectAllClick={handleSelectAllClick}
              showSelection={true}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeactivate}
=======
              onSelectClick={onSelectClick}
              onSelectAllClick={onSelectAllClick}
              showSelection={true}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDeactivate}
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
              onAddNote={onAddNote}
              onAddAttachment={onAddAttachment}
              formatters={formatters}
              entityType="contact"
            />
          )}

<<<<<<< HEAD
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
=======
          <Box sx={{ p: 2, borderTop: '1px solid #e5e5e5', backgroundColor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#666666' }}>Showing {contacts.length} contacts</Typography>
            {selected.length > 0 && (
              <Typography variant="body2" sx={{ color: '#050505', fontWeight: 500 }}>{selected.length} selected</Typography>
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
            )}
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

<<<<<<< HEAD
export default ContactsPage;
=======
export default ContactsPage;
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
