import React, { useState, useEffect, useRef } from 'react';
import {
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Box,
  Paper,
  MenuItem,
  MenuList,
  Popper,
  ClickAwayListener,
  InputAdornment,
  IconButton
} from '@mui/material';
import { ArrowDropDown, Clear } from '@mui/icons-material';

const SmartDropdown = ({
  label,
  name,
  value,
  onChange,
  service, // Service object with getAll and create methods
  displayField = 'name', // Field to display in dropdown
  valueField = 'id', // Field to use as value
  createFields = [], // Array of field definitions for create dialog
  required = false,
  fullWidth = true,
  customDisplayFormatter = null, // Custom function to format display text
  placeholder = '',
  ...props
}) => {
  const [options, setOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newItemData, setNewItemData] = useState({});
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const anchorRef = useRef(null);
  const inputRef = useRef(null);

  // Load options on component mount
  useEffect(() => {
    loadOptions();
  }, []);

  // Update input value when value prop changes
  useEffect(() => {
    if (value) {
      const selectedOption = options.find(opt => 
        (opt[valueField] || opt.id || opt.ID) === value
      );
      if (selectedOption) {
        setInputValue(formatDisplayText(selectedOption));
      }
    } else {
      setInputValue('');
    }
  }, [value, options]);

  // Filter options based on input
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option => {
        const displayText = formatDisplayText(option).toLowerCase();
        const searchTerm = inputValue.toLowerCase();
        
        // Search in display text
        if (displayText.includes(searchTerm)) return true;
        
        // Search in email for person objects
        if (option.personal_email && option.personal_email.toLowerCase().includes(searchTerm)) return true;
        if (option.PrimaryEmail && option.PrimaryEmail.toLowerCase().includes(searchTerm)) return true;
        
        // Search in mobile for person objects
        if (option.personal_mobile && option.personal_mobile.includes(searchTerm)) return true;
        
        return false;
      });
      setFilteredOptions(filtered);
    }
    setHighlightedIndex(-1);
  }, [inputValue, options]);

  const loadOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await service.getAll();
      setOptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(`Error loading ${label} options:`, err);
      setError(`Failed to load ${label.toLowerCase()} options`);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDisplayText = (option) => {
    if (customDisplayFormatter) {
      return customDisplayFormatter(option);
    }

    // Handle person objects with special formatting
    if (option.first_name && option.surname) {
      const fullName = `${option.first_name} ${option.surname}`;
      const email = option.personal_email || option.PrimaryEmail;
      return email ? `${fullName} (${email})` : fullName;
    }

    // Handle other common patterns
    return option[displayField] || 
           option.name || 
           option.Name || 
           option.AccountName ||
           option.DealName ||
           `Item ${option[valueField] || option.id || option.ID}`;
  };

  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    
    if (!open && newValue) {
      setOpen(true);
    }
    
    // If input is cleared, clear the selection
    if (!newValue) {
      handleSelectionChange(null);
    }
  };

  const handleSelectionChange = (selectedOption) => {
    if (selectedOption === 'OTHER') {
      if (createFields.length === 0) {
        setError(`Cannot create new ${label.toLowerCase()} from this form. Please use the main ${label} management page.`);
        return;
      }
      setDialogOpen(true);
      const initialData = {};
      createFields.forEach(field => {
        initialData[field.name] = field.defaultValue || '';
      });
      setNewItemData(initialData);
      return;
    }

    const syntheticEvent = {
      target: {
        name,
        value: selectedOption ? (selectedOption[valueField] || selectedOption.id || selectedOption.ID) : ''
      }
    };
    onChange(syntheticEvent);
    setOpen(false);
  };

  const handleKeyDown = (event) => {
    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'Enter') {
        setOpen(true);
        return;
      }
    }

    const maxIndex = filteredOptions.length + (createFields.length > 0 ? 1 : 0) - 1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex(prev => prev < maxIndex ? prev + 1 : 0);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : maxIndex);
        break;
      case 'Enter':
        event.preventDefault();
        if (highlightedIndex >= 0) {
          if (highlightedIndex === filteredOptions.length && createFields.length > 0) {
            handleSelectionChange('OTHER');
          } else if (highlightedIndex < filteredOptions.length) {
            handleSelectionChange(filteredOptions[highlightedIndex]);
          }
        } else if (filteredOptions.length === 1) {
          handleSelectionChange(filteredOptions[0]);
        }
        break;
      case 'Escape':
        setOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleClickAway = () => {
    setOpen(false);
    setHighlightedIndex(-1);
  };

  const handleDropdownToggle = () => {
    setOpen(!open);
    if (!open) {
      inputRef.current?.focus();
    }
  };

  const handleClear = () => {
    setInputValue('');
    handleSelectionChange(null);
    inputRef.current?.focus();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setNewItemData({});
    setError(null);
  };

  const handleCreateItem = async () => {
    try {
      setCreating(true);
      setError(null);

      // Validate required fields
      for (const field of createFields) {
        if (field.required && !newItemData[field.name]) {
          throw new Error(`${field.label} is required`);
        }
      }

      // Create the new item
      const result = await service.create(newItemData);
      
      // Reload options to include the new item
      await loadOptions();
      
      // Find the newly created item and select it
      const newItem = result || newItemData;
      const newValue = newItem[valueField] || newItem.id || newItem.ID;
      
      const syntheticEvent = {
        target: {
          name,
          value: newValue
        }
      };
      onChange(syntheticEvent);
      
      handleDialogClose();
    } catch (err) {
      console.error(`Error creating ${label}:`, err);
      setError(err.message || `Failed to create ${label.toLowerCase()}`);
    } finally {
      setCreating(false);
    }
  };

  const handleNewItemFieldChange = (fieldName, value) => {
    setNewItemData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  return (
    <>
      <ClickAwayListener onClickAway={handleClickAway}>
        <FormControl fullWidth={fullWidth} error={!!error} {...props}>
          <TextField
            ref={inputRef}
            name={name}
            label={`${label}${required ? ' *' : ''}`}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => !open && setOpen(true)}
            placeholder={placeholder || `Type to search ${label.toLowerCase()}...`}
            required={required}
            disabled={loading}
            InputProps={{
              ref: anchorRef,
              endAdornment: (
                <InputAdornment position="end">
                  {inputValue && (
                    <IconButton
                      aria-label="clear"
                      onClick={handleClear}
                      edge="end"
                      size="small"
                    >
                      <Clear />
                    </IconButton>
                  )}
                  <IconButton
                    aria-label="toggle dropdown"
                    onClick={handleDropdownToggle}
                    edge="end"
                    size="small"
                  >
                    <ArrowDropDown />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <Popper
            open={open && !loading}
            anchorEl={anchorRef.current}
            style={{ width: anchorRef.current?.clientWidth, zIndex: 1300 }}
            placement="bottom-start"
          >
            <Paper elevation={8} sx={{ maxHeight: 300, overflow: 'auto' }}>
              <MenuList>
                {filteredOptions.length === 0 && !loading ? (
                  <MenuItem disabled>
                    <em>No options found</em>
                  </MenuItem>
                ) : (
                  filteredOptions.map((option, index) => {
                    const optionValue = option[valueField] || option.id || option.ID;
                    return (
                      <MenuItem
                        key={optionValue}
                        selected={highlightedIndex === index}
                        onClick={() => handleSelectionChange(option)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                      >
                        <Box>
                          {formatDisplayText(option)}
                          {/* Show additional info for persons */}
                          {option.personal_email && option.personal_mobile && (
                            <Box sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.5 }}>
                              <Chip 
                                label={option.personal_mobile} 
                                size="small" 
                                variant="outlined" 
                                sx={{ mr: 0.5, height: 20 }} 
                              />
                              {option.PersonCityID && (
                                <Chip 
                                  label={`City ID: ${option.PersonCityID}`} 
                                  size="small" 
                                  variant="outlined" 
                                  sx={{ height: 20 }} 
                                />
                              )}
                            </Box>
                          )}
                        </Box>
                      </MenuItem>
                    );
                  })
                )}
                {createFields.length > 0 && (
                  <MenuItem
                    selected={highlightedIndex === filteredOptions.length}
                    onClick={() => handleSelectionChange('OTHER')}
                    onMouseEnter={() => setHighlightedIndex(filteredOptions.length)}
                    sx={{ fontStyle: 'italic', color: 'primary.main' }}
                  >
                    + Add New {label}
                  </MenuItem>
                )}
              </MenuList>
            </Paper>
          </Popper>

          {error && !dialogOpen && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
        </FormControl>
      </ClickAwayListener>

      {/* Create New Item Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New {label}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {createFields.map((field) => (
            <TextField
              key={field.name}
              name={field.name}
              label={field.label}
              type={field.type || 'text'}
              value={newItemData[field.name] || ''}
              onChange={(e) => handleNewItemFieldChange(field.name, e.target.value)}
              required={field.required}
              fullWidth
              margin="normal"
              multiline={field.multiline}
              rows={field.rows}
              helperText={field.helperText}
              placeholder={field.placeholder}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={creating}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateItem} 
            variant="contained" 
            disabled={creating}
          >
            {creating ? <CircularProgress size={20} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SmartDropdown;