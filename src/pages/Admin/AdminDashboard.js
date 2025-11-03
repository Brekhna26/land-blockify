import React, { useState, useEffect, useRef, Profiler } from "react";
import {
  FiHome, FiShoppingCart, FiDollarSign, FiUsers, FiUser, FiSettings, FiBell,
  FiTrendingUp, FiActivity, FiAlertCircle, FiDatabase, FiShield, FiArrowRight, FiLogOut,
} from "react-icons/fi";
import axios from "axios";
import logo from '../../assets/dashlogo.png';
import LandMarketplace from "./Marketplace";
import Transaction from './Transaction';
import UserManagement from './UserManagement';
import Profile from "./Profile";
import Settings from './Settings';
import "./AdminDashboard.css";
import { FiRefreshCw} from "react-icons/fi";
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("Land enthusiast and property investor. Looking for new opportunities in the agricultural sector.");
  const [fullName, setFullName] = useState("Ahtisham Mughal");
  const email = localStorage.getItem("email"); 
  const dropdownRef = useRef(null);
const [loading, setLoading] = useState(false);
  useEffect(() => {
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');
    if (email) setUserEmail(email);
    if (role) setUserRole(role);
  }, []);
const [stats, setStats] = useState(null);

useEffect(() => {
  if (activeTab === "Analytics") {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/admin/get-stats");
        console.log("Fetched stats:", res.data); 
        setStats(res.data); 
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        setLoading(false);
      }
    };
    fetchStats();
  }
}, [activeTab]);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    window.location.href = "/create-account";
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleSave = () => {
    setIsEditing(false);
    alert("Profile saved successfully!");
  };
  const renderMainContent = () => {
    switch (activeTab) {
      case "Marketplace":
        return <LandMarketplace />;
      case "Transactions":
        return <Transaction />;
      case "UserManagement":
        return <UserManagement />;
        case Profile:
          return<Profile/>
        case "Analytics":
  return (
    <div className="analytics-overview">
      <h2>Analytical Overview</h2>
      {!stats ? (
        <p>Loading stats...</p>
      ) : (
        <div className="analytics-cards">
          <div className="analytics-card">
            <h3>Total Users</h3>
            <p>{stats.totalUsers}</p>
          </div>
          <div className="analytics-card">
            <h3>Properties Registered</h3>
            <p>{stats.propertiesRegistered}</p>
          </div>
          <div className="analytics-card">
            <h3>Transactions Processed</h3>
            <p>{stats.transactionsProcessed}</p>
          </div>
          <div className="analytics-card">
            <h3>Role Breakdown</h3>
            <ul>
              <li>Buyers: {stats.userRoles.buyers}</li>
              <li>Sellers: {stats.userRoles.sellers}</li>
              <li>Authorities: {stats.userRoles.authorities}</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
      case "RegistryIntegrity":
  return (
    <div className="registry-integrity-wrapper">
      <div className="integrity-header">
        <FiShield className="header-icon green-icon" />
        <div>
          <h2>Registry Integrity Monitoring</h2>
          <p className="subtitle">
            Monitor the health, consistency, and on-chain verification of land records.
          </p>
        </div>
      </div>

      {/* Button Right Above the Cards */}
      <div className="integrity-button-top-right">
        <button className="run-check-button">
          <FiRefreshCw className="btn-icon" />
          Run Integrity Check
        </button>
      </div>
      <div className="integrity-cards">
        <div className="integrity-card health">
          <h3>Overall Health</h3>
          <p className="status ok">✔ All Systems Operational</p>
        </div>
        <div className="integrity-card consistency">
          <h3>Data Consistency</h3>
          <p className="status ok">✔ Records Consistent</p>
        </div>
        <div className="integrity-card alerts">
          <h3>Potential Flags</h3>
          <p className="status warn">⚠ 0 Conflicts Detected</p>
        </div>
      </div>
      <div className="integrity-summary">
        <h4>Last Check Summary</h4>
        <ul>
          <li><strong>Last Checked:</strong> June 12, 2025 – 02:00 AM</li>
          <li><strong>Database Size:</strong> 120.8 MB</li>
          <li><strong>Active Connections:</strong> 5</li>
        </ul>
      </div>
    </div>
  );
      case "Settings":
        return <Settings />;
        case "SecurityAlerts":
  return (
    <div className="security-alerts-wrapper">
      <div className="alerts-header">
        <div className="alerts-header-left">
          <FiShield className="alerts-icon" />
          <div>
            <h2>Security Alerts</h2>
            <p className="alerts-subtitle">Monitor and respond to security incidents and potential threats.</p>
          </div>
        </div>
        <button className="acknowledge-button">Acknowledge All Resolved</button>
      </div>
      <table className="alerts-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Severity</th>
            <th>Type</th>
            <th>Description</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr className="high-alert">
            <td>6/11/2025, 8:13:36 PM</td>
            <td><span className="badge high">High</span></td>
            <td><strong>Brute Force Attack</strong></td>
            <td>Multiple failed login attempts for admin@example.com from IP 123.45.67.89.</td>
            <td><span className="status-badge new">New</span></td>
            <td><button className="action-button green">Investigate</button></td>
          </tr>
          <tr>
            <td>6/10/2025, 8:43:36 PM</td>
            <td><span className="badge medium">Medium</span></td>
            <td><strong>Unusual Activity</strong></td>
            <td>Unusual data access pattern detected for user seller_xyz.</td>
            <td><span className="status-badge investigating">Investigating</span></td>
            <td><button className="action-button orange">Mark Resolved</button></td>
          </tr>
          <tr>
            <td>6/9/2025, 8:43:36 PM</td>
            <td><span className="badge low">Low</span></td>
            <td><strong>System Vulnerability</strong></td>
            <td>Outdated SSL certificate found on sub.domain.com.</td>
            <td><span className="status-badge resolved">Resolved</span></td>
            <td><button className="view-button">View Details</button></td>
          </tr>
          <tr className="high-alert">
            <td>6/11/2025, 7:43:36 PM</td>
            <td><span className="badge high">High</span></td>
            <td><strong>SQL Injection Attempt</strong></td>
            <td>Potential SQL injection attempt detected on /api/search.</td>
            <td><span className="status-badge new">New</span></td>
            <td><button className="action-button green">Investigate</button></td>
          </tr>
          <tr>
            <td>6/9/2025, 8:43:36 PM</td>
            <td><span className="badge info">Info</span></td>
            <td><strong>Security Scan</strong></td>
            <td>Weekly vulnerability scan completed. 0 critical issues found.</td>
            <td><span className="status-badge archived">Archived</span></td>
            <td><button className="view-button">View Details</button></td>
          </tr>
        </tbody>
      </table>
      <p className="footer-text">A list of recent security alerts. Displaying last 5 alerts.</p>
    </div>
  );
  case 'systemLogs':
  return (
    <div className="system-logs-container">
      <div className="system-logs-header">
        <h2>🧾 System Logs</h2>
        <span className="system-logs-description">View system activity, audit trails, and important events.</span>
      </div>

      <div className="system-logs-table-wrapper">
        <table className="system-logs-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Level</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {[
              {
                timestamp: '6/11/2025, 6:38:51 PM',
                level: 'Info',
                message: 'User admin@example.com logged in from IP 192.168.1.10.',
              },
              {
                timestamp: '6/11/2025, 5:38:51 PM',
                level: 'Warning',
                message: 'High CPU usage detected on server-main. Current load: 85%.',
              },
              {
                timestamp: '6/11/2025, 4:38:51 PM',
                level: 'Error',
                message: 'Failed to process payment for TXN567. Reason: Insufficient funds.',
              },
              {
                timestamp: '6/10/2025, 7:38:51 PM',
                level: 'Info',
                message: 'System backup completed successfully. Backup ID: BKUP_20240727_0300.',
              },
              {
                timestamp: '6/10/2025, 6:38:51 PM',
                level: 'Info',
                message: 'New property PROP999 registered by seller@example.com.',
              },
              {
                timestamp: '6/10/2025, 5:15:31 PM',
                level: 'Warning',
                message: 'Unusual login attempt for user buyer@example.com from unrecognized device.',
              },
              {
                timestamp: '6/10/2025, 3:52:11 PM',
                level: 'Error',
                message: 'Database connection pool exhausted. Attempts: 5.',
              },
            ].map((log, index) => (
              <tr
                key={index}
                className={
                  log.level === 'Error'
                    ? 'system-logs-row-error'
                    : log.level === 'Warning'
                    ? 'system-logs-row-warning'
                    : 'system-logs-row-info'
                }
              >
                <td className="system-logs-td">{log.timestamp}</td>
                <td className="system-logs-td">
                  <span
                    className={`system-logs-label ${
                      log.level === 'Info'
                        ? 'label-info'
                        : log.level === 'Warning'
                        ? 'label-warning'
                        : 'label-error'
                    }`}
                  >
                    {log.level}
                  </span>
                </td>
                <td className="system-logs-td">{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="system-logs-footer">
        A list of recent system events. Displaying last 7 entries.
      </div>
      <div className="system-logs-export-btn">
        <button>Export Logs</button>
      </div>
    </div>
  );
    case "Dashboard":
      default:
        return (
          <div className="dashboard-content">
            <h2 className="dashboard-heading">Admin Dashboard</h2>
            <div className="admin-cards-container">
             {/* User Management Card */}
            <div className="admin-card">
              <div className="card-header">
                <FiUsers className="card-icon" />
                <h3>User Management</h3>
              </div>
              <p>View, verify, or suspend user accounts. Monitor and manage Buyer and Seller accounts.</p>
             <button className="card-action" onClick={() => setActiveTab("UserManagement")}>
             Manage Users <FiArrowRight />
          </button>
            </div>
            {/* Analytics Overview Card */}
            <div className="admin-card">
              <div className="card-header">
                <FiTrendingUp className="card-icon" />
                <h3>Analytics Overview</h3>
              </div>
              <p>View key platform metrics and user activity. Track platform growth and engagement.</p>
               <button className="card-action" onClick={() => setActiveTab("Analytics")}>
                View Analytics <FiArrowRight />
               </button>

            </div>

            {/* System Logs Card */}
            <div className="admin-card">
              <div className="card-header">
                <FiActivity className="card-icon" />
                <h3>System Logs</h3>
              </div>
              <p>View system activity and audit trails. Review important system events and errors.</p>
              <button className="card-action"  onClick={() => setActiveTab("systemLogs")}>View Logs <FiArrowRight /></button>
            </div>

            {/* Security Alerts Card */}
            <div className="admin-card">
              <div className="card-header">
                <FiAlertCircle className="card-icon" />
                <h3>Security Alerts</h3>
              </div>
              <p>Monitor and respond to security incidents. Stay informed about potential security issues.</p>
              <button className="card-action" onClick={() => setActiveTab("SecurityAlerts")}>View Alerts <FiArrowRight /></button>
            </div>

            {/* Transaction Monitoring Card */}
            <div className="admin-card">
              <div className="card-header">
                <FiDatabase className="card-icon" />
                <h3>Transaction Monitoring</h3>
              </div>
              <p>Oversee all land transactions in the system. Admin has view-only access to transaction logs.</p>
              <button className="card-action "   onClick={() => setActiveTab("Transactions")}>
                Monitor Transactions <FiArrowRight /></button>
            </div>

            {/* Registry Integrity Card */}
            <div className="admin-card">
              <div className="card-header">
                <FiShield className="card-icon" />
                <h3>Registry Integrity</h3>
              </div>
              <p>Monitor the overall health and integrity of the land registry. View system status and data consistency metrics.</p>
               <button className="card-action" onClick={() => setActiveTab("RegistryIntegrity")}>
               Monitor Integrity <FiArrowRight />
              </button>
            </div>

            </div>
          </div>
        );
    }
  };

  return (
    <div className="admin-container">
      <aside className="sidebar">
        <div className="logo-section">
          <img src={logo} alt="Landblockify Logo" className="logo-img" />
        </div>
        <nav className="sidebar-nav">
          <NavItem icon={<FiHome />} text="Dashboard" onClick={() => setActiveTab("Dashboard")} active={activeTab === "Dashboard"} />
          <NavItem icon={<FiShoppingCart />} text="Marketplace" onClick={() => setActiveTab("Marketplace")} active={activeTab === "Marketplace"} />
          <NavItem icon={<FiDollarSign />} text="Transactions" onClick={() => setActiveTab("Transactions")} active={activeTab === "Transactions"} />
          <NavItem icon={<FiUsers />} text="User Management" onClick={() => setActiveTab("UserManagement")} active={activeTab === "UserManagement"} />
          <NavItem icon={<FiUser />} text="Profile" onClick={() => setActiveTab("Profile")} active={activeTab === "Profile"} />
          <NavItem icon={<FiSettings />} text="Settings" onClick={() => setActiveTab("Settings")} active={activeTab === "Settings"} />
        </nav>
        <div className="user-profile">
          <div className="user-avatar"><span>{userEmail?.charAt(0)?.toUpperCase() || 'A'}</span></div>
          <div className="user-info">
            <p className="username">{userEmail || 'Unknown'}</p>
            <p className="user-role">{userRole || 'Unknown'}</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="admin-navbar">
          <div className="nav-right">
            
            <div className="profile-dropdown-container" ref={dropdownRef}>
              <div className="profile-circle" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <FiUser />
              </div>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <p>{userEmail || 'Unknown'}</p>
                    <p className="email">{userEmail || 'Unknown'}</p>
                    <p className="role">Role: <strong>{userRole || 'Unknown'}</strong></p>
                  </div>
                  <div className="dropdown-item" onClick={() => { setActiveTab("Profile"); setDropdownOpen(false); }}>
                    <FiUser /> Profile
                  </div>
                  <div className="dropdown-item" onClick={() => { setActiveTab("Settings"); setDropdownOpen(false); }}>
                    <FiSettings /> Settings
                  </div>
                  <div className="dropdown-item" onClick={handleLogout}>
                    <FiLogOut /> Log out
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="scrollable-content">
          {renderMainContent()}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, text, onClick, active = false }) => (
  <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
    <span className="nav-icon">{icon}</span>
    <span className="nav-text">{text}</span>
  </div>
);

export default AdminDashboard;
