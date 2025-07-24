import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { IconButton, Box, Tooltip } from "@mui/material";
import { Edit, Delete, Info } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const ContactsTable = ({ contacts, loading, onEdit, onDelete }) => {
  const navigate = useNavigate();
 

  const columns = [
    { field: "ContactID", headerName: "Contact ID", width: 100 },
    { field: "AccountID", headerName: "Account ID", width: 120 },
    { field: "PersonID", headerName: "Person ID", width: 120 },
    { field: "WorkEmail", headerName: "Email", width: 200 },
    { field: "WorkPhone", headerName: "Phone", width: 150 },
    {
      field: "Still_employed",
      headerName: "Still Employed",
      width: 140,
      valueGetter: (params) =>
      params.row?.Still_employed === true ? "Yes" :
      params.row?.Still_employed === false ? "No" : "N/A"

    },
    { field: "JobTitleID", headerName: "Job Title ID", width: 130 },
    { field: "CreatedAt", headerName: "Created At", width: 180 },
    { field: "UpdatedAt", headerName: "Updated At", width: 180 },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <Tooltip title="Edit Contact" arrow>
            <IconButton
              onClick={() => onEdit(params.row)}
              color="success"
              size="small"
              sx={{ mr: 1 }}
              aria-label="edit contact"
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete Contact" arrow>
            <IconButton
              onClick={() => onDelete(params.row.ContactID)}
              color="error"
              size="small"
              aria-label="delete contact"
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="View Contact Details" arrow>
            <IconButton
              onClick={() => navigate(`/contacts/${params.row.ContactID}`)}
              color="info"
              size="small"
              aria-label="view contact details"
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
        rows={contacts || []}
        columns={columns}
        getRowId={(row) => row.ContactID}
        pageSize={10}
        rowsPerPageOptions={[10]}
        loading={loading}
        disableSelectionOnClick
      />
    </div>
  );
};

export default ContactsTable;
