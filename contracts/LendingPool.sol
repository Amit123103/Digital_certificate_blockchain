// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title LendingPool
 * @dev Simplified educational NFT-backed lending protocol allowing users to lock product NFTs,
 * borrow mUSD up to LTV ratio, repay with interest, and retrieve collateral.
 */
contract LendingPool is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC721 public nftContract;
    IERC20 public borrowToken;

    uint256 public constant MAX_LTV_BPS = 5000; // 50% max Loan-to-Value
    uint256 public constant INTEREST_RATE_BPS = 500; // 5% flat loan interest

    uint256 private _nextLoanId;

    // Token ID => Valuation in mUSD (with 18 decimals)
    mapping(uint256 => uint256) public nftValuations;

    struct Loan {
        uint256 loanId;
        uint256 tokenId;
        address borrower;
        uint256 collateralValue;
        uint256 borrowedAmount;
        uint256 interestRate;
        uint256 startTime;
        bool repaid;
        bool liquidated;
    }

    // Loan ID => Loan
    mapping(uint256 => Loan) private _loans;
    // Token ID => active Loan ID
    mapping(uint256 => uint256) private _activeLoanByToken;

    event ValuationSet(uint256 indexed tokenId, uint256 valuation);
    event NFTDeposited(uint256 indexed loanId, uint256 indexed tokenId, address indexed borrower);
    event LoanBorrowed(uint256 indexed loanId, uint256 indexed tokenId, address indexed borrower, uint256 amount);
    event LoanRepaid(uint256 indexed loanId, uint256 indexed tokenId, address indexed borrower, uint256 amountPaid);
    event NFTWithdrawn(uint256 indexed loanId, uint256 indexed tokenId, address indexed borrower);

    constructor(
        address initialOwner,
        address nftContractAddress,
        address borrowTokenAddress
    ) Ownable(initialOwner) {
        require(nftContractAddress != address(0), "Invalid NFT contract");
        require(borrowTokenAddress != address(0), "Invalid borrow token");
        nftContract = IERC721(nftContractAddress);
        borrowToken = IERC20(borrowTokenAddress);
        _nextLoanId = 1;
    }

    function setNFTValuation(uint256 tokenId, uint256 valuation) external onlyOwner {
        require(valuation > 0, "Valuation must be greater than zero");
        nftValuations[tokenId] = valuation;
        emit ValuationSet(tokenId, valuation);
    }

    function depositAndBorrow(uint256 tokenId, uint256 borrowAmount)
        external
        nonReentrant
        returns (uint256)
    {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not token owner");
        uint256 valuation = nftValuations[tokenId];
        require(valuation > 0, "NFT has no valuation set by oracle");
        require(_activeLoanByToken[tokenId] == 0, "Token already collateralized");

        uint256 maxBorrow = (valuation * MAX_LTV_BPS) / 10000;
        require(borrowAmount > 0 && borrowAmount <= maxBorrow, "Borrow amount exceeds max LTV limit");
        require(borrowToken.balanceOf(address(this)) >= borrowAmount, "Insufficient liquidity in lending pool");

        uint256 loanId = _nextLoanId++;
        _loans[loanId] = Loan({
            loanId: loanId,
            tokenId: tokenId,
            borrower: msg.sender,
            collateralValue: valuation,
            borrowedAmount: borrowAmount,
            interestRate: INTEREST_RATE_BPS,
            startTime: block.timestamp,
            repaid: false,
            liquidated: false
        });

        _activeLoanByToken[tokenId] = loanId;

        // Escrow collateral NFT
        nftContract.transferFrom(msg.sender, address(this), tokenId);
        emit NFTDeposited(loanId, tokenId, msg.sender);

        // Disburse borrow tokens
        borrowToken.safeTransfer(msg.sender, borrowAmount);
        emit LoanBorrowed(loanId, tokenId, msg.sender, borrowAmount);

        return loanId;
    }

    function calculateTotalRepayment(uint256 loanId) public view returns (uint256) {
        Loan memory loan = _loans[loanId];
        if (loan.repaid || loan.borrowedAmount == 0) return 0;

        uint256 interest = (loan.borrowedAmount * loan.interestRate) / 10000;
        return loan.borrowedAmount + interest;
    }

    function repayLoan(uint256 loanId) external nonReentrant {
        Loan storage loan = _loans[loanId];
        require(!loan.repaid, "Loan already repaid");
        require(msg.sender == loan.borrower, "Not loan borrower");

        uint256 totalDue = calculateTotalRepayment(loanId);
        require(borrowToken.balanceOf(msg.sender) >= totalDue, "Insufficient mUSD balance for repayment");

        loan.repaid = true;
        _activeLoanByToken[loan.tokenId] = 0;

        // Transfer mUSD from borrower to lending pool
        borrowToken.safeTransferFrom(msg.sender, address(this), totalDue);
        emit LoanRepaid(loanId, loan.tokenId, msg.sender, totalDue);

        // Return NFT collateral to borrower
        nftContract.transferFrom(address(this), loan.borrower, loan.tokenId);
        emit NFTWithdrawn(loanId, loan.tokenId, msg.sender);
    }

    function getLoanDetails(uint256 loanId) external view returns (Loan memory) {
        return _loans[loanId];
    }

    function getActiveLoanForToken(uint256 tokenId) external view returns (Loan memory) {
        uint256 loanId = _activeLoanByToken[tokenId];
        require(loanId > 0, "No active loan for token");
        return _loans[loanId];
    }
}
