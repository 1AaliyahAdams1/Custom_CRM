import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import axios from "axios";

// Set base URLs from environment
const baseUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL_ALT;

const ActivitiesFormDialog = ({ open, onClose, activity, onSubmit }) => {
  const isEdit = Boolean(activity?.ActivityID);

  const emptyForm = {
    ActivityID: "",
    ActvityType: "",
    AccountName: "",
    Due_date: "",
    Priority: "",
  };

  const [formData, setFormData] = useState(activity || emptyForm);
  const [accounts, setAccounts] = useState([]);
  const [types, setTypes] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      axios.get(`${baseUrl}/account`)
        .then(res => setAccounts(res.data))
        .catch(err => console.error("Failed to load accounts:", err));

      axios.get(`${baseUrl}/activitytype`)
        .then(res => setTypes(res.data))
        .catch(err => console.error("Failed to load activity types:", err));
    }
  }, [open]);

  useEffect(() => {
    if (isEdit && activity) {
      setFormData(activity);
    } else {
      setFormData(emptyForm);
    }
    setErrors({});
  }, [activity, isEdit, open]);

  // Empty validation function
  //Add validation into this function 
  const validate = () => {
    const newErrors = {};
    // Example: if (!formData.AccountID) newErrors.AccountID = "Account is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await onSubmit(formData);
      if (!isEdit) setFormData(emptyForm);
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? "Edit Activity" : "Add Activity"}</DialogTitle>
      <DialogContent>

        <FormControl margin="dense" fullWidth error={!!errors.AccountID} required>
          <InputLabel id="account-label">Account</InputLabel>
          <Select
            labelId="account-label"
            name="AccountID"
            value={formData.AccountID}
            onChange={handleChange}
          >
            {accounts.map(account => (
              <MenuItem key={account.AccountID} value={account.AccountID}>
                {account.AccountName}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.AccountID}</FormHelperText>
        </FormControl>

        <FormControl margin="dense" fullWidth error={!!errors.TypeID} required>
          <InputLabel id="type-label">Activity Type</InputLabel>
          <Select
            labelId="type-label"
            name="TypeID"
            value={formData.TypeID}
            onChange={handleChange}
          >
            {types.map(type => (
              <MenuItem key={type.TypeID} value={type.TypeID}>
                {type.TypeName}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.TypeID}</FormHelperText>
        </FormControl>

        <TextField
          margin="dense"
          label="Due Date"
          name="Due_date"
          type="date"
          value={formData.Due_date ? formData.Due_date.split("T")[0] : ""}
          onChange={handleChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
          error={!!errors.Due_date}
          helperText={errors.Due_date}
        />

        <TextField
          margin="dense"
          label="Priority"
          name="Priority"
          type="number"
          value={formData.Priority || ""}
          onChange={handleChange}
          fullWidth
          inputProps={{ min: 0 }}
          error={!!errors.Priority}
          helperText={errors.Priority}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {isEdit ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActivitiesFormDialog;
