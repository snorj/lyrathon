import { getContract } from 'wagmi'
import { envConfig } from './env-config'

// Contract ABI - generated from the Solidity contract
const TALENT_STAKE_ABI = [
  // View functions
  "function usdc() view returns (address)",
  "function nextJobId() view returns (uint256)",
  "function nextReferralId() view returns (uint256)",
  "function jobs(uint256) view returns (tuple(uint256 id, address creator, string title, string description, uint256 initialBounty, uint256 accumulatedSpam, uint8 state, uint256 createdAt, uint256 closedAt))",
  "function referrals(uint256) view returns (tuple(uint256 id, uint256 jobId, address referrer, address candidate, string pitch, uint256 stakeAmount, uint8 state, uint256 createdAt, bytes32 claimHash))",
  "function jobReferrals(uint256, uint256) view returns (uint256)",
  "function userJobs(address, uint256) view returns (uint256)",
  "function userReferrals(address, uint256) view returns (uint256)",
  "function claimHashToReferralId(bytes32) view returns (uint256)",
  "function getJob(uint256 jobId) view returns (tuple(uint256 id, address creator, string title, string description, uint256 initialBounty, uint256 accumulatedSpam, uint8 state, uint256 createdAt, uint256 closedAt))",
  "function getReferral(uint256 referralId) view returns (tuple(uint256 id, uint256 jobId, address referrer, address candidate, string pitch, uint256 stakeAmount, uint8 state, uint256 createdAt, bytes32 claimHash))",
  "function getJobReferrals(uint256 jobId) view returns (uint256[])",
  "function getUserJobs(address user) view returns (uint256[])",
  "function getUserReferrals(address user) view returns (uint256[])",
  "function getTotalPot(uint256 jobId) view returns (uint256)",
  "function isReferralClaimable(bytes32 claimHash) view returns (bool)",

  // Write functions
  "function createJob(string title, string description, uint256 bountyAmount)",
  "function stakeReferral(uint256 jobId, string pitch) returns (uint256 referralId, bytes32 claimHash)",
  "function claimReferral(bytes32 claimHash)",
  "function adjudicateReferral(uint256 referralId, uint8 decision)",
  "function withdrawJob(uint256 jobId)",

  // Events
  "event JobCreated(uint256 indexed jobId, address indexed creator, uint256 bounty)",
  "event ReferralStaked(uint256 indexed referralId, uint256 indexed jobId, address indexed referrer, bytes32 claimHash)",
  "event ReferralClaimed(uint256 indexed referralId, address indexed candidate)",
  "event ReferralAdjudicated(uint256 indexed referralId, uint8 state, address indexed adjudicator)",
  "event FundsDistributed(uint256 indexed referralId, address indexed referrer, address indexed candidate, uint256 referrerAmount, uint256 candidateAmount)",
  "event JobWithdrawn(uint256 indexed jobId, address indexed creator, uint256 returnedAmount)",
] as const

// USDC ABI (minimal)
const USDC_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address, uint256) returns (bool)",
  "function transferFrom(address, address, uint256) returns (bool)",
  "function approve(address, uint256) returns (bool)",
  "function allowance(address, address) view returns (uint256)",
  "function decimals() view returns (uint8)",
] as const

// Contract instances
export function getTalentStakeContract() {
  if (!envConfig.REFERRAL_CONTRACT_ADDRESS) {
    throw new Error('TalentStake contract address not configured')
  }

  return getContract({
    address: envConfig.REFERRAL_CONTRACT_ADDRESS as `0x${string}`,
    abi: TALENT_STAKE_ABI,
  })
}

export function getUSDCContract() {
  return getContract({
    address: envConfig.USDC_CONTRACT_ADDRESS as `0x${string}`,
    abi: USDC_ABI,
  })
}

// Helper functions for common contract operations
export const contractHelpers = {
  // Format amounts for display
  formatUSDC: (amount: bigint) => {
    return (Number(amount) / 1_000_000).toFixed(2)
  },

  // Parse amounts from user input
  parseUSDC: (amount: string) => {
    return BigInt(Math.round(parseFloat(amount) * 1_000_000))
  },

  // Check if user has sufficient USDC balance
  async checkUSDCBalance(address: `0x${string}`, requiredAmount: bigint) {
    const usdcContract = getUSDCContract()
    const balance = await usdcContract.read.balanceOf([address])
    return balance >= requiredAmount
  },

  // Approve USDC spending for the TalentStake contract
  async approveUSDC(amount: bigint) {
    const usdcContract = getUSDCContract()
    const talentStakeAddress = envConfig.REFERRAL_CONTRACT_ADDRESS as `0x${string}`

    return usdcContract.write.approve([talentStakeAddress, amount])
  },

  // Get job total pot (initial bounty + accumulated spam)
  async getJobTotalPot(jobId: bigint) {
    const contract = getTalentStakeContract()
    return contract.read.getTotalPot([jobId])
  },

  // Check if a referral can be claimed
  async isReferralClaimable(claimHash: `0x${string}`) {
    const contract = getTalentStakeContract()
    return contract.read.isReferralClaimable([claimHash])
  },

  // Get user's jobs
  async getUserJobs(userAddress: `0x${string}`) {
    const contract = getTalentStakeContract()
    return contract.read.getUserJobs([userAddress])
  },

  // Get user's referrals
  async getUserReferrals(userAddress: `0x${string}`) {
    const contract = getTalentStakeContract()
    return contract.read.getUserReferrals([userAddress])
  },
}
