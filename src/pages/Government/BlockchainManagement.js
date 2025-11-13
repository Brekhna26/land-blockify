import React, { useState, useEffect } from 'react';
import { 
  FiShield, 
  FiDatabase, 
  FiCheckCircle, 
  FiXCircle, 
  FiRefreshCw,
  FiEye,
  FiLink,
  FiActivity,
  FiAlertCircle
} from 'react-icons/fi';
import { MdAccountBalanceWallet, MdVerified, MdGavel } from 'react-icons/md';
import { web3Service } from '../../utils/web3';
import Web3Wallet from '../../components/Web3Wallet';
import axios from 'axios';
import './BlockchainManagement.css';

const BlockchainManagement = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Blockchain data states
  const [contractInfo, setContractInfo] = useState({
    landRegistry: '',
    propertyTransfer: '',
    totalProperties: 0,
    totalTransactions: 0
  });
  
  const [pendingProperties, setPendingProperties] = useState([]);
  const [blockchainLogs, setBlockchainLogs] = useState([]);
  const [stats, setStats] = useState({
    totalRegistered: 0,
    totalApproved: 0,
    pendingApprovals: 0,
    totalTransfers: 0
  });

  useEffect(() => {
    checkWalletConnection();
  }, []);

  useEffect(() => {
    if (isWalletConnected) {
      loadBlockchainData();
    }
  }, [isWalletConnected]);

  const checkWalletConnection = async () => {
    try {
      const currentAccount = await web3Service.getCurrentAccount();
      if (currentAccount) {
        setWalletAddress(currentAccount);
        setIsWalletConnected(true);
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const loadBlockchainData = async () => {
    try {
      setLoading(true);
      
      // Load contract information
      const landRegistryAddress = web3Service.getLandRegistryAddress();
      const propertyTransferAddress = web3Service.getPropertyTransferAddress();
      
      setContractInfo({
        landRegistry: landRegistryAddress,
        propertyTransfer: propertyTransferAddress,
        totalProperties: 0, // Will be loaded from contract
        totalTransactions: 0 // Will be loaded from contract
      });

      // Load pending properties from database
      await loadPendingProperties();
      
      // Load blockchain logs
      await loadBlockchainLogs();
      
    } catch (error) {
      console.error('Error loading blockchain data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingProperties = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/gov/get-pending-lands');
      setPendingProperties(response.data || []);
      
      setStats(prev => ({
        ...prev,
        pendingApprovals: response.data?.length || 0
      }));
    } catch (error) {
      console.error('Error loading pending properties:', error);
    }
  };

  const loadBlockchainLogs = async () => {
    try {
      // This would fetch blockchain transaction logs
      // For now, we'll use mock data
      const mockLogs = [
        {
          id: 1,
          type: 'Property Registered',
          propertyId: 'PROP001',
          txHash: '0x1234...abcd',
          timestamp: new Date().toISOString(),
          status: 'success'
        },
        {
          id: 2,
          type: 'Property Approved',
          propertyId: 'PROP002',
          txHash: '0x5678...efgh',
          timestamp: new Date().toISOString(),
          status: 'success'
        }
      ];
      setBlockchainLogs(mockLogs);
    } catch (error) {
      console.error('Error loading blockchain logs:', error);
    }
  };

  const handleWalletConnected = (address) => {
    setWalletAddress(address);
    setIsWalletConnected(true);
  };

  const handleWalletDisconnected = () => {
    setWalletAddress('');
    setIsWalletConnected(false);
  };

  const registerPropertyOnBlockchain = async (property) => {
    try {
      setLoading(true);
      
      if (!isWalletConnected) {
        alert('Please connect your wallet first');
        return;
      }

      // Register property on blockchain
      const result = await web3Service.registerProperty({
        propertyIdentifier: property.id.toString(),
        owner: property.owner_address || walletAddress,
        location: property.location,
        landArea: parseInt(property.land_area),
        propertyType: property.property_type,
        legalDescription: property.legal_description || 'Government approved property',
        documentHash: property.document_hash || 'QmHash...'
      });

      // Update database with blockchain transaction
      await axios.post('http://localhost:3001/api/blockchain/register', {
        propertyId: property.id,
        blockchainId: result.propertyId,
        transactionHash: result.transactionHash,
        ownerAddress: walletAddress
      });

      alert('Property registered on blockchain successfully!');
      await loadPendingProperties();
      await loadBlockchainLogs();
      
    } catch (error) {
      console.error('Error registering property on blockchain:', error);
      alert('Error registering property on blockchain: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const approvePropertyOnBlockchain = async (property) => {
    try {
      setLoading(true);
      
      if (!property.blockchain_id) {
        alert('Property must be registered on blockchain first');
        return;
      }

      // Approve property on blockchain
      const result = await web3Service.approveProperty(property.blockchain_id);

      // Update database
      await axios.post(`http://localhost:3001/api/gov/approve/${property.id}`, {
        transactionHash: result.transactionHash
      });

      alert('Property approved on blockchain successfully!');
      await loadPendingProperties();
      await loadBlockchainLogs();
      
    } catch (error) {
      console.error('Error approving property on blockchain:', error);
      alert('Error approving property on blockchain: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    if (!address || typeof address !== 'string') return 'N/A';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const renderOverview = () => (
    <div className="blockchain-overview">
      <div className="overview-cards">
        <div className="overview-card">
          <div className="card-header">
            <MdVerified className="card-icon success" />
            <h3>Total Registered</h3>
          </div>
          <div className="card-value">{stats.totalRegistered}</div>
          <p>Properties on blockchain</p>
        </div>
        
        <div className="overview-card">
          <div className="card-header">
            <FiCheckCircle className="card-icon primary" />
            <h3>Total Approved</h3>
          </div>
          <div className="card-value">{stats.totalApproved}</div>
          <p>Government approved</p>
        </div>
        
        <div className="overview-card">
          <div className="card-header">
            <FiRefreshCw className="card-icon warning" />
            <h3>Pending Approvals</h3>
          </div>
          <div className="card-value">{stats.pendingApprovals}</div>
          <p>Awaiting approval</p>
        </div>
        
        <div className="overview-card">
          <div className="card-header">
            <FiActivity className="card-icon info" />
            <h3>Total Transfers</h3>
          </div>
          <div className="card-value">{stats.totalTransfers}</div>
          <p>Completed transfers</p>
        </div>
      </div>

      <div className="contract-info">
        <h3><FiDatabase /> Smart Contract Information</h3>
        <div className="contract-details">
          <div className="contract-item">
            <strong>Land Registry Contract:</strong>
            <code>{formatAddress(contractInfo.landRegistry)}</code>
            <button className="view-btn" onClick={() => window.open(`https://mumbai.polygonscan.com/address/${contractInfo.landRegistry}`, '_blank')}>
              <FiEye /> View on PolygonScan
            </button>
          </div>
          <div className="contract-item">
            <strong>Property Transfer Contract:</strong>
            <code>{formatAddress(contractInfo.propertyTransfer)}</code>
            <button className="view-btn" onClick={() => window.open(`https://mumbai.polygonscan.com/address/${contractInfo.propertyTransfer}`, '_blank')}>
              <FiEye /> View on PolygonScan
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPendingApprovals = () => (
    <div className="pending-approvals">
      <div className="section-header">
        <h3><MdGavel /> Pending Property Approvals</h3>
        <button className="refresh-btn" onClick={loadPendingProperties} disabled={loading}>
          <FiRefreshCw className={loading ? 'spinning' : ''} /> Refresh
        </button>
      </div>
      
      {pendingProperties.length === 0 ? (
        <div className="empty-state">
          <FiCheckCircle />
          <p>No pending approvals</p>
        </div>
      ) : (
        <div className="properties-table">
          <table>
            <thead>
              <tr>
                <th>Property ID</th>
                <th>Location</th>
                <th>Owner</th>
                <th>Land Area</th>
                <th>Blockchain Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingProperties.map(property => (
                <tr key={property.id}>
                  <td>{property.id}</td>
                  <td>{property.location}</td>
                  <td>{property.owner_name}</td>
                  <td>{property.land_area} sq ft</td>
                  <td>
                    <span className={`status ${property.blockchain_id ? 'registered' : 'pending'}`}>
                      {property.blockchain_id ? 'Registered' : 'Not Registered'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {!property.blockchain_id ? (
                        <button 
                          className="action-btn register"
                          onClick={() => registerPropertyOnBlockchain(property)}
                          disabled={loading}
                        >
                          <FiLink /> Register on Blockchain
                        </button>
                      ) : (
                        <button 
                          className="action-btn approve"
                          onClick={() => approvePropertyOnBlockchain(property)}
                          disabled={loading}
                        >
                          <FiCheckCircle /> Approve on Blockchain
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderBlockchainLogs = () => (
    <div className="blockchain-logs">
      <div className="section-header">
        <h3><FiActivity /> Blockchain Transaction Logs</h3>
        <button className="refresh-btn" onClick={loadBlockchainLogs} disabled={loading}>
          <FiRefreshCw className={loading ? 'spinning' : ''} /> Refresh
        </button>
      </div>
      
      <div className="logs-container">
        {blockchainLogs.map(log => (
          <div key={log.id} className="log-item">
            <div className="log-header">
              <div className="log-type">
                {log.status === 'success' ? <FiCheckCircle className="success" /> : <FiXCircle className="error" />}
                <strong>{log.type}</strong>
              </div>
              <div className="log-time">{new Date(log.timestamp).toLocaleString()}</div>
            </div>
            <div className="log-details">
              <p><strong>Property ID:</strong> {log.propertyId}</p>
              <p><strong>Transaction Hash:</strong> 
                <code>{formatAddress(log.txHash)}</code>
                <button className="view-btn" onClick={() => window.open(`https://mumbai.polygonscan.com/tx/${log.txHash}`, '_blank')}>
                  <FiEye /> View
                </button>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!isWalletConnected) {
    return (
      <div className="blockchain-management">
        <div className="wallet-connection-required">
          <div className="connection-card">
            <MdAccountBalanceWallet className="wallet-icon" />
            <h2>Blockchain Management</h2>
            <p>Connect your MetaMask wallet to manage blockchain operations</p>
            <div className="wallet-component">
              <Web3Wallet 
                onWalletConnected={handleWalletConnected}
                onWalletDisconnected={handleWalletDisconnected}
              />
            </div>
            <div className="info-note">
              <FiAlertCircle />
              <p>Make sure you're connected to Polygon Mumbai testnet and have test MATIC tokens</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blockchain-management">
      <div className="blockchain-header">
        <div className="header-info">
          <h2><FiShield /> Blockchain Management</h2>
          <p>Manage property registration and approvals on Polygon blockchain</p>
        </div>
        <div className="wallet-info">
          <div className="connected-wallet">
            <MdAccountBalanceWallet />
            <span>Connected: {formatAddress(walletAddress)}</span>
          </div>
        </div>
      </div>

      <div className="blockchain-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FiDatabase /> Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'approvals' ? 'active' : ''}`}
          onClick={() => setActiveTab('approvals')}
        >
          <MdGavel /> Pending Approvals ({stats.pendingApprovals})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <FiActivity /> Transaction Logs
        </button>
      </div>

      <div className="blockchain-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'approvals' && renderPendingApprovals()}
        {activeTab === 'logs' && renderBlockchainLogs()}
      </div>
    </div>
  );
};

export default BlockchainManagement;
