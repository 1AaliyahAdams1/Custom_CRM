const express = require("express");
const router = express.Router();
const attachmentController = require("../controllers/attachmentController");

// Upload attachment - POST /attachments/upload
router.post(
  "/upload",
  attachmentController.upload.single("file"),
  attachmentController.uploadAttachment
);

// Get attachments for entity - GET /attachments/entity/:entityId/:entityTypeName
router.get(
  "/entity/:entityId/:entityTypeName",
  attachmentController.getAttachments
);

// Download attachment - GET /attachments/:attachmentId/download
router.get("/:attachmentId/download", attachmentController.downloadAttachment);

// Get attachment by ID - GET /attachments/:attachmentId
router.get("/:attachmentId", attachmentController.getAttachmentById);

// Update attachment - PUT /attachments/:attachmentId
router.put("/:attachmentId", attachmentController.updateAttachment);

// Delete attachment - DELETE /attachments/:attachmentId
router.delete("/:attachmentId", attachmentController.deleteAttachment);

// Deactivate attachment - PATCH /attachments/:attachmentId/deactivate
router.patch("/:attachmentId/deactivate", attachmentController.deactivateAttachment);

// Reactivate attachment - PATCH /attachments/:attachmentId/reactivate
router.patch("/:attachmentId/reactivate", attachmentController.reactivateAttachment);

module.exports = router;