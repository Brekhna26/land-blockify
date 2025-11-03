import React, { useState, useEffect } from 'react';
import { 
  FiActivity, 
  FiCheckCircle, 
  FiClock, 
  FiEye,
  FiRefreshCw,
  FiShield
} from 'react-icons/fi';
import axios from 'axios';
import './BlockchainLogs.css';

const BlockchainLogs = ({ userRole, userId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, registered, approved, transferred

  useEffect(() => {
    loadBlockchainLogs();
  }, [userRole, userId, filter]);

  const loadBlockchainLogs = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - in real implementation, this would fetch from your backend
      const mockLogs = [
        {
          id: 1,
          type: 'Property Registered',
          propertyId: 'PROP001',
          propertyLocation: '123 Main St, City',
          txHash: '0x1234567890abcdef1234567890abcdef12345678',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          status: 'confirmed',
          blockNumber: 12345678,
          gasUsed: '0.002 MATIC'
        },
        {
          id: 2,
          type: 'Property Approved',
          propertyId: 'PROP001',
          propertyLocation: '123 Main St, City',
          txHash: '0xabcdef1234567890abcdef1234567890abcdef12',
          timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
          status: 'confirmed',
          blockNumber: 12345890,
          gasUsed: '0.001 MATIC'
        },
        {
          id: 3,
          type: 'Property Transfer',
          propertyId: 'PROP002',
          propertyLocation: '456 Oak Ave, Town',
          txHash: '0x567890abcdef1234567890abcdef1234567890ab',
          timestamp: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
          status: 'pending',
          blockNumber: null,
          gasUsed: null
        }
      ];
      
      // Filter logs based on user role and filter type
      let filteredLogs = mockLogs;
      if (filter !== 'all') {
        filteredLogs = mockLogs.filter(log => 
          log.type.toLowerCase().includes(filter)
        );
      }
      
      setLogs(filteredLogs);
    } catch (error) {
      console.error('Error loading blockchain logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <FiCheckCircle className="status-icon confirmed" />;
      case 'pending':
        return <FiClock className="status-icon pending" />;
      default:
        return <FiActivity className="status-icon" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Property Registered':
        return 'registered';
      case 'Property Approved':
        return 'approved';
      case 'Property Transfer':
        return 'transferred';
      default:
        return 'default';
    }
  };

  return (
    <div className="blockchain-logs">
      <div className="logs-header">
        <div className="header-info">
          <h3><FiShield /> Blockchain Transaction History</h3>
          <p>View all blockchain transactions for your properties</p>
        </div>
        <button 
          className="refresh-btn" 
          onClick={loadBlockchainLogs} 
          disabled={loading}
        >
          <FiRefreshCw className={loading ? 'spinning' : ''} /> 
          Refresh
        </button>
      </div>

      <div className="logs-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Transactions
        </button>
        <button 
          className={`filter-btn ${filter === 'registered' ? 'active' : ''}`}
          onClick={() => setFilter('registered')}
        >
          Registered
        </button>
        <button 
          className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Approved
        </button>
        <button 
          className={`filter-btn ${filter === 'transferred' ? 'active' : ''}`}
          onClick={() => setFilter('transferred')}
        >
          Transferred
        </button>
      </div>

      <div className="logs-content">
        {loading ? (
          <div className="loading-state">
            <FiRefreshCw className="spinning" />
            <p>Loading blockchain transactions...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <FiActivity />
            <p>No blockchain transactions found</p>
            <small>Transactions will appear here once properties are registered on blockchain</small>
          </div>
        ) : (
          <div className="logs-list">
            {logs.map(log => (
              <div key={log.id} className={`log-item ${getTypeColor(log.type)}`}>
                <div className="log-main">
                  <div className="log-header-item">
                    <div className="log-type">
                      {getStatusIcon(log.status)}
                      <div className="type-info">
                        <strong>{log.type}</strong>
                        <span className="property-id">Property ID: {log.propertyId}</span>
                      </div>
                    </div>
                    <div className="log-timestamp">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="log-details">
                    <div className="detail-item">
                      <strong>Location:</strong>
                      <span>{log.propertyLocation}</span>
                    </div>
                    
                    <div className="detail-item">
                      <strong>Transaction Hash:</strong>
                      <div className="hash-container">
                        <code>{formatAddress(log.txHash)}</code>
                        <button 
                          className="view-btn"
                          onClick={() => window.open(`https://mumbai.polygonscan.com/tx/${log.txHash}`, '_blank')}
                        >
                          <FiEye /> View on PolygonScan
                        </button>
                      </div>
                    </div>
                    
                    {log.blockNumber && (
                      <div className="detail-item">
                        <strong>Block Number:</strong>
                        <span>{log.blockNumber.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {log.gasUsed && (
                      <div className="detail-item">
                        <strong>Gas Used:</strong>
                        <span>{log.gasUsed}</span>
                      </div>
                    )}
                    
                    <div className="detail-item">
                      <strong>Status:</strong>
                      <span className={`status-badge ${log.status}`}>
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockchainLogs;
