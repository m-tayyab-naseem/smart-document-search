const { ChromaClient } = require('chromadb');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { HuggingFaceInferenceEmbeddings } = require('@langchain/community/embeddings/hf');
const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

class DocumentService {
    constructor() {
        // Initialize ChromaDB with proper configuration
        this.client = new ChromaClient({
            host: "localhost",
            port: 8000,
            version: "v2"
        });

        // Using Hugging Face Inference API for embeddings
        this.embeddings = new HuggingFaceInferenceEmbeddings({
            apiKey: process.env.HUGGINGFACE_API_KEY,
            model: "sentence-transformers/all-MiniLM-L6-v2"
        });
        this.textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
            separators: ["\n\n", "\n", " ", ""]
        });
    }

    async processDocument(filePath, filename) {
        try {
            // Extract text based on file type
            const text = await this.extractText(filePath);

            // Split text into chunks using LangChain's splitter
            const chunks = await this.textSplitter.splitText(text);

            // Generate embeddings for chunks
            const embeddings = await this.embeddings.embedDocuments(chunks);

            // Store in ChromaDB
            const collection = await this.client.getOrCreateCollection({
                name: 'documents',
                metadata: { "hnsw:space": "cosine" }
            });
            console.log("Chroma client is:", this.client);


            const ids = chunks.map((_, i) => `${filename}_${i}`);
            const metadatas = chunks.map((_, i) => ({
                filename,
                chunkIndex: i,
                chunkSize: chunks[i].length
            }));

            await collection.add({
                ids,
                embeddings,
                documents: chunks,
                metadatas
            });

            return {
                success: true,
                message: 'Document processed successfully',
                filename,
                chunks: chunks.length
            };
        } catch (error) {
            console.error('Error processing document:', error);
            throw error;
        }
    }

    async extractText(filePath) {
        const ext = path.extname(filePath).toLowerCase();

        switch (ext) {
            case '.pdf':
                const pdfBuffer = await fs.readFile(filePath);
                const pdfData = await pdfParse(pdfBuffer);
                return pdfData.text;

            case '.docx':
                const docxBuffer = await fs.readFile(filePath);
                const docxResult = await mammoth.extractRawText({ buffer: docxBuffer });
                return docxResult.value;

            case '.txt':
                return await fs.readFile(filePath, 'utf-8');

            default:
                throw new Error('Unsupported file type');
        }
    }

    async searchDocuments(query, filename = null) {
        try {
            const collection = await this.client.getOrCreateCollection({
                name: 'documents',
                metadata: { "hnsw:space": "cosine" }
            });
            
            // Generate query embedding
            const queryEmbedding = await this.embeddings.embedQuery(query);
            
            // Search in ChromaDB
            const results = await collection.query({
                queryEmbeddings: [queryEmbedding],
                nResults: 5,
                where: filename ? { filename } : undefined
            });

            return {
                documents: results.documents[0],
                metadatas: results.metadatas[0],
                distances: results.distances[0]
            };
        } catch (error) {
            console.error('Error searching documents:', error);
            throw error;
        }
    }
}

module.exports = new DocumentService(); 