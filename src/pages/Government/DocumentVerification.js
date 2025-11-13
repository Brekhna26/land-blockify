import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DocumentVerification.css';
import { connectWallet, registerProperty, getWeb3Service } from '../../utils/web3';
import Web3Wallet from '../../components/Web3Wallet'; 

const DocumentVerification = () => {
  const [pendingLands, setPendingLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPendingLands();
  }, []);

  const fetchPendingLands = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/gov/get-pending-lands");
      setPendingLands(res.data);
    } catch (err) {
      console.error("Failed to fetch lands:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    if (!walletConnected) {
      alert('Please connect your MetaMask wallet first!');
      return;
    }

    setProcessingId(id);
    try {
      const property = pendingLands.find(land => land.id === id);
      if (!property) {
        alert('Property not found!');
        return;
      }

      const web3Service = getWeb3Service();
      
      // Check authority and add if needed
      const authorityCheck = await web3Service.checkAuthority(walletAddress);
      if (!authorityCheck.success || !authorityCheck.isAuthorized) {
        const addAuthorityResult = await web3Service.addSelfAsAuthority();
        if (!addAuthorityResult.success) {
          throw new Error('Failed to add authority: ' + addAuthorityResult.error);
        }
        alert('✅ Added as authorized authority! Please click the approve button again to register the property.');
        return;
      }

      // Prepare blockchain parameters
      const blockchainParams = {
        propertyIdentifier: property.propertyId || `PROP-${property.id}-${Date.now()}`, // Use original propertyId or generate fallback
        ownerName: property.ownerName || 'Unknown Owner',
        location: property.location || 'Unknown Location',
        landArea: parseInt(property.landArea) || 1000,
        propertyType: property.propertyType || 'Residential',
        legalDescription: property.legalDescription || `Property at ${property.location}`,
        documentHash: property.documentHash || '0x0000000000000000000000000000000000000000000000000000000000000000'
      };
      
      // Register on blockchain
      const blockchainTx = await registerProperty(blockchainParams);
      
      if (!blockchainTx || !blockchainTx.success) {
        throw new Error('Blockchain transaction failed: ' + (blockchainTx.error || 'Unknown error'));
      }
      
      // Approve in database after blockchain success
      await axios.post(`http://localhost:3001/api/gov/approve-land/${id}`);
      
      // Note: The blockchain registration is already complete
      // The backend could be updated to store the transaction hash and blockchain ID
      // For now, the property is approved in the database and registered on blockchain

      alert(`✅ Property approved and registered on blockchain!\nTransaction: ${blockchainTx.transactionHash}\nBlockchain ID: ${blockchainTx.propertyId}`);
      setPendingLands(prev => prev.filter(l => l.id !== id));
    } catch (error) {
      console.error('❌ Error approving property:', error);
      alert(`❌ Failed to approve property!\n\nError: ${error.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(`http://localhost:3001/api/gov/reject-land/${id}`);
      setPendingLands(prev => prev.filter(l => l.id !== id));
      alert('Property rejected successfully!');
    } catch (error) {
      console.error('Error rejecting property:', error);
      alert('Error rejecting property!');
    }
  };

  return (
    <div className="document-verification">
      <h2>📄 Document Verification & Blockchain Registration</h2>
      <p>Review and verify uploaded property documents for authenticity and register them on blockchain.</p>
      
      {/* Wallet Connection */}
      <div className="wallet-section">
        <Web3Wallet 
          onWalletConnect={(address) => {
            setWalletConnected(true);
            setWalletAddress(address);
            connectWallet();
          }}
          onWalletDisconnect={() => {
            setWalletConnected(false);
            setWalletAddress('');
            getWeb3Service().disconnect();
          }}
        />
      </div>
      
      {!walletConnected && (
        <div className="warning-message">
          ⚠️ Please connect your MetaMask wallet to approve properties on blockchain
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : pendingLands.length === 0 ? (
        <p className="no-data">No pending land registrations found.</p>
      ) : (
        <table className="doc-table">
          <thead>
            <tr>
              <th>Property ID</th>
              <th>Owner Name</th>
              <th>Location</th>
              <th>Area (sq m)</th>
              <th>Property Type</th>
              <th>Actions</th>
            </tr>
          </thead>
         <tbody>
  {pendingLands.map((land) => (
    <tr key={land.id}>
      <td>{land.id}</td>
      <td>{land.ownerName}</td>
      <td>{land.location}</td>
      <td>{land.landArea}</td>
      <td>{land.propertyType || 'Residential'}</td>
      <td>
        <button 
          onClick={() => handleVerify(land.id)}
          disabled={processingId === land.id}
          className={`approve-btn ${!walletConnected ? 'disabled' : ''}`}
          title={!walletConnected ? 'Connect wallet first' : 'Approve & Register on Blockchain'}
        >
          {processingId === land.id ? '⏳ Processing...' : '✅ Approve & Register'}
        </button>
        <button 
          onClick={() => handleReject(land.id)}
          disabled={processingId === land.id}
          className="reject-btn"
        >
          ❌ Reject
        </button>
      </td>
    </tr>
  ))}
</tbody>

        </table>
      )}
    </div>
  );
};

export default DocumentVerification;
