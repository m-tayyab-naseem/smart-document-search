"use client"

import { useState } from "react"
import axios from "axios"
import config from "../config"

function DocumentUpload({ onFileUploaded, setIsLoading, showNotification }) {
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!file) {
      showNotification("Please select a file to upload", "error")
      return
    }

    // Check file type
    const fileType = file.name.split(".").pop().toLowerCase()
    if (!["pdf", "docx", "txt"].includes(fileType)) {
      showNotification("Only PDF, DOCX, and TXT files are allowed!", "error")
      return
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      showNotification("File size should be less than 10MB", "error")
      return
    }

    const formData = new FormData()
    formData.append("document", file)

    setIsLoading(true)

    try {
      const response = await axios.post(`${config.API_URL}/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data) {
        setFile(null)
        onFileUploaded(response.data.filename)
        showNotification("File uploaded successfully!", "success")
      }
    } catch (error) {
      showNotification(error.response?.data?.error || "Error uploading file", "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="upload-container">
      <h2>Upload Documents</h2>
      <p className="description">Upload PDF, DOCX, or TXT files to process and search through their content.</p>

      <form onSubmit={handleSubmit} className="upload-form">
        <div
          className={`drop-zone ${dragActive ? "active" : ""} ${file ? "has-file" : ""}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            accept=".pdf,.docx,.txt"
            className="file-input"
          />
          <label htmlFor="file-upload" className="file-label">
            <div className="upload-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            {file ? (
              <span className="file-name">{file.name}</span>
            ) : (
              <span>Drag & drop your file here or click to browse</span>
            )}
          </label>
        </div>

        <div className="supported-formats">
          <p>Supported formats: PDF, DOCX, TXT</p>
        </div>

        <button type="submit" className="upload-button" disabled={!file}>
          Upload Document
        </button>
      </form>
    </div>
  )
}

export default DocumentUpload
