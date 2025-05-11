"use client"

import { useState } from "react"
import axios from "axios"
import config from "../config"
import "./DocumentSearch.css"

function DocumentSearch({ onSearchResults, setIsLoading, uploadedFiles, showNotification }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFile, setSelectedFile] = useState("")

  const handleSearch = async (e) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      showNotification("Please enter a search query", "error")
      return
    }

    if (!selectedFile) {
      showNotification("Please select a document to search", "error")
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.post(`${config.API_URL}/documents/query`, {
        question: searchQuery,
        filename: selectedFile
      })

      if (response.data) {
        onSearchResults(response.data)
        showNotification("Search completed successfully!", "success")
      }
    } catch (error) {
      showNotification(error.response?.data?.error || "Error performing search", "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="search-container">
      <h2>Search Documents</h2>
      <p className="description">Search through your uploaded documents using natural language queries.</p>

      <form onSubmit={handleSearch} className="search-form">
        <div className="form-group">
          <label htmlFor="document-select">Select Document:</label>
          <select
            id="document-select"
            className="file-select"
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
            required
          >
            <option value="">Choose a document</option>
            {uploadedFiles.map((file, index) => (
              <option key={index} value={file}>
                {file}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="search-query">Search Query:</label>
          <input
            type="text"
            id="search-query"
            value={searchQuery}
            className="question-input"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter your search query..."
            required
          />
        </div>

        <button type="submit" className="search-button">
          Search
        </button>
      </form>
    </div>
  )
}

export default DocumentSearch



