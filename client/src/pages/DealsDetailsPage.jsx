//PAGE : Deals Details
//Shows all details related to an individual deal

//IMPORTS
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Syncfusion component imports
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { getDealDetails } from "../services/dealService"; // API call to get deal details

function DealsDetailsPage() {
  const { id } = useParams();       // Get deal ID from URL params
  const navigate = useNavigate();   // Hook to programmatically navigate

  // State to hold deal data
  const [deal, setDeal] = useState(null);
  // Loading state for spinner
  const [loading, setLoading] = useState(true);
  // Error state for displaying fetch errors
  const [error, setError] = useState(null);

  // Helper function to format date strings into local date format, fallback "-"
  const formatDate = (str) => (str ? new Date(str).toLocaleDateString() : "-");

  useEffect(() => {
    async function fetchDeal() {
      setLoading(true);   // Show loading spinner
      setError(null);     // Clear previous errors
      try {
        const data = await getDealDetails(id);      // Fetch deal by ID
        const deal = Array.isArray(data) ? data[0] : data;  // Handle if data is array
        if (!deal) throw new Error("Deal not found");        // Throw if no deal
        setDeal(deal);                        // Save deal data to state
      } catch (err) {
        setError(err.message || "Failed to fetch deal details"); // Show error message
      } finally {
        setLoading(false);                    // Hide loading spinner
      }
    }
    fetchDeal();  // Fetch data on component mount or when id changes
  }, [id]);

  // Loading spinner
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <div className="e-spinner-pane">
          <div className="e-spinner-inner">
            <div className="e-spin-material"></div>
          </div>
        </div>
      </div>
    );
  }

  // Display error message if any
  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <span style={{ color: '#d32f2f', fontSize: '16px' }}>{error}</span>
      </div>
    );
  }

  // Show message if no deal found (edge case)
  if (!deal) {
    return (
      <div style={{ padding: '20px' }}>
        <span style={{ fontSize: '16px' }}>No deal found.</span>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px' }}>
      {/* Back button to navigate back to deals list */}
      <ButtonComponent 
        cssClass="e-outline" 
        content="← Back to Deals"
        onClick={() => navigate(-1)}
        style={{ marginBottom: '24px' }}
      />

      {/* Card-style container using Syncfusion's design patterns */}
      <div className="e-card" style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}>
        {/* Deal header */}
        <div className="e-card-header">
          <div className="e-card-header-title" style={{ 
            fontSize: '1.5rem', 
            fontWeight: '500', 
            marginBottom: '24px',
            color: '#333'
          }}>
            Deal #{deal.DealID}
          </div>
        </div>

        {/* Card content */}
        <div className="e-card-content">
          {/* Deal details in two-column grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '24px',
            marginBottom: '32px'
          }}>
            <div>
              <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>Account:</strong> {deal.Account || "-"}
              </div>
              <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>Deal Stage:</strong> {deal.StageName || "-"}
              </div>
              <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>Progression:</strong> {deal.Progression ?? "-"}
              </div>
              <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>Deal Name:</strong> {deal.DealName || "-"}
              </div>
              <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>Value:</strong> {deal.Value ?? "-"}
              </div>
            </div>
            <div>
              <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>Close Date:</strong> {formatDate(deal.CloseDate)}
              </div>
              <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>Created At:</strong> {formatDate(deal.CreatedAt)}
              </div>
              <div style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.5' }}>
                <strong>Updated At:</strong> {formatDate(deal.UpdatedAt)}
              </div>
            </div>
          </div>

          {/* Products section */}
          <div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '500', 
              marginBottom: '16px',
              marginTop: '0',
              color: '#333'
            }}>
              Products
            </h3>

            {/* Conditional rendering of product(s) */}
            {deal.ProductName ? (
              <ul style={{ 
                margin: '0', 
                paddingLeft: '20px',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                {/* If ProductName is an array, map each product with its price */}
                {Array.isArray(deal.ProductName) ? (
                  deal.ProductName.map((product, index) => (
                    <li key={index} style={{ marginBottom: '8px' }}>
                      {product} - Price at time: {deal.PriceAtTime && deal.PriceAtTime[index] ? deal.PriceAtTime[index] : "-"}
                    </li>
                  ))
                ) : (
                  // If single product, display directly
                  <li style={{ marginBottom: '8px' }}>
                    {deal.ProductName} - Price at time: {deal.PriceAtTime || "-"}
                  </li>
                )}
              </ul>
            ) : (
              // No products found message
              <div style={{ fontSize: '14px', color: '#666' }}>
                No products found for this deal.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

}

export default DealsDetailsPage;