import React, { useState, useEffect, useRef } from 'react';
import {
  FormControl,
  TextField,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  ClickAwayListener,
  InputAdornment,
  IconButton,
  Alert
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

  const formatDisplayText = (option) => {
    if (customDisplayFormatter) return customDisplayFormatter(option);
    return option[displayField] || option.name || option.Name || `Item ${option[valueField] || option.id || option.ID}`;
  };

  // Load options once on mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`🔍 SmartDropdown (${label}): Loading options from service`);
        const data = await service.getAll();
        console.log(`🔍 SmartDropdown (${label}): Raw data from service:`, data);
        const opts = Array.isArray(data) ? data : [];
        console.log(`🔍 SmartDropdown (${label}): Processed options:`, opts);
        console.log(`🔍 SmartDropdown (${label}): Options count:`, opts.length);
        console.log(`🔍 SmartDropdown (${label}): Display field: ${displayField}, Value field: ${valueField}`);
        
        if (opts.length > 0) {
          console.log(`🔍 SmartDropdown (${label}): First option sample:`, opts[0]);
          console.log(`🔍 SmartDropdown (${label}): First option display value:`, opts[0][displayField]);
          console.log(`🔍 SmartDropdown (${label}): First option value:`, opts[0][valueField]);
        }
        
        setOptions(opts);
      } catch (err) {
        console.error(`❌ SmartDropdown (${label}): Error loading options:`, err);
        setError(`Failed to load ${label.toLowerCase()} options`);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };
    loadOptions();
  }, [service, label, displayField, valueField]);

  // Update inputValue when value prop or options change
  useEffect(() => {
    // Wait for options to be loaded
    if (loading) return;

    if (value != null && value !== '') {
      const numericValue = Number(value);
      const selectedOption = options.find(opt => {
        const optValue = opt[valueField] || opt.id || opt.ID;
        return Number(optValue) === numericValue;
      });
      
      if (selectedOption) {
        const displayText = formatDisplayText(selectedOption);
        setInputValue(displayText);
      } else {
        // Option not found - might still be loading or invalid value
        console.warn(`No option found for value: ${value} in ${label}`);
        // Don't clear the input - keep the previous value
      }
    } else {
      setInputValue('');
    }
  }, [value, options, loading, valueField, displayField]);

  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    if (!open && newValue) setOpen(true);
    
    // Don't clear the selection unless user explicitly clears the input
    if (!newValue) {
      handleSelectionChange(null);
    }
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

    const rawValue = selectedOption
      ? (selectedOption[valueField] || selectedOption.id || selectedOption.ID)
      : '';

    // Convert to number or empty string, not null
    const finalValue = rawValue !== '' ? Number(rawValue) : '';
    
    onChange({ target: { name, value: finalValue } });
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
      default:
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

  useEffect(() => {
    // Filter options based on input
    console.log(`🔍 SmartDropdown (${label}): Filtering options. Input: "${inputValue}", Options count: ${options.length}`);
    
    if (!inputValue.trim()) {
      console.log(`🔍 SmartDropdown (${label}): No input, showing all options`);
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option => {
        const displayText = formatDisplayText(option);
        const matches = displayText.toLowerCase().includes(inputValue.toLowerCase());
        console.log(`🔍 SmartDropdown (${label}): Option "${displayText}" matches "${inputValue}": ${matches}`);
        return matches;
      });
      console.log(`🔍 SmartDropdown (${label}): Filtered options count: ${filtered.length}`);
      setFilteredOptions(filtered);
    }
    setHighlightedIndex(-1);
  }, [inputValue, options, label, displayField, valueField]);

  return (
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
              {filteredOptions.length === 0 && <MenuItem disabled><em>No options found</em></MenuItem>}
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

        {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
      </FormControl>
    </ClickAwayListener>
  );
};

export default SmartDropdown;