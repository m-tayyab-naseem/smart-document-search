const express = require('express');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS
app.use(cors());

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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
const documentRoutes = require('./routes/documentRoutes');
app.use('/api/documents', documentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
