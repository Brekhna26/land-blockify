// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
// Removed ReentrancyGuard to test if it's causing the issue
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title LandRegistryFixed
 * @dev Smart contract for land ownership registration and verification (without reentrancy guard)
 */
contract LandRegistryFixed is Ownable {
    using Counters for Counters.Counter;

    // Counter for property IDs
    Counters.Counter private _propertyIdCounter;

    // Struct to represent a land property
    struct Property {
        uint256 propertyId;
        string propertyIdentifier; // External property ID from database
        address govt; // Government authority who registered the property
        string ownerName; // Name of the actual property owner
        string location;
        uint256 landArea; // in square meters
        string propertyType;
        string legalDescription;
        string documentHash; // IPFS hash or document hash
        uint256 registrationTimestamp;
        bool isActive;
        bool isApproved;
        address approvedBy; // Government authority address
    }

    // Mapping from property ID to Property
    mapping(uint256 => Property) public properties;

    // Mapping from property identifier to property ID
    mapping(string => uint256) public propertyIdentifierToId;

    // Mapping from government authority to list of property IDs they registered
    mapping(address => uint256[]) public govtProperties;

    // Mapping from owner name to list of property IDs
    mapping(string => uint256[]) public ownerNameProperties;

    // Mapping for authorized government authorities
    mapping(address => bool) public authorizedAuthorities;

    // Events
    event PropertyRegistered(
        uint256 indexed propertyId,
        string propertyIdentifier,
        address indexed govt,
        string ownerName,
        string location,
        uint256 landArea
    );

    event PropertyApproved(
        uint256 indexed propertyId,
        address indexed approvedBy,
        uint256 timestamp
    );

    event PropertyTransferred(
        uint256 indexed propertyId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );

    event AuthorityAdded(address indexed authority);
    event AuthorityRemoved(address indexed authority);

    // Modifiers
    modifier onlyAuthorizedAuthority() {
        require(
            authorizedAuthorities[msg.sender],
            "Not an authorized authority"
        );
        _;
    }

    modifier propertyExists(uint256 _propertyId) {
        require(
            _propertyId <= _propertyIdCounter.current(),
            "Property does not exist"
        );
        require(properties[_propertyId].isActive, "Property is not active");
        _;
    }

    modifier onlyPropertyGovt(uint256 _propertyId) {
        require(
            properties[_propertyId].govt == msg.sender,
            "Not the registering government authority"
        );
        _;
    }

    constructor() Ownable() {
        // Add deployer as the first authorized authority
        authorizedAuthorities[msg.sender] = true;
        emit AuthorityAdded(msg.sender);
    }

    /**
     * @dev Add a new authorized government authority
     * @param _authority Address of the authority to add
     */
    function addAuthority(address _authority) external onlyOwner {
        require(_authority != address(0), "Invalid authority address");
        require(!authorizedAuthorities[_authority], "Authority already exists");

        authorizedAuthorities[_authority] = true;
        emit AuthorityAdded(_authority);
    }

    /**
     * @dev Remove an authorized government authority
     * @param _authority Address of the authority to remove
     */
    function removeAuthority(address _authority) external onlyOwner {
        require(authorizedAuthorities[_authority], "Authority does not exist");

        authorizedAuthorities[_authority] = false;
        emit AuthorityRemoved(_authority);
    }

    /**
     * @dev Register a new land property (without nonReentrant modifier)
     * @param _propertyIdentifier External property identifier from database
     * @param _ownerName Name of the actual property owner
     * @param _location Property location
     * @param _landArea Land area in square meters
     * @param _propertyType Type of property
     * @param _legalDescription Legal description of the property
     * @param _documentHash Hash of the property documents
     */
    function registerProperty(
        string memory _propertyIdentifier,
        string memory _ownerName,
        string memory _location,
        uint256 _landArea,
        string memory _propertyType,
        string memory _legalDescription,
        string memory _documentHash
    ) external onlyAuthorizedAuthority returns (uint256) { // Removed nonReentrant modifier
        require(bytes(_ownerName).length > 0, "Owner name required");
        require(
            bytes(_propertyIdentifier).length > 0,
            "Property identifier required"
        );
        require(
            propertyIdentifierToId[_propertyIdentifier] == 0,
            "Property already registered"
        );
        require(_landArea > 0, "Land area must be greater than 0");

        _propertyIdCounter.increment();
        uint256 newPropertyId = _propertyIdCounter.current();

        // Create new property
        properties[newPropertyId] = Property({
            propertyId: newPropertyId,
            propertyIdentifier: _propertyIdentifier,
            govt: msg.sender,
            ownerName: _ownerName,
            location: _location,
            landArea: _landArea,
            propertyType: _propertyType,
            legalDescription: _legalDescription,
            documentHash: _documentHash,
            registrationTimestamp: block.timestamp,
            isActive: true,
            isApproved: false,
            approvedBy: address(0)
        });

        // Update mappings
        propertyIdentifierToId[_propertyIdentifier] = newPropertyId;
        govtProperties[msg.sender].push(newPropertyId);
        ownerNameProperties[_ownerName].push(newPropertyId);

        emit PropertyRegistered(
            newPropertyId,
            _propertyIdentifier,
            msg.sender,
            _ownerName,
            _location,
            _landArea
        );

        return newPropertyId;
    }

    /**
     * @dev Approve a registered property
     * @param _propertyId Property ID to approve
     */
    function approveProperty(
        uint256 _propertyId
    ) external onlyAuthorizedAuthority propertyExists(_propertyId) {
        require(
            !properties[_propertyId].isApproved,
            "Property already approved"
        );

        properties[_propertyId].isApproved = true;
        properties[_propertyId].approvedBy = msg.sender;

        emit PropertyApproved(_propertyId, msg.sender, block.timestamp);
    }

    /**
     * @dev Get property details by ID
     * @param _propertyId Property ID
     * @return Property details
     */
    function getProperty(
        uint256 _propertyId
    ) external view propertyExists(_propertyId) returns (Property memory) {
        return properties[_propertyId];
    }

    /**
     * @dev Get property ID by identifier
     * @param _propertyIdentifier Property identifier
     * @return Property ID
     */
    function getPropertyIdByIdentifier(
        string memory _propertyIdentifier
    ) external view returns (uint256) {
        return propertyIdentifierToId[_propertyIdentifier];
    }

    /**
     * @dev Get all properties owned by a specific owner name
     * @param _ownerName Owner name
     * @return Array of property IDs
     */
    function getPropertiesByOwnerName(
        string memory _ownerName
    ) external view returns (uint256[] memory) {
        return ownerNameProperties[_ownerName];
    }

    /**
     * @dev Get all properties registered by a government authority
     * @param _govt Government authority address
     * @return Array of property IDs
     */
    function getPropertiesByGovt(
        address _govt
    ) external view returns (uint256[] memory) {
        return govtProperties[_govt];
    }

    /**
     * @dev Get total number of registered properties
     * @return Total property count
     */
    function getTotalProperties() external view returns (uint256) {
        return _propertyIdCounter.current();
    }

    /**
     * @dev Verify property ownership by owner name
     * @param _propertyId Property ID to verify
     * @param _ownerName Owner name to verify
     * @return True if the name matches the property owner
     */
    function verifyOwnershipByName(
        uint256 _propertyId,
        string memory _ownerName
    ) external view propertyExists(_propertyId) returns (bool) {
        return
            keccak256(bytes(properties[_propertyId].ownerName)) ==
            keccak256(bytes(_ownerName));
    }

    /**
     * @dev Verify if government authority registered the property
     * @param _propertyId Property ID to verify
     * @param _govt Government address to verify
     * @return True if the government authority registered the property
     */
    function verifyGovtRegistration(
        uint256 _propertyId,
        address _govt
    ) external view propertyExists(_propertyId) returns (bool) {
        return properties[_propertyId].govt == _govt;
    }

    /**
     * @dev Verify if address owns the property (is the registering government authority)
     * @param _propertyId Property ID to verify
     * @param _owner Address to verify
     * @return True if the address registered the property
     */
    function verifyOwnership(
        uint256 _propertyId,
        address _owner
    ) external view propertyExists(_propertyId) returns (bool) {
        return properties[_propertyId].govt == _owner;
    }
}
