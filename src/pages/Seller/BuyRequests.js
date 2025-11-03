import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './BuyRequests.css';

export default function BuyRequests({ openChat }) {
  const [requests, setRequests] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('Requested');
  const sellerEmail = localStorage.getItem("email");

  const fetchRequests = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/transactions/get-buy-requests?sellerEmail=${encodeURIComponent(sellerEmail)}`);
      setRequests(res.data);
    } catch (err) {
      console.error("❌ Error fetching buy requests:", err);
    }
  }, [sellerEmail]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAccept = async (id) => {
    setProcessingId(id);
    try {
      await axios.post(`http://localhost:3001/api/transactions/accept`, { id });
      setRequests(prev =>
        prev.map(req =>
          req.id === id ? { ...req, status: "Accepted" } : req
        )
      );
      alert('✅ Request accepted! Waiting for government approval.');
    } catch (err) {
      console.error("❌ Error accepting request:", err);
      alert('❌ Failed to accept request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this request?')) {
      return;
    }

    setProcessingId(id);
    try {
      await axios.post(`http://localhost:3001/api/transactions/reject-transaction/${id}`);
      setRequests(prev => prev.filter(r => r.id !== id));
      alert('❌ Request rejected');
    } catch (err) {
      console.error("❌ Error rejecting request:", err);
      alert("❌ Failed to reject request");
    } finally {
      setProcessingId(null);
    }
  };

  const handleChat = (propertyId) => {
    if (openChat) openChat(propertyId);
  };

  // Filter requests by status
  const filteredRequests = requests.filter(r => r.status === filterStatus);

  // Count by status
  const requestedCount = requests.filter(r => r.status === 'Requested').length;
  const acceptedCount = requests.filter(r => r.status === 'Accepted').length;
  const rejectedCount = requests.filter(r => r.status === 'Rejected').length;

  return (
    <div className="request-container">
      <div className="requests-header">
        <h2>📩 Incoming Buy Requests</h2>
        <p>Review and manage buyer purchase requests for your properties</p>
      </div>

      {/* Status Filter */}
      <div className="filter-section">
        <label>Filter by Status:</label>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="Requested">Requested ({requestedCount})</option>
          <option value="Accepted">Accepted ({acceptedCount})</option>
          <option value="Rejected">Rejected ({rejectedCount})</option>
        </select>
      </div>

      {requests.length === 0 ? (
        <div className="no-requests">
          <p>📭 No buy requests yet</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="no-requests">
          <p>No requests with status "{filterStatus}"</p>
        </div>
      ) : (
        <div className="requests-table-wrapper">
          <table className="request-table">
            <thead>
              <tr>
                <th>Property ID</th>
                <th>Buyer Email</th>
                <th>Status</th>
                <th>Requested Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(req => (
                <tr key={req.id} className={`request-row status-${req.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  <td className="property-id">{req.propertyId}</td>
                  <td className="buyer-email">{req.buyerEmail}</td>
                  <td className="status">
                    <span className={`badge badge-${req.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="date">
                    {new Date(req.created_at).toLocaleDateString()}
                  </td>
                  <td className="actions">
                    {req.status === "Requested" ? (
                      <>
                        <button
                          className="btn btn-accept"
                          onClick={() => handleAccept(req.id)}
                          disabled={processingId === req.id}
                          title="Accept this purchase request"
                        >
                          {processingId === req.id ? '⏳ Processing...' : '✅ Accept'}
                        </button>
                        <button
                          className="btn btn-reject"
                          onClick={() => handleReject(req.id)}
                          disabled={processingId === req.id}
                          title="Reject this purchase request"
                        >
                          ❌ Reject
                        </button>
                      </>
                    ) : req.status === "Accepted" ? (
                      <>
                        <button
                          className="btn btn-chat"
                          onClick={() => handleChat(req.propertyId)}
                          title="Chat with buyer"
                        >
                          💬 Chat
                        </button>
                        <button
                          className="btn btn-reject"
                          onClick={() => handleReject(req.id)}
                          disabled={processingId === req.id}
                          title="Reject this request"
                        >
                          ❌ Reject
                        </button>
                      </>
                    ) : (
                      <span className="status-text">Rejected</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Stats */}
      <div className="requests-summary">
        <div className="stat">
          <span className="stat-label">Total Requests:</span>
          <span className="stat-value">{requests.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Pending:</span>
          <span className="stat-value">{requestedCount}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Accepted:</span>
          <span className="stat-value">{acceptedCount}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Rejected:</span>
          <span className="stat-value">{rejectedCount}</span>
        </div>
      </div>
    </div>
  );
}
