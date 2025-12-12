// Contract Types and Interfaces

export enum JobState {
  Draft = 0,
  Open = 1,
  Closed = 2,
}

export enum ReferralState {
  PendingClaim = 0,
  Submitted = 1,
  Rejected = 2,
  Spam = 3,
  Hired = 4,
}

// Contract data structures
export interface ContractJob {
  id: bigint
  creator: `0x${string}`
  title: string
  description: string
  initialBounty: bigint
  accumulatedSpam: bigint
  state: JobState
  createdAt: bigint
  closedAt: bigint
}

export interface ContractReferral {
  id: bigint
  jobId: bigint
  referrer: `0x${string}`
  candidate: `0x${string}`
  pitch: string
  stakeAmount: bigint
  state: ReferralState
  createdAt: bigint
  claimHash: `0x${string}`
}

// Contract function parameters
export interface CreateJobParams {
  title: string
  description: string
  bountyAmount: bigint
}

export interface StakeReferralParams {
  jobId: bigint
  pitch: string
}

export interface ClaimReferralParams {
  claimHash: `0x${string}`
}

// Contract events
export interface JobCreatedEvent {
  jobId: bigint
  creator: `0x${string}`
  bounty: bigint
}

export interface ReferralStakedEvent {
  referralId: bigint
  jobId: bigint
  referrer: `0x${string}`
  claimHash: `0x${string}`
}

export interface ReferralClaimedEvent {
  referralId: bigint
  candidate: `0x${string}`
}

export interface ReferralAdjudicatedEvent {
  referralId: bigint
  state: ReferralState
  adjudicator: `0x${string}`
}

export interface FundsDistributedEvent {
  referralId: bigint
  referrer: `0x${string}`
  candidate: `0x${string}`
  referrerAmount: bigint
  candidateAmount: bigint
}

export interface JobWithdrawnEvent {
  jobId: bigint
  creator: `0x${string}`
  returnedAmount: bigint
}

// Contract configuration
export const CONTRACT_CONFIG = {
  STAKE_AMOUNT: 50_000_000n, // 50 USDC (6 decimals)
  REFERRER_SHARE: 80, // 80%
  CANDIDATE_SHARE: 20, // 20%
} as const

// Utility functions
export function formatUSDC(amount: bigint): string {
  return (Number(amount) / 1_000_000).toFixed(2)
}

export function parseUSDC(amount: string): bigint {
  return BigInt(Math.round(parseFloat(amount) * 1_000_000))
}

export function jobStateToString(state: JobState): string {
  switch (state) {
    case JobState.Draft:
      return 'Draft'
    case JobState.Open:
      return 'Open'
    case JobState.Closed:
      return 'Closed'
    default:
      return 'Unknown'
  }
}

export function referralStateToString(state: ReferralState): string {
  switch (state) {
    case ReferralState.PendingClaim:
      return 'Waiting for Candidate'
    case ReferralState.Submitted:
      return 'Submitted'
    case ReferralState.Rejected:
      return 'Rejected'
    case ReferralState.Spam:
      return 'Marked as Spam'
    case ReferralState.Hired:
      return 'Hired'
    default:
      return 'Unknown'
  }
}

// Contract addresses (to be filled after deployment)
export const CONTRACT_ADDRESSES = {
  TALENT_STAKE: process.env.NEXT_PUBLIC_REFERRAL_CONTRACT_ADDRESS as `0x${string}` | undefined,
  USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`,
} as const
