// ContactsPage.jsx
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
    {
      field: 'Active',
      headerName: 'Active',
      type: 'chip',
      chipLabels: { true: 'Active', false: 'Inactive' },
      chipColors: { true: '#079141ff', false: '#999999' },
      defaultVisible: true,
    }
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {successMessage && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSuccessMessage && setSuccessMessage("")}
          >
            {successMessage}
          </Alert>
        )}

        <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
          <Toolbar sx={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e5e5', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <Typography variant="h6" component="div" sx={{ color: '#050505', fontWeight: 600 }}>
                Contacts
              </Typography>
              {selected.length > 0 && (
                <Chip label={`${selected.length} selected`} size="small" sx={{ backgroundColor: '#e0e0e0', color: '#050505' }} />
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onCreate}
              >
                Add Contact
              </Button>
            </Box>
          </Toolbar>

          {loading ? (
            <Box display="flex" justifyContent="center" p={8}><CircularProgress /></Box>
          ) : (
            <TableView
              data={contacts}
              columns={columns}
              idField="ContactID"
              selected={selected}
              onSelectClick={onSelectClick}
              onSelectAllClick={onSelectAllClick}
              showSelection={true}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDeactivate}
              onAddNote={onAddNote}
              onAddAttachment={onAddAttachment}
              formatters={formatters}
              entityType="contact"
            />
          )}

          <Box sx={{ p: 2, borderTop: '1px solid #e5e5e5', backgroundColor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#666666' }}>Showing {contacts.length} contacts</Typography>
            {selected.length > 0 && (
              <Typography variant="body2" sx={{ color: '#050505', fontWeight: 500 }}>{selected.length} selected</Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default ContactsPage;
