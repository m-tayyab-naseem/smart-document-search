const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const documentController = require('../controllers/documentController');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Get the original filename without extension
        const originalName = path.parse(file.originalname).name;
        // Sanitize the filename by removing special characters and spaces
        const sanitizedName = originalName.replace(/[^a-zA-Z0-9]/g, '_');
        // Get the file extension
        const ext = path.extname(file.originalname);
        // Create a unique timestamp
        const timestamp = Date.now();
        // Combine all parts to create a meaningful and unique filename
        const uniqueFilename = `${sanitizedName}_${timestamp}${ext}`;
        cb(null, uniqueFilename);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /pdf|docx|txt/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (extname) {
            return cb(null, true);
        }
        cb(new Error('Only PDF, DOCX, and TXT files are allowed!'));
    }
});

// Routes
router.post('/upload', upload.single('document'), documentController.uploadDocument);
router.get('/:filename', documentController.getDocument);
router.post('/query', documentController.queryDocuments);

module.exports = router; 