"use client"

function ResultsDisplay({ results }) {
  if (!results) {
    return null;
  }

  if (!results.answer) {
    return (
      <div className="results-container">
        <p className="no-results">No results found</p>
      </div>
    );
  }

  return (
    <div className="results-container">
      <div className="answer-section">
        <h3>Answer</h3>
        <div className="answer-content">{results.answer}</div>
      </div>
    </div>
  );
}

export default ResultsDisplay;
  