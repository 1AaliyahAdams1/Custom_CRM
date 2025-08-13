// Component: DealsTable
// Description: Displays a list of accounts in a MUI DataGrid with edit, delete, and view detail actions

//IMPORTS
import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { IconButton, Box, Tooltip } from "@mui/material";
import { Edit, Delete, Info } from "@mui/icons-material";
import { useNavigate } from "react-router-dom"; 

const DealsTable = ({ deals, loading, onEdit, onDelete, onGetFilterColumns }) => {
  // React Router's navigation hook to programmatically navigate to deal details page
  const navigate = useNavigate();

  // Define columns for DataGrid, including data fields and custom actions column
  const columns = [
    { field: "DealID", headerName: "Deal ID", width: 100 },
    { field: "AccountName", headerName: "Account", width: 150 },
    { field: "StageName", headerName: "Stage", width: 150 },
    { field: "DealName", headerName: "Deal Name", width: 200 },
    { field: "SymbolValue", headerName: "Value", width: 150 },
    { field: "CloseDate", headerName: "Close Date", width: 150 },
    { field: "Probability", headerName: "Probability (%)", width: 150 },
    { field: "CreatedAt", headerName: "Created At", width: 180 },
    { field: "UpdatedAt", headerName: "Updated At", width: 180 },

    // Actions column with Edit, Delete, and Info buttons with tooltips
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
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

  // Columns available for filtering (excludes actions, timestamps, or any other fields you don't want filterable)
  const filterColumns = [
    { field: "DealID", headerName: "Deal ID", width: 100 },
    { field: "AccountName", headerName: "Account", width: 150 },
    { field: "StageName", headerName: "Stage", width: 150 },
    { field: "DealName", headerName: "Deal Name", width: 200 },
    { field: "SymbolValue", headerName: "Value", width: 150 },
    { field: "CloseDate", headerName: "Close Date", width: 150 },
    { field: "Probability", headerName: "Probability (%)", width: 150 },
    // Note: CreatedAt and UpdatedAt are excluded from filtering
  ];

  // Expose filter columns to parent component when component mounts or updates
  React.useEffect(() => {
    if (onGetFilterColumns) {
      onGetFilterColumns(filterColumns);
    }
  }, [onGetFilterColumns]); // Dependency array to prevent unnecessary calls

  // Render DataGrid with deals data, custom columns, and pagination
  return (
    <div style={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={deals}
        columns={columns}
        getRowId={(row) => row.DealID}
        pageSize={10}
        rowsPerPageOptions={[10]}
        loading={loading}
      />
    </div>
  );
};

export default DealsTable;