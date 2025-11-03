import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./SellerTransactions.css";

const SellerTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const sellerEmail = localStorage.getItem("email");

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/transactions/get-buy-requests", {
        params: { sellerEmail },
      });
      setTransactions(res.data);
    } catch (err) {
      console.error("❌ Error fetching transactions:", err);
    }
  }, [sellerEmail]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const markAsReceived = async (transactionId) => {
    try {
      const res = await axios.put(`http://localhost:3001/api/transactions/mark-received/${transactionId}`);
      alert(res.data.message);
      fetchTransactions(); // refresh after update
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  return (
    <div className="seller-transactions-container">
      <h2>Buyer Payment Proofs</h2>

      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table className="seller-transactions-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Property ID</th>
              <th>Buyer</th>
              <th>Status</th>
              <th>Payment Proof</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id}>
                <td>{txn.id}</td>
                <td>{txn.propertyId}</td>
                <td>{txn.buyerEmail}</td>
                <td>{txn.status}</td>
                <td>
                  {txn.paymentProofPath ? (
                    <a
                      href={`http://localhost:3001${txn.paymentProofPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="proof-link"
                    >
                      🔗 View Proof
                    </a>
                  ) : (
                    <span className="no-proof">Not Uploaded</span>
                  )}
                </td>
                <td>
                  {txn.status === "Paid" ? (
                    <button onClick={() => markAsReceived(txn.id)}>Mark as Received</button>
                  ) : txn.status === "Received" ? (
                    <span className="received-badge">✅ Received</span>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SellerTransactions;
