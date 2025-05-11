"use client"

function Header({ activeTab, onTabChange }) {
  return (
    <header className="header">
      <div className="logo">
        <h1>Smart Document Search</h1>
      </div>
      <nav className="nav">
        <ul>
          <li className={activeTab === "upload" ? "active" : ""} onClick={() => onTabChange("upload")}>
            Upload Documents
          </li>
          <li className={activeTab === "search" ? "active" : ""} onClick={() => onTabChange("search")}>
            Search Documents
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Header
