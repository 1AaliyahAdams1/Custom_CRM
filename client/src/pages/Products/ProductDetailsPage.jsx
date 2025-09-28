import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Tabs, Tab, Alert, Typography, Button, CircularProgress } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

import ProductDetailsForm from "../../components/forms/ProductDetailsForm";
import NotesForm from "../../components/forms/NoteDetailsForm";
import AttachmentsForm from "../../components/forms/AttachmentDetailsForm";

import { getProductById } from "../../services/productService";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const tabs = ["Product Details", "Notes", "Attachments"];

  const refreshProduct = useCallback(async () => {
    if (!id) {
      setError("No product ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting to fetch product with ID:', id);
      console.log('Parsed ID:', parseInt(id, 10));
      
      const response = await getProductById(parseInt(id, 10));
      console.log('API Response:', response);
      
      const data = response?.data || response;
      console.log('Product data:', data);
      
      if (!data) {
        throw new Error('No product data received');
      }
      
      setProduct(data);
    } catch (err) {
      console.error("Error loading product:", err);
      console.error("Error details:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      
      setError(err.response?.data?.message || err.message || "Failed to load product details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refreshProduct();
  }, [refreshProduct]);

  const handleBack = () => navigate("/products");

  const handleTabChange = (_, newValue) => setActiveTab(newValue);

  const handleProductUpdate = (updatedProduct) => {
    setProduct(updatedProduct);
    setSuccessMessage("Product updated successfully!");
    // Clear success message after 5 seconds
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const renderTabContent = () => {
    if (!product) return null;

    switch (activeTab) {
      case 0: // Product Details
        return (
          <ProductDetailsForm 
            productId={id} 
            product={product}
            onProductUpdate={handleProductUpdate}
            onError={setError}
          />
        );
      case 1: // Notes
        return (
          <NotesForm 
            entityType="Product" 
            entityId={product.ProductID} 
            entityName={product.ProductName}
            onSaved={refreshProduct}
            onError={setError}
          />
        );
      case 2: // Attachments
        return (
          <AttachmentsForm 
            entityType="Product" 
            entityId={product.ProductID} 
            entityName={product.ProductName}
            onUploaded={refreshProduct}
            onError={setError}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: "100%", p: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back to Products
        </Button>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={refreshProduct}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ width: "100%", p: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back to Products
        </Button>
        <Alert severity="warning">
          Product not found. The product may have been deleted or the ID is invalid.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: "100%", 
      p: 2, 
      backgroundColor: "#fafafa", 
      minHeight: "100vh" 
    }}>
      {/* Header with Back Button and Product Info */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2 
      }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{
            color: "#000",
            borderColor: "#000",
            "&:hover": {
              backgroundColor: "#000",
              color: "#fff",
              borderColor: "#000",
            },
          }}
        >
          Back to Products
        </Button>
        
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            {product.ProductName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Product ID: {product.ProductID} | SKU: {product.SKU}
          </Typography>
        </Box>
      </Box>

      {/* Success Message */}
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }} 
          onClose={() => setSuccessMessage("")}
        >
          {successMessage}
        </Alert>
      )}

      {/* Main Content Card with Tabs */}
      <Card sx={{ 
        borderRadius: 2, 
        overflow: "hidden",
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            borderBottom: 1, 
            borderColor: "divider",
            backgroundColor: "#f8f9fa"
          }}
        >
          {tabs.map((tab, idx) => (
            <Tab 
              key={idx} 
              label={tab}
              sx={{
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: activeTab === idx ? 600 : 400
              }}
            />
          ))}
        </Tabs>
        
        <CardContent sx={{ p: 3 }}>
          {renderTabContent()}
        </CardContent>
      </Card>
    </Box>
  );
}