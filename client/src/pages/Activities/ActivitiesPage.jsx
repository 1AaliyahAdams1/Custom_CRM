<<<<<<< HEAD
<<<<<<<< HEAD:client/src/pages/Activities/ActivitiesPage.jsx
import React from "react";
========
import React, { useState, useEffect } from 'react';
>>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495:client/src/pages/Deals/DealsPage.jsx
=======
// PAGE : Main Activities Page (presentational only, no data fetching)

// IMPORTS
import React from "react";
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
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
import { formatters } from '../../utils/formatters';
<<<<<<< HEAD
<<<<<<<< HEAD:client/src/pages/Activities/ActivitiesPage.jsx
import TableView from '../../components/TableView'; 
========
import TableView from '../../components/tableFormat/TableView';
>>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495:client/src/pages/Deals/DealsPage.jsx
import theme from "../../components/Theme";

// Table configuration for deals
const dealsTableConfig = {
  idField: 'DealID',
  columns: [
    { field: 'DealName', headerName: 'Deal Name', type: 'tooltip' },
    { field: "AccountName", headerName: "Account", width: 150 },
    { field: "StageName", headerName: "Stage", width: 150 },
    { field: 'SymbolValue', headerName: 'Amount' },
    { field: 'LocalName', headerName: 'Currency symbol' },
    { field: 'CloseDate', headerName: 'Close Date', type: 'date' },
    { field: 'Progression', headerName: 'Probability (%)', type: 'percentage' },
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

<<<<<<<< HEAD:client/src/pages/Activities/ActivitiesPage.jsx
=======
import TableView from '../../components/tableFormat/TableView';
import theme from "../../components/Theme";


// Table configuration for activities
const activitiesTableConfig = {
  idField: "ActivityID",
  columns: [
    { field: "ActivityType", headerName: "Activity Type", type: "tooltip" },
    { field: "AccountName", headerName: "Account Name", type: "tooltip" },
    { field: "DueToStart", headerName: "Due To Start", type: "date" },
    { field: "DueToEnd", headerName: "Due To End", type: "date" },
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
    {
      field: "Completed",
      headerName: "Status",
      type: "boolean",
    },
  ],
};

//REMOVED FROM TABLE FOR NOW
//{ field: "PriorityLevelName", headerName: "PriorityLevel" },
    //{ field: "note", headerName: "Notes", type: "truncated", maxWidth: 150 },
    //{ field: "attachment", headerName: "Attachments" },

>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
const ActivitiesPage = ({
  activities = [], // Added default prop
  loading = false,
  error,
  successMessage,
<<<<<<< HEAD
========
const DealsPage = ({ 
  deals = [],
  loading = false,
  error = null,
  successMessage = "",
  searchTerm = "",
  statusFilter = "",
>>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495:client/src/pages/Deals/DealsPage.jsx
  setSuccessMessage,
  setSearchTerm,
  setStatusFilter,
=======
  searchTerm,
  statusFilter,
  priorityFilter,
  setSuccessMessage,
  setSearchTerm,
  setStatusFilter,
  setPriorityFilter,
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
  onDeactivate,
  onEdit,
  onView,
  onCreate,
  onAddNote,
  onAddAttachment,
  clearFilters,
<<<<<<< HEAD
  totalCount = 0
}) => {
  const [selected, setSelected] = useState([]);

  // Process deals data to add SymbolValue field
  const processedDeals = deals.map(deal => ({
    ...deal,
    SymbolValue: deal.Prefix
      ? `${deal.Symbol}${deal.Value}`
      : `${deal.Value}${deal.Symbol}`
  }));

  // Automatically clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        if (setSuccessMessage) {
          setSuccessMessage("");
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [successMessage, setSuccessMessage]);
=======
  totalCount,
}) => {
  const [selected, setSelected] = React.useState([]);
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495

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
<<<<<<< HEAD
        selected.slice(selectedIndex + 1),
=======
        selected.slice(selectedIndex + 1)
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
      );
    }

    setSelected(newSelected);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
<<<<<<< HEAD
      setSelected(processedDeals.map(deal => deal.DealID));
=======
      setSelected(activities.map((activity) => activity.ActivityID));
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
    } else {
      setSelected([]);
    }
  };

  return (
    <ThemeProvider theme={theme}>
<<<<<<< HEAD
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
=======
      <Box
        sx={{
          width: "100%",
          backgroundColor: "#fafafa",
          minHeight: "100vh",
          p: 3,
        }}
      >
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
<<<<<<< HEAD
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage && setSuccessMessage("")}>
=======
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSuccessMessage("")}
          >
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
            {successMessage}
          </Alert>
        )}

        <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
<<<<<<< HEAD
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
=======
          {/* Toolbar*/}
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flex: 1,
              }}
            >
              <Typography
                variant="h6"
                component="div"
                sx={{ color: "#050505", fontWeight: 600 }}
              >
                Activities
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
              </Typography>
              {selected.length > 0 && (
                <Chip
                  label={`${selected.length} selected`}
                  size="small"
<<<<<<< HEAD
                  sx={{ backgroundColor: '#e0e0e0', color: '#050505' }}
=======
                  sx={{ backgroundColor: "#e0e0e0", color: "#050505" }}
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
                />
              )}
            </Box>

<<<<<<< HEAD
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
=======
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onCreate}
                disabled={loading}
                sx={{
<<<<<<< HEAD
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
=======
                  backgroundColor: "#050505",
                  color: "#ffffff",
                  "&:hover": { backgroundColor: "#333333" },
                  "&:disabled": {
                    backgroundColor: "#cccccc",
                    color: "#666666",
                  },
                }}
              >
                Add Activity
              </Button>


>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
            </Box>
          </Toolbar>

          {/* Loading spinner or table */}
          {loading ? (
            <Box display="flex" justifyContent="center" p={8}>
              <CircularProgress />
            </Box>
          ) : (
            <TableView
<<<<<<< HEAD
<<<<<<<< HEAD:client/src/pages/Activities/ActivitiesPage.jsx
              data={activities}
              columns={activitiesTableConfig.columns}
              idField={activitiesTableConfig.idField}
========
              data={processedDeals}
              columns={dealsTableConfig.columns}
              idField={dealsTableConfig.idField}
>>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495:client/src/pages/Deals/DealsPage.jsx
=======
              data={activities}
              columns={activitiesTableConfig.columns}
              idField={activitiesTableConfig.idField}
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
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
<<<<<<< HEAD
<<<<<<<< HEAD:client/src/pages/Activities/ActivitiesPage.jsx
              entityType="activity"
========
              entityType="deal"
>>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495:client/src/pages/Deals/DealsPage.jsx
=======
              entityType="activity"
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
            />
          )}

          {/* Results footer */}
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
              Showing {processedDeals.length} of {totalCount} deals
            </Typography>
            {selected.length > 0 && (
              <Typography variant="body2" sx={{ color: '#050505', fontWeight: 500 }}>
=======
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
              Showing {activities.length} of {totalCount || activities.length}{" "}
              activities
            </Typography>
            {selected.length > 0 && (
              <Typography
                variant="body2"
                sx={{ color: "#050505", fontWeight: 500 }}
              >
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
                {selected.length} selected
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

<<<<<<< HEAD
export default DealsPage;
=======
export default ActivitiesPage;
>>>>>>> cff0b1721b8f056cc48682b3d4508773311a8495
