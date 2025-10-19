import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductPage from "../../pages/Products/ProductPage";
import * as productService from "../../services/productService";
import { 
  createNote, 
  updateNote, 
  deactivateNote,
  reactivateNote,
} from "../../services/noteService";
import { 
  uploadAttachment, 
  deleteAttachment, 
  downloadAttachment 
} from "../../services/attachmentService";
import NotesPopup from "../../components/dialogs/NotesComponent";
import AttachmentsPopup from "../../components/dialogs/AttachmentsComponent";
import ConfirmDialog from "../../components/dialogs/ConfirmDialog";

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
  const [currentUser, setCurrentUser] = useState(null);

  // Popups
  const [notesPopupOpen, setNotesPopupOpen] = useState(false);
  const [attachmentsPopupOpen, setAttachmentsPopupOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Confirm dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDescription, setConfirmDescription] = useState("");

  // Get current user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.UserID) {
      setError('User not authenticated. Please log in again.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    setCurrentUser(user);
  }, [navigate]);

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
    if (currentUser) {
      fetchProducts();
    }
  }, [refreshFlag, currentUser]);

  // ---------------- CONFIRM DIALOG HANDLERS ----------------
  const openConfirmDialog = (title, description, action) => {
    setConfirmTitle(title);
    setConfirmDescription(description);
    setConfirmAction(() => action);
    setConfirmDialogOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmDialogOpen(false);
    if (confirmAction) await confirmAction();
    setConfirmAction(null);
  };

  const handleCancel = () => {
    setConfirmDialogOpen(false);
    setConfirmAction(null);
  };

  // ---------------- PRODUCT ACTIONS ----------------
  const handleDeactivate = (productId) => {
    if (!currentUser) {
      setError('User not authenticated');
      return;
    }

    openConfirmDialog(
      "Deactivate Product",
      "Are you sure you want to deactivate this product?",
      async () => {
        try {
          await productService.deactivateProduct(productId, currentUser.UserID);
          setSuccessMessage('Product deactivated successfully.');
          setRefreshFlag(flag => !flag);
        } catch (err) {
          console.error('Error deactivating product:', err);
          setError('Failed to deactivate product: ' + err.message);
        }
      }
    );
  };

  const handleReactivate = (productId) => {
    if (!currentUser) {
      setError('User not authenticated');
      return;
    }

    openConfirmDialog(
      "Reactivate Product",
      "Are you sure you want to reactivate this product?",
      async () => {
        try {
          await productService.reactivateProduct(productId, currentUser.UserID);
          setSuccessMessage('Product reactivated successfully.');
          setRefreshFlag(flag => !flag);
        } catch (err) {
          console.error('Error reactivating product:', err);
          setError('Failed to reactivate product: ' + err.message);
        }
      }
    );
  };

  // ---------------- NAVIGATION ----------------
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

  // ---------------- NOTES ----------------
  const handleAddNote = (product) => { 
    setSelectedProduct(product); 
    setNotesPopupOpen(true); 
  };

  const handleSaveNote = async (noteData) => {
    try {
      const notePayload = {
        EntityID: selectedProduct.ProductID,
        EntityType: "Product",
        Content: noteData.Content || noteData,
      };
      await createNote(notePayload);
      setSuccessMessage("Note added successfully!");
      setRefreshFlag(flag => !flag);
    } catch (err) { 
      setError(err.message || "Failed to save note"); 
      throw err;
    }
  };

  const handleEditNote = async (noteData) => {
    try {
      await updateNote(noteData.NoteID, {
        EntityID: selectedProduct.ProductID,
        EntityType: "Product",
        Content: noteData.Content,
      });
      setSuccessMessage("Note updated successfully!");
      setRefreshFlag(flag => !flag);
    } catch (err) { 
      setError(err.message || "Failed to update note"); 
      throw err;
    }
  };

  const handleDeactivateNote = async (noteId) => {
    try {
      await deactivateNote(noteId);
      setSuccessMessage("Note deactivated successfully!");
      setRefreshFlag(flag => !flag);
    } catch (err) { 
      setError(err.message || "Failed to deactivate note"); 
      throw err;
    }
  };

  const handleReactivateNote = async (noteId) => {
    try {
      await reactivateNote(noteId);
      setSuccessMessage("Note reactivated successfully!");
      setRefreshFlag(flag => !flag);
    } catch (err) { 
      setError(err.message || "Failed to reactivate note"); 
      throw err;
    }
  };

  // ---------------- ATTACHMENTS ----------------
  const handleAddAttachment = (product) => { 
    setSelectedProduct(product); 
    setAttachmentsPopupOpen(true); 
  };

  const handleUploadAttachment = async (files) => {
    try {
      const uploadPromises = files.map(file => 
        uploadAttachment({
          file,
          entityId: selectedProduct.ProductID,
          entityTypeName: "Product"
        })
      );
      await Promise.all(uploadPromises);
      setSuccessMessage(`${files.length} attachment(s) uploaded successfully!`);
      setAttachmentsPopupOpen(false);
      setRefreshFlag(flag => !flag);
    } catch (err) { 
      setError(err.message || "Failed to upload attachments"); 
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await deleteAttachment(attachmentId);
      setSuccessMessage("Attachment deleted successfully!");
      setRefreshFlag(flag => !flag);
    } catch (err) { 
      setError(err.message || "Failed to delete attachment"); 
    }
  };

  const handleDownloadAttachment = async (attachment) => {
    try { 
      await downloadAttachment(attachment); 
    } catch (err) { 
      setError(err.message || "Failed to download attachment"); 
    }
  };

  return (
    <>
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
        onEdit={handleEdit}
        onView={handleView}
        onCreate={handleCreate}
        onAddNote={handleAddNote}
        onAddAttachment={handleAddAttachment}
      />

      {/* Notes Popup */}
      <NotesPopup
        open={notesPopupOpen}
        onClose={() => setNotesPopupOpen(false)}
        onSave={handleSaveNote}
        onEdit={handleEditNote}
        onDeactivate={handleDeactivateNote}
        onReactivate={handleReactivateNote}
        entityType="Product"
        entityId={selectedProduct?.ProductID}
        entityName={selectedProduct?.ProductName}
        showExistingNotes={true}
      />

      {/* Attachments Popup */}
      <AttachmentsPopup
        open={attachmentsPopupOpen}
        onClose={() => setAttachmentsPopupOpen(false)}
        entityType="Product"
        entityId={selectedProduct?.ProductID}
        entityName={selectedProduct?.ProductName}
        onUpload={handleUploadAttachment}
        onDelete={handleDeleteAttachment}
        onDownload={handleDownloadAttachment}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        title={confirmTitle}
        description={confirmDescription}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
};

export default ProductsContainer;