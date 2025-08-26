import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductPage from "../../pages/Products/ProductPage";
import * as productService from "../../services/productService";
import { noteService } from "../../services/noteService";
import { attachmentService } from "../../services/attachmentService";

const ProductsContainer = () => {
  const navigate = useNavigate();

  // ---------------- STATE ----------------
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(false);

  const [selected, setSelected] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusSeverity, setStatusSeverity] = useState('success');
  
  // Popups
  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [attachmentsPopupOpen, setAttachmentsPopupOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [popupLoading, setPopupLoading] = useState(false);
  const [popupError, setPopupError] = useState(null);

  // ---------------- USER ROLES ----------------
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const roles = Array.isArray(storedUser.roles) ? storedUser.roles : [];
  const userId = storedUser.UserID || storedUser.id || null;
  const isCLevel = roles.includes("C-level");
  const isSalesRep = roles.includes("Sales Representative");

  // ---------------- FETCH PRODUCTS ----------------
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [refreshFlag]);

  // ---------------- PRODUCT ACTIONS ----------------
  const handleDeactivate = async (productId) => {
    if (!window.confirm('Are you sure you want to deactivate this product?')) return;
    setError(null);
    try {
      await productService.deactivateProduct(productId);
      setSuccessMessage('Product deactivated successfully.');
      setRefreshFlag(flag => !flag);
    } catch (err) {
      console.error('Error deactivating product:', err);
      setError('Failed to deactivate product: ' + err.message);
    }
  };

  const handleReactivate = async (productId) => {
    if (!window.confirm('Are you sure you want to reactivate this product?')) return;
    setError(null);
    try {
      await productService.reactivateProduct(productId);
      setSuccessMessage('Product reactivated successfully.');
      setRefreshFlag(flag => !flag);
    } catch (err) {
      console.error('Error reactivating product:', err);
      setError('Failed to reactivate product: ' + err.message);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to permanently delete this product? This action cannot be undone.')) return;
    setError(null);
    try {
      await productService.deleteProduct(productId);
      setSuccessMessage('Product deleted successfully.');
      // Remove from selected if it was selected
      setSelected(prev => prev.filter(id => id !== productId));
      setRefreshFlag(flag => !flag);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product: ' + err.message);
    }
  };

  const handleBulkDeactivate = async () => {
    if (!window.confirm(`Are you sure you want to deactivate ${selected.length} selected products?`)) return;
    setError(null);
    try {
      // Handle bulk deactivation
      for (const productId of selected) {
        await productService.deactivateProduct(productId);
      }
      setSelected([]);
      setSuccessMessage(`${selected.length} products deactivated successfully.`);
      setRefreshFlag(flag => !flag);
    } catch (err) {
      console.error('Error deactivating products:', err);
      setError('Failed to deactivate products: ' + err.message);
    }
  };

  const handleEdit = (product) => navigate(`/products/edit/${product.ProductID}`, { state: { product } });
  const handleView = (product) => product?.ProductID && navigate(`/products/${product.ProductID}`);
  const handleCreate = () => navigate("/products/create");

  // ---------------- SELECTION ----------------
  const handleSelectClick = (productId) => {
    const selectedIndex = selected.indexOf(productId);
    let newSelected = [];
    if (selectedIndex === -1) newSelected = [...selected, productId];
    else newSelected = selected.filter(sid => sid !== productId);
    setSelected(newSelected);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) setSelected(products.map(p => p.ProductID));
    else setSelected([]);
  };

  // ---------------- STATUS MESSAGES ----------------
  const showStatus = (message, severity = 'success') => {
    setStatusMessage(message);
    setStatusSeverity(severity);
  };

  // ---------------- NOTES ----------------
  const handleAddNote = (product) => { 
    setSelectedProduct(product); 
    setNotesPopupOpen(true); 
    setPopupError(null); 
  };

  const handleSaveNote = async (noteData) => {
    try {
      setPopupLoading(true);
      await noteService.createNote(noteData);
      setSuccessMessage("Note added successfully!");
      setNotesPopupOpen(false);
      setRefreshFlag(flag => !flag);
    } catch (err) { 
      setPopupError(err.message || "Failed to save note"); 
    } finally { 
      setPopupLoading(false); 
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      setPopupLoading(true);
      await noteService.deleteNote(noteId);
      setSuccessMessage("Note deleted successfully!");
      setRefreshFlag(flag => !flag);
    } catch (err) { 
      setPopupError(err.message || "Failed to delete note"); 
    } finally { 
      setPopupLoading(false); 
    }
  };

  const handleEditNote = async (noteData) => {
    try {
      setPopupLoading(true);
      await noteService.updateNote(noteData.NoteID, noteData);
      setSuccessMessage("Note updated successfully!");
      setRefreshFlag(flag => !flag);
    } catch (err) { 
      setPopupError(err.message || "Failed to update note"); 
    } finally { 
      setPopupLoading(false); 
    }
  };

  // ---------------- ATTACHMENTS ----------------
  const handleAddAttachment = (product) => { 
    setSelectedProduct(product); 
    setAttachmentsPopupOpen(true); 
    setPopupError(null); 
  };

  const handleUploadAttachment = async (attachments) => {
    try {
      setPopupLoading(true);
      for (const att of attachments) await attachmentService.uploadAttachment(att);
      setSuccessMessage(`${attachments.length} attachment(s) uploaded successfully!`);
      setAttachmentsPopupOpen(false);
      setRefreshFlag(flag => !flag);
    } catch (err) { 
      setPopupError(err.message || "Failed to upload attachments"); 
    } finally { 
      setPopupLoading(false); 
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      setPopupLoading(true);
      await attachmentService.deleteAttachment(attachmentId);
      setSuccessMessage("Attachment deleted successfully!");
      setRefreshFlag(flag => !flag);
    } catch (err) { 
      setPopupError(err.message || "Failed to delete attachment"); 
    } finally { 
      setPopupLoading(false); 
    }
  };

  const handleDownloadAttachment = async (attachment) => {
    try { 
      await attachmentService.downloadAttachment(attachment); 
    } catch (err) { 
      setPopupError(err.message || "Failed to download attachment"); 
    }
  };

  // ---------------- USER ASSIGNMENT ----------------
  const handleAssignUser = async (employeeId, product) => {
    try {
      // Implement user assignment logic if needed for products
      // This might not be applicable to products, but keeping for consistency
      setSuccessMessage(`User assigned to ${product.ProductName}`);
      // Optionally update local state if needed
    } catch (err) {
      console.error("Failed to assign user:", err);
      setError(err.message || "Failed to assign user");
      throw err; // Re-throw so the dialog can show the error
    }
  };

  return (
    <ProductPage
      products={products}
      loading={loading}
      error={error}
      setError={setError}
      successMessage={successMessage}
      setSuccessMessage={setSuccessMessage}
      statusMessage={statusMessage}
      statusSeverity={statusSeverity}
      setStatusMessage={setStatusMessage}
      selected={selected}
      onSelectClick={handleSelectClick}
      onSelectAllClick={handleSelectAllClick}
      onDeactivate={handleDeactivate}
      onReactivate={handleReactivate}
      onDelete={handleDelete}
      onBulkDeactivate={handleBulkDeactivate}
      onEdit={handleEdit}
      onView={handleView}
      onCreate={handleCreate}
      onAddNote={handleAddNote}
      onAddAttachment={handleAddAttachment}
      onAssignUser={handleAssignUser}
      showStatus={showStatus}
      notesPopupOpen={notesPopupOpen}
      setNotesPopupOpen={setNotesPopupOpen}
      attachmentsPopupOpen={attachmentsPopupOpen}
      setAttachmentsPopupOpen={setAttachmentsPopupOpen}
      selectedProduct={selectedProduct}
      popupLoading={popupLoading}
      popupError={popupError}
      handleSaveNote={handleSaveNote}
      handleDeleteNote={handleDeleteNote}
      handleEditNote={handleEditNote}
      handleUploadAttachment={handleUploadAttachment}
      handleDeleteAttachment={handleDeleteAttachment}
      handleDownloadAttachment={handleDownloadAttachment}
    />
  );
};

export default ProductsContainer;