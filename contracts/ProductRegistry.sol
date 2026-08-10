// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./CertificateRegistry.sol";

/**
 * @title ProductRegistry
 * @dev Registers products linked to verified digital certificates.
 */
contract ProductRegistry is AccessControl {
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");

    CertificateRegistry public certificateRegistry;

    struct Product {
        string productId;
        string name;
        string description;
        address manufacturer;
        string certificateId;
        uint256 manufacturingDate;
        address currentOwner;
        string status;
        string metadataURI;
        uint256 createdAt;
    }

    mapping(string => Product) private _products;
    mapping(string => bool) private _exists;

    event ProductRegistered(
        string indexed productId,
        string name,
        address indexed manufacturer,
        string certificateId,
        uint256 createdAt
    );

    event ProductUpdated(
        string indexed productId,
        string newStatus,
        address indexed updatedBy
    );

    event ProductTransferred(
        string indexed productId,
        address indexed from,
        address indexed to
    );

    constructor(address admin, address certRegistryAddress) {
        require(certRegistryAddress != address(0), "Invalid certificate registry");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MANUFACTURER_ROLE, admin);
        certificateRegistry = CertificateRegistry(certRegistryAddress);
    }

    function addManufacturer(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(MANUFACTURER_ROLE, account);
    }

    function registerProduct(
        string calldata productId,
        string calldata name,
        string calldata description,
        string calldata certificateId,
        string calldata metadataURI
    ) external onlyRole(MANUFACTURER_ROLE) {
        require(bytes(productId).length > 0, "Empty product ID");
        require(!_exists[productId], "Product already registered");
        require(
            certificateRegistry.isCertificateValid(certificateId),
            "Invalid or revoked certificate"
        );

        _products[productId] = Product({
            productId: productId,
            name: name,
            description: description,
            manufacturer: msg.sender,
            certificateId: certificateId,
            manufacturingDate: block.timestamp,
            currentOwner: msg.sender,
            status: "REGISTERED",
            metadataURI: metadataURI,
            createdAt: block.timestamp
        });

        _exists[productId] = true;

        emit ProductRegistered(productId, name, msg.sender, certificateId, block.timestamp);
    }

    function updateProductStatus(string calldata productId, string calldata newStatus) external {
        require(_exists[productId], "Product does not exist");
        Product storage prod = _products[productId];
        require(
            msg.sender == prod.currentOwner || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Not product owner"
        );

        prod.status = newStatus;
        emit ProductUpdated(productId, newStatus, msg.sender);
    }

    function transferOwnership(string calldata productId, address newOwner) external {
        require(_exists[productId], "Product does not exist");
        require(newOwner != address(0), "Invalid new owner");
        Product storage prod = _products[productId];
        require(msg.sender == prod.currentOwner, "Not current owner");

        address previousOwner = prod.currentOwner;
        prod.currentOwner = newOwner;

        emit ProductTransferred(productId, previousOwner, newOwner);
    }

    function getProduct(string calldata productId)
        external
        view
        returns (
            string memory id,
            string memory name,
            string memory description,
            address manufacturer,
            string memory certificateId,
            uint256 manufacturingDate,
            address currentOwner,
            string memory status,
            string memory metadataURI
        )
    {
        require(_exists[productId], "Product does not exist");
        Product memory prod = _products[productId];
        return (
            prod.productId,
            prod.name,
            prod.description,
            prod.manufacturer,
            prod.certificateId,
            prod.manufacturingDate,
            prod.currentOwner,
            prod.status,
            prod.metadataURI
        );
    }

    function productExists(string calldata productId) external view returns (bool) {
        return _exists[productId];
    }
}
