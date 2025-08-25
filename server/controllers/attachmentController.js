const multer = require("multer");
const path = require("path");
const fs = require("fs");
const attachmentService = require("../services/attachmentService");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// File filter for security
const fileFilter = (req, file, cb) => {
  const allowedTypes =
    /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip|rar|csv|mp4|mp3/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

// =======================
// Upload Attachment - FIXED
// =======================
async function uploadAttachment(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { entityId, entityTypeName } = req.body;
    if (!entityId || !entityTypeName) {
      return res
        .status(400)
        .json({ error: "EntityID and EntityTypeName are required" });
    }

    const fileData = {
      entityId,
      entityTypeName,
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
    };

    const result = await attachmentService.uploadAttachment(fileData);
    
    // Return consistent response format
    res.status(201).json({
      success: true,
      message: result.message,
      data: {
        ...result.data,
        attachmentId: result.data.attachmentId, // Ensure ID is returned
        filePath: req.file.path,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error("Error in uploadAttachment controller:", error);

    // Rollback physical file if DB fails
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError);
      }
    }

    res.status(500).json({ 
      success: false,
      error: error.message || "Failed to upload attachment" 
    });
  }
}

// =======================
// Get Attachments for Entity - FIXED
// =======================
async function getAttachments(req, res) {
  try {
    const { entityId, entityTypeName } = req.params;
    
    if (!entityId || !entityTypeName) {
      return res.status(400).json({ 
        error: "EntityID and EntityTypeName are required" 
      });
    }
    
    const result = await attachmentService.getAttachmentsForEntity(
      entityId,
      entityTypeName
    );
    
    // Return the data array directly for frontend compatibility
    res.json(result.data || []);
  } catch (error) {
    console.error("Error in getAttachments controller:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Failed to fetch attachments" 
    });
  }
}

// =======================
// Get Attachment by ID
// =======================
async function getAttachmentById(req, res) {
  try {
    const { attachmentId } = req.params;
    
    if (!attachmentId) {
      return res.status(400).json({ error: "AttachmentID is required" });
    }
    
    const result = await attachmentService.getAttachmentById(attachmentId);
    
    if (!result) {
      return res.status(404).json({ error: "Attachment not found" });
    }
    
    res.json(result);
  } catch (error) {
    console.error("Error in getAttachmentById controller:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Failed to fetch attachment" 
    });
  }
}

// =======================
// Download Attachment - FIXED
// =======================
async function downloadAttachment(req, res) {
  try {
    const { attachmentId } = req.params;
    
    if (!attachmentId) {
      return res.status(400).json({ error: "AttachmentID is required" });
    }
    
    const attachment = await attachmentService.getAttachmentById(attachmentId);
    
    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found" });
    }

    // Use the correct field names
    const filePath = path.join(__dirname, "../../", attachment.FileUrl || attachment.fileUrl);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on server" });
    }

    // Set proper headers
    const fileName = attachment.FileName || attachment.fileName;
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );
    res.setHeader("Content-Type", "application/octet-stream");

    // Send the file
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error("Error in downloadAttachment controller:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Failed to download attachment" 
    });
  }
}

// =======================
// Delete Attachment - FIXED
// =======================
async function deleteAttachment(req, res) {
  try {
    const { attachmentId } = req.params;
    
    if (!attachmentId) {
      return res.status(400).json({ error: "AttachmentID is required" });
    }
    
    const result = await attachmentService.deleteAttachment(attachmentId);

    // Remove physical file (service handles DB delete)
    const fileUrl = result.fileUrl;
    if (fileUrl) {
      const filePath = path.join(__dirname, "../../", fileUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`Physical file deleted: ${filePath}`);
        } catch (unlinkError) {
          console.error("Error deleting physical file:", unlinkError);
          // Don't fail the request if file deletion fails
        }
      }
    }

    res.json({
      success: true,
      message: result.message,
      attachmentId: result.attachmentId
    });
  } catch (error) {
    console.error("Error in deleteAttachment controller:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Failed to delete attachment" 
    });
  }
}

module.exports = {
  upload,
  uploadAttachment,
  getAttachments,
  getAttachmentById,
  downloadAttachment,
  deleteAttachment,
};