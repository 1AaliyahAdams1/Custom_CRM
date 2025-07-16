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
  FormControlLabel,
  Switch,
  Box,
  Typography,
} from "@mui/material";
import axios from "axios";

// Set base URLs from environment
const baseUrl = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_URL_ALT;

const ContactsFormDialog = ({ open, onClose, contact, onSubmit }) => {
  const isEdit = Boolean(contact?.ContactID);

  const emptyForm = {
    ContactID: "",
    AccountID: "",
    PersonID: "",
    Title: "",
    first_name: "",
    middle_name: "",
    surname: "",
    linkedin_link: "",
    personal_email: "",
    personal_mobile: "",
    PersonCityID: "",
    PersonStateProvinceID: "",
    Still_employed: false,
    JobTitleID: "",
    PrimaryEmail: "",
    PrimaryPhone: "",
    Position: "",
    isNewPerson: true,
  };

  const [jobTitles, setJobTitles] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [accounts, setAccounts] = useState([]);
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const [persons, setPersons] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      Promise.all([
        axios.get(`${baseUrl}/account`),
        axios.get(`${baseUrl}/city`),
        axios.get(`${baseUrl}/stateprovince`),
        axios.get(`${baseUrl}/contact/persons`),
        axios.get(`${baseUrl}/jobtitle`),
      ])
        .then(([accRes, cityRes, stateRes, persRes, jobTitleRes]) => {
          setAccounts(accRes.data);
          setCities(cityRes.data);
          setStates(stateRes.data);
          setPersons(persRes.data);
          setJobTitles(jobTitleRes.data);
        })
        .catch((err) => console.error("Failed to load dropdown data:", err));
    }
  }, [open]);

  useEffect(() => {
    if (isEdit && contact) {
      setFormData({
        ...contact,
        Title: contact.Title || "",
        first_name: contact.first_name || "",
        middle_name: contact.middle_name || "",
        surname: contact.surname || "",
        linkedin_link: contact.linkedin_link || "",
        personal_email: contact.personal_email || "",
        personal_mobile: contact.personal_mobile || "",
        PersonCityID: contact.PersonCityID || contact.CityID || "",
        PersonStateProvinceID: contact.PersonStateProvinceID || "",
        Still_employed: contact.Still_employed || false,
        JobTitleID: contact.JobTitleID || "",
        isNewPerson: false,
      });
    } else {
      setFormData(emptyForm);
    }
    setErrors({});
  }, [contact, isEdit]);

   // Empty validation function
  //Add validation into this function 
  const validate = () => {
    const newErrors = {};
    // Validation logic can be added here
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (
      ["AccountID", "PersonID", "PersonCityID", "PersonStateProvinceID", "JobTitleID"].includes(name)
    ) {
      setFormData((prev) => ({ ...prev, [name]: value ? parseInt(value, 10) : "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePersonModeChange = (e) => {
    const isNew = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      isNewPerson: isNew,
      PersonID: "",
      PersonName: isNew ? prev.PersonName : "",
      PersonCityID: isNew ? prev.PersonCityID : "",
      PersonStateProvinceID: isNew ? prev.PersonStateProvinceID : "",
    }));

    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.PersonID;
      delete copy.PersonName;
      delete copy.PersonCityID;
      delete copy.PersonStateProvinceID;
      return copy;
    });
  };

  const handlePersonSelection = (e) => {
    const selectedId = parseInt(e.target.value, 10);
    const selectedPerson = persons.find((p) => p.PersonID === selectedId) || {};
    setFormData((prev) => ({
      ...prev,
      PersonID: selectedId,
      Title: selectedPerson.Title || "",
      first_name: selectedPerson.first_name || "",
      middle_name: selectedPerson.middle_name || "",
      surname: selectedPerson.surname || "",
      linkedin_link: selectedPerson.linkedin_link || "",
      personal_email: selectedPerson.personal_email || "",
      personal_mobile: selectedPerson.personal_mobile || "",
      PersonCityID: selectedPerson.CityID || "",
      PersonStateProvinceID: selectedPerson.StateProvinceID || "",
    }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const submitData = {
        ...formData,
        PersonCityID: formData.PersonCityID || formData.CityID,
        PersonStateProvinceID: formData.PersonStateProvinceID || null,
      };
      await onSubmit(submitData);
      if (!isEdit) setFormData(emptyForm);
    } catch (err) {
      console.error("Submit failed:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? "Edit Contact" : "Add Contact"}</DialogTitle>

      <DialogContent>
        {/* Account select */}
        <FormControl fullWidth margin="dense" error={!!errors.AccountID} required>
          <InputLabel id="account-label">Account</InputLabel>
          <Select
            labelId="account-label"
            name="AccountID"
            value={formData.AccountID || ""}
            onChange={handleChange}
            label="Account"
          >
            {accounts.map((acc) => (
              <MenuItem key={acc.AccountID} value={acc.AccountID}>
                {acc.AccountName}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{errors.AccountID}</FormHelperText>
        </FormControl>

        {/* Person mode toggle */}
        <Box mt={2} mb={2}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isNewPerson}
                onChange={handlePersonModeChange}
                name="isNewPerson"
              />
            }
            label={
              <Typography variant="body2" color="primary">
                {formData.isNewPerson ? "Create New Person" : "Select Existing Person"}
              </Typography>
            }
          />
        </Box>

        {/* New Person details */}
        {formData.isNewPerson ? (
          <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              New Person Details
            </Typography>

            <TextField
              label="Title"
              name="Title"
              value={formData.Title || ""}
              onChange={handleChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="First Name"
              name="first_name"
              value={formData.first_name || ""}
              onChange={handleChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Middle Name"
              name="middle_name"
              value={formData.middle_name || ""}
              onChange={handleChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="Surname"
              name="surname"
              value={formData.surname || ""}
              onChange={handleChange}
              fullWidth
              margin="dense"
            />
            <TextField
              label="LinkedIn Link"
              name="linkedin_link"
              value={formData.linkedin_link || ""}
              onChange={handleChange}
              fullWidth
              margin="dense"
            />

            <TextField
              label="Personal Email"
              name="personal_email"
              type="email"
              value={formData.personal_email || ""}
              onChange={handleChange}
              fullWidth
              margin="dense"
            />

            <TextField
              label="Personal Mobile"
              name="personal_mobile"
              value={formData.personal_mobile || ""}
              onChange={handleChange}
              fullWidth
              margin="dense"
            />

            {/* City select */}
            <FormControl fullWidth margin="dense" error={!!errors.PersonCityID} required>
              <InputLabel id="person-city-label">City</InputLabel>
              <Select
                labelId="person-city-label"
                name="PersonCityID"
                value={formData.PersonCityID || ""}
                onChange={handleChange}
                label="City"
              >
                {cities.map((city) => (
                  <MenuItem key={city.CityID} value={city.CityID}>
                    {city.CityName}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.PersonCityID}</FormHelperText>
            </FormControl>

            {/* StateProvince select */}
            <FormControl fullWidth margin="dense" error={!!errors.PersonStateProvinceID}>
              <InputLabel id="person-state-label">State / Province</InputLabel>
              <Select
                labelId="person-state-label"
                name="PersonStateProvinceID"
                value={formData.PersonStateProvinceID || ""}
                onChange={handleChange}
                label="State / Province"
              >
                {states.map((state) => (
                  <MenuItem key={state.StateProvinceID} value={state.StateProvinceID}>
                    {state.StateProvince_Name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.PersonStateProvinceID}</FormHelperText>
            </FormControl>
          </Box>
        ) : (
          // Existing Person selection
          <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Select Existing Person
            </Typography>

            <FormControl fullWidth margin="dense" error={!!errors.PersonID} required>
              <InputLabel id="person-label">Person</InputLabel>
              <Select
                labelId="person-label"
                name="PersonID"
                value={formData.PersonID || ""}
                onChange={handlePersonSelection}
                label="Person"
              >
                {persons.map((person) => (
                  <MenuItem key={person.PersonID} value={person.PersonID}>
                    {person.PersonName} {person.CityName && `(${person.CityName})`}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.PersonID}</FormHelperText>
            </FormControl>

            {/* Show selected person info */}
            {formData.PersonID && (
              <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
                <Typography variant="body2" color="textSecondary">
                  Selected Person: <strong>{formData.first_name} {formData.surname}</strong>{" "}
                  {formData.PersonCityID &&
                    cities.find((c) => c.CityID === formData.PersonCityID)?.CityName && (
                      <span>- {cities.find((c) => c.CityID === formData.PersonCityID).CityName}</span>
                    )}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Contact details */}
        <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 2 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Contact Details
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={!!formData.Still_employed}
                onChange={handleChange}
                name="Still_employed"
              />
            }
            label="Still Employed"
          />

          <FormControl fullWidth margin="dense" error={!!errors.JobTitleID}>
            <InputLabel id="jobtitle-label">Job Title</InputLabel>
            <Select
              labelId="jobtitle-label"
              name="JobTitleID"
              value={formData.JobTitleID || ""}
              onChange={handleChange}
              label="Job Title"
            >
              {jobTitles.map((job) => (
                <MenuItem key={job.JobTitleID} value={job.JobTitleID}>
                  {job.JobTitleName}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.JobTitleID}</FormHelperText>
          </FormControl>

          <TextField
            label="Email"
            name="PrimaryEmail"
            type="email"
            value={formData.PrimaryEmail || ""}
            onChange={handleChange}
            fullWidth
            margin="dense"
            error={!!errors.PrimaryEmail}
            helperText={errors.PrimaryEmail}
          />

          <TextField
            label="Phone"
            name="PrimaryPhone"
            value={formData.PrimaryPhone || ""}
            onChange={handleChange}
            fullWidth
            margin="dense"
            error={!!errors.PrimaryPhone}
            helperText={errors.PrimaryPhone}
          />

          <TextField
            label="Position"
            name="Position"
            value={formData.Position || ""}
            onChange={handleChange}
            fullWidth
            margin="dense"
            error={!!errors.Position}
            helperText={errors.Position}
          />
        </Box>
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

export default ContactsFormDialog;
