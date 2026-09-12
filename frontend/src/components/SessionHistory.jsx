import React, { useState, useEffect } from "react";

const API_URL = "";

export default function SessionHistory({ onClose }) {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/session-history`)
      .then((r) => r.json())
      .then(setHistory)
      .catch(() => {});
    fetch(`${API_URL}/api/stats`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div className="session-history">
      <div className="history-header">
        <h3>Session Stats</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{stats.total_tool_calls}</span>
            <span className="stat-label">Tool Calls</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{Object.keys(stats.tool_counts).length}</span>
            <span className="stat-label">Unique Tools</span>
          </div>
        </div>
      )}

      {stats && Object.keys(stats.tool_counts).length > 0 && (
        <div className="tool-usage">
          <p className="usage-title">Tool Usage</p>
          {Object.entries(stats.tool_counts)
            .sort((a, b) => b[1] - a[1])
            .map(([tool, count]) => (
              <div key={tool} className="usage-row">
                <span className="usage-name">{tool.replace(/_/g, " ")}</span>
                <span className="usage-count">{count}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
