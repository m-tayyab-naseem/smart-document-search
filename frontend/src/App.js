"use client"

import { useState } from "react"
import "./App.css"
import Header from "./components/Header"
import DocumentUpload from "./components/DocumentUpload"
import DocumentSearch from "./components/DocumentSearch"
import ResultsDisplay from "./components/ResultsDisplay"

function App() {
  const [activeTab, setActiveTab] = useState("upload")
  const [searchResults, setSearchResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [notification, setNotification] = useState(null)

  const showNotification = (message, type = "info") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleSearchResults = (results) => {
    setSearchResults(results)
  }

  const handleFileUploaded = (filename) => {
    setUploadedFiles((prev) => [...prev, filename])
    showNotification(`Document "${filename}" uploaded successfully!`, "success")
  }

  return (
    <div className="app">
      <Header activeTab={activeTab} onTabChange={handleTabChange} />

      {notification && <div className={`notification ${notification.type}`}>{notification.message}</div>}

      <main className="main-content">
        {activeTab === "upload" ? (
          <DocumentUpload
            onFileUploaded={handleFileUploaded}
            setIsLoading={setIsLoading}
            showNotification={showNotification}
          />
        ) : (
          <DocumentSearch
            onSearchResults={handleSearchResults}
            setIsLoading={setIsLoading}
            uploadedFiles={uploadedFiles}
            showNotification={showNotification}
          />
        )}

        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Processing your request...</p>
          </div>
        )}

        {searchResults && activeTab === "search" && <ResultsDisplay results={searchResults} />}
      </main>
    </div>
  )
}

export default App
