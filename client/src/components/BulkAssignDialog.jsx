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
import { Assignment } from '@mui/icons-material';
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
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        pb: 1 
      }}>
        <Assignment color="primary" />
        Bulk Assign Accounts
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Assign {selectedItems.length} selected account{selectedItems.length !== 1 ? 's' : ''} to a team member:
        </Typography>

        {/* Selected accounts preview */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Selected Accounts:
          </Typography>
          <Box sx={{ 
            maxHeight: 150, 
            overflow: 'auto', 
            border: '1px solid #e0e0e0', 
            borderRadius: 1,
            backgroundColor: '#fafafa'
          }}>
            <List dense>
              {selectedItems.slice(0, 10).map((account, index) => (
                <ListItem key={account.AccountID || index}>
                  <ListItemText 
                    primary={account.AccountName}
                    secondary={`${account.CityName || 'Unknown'}, ${account.CountryName || 'Unknown'}`}
                  />
                </ListItem>
              ))}
              {selectedItems.length > 10 && (
                <ListItem>
                  <ListItemText 
                    primary={`... and ${selectedItems.length - 10} more accounts`}
                    sx={{ fontStyle: 'italic', color: 'text.secondary' }}
                  />
                </ListItem>
              )}
            </List>
          </Box>
        </Box>

        {/* Employee selection */}
        <FormControl fullWidth>
          <InputLabel>Assign to Employee</InputLabel>
          <Select
            value={selectedEmployee}
            label="Assign to Employee"
            onChange={(e) => setSelectedEmployee(e.target.value)}
            disabled={employeesLoading || loading}
          >
            {employeesLoading ? (
              <MenuItem disabled>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  Loading employees...
                </Box>
              </MenuItem>
            ) : (
              employees.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.name} - {employee.role}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        {selectedEmployee && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2">
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
        >
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedEmployee || loading || employeesLoading}
          startIcon={loading ? <CircularProgress size={16} /> : <Assignment />}
        >
          {loading ? 'Assigning...' : `Assign ${selectedItems.length} Account${selectedItems.length !== 1 ? 's' : ''}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkAssignDialog;