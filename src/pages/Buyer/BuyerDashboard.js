import React, { useEffect, useState, useRef } from 'react';
import {
  FiUser, FiSettings, FiLogOut, FiArrowRight, FiClipboard
} from "react-icons/fi";
import {
  MdDashboard, MdNoteAdd, MdFormatListBulleted ,MdAttachMoney, MdVerifiedUser,MdPayment
} from "react-icons/md";

import axios from "axios";
import logo from '../../assets/dashlogo.png';

import Marketplace from './Marketplace';
import Profile from './Profile';
import Settings from './Settings';
import MyRequests from './MyRequests';
import ChatRoom from '../ChatRoom'; 
import BuyerTransactions from './BuyerTransactions';
import "./BuyerDashboard.css";

const BuyerDashboard = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [chatPropertyId, setChatPropertyId] = useState(null); // ✅ NEW
  const dropdownRef = useRef(null);

  useEffect(() => {
    setUserEmail(localStorage.getItem('email') || '');
    setUserRole(localStorage.getItem('role') || '');
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/create-account";
  };

  const handleChatOpen = (propertyId) => {
    setChatPropertyId(propertyId);
    setActiveTab("ChatRoom");
  };
const [activeChatPropertyId, setActiveChatPropertyId] = useState(null);

const handleOpenChat = (propertyId) => {
  setActiveChatPropertyId(propertyId);
  setActiveTab("ChatRoom");
};

  const renderMainContent = () => {
    switch (activeTab) {
      case "Marketplace":
        return <Marketplace />;
      case "Profile":
        return <Profile />;
      case "MyRequests":
  return <MyRequests onChat={handleOpenChat} />;
case "Transactions":
  return <BuyerTransactions />;

      case "Settings":
        return <Settings />;
case "ChatRoom":
  return <ChatRoom propertyId={activeChatPropertyId} />;

      case "Dashboard":
      default:
        return (
          <div className="dashboard-content">
            <h2 className="dashboard-heading">Buyer Dashboard</h2>
            <div className="admin-cards-container">
              <div className="admin-card">
                <div className="card-header">
                  <MdNoteAdd className="card-icon" />
                  <h3>Browse Marketplace</h3>
                </div>
                <p>Find new properties available for purchase.</p>
                <button className="card-action" onClick={() => setActiveTab("Marketplace")}>
                  Explore Listings <FiArrowRight />
                </button>
              </div>
              <div className="admin-card">
                <div className="card-header">
                  <MdFormatListBulleted className="card-icon" />
                  <h3>My Acquired Properties</h3>
                </div>
                <p>View properties you have successfully purchased.</p>
                <button className="card-action" onClick={() => setActiveTab("MyRequests")}>
                  View My Properties <FiArrowRight />
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
          <NavItem icon={<MdDashboard />} text="Dashboard" onClick={() => setActiveTab("Dashboard")} active={activeTab === "Dashboard"} />
          <NavItem icon={<MdNoteAdd />} text="Marketplace" onClick={() => setActiveTab("Marketplace")} active={activeTab === "Marketplace"} />
          <NavItem icon={<FiClipboard />} text="My Requests" onClick={() => setActiveTab("MyRequests")} active={activeTab === "MyRequests"} />
          <NavItem icon={<MdPayment />} text="Transactions" onClick={() => setActiveTab("Transactions")} active={activeTab === "Transactions"}/>
          <NavItem icon={<FiUser />} text="Profile" onClick={() => setActiveTab("Profile")} active={activeTab === "Profile"} />
          <NavItem icon={<FiSettings />} text="Settings" onClick={() => setActiveTab("Settings")} active={activeTab === "Settings"} />
        </nav>
        <div className="user-profile">
          <div className="user-avatar"><span>{userEmail.charAt(0).toUpperCase() || 'A'}</span></div>
          <div className="user-info">
            <p className="username">{userEmail}</p>
            <p className="user-role">{userRole}</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="admin-navbar">
          <div className="nav-right" ref={dropdownRef}>
            <div className="profile-circle" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <FiUser />
            </div>
            {dropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <p>{userEmail}</p>
                  <p className="email">{userEmail}</p>
                  <p className="role">Role: <strong>{userRole}</strong></p>
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
        </header>

        <div className="scrollable-content">
          {renderMainContent()}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, text, onClick, active }) => (
  <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
    <span className="nav-icon">{icon}</span>
    <span className="nav-text">{text}</span>
  </div>
);

export default BuyerDashboard;
