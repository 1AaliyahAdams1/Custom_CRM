
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Toolbar,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { Add, Info } from "@mui/icons-material";
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
  setError,
  selected = [],
  onSelectClick,
  onSelectAllClick,
  onDeactivate,
  onEdit,
  onView,
  onCreate,
  onAddNote,
  onAddAttachment,
  onFilterChange,
  userRoles = [],
}) => {
  const navigate = useNavigate();

  const handleViewAccount = (contact) => {
    if (!contact?.AccountID) {
      if (setError) {
        setError("Cannot view account - missing ID");
      }
      return;
    }
    navigate(`/accounts/${contact.AccountID}`);
  };

  const columns = [
    { field: "AccountName", headerName: "Name", type: "clickable", defaultVisible: true, onClick: handleViewAccount },
    { field: 'PersonFullName', headerName: 'Person', type: 'tooltip', defaultVisible: true },
    { field: 'WorkEmail', headerName: 'Email', defaultVisible: true },
    { field: 'WorkPhone', headerName: 'Phone', defaultVisible: true },
    { field: 'JobTitleName', headerName: 'Job Title', defaultVisible: true },
    { field: 'CreatedAt', headerName: 'Created', type: 'dateTime', defaultVisible: true },
    { field: 'UpdatedAt', headerName: 'Updated', type: 'dateTime', defaultVisible: false },
    {
      field: 'Active',
      headerName: 'Active',
      type: 'chip',
      chipLabels: { true: 'Active', false: 'Inactive' },
      chipColors: { true: '#079141ff', false: '#999999' },
      defaultVisible: true,
    }
  ];

  // Local state for filter
  const [contactFilter, setContactFilter] = useState('all');

  const handleFilterChange = (event) => {
    const newFilter = event.target.value;
    setContactFilter(newFilter);
    
    // Call the parent component's filter handler if provided
    if (onFilterChange) {
      onFilterChange(newFilter);
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Contacts' },
    { value: 'my', label: 'My Account Contacts' },
    { value: 'team', label: 'My Team\'s Account Contacts' },
    { value: 'unassigned', label: 'Unassigned Account Contacts' },
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
          <Toolbar sx={{ 
            backgroundColor: '#fff', 
            borderBottom: '1px solid #e5e5e5', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: 2, 
            py: 2 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" component="div" sx={{ color: '#050505', fontWeight: 600 }}>
                  Contacts
                </Typography>
                <Tooltip title="Manage and view all contacts linked to customer accounts" arrow>
                  <Info sx={{ fontSize: 18, color: '#666666', cursor: 'help' }} />
                </Tooltip>
              </Box>

              {/* Contact Filter Dropdown */}
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <Select
                  value={contactFilter}
                  onChange={handleFilterChange}
                  displayEmpty
                  sx={{ 
                    backgroundColor: '#fff',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#c0c0c0',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  {filterOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selected.length > 0 && (
                <Tooltip title={`${selected.length} contact${selected.length === 1 ? '' : 's'} selected for operations`} arrow>
                  <Chip
                    label={`${selected.length} selected`}
                    size="small"
                    sx={{ backgroundColor: '#e0e0e0', color: '#050505' }}
                  />
                </Tooltip>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Tooltip title="Create a new contact in the system" arrow>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={onCreate}
                >
                  Add Contact
                </Button>
              </Tooltip>
            </Box>
          </Toolbar>

          {loading ? (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={8}>
              <CircularProgress />
              <Tooltip title="Loading contact data from the database" arrow>
                <Typography variant="body2" sx={{ mt: 2, color: '#666666' }}>
                  Loading contacts...
                </Typography>
              </Tooltip>
            </Box>
          ) : (
            <TableView
              data={contacts}
              columns={columns}
              idField="ContactID"
              selected={selected}
              onSelectClick={onSelectClick}
              onSelectAllClick={onSelectAllClick}
              onViewAccount={handleViewAccount} 
              showSelection={true}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDeactivate}
              onAddNote={onAddNote}
              onAddAttachment={onAddAttachment}
              formatters={formatters}
              entityType="contact"
              tooltips={{
                search: "Search contacts by name, email, phone, or account",
                filter: "Show/hide advanced filtering options",
                columns: "Customize which columns are visible in the table",
                actionMenu: {
                  view: "View detailed information for this contact",
                  edit: "Edit this contact's information",
                  delete: "Delete or deactivate this contact",
                  addNote: "Add internal notes or comments",
                  addAttachment: "Attach files or documents"
                }
              }}
            />
          )}

          <Box sx={{ p: 2, borderTop: '1px solid #e5e5e5', backgroundColor: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Tooltip title="Total number of contacts currently displayed in the table" arrow>
              <Typography variant="body2" sx={{ color: '#666666', cursor: 'help' }}>
                Showing {contacts.length} contacts
              </Typography>
            </Tooltip>
            {selected.length > 0 && (
              <Tooltip title="Number of contacts currently selected for operations" arrow>
                <Typography variant="body2" sx={{ color: '#050505', fontWeight: 500, cursor: 'help' }}>
                  {selected.length} selected
                </Typography>
              </Tooltip>
            )}
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default ContactsPage;