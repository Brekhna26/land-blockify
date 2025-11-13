import React, { useState, useEffect } from 'react';
import web3Service from '../utils/web3';
import './Web3Wallet.css';

const Web3Wallet = ({ onWalletConnect, onWalletDisconnect }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    initializeWeb3();
    setupEventListeners();
    
    // Cleanup event listeners on unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const initializeWeb3 = async () => {
    try {
      const initialized = await web3Service.init();
      if (initialized) {
        // Check if already connected
        const currentAccount = await web3Service.getCurrentAccount();
        if (currentAccount) {
          setAccount(currentAccount);
          setIsConnected(true);
          await updateBalance(currentAccount);
          if (onWalletConnect) {
            onWalletConnect(currentAccount);
          }
        }
      }
    } catch (error) {
      console.error('Error initializing Web3:', error);
      setError('Failed to initialize Web3');
    }
  };

  const setupEventListeners = () => {
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      // User disconnected
      setIsConnected(false);
      setAccount('');
      setBalance('0');
      if (onWalletDisconnect) {
        onWalletDisconnect();
      }
    } else {
      // User switched accounts
      setAccount(accounts[0]);
      updateBalance(accounts[0]);
      if (onWalletConnect) {
        onWalletConnect(accounts[0]);
      }
    }
  };

  const handleChainChanged = (chainId) => {
    // Reload the page when chain changes
    window.location.reload();
  };

  const connectWallet = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await web3Service.connectWallet();
      
      if (result.success) {
        setIsConnected(true);
        setAccount(result.account);
        await updateBalance(result.account);
        
        if (onWalletConnect) {
          onWalletConnect(result.account);
        }
      } else {
        setError(result.error || 'Failed to connect wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    web3Service.disconnect();
    setIsConnected(false);
    setAccount('');
    setBalance('0');
    setError('');
    
    if (onWalletDisconnect) {
      onWalletDisconnect();
    }
  };

  const updateBalance = async (address) => {
    try {
      const balance = await web3Service.getBalance(address);
      setBalance(parseFloat(balance).toFixed(4));
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const formatAddress = (address) => {
    if (!address || typeof address !== 'string') return '';
    if (address.length < 10) return address; // Return as-is if too short to format
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(account);
    // You could add a toast notification here
  };

  if (!window.ethereum) {
    return (
      <div className="web3-wallet">
        <div className="wallet-error">
          <h3>MetaMask Not Detected</h3>
          <p>Please install MetaMask to use blockchain features.</p>
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="install-metamask-btn"
          >
            Install MetaMask
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="web3-wallet">
      {error && (
        <div className="wallet-error">
          <p>{error}</p>
          <button onClick={() => setError('')} className="close-error">×</button>
        </div>
      )}

      {!isConnected ? (
        <div className="wallet-connect">
          <button 
            onClick={connectWallet} 
            disabled={isLoading}
            className="connect-wallet-btn"
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Connecting...
              </>
            ) : (
              <>
                <span className="wallet-icon">🦊</span>
                Connect MetaMask
              </>
            )}
          </button>
          <p className="wallet-info">
            Connect your MetaMask wallet to interact with blockchain features
          </p>
        </div>
      ) : (
        <div className="wallet-connected">
          <div className="wallet-details">
            <div className="account-info">
              <span className="account-label">Account:</span>
              <span 
                className="account-address" 
                onClick={copyToClipboard}
                title="Click to copy full address"
              >
                {formatAddress(account)}
              </span>
            </div>
            <div className="balance-info">
              <span className="balance-label">Balance:</span>
              <span className="balance-amount">{balance} POL</span>
            </div>
          </div>
          
          <div className="wallet-actions">
            <button 
              onClick={() => updateBalance(account)} 
              className="refresh-btn"
              title="Refresh balance"
            >
              🔄
            </button>
            <button 
              onClick={disconnectWallet} 
              className="disconnect-btn"
              title="Disconnect wallet"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      <div className="network-info">
        <span className="network-indicator">
          <span className="network-dot"></span>
          Polygon Amoy Testnet
        </span>
      </div>
    </div>
  );
};

export default Web3Wallet;
