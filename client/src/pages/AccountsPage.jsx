// IMPORTS
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Toolbar,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import { formatters } from '../utils/formatters';
import UniversalTable from '../components/TableView';
import theme from "../components/Theme";
import NotesPopup from '../components/NotesComponent';
import AttachmentsPopup from '../components/AttachmentsComponent';
import { noteService } from '../services/noteService';
import { attachmentService } from '../services/attachmentService';

// Table config for accounts
const accountsTableConfig = {
  idField: 'AccountID',
  columns: [
    { field: 'AccountName', headerName: 'Name', type: 'tooltip' },
    { field: 'CityName', headerName: 'City Name' },
    { field: 'StateProvince_Name', headerName: 'State Province Name' },
    { field: 'CountryName', headerName: 'Country Name' },
    { field: 'street_address', headerName: 'Street Address', type: 'truncated', maxWidth: 200 },
    { field: 'postal_code', headerName: 'Postal Code' },
    { field: 'PrimaryPhone', headerName: 'Phone' },
    { field: 'IndustryName', headerName: 'Industry Name' },
    { field: 'fax', headerName: 'Fax' },
    { field: 'email', headerName: 'Email' },
    { field: 'Website', headerName: 'Website', type: 'link' },
    { field: 'number_of_employees', headerName: '# Employees' },
    { field: 'number_of_venues', headerName: '# Venues' },
    { field: 'number_of_releases', headerName: '# Releases' },
    { field: 'number_of_events_anually', headerName: '# Events Anually' },
    { field: 'annual_revenue', headerName: 'Annual Revenue' },
    { field: 'ParentAccountName', headerName: 'Parent Account' },
    { field: 'CreatedAt', headerName: 'Created' },
    { field: 'UpdatedAt', headerName: 'Updated' },
    {
      field: 'ownerStatus',
      headerName: 'Ownership',
      type: 'chip',
      chipLabels: { owned: 'Owned', unowned: 'Unowned', 'n/a': 'N/A' },
      chipColors: { owned: '#079141ff', unowned: '#999999', 'n/a': '#999999' }
    },
  ],
};

