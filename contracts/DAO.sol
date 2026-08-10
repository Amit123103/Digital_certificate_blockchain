// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DAO
 * @dev Governance contract allowing TCG token holders to create proposals, cast weighted votes, and execute decisions.
 */
contract DAO is Ownable {
    IERC20 public governanceToken;

    enum VoteType { AGAINST, FOR, ABSTAIN }

    struct Proposal {
        uint256 id;
        string title;
        string description;
        address proposer;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 votesAbstain;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        bool canceled;
    }

    uint256 private _nextProposalId;
    uint256 public proposalThreshold; // Minimum TCG needed to create proposal
    uint256 public votingPeriod; // Duration in seconds

    // Proposal ID => Proposal
    mapping(uint256 => Proposal) private _proposals;
    // Proposal ID => Voter address => has voted
    mapping(uint256 => mapping(address => bool)) private _hasVoted;

    event ProposalCreated(
        uint256 indexed proposalId,
        string title,
        address indexed proposer,
        uint256 startTime,
        uint256 endTime
    );

    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        VoteType voteType,
        uint256 weight
    );

    event ProposalExecuted(uint256 indexed proposalId, address indexed executor);

    constructor(
        address initialOwner,
        address tokenAddress,
        uint256 minThreshold,
        uint256 durationSeconds
    ) Ownable(initialOwner) {
        require(tokenAddress != address(0), "Invalid token address");
        governanceToken = IERC20(tokenAddress);
        proposalThreshold = minThreshold;
        votingPeriod = durationSeconds;
        _nextProposalId = 1;
    }

    function createProposal(string calldata title, string calldata description)
        external
        returns (uint256)
    {
        require(
            governanceToken.balanceOf(msg.sender) >= proposalThreshold,
            "Insufficient TCG balance to create proposal"
        );
        require(bytes(title).length > 0, "Title cannot be empty");

        uint256 proposalId = _nextProposalId++;
        uint256 startTime = block.timestamp;
        uint256 endTime = block.timestamp + votingPeriod;

        _proposals[proposalId] = Proposal({
            id: proposalId,
            title: title,
            description: description,
            proposer: msg.sender,
            votesFor: 0,
            votesAgainst: 0,
            votesAbstain: 0,
            startTime: startTime,
            endTime: endTime,
            executed: false,
            canceled: false
        });

        emit ProposalCreated(proposalId, title, msg.sender, startTime, endTime);
        return proposalId;
    }

    function castVote(uint256 proposalId, VoteType voteType) external {
        Proposal storage proposal = _proposals[proposalId];
        require(proposal.id > 0, "Proposal does not exist");
        require(block.timestamp <= proposal.endTime, "Voting period has ended");
        require(!_hasVoted[proposalId][msg.sender], "Already voted on this proposal");

        uint256 voterWeight = governanceToken.balanceOf(msg.sender);
        require(voterWeight > 0, "Voter has zero TCG voting weight");

        _hasVoted[proposalId][msg.sender] = true;

        if (voteType == VoteType.FOR) {
            proposal.votesFor += voterWeight;
        } else if (voteType == VoteType.AGAINST) {
            proposal.votesAgainst += voterWeight;
        } else if (voteType == VoteType.ABSTAIN) {
            proposal.votesAbstain += voterWeight;
        }

        emit VoteCast(proposalId, msg.sender, voteType, voterWeight);
    }

    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = _proposals[proposalId];
        require(proposal.id > 0, "Proposal does not exist");
        require(block.timestamp > proposal.endTime, "Voting period is still active");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.canceled, "Proposal was canceled");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal did not pass");

        proposal.executed = true;

        emit ProposalExecuted(proposalId, msg.sender);
    }

    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return _proposals[proposalId];
    }

    function hasVotedOnProposal(uint256 proposalId, address voter) external view returns (bool) {
        return _hasVoted[proposalId][voter];
    }

    function setProposalThreshold(uint256 newThreshold) external onlyOwner {
        proposalThreshold = newThreshold;
    }

    function setVotingPeriod(uint256 newPeriodSeconds) external onlyOwner {
        votingPeriod = newPeriodSeconds;
    }
}
