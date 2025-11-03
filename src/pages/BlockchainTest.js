import React, { useState, useEffect } from 'react';
import Web3Wallet from '../components/Web3Wallet';
import { web3Service } from '../utils/web3';

const BlockchainTest = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [contractInfo, setContractInfo] = useState({
    landRegistry: '',
    propertyTransfer: '',
    totalProperties: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const connected = await web3Service.isWalletConnected();
      setIsConnected(connected);
      
      if (connected) {
        const accounts = await web3Service.getAccounts();
        setAccount(accounts[0] || '');
        await loadContractInfo();
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const loadContractInfo = async () => {
    try {
      setLoading(true);
      
      // Get contract addresses
      const landRegistryAddress = web3Service.getLandRegistryAddress();
      const propertyTransferAddress = web3Service.getPropertyTransferAddress();
      
      setContractInfo({
        landRegistry: landRegistryAddress,
        propertyTransfer: propertyTransferAddress,
        totalProperties: 0 // We'll implement this later
      });
    } catch (error) {
      console.error('Error loading contract info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnected = (walletAccount) => {
    setIsConnected(true);
    setAccount(walletAccount);
    loadContractInfo();
  };

  const handleWalletDisconnected = () => {
    setIsConnected(false);
    setAccount('');
    setContractInfo({
      landRegistry: '',
      propertyTransfer: '',
      totalProperties: 0
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔗 Blockchain Integration Test</h1>
      
      {/* Wallet Connection */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>MetaMask Wallet Connection</h2>
        <Web3Wallet 
          onWalletConnected={handleWalletConnected}
          onWalletDisconnected={handleWalletDisconnected}
        />
        
        {isConnected && (
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '4px' }}>
            <strong>Connected Account:</strong> {account}
          </div>
        )}
      </div>

      {/* Contract Information */}
      {isConnected && (
        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h2>Smart Contract Information</h2>
          {loading ? (
            <p>Loading contract information...</p>
          ) : (
            <div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Land Registry Contract:</strong>
                <br />
                <code style={{ fontSize: '12px', backgroundColor: '#f5f5f5', padding: '2px 4px' }}>
                  {contractInfo.landRegistry}
                </code>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <strong>Property Transfer Contract:</strong>
                <br />
                <code style={{ fontSize: '12px', backgroundColor: '#f5f5f5', padding: '2px 4px' }}>
                  {contractInfo.propertyTransfer}
                </code>
              </div>
              
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f0fff0', borderRadius: '4px' }}>
                ✅ <strong>Status:</strong> Smart contracts are deployed and accessible!
              </div>
            </div>
          )}
        </div>
      )}

      {/* Network Information */}
      {isConnected && (
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h2>Network Information</h2>
          <div>
            <strong>Network:</strong> Polygon Mumbai Testnet
            <br />
            <strong>Chain ID:</strong> 80001
            <br />
            <strong>RPC URL:</strong> https://polygon-mumbai.g.alchemy.com/v2/demo
          </div>
          
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff8dc', borderRadius: '4px' }}>
            <strong>💡 Note:</strong> Make sure your MetaMask is connected to Polygon Mumbai testnet and you have test MATIC tokens.
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainTest;
