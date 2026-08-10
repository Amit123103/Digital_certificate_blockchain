// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CertificateRegistry
 * @dev Manages digital certificates, SHA-256 / Keccak-256 hashes, authorization of issuers, and revocation.
 */
contract CertificateRegistry is AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    struct Certificate {
        bytes32 certificateHash;
        string certificateId;
        string productId;
        address issuer;
        uint256 issuedAt;
        bool revoked;
    }

    // Certificate ID => Certificate
    mapping(string => Certificate) private _certificates;
    // Certificate ID => boolean existence check
    mapping(string => bool) private _exists;

    event CertificateRegistered(
        string indexed certificateId,
        bytes32 indexed certificateHash,
        string productId,
        address indexed issuer,
        uint256 issuedAt
    );

    event CertificateRevoked(
        string indexed certificateId,
        address indexed revokedBy,
        uint256 revokedAt
    );

    event IssuerAdded(address indexed account);
    event IssuerRemoved(address indexed account);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ISSUER_ROLE, admin);
    }

    function addIssuer(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(account != address(0), "Invalid address");
        grantRole(ISSUER_ROLE, account);
        emit IssuerAdded(account);
    }

    function removeIssuer(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(ISSUER_ROLE, account);
        emit IssuerRemoved(account);
    }

    function registerCertificate(
        string calldata certificateId,
        bytes32 certificateHash,
        string calldata productId
    ) external onlyRole(ISSUER_ROLE) {
        require(bytes(certificateId).length > 0, "Empty certificate ID");
        require(certificateHash != bytes32(0), "Invalid certificate hash");
        require(!_exists[certificateId], "Certificate ID already exists");

        _certificates[certificateId] = Certificate({
            certificateHash: certificateHash,
            certificateId: certificateId,
            productId: productId,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            revoked: false
        });

        _exists[certificateId] = true;

        emit CertificateRegistered(
            certificateId,
            certificateHash,
            productId,
            msg.sender,
            block.timestamp
        );
    }

    function revokeCertificate(string calldata certificateId) external {
        require(_exists[certificateId], "Certificate does not exist");
        Certificate storage cert = _certificates[certificateId];
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || cert.issuer == msg.sender,
            "Not authorized to revoke"
        );
        require(!cert.revoked, "Certificate already revoked");

        cert.revoked = true;

        emit CertificateRevoked(certificateId, msg.sender, block.timestamp);
    }

    function verifyCertificate(
        string calldata certificateId,
        bytes32 inputHash
    ) external view returns (bool isValid, bool isRevoked, bool hashMatch) {
        if (!_exists[certificateId]) {
            return (false, false, false);
        }

        Certificate memory cert = _certificates[certificateId];
        hashMatch = (cert.certificateHash == inputHash);
        isRevoked = cert.revoked;
        isValid = hashMatch && !isRevoked;
    }

    function isCertificateValid(string calldata certificateId) external view returns (bool) {
        if (!_exists[certificateId]) return false;
        Certificate memory cert = _certificates[certificateId];
        return !cert.revoked && cert.certificateHash != bytes32(0);
    }

    function getCertificate(string calldata certificateId)
        external
        view
        returns (
            bytes32 certificateHash,
            string memory id,
            string memory productId,
            address issuer,
            uint256 issuedAt,
            bool revoked
        )
    {
        require(_exists[certificateId], "Certificate does not exist");
        Certificate memory cert = _certificates[certificateId];
        return (
            cert.certificateHash,
            cert.certificateId,
            cert.productId,
            cert.issuer,
            cert.issuedAt,
            cert.revoked
        );
    }

    function certificateExists(string calldata certificateId) external view returns (bool) {
        return _exists[certificateId];
    }
}
