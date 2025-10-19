import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Toolbar,
  FormControl,
  MenuItem,
  Select,
  Tooltip,
} from "@mui/material";
import { Add, Info } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import TableView from "../../components/tableFormat/TableView";
import { formatters } from "../../utils/formatters";

const SequenceItemsPage = ({
  sequenceItems = [],
  sequences = [],
  activityTypes = [],
  loading = false,
  error,
  setError,
  successMessage,
  setSuccessMessage,
  selected = [],
  onSelectClick,
  onSelectAllClick,
  onFilterChange,
  currentFilter = "all",
  onDeactivate,
  onReactivate,
  onBulkDeactivate,
  onEdit,
  onView,
  onCreate,
}) => {
  const theme = useTheme();
  const [sequenceItemsFilter, setSequenceItemsFilter] = useState(currentFilter);

  // Lookup maps
  const sequenceMap = React.useMemo(() => {
    const map = {};
    sequences.forEach((sequence) => {
      const id = sequence.SequenceID;
      if (id) {
        map[id] = {
          name: sequence.SequenceName,
          description: sequence.SequenceDescription,
        };
      }
    });
    return map;
  }, [sequences]);

  const activityTypeMap = React.useMemo(() => {
    const map = {};
    activityTypes.forEach((type) => {
      const id = type.TypeID;
      if (id) {
        map[id] = {
          name: type.TypeName,
          description: type.Description,
        };
      }
    });
    return map;
  }, [activityTypes]);

  // Enriched items
  const enhancedItems = React.useMemo(() => {
    return sequenceItems.map((item) => {
      const seqInfo = sequenceMap[item.SequenceID];
      const actInfo = activityTypeMap[item.ActivityTypeID];
      return {
        ...item,
        SequenceName: seqInfo?.name || "Unknown Sequence",
        ActivityTypeName: actInfo?.name || "Unknown Type",
        ActivityTypeDescription: actInfo?.description || "",
      };
    });
  }, [sequenceItems, sequenceMap, activityTypeMap]);

  // Filter logic
  const filteredSequenceItems = React.useMemo(() => {
    if (!enhancedItems) return [];
    switch (sequenceItemsFilter) {
      case "active":
        return enhancedItems.filter((i) => i.Active === true || i.Active === 1);
      case "inactive":
        return enhancedItems.filter((i) => !i.Active || i.Active === 0);
      default:
        return enhancedItems;
    }
  }, [enhancedItems, sequenceItemsFilter]);

  // Columns
  const columns = [
    { field: "SequenceName", headerName: "Sequence", type: "tooltip", defaultVisible: true },
    { field: "ActivityTypeName", headerName: "Activity Type", defaultVisible: true },
    { field: "SequenceItemDescription", headerName: "Description", type: "truncated", defaultVisible: true },
    { field: "DaysFromStart", headerName: "Days From Start", defaultVisible: true },
    { field: "Active", headerName: "Status", defaultVisible: true },
  ];

  // Formatters
  const itemFormatters = {
    ...formatters,
    Active: (value) => {
      const isActive = value === true || value === 1;
      return (
        <Chip
          label={isActive ? "Active" : "Inactive"}
          size="small"
          sx={{
            backgroundColor: isActive
              ? theme.palette.success.main
              : theme.palette.grey[500],
            color: theme.palette.common.white,
            fontWeight: 500,
          }}
        />
      );
    },
    DaysFromStart: (value) => (
      <Typography variant="body2">Day {value}</Typography>
    ),
    ActivityTypeName: (value, row) => (
      <Tooltip title={row?.ActivityTypeDescription || value} arrow>
        <Typography variant="body2">{value}</Typography>
      </Tooltip>
    ),
  };

  // Filter select handling
  const handleFilterChange = (event) => {
    const newFilter = event.target.value;
    setSequenceItemsFilter(newFilter);
    if (onFilterChange) onFilterChange(newFilter);
  };

  useEffect(() => {
    setSequenceItemsFilter(currentFilter);
  }, [currentFilter]);

  const filterOptions = [
    { value: "all", label: "All Sequence Items" },
    { value: "active", label: "Active Sequence Items" },
    { value: "inactive", label: "Inactive Sequence Items" },
  ];

  return (
    <>
      {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
      {successMessage && (
        <Alert severity="success" sx={{ m: 2 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      <Toolbar
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          py: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Sequence Items
          </Typography>
          <Tooltip title="Individual activity steps within sequences" arrow>
            <Info sx={{ fontSize: 18, color: theme.palette.text.secondary, cursor: "help" }} />
          </Tooltip>

          <FormControl size="small" sx={{ minWidth: 180, ml: 2 }}>
            <Select value={sequenceItemsFilter} onChange={handleFilterChange}>
              {filterOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button variant="contained" startIcon={<Add />} onClick={onCreate} disabled={loading}>
            Add Item
          </Button>
          {selected.length > 0 && (
            <Button variant="outlined" color="warning" onClick={onBulkDeactivate}>
              Deactivate Selected
            </Button>
          )}
        </Box>
      </Toolbar>

      {loading ? (
        <Box display="flex" justifyContent="center" p={8}>
          <CircularProgress />
        </Box>
      ) : (
        <TableView
          data={filteredSequenceItems}
          columns={columns}
          idField="SequenceItemID"
          selected={selected}
          onSelectClick={onSelectClick}
          onSelectAllClick={onSelectAllClick}
          showSelection={true}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDeactivate}
          onReactivate={onReactivate}
          formatters={itemFormatters}
          entityType="sequence-item"
          tooltips={{
            search: "Search sequence items by description",
            filter: "Show/hide advanced filtering options",
            columns: "Customize which columns are visible in the table",
            actionMenu: {
              view: "View detailed information for this sequence item",
              edit: "Edit this sequence item's information",
              delete: "Deactivate this sequence item",
              reactivate: "Reactivate this sequence item"
            }
          }}
        />
      )}

      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Showing {filteredSequenceItems.length} sequence items
        </Typography>
        {selected.length > 0 && (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {selected.length} selected
          </Typography>
        )}
      </Box>
    </>
  );
};

export default SequenceItemsPage;