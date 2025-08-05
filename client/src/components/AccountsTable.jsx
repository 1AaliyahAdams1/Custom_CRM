import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { MoreVert, Info, Edit, Delete } from '@mui/icons-material';

const AccountsTable = ({
  accounts,
  selected,
  onSelectClick,
  onSelectAllClick,
  isSelected,
  formatAddress,
  formatRevenue,
  formatDate,
  getStatusColor,
  onMenuClick,
  anchorEl,
  menuRowId,
  onMenuClose,
  onView,
  onEdit,
  onDeactivate,
}) => {
  return (
    <>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={selected.length > 0 && selected.length < accounts.length}
                  checked={accounts.length > 0 && selected.length === accounts.length}
                  onChange={onSelectAllClick}
                />
              </TableCell>
              {[
                "ID", "Name", "City ID", "Street Address", "Postal Code", "Phone",
                "Email", "Website", "# Employees", "Annual Revenue", "Created", "Status", "Actions"
              ].map(header => (
                <TableCell key={header} sx={{ fontWeight: 600 }}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((account) => {
              const isItemSelected = isSelected(account.AccountID);
              return (
                <TableRow
                  key={account.AccountID}
                  hover
                  selected={isItemSelected}
                  onClick={() => onSelectClick(account.AccountID)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                    />
                  </TableCell>
                  <TableCell>{account.AccountID}</TableCell>
                  <TableCell>
                    <Tooltip title={account.AccountName || ""}>
                      <span>{account.AccountName || "-"}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{account.CityID || "-"}</TableCell>
                  <TableCell>
                    <Tooltip title={formatAddress(account)}>
                      <span style={{
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 200,
                      }}>
                        {formatAddress(account)}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{account.postal_code || "-"}</TableCell>
                  <TableCell>{account.PrimaryPhone || "-"}</TableCell>
                  <TableCell>{account.email || "-"}</TableCell>
                  <TableCell>
                    {account.Website ? (
                      <a
                        href={account.Website.startsWith('http') ? account.Website : `https://${account.Website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        {account.Website}
                      </a>
                    ) : "-"}
                  </TableCell>
                  <TableCell>{account.number_of_employees || "-"}</TableCell>
                  <TableCell>{formatRevenue(account.annual_revenue)}</TableCell>
                  <TableCell>{formatDate(account.CreatedAt)}</TableCell>
                  <TableCell>
                    <Chip
                      label={account.Active ? "Active" : "Inactive"}
                      sx={{
                        backgroundColor: getStatusColor(account.Active),
                        color: '#fff',
                        fontWeight: 500,
                      }}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => onMenuClick(e, account)}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Menu for actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onMenuClose}
      >
        <MenuItem onClick={() => onView(menuRowId?.AccountID)}>
          <Info sx={{ mr: 2 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => onEdit(menuRowId)}>
          <Edit sx={{ mr: 2 }} />
          Edit Account
        </MenuItem>
        <MenuItem
          onClick={() => onDeactivate(menuRowId?.AccountID)}
          disabled={!menuRowId?.Active}
          sx={{ color: '#dc2626' }}
        >
          <Delete sx={{ mr: 2 }} />
          Delete Account
        </MenuItem>
      </Menu>
    </>
  );
};

export default AccountsTable;
