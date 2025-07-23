//PAGE : Account Details
//Shows all details related to an individual account

//IMPORTS
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

//syncfusion component imports
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';



// fetches account details
import { getAccountDetails } from "../services/accountService";

// Component to display detailed information about a single Account
function AccountDetailsPage() {
  // Get the account ID from the URL parameters
  const { id } = useParams();
  // Hook for programmatic navigation
  const navigate = useNavigate();

  // State to hold the fetched account details
  const [account, setAccount] = useState(null);
  // Loading state while fetching data
  const [loading, setLoading] = useState(true);
  // Error state to capture fetch errors
  const [error, setError] = useState(null);

  // Fetch account details when component mounts or when `id` changes
  useEffect(() => {
    async function fetchAccount() {
      setLoading(true);
      setError(null);
      try {
        // Call service to get account details by ID
        const data = await getAccountDetails(id);
        // The API may return an array; take the first item if so
        const account = Array.isArray(data) ? data[0] : data;
        // If no account is found, throw an error to show message
        if (!account) throw new Error("Account not found");
        // Update state with fetched account details
        setAccount(account);
      } catch (err) {
        // Capture error message for display
        setError(err.message || "Failed to fetch account details");
      } finally {
        // Stop loading indicator regardless of success or failure
        setLoading(false);
      }
    }
    fetchAccount();
  }, [id]);

  // // While loading, show a spinner
  //  if (loading) return <CircularProgress />;
  
  // // Show error message if fetch failed
  //  if (error) return <Typography color="error">{error}</Typography>;

  // // Show fallback if no account found (should rarely happen due to error above)
  //  if (!account) return <Typography>No account found.</Typography>;
  
  // return (
  //   <Box p={4}>
  //     {/* Button to navigate back to the accounts list */}
  //     <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
  //       &larr; Back to Accounts
  //     </Button>

  //     {/* Card to display account details */}
  //     <Card elevation={3}>
  //       <CardContent>
  //         {/* Account name as the card title */}
  //         <Typography variant="h5" gutterBottom>{account.AccountName}</Typography>

  //         {/* Grid layout to neatly organize details in two columns */}
  //         <Grid container spacing={2}>
  //           {/* Left column with some basic info */}
  //           <Grid item xs={6}>
  //             <Typography><strong>ID:</strong> {account.AccountID}</Typography>
  //             <Typography><strong>Industry:</strong> {account.Industry || "-"}</Typography>
  //             <Typography><strong>City:</strong> {account.CityName || "-"}</Typography>
  //             <Typography><strong>Country:</strong> {account.CountryName || "-"}</Typography>
  //           </Grid>
  //           {/* Right column with contact info */}
  //           <Grid item xs={6}>
  //             <Typography><strong>Phone:</strong> {account.PrimaryPhone || "-"}</Typography>
  //             <Typography><strong>Website:</strong> {account.Website || "-"}</Typography>
  //             <Typography><strong>Address:</strong> {account.Address || "-"}</Typography>
  //             <Typography><strong>Contact:</strong> {account.Contact || "-"}</Typography>
  //           </Grid>
  //         </Grid>
  //       </CardContent>
  //     </Card>
  //   </Box>
  // );
 // While loading, show a spinner
  if (loading) {
    return (
      <div id="spinner-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        position: 'relative'
      }}>
        <div className="e-spinner-pane">
          <div className="e-spinner-inner">
            <div className="e-spin-material"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show error message if fetch failed
  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <span style={{ color: '#d32f2f', fontSize: '16px' }}>{error}</span>
      </div>
    );
  }

  // Show fallback if no account found (should rarely happen due to error above)
  if (!account) {
    return (
      <div style={{ padding: '20px' }}>
        <span style={{ fontSize: '16px' }}>No account found.</span>
      </div>
    );
  }
  
  return (
    <div style={{ padding: '32px' }}>
      {/* Button to navigate back to the accounts list */}
      <ButtonComponent 
        cssClass="e-outline" 
        content="← Back to Accounts"
        onClick={() => navigate(-1)}
        style={{ marginBottom: '24px' }}
      />

      {/* Card-style container using Syncfusion's design patterns */}
      <div className="e-card" style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}>
        {/* Account name as the title */}
        <div className="e-card-header">
          <div className="e-card-header-title" style={{ 
            fontSize: '1.5rem', 
            fontWeight: '500', 
            marginBottom: '24px',
            color: '#333'
          }}>
            {account.AccountName}
          </div>
        </div>

        {/* Card content */}
        <div className="e-card-content">
          {/* Grid layout using CSS Grid to organize details in two columns */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '24px'
          }}>
            {/* Left column with some basic info */}
            <div>
              <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>ID:</strong> {account.AccountID}
              </div>
              <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>Industry:</strong> {account.Industry || "-"}
              </div>
              <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>City:</strong> {account.CityName || "-"}
              </div>
              <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>Country:</strong> {account.CountryName || "-"}
              </div>
            </div>
            
            {/* Right column with contact info */}
            <div>
              <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>Phone:</strong> {account.PrimaryPhone || "-"}
              </div>
              <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>Website:</strong> {account.Website || "-"}
              </div>
              <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>Address:</strong> {account.Address || "-"}
              </div>
              <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>Contact:</strong> {account.Contact || "-"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountDetailsPage;
