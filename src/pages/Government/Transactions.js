import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Transactions.css";

const GovernmentTransactionLog = () => {
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/transactions/government/transactions");
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);
const handleApprove = async (id) => {
  try {
    await axios.put(`http://localhost:3001/api/transactions/approve/${id}`);
    alert("Transaction approved");
    fetchTransactions(); 
  } catch (err) {
    console.error("Approve error", err);
  }
};

const handleReject = async (id) => {
  try {
    await axios.delete("http://localhost:3001/api/transactions/reject/${id}");
    alert("Transaction rejected");
    fetchTransactions(); 
  } catch (err) {
    console.error("Reject error", err);
  }
};


  return (
    <div className="transaction-log">
      <h2>Government Transaction Log</h2>
      <table className="doc-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Buyer</th>
            <th>Seller</th>
            <th>Property ID</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.id}</td>
              <td>{tx.buyerEmail}</td>
              <td>{tx.sellerEmail}</td>
              <td>{tx.propertyId}</td>
              <td><span className="badge">{tx.status}</span></td>
              <td>
                {tx.status === "Payment Received" ? (
                  <>
                    <button onClick={() => handleApprove(tx.id)} className="approve-btn">✅ Approve</button>
                    <button onClick={() => handleReject(tx.id)} className="reject-btn">❌ Reject</button>
                  </>
                ) : (
                  <span>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GovernmentTransactionLog;