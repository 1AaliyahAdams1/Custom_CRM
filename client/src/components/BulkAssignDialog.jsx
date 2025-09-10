import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import { getAllEmployees } from '../services/employeeService';

const BulkAssignDialog = ({
  open,
  onClose,
  selectedItems = [],
  onConfirm,
  loading = false,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch employees from API
  const fetchEmployees = async () => {
    setEmployeesLoading(true);
    try {
      const response = await getAllEmployees();
    console.log('Employee API response:', response); // Debug log
    
    // Filter for active employees only 
    const activeEmployees = Array.isArray(response) 
      ? response.filter(emp => emp.Active !== false)
      : [];
    
    console.log('Active employees:', activeEmployees); // Debug log
    setEmployees(activeEmployees);
    } catch (err) {
      setError('Failed to load employees. Please implement the employee API endpoint.');
      console.error('Employee fetch error:', err);
    } finally {
      setEmployeesLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchEmployees();
    }
  }, [open]);

  const handleConfirm = () => {
    if (!selectedEmployee) {
      setError('Please select an employee');
      return;
    }
    onConfirm(selectedEmployee);
  };

  const handleClose = () => {
    setSelectedEmployee('');
    setError('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 2,
          backgroundColor: 'white',
          color: 'black'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        pb: 1,
        color: 'black'
      }}>
        Bulk Assign Accounts
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              backgroundColor: 'white',
              color: 'black',
              border: '1px solid black',
              '& .MuiAlert-icon': {
                color: 'black'
              }
            }}
          >
            {error}
          </Alert>
        )}

        <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
          Assign {selectedItems.length} selected account{selectedItems.length !== 1 ? 's' : ''} to an employee:
        </Typography>

        {/* Selected accounts preview */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'black' }}>
            Selected Accounts:
          </Typography>
          <Box sx={{ 
            maxHeight: 150, 
            overflow: 'auto', 
            border: '1px solid black', 
            borderRadius: 1,
            backgroundColor: '#f9f9f9'
          }}>
            <List dense>
              {selectedItems.slice(0, 10).map((account, index) => (
                <ListItem key={account.AccountID || index}>
                  <ListItemText 
                    primary={account.AccountName}
                    secondary={`${account.CityName || 'Unknown'}, ${account.CountryName || 'Unknown'}`}
                    sx={{
                      '& .MuiListItemText-primary': { color: 'black' },
                      '& .MuiListItemText-secondary': { color: '#666' }
                    }}
                  />
                </ListItem>
              ))}
              {selectedItems.length > 10 && (
                <ListItem>
                  <ListItemText 
                    primary={`... and ${selectedItems.length - 10} more accounts`}
                    sx={{ 
                      fontStyle: 'italic',
                      '& .MuiListItemText-primary': { color: '#666' }
                    }}
                  />
                </ListItem>
              )}
            </List>
          </Box>
        </Box>

        {/* Employee selection */}
        <FormControl fullWidth>
          <InputLabel sx={{ 
            color: 'black',
            '&.Mui-focused': {
              color: 'black'
            }
          }}>Assign to Employee</InputLabel>
          <Select
            value={selectedEmployee}
            label="Assign to Employee"
            onChange={(e) => setSelectedEmployee(e.target.value)}
            disabled={employeesLoading || loading}
            sx={{
              color: 'black',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'black',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'black',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'black',
              },
              '& .MuiSelect-icon': {
                color: 'black',
              }
            }}
          >
            {employeesLoading ? (
              <MenuItem disabled>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} sx={{ color: 'black' }} />
                  Loading employees...
                </Box>
              </MenuItem>
            ) : (
              employees.map((employee) => (
                <MenuItem 
                  key={employee.id} 
                  value={employee.id}
                  sx={{ color: 'black' }}
                >
                  {employee.name} - {employee.role}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        {selectedEmployee && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            backgroundColor: '#f5f5f5', 
            borderRadius: 1,
            border: '1px solid #ddd'
          }}>
            <Typography variant="body2" sx={{ color: 'black' }}>
              <strong>Confirmation:</strong> You are about to assign {selectedItems.length} account
              {selectedItems.length !== 1 ? 's' : ''} to{' '}
              {(() => {
                const emp = employees.find(emp => emp.EmployeeID === selectedEmployee);
                return emp ? emp.EmployeeName : 'Selected Employee';
              })()} . 
              This will update the ownership of these accounts.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button 
          onClick={handleClose}
          disabled={loading}
          sx={{
            color: 'black',
            borderColor: 'black',
            '&:hover': {
              backgroundColor: '#f5f5f5',
              borderColor: 'black'
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedEmployee || loading || employeesLoading}
          startIcon={loading ? <CircularProgress size={16} sx={{ color: 'white' }} /> : null}
          sx={{
            backgroundColor: 'black',
            color: 'white',
            '&:hover': {
              backgroundColor: '#333'
            },
            '&:disabled': {
              backgroundColor: '#ccc',
              color: '#666'
            }
          }}
        >
          {loading ? 'Assigning...' : `Assign ${selectedItems.length} Account${selectedItems.length !== 1 ? 's' : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkAssignDialog;