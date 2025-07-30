// Component: AccountsTable
// Description: Displays a list of accounts in a MUI DataGrid with edit, delete, and view detail actions

import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { IconButton, Box, Tooltip, Chip } from "@mui/material";
import { Edit, Delete, Info } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const AccountsTable = ({ accounts, onEdit, onDeactivate }) => {
  const navigate = useNavigate();

  const columns = [
    {
      field: "AccountID",
      headerName: "ID",
      width: 90,
      type: 'number'
    },
    {
      field: "AccountName",
      headerName: "Name",
      width: 200,
      renderCell: (params) => (
        <Tooltip title={params.value || ""}>
          <span>{params.value || "-"}</span>
        </Tooltip>
      )
    },
    //Use this in an admin area etc.
    //later use
    // {
    //   field: "Active",
    //   headerName: "Status",
    //   width: 100,
    //   renderCell: (params) => (
    //     <Chip
    //       label={params.value ? "Active" : "Inactive"}
    //       color={params.value ? "success" : "error"}
    //       size="small"
    //     />
    //   )
    // },
    {
      field: "CityID",
      headerName: "City ID",
      width: 100,
      type: 'number'
    },
    {
      field: "Address",
      headerName: "Street Address",
      width: 300,
      sortable: false,
      renderCell: (params) => {
        if (!params || !params.row) return "";
        const { street_address1, street_address2, street_address3 } = params.row;
        const fullAddress = [street_address1, street_address2, street_address3]
          .filter(Boolean)
          .join(" ");
        return (
          <Tooltip title={fullAddress || "No address"}>
            <span>{fullAddress || "-"}</span>
          </Tooltip>
        );
      },
    },
    {
      field: "postal_code",
      headerName: "Postal Code",
      width: 120
    },
    {
      field: "PrimaryPhone",
      headerName: "Phone",
      width: 150,
      renderCell: (params) => params.value || "-"
    },
    {
      field: "fax",
      headerName: "Fax",
      width: 150,
      renderCell: (params) => params.value || "-"
    },
    {
      field: "email",
      headerName: "Email",
      width: 200,
      renderCell: (params) => params.value || "-"
    },
    {
      field: "IndustryID",
      headerName: "Industry ID",
      width: 120,
      type: 'number'
    },
    {
      field: "Website",
      headerName: "Website",
      width: 200,
      renderCell: (params) => {
        if (!params.value) return "-";
        return (
          <a
            href={params.value.startsWith('http') ? params.value : `https://${params.value}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {params.value}
          </a>
        );
      }
    },
    {
      field: "number_of_employees",
      headerName: "# Employees",
      width: 130,
      type: 'number',
      renderCell: (params) => params.value || "-"
    },
    {
      field: "annual_revenue",
      headerName: "Annual Revenue",
      width: 150,
      type: 'number',
      renderCell: (params) => {
        if (!params.value) return "-";
        return new Intl.NumberFormat().format(params.value);
      }
    },
    {
      field: "number_of_venues",
      headerName: "# Venues",
      width: 120,
      type: 'number',
      renderCell: (params) => params.value || "-"
    },
    {
      field: "number_of_releases",
      headerName: "# Releases",
      width: 120,
      type: 'number',
      renderCell: (params) => params.value || "-"
    },
    {
      field: "number_of_events_anually",
      headerName: "# Events/Year",
      width: 150,
      type: 'number',
      renderCell: (params) => params.value || "-"
    },
    {
      field: "ParentAccount",
      headerName: "Parent Account ID",
      width: 150,
      type: 'number',
      renderCell: (params) => params.value || "-"
    },
    {
      field: "CreatedAt",
      headerName: "Created",
      width: 180,
      type: 'string', // use string since we're formatting manually
      renderCell: (params) => {
        if (!params.value) return "-";
        const date = new Date(params.value);
        if (isNaN(date)) return "-";  // safeguard against invalid dates
        return date.toLocaleDateString();
      }
    },
    {
      field: "UpdatedAt",
      headerName: "Updated",
      width: 180,
      type: 'string', // same here
      renderCell: (params) => {
        if (!params.value) return "-";
        const date = new Date(params.value);
        if (isNaN(date)) return "-";
        return date.toLocaleDateString();
      }
    },

    {
      field: "actions",
      headerName: "Actions",
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <Tooltip title="Edit Account">
            <IconButton
              onClick={() => onEdit(params.row)}
              color="primary"
              size="small"
              sx={{ mr: 0.5 }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={params.row.Active ? "Deactivate Account" : "Account Already Inactive"}>
            <span>
              <IconButton
                onClick={() => onDeactivate(params.row.AccountID)}
                color="error"
                size="small"
                sx={{ mr: 0.5 }}
                disabled={!params.row.Active} // Disable if already inactive
              >
                <Delete fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

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
        rows={accounts || []}
        columns={columns}
        getRowId={(row) => row.AccountID}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 25, 50]}
        checkboxSelection={false}
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-row': {
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          },
        }}
      />
    </div>
  );
};

export default AccountsTable;