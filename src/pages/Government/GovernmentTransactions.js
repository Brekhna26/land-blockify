import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './GovernmentTransactions.css';

export default function GovernmentTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('Accepted');

  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3001/api/transactions/government');
      setTransactions(res.data);
    } catch (err) {
      console.error('❌ Error fetching transactions:', err);
      alert('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  // Government approves transaction
  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await axios.post(`http://localhost:3001/api/transactions/approve-transaction/${id}`);
      
      // Update local state
      setTransactions(prev =>
        prev.map(t =>
          t.id === id ? { ...t, status: 'Government Approved' } : t
        )
      );
      
      alert('✅ Transaction approved! Ready for blockchain finalization.');
    } catch (err) {
      console.error('❌ Error approving transaction:', err);
      alert('❌ Failed to approve transaction');
    } finally {
      setProcessingId(null);
    }
  };

  // Government rejects transaction
  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this transaction?')) {
      return;
    }

    setProcessingId(id);
    try {
      await axios.post(`http://localhost:3001/api/transactions/reject-transaction/${id}`);
      
      // Remove from list
      setTransactions(prev => prev.filter(t => t.id !== id));
      
      alert('❌ Transaction rejected');
    } catch (err) {
      console.error('❌ Error rejecting transaction:', err);
      alert('❌ Failed to reject transaction');
    } finally {
      setProcessingId(null);
    }
  };

  // Filter transactions by status
  const filteredTransactions = transactions.filter(t => t.status === filterStatus);

  return (
    <div className="government-transactions">
      <div className="transactions-header">
        <h2>📋 Transaction Approvals</h2>
        <p>Review and approve buyer-seller transactions for blockchain finalization</p>
      </div>

      {/* Status Filter */}
      <div className="filter-section">
        <label>Filter by Status:</label>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="Accepted">Accepted (Pending Approval)</option>
          <option value="Government Approved">Government Approved (Ready for Blockchain)</option>
          <option value="Completed">Completed (Finalized)</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">⏳ Loading transactions...</div>
      ) : filteredTransactions.length === 0 ? (
        <div className="no-data">
          <p>No transactions with status "{filterStatus}"</p>
        </div>
      ) : (
        <div className="transactions-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Property ID</th>
                <th>Buyer Email</th>
                <th>Seller Email</th>
                <th>Location</th>
                <th>Area (sq m)</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className={`transaction-row status-${transaction.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  <td className="property-id">{transaction.propertyId}</td>
                  <td className="email">{transaction.buyerEmail}</td>
                  <td className="email">{transaction.sellerEmail}</td>
                  <td className="location">{transaction.location}</td>
                  <td className="area">{transaction.landArea}</td>
                  <td className="type">{transaction.propertyType}</td>
                  <td className="status">
                    <span className={`badge badge-${transaction.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="actions">
                    {transaction.status === 'Accepted' ? (
                      <>
                        <button
                          className="btn btn-approve"
                          onClick={() => handleApprove(transaction.id)}
                          disabled={processingId === transaction.id}
                          title="Approve this transaction for blockchain finalization"
                        >
                          {processingId === transaction.id ? '⏳ Processing...' : '✅ Approve'}
                        </button>
                        <button
                          className="btn btn-reject"
                          onClick={() => handleReject(transaction.id)}
                          disabled={processingId === transaction.id}
                          title="Reject this transaction"
                        >
                          ❌ Reject
                        </button>
                      </>
                    ) : transaction.status === 'Government Approved' ? (
                      <span className="badge-info">⏳ Awaiting Blockchain Finalization</span>
                    ) : transaction.status === 'Completed' ? (
                      <span className="badge-success">✅ Finalized</span>
                    ) : (
                      <span className="badge-danger">❌ Rejected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Stats */}
      <div className="transactions-summary">
        <div className="stat">
          <span className="stat-label">Total Transactions:</span>
          <span className="stat-value">{transactions.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Pending Approval:</span>
          <span className="stat-value">{transactions.filter(t => t.status === 'Accepted').length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Ready for Blockchain:</span>
          <span className="stat-value">{transactions.filter(t => t.status === 'Government Approved').length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Completed:</span>
          <span className="stat-value">{transactions.filter(t => t.status === 'Completed').length}</span>
        </div>
      </div>
    </div>
  );
}
