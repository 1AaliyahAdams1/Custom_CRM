// PAGE : Main Deals Page (presentational only, no data fetching)

// IMPORTS
import React, { useState, useEffect, useMemo } from "react";
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
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Add, Clear } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { formatters } from "../utils/formatters";
import UniversalTable from "../components/TableView";
import { getAllDeals } from "../services/dealService";

// Monochrome theme for MUI components
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#050505",
      contrastText: "#fafafa",
    },
    secondary: {
      main: "#666666",
      contrastText: "#ffffff",
    },
    background: {
      default: "#fafafa",
      paper: "#ffffff",
    },
    text: {
      primary: "#050505",
      secondary: "#666666",
    },
    divider: "#e5e5e5",
  },
  components: {
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#f0f0f0",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "#f5f5f5",
          },
          "&.Mui-selected": {
            backgroundColor: "#e0e0e0",
            "&:hover": {
              backgroundColor: "#d5d5d5",
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "4px",
          fontWeight: 500,
        },
      },
    },
  },
});

// Table configuration for deals
const dealsTableConfig = {
  idField: "DealID",
  columns: [
    { field: "DealName", headerName: "Deal Name", type: "tooltip" },
    { field: "AccountName", headerName: "Account", width: 150 },
    { field: "StageName", headerName: "Stage", width: 150 },
    { field: "SymbolValue", headerName: "Amount" },
    { field: "LocalName", headerName: "Currency symbol" }, // currency name
    { field: "CloseDate", headerName: "Close Date", type: "date" },
    { field: "Probability", headerName: "Probability (%)", type: "percentage" },
    {
      field: "CreatedAt",
      headerName: "Created",
      type: "dateTime",
    },
    {
      field: "UpdatedAt",
      headerName: "Updated",
      type: "date",
    },
  ],
};

const DealsPage = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Function to fetch deals data from backend API
  const fetchDeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllDeals(true);
      console.log("Fetched deals:", data);
      const processedData = data.map((deal) => ({
        ...deal, // keep all original deal fields
        SymbolValue: deal.Prefix
          ? `${deal.Symbol}${deal.Value}` // symbol before value
          : `${deal.Value}${deal.Symbol}`, // symbol after value
      }));

      setDeals(processedData);
    } catch (error) {
      console.error("Failed to fetch deals:", error);
      setError("Failed to load deals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Action handlers
  const onCreate = () => {
    navigate("/deals/create");
  };

  const onView = (dealId) => {
    navigate(`/deals/${dealId}`);
  };

const onEdit = (deal) => {
  navigate(`/deals/edit/${deal.DealID}`);
};

  const onDeactivate = (dealId) => {
    console.log("Deactivate deal:", dealId);
  };

  const onAddNote = (deal) => {
    console.log("Add note to deal:", deal.DealID);
  };

  const onAddAttachment = (deal) => {
    console.log("Add attachment to deal:", deal.DealID);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
  };

  // Fetch deals once when component mounts
  useEffect(() => {
    fetchDeals();
  }, []);

  // Automatically clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Filter and search logic
  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const matchesSearch =
        (deal.DealName &&
          deal.DealName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (deal.AccountID && deal.AccountID.toString().includes(searchTerm)) ||
        (deal.DealStageID && deal.DealStageID.toString().includes(searchTerm));

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "high" && deal.Probability >= 75) ||
        (statusFilter === "medium" &&
          deal.Probability >= 50 &&
          deal.Probability < 75) ||
        (statusFilter === "low" && deal.Probability < 50);

      return matchesSearch && matchesStatus;
    });
  }, [deals, searchTerm, statusFilter]);

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
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(deals.map((deal) => deal.DealID));
    } else {
      setSelected([]);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: "100%",
          backgroundColor: "#fafafa",
          minHeight: "100vh",
          p: 3,
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSuccessMessage("")}
          >
            {successMessage}
          </Alert>
        )}

        <Paper
          elevation={0}
          sx={{
            width: "100%",
            mb: 2,
            border: "0px solid #e5e5e5",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {/* Toolbar */}
          <Toolbar
            sx={{
              backgroundColor: "#ffffff",
              borderBottom: "1px solid #e5e5e5",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
              py: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
              <Typography
                variant="h6"
                component="div"
                sx={{ color: "#050505", fontWeight: 600 }}
              >
                Deals
              </Typography>
              {selected.length > 0 && (
                <Chip
                  label={`${selected.length} selected`}
                  size="small"
                  sx={{ backgroundColor: "#e0e0e0", color: "#050505" }}
                />
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onCreate}
                disabled={loading}
                sx={{
                  backgroundColor: "#050505",
                  color: "#ffffff",
                  "&:hover": { backgroundColor: "#333333" },
                  "&:disabled": {
                    backgroundColor: "#cccccc",
                    color: "#666666",
                  },
                }}
              >
                Add Deal
              </Button>

              {/* Probability Filter */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Probability</InputLabel>
                <Select
                  value={statusFilter}
                  label="Probability"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{
                    backgroundColor: "#ffffff",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e5e5e5",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#cccccc",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#050505",
                    },
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
                    borderColor: "#e5e5e5",
                    color: "#666666",
                    "&:hover": {
                      borderColor: "#cccccc",
                      backgroundColor: "#f5f5f5",
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
              data={filteredDeals}
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
          <Box
            sx={{
              p: 2,
              borderTop: "1px solid #e5e5e5",
              backgroundColor: "#fafafa",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" sx={{ color: "#666666" }}>
              Showing {filteredDeals.length} of {deals.length} deals
            </Typography>
            {selected.length > 0 && (
              <Typography
                variant="body2"
                sx={{ color: "#050505", fontWeight: 500 }}
              >
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
