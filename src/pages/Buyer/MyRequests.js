import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MyRequests = ({ onChat }) => {
  const [requests, setRequests] = useState([]);
  const buyerEmail = localStorage.getItem("email");

  useEffect(() => {
    axios
      .get(`http://localhost:3001/api/transactions/buyer-requests?buyerEmail=${buyerEmail}`)
      .then(res => setRequests(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="request-container">
      <h2>My Buy Requests</h2>
      <table className="request-table">
        <thead>
          <tr>
            <th>Property ID</th>
            <th>Status</th>
            <th>Chat</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(req => (
            <tr key={req.id}>
              <td>{req.propertyId}</td>
              <td>{req.status}</td>
              <td>
                {req.status === 'Accepted' ? (
                  <button
                    className="chat-btn"
                    onClick={() => onChat(req.propertyId)}
                  >
                    💬 Chat
                  </button>
                ) : (
                  <span style={{ color: "gray", fontWeight: "bold" }}>Pending...</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyRequests;
