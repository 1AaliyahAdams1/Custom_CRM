// Component: AccountsTable
// Description: Displays a list of accounts in a MUI DataGrid with edit, delete, and view detail actions

//IMPORTS
import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { IconButton, Box, Tooltip } from "@mui/material";
import { Edit, Delete, Info } from "@mui/icons-material";
import { useNavigate } from "react-router-dom"; 

const AccountsTable = ({ accounts, onEdit, onDelete }) => {
  const navigate = useNavigate(); // React Router hook for programmatic navigation

  // Define DataGrid column configuration
  const columns = [
  { field: "AccountID", headerName: "ID", width: 90 },
  { field: "AccountName", headerName: "Name", width: 200 },
  { field: "CityID", headerName: "City ID", width: 100 },

  {
  field: "Address", 
  headerName: "Street Address",
  width: 300,
  sortable: false, 
  renderCell: (params) => {
    const { street_address1, street_address2, street_address3 } = params.row;
    const fullAddress = [street_address1, street_address2, street_address3]
      .filter(Boolean)
      .join(" ");
    return fullAddress;
  },
  },


  { field: "postal_code", headerName: "Postal Code", width: 120 },
  { field: "PrimaryPhone", headerName: "Phone", width: 150 },
  { field: "fax", headerName: "Fax", width: 150 },
  { field: "email", headerName: "Email", width: 200 },
  { field: "IndustryID", headerName: "Industry ID", width: 120 },
  { field: "Website", headerName: "Website", width: 200 },
  { field: "number_of_employees", headerName: "# Employees", width: 130 },
  { field: "annual_revenue", headerName: "Annual Revenue", width: 150 },
  { field: "number_of_venues", headerName: "# Venues", width: 120 },
  { field: "number_of_releases", headerName: "# Releases", width: 120 },
  { field: "number_of_events_anually", headerName: "# Events/Year", width: 150 },
  { field: "ParentAccount", headerName: "Parent Account ID", width: 150 },
  { field: "CreatedAt", headerName: "Created", width: 180 },
  { field: "UpdatedAt", headerName: "Updated", width: 180 },

  // Actions column

    // Custom actions column with edit, delete, and view detail icons
    {
      field: "actions",
      headerName: "Actions",
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          {/* Edit button triggers parent onEdit function with the selected row */}
          <Tooltip title="Edit">
            <IconButton
              onClick={() => onEdit(params.row)}
              color="success"
              size="small"
              sx={{ mr: 1 }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Delete button triggers parent onDelete function with the AccountID */}
          <Tooltip title="Delete">
            <IconButton
              onClick={() => onDelete(params.row.AccountID)}
              color="error"
              size="small"
              sx={{ mr: 1 }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Info button navigates to detailed account page using AccountID */}
          <Tooltip title="View Details">
            <IconButton
              onClick={() => navigate(`/accounts/${params.row.AccountID}`)}
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

  return (
    <div style={{ height: 600, width: "100%" }}>
      <DataGrid
        rows={accounts} // The list of accounts to display
        columns={columns} // Column definitions
        getRowId={(row) => row.AccountID} // Unique row ID selector
        pageSize={10} // Number of rows per page
        rowsPerPageOptions={[10]} // Page size options in the pagination dropdown
      />
    </div>
  );
};

export default AccountsTable;
