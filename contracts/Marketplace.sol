// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title Marketplace
 * @dev NFT Marketplace for listing, buying, and trading verified product NFTs with fee enforcement.
 */
contract Marketplace is ReentrancyGuard, Ownable {
    struct Listing {
        uint256 listingId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        uint256 price;
        bool active;
    }

    uint256 private _nextListingId;
    uint256 public marketplaceFeeBps; // Basis points (250 = 2.5%)
    address payable public feeRecipient;

    // Listing ID => Listing
    mapping(uint256 => Listing) private _listings;
    // NFT contract => Token ID => Listing ID
    mapping(address => mapping(uint256 => uint256)) private _activeListingId;

    event NFTListed(
        uint256 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        uint256 price
    );

    event NFTListingCancelled(
        uint256 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller
    );

    event NFTSold(
        uint256 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price
    );

    event MarketplaceFeeUpdated(uint256 newFeeBps);

    constructor(address initialOwner, uint256 feeBps) Ownable(initialOwner) {
        require(feeBps <= 1000, "Fee cannot exceed 10%");
        marketplaceFeeBps = feeBps;
        feeRecipient = payable(initialOwner);
        _nextListingId = 1;
    }

    function setMarketplaceFee(uint256 feeBps) external onlyOwner {
        require(feeBps <= 1000, "Fee cannot exceed 10%");
        marketplaceFeeBps = feeBps;
        emit MarketplaceFeeUpdated(feeBps);
    }

    function setFeeRecipient(address payable recipient) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        feeRecipient = recipient;
    }

    function listNFT(address nftContract, uint256 tokenId, uint256 price)
        external
        nonReentrant
        returns (uint256)
    {
        require(price > 0, "Price must be greater than zero");
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not token owner");
        require(
            nft.isApprovedForAll(msg.sender, address(this)) ||
            nft.getApproved(tokenId) == address(this),
            "Marketplace not approved to transfer NFT"
        );

        uint256 listingId = _nextListingId++;
        _listings[listingId] = Listing({
            listingId: listingId,
            nftContract: nftContract,
            tokenId: tokenId,
            seller: payable(msg.sender),
            price: price,
            active: true
        });

        _activeListingId[nftContract][tokenId] = listingId;

        // Escrow the NFT in marketplace contract
        nft.transferFrom(msg.sender, address(this), tokenId);

        emit NFTListed(listingId, nftContract, tokenId, msg.sender, price);
        return listingId;
    }

    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = _listings[listingId];
        require(listing.active, "Listing is not active");
        require(listing.seller == msg.sender || msg.sender == owner(), "Not seller or admin");

        listing.active = false;
        _activeListingId[listing.nftContract][listing.tokenId] = 0;

        IERC721(listing.nftContract).transferFrom(address(this), listing.seller, listing.tokenId);

        emit NFTListingCancelled(listingId, listing.nftContract, listing.tokenId, listing.seller);
    }

    function buyNFT(uint256 listingId) external payable nonReentrant {
        Listing storage listing = _listings[listingId];
        require(listing.active, "Listing is not active");
        require(msg.value >= listing.price, "Insufficient ETH payment");
        require(msg.sender != listing.seller, "Seller cannot buy own NFT");

        listing.active = false;
        _activeListingId[listing.nftContract][listing.tokenId] = 0;

        uint256 feeAmount = (listing.price * marketplaceFeeBps) / 10000;
        uint256 sellerPayout = listing.price - feeAmount;

        // Payout seller
        (bool sellerPaid, ) = listing.seller.call{value: sellerPayout}("");
        require(sellerPaid, "Failed to pay seller");

        // Fee payout
        if (feeAmount > 0) {
            (bool feePaid, ) = feeRecipient.call{value: feeAmount}("");
            require(feePaid, "Failed to pay marketplace fee");
        }

        // Refund excess payment
        if (msg.value > listing.price) {
            (bool refunded, ) = payable(msg.sender).call{value: msg.value - listing.price}("");
            require(refunded, "Failed to refund excess ETH");
        }

        // Transfer NFT to buyer
        IERC721(listing.nftContract).transferFrom(address(this), msg.sender, listing.tokenId);

        emit NFTSold(
            listingId,
            listing.nftContract,
            listing.tokenId,
            listing.seller,
            msg.sender,
            listing.price
        );
    }

    function getListing(uint256 listingId) external view returns (Listing memory) {
        return _listings[listingId];
    }

    function getActiveListingForToken(address nftContract, uint256 tokenId)
        external
        view
        returns (Listing memory)
    {
        uint256 listingId = _activeListingId[nftContract][tokenId];
        require(listingId > 0, "No active listing found");
        return _listings[listingId];
    }
}
