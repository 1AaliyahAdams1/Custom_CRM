import React, { useState } from "react";
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
  Select,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { Add, Info } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import TableView from '../../components/tableFormat/TableView';
import { formatters } from '../../utils/formatters';
import AddMemberDialog from '../../components/dialogs/AddMemberDialog';

const TeamsPage = ({
  teams = [],
  loading = false,
  error,
  successMessage,
  setSuccessMessage,
  setError,
  selected = [],
  onSelectClick,
  onSelectAllClick,
  onDeactivate,
  onReactivate,
  onEdit,
  onView,
  onCreate,
  onAddNote,
  onAddAttachment,
  onAddMember,
  onFilterChange,
  userRoles = [],
}) => {
 
  const navigate = useNavigate();
  const theme = useTheme();
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const columns = [
    { field: "TeamName", headerName: "Team Name", type: "text", defaultVisible: true },
    { field: "CreatedAt", headerName: "Created", type: "dateTime", defaultVisible: true },
    {
      field: "Active",
      headerName: "Status",
      type: "chip",
      chipLabels: { true: "Active", false: "Inactive" },
      chipColors: { true: "#079141ff", false: "#999999" },
      defaultVisible: true,
    }
  ];

  const [teamFilter, setTeamFilter] = useState("all");

  const handleFilterChange = (event) => {
    const newFilter = event.target.value;
    setTeamFilter(newFilter);
    
    if (onFilterChange) {
      onFilterChange(newFilter);
    }
  };

  const filterOptions = [
    { value: "all", label: "All Teams" },
    { value: "active", label: "Active Teams" },
    { value: "inactive", label: "Inactive Teams" },
    { value: "myTeams", label: "My Teams" },
  ];

  const handleAddMemberClick = (team) => {
    setSelectedTeam(team);
    setAddMemberDialogOpen(true);
  };

  return (
    <Box sx={{ 
      width: "100%", 
      backgroundColor: theme.palette.background.default,
      minHeight: "100vh", 
      p: 3 
    }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccessMessage && setSuccessMessage("")}
        >
          {successMessage}
        </Alert>
      )}

      <Paper sx={{ width: "100%", mb: 2, borderRadius: 2, overflow: "hidden" }}>
        <Toolbar sx={{ 
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          justifyContent: "space-between", 
          flexWrap: "wrap", 
          gap: 2, 
          py: 2 
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h6" component="div" sx={{ 
                color: theme.palette.text.primary,
                fontWeight: 600 
              }}>
                Teams
              </Typography>
              <Tooltip title="Manage and view all teams in the system" arrow>
                <Info sx={{ 
                  fontSize: 18, 
                  color: theme.palette.text.secondary,
                  cursor: "help" 
                }} />
              </Tooltip>
            </Box>

            {/* Team Filter Dropdown */}
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <Select
                value={teamFilter}
                onChange={handleFilterChange}
                displayEmpty
                sx={{ 
                  backgroundColor: theme.palette.background.paper,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.divider,
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.text.secondary,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                {filterOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selected.length > 0 && (
              <Tooltip title={`${selected.length} team${selected.length === 1 ? "" : "s"} selected for operations`} arrow>
                <Chip
                  label={`${selected.length} selected`}
                  size="small"
                  sx={{ 
                    backgroundColor: theme.palette.mode === "dark" ? "#333" : "#e0e0e0",
                    color: theme.palette.text.primary
                  }}
                />
              </Tooltip>
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <Tooltip title="Create a new team in the system" arrow>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onCreate}
              >
                Add Team
              </Button>
            </Tooltip>
          </Box>
        </Toolbar>

        {loading ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={8}>
            <CircularProgress />
            <Tooltip title="Loading team data from the database" arrow>
              <Typography variant="body2" sx={{ 
                mt: 2, 
                color: theme.palette.text.secondary
              }}>
                Loading teams...
              </Typography>
            </Tooltip>
          </Box>
        ) : (
          <TableView
            data={teams}
            columns={columns}
            idField="TeamID"
            selected={selected}
            onSelectClick={onSelectClick}
            onSelectAllClick={onSelectAllClick}
            showSelection={true}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDeactivate}
            onReactivate={onReactivate}
            onAddMember={handleAddMemberClick}
            formatters={formatters}
            entityType="team"
            tooltips={{
              search: "Search teams by name, manager, or city",
              filter: "Show/hide advanced filtering options",
              columns: "Customize which columns are visible in the table",
              actionMenu: {
                view: "View detailed information and members for this team",
                edit: "Edit this team's information",
                delete: "Deactivate this team record",
                addNote: "Add internal notes or comments",
                addAttachment: "Attach files or documents"
              }
            }}
          />
        )}

        <Box sx={{ 
          p: 2, 
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default,
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}>
          <Tooltip title="Total number of teams currently displayed in the table" arrow>
            <Typography variant="body2" sx={{ 
              color: theme.palette.text.secondary,
              cursor: "help" 
            }}>
              Showing {teams.length} teams
            </Typography>
          </Tooltip>
          {selected.length > 0 && (
            <Tooltip title="Number of teams currently selected for operations" arrow>
              <Typography variant="body2" sx={{ 
                color: theme.palette.text.primary,
                fontWeight: 500, 
                cursor: "help" 
              }}>
                {selected.length} selected
              </Typography>
            </Tooltip>
          )}
        </Box>
      </Paper>

      {/* Add Member Dialog */}
      <AddMemberDialog
        open={addMemberDialogOpen}
        onClose={() => setAddMemberDialogOpen(false)}
        onAddMember={onAddMember}
        menuRow={selectedTeam}
      />
    </Box>
  );
};

export default TeamsPage;