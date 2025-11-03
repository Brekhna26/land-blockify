import React, { useEffect, useState } from 'react';
import "./Transaction.css";

const TransactionLog = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/transactions/admin"); // ✅ This route must return only Approved/Rejected
        const data = await res.json();

        const enhanced = data.map(t => ({
          ...t,
          type: 'Buy Request',
          date: new Date(t.created_at || t.updated_at || Date.now()).toLocaleDateString(),
          statusClass:
            t.status.toLowerCase() === 'approved' ? 'status-approved' :
            t.status.toLowerCase() === 'pending' ? 'status-pending' :
            t.status.toLowerCase() === 'rejected' ? 'status-rejected' :
            'status-projects'
        }));

        setTransactions(enhanced);
      } catch (err) {
        console.error("❌ Failed to fetch transactions", err);
      }
    };

    fetchTransactions();
  }, []);

  const renderStatusIcon = (statusClass) => {
    return (
      <span className={`status-icon ${statusClass}`}>
        {statusClass === 'status-approved' && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#00AA00" strokeWidth="1"/>
            <path d="M5 8L7 10L11 6" stroke="#00AA00" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        )}
        {statusClass === 'status-pending' && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#FFA500" strokeWidth="1"/>
            <path d="M8 4V8L11 10" stroke="#FFA500" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        )}
        {statusClass === 'status-projects' && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#1E90FF" strokeWidth="1"/>
            <path d="M8 5V11M5 8H11" stroke="#1E90FF" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        )}
        {statusClass === 'status-rejected' && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#FF0000" strokeWidth="1"/>
            <path d="M5 5L11 11M5 11L11 5" stroke="#FF0000" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        )}
      </span>
    );
  };

  return (
    <div className="transaction-log-container">
      <h1>Transaction Log</h1>
      <p className="subtitle">Only Approved and Rejected transactions are shown here.</p>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>TXN ID</th>
              <th>Property ID</th>
              <th>Type</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((txn, index) => (
                <tr key={index}>
                  <td>{txn.id}</td>
                  <td>{txn.propertyId}</td>
                  <td>{txn.type}</td>
                  <td>{txn.date}</td>
                  <td className="status-cell">
                    {renderStatusIcon(txn.statusClass)}
                    <span>{txn.status}</span>
                  </td>
                  <td><button className="details-button">Details</button></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No Approved or Rejected transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="footer-note">These are transactions acted upon by the Government.</p>
    </div>
  );
};

export default TransactionLog;
