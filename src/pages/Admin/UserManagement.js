import React, { useEffect, useState } from 'react';
import './UserManagement.css';
import axios from 'axios';

// ✅ ActionIcon component
const ActionIcon = ({ status }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" className="action-icon">
    <circle cx="10" cy="6" r="3" fill="#555" />
    <path d="M10 10C6.5 10 3 12 3 15v2h14v-2c0-3-3.5-5-7-5z" fill="#555" />
    {status === 'approve' && (
      <path d="M16 6l-6 6-3-3" stroke="#0a0" strokeWidth="2" fill="none" strokeLinecap="round" />
    )}
    {status === 'suspend' && (
      <path d="M5 5l10 10M5 15l10-10" stroke="#a00" strokeWidth="2" strokeLinecap="round" />
    )}
  </svg>
);

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:3001/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:3001/admin/users/${id}/status`, { status: newStatus });
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <div className="user-management">
      <h1>User Management</h1>
      <p className="subtitle">Manage Buyer and Seller accounts. Approve, suspend, or reactivate users.</p>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Date Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name || '-'}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.status}</td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  {/* ✅ Show 'Verify' button only if not verified */}
                  {user.status !== 'verified' && (
                    <button className="action-button" onClick={() => handleStatusChange(user.id, 'verified')}>
                      <ActionIcon status="approve" /> Verify
                    </button>
                  )}

                  {/* ✅ Show 'Suspend' button only if not suspended AND not verified */}
                  {user.status !== 'suspended' && user.status !== 'verified' && (
                    <button className="action-button" onClick={() => handleStatusChange(user.id, 'suspended')}>
                      <ActionIcon status="suspend" /> Suspend
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="footer-note">List of registered Buyers and Sellers.</p>
    </div>
  );
};

export default UserManagement;
