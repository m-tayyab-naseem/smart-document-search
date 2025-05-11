const { ChatGroq } = require('@langchain/groq');
const { PromptTemplate } = require('@langchain/core/prompts');
const { RunnableSequence } = require('@langchain/core/runnables');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const documentService = require('./documentService');

class QAService {
    constructor() {
        // Using Groq's cloud API with Llama 3
        this.llm = new ChatGroq({
            model: "llama3-70b-8192",
            apiKey: process.env.GROQ_API_KEY,
            temperature: 0.1,
        });
    }

    async answerQuestion(question, filename = null) {
        try {
            // Search for relevant document chunks
            const searchResults = await documentService.searchDocuments(question, filename);
            
            if (!searchResults.documents.length) {
                return {
                    answer: "I couldn't find any relevant information to answer your question.",
                    sources: []
                };
            }

            // Create a prompt template
            const prompt = PromptTemplate.fromTemplate(`
                You are a helpful AI assistant. Answer the question based on the following context.
                If you cannot find the answer in the context, say "I don't know."
                Be concise and accurate in your response.

                Context:
                {context}

                Question: {question}
                
                Answer:
            `);

            // Combine all relevant chunks into context
            const context = searchResults.documents.join('\n\n');

            // Create a chain with proper LangChain components
            const chain = RunnableSequence.from([
                {
                    context: () => context,
                    question: () => question
                },
                prompt,
                this.llm,
                new StringOutputParser()
            ]);

            // Get the answer
            const answer = await chain.invoke({});

            // Prepare sources
            const sources = searchResults.documents.map((doc, i) => ({
                content: doc,
                filename: searchResults.metadatas[i].filename,
                relevance: searchResults.distances[i]
            }));

            return {
                answer,
                sources
            };
        } catch (error) {
            console.error('Error answering question:', error);
            throw error;
        }
    }
}

module.exports = new QAService(); 