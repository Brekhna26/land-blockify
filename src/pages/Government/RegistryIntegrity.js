import React, { useState, useEffect } from "react";
import "./RegistryIntegrity.css";
import { FaHeartbeat, FaClock, FaCheckCircle } from "react-icons/fa";
const RegistryIntegrity = () => {
  const [health, setHealth] = useState("Healthy");
  const [consistency, setConsistency] = useState(99.98);
  const [flags, setFlags] = useState(2);
  const [lastCheck, setLastCheck] = useState(new Date());
  const [dbSize, setDbSize] = useState("25.7 GB");
  const [connections, setConnections] = useState(152);

 const [isRunning, setIsRunning] = useState(false);
const runIntegrityCheck = () => {
  setIsRunning(true);
  setTimeout(() => {
    const now = new Date();
    setLastCheck(now);
    setHealth("Healthy");
    setConsistency((99.9 + Math.random() * 0.09).toFixed(2));
    setFlags(Math.floor(Math.random() * 5));
    setDbSize(`${(25 + Math.random()).toFixed(1)} GB`);
    setConnections(120 + Math.floor(Math.random() * 50));
    setIsRunning(false);
  }, 1000); 
};


  return (
    <div className="integrity-container">
      <div className="integrity-header">
        <h2>
          <FaHeartbeat className="header-icon" />
          Registry Integrity Monitoring
        </h2>
        <p>Monitor the health, consistency, and security of the land registry system.</p>
        <button className="check-btn" onClick={runIntegrityCheck} disabled={isRunning}>
  <FaCheckCircle style={{ marginRight: "6px" }} />
  {isRunning ? "Running..." : "Run Integrity Check"}
</button>

      </div>

      <div className="card-section">
        <div className="integrity-card">
          <h4>Overall Health</h4>
          <h2 className="green-text">{health}</h2>
          <p>Based on latest system diagnostics.</p>
        </div>

        <div className="integrity-card">
          <h4>Data Consistency</h4>
          <h2>{consistency}%</h2>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${consistency}%` }}></div>
          </div>
          <p>Cross-referenced data validation.</p>
        </div>

        <div className="integrity-card">
          <h4>Potential Flags</h4>
          <h2>{flags}</h2>
          <p>Items requiring review or attention.</p>
        </div>
      </div>

      <div className="summary-section">
        <p className="summary-title">
          <FaClock style={{ marginRight: "8px" }} />
          Last Integrity Check
        </p>
        <p><strong>{lastCheck.toLocaleString()}</strong></p>
        <p>Database Size: {dbSize} | Active Connections: {connections}</p>
      </div>
    </div>
  );
};

export default RegistryIntegrity;
