import React, { useState, useEffect, useRef } from 'react';
import {
  FormControl,
  InputLabel,
  TextField,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  ClickAwayListener,
  InputAdornment,
  IconButton,
  Alert,
  Box
} from '@mui/material';
import { ArrowDropDown, Clear } from '@mui/icons-material';

const SmartDropdown = ({
  label,
  name,
  value,
  onChange,
  service,
  displayField = 'name',
  valueField = 'id',
  required = false,
  fullWidth = true,
  customDisplayFormatter = null,
  placeholder = '',
  onCreateNewClick = null,
  ...props
}) => {
  const [options, setOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const anchorRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadOptions();
  }, []);

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

  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option => {
        const displayText = formatDisplayText(option).toLowerCase();
        const searchTerm = inputValue.toLowerCase();
        return displayText.includes(searchTerm);
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
    if (customDisplayFormatter) return customDisplayFormatter(option);
    return option[displayField] || option.name || option.Name || `Item ${option[valueField] || option.id || option.ID}`;
  };

  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    if (!open && newValue) setOpen(true);
    if (!newValue) handleSelectionChange(null);
  };

  const handleSelectionChange = (selectedOption) => {
    if (selectedOption === 'OTHER') {
      if (typeof onCreateNewClick === 'function') {
        onCreateNewClick();
      } else {
        setError(`No create handler provided for ${label}.`);
      }
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
    const maxIndex = filteredOptions.length;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % (maxIndex + 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + maxIndex + 1) % (maxIndex + 1));
        break;
      case 'Enter':
        event.preventDefault();
        if (highlightedIndex === filteredOptions.length) {
          handleSelectionChange('OTHER');
        } else if (highlightedIndex >= 0) {
          handleSelectionChange(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setOpen(false);
        break;
    }
  };

  const handleClickAway = () => {
    setOpen(false);
    setHighlightedIndex(-1);
  };

  const handleDropdownToggle = () => {
    setOpen(!open);
    if (!open) inputRef.current?.focus();
  };

  const handleClear = () => {
    setInputValue('');
    handleSelectionChange(null);
    inputRef.current?.focus();
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
            onFocus={() => setOpen(true)}
            placeholder={placeholder || `Type to search ${label.toLowerCase()}...`}
            required={required}
            disabled={loading}
            InputProps={{
              ref: anchorRef,
              endAdornment: (
                <InputAdornment position="end">
                  {inputValue && (
                    <IconButton onClick={handleClear} size="small">
                      <Clear />
                    </IconButton>
                  )}
                  <IconButton onClick={handleDropdownToggle} size="small">
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
                {filteredOptions.length === 0 && (
                  <MenuItem disabled><em>No options found</em></MenuItem>
                )}
                {filteredOptions.map((option, index) => (
                  <MenuItem
                    key={option[valueField] || option.id || option.ID}
                    selected={highlightedIndex === index}
                    onClick={() => handleSelectionChange(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    {formatDisplayText(option)}
                  </MenuItem>
                ))}
                {onCreateNewClick && (
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

          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>
          )}
        </FormControl>
      </ClickAwayListener>
    </>
  );
};

export default SmartDropdown;
