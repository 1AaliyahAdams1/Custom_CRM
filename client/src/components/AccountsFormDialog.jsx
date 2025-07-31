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
  Grid,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const baseUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL_ALT;

const AccountFormDialog = ({ open, onClose, account, onSubmit }) => {
  const isEdit = Boolean(account?.AccountID);

  const emptyForm = {
    AccountName: "",
    CityID: "",
    street_address1: "",
    street_address2: "",
    street_address3: "",
    postal_code: "",
    PrimaryPhone: "",
    IndustryID: "",
    Website: "",
    fax: "",
    email: "",
    number_of_employees: "",
    annual_revenue: "",
    number_of_venues: "",
    number_of_releases: "",
    number_of_events_anually: "",
    ParentAccount: "",
  };

  const [formData, setFormData] = useState(account || emptyForm);
  const [cities, setCities] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [dropdownsLoading, setDropdownsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      if (isEdit) {
        setFormData(account);
      } else {
        setFormData(emptyForm);
      }
      setErrors({});
      loadDropdownData();
    }
  }, [account, isEdit, open]);

  const loadDropdownData = async () => {
    setDropdownsLoading(true);
    try {
      const [citiesRes, industriesRes] = await Promise.all([
        axios.get(`${baseUrl}/city`).catch(err => {
          console.error("Failed to load cities:", err);
          return { data: [] };
        }),
        axios.get(`${baseUrl}/industry`).catch(err => {
          console.error("Failed to load industries:", err);
          return { data: [] };
        })
      ]);
      
      setCities(citiesRes.data || []);
      setIndustries(industriesRes.data || []);
    } catch (error) {
      console.error("Error loading dropdown data:", error);
    } finally {
      setDropdownsLoading(false);
    }
  };

  // Enhanced validation function
  const validate = () => {
    const newErrors = {};
    
    // Required field validation
    if (!formData.AccountName?.trim()) {
      newErrors.AccountName = "Account name is required";
    } else if (formData.AccountName.length > 255) {
      newErrors.AccountName = "Account name must be less than 255 characters";
    }
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    // Phone validation (basic)
    if (formData.PrimaryPhone && formData.PrimaryPhone.length > 63) {
      newErrors.PrimaryPhone = "Phone number must be less than 63 characters";
    }
    
    // Website validation
    if (formData.Website && !isValidUrl(formData.Website)) {
      newErrors.Website = "Invalid website URL";
    }
    
    // Numeric field validation
    if (formData.number_of_employees && (formData.number_of_employees < 0 || formData.number_of_employees > 2147483647)) {
      newErrors.number_of_employees = "Must be a positive number";
    }
    
    if (formData.annual_revenue && formData.annual_revenue < 0) {
      newErrors.annual_revenue = "Must be a positive number";
    }
    
    if (formData.number_of_venues && (formData.number_of_venues < 0 || formData.number_of_venues > 32767)) {
      newErrors.number_of_venues = "Must be between 0 and 32767";
    }
    
    if (formData.number_of_releases && (formData.number_of_releases < 0 || formData.number_of_releases > 32767)) {
      newErrors.number_of_releases = "Must be between 0 and 32767";
    }
    
    if (formData.number_of_events_anually && (formData.number_of_events_anually < 0 || formData.number_of_events_anually > 32767)) {
      newErrors.number_of_events_anually = "Must be between 0 and 32767";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      // Allow URLs with or without protocol
      const url = string.startsWith('http') ? string : `https://${string}`;
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        [
          "CityID",
          "IndustryID",
          "number_of_employees",
          "annual_revenue",
          "number_of_venues",
          "number_of_releases",
          "number_of_events_anually",
          "ParentAccount"
        ].includes(name)
          ? value === "" ? "" : Number(value)
          : value,
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      if (!isEdit) setFormData(emptyForm);
    } catch (error) {
      console.error("Submission failed:", error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setErrors({});
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? "Edit Account" : "Add Account"}</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Account Name"
          name="AccountName"
          value={formData.AccountName || ""}
          onChange={handleChange}
          fullWidth
          error={!!errors.AccountName}
          helperText={errors.AccountName}
        />

        <FormControl margin="dense" fullWidth error={!!errors.CityID}>
          <InputLabel id="city-label">City</InputLabel>
          <Select
            labelId="city-label"
            name="CityID"
            value={formData.CityID || ""}
            onChange={handleChange}
          >
            {cities.map((city) => (
              <MenuItem key={city.CityID} value={city.CityID}>
                {city.CityName}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.CityID}</FormHelperText>
        </FormControl>

        <TextField
          margin="dense"
          label="Street Address 1"
          name="street_address1"
          value={formData.street_address1 || ""}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          margin="dense"
          label="Street Address 2"
          name="street_address2"
          value={formData.street_address2 || ""}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          margin="dense"
          label="Street Address 3"
          name="street_address3"
          value={formData.street_address3 || ""}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          margin="dense"
          label="Postal Code"
          name="postal_code"
          value={formData.postal_code || ""}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          margin="dense"
          label="Primary Phone"
          name="PrimaryPhone"
          value={formData.PrimaryPhone || ""}
          onChange={handleChange}
          fullWidth
        />

        <FormControl margin="dense" fullWidth error={!!errors.IndustryID}>
          <InputLabel id="industry-label">Industry</InputLabel>
          <Select
            labelId="industry-label"
            name="IndustryID"
            value={formData.IndustryID || ""}
            onChange={handleChange}
          >
            {industries.map((industry) => (
              <MenuItem key={industry.IndustryID} value={industry.IndustryID}>
                {industry.IndustryName}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.IndustryID}</FormHelperText>
        </FormControl>

        <TextField
          margin="dense"
          label="Website"
          name="Website"
          value={formData.Website || ""}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          margin="dense"
          label="Fax"
          name="fax"
          value={formData.fax || ""}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          margin="dense"
          label="Email"
          name="email"
          value={formData.email || ""}
          onChange={handleChange}
          fullWidth
          error={!!errors.email}
          helperText={errors.email}
        />
        <TextField
          margin="dense"
          label="Number of Employees"
          name="number_of_employees"
          type="number"
          value={formData.number_of_employees || ""}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          margin="dense"
          label="Annual Revenue"
          name="annual_revenue"
          type="number"
          value={formData.annual_revenue || ""}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          margin="dense"
          label="Number of Venues"
          name="number_of_venues"
          type="number"
          value={formData.number_of_venues || ""}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          margin="dense"
          label="Number of Releases"
          name="number_of_releases"
          type="number"
          value={formData.number_of_releases || ""}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          margin="dense"
          label="Number of Events Annually"
          name="number_of_events_anually"
          type="number"
          value={formData.number_of_events_anually || ""}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          margin="dense"
          label="Parent Account"
          name="ParentAccount"
          value={formData.ParentAccount || ""}
          onChange={handleChange}
          fullWidth
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

export default AccountFormDialog;
