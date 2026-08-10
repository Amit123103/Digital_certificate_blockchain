// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CertificateRegistry.sol";
import "./ProductRegistry.sol";

/**
 * @title ProductNFT
 * @dev ERC-721 token representing verified products with immutable linkage to CertificateRegistry and ProductRegistry.
 */
contract ProductNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    CertificateRegistry public certificateRegistry;
    ProductRegistry public productRegistry;

    // Product ID => Token ID
    mapping(string => uint256) private _productToTokenId;
    // Token ID => Product ID
    mapping(uint256 => string) private _tokenToProductId;
    // Product ID => is minted
    mapping(string => bool) private _isMinted;

    event ProductNFTMinted(
        uint256 indexed tokenId,
        string indexed productId,
        string certificateId,
        address indexed owner,
        string tokenURI
    );

    constructor(
        address initialOwner,
        address certRegistryAddress,
        address productRegistryAddress
    ) ERC721("TrustChain Product NFT", "TCPN") Ownable(initialOwner) {
        require(certRegistryAddress != address(0), "Invalid certificate registry");
        require(productRegistryAddress != address(0), "Invalid product registry");
        certificateRegistry = CertificateRegistry(certRegistryAddress);
        productRegistry = ProductRegistry(productRegistryAddress);
        _nextTokenId = 1;
    }

    function mintProductNFT(string calldata productId, string calldata metadataURI)
        external
        returns (uint256)
    {
        require(!_isMinted[productId], "NFT already minted for product");
        require(productRegistry.productExists(productId), "Product does not exist");

        (,,,, string memory certId,, address currentOwner, string memory status,) =
            productRegistry.getProduct(productId);

        require(msg.sender == currentOwner, "Caller is not current product owner");
        require(
            certificateRegistry.isCertificateValid(certId),
            "Associated certificate is invalid or revoked"
        );

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        _productToTokenId[productId] = tokenId;
        _tokenToProductId[tokenId] = productId;
        _isMinted[productId] = true;

        productRegistry.updateProductStatus(productId, "TOKENIZED");

        emit ProductNFTMinted(tokenId, productId, certId, msg.sender, metadataURI);

        return tokenId;
    }

    function getTokenIdByProductId(string calldata productId) external view returns (uint256) {
        require(_isMinted[productId], "Product not tokenized");
        return _productToTokenId[productId];
    }

    function getProductIdByTokenId(uint256 tokenId) external view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _tokenToProductId[tokenId];
    }

    function isProductMinted(string calldata productId) external view returns (bool) {
        return _isMinted[productId];
    }
}