const AccountsPage = ({
  accounts,
  loading,
  error,
  successMessage,
  setSuccessMessage,
  onDeactivate,
  onEdit,
  onView,
  onCreate,
}) => {
  const [selected, setSelected] = useState([]);

  // State for popups
  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [attachmentsPopupOpen, setAttachmentsPopupOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupError, setPopupError] = useState(null);

  const handleClaimAccount = (account) => {
    console.log("Claiming account:", account);
    // Add claim logic here
  };

  const handleAssignUser = (account) => {
    console.log("Assigning user to account:", account);
    // Add assign user logic here
  };

  // Notes handlers
  const handleAddNote = (account) => {
    setSelectedAccount(account);
    setNotesPopupOpen(true);
    setPopupError(null);
  };

  const handleSaveNote = async (noteData) => {
    try {
      setPopupLoading(true);
      setPopupError(null);
      
      // The noteService.createNote is called from within the popup component
      // Just show success message here
      setSuccessMessage('Note added successfully!');
      
    } catch (error) {
      setPopupError(error.message || 'Failed to save note');
      console.error('Failed to save note:', error);
    } finally {
      setPopupLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      setPopupLoading(true);
      setPopupError(null);
      
      // The noteService.deleteNote is called from within the popup component
      // Just show success message here
      setSuccessMessage('Note deleted successfully!');
      
    } catch (error) {
      setPopupError(error.message || 'Failed to delete note');
      console.error('Failed to delete note:', error);
    } finally {
      setPopupLoading(false);
    }
  };

  const handleEditNote = async (noteData) => {
    try {
      setPopupLoading(true);
      setPopupError(null);
      
      // The noteService.updateNote is called from within the popup component
      // Just show success message here
      setSuccessMessage('Note updated successfully!');
      
    } catch (error) {
      setPopupError(error.message || 'Failed to update note');
      console.error('Failed to update note:', error);
    } finally {
      setPopupLoading(false);
    }
  };

  // Attachments handlers
  const handleAddAttachment = (account) => {
    setSelectedAccount(account);
    setAttachmentsPopupOpen(true);
    setPopupError(null);
  };

  const handleUploadAttachment = async (attachmentDataArray) => {
    try {
      setPopupLoading(true);
      setPopupError(null);
      
      // The upload is already handled in the popup component
      // Just show success message
      setSuccessMessage(`${attachmentDataArray.length} attachment(s) uploaded successfully!`);
      
    } catch (error) {
      setPopupError(error.message || 'Failed to upload attachments');
      console.error('Failed to upload attachments:', error);
    } finally {
      setPopupLoading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      setPopupLoading(true);
      setPopupError(null);
      
      await attachmentService.deleteAttachment(attachmentId);
      setSuccessMessage('Attachment deleted successfully!');
      
    } catch (error) {
      setPopupError(error.message || 'Failed to delete attachment');
      console.error('Failed to delete attachment:', error);
    } finally {
      setPopupLoading(false);
    }
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      // Use the service to handle download
      await attachmentService.downloadAttachment(attachment);
    } catch (error) {
      setPopupError(error.message || 'Failed to download attachment');
      console.error('Failed to download attachment:', error);
    }
  };

  // Selection handlers
  const handleSelectClick = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(accounts.map(account => account.AccountID));
    } else {
      setSelected([]);
    }
  };

  const handleCloseNotesPopup = () => {
    setNotesPopupOpen(false);
    setSelectedAccount(null);
    setPopupError(null);
  };

  const handleCloseAttachmentsPopup = () => {
    setAttachmentsPopupOpen(false);
    setSelectedAccount(null);
    setPopupError(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', backgroundColor: '#fafafa', minHeight: '100vh', p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage("")}>
            {successMessage}
          </Alert>
        )}

        <Paper
          elevation={0}
          sx={{
            width: '100%',
            mb: 2,
            border: '0px solid #e5e5e5',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        >
          {/* Toolbar with title and Add button */}
          <Toolbar
            sx={{
              backgroundColor: '#ffffff',
              borderBottom: '1px solid #e5e5e5',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
              py: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <Typography variant="h6" component="div" sx={{ color: '#050505', fontWeight: 600 }}>
                Accounts
              </Typography>
              {selected.length > 0 && (
                <Chip
                  label={`${selected.length} selected`}
                  size="small"
                  sx={{ backgroundColor: '#e0e0e0', color: '#050505' }}
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onCreate}
                sx={{
                  backgroundColor: '#050505',
                  color: '#ffffff',
                  '&:hover': { backgroundColor: '#333333' },
                }}
              >
                Add Account
              </Button>
            </Box>
          </Toolbar>

          {/* Loading spinner or table */}
          {loading ? (
            <Box display="flex" justifyContent="center" p={8}>
              <CircularProgress />
            </Box>
          ) : (
            <UniversalTable
              data={accounts}
              columns={accountsTableConfig.columns}
              idField={accountsTableConfig.idField}
              selected={selected}
              onSelectClick={handleSelectClick}
              onSelectAllClick={handleSelectAllClick}
              showSelection={true}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDeactivate}
              onAddNote={handleAddNote}              
              onAddAttachment={handleAddAttachment} 
              formatters={formatters}
              entityType="account"  
              onClaimAccount={handleClaimAccount} 
              onAssignUser={handleAssignUser}
            />
          )}

          {/* Footer */}
          <Box
            sx={{
              p: 2,
              borderTop: '1px solid #e5e5e5',
              backgroundColor: '#fafafa',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="body2" sx={{ color: '#666666' }}>
              Showing {accounts.length} accounts
            </Typography>
            {selected.length > 0 && (
              <Typography variant="body2" sx={{ color: '#050505', fontWeight: 500 }}>
                {selected.length} selected
              </Typography>
            )}
          </Box>
        </Paper>
       
        {/* Notes Popup */}
        <NotesPopup
          open={notesPopupOpen}
          onClose={handleCloseNotesPopup}
          onSave={handleSaveNote}
          onDelete={handleDeleteNote}
          onEdit={handleEditNote}
          entityType="account"
          entityId={selectedAccount?.AccountID}
          entityName={selectedAccount?.AccountName}
          loading={popupLoading}
          error={popupError}
          showExistingNotes={true}
          maxLength={1000}
          required={true}
        />

        {/* Attachments Popup */}
        <AttachmentsPopup
          open={attachmentsPopupOpen}
          onClose={handleCloseAttachmentsPopup}
          onUpload={handleUploadAttachment}
          onDelete={handleDeleteAttachment}
          onDownload={handleDownloadAttachment}
          entityType="account"
          entityId={selectedAccount?.AccountID}
          entityName={selectedAccount?.AccountName}
          loading={popupLoading}
          error={popupError}
        />
      </Box>
    </ThemeProvider>
  );
};

export default AccountsPage;