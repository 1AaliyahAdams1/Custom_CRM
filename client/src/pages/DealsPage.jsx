//PAGE : Main Deals Page (presentational only, no data fetching)

//IMPORTS
import React from "react";
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
import { formatters } from '../utils/formatters';
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

// Table configuration for deals
const dealsTableConfig = {
  idField: 'DealID',
  columns: [
    { field: 'DealName', headerName: 'Deal Name', type: 'tooltip' },
    { field: "AccountName", headerName: "Account", width: 150 },
    { field: "StageName", headerName: "Stage", width: 150 },
    { field: 'Value', headerName: 'Value' },
    { field: 'LocalName', headerName: 'Currency symbol' },
    { field: 'CloseDate', headerName: 'Close Date', type: 'date' },
    { field: 'Probability', headerName: 'Probability (%)', type: 'percentage' },
    {
      field: 'CreatedAt',
      headerName: 'Created',
      type: 'dateTime',
    },
    {
      field: 'UpdatedAt',
      headerName: 'Updated',
      type: 'date',
    },
  ]
};

const DealsPage = ({
  deals,
  loading,
  error,
  successMessage,
  searchTerm,
  statusFilter,
  setSuccessMessage,
  setSearchTerm,
  setStatusFilter,
  onDeactivate,
  onEdit,
  onView,
  onCreate,
  onAddNote,
  onAddAttachment,
  clearFilters,
  totalCount,
}) => {
  const [selected, setSelected] = React.useState([]);

  // Selection handlers
  const handleSelectClick = (id) => {
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
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(deals.map(deal => deal.DealID));
    } else {
      setSelected([]);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

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
            border: '0px solid #e5e5e5',
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
                Deals
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
                Add Deal
              </Button>

              {/* Search */}
              <TextField
                size="small"
                placeholder="Search deals..."
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

              {/* Probability Filter */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Probability</InputLabel>
                <Select
                  value={statusFilter}
                  label="Probability"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{
                    backgroundColor: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e5e5' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cccccc' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#050505' },
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="high">High (75%+)</MenuItem>
                  <MenuItem value="medium">Medium (50-74%)</MenuItem>
                  <MenuItem value="low">Low (&lt;50%)</MenuItem>
                </Select>
              </FormControl>

              {/* Clear Filters */}
              {(searchTerm || statusFilter) && (
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

          {/* Loading spinner or table */}
          {loading ? (
            <Box display="flex" justifyContent="center" p={8}>
              <CircularProgress />
            </Box>
          ) : (
            <UniversalTable
              data={deals}
              columns={dealsTableConfig.columns}
              idField={dealsTableConfig.idField}
              selected={selected}
              onSelectClick={handleSelectClick}
              onSelectAllClick={handleSelectAllClick}
              showSelection={true}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDeactivate}
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
              Showing {deals.length} of {totalCount || deals.length} deals
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

export default DealsPage;