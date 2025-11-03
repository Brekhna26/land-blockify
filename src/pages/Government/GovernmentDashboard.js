import React, { useState, useEffect, useRef, Profiler } from "react";
import {
  FiHome, FiShoppingCart, FiDollarSign, FiUsers, FiUser, FiSettings, FiBell,
  FiTrendingUp, FiActivity, FiAlertCircle, FiDatabase, FiShield, FiArrowRight, FiLogOut,
} from "react-icons/fi";
import {
  MdDashboard,
  MdPayment,
  MdVerifiedUser,
  MdGavel,
  MdFactCheck,
  MdPerson,
  MdSettings,
  MdVerified,
  MdHowToReg,
  MdHealthAndSafety
} from "react-icons/md";
import axios from "axios";
import logo from '../../assets/dashlogo.png';
import Transactions from "./Transactions";
import DocumentVerification from "./DocumentVerification";
import RegistryIntegrity from "./RegistryIntegrity";
import BlockchainManagement from "./BlockchainManagement";
import Profile from './Profile';
import Settings from './Settings';
import GovernmentTransactions from "./GovernmentTransactions";
import BlockchainFinalization from "./BlockchainFinalization";
import "./GovernmentDashboard.css";
import { FiRefreshCw} from "react-icons/fi";
const GovernmentDashboard = () => {
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
      case "Transactions":
        return <Transactions />;
      case "Document Verification":
        return <DocumentVerification />;
      case "Registry Integrity":
          return<RegistryIntegrity/>
        case "Blockchain Management":
          return<BlockchainManagement/>
        case "Transaction Approvals":
          return<GovernmentTransactions/>
        case "Blockchain Finalization":
          return<BlockchainFinalization/>
        case "Profile":
          return<Profile/>
         case "Settings":
        return <Settings />;
      case "Dashboard":
      default:
        return (
          <div className="dashboard-content">
            <h2 className="dashboard-heading">Government  Dashboard</h2>
            <div className="admin-cards-container">
             {/* Approve */}
            <div className="admin-card">
              <div className="card-header">
                <MdHowToReg className="card-icon" />
                <h3>Approve Transactions</h3>
              </div>
              <p>Review and approve pending land transactions.</p>
             <button className="card-action" onClick={() => setActiveTab("Transactions")}>
             Manage Transactions <FiArrowRight />
          </button>
            </div>
            {/* verify Docs */}
            <div className="admin-card">
              <div className="card-header">
                <MdVerifiedUser className="card-icon" />
                <h3>verify Documents</h3>
              </div>
              <p>Verify uploaded property documents for authenticity.</p>
               <button className="card-action" onClick={() => setActiveTab("Document Verification")}>
                Verify Documents <FiArrowRight />
               </button>
            </div>
            {/* registry integrity */}
            <div className="admin-card">
              <div className="card-header">
                <MdHealthAndSafety className="card-icon" />
                <h3>Registry integrity</h3>
              </div>
              <p>Monitor the overall health and integrity of the land registry.</p>
              <button className="card-action" onClick={() => setActiveTab("Registry Integrity")}>Monitor Registry <FiArrowRight /></button>
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
<NavItem icon={<MdDashboard />} text="Dashboard" onClick={() => setActiveTab("Dashboard")} active={activeTab === "Dashboard"} />
<NavItem icon={<MdPayment />} text="Transactions" onClick={() => setActiveTab("Transactions")} active={activeTab === "Transactions"} />
<NavItem icon={<MdVerified />} text="Document Verification" onClick={() => setActiveTab("Document Verification")} active={activeTab === "Document Verification"} />
<NavItem icon={<MdFactCheck />} text="Registry Integrity" onClick={() => setActiveTab("Registry Integrity")} active={activeTab === "Registry Integrity"} />
<NavItem icon={<FiShield />} text="Blockchain Management" onClick={() => setActiveTab("Blockchain Management")} active={activeTab === "Blockchain Management"} />
<NavItem icon={<MdVerifiedUser />} text="Transaction Approvals" onClick={() => setActiveTab("Transaction Approvals")} active={activeTab === "Transaction Approvals"} />
<NavItem icon={<FiShield />} text="Blockchain Finalization" onClick={() => setActiveTab("Blockchain Finalization")} active={activeTab === "Blockchain Finalization"} />
<NavItem icon={<MdPerson />} text="Profile" onClick={() => setActiveTab("Profile")} active={activeTab === "Profile"} />
<NavItem icon={<MdSettings />} text="Settings" onClick={() => setActiveTab("Settings")} active={activeTab === "Settings"} />
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

export default GovernmentDashboard;
