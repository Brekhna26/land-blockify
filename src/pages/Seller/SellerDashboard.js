import React, { useState, useEffect, useRef } from "react";
import {
  FiUser, FiSettings, FiLogOut, FiArrowRight
} from "react-icons/fi";
import {
  MdDashboard, MdNoteAdd, MdFormatListBulleted, MdAttachMoney, MdPerson, MdSettings
} from "react-icons/md";


import logo from '../../assets/dashlogo.png';
import RegisterLand from './RegisterLand';
import Profile from "./Profile";
import Settings from './Settings';
import MyProperty from './MyProperty';
import BuyRequests from './BuyRequests';
import ChatRoom from '../ChatRoom';
import SellerTransactions from './SellerTransactions';
import "./SellerDashboard.css";
const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [showChat, setShowChat] = useState(false); 
  const [chatPropertyId, setChatPropertyId] = useState(null);


  const dropdownRef = useRef(null);

  useEffect(() => {
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');
    if (email) setUserEmail(email);
    if (role) setUserRole(role);
  }, []);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderMainContent = () => {
   if (showChat && chatPropertyId) {
  return (
    <ChatRoom
      propertyId={chatPropertyId}
      onBack={() => {
        setShowChat(false);
        setChatPropertyId(null);
      }}
      userEmail={userEmail}
    />
  );
}

    switch (activeTab) {
      case "Register Land":
        return <RegisterLand />;
      case "MyProperty":
        return <MyProperty ownerName={userEmail} />;
   case "BuyRequests":
  return chatPropertyId 
    ? <ChatRoom propertyId={chatPropertyId} /> 
    : <BuyRequests openChat={(pid) => {
        setChatPropertyId(pid);
        setShowChat(true);
      }} />;  
case "Transactions":
  return <SellerTransactions />;
      case "Profile":
        return <Profile />;
      case "Settings":
        return <Settings />;
      case "Dashboard":
      default:
        return (
          <div className="dashboard-content">
            <h2 className="dashboard-heading">Seller Dashboard</h2>
            <div className="admin-cards-container">
              {/* My Listings */}
              <div className="admin-card">
                <div className="card-header">
                  <MdFormatListBulleted className="card-icon" />
                  <h3>My Listings</h3>
                </div>
                <p>Manage your active and past property listings.</p>
                <button className="card-action" onClick={() => setActiveTab("MyProperty")}>
                  View My Listings <FiArrowRight />
                </button>
              </div>

              {/* Sales Overview */}
              <div className="admin-card">
                <div className="card-header">
                  <MdAttachMoney className="card-icon" />
                  <h3>Sales Overview</h3>
                </div>
                <p>Track your property sales and earnings.</p>
                <button className="card-action" onClick={() => setActiveTab("")}>
                  View Sales <FiArrowRight />
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
          <NavItem icon={<MdDashboard />} text="Dashboard" onClick={() => { setShowChat(false); setActiveTab("Dashboard"); }} active={activeTab === "Dashboard"} />
          <NavItem icon={<MdNoteAdd />} text="Register Land" onClick={() => { setShowChat(false); setActiveTab("Register Land"); }} active={activeTab === "Register Land"} />
          <NavItem icon={<MdFormatListBulleted />} text="MyProperty" onClick={() => { setShowChat(false); setActiveTab("MyProperty"); }} active={activeTab === "MyProperty"} />
          <NavItem icon={<MdAttachMoney />} text="BuyRequests" onClick={() => { setShowChat(false); setActiveTab("BuyRequests"); }} active={activeTab === "BuyRequests"} />
          <NavItem icon={<MdAttachMoney />} text="Transactions" onClick={() => setActiveTab("Transactions")} active={activeTab === "Transactions"} />
          <NavItem icon={<MdPerson />} text="Profile" onClick={() => { setShowChat(false); setActiveTab("Profile"); }} active={activeTab === "Profile"} />
          <NavItem icon={<MdSettings />} text="Settings" onClick={() => { setShowChat(false); setActiveTab("Settings"); }} active={activeTab === "Settings"} />
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
                  <div className="dropdown-item" onClick={() => { setShowChat(false); setActiveTab("Profile"); setDropdownOpen(false); }}>
                    <FiUser /> Profile
                  </div>
                  <div className="dropdown-item" onClick={() => { setShowChat(false); setActiveTab("Settings"); setDropdownOpen(false); }}>
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

export default SellerDashboard;
