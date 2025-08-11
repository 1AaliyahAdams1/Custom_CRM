//PAGE : Main Contacts Page
//Combines the UI components onto one page

//IMPORTS
//IMPORTS
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Toolbar,
  MenuItem,
} from "@mui/material";
import {
  Search,
  Add,
  Clear,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import UniversalTable from '../components/TableView';


import {
  getAllContacts,
  
  deactivateContact
} from "../services/contactService";

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

const contactsTableConfig = {
  columns: [
    {
      field: 'ContactID',
      headerName: 'Contact ID',
      width: 100,
      type: 'number'
    },
    {
      field: 'AccountID',
      headerName: 'Account ID',
      width: 120,
      type: 'number'
    },
    {
      field: 'PersonID',
      headerName: 'Person ID',
      width: 120,
      type: 'number'
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
      field: 'JobTitleID',
      headerName: 'Job Title ID',
      width: 130,
      type: 'number'
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
  ],
  idField: 'ContactID'
};


const ContactsPage = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [employmentStatusFilter, setEmploymentStatusFilter] = useState('');


  // Function to fetch contacts from backend API
  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllContacts();
      setContacts(data);
    } catch (err) {
      setError("Failed to load contacts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch contacts when component first mounts
  useEffect(() => {
    fetchContacts();
  }, []);

  // Automatically clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Filter and search logic for contacts
const filteredContacts = useMemo(() => {
  return contacts.filter((contact) => {
    const matchesSearch =
      (contact.ContactID && contact.ContactID.toString().includes(searchTerm)) ||
      (contact.AccountID && contact.AccountID.toString().includes(searchTerm)) ||
      (contact.PersonID && contact.PersonID.toString().includes(searchTerm)) ||
      (contact.WorkEmail && contact.WorkEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.WorkPhone && contact.WorkPhone.includes(searchTerm)) ||
      (contact.JobTitleID && contact.JobTitleID.toString().includes(searchTerm));

    const matchesEmploymentStatus = !employmentStatusFilter ||
      (employmentStatusFilter === 'employed' && contact.Still_employed === true) ||
      (employmentStatusFilter === 'not_employed' && contact.Still_employed === false) ||
      (employmentStatusFilter === 'unknown' && contact.Still_employed == null);

    return matchesSearch && matchesEmploymentStatus;
  });
}, [contacts, searchTerm, employmentStatusFilter]);



// Selection handlers 
const handleSelectClick = (event, id) => {
  const selectedIndex = selected.indexOf(id);
  let newSelected = [];

  if (selectedIndex === -1) {
    newSelected = newSelected.concat(selected, id);
  } else if (selectedIndex === 0) {
    newSelected = newSelected.concat(selected.slice(1));
  } else if (selectedIndex === selected.length - 1) {
    newSelected = newSelected.concat(selected.slice(0, -1));
  } else if (selectedIndex > 0) {
    newSelected = newSelected.concat(
      selected.slice(0, selectedIndex),
      selected.slice(selectedIndex + 1)
    );
  }
  setSelected(newSelected);
};

const handleSelectAllClick = (event) => {
  if (event.target.checked) {
    const newSelected = filteredContacts.map((contact) => contact.ContactID);
    setSelected(newSelected);
    return;
  }
  setSelected([]);
};


  // Handle edit action
  const handleEdit = (contact) => {
    navigate(`/contacts/edit/${contact.ContactID}`);
  };
  // Navigate to create contact page
  const handleOpenCreate = () => {
    navigate("/contacts/create");
  };
    const handleView = (contact) => {
  navigate(`/contacts/${contact.ContactID}`);
};

  const clearFilters = () => {
    setSearchTerm('');
    setEmploymentStatusFilter('');
  };

  // Custom formatters for the table
  const formatters = {
    
    CreatedAt: (value) => {
      if (!value) return "-";
      const date = new Date(value);
      if (isNaN(date)) return "-";
      return date.toLocaleDateString();
    },
  };



  // Deactivates a contact
  const handleDeactivate = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this contact? This will deactivate it.");
    if (!confirm) return;

    setError(null);
    try {
      console.log("Deactivating (soft deleting) contact with ID:", id);
      await deactivateContact(id);
      setSuccessMessage("Contact deleted successfully."); // message visible to user
      await fetchContacts();
    } catch (error) {
      console.log("Deactivating (soft deleting) contact with ID:", id);
      console.error("Delete failed:", error);
      setError("Failed to delete contact. Please try again.");
    }
  };


  return (
  <ThemeProvider theme={theme}>
    <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
      {/* Display error alert if any error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Display success alert on successful operation */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
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
        {/* Toolbar with search and filters */}
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
            {/* Add Contact Button */}
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenCreate}
              disabled={loading}
              sx={{
                backgroundColor: '#050505',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: '#333333',
                },
                '&:disabled': {
                  backgroundColor: '#cccccc',
                  color: '#666666',
                },
              }}
            >
              Add Contact
            </Button>

            {/* Search */}
            <TextField
              size="small"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#666666' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: 250,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#ffffff',
                  '& fieldset': { borderColor: '#e5e5e5' },
                  '&:hover fieldset': { borderColor: '#cccccc' },
                  '&.Mui-focused fieldset': { borderColor: '#050505' },
                }
              }}
            />

            {/* Employment Status Filter */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Employment</InputLabel>
              <Select
                value={employmentStatusFilter}
                label="Employment"
                onChange={(e) => setEmploymentStatusFilter(e.target.value)}
                sx={{
                  backgroundColor: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e5e5' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cccccc' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#050505' },
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="employed">Employed</MenuItem>
                <MenuItem value="not_employed">Not Employed</MenuItem>
                <MenuItem value="unknown">Unknown</MenuItem>
              </Select>
            </FormControl>

            {/* Clear Filters */}
            {(searchTerm || employmentStatusFilter) && (
              <Button
                variant="outlined"
                size="small"
                onClick={clearFilters}
                startIcon={<Clear />}
                sx={{
                  borderColor: '#e5e5e5',
                  color: '#666666',
                  '&:hover': {
                    borderColor: '#cccccc',
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                Clear
              </Button>
            )}
          </Box>
        </Toolbar>

        {/* Show loading spinner or contacts table */}
          {loading ? (
            <Box display="flex" justifyContent="center" p={8}>
              <CircularProgress />
            </Box>
          ) : (
            <UniversalTable
              data={filteredContacts}
              columns={contactsTableConfig.columns}
              idField={contactsTableConfig.idField}
              selected={selected}
              onSelectClick={handleSelectClick}
              onSelectAllClick={handleSelectAllClick}
              showSelection={true}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeactivate}
              formatters={formatters}
            />
      )}

        {/* Results footer */}
        <Box sx={{
          p: 2,
          borderTop: '1px solid #e5e5e5',
          backgroundColor: '#fafafa',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="body2" sx={{ color: '#666666' }}>
            Showing {filteredContacts.length} of {contacts.length} contacts
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