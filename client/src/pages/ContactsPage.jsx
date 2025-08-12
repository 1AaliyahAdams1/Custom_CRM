

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
  searchTerm,
  employmentStatusFilter,
  filteredContacts,
  handleSelectClick,
  handleSelectAllClick,
  handleEdit,
  handleOpenCreate,
  handleView,
  clearFilters,
  handleDeactivate,
  setSearchTerm,
  setEmploymentStatusFilter,
  formatters,
  onAddNote,
  onAddAttachment,
}) => {

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
        {/* Display error alert if any error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => { }}>
            {error}
          </Alert>
        )}

        {/* Display success alert on successful operation */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => { }}>
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
              columns={[
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
              ]}
              idField={'ContactID'}
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

const formatters = {
  CreatedAt: (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date)) return "-";
    return date.toLocaleDateString();
  },
};

export default ContactsPage;
