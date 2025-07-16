import React, { useState, useEffect } from "react";
import axios from "axios";
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

// Set base URLs from environment
const baseUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL_ALT;

const DealsFormDialog = ({ open, onClose, deal, onSubmit }) => {
  const isEdit = Boolean(deal?.DealID);

  const emptyForm = {
    DealID: "",
    AccountID: "",
    DealStageID: "",
    DealName: "",
    Value: "",
    CloseDate: "",
    Probability: "",
    CreatedAt: "",
    UpdatedAt: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({}); // Placeholder for validation errors, if needed

  const [accounts, setAccounts] = useState([]);
  const [dealStages, setDealStages] = useState([]);

  useEffect(() => {
    if (isEdit) {
      setFormData(deal);
    } else {
      setFormData(emptyForm);
    }
    setErrors({});

    axios
      .get(`${baseUrl}/account`)
      .then((res) => setAccounts(res.data))
      .catch((err) => console.error("Failed to load accounts:", err));

    axios
      .get(`${baseUrl}/dealstage`)
      .then((res) => setDealStages(res.data))
      .catch((err) => console.error("Failed to load deal stages:", err));
  }, [deal, isEdit]);

 // Empty validation function
  //Add validation into this function 
  const validate = () => {
    const newErrors = {};

    // Validation logic can be added here
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "AccountID" || name === "DealStageID"
          ? value === ""
            ? ""
            : parseInt(value, 10)
          : value,
    }));
  };

  const handleSubmit = async () => {
    if (validate()) {
      try {
        await onSubmit(formData);
        if (!isEdit) setFormData(emptyForm);
      } catch (err) {
        console.error("Submit failed:", err);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{isEdit ? "Edit Deal" : "Add Deal"}</DialogTitle>

      <DialogContent>
        <FormControl margin="dense" fullWidth error={!!errors.AccountID} required>
          <InputLabel id="account-label">Account</InputLabel>
          <Select
            labelId="account-label"
            name="AccountID"
            value={formData.AccountID || ""}
            onChange={handleChange}
            label="Account"
          >
            {accounts.map((account) => (
              <MenuItem key={account.AccountID} value={account.AccountID}>
                {account.AccountName}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.AccountID}</FormHelperText>
        </FormControl>

        <FormControl margin="dense" fullWidth error={!!errors.DealStageID} required>
          <InputLabel id="deal-stage-label">Deal Stage</InputLabel>
          <Select
            labelId="deal-stage-label"
            name="DealStageID"
            value={formData.DealStageID || ""}
            onChange={handleChange}
            label="Deal Stage"
          >
            {dealStages.map((stage) => (
              <MenuItem key={stage.DealStageID} value={stage.DealStageID}>
                {stage.StageName}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.DealStageID}</FormHelperText>
        </FormControl>

        <TextField
          margin="dense"
          label="Deal Name"
          name="DealName"
          value={formData.DealName}
          onChange={handleChange}
          fullWidth
          error={!!errors.DealName}
          helperText={errors.DealName}
          required
        />

        <TextField
          margin="dense"
          label="Value"
          name="Value"
          type="number"
          value={formData.Value}
          onChange={handleChange}
          fullWidth
          error={!!errors.Value}
          helperText={errors.Value}
          required
        />

        <TextField
          margin="dense"
          label="Close Date"
          name="CloseDate"
          type="date"
          value={formData.CloseDate ? formData.CloseDate.split("T")[0] : ""}
          onChange={handleChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
          error={!!errors.CloseDate}
          helperText={errors.CloseDate}
        />

        <TextField
          margin="dense"
          label="Probability (%)"
          name="Probability"
          type="number"
          value={formData.Probability}
          onChange={handleChange}
          fullWidth
          inputProps={{ min: 0, max: 100, step: 1 }}
          error={!!errors.Probability}
          helperText={errors.Probability}
          required
        />

        {/* CreatedAt and UpdatedAt are usually not user-editable, but showing them disabled for info */}
        <TextField
          margin="dense"
          label="Created At"
          name="CreatedAt"
          value={formData.CreatedAt ? formData.CreatedAt.split("T")[0] : ""}
          fullWidth
          InputLabelProps={{ shrink: true }}
          disabled
        />
        <TextField
          margin="dense"
          label="Updated At"
          name="UpdatedAt"
          value={formData.UpdatedAt ? formData.UpdatedAt.split("T")[0] : ""}
          fullWidth
          InputLabelProps={{ shrink: true }}
          disabled
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

export default DealsFormDialog;
