// Component: DealsTable
// Description: Displays a list of accounts in a MUI DataGrid with edit, delete, and view detail actions

//IMPORTS
import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { IconButton, Box, Tooltip } from "@mui/material"; // Added Tooltip import
import { Edit, Delete, Info } from "@mui/icons-material";
import { useNavigate } from "react-router-dom"; 

const DealsTable = ({ deals, loading, onEdit, onDelete }) => {
  // React Router's navigation hook to programmatically navigate to deal details page
  const navigate = useNavigate();

  // Define columns for DataGrid, including data fields and custom actions column
  const columns = [
    { field: "DealID", headerName: "Deal ID", width: 100 },
    { field: "AccountID", headerName: "Account ID", width: 150 },
    { field: "DealStageID", headerName: "Deal Stage ID", width: 150 },
    { field: "DealName", headerName: "Deal Name", width: 200 },
    { field: "Value", headerName: "Value", width: 150 },
    { field: "CloseDate", headerName: "Close Date", width: 150 },
    { field: "Probability", headerName: "Probability (%)", width: 150 },
    { field: "CreatedAt", headerName: "Created At", width: 180 },
    { field: "UpdatedAt", headerName: "Updated At", width: 180 },

    // Actions column with Edit, Delete, and Info buttons with tooltips
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false, // Disable sorting on action buttons column
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          {/* Edit button with tooltip */}
          <Tooltip title="Edit Deal" arrow>
            <IconButton
              onClick={() => onEdit(params.row)}
              color="success"
              size="small"
              sx={{ mr: 1 }}
              aria-label={`Edit deal ${params.row.DealID}`}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Delete button with tooltip */}
          <Tooltip title="Delete Deal" arrow>
            <IconButton
              onClick={() => onDelete(params.row.DealID)}
              color="error"
              size="small"
              aria-label={`Delete deal ${params.row.DealID}`}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Info/details button with tooltip */}
          <Tooltip title="View Deal Details" arrow>
            <IconButton
              onClick={() => navigate(`/deals/${params.row.DealID}`)}
              color="info"
              size="small"
              aria-label={`View details for deal ${params.row.DealID}`}
            >
              <Info fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Render DataGrid with deals data, custom columns, and pagination
  return (
    <div style={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={deals}                         // Data rows to display
        columns={columns}                    // Columns configuration
        getRowId={(row) => row.DealID}      // Unique row id accessor
        pageSize={10}                       // Number of rows per page
        rowsPerPageOptions={[10]}           // Pagination options
        loading={loading}                   // Loading indicator flag
      />
    </div>
  );
};

export default DealsTable;
