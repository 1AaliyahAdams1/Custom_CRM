import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
} from '@mui/material';

const ColumnsDialog = ({ 
  open, 
  visibleColumns, 
  onClose, 
  onSave 
}) => {
  const [tempVisibleColumns, setTempVisibleColumns] = React.useState({});

  // Sync temp state with visibleColumns when dialog opens
  useEffect(() => {
    if (open) {
      setTempVisibleColumns(visibleColumns);
    }
  }, [open, visibleColumns]);

  const toggleColumn = (field) => {
    setTempVisibleColumns((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Show / Hide Columns</DialogTitle>
      <DialogContent dividers>
        {Object.entries(tempVisibleColumns).map(([field, isVisible]) => (
          <FormControlLabel
            key={field}
            control={
              <Checkbox
                checked={isVisible}
                onChange={() => toggleColumn(field)}
                color="primary"
              />
            }
            label={field}
          />
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() => onSave(tempVisibleColumns)}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColumnsDialog;
