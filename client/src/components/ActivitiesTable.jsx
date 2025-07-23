// Component: ActivitiesTable
// Description: Displays a list of accounts in a MUI DataGrid with edit, delete, and view detail actions

//IMPORTS
import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { IconButton, Box, Tooltip } from "@mui/material";  
import { Edit, Delete, Info } from "@mui/icons-material";
import { useNavigate } from "react-router-dom"; 

// ActivitiesTable component displays a DataGrid of activities with edit, delete, and info actions
const ActivitiesTable = ({ activities, onEdit, onDelete, loading }) => {
  const navigate = useNavigate();

  // Define columns for the DataGrid
  const columns = [
    { field: "ActivityID", headerName: "Activity ID", width: 100 }, 
    { field: "ActivityType", headerName: "Activity Type", width: 150 },
    { field: "AccountName", headerName: "Account Name", width: 150 },
    { field: "Due_date", headerName: "Due Date", width: 160 },
    { field: "PriorityLevelID", headerName: "Priority", width: 130 },
    { field: "CreatedAt", headerName: "Created At", width: 180 },
    { field: "UpdatedAt", headerName: "Updated At", width: 180 },
    {
      // Actions column: renders edit, delete, and info buttons
      field: "actions",
      headerName: "Actions",
      width: 130,
      sortable: false, // Disable sorting on this column
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          {/* Edit button with tooltip */}
          <Tooltip title="Edit Activity">
            <IconButton
              onClick={() => onEdit(params.row)}
              color="success"
              size="small"
              sx={{ mr: 1 }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Delete button with tooltip */}
          <Tooltip title="Delete Activity">
            <IconButton
              onClick={() => onDelete(params.row.ActivityID)}
              color="error"
              size="small"
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Info/details button with tooltip */}
          <Tooltip title="View Details">
            <IconButton
              onClick={() => navigate(`/activities/${params.row.ActivityID}`)}
              color="info"
              size="small"
            >
              <Info fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Render DataGrid with rows, columns, pagination, and loading state
  return (
    <div style={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={activities}                  // Rows data passed as prop
        columns={columns}                  // Columns definition above
        getRowId={(row) => row.ActivityID} // Unique row ID key
        pageSize={10}                     // Pagination page size
        rowsPerPageOptions={[10]}         // Pagination options
        loading={loading}                 // Show loading spinner while loading
      />
    </div>
  );
};

export default ActivitiesTable;
