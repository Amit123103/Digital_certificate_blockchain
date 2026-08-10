// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ProductRegistry.sol";

/**
 * @title SupplyChain
 * @dev Tracks product transfers, custodian movements, locations, and status updates across the supply chain.
 */
contract SupplyChain {
    ProductRegistry public productRegistry;

    struct TransferEvent {
        string productId;
        address from;
        address to;
        string location;
        uint256 timestamp;
        string status;
        string notes;
    }

    // Product ID => array of supply chain events
    mapping(string => TransferEvent[]) private _productHistory;

    event SupplyChainEventCreated(
        string indexed productId,
        address indexed from,
        address indexed to,
        string location,
        uint256 timestamp,
        string status,
        string notes
    );

    constructor(address productRegistryAddress) {
        require(productRegistryAddress != address(0), "Invalid product registry");
        productRegistry = ProductRegistry(productRegistryAddress);
    }

    function recordTransfer(
        string calldata productId,
        address to,
        string calldata location,
        string calldata status,
        string calldata notes
    ) external {
        require(productRegistry.productExists(productId), "Product does not exist");
        require(to != address(0), "Invalid recipient address");

        (,,,,,, address currentOwner,,) = productRegistry.getProduct(productId);
        require(msg.sender == currentOwner, "Not current owner of product");

        TransferEvent memory newEvent = TransferEvent({
            productId: productId,
            from: msg.sender,
            to: to,
            location: location,
            timestamp: block.timestamp,
            status: status,
            notes: notes
        });

        _productHistory[productId].push(newEvent);

        // Update status first, then transfer ownership in ProductRegistry
        productRegistry.updateProductStatus(productId, status);
        productRegistry.transferOwnership(productId, to);

        emit SupplyChainEventCreated(
            productId,
            msg.sender,
            to,
            location,
            block.timestamp,
            status,
            notes
        );
    }

    function getProductHistory(string calldata productId)
        external
        view
        returns (TransferEvent[] memory)
    {
        return _productHistory[productId];
    }

    function getEventCount(string calldata productId) external view returns (uint256) {
        return _productHistory[productId].length;
    }
}
