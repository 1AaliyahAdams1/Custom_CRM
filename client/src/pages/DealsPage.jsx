//PAGE : Main Deals Page (presentational only, no data fetching)

//IMPORTS
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
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import { formatters } from "../utils/formatters";
import UniversalTable from "../components/TableView";
import { getAllDeals } from "../services/dealService";
import { getAllAccounts } from "../services/accountService"; // Import the account service
import theme from "../components/Theme";

// Table configuration for deals
const dealsTableConfig = {
  idField: "DealID",
  columns: [
    { field: "DealName", headerName: "Deal Name", type: "tooltip" },
    { field: "AccountName", headerName: "Account", width: 150 },
    { field: "StageName", headerName: "Stage", width: 150 },
    { field: "SymbolValue", headerName: "Amount" },
    { field: "LocalName", headerName: "Currency symbol" }, //currency name
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
  const [accounts, setAccounts] = useState([]); // State for accounts
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Function to fetch deals data from backend API
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const response = await getAllDeals(true);
        const data = response?.data || response || [];
        console.log("Fetched deals:", data);
        const processedData = Array.isArray(data)
          ? data.map((deal) => ({
              ...deal, // keep all original deal fields
              SymbolValue: deal.Prefix
                ? `${deal.Symbol}${deal.Value}` // symbol before value
                : `${deal.Value}${deal.Symbol}`, // symbol after value
            }))
          : [];
        setDeals(processedData);
      } catch (error) {
        console.error("Failed to fetch deals:", error);
        setError("Failed to load deals. Please try again.");
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
    fetchParentAccounts();
  }, []);

  // Function to fetch accounts data from backend API
  const fetchParentAccounts = async () => {
    try {
      const response = await getAllAccounts();
      const data = response?.data || response || [];
      console.log("Fetched accounts:", data);
      const processedAccounts = Array.isArray(data)
        ? data.map((account) => ({
            AccountID: account.AccountID || account.id,
            AccountName: account.AccountName || account.name,
          }))
        : [];
      setAccounts(processedAccounts);
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      setError("Failed to load accounts. Please try again.");
    }
  };

  // Automatically clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      // Cleanup timer if component unmounts or successMessage changes
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Filter and search logic
  const filteredDeals = useMemo(() => {
    if (loading) return [];
    return deals.filter((deal) => deal.status === "active");
  }, [deals, loading]);

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

  // Placeholder functions for unimplemented features
  const onCreate = () => {
    /* your logic */
  };
  const onView = () => {
    /* your logic */
  };
  const onEdit = () => {
    /* your logic */
  };
  const onDeactivate = () => {
    /* your logic */
  };
  const onAddNote = () => {
    /* your logic */
  };
  const onAddAttachment = () => {
    /* your logic */
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: "100%",
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
          p: 3,
        }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSuccessMessage("")}>
            {successMessage}
          </Alert>
        )}

        <Paper
          elevation={1}
          sx={{
            width: "100%",
            mb: 2,
            border: "1px solid #ddd",
            borderRadius: "8px",
            overflow: "hidden",
          }}>
          {/* Toolbar*/}
          <Toolbar
            sx={{
              backgroundColor: "#fff",
              borderBottom: "1px solid #ddd",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
              py: 2,
            }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
              <Typography
                variant="h6"
                component="div"
                sx={{ color: "#333", fontWeight: 600 }}>
                Deals
              </Typography>
              {selected.length > 0 && (
                <Chip
                  label={`${selected.length} selected`}
                  size="small"
                  sx={{ backgroundColor: "#e0e0e0", color: "#333" }}
                />
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onCreate}
                disabled={loading}
                sx={{
                  backgroundColor: "#1976d2",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#1565c0" },
                  "&:disabled": {
                    backgroundColor: "#e0e0e0",
                    color: "#9e9e9e",
                  },
                }}>
                Add Deal
              </Button>
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
              borderTop: "1px solid #ddd",
              backgroundColor: "#f5f5f5",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Showing {filteredDeals.length} of {deals.length} deals
            </Typography>
            {selected.length > 0 && (
              <Typography
                variant="body2"
                sx={{ color: "#333", fontWeight: 500 }}>
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
