const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const documentService = require('../services/documentService');
const qaService = require('../services/qaService');

class DocumentController {
    async uploadDocument(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const result = await documentService.processDocument(
                req.file.path,
                req.file.filename
            );

            res.json(result);
        } catch (error) {
            console.error('Error in uploadDocument:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async getDocument(req, res) {
        try {
            const filename = req.params.filename;
            const filePath = path.join('uploads', filename);
            
            // Check if file exists
            await fs.access(filePath);
            
            res.sendFile(path.resolve(filePath));
        } catch (error) {
            res.status(404).json({ error: 'File not found' });
        }
    }

    async queryDocuments(req, res) {
        try {
            const { question, filename } = req.body;
            
            if (!question) {
                return res.status(400).json({ error: 'Question is required' });
            }

            const result = await qaService.answerQuestion(question, filename);
            res.json(result);
        } catch (error) {
            console.error('Error in queryDocuments:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new DocumentController(); 