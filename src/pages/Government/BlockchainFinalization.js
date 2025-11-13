import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getWeb3Service, createTransaction } from '../../utils/web3';
import Web3Wallet from '../../components/Web3Wallet';
import './BlockchainFinalization.css';

export default function BlockchainFinalization() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3001/api/transactions/government/transactions');
      // Filter for Government Approved transactions
      const approvedTransactions = res.data.filter(t => t.status === 'Government Approved');
      setTransactions(approvedTransactions);
    } catch (err) {
      console.error('❌ Error fetching transactions:', err);
      alert('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  // Finalize transaction on blockchain
  const handleFinalize = async (transaction) => {
    if (!walletConnected) {
      alert('❌ Please connect your MetaMask wallet first!');
      return;
    }

    if (transaction.status !== 'Government Approved') {
      alert('❌ Transaction must be in Government Approved status');
      return;
    }

    setProcessingId(transaction.id);
    try {
      console.log('🔗 Starting blockchain finalization for transaction:', transaction.id);

      // Get Web3 service
      const web3Service = getWeb3Service();
      
      if (!web3Service.account) {
        throw new Error('Wallet not connected to Web3Service');
      }

      // Prepare blockchain transaction parameters
      const blockchainParams = {
        propertyId: transaction.propertyId,
        buyerEmail: transaction.buyerEmail,
        sellerEmail: transaction.sellerEmail,
        price: '1', // Default price in MATIC (can be updated)
        terms: `Property transfer for ${transaction.propertyId} from ${transaction.sellerEmail} to ${transaction.buyerEmail}`
      };

      console.log('📝 Blockchain parameters:', blockchainParams);

      // Create blockchain transaction
      const blockchainTx = await createTransaction(
        transaction.propertyId,
        walletAddress, // Use connected wallet as buyer address
        blockchainParams.price,
        blockchainParams.terms
      );

      console.log('✅ Blockchain transaction result:', blockchainTx);

      if (!blockchainTx || !blockchainTx.success) {
        throw new Error(blockchainTx?.error || 'Blockchain transaction failed');
      }

      // Update transaction in database with blockchain tx hash
      console.log('💾 Updating database with blockchain tx hash...');
      await axios.post(
        `http://localhost:3001/api/transactions/finalize-blockchain/${transaction.id}`,
        { blockchainTxHash: blockchainTx.transactionHash }
      );

      console.log('✅ Transaction finalized successfully');

      // Update local state
      setTransactions(prev =>
        prev.map(t =>
          t.id === transaction.id
            ? {
                ...t,
                status: 'Completed',
                blockchain_tx_hash: blockchainTx.transactionHash
              }
            : t
        )
      );

      alert(`✅ Transaction finalized on blockchain!\n\nTx Hash: ${blockchainTx.transactionHash}`);
    } catch (error) {
      console.error('❌ Error finalizing transaction:', error);
      alert(`❌ Failed to finalize transaction:\n\n${error.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Separate transactions by status
  const governmentApprovedTx = transactions.filter(t => t.status === 'Government Approved');
  const completedTx = transactions.filter(t => t.status === 'Completed');

  return (
    <div className="blockchain-finalization">
      <div className="finalization-header">
        <h2>⛓️ Blockchain Transaction Finalization</h2>
        <p>Execute property transfers on the Polygon Amoy blockchain</p>
      </div>

      {/* Wallet Connection Section */}
      <div className="wallet-section">
        <h3>🔐 Wallet Connection</h3>
        <Web3Wallet
          onWalletConnect={async (address) => {
            console.log('🔗 Wallet connected:', address);
            setWalletConnected(true);
            setWalletAddress(typeof address === 'string' ? address : address?.address || '');
          }}
          onWalletDisconnect={() => {
            console.log('🔓 Wallet disconnected');
            setWalletConnected(false);
            setWalletAddress('');
          }}
        />
        {walletConnected && (
          <div className="wallet-info">
            <span className="wallet-status">✅ Connected</span>
            <span className="wallet-address">{walletAddress}</span>
          </div>
        )}
      </div>

      {!walletConnected && (
        <div className="warning-banner">
          ⚠️ Please connect your MetaMask wallet to finalize transactions on blockchain
        </div>
      )}

      {loading ? (
        <div className="loading">⏳ Loading transactions...</div>
      ) : (
        <>
          {/* Government Approved Transactions */}
          <div className="transactions-section">
            <h3>📋 Ready for Blockchain Finalization</h3>
            {governmentApprovedTx.length === 0 ? (
              <div className="no-data">No transactions ready for finalization</div>
            ) : (
              <div className="transactions-grid">
                {governmentApprovedTx.map((transaction) => (
                  <div key={transaction.id} className="transaction-card">
                    <div className="card-header">
                      <h4>Property: {transaction.propertyId}</h4>
                      <span className="badge badge-pending">⏳ Ready for Blockchain</span>
                    </div>

                    <div className="card-body">
                      <div className="info-row">
                        <span className="label">Seller:</span>
                        <span className="value">{transaction.sellerEmail}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Buyer:</span>
                        <span className="value">{transaction.buyerEmail}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Location:</span>
                        <span className="value">{transaction.location}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Area:</span>
                        <span className="value">{transaction.landArea} sq m</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Type:</span>
                        <span className="value">{transaction.propertyType}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Status:</span>
                        <span className="value status">{transaction.status}</span>
                      </div>
                    </div>

                    <div className="card-footer">
                      <button
                        className="btn btn-finalize"
                        onClick={() => handleFinalize(transaction)}
                        disabled={processingId === transaction.id || !walletConnected}
                        title={!walletConnected ? 'Connect wallet first' : 'Execute blockchain transfer'}
                      >
                        {processingId === transaction.id ? (
                          <>⏳ Processing...</>
                        ) : (
                          <>🔗 Finalize on Blockchain</>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Transactions */}
          {completedTx.length > 0 && (
            <div className="transactions-section completed-section">
              <h3>✅ Completed Transactions</h3>
              <div className="transactions-grid">
                {completedTx.map((transaction) => (
                  <div key={transaction.id} className="transaction-card completed">
                    <div className="card-header">
                      <h4>Property: {transaction.propertyId}</h4>
                      <span className="badge badge-completed">✅ Completed</span>
                    </div>

                    <div className="card-body">
                      <div className="info-row">
                        <span className="label">Seller:</span>
                        <span className="value">{transaction.sellerEmail}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Buyer:</span>
                        <span className="value">{transaction.buyerEmail}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Location:</span>
                        <span className="value">{transaction.location}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">TX Hash:</span>
                        <span className="value tx-hash">
                          {transaction.blockchain_tx_hash?.substring(0, 10)}...
                          {transaction.blockchain_tx_hash?.substring(-8)}
                        </span>
                      </div>
                    </div>

                    <div className="card-footer">
                      <a
                        href={`https://www.oklink.com/amoy/tx/${transaction.blockchain_tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-view-tx"
                      >
                        🔍 View on Explorer
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Summary Stats */}
      <div className="finalization-summary">
        <div className="stat">
          <span className="stat-label">Ready for Finalization:</span>
          <span className="stat-value">{governmentApprovedTx.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Completed:</span>
          <span className="stat-value">{completedTx.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Network:</span>
          <span className="stat-value">Polygon Amoy</span>
        </div>
      </div>
    </div>
  );
}
