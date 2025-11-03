import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BuyerTransactions.css';

export default function BuyerTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [selectedFile, setSelectedFile] = useState({});
  const [uploadingId, setUploadingId] = useState(null);
  const buyerEmail = localStorage.getItem("email");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/transactions/buyer-requests?buyerEmail=${buyerEmail}`);
        setTransactions(res.data);
      } catch (err) {
        console.error("❌ Error fetching transactions:", err);
      }
    };

    fetchTransactions();
  }, [buyerEmail]);

  const handleFileChange = (transactionId, file) => {
    setSelectedFile(prev => ({ ...prev, [transactionId]: file }));
  };

  const handleUpload = async (transactionId) => {
    const file = selectedFile[transactionId];
    if (!file) {
      alert("⚠️ Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append('paymentProof', file);
    formData.append('transactionId', transactionId);

    try {
      setUploadingId(transactionId);
      await axios.post("http://localhost:3001/api/transactions/upload-payment", formData);
      alert("✅ Payment proof uploaded successfully!");
      window.location.reload();
    } catch (error) {
      console.error("❌ Upload error:", error);
      alert("❌ Failed to upload payment proof.");
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="transaction-container">
      <h2>My Transactions</h2>
      {transactions.length === 0 ? (
        <p>No transactions yet.</p>
      ) : (
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Property ID</th>
              <th>Status</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td>{t.propertyId}</td>
                <td>{t.status}</td>
                <td>
                  {t.status === 'Accepted' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <input type="file" onChange={(e) => handleFileChange(t.id, e.target.files[0])} />
                        <button className="upload-btn" onClick={() => handleUpload(t.id)}>
                          {uploadingId === t.id ? "Uploading..." : "Upload"}
                        </button>
                      </div>
                      {t.paymentProofPath && (
                        <a href={`http://localhost:3001${t.paymentProofPath}`} target="_blank" rel="noopener noreferrer">
                          View Proof
                        </a>
                      )}
                    </div>
                  ) : t.paymentProofPath ? (
                    <a href={`http://localhost:3001${t.paymentProofPath}`} target="_blank" rel="noopener noreferrer">
                      View Proof
                    </a>
                  ) : (
                    <span>--</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
