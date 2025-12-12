// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TalentStake - Decentralized Referral Marketplace
 * @dev Implements "Skin in the Game" referral system with USDC staking
 *
 * Core Mechanics:
 * - Companies must escrow full bounty upfront
 * - Referrers stake USDC to submit candidates
 * - Spam stakes are confiscated and added to bounty pot
 * - Successful referrals split bounty 80/20 (referrer/candidate)
 */
contract TalentStake is Ownable, ReentrancyGuard {
    IERC20 public immutable usdc;

    // Constants
    uint256 public constant STAKE_AMOUNT = 50 * 10**6; // 50 USDC (6 decimals)
    uint256 public constant REFERRER_SHARE = 80; // 80% of bounty to referrer
    uint256 public constant CANDIDATE_SHARE = 20; // 20% of bounty to candidate

    // Enums
    enum JobState { Draft, Open, Closed }
    enum ReferralState { PendingClaim, Submitted, Rejected, Spam, Hired }

    // Structs
    struct Job {
        uint256 id;
        address creator;
        string title;
        string description;
        uint256 initialBounty;
        uint256 accumulatedSpam;
        JobState state;
        uint256 createdAt;
        uint256 closedAt;
    }

    struct Referral {
        uint256 id;
        uint256 jobId;
        address referrer;
        address candidate;
        string pitch;
        uint256 stakeAmount;
        ReferralState state;
        uint256 createdAt;
        bytes32 claimHash; // For secret claim links
    }

    // State variables
    uint256 public nextJobId = 1;
    uint256 public nextReferralId = 1;

    mapping(uint256 => Job) public jobs;
    mapping(uint256 => Referral) public referrals;
    mapping(uint256 => uint256[]) public jobReferrals; // jobId => referralIds
    mapping(address => uint256[]) public userJobs; // user => jobIds
    mapping(address => uint256[]) public userReferrals; // user => referralIds
    mapping(bytes32 => uint256) public claimHashToReferralId; // claimHash => referralId

    // Events
    event JobCreated(uint256 indexed jobId, address indexed creator, uint256 bounty);
    event ReferralStaked(uint256 indexed referralId, uint256 indexed jobId, address indexed referrer, bytes32 claimHash);
    event ReferralClaimed(uint256 indexed referralId, address indexed candidate);
    event ReferralAdjudicated(uint256 indexed referralId, ReferralState state, address indexed adjudicator);
    event JobWithdrawn(uint256 indexed jobId, address indexed creator, uint256 returnedAmount);
    event FundsDistributed(uint256 indexed referralId, address indexed referrer, address indexed candidate, uint256 referrerAmount, uint256 candidateAmount);

    constructor(address _usdcAddress) {
        usdc = IERC20(_usdcAddress);
    }

    /**
     * @dev Create a new job posting with USDC escrow
     * @param title Job title
     * @param description Job description
     * @param bountyAmount USDC amount to escrow (in smallest units)
     */
    function createJob(
        string calldata title,
        string calldata description,
        uint256 bountyAmount
    ) external nonReentrant {
        require(bountyAmount > 0, "Bounty must be greater than 0");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");

        // Transfer USDC from creator to contract
        require(usdc.transferFrom(msg.sender, address(this), bountyAmount), "USDC transfer failed");

        // Create job
        uint256 jobId = nextJobId++;
        jobs[jobId] = Job({
            id: jobId,
            creator: msg.sender,
            title: title,
            description: description,
            initialBounty: bountyAmount,
            accumulatedSpam: 0,
            state: JobState.Open,
            createdAt: block.timestamp,
            closedAt: 0
        });

        userJobs[msg.sender].push(jobId);

        emit JobCreated(jobId, msg.sender, bountyAmount);
    }

    /**
     * @dev Stake USDC and create a referral link
     * @param jobId ID of the job to refer for
     * @param pitch Referral pitch text
     * @return referralId The created referral ID
     * @return claimHash Hash for the secret claim link
     */
    function stakeReferral(
        uint256 jobId,
        string calldata pitch
    ) external nonReentrant returns (uint256 referralId, bytes32 claimHash) {
        Job storage job = jobs[jobId];
        require(job.state == JobState.Open, "Job is not open");
        require(bytes(pitch).length > 0, "Pitch cannot be empty");

        // Transfer stake from referrer to contract
        require(usdc.transferFrom(msg.sender, address(this), STAKE_AMOUNT), "Stake transfer failed");

        // Generate unique claim hash (secret link)
        claimHash = keccak256(abi.encodePacked(jobId, msg.sender, block.timestamp, block.number));

        // Create referral
        referralId = nextReferralId++;
        referrals[referralId] = Referral({
            id: referralId,
            jobId: jobId,
            referrer: msg.sender,
            candidate: address(0), // Will be set when claimed
            pitch: pitch,
            stakeAmount: STAKE_AMOUNT,
            state: ReferralState.PendingClaim,
            createdAt: block.timestamp,
            claimHash: claimHash
        });

        // Update mappings
        jobReferrals[jobId].push(referralId);
        userReferrals[msg.sender].push(referralId);
        claimHashToReferralId[claimHash] = referralId;

        emit ReferralStaked(referralId, jobId, msg.sender, claimHash);
    }

    /**
     * @dev Candidate claims a referral via secret link
     * @param claimHash The hash from the secret claim link
     */
    function claimReferral(bytes32 claimHash) external {
        uint256 referralId = claimHashToReferralId[claimHash];
        require(referralId != 0, "Invalid claim hash");

        Referral storage referral = referrals[referralId];
        require(referral.state == ReferralState.PendingClaim, "Referral not in pending state");
        require(referral.candidate == address(0), "Referral already claimed");

        // Update referral with candidate
        referral.candidate = msg.sender;
        referral.state = ReferralState.Submitted;

        emit ReferralClaimed(referralId, msg.sender);
    }

    /**
     * @dev Company adjudicates a referral (Spam/Pass/Hire)
     * @param referralId ID of the referral to adjudicate
     * @param decision 0=Reject, 1=Spam, 2=Hire
     */
    function adjudicateReferral(uint256 referralId, uint8 decision) external nonReentrant {
        require(decision <= 2, "Invalid decision");

        Referral storage referral = referrals[referralId];
        Job storage job = jobs[referral.jobId];

        require(job.creator == msg.sender, "Only job creator can adjudicate");
        require(job.state == JobState.Open, "Job is not open");
        require(referral.state == ReferralState.Submitted, "Referral not in submitted state");

        if (decision == 0) { // Reject (Pass)
            referral.state = ReferralState.Rejected;
            // Return stake to referrer
            require(usdc.transfer(referral.referrer, referral.stakeAmount), "Stake return failed");
        } else if (decision == 1) { // Spam
            referral.state = ReferralState.Spam;
            // Confiscate stake and add to job bounty
            job.accumulatedSpam += referral.stakeAmount;
        } else if (decision == 2) { // Hire
            referral.state = ReferralState.Hired;
            job.state = JobState.Closed;
            job.closedAt = block.timestamp;

            // Calculate total pot and shares
            uint256 totalPot = job.initialBounty + job.accumulatedSpam;
            uint256 referrerAmount = (totalPot * REFERRER_SHARE) / 100;
            uint256 candidateAmount = (totalPot * CANDIDATE_SHARE) / 100;

            // Distribute funds
            require(usdc.transfer(referral.referrer, referrerAmount + referral.stakeAmount), "Referrer payment failed");
            require(usdc.transfer(referral.candidate, candidateAmount), "Candidate payment failed");

            emit FundsDistributed(referralId, referral.referrer, referral.candidate, referrerAmount + referral.stakeAmount, candidateAmount);
        }

        emit ReferralAdjudicated(referralId, referral.state, msg.sender);
    }

    /**
     * @dev Company withdraws job and closes it (returns remaining funds)
     * @param jobId ID of the job to withdraw
     */
    function withdrawJob(uint256 jobId) external nonReentrant {
        Job storage job = jobs[jobId];
        require(job.creator == msg.sender, "Only job creator can withdraw");
        require(job.state == JobState.Open, "Job is not open");

        job.state = JobState.Closed;
        job.closedAt = block.timestamp;

        // Calculate remaining bounty (initial + accumulated spam)
        uint256 remainingAmount = job.initialBounty + job.accumulatedSpam;

        // Return all stakes to referrers
        uint256[] memory referralIds = jobReferrals[jobId];
        for (uint256 i = 0; i < referralIds.length; i++) {
            Referral storage referral = referrals[referralIds[i]];
            if (referral.state == ReferralState.Submitted || referral.state == ReferralState.PendingClaim) {
                require(usdc.transfer(referral.referrer, referral.stakeAmount), "Stake return failed");
            }
        }

        // Return remaining bounty to creator
        require(usdc.transfer(job.creator, remainingAmount), "Bounty return failed");

        emit JobWithdrawn(jobId, msg.sender, remainingAmount);
    }

    // View functions
    function getJob(uint256 jobId) external view returns (Job memory) {
        return jobs[jobId];
    }

    function getReferral(uint256 referralId) external view returns (Referral memory) {
        return referrals[referralId];
    }

    function getJobReferrals(uint256 jobId) external view returns (uint256[] memory) {
        return jobReferrals[jobId];
    }

    function getUserJobs(address user) external view returns (uint256[] memory) {
        return userJobs[user];
    }

    function getUserReferrals(address user) external view returns (uint256[] memory) {
        return userReferrals[user];
    }

    function getTotalPot(uint256 jobId) external view returns (uint256) {
        Job memory job = jobs[jobId];
        return job.initialBounty + job.accumulatedSpam;
    }

    function isReferralClaimable(bytes32 claimHash) external view returns (bool) {
        uint256 referralId = claimHashToReferralId[claimHash];
        if (referralId == 0) return false;
        Referral memory referral = referrals[referralId];
        return referral.state == ReferralState.PendingClaim;
    }
}
