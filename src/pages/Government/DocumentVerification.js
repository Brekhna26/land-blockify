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
    const fetchPendingLands = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/gov/get-pending-lands");
        setPendingLands(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch lands:", err);
        setLoading(false);
      }
    };
    fetchPendingLands();
  }, []);

  const handleVerify = async (id) => {
    console.log('📝 Debug handleVerify:');
    console.log('- walletConnected (local state):', walletConnected);
    console.log('- walletAddress (local state):', walletAddress);
    
    const web3Service = getWeb3Service();
    console.log('- web3Service.account:', web3Service.account);
    console.log('- web3Service.signer:', web3Service.signer);
    
    if (!walletConnected) {
      alert('Please connect your MetaMask wallet first!');
      return;
    }

    setProcessingId(id);
    try {
      // Find the property details
      const property = pendingLands.find(land => land.id === id);
      if (!property) {
        alert('Property not found!');
        setProcessingId(null);
        return;
      }

      // Prepare and validate blockchain parameters
      const blockchainParams = {
        propertyIdentifier: property.propertyId || property.id.toString(),
        ownerName: property.ownerName || 'Unknown Owner', // Actual property owner name
        location: property.location || 'Unknown Location',
        landArea: parseInt(property.landArea) || 1000, // Default to 1000 sq m if invalid
        propertyType: property.propertyType || 'Residential',
        legalDescription: property.legalDescription || `Property at ${property.location}`,
        documentHash: property.documentHash || '0x0000000000000000000000000000000000000000000000000000000000000000'
      };
      
      console.log('📝 Blockchain parameters:', blockchainParams);
      console.log('🔗 Registering property on blockchain first...');
      
      // STEP 1: Register on blockchain FIRST
      const blockchainTx = await registerProperty(blockchainParams);

      console.log('✅ Blockchain transaction successful:', blockchainTx);
      
      // Check if blockchain transaction was successful
      if (!blockchainTx || !blockchainTx.success) {
        throw new Error('Blockchain transaction failed');
      }
      
      // STEP 2: Only approve in database AFTER blockchain success
      console.log('💾 Approving in database...');
      await axios.post(`http://localhost:3001/api/gov/approve-land/${id}`);
      
      // STEP 3: Update the property in database with blockchain transaction hash
      await axios.post('http://localhost:3001/api/blockchain/register-property', {
        propertyId: property.id,
        transactionHash: blockchainTx.transactionHash,
        blockchainId: blockchainTx.propertyId
      });

      alert(`✅ Property approved and registered on blockchain!\nTransaction: ${blockchainTx.transactionHash}`);
      setPendingLands(prev => prev.filter(l => l.id !== id));
    } catch (error) {
      console.error('❌ Error approving property:', error);
      alert(`❌ Failed to approve property!\n\nError: ${error.message}\n\nThe property was NOT approved in the database because the blockchain transaction failed.`);
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
          onWalletConnect={async (address) => {
            console.log('🔗 Wallet connected in DocumentVerification:', address);
            setWalletConnected(true);
            setWalletAddress(address);
            
            // Ensure Web3Service is also connected
            const web3Service = getWeb3Service();
            if (!web3Service.account) {
              console.log('🔄 Connecting Web3Service...');
              await connectWallet();
            }
          }}
          onWalletDisconnect={() => {
            console.log('🔓 Wallet disconnected in DocumentVerification');
            setWalletConnected(false);
            setWalletAddress('');
            
            // Disconnect Web3Service as well
            const web3Service = getWeb3Service();
            web3Service.disconnect();
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
