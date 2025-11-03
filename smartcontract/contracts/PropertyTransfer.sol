// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./LandRegistry.sol";

/**
 * @title PropertyTransfer
 * @dev Smart contract for handling property sale transactions
 */
contract PropertyTransfer is Ownable(msg.sender), ReentrancyGuard {
    using Counters for Counters.Counter;

    // Counter for transaction IDs
    Counters.Counter private _transactionIdCounter;

    // Reference to LandRegistry contract
    LandRegistry public landRegistry;

    // Transaction status enum
    enum TransactionStatus {
        Pending,
        Accepted,
        Completed,
        Cancelled,
        Disputed
    }

    // Struct to represent a property sale transaction
    struct Transaction {
        uint256 transactionId;
        uint256 propertyId;
        address seller;
        address buyer;
        uint256 price; // Price in wei
        uint256 createdTimestamp;
        uint256 completedTimestamp;
        TransactionStatus status;
        string terms; // Additional terms or conditions
        bool escrowReleased;
    }

    // Mapping from transaction ID to Transaction
    mapping(uint256 => Transaction) public transactions;

    // Mapping from property ID to active transaction ID
    mapping(uint256 => uint256) public propertyActiveTransaction;

    // Mapping from user address to their transaction IDs
    mapping(address => uint256[]) public userTransactions;

    // Escrow balance for each transaction
    mapping(uint256 => uint256) public escrowBalance;

    // Events
    event TransactionCreated(
        uint256 indexed transactionId,
        uint256 indexed propertyId,
        address indexed seller,
        address buyer,
        uint256 price
    );

    event TransactionAccepted(
        uint256 indexed transactionId,
        address indexed buyer,
        uint256 timestamp
    );

    event TransactionCompleted(
        uint256 indexed transactionId,
        uint256 indexed propertyId,
        address indexed seller,
        address buyer,
        uint256 price,
        uint256 timestamp
    );

    event TransactionCancelled(
        uint256 indexed transactionId,
        address indexed cancelledBy,
        uint256 timestamp
    );

    event EscrowDeposited(
        uint256 indexed transactionId,
        address indexed buyer,
        uint256 amount
    );

    event EscrowReleased(
        uint256 indexed transactionId,
        address indexed seller,
        uint256 amount
    );

    event DisputeRaised(
        uint256 indexed transactionId,
        address indexed raisedBy,
        uint256 timestamp
    );

    // Modifiers
    modifier transactionExists(uint256 _transactionId) {
        require(
            _transactionId <= _transactionIdCounter.current(),
            "Transaction does not exist"
        );
        _;
    }

    modifier onlyTransactionParty(uint256 _transactionId) {
        Transaction memory txn = transactions[_transactionId];
        require(
            msg.sender == txn.seller || msg.sender == txn.buyer,
            "Not a transaction party"
        );
        _;
    }

    modifier onlyBuyer(uint256 _transactionId) {
        require(
            transactions[_transactionId].buyer == msg.sender,
            "Not the buyer"
        );
        _;
    }

    modifier onlySeller(uint256 _transactionId) {
        require(
            transactions[_transactionId].seller == msg.sender,
            "Not the seller"
        );
        _;
    }

    constructor(address _landRegistryAddress) {
        require(
            _landRegistryAddress != address(0),
            "Invalid LandRegistry address"
        );
        landRegistry = LandRegistry(_landRegistryAddress);
    }

    /**
     * @dev Create a new property sale transaction
     * @param _propertyId Property ID from LandRegistry
     * @param _buyer Buyer address
     * @param _price Sale price in wei
     * @param _terms Additional terms or conditions
     */
    function createTransaction(
        uint256 _propertyId,
        address _buyer,
        uint256 _price,
        string memory _terms
    ) external nonReentrant returns (uint256) {
        require(_buyer != address(0), "Invalid buyer address");
        require(_buyer != msg.sender, "Cannot sell to yourself");
        require(_price > 0, "Price must be greater than 0");
        require(
            propertyActiveTransaction[_propertyId] == 0,
            "Property already has active transaction"
        );

        // Verify seller owns the property
        require(
            landRegistry.verifyOwnership(_propertyId, msg.sender),
            "Not the property owner"
        );

        // Get property details to ensure it's approved
        LandRegistry.Property memory property = landRegistry.getProperty(
            _propertyId
        );
        require(property.isApproved, "Property must be approved for sale");

        _transactionIdCounter.increment();
        uint256 newTransactionId = _transactionIdCounter.current();

        // Create new transaction
        transactions[newTransactionId] = Transaction({
            transactionId: newTransactionId,
            propertyId: _propertyId,
            seller: msg.sender,
            buyer: _buyer,
            price: _price,
            createdTimestamp: block.timestamp,
            completedTimestamp: 0,
            status: TransactionStatus.Pending,
            terms: _terms,
            escrowReleased: false
        });

        // Update mappings
        propertyActiveTransaction[_propertyId] = newTransactionId;
        userTransactions[msg.sender].push(newTransactionId);
        userTransactions[_buyer].push(newTransactionId);

        emit TransactionCreated(
            newTransactionId,
            _propertyId,
            msg.sender,
            _buyer,
            _price
        );

        return newTransactionId;
    }

    /**
     * @dev Buyer accepts the transaction and deposits escrow
     * @param _transactionId Transaction ID
     */
    function acceptTransaction(
        uint256 _transactionId
    )
        external
        payable
        transactionExists(_transactionId)
        onlyBuyer(_transactionId)
        nonReentrant
    {
        Transaction storage txn = transactions[_transactionId];
        require(
            txn.status == TransactionStatus.Pending,
            "Transaction not pending"
        );
        require(msg.value == txn.price, "Incorrect payment amount");

        // Update transaction status
        txn.status = TransactionStatus.Accepted;

        // Store escrow
        escrowBalance[_transactionId] = msg.value;

        emit TransactionAccepted(_transactionId, msg.sender, block.timestamp);
        emit EscrowDeposited(_transactionId, msg.sender, msg.value);
    }

    /**
     * @dev Complete the transaction and transfer property
     * @param _transactionId Transaction ID
     */
    function completeTransaction(
        uint256 _transactionId
    )
        external
        transactionExists(_transactionId)
        onlySeller(_transactionId)
        nonReentrant
    {
        Transaction storage txn = transactions[_transactionId];
        require(
            txn.status == TransactionStatus.Accepted,
            "Transaction not accepted"
        );
        require(escrowBalance[_transactionId] > 0, "No escrow deposited");
        require(!txn.escrowReleased, "Escrow already released");

        // Transfer property ownership in LandRegistry
        landRegistry.transferProperty(txn.propertyId, txn.buyer);

        // Release escrow to seller
        uint256 escrowAmount = escrowBalance[_transactionId];
        escrowBalance[_transactionId] = 0;
        txn.escrowReleased = true;
        txn.status = TransactionStatus.Completed;
        txn.completedTimestamp = block.timestamp;

        // Clear active transaction for property
        propertyActiveTransaction[txn.propertyId] = 0;

        // Transfer funds to seller
        (bool success, ) = payable(txn.seller).call{value: escrowAmount}("");
        require(success, "Failed to transfer funds to seller");

        emit TransactionCompleted(
            _transactionId,
            txn.propertyId,
            txn.seller,
            txn.buyer,
            txn.price,
            block.timestamp
        );

        emit EscrowReleased(_transactionId, txn.seller, escrowAmount);
    }

    /**
     * @dev Cancel a pending transaction
     * @param _transactionId Transaction ID
     */
    function cancelTransaction(
        uint256 _transactionId
    )
        external
        transactionExists(_transactionId)
        onlyTransactionParty(_transactionId)
        nonReentrant
    {
        Transaction storage txn = transactions[_transactionId];
        require(
            txn.status == TransactionStatus.Pending ||
                txn.status == TransactionStatus.Accepted,
            "Cannot cancel completed transaction"
        );

        // If transaction was accepted, refund escrow to buyer
        if (
            txn.status == TransactionStatus.Accepted &&
            escrowBalance[_transactionId] > 0
        ) {
            uint256 refundAmount = escrowBalance[_transactionId];
            escrowBalance[_transactionId] = 0;

            (bool success, ) = payable(txn.buyer).call{value: refundAmount}("");
            require(success, "Failed to refund buyer");
        }

        // Update transaction status
        txn.status = TransactionStatus.Cancelled;

        // Clear active transaction for property
        propertyActiveTransaction[txn.propertyId] = 0;

        emit TransactionCancelled(_transactionId, msg.sender, block.timestamp);
    }

    /**
     * @dev Raise a dispute for a transaction
     * @param _transactionId Transaction ID
     */
    function raiseDispute(
        uint256 _transactionId
    )
        external
        transactionExists(_transactionId)
        onlyTransactionParty(_transactionId)
    {
        Transaction storage txn = transactions[_transactionId];
        require(
            txn.status == TransactionStatus.Accepted,
            "Can only dispute accepted transactions"
        );

        txn.status = TransactionStatus.Disputed;

        emit DisputeRaised(_transactionId, msg.sender, block.timestamp);
    }

    /**
     * @dev Resolve a dispute (only owner can call this)
     * @param _transactionId Transaction ID
     * @param _refundBuyer Whether to refund the buyer or pay the seller
     */
    function resolveDispute(
        uint256 _transactionId,
        bool _refundBuyer
    ) external onlyOwner transactionExists(_transactionId) nonReentrant {
        Transaction storage txn = transactions[_transactionId];
        require(
            txn.status == TransactionStatus.Disputed,
            "Transaction not disputed"
        );
        require(escrowBalance[_transactionId] > 0, "No escrow to resolve");

        uint256 escrowAmount = escrowBalance[_transactionId];
        escrowBalance[_transactionId] = 0;
        txn.escrowReleased = true;

        if (_refundBuyer) {
            // Refund buyer
            txn.status = TransactionStatus.Cancelled;
            (bool success, ) = payable(txn.buyer).call{value: escrowAmount}("");
            require(success, "Failed to refund buyer");
        } else {
            // Pay seller and transfer property
            landRegistry.transferProperty(txn.propertyId, txn.buyer);
            txn.status = TransactionStatus.Completed;
            txn.completedTimestamp = block.timestamp;

            (bool success, ) = payable(txn.seller).call{value: escrowAmount}(
                ""
            );
            require(success, "Failed to pay seller");

            emit TransactionCompleted(
                _transactionId,
                txn.propertyId,
                txn.seller,
                txn.buyer,
                txn.price,
                block.timestamp
            );
        }

        // Clear active transaction for property
        propertyActiveTransaction[txn.propertyId] = 0;
    }

    /**
     * @dev Get transaction details
     * @param _transactionId Transaction ID
     * @return Transaction details
     */
    function getTransaction(
        uint256 _transactionId
    )
        external
        view
        transactionExists(_transactionId)
        returns (Transaction memory)
    {
        return transactions[_transactionId];
    }

    /**
     * @dev Get all transactions for a user
     * @param _user User address
     * @return Array of transaction IDs
     */
    function getUserTransactions(
        address _user
    ) external view returns (uint256[] memory) {
        return userTransactions[_user];
    }

    /**
     * @dev Get active transaction for a property
     * @param _propertyId Property ID
     * @return Transaction ID (0 if no active transaction)
     */
    function getPropertyActiveTransaction(
        uint256 _propertyId
    ) external view returns (uint256) {
        return propertyActiveTransaction[_propertyId];
    }

    /**
     * @dev Get total number of transactions
     * @return Total transaction count
     */
    function getTotalTransactions() external view returns (uint256) {
        return _transactionIdCounter.current();
    }
}
