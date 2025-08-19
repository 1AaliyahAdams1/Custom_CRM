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

// Delete attachment - DELETE /attachments/:attachmentId
router.delete("/:attachmentId", attachmentController.deleteAttachment);

module.exports = router;
