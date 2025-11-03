import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CreateAccount from './pages/CreateAccount';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import GovernmentDashboard from './pages/Government/GovernmentDashboard';
import SellerDashboard from './pages/Seller/SellerDashboard';
import BuyerDashboard from './pages/Buyer/BuyerDashboard';
import ChatRoom from './pages/ChatRoom';
import BlockchainTest from './pages/BlockchainTest';
import GovernmentTransactions from './pages/Government/GovernmentTransactions';
import BlockchainFinalization from './pages/Government/BlockchainFinalization';





function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/gov-dashboard" element={<GovernmentDashboard />} />
        <Route path="/seller-dashboard" element={<SellerDashboard />} />
        <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
        <Route path="/chat/:propertyId" element={<ChatRoom />} />
        <Route path="/blockchain-test" element={<BlockchainTest />} />
        
        {/* New Workflow Routes */}
        <Route path="/gov/transactions" element={<GovernmentTransactions />} />
        <Route path="/gov/blockchain-finalization" element={<BlockchainFinalization />} />
      </Routes>
    </Router>
  );
}

export default App;
