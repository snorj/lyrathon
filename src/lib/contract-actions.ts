'use client'

import { parseUnits, formatUnits, type Address, createPublicClient, createWalletClient, custom, http, decodeEventLog } from 'viem'
import { envConfig } from './env-config'
import { supabaseHelpers } from './supabase'
import { syncUtils } from './sync-utils'

// Define chain inline to avoid importing viem/chains
const baseSepolia = {
  id: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia.base.org'] },
    public: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    default: { name: 'Basescan', url: 'https://sepolia.basescan.org' },
  },
  testnet: true,
}

// Contract ABIs
const TALENT_STAKE_ABI = [
  {
    inputs: [
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'bountyAmount', type: 'uint256' },
    ],
    name: 'createJob',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'jobId', type: 'uint256' },
      { name: 'pitch', type: 'string' },
    ],
    name: 'stakeReferral',
    outputs: [
      { name: 'referralId', type: 'uint256' },
      { name: 'claimHash', type: 'bytes32' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'claimHash', type: 'bytes32' }],
    name: 'claimReferral',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'referralId', type: 'uint256' },
      { name: 'decision', type: 'uint8' },
    ],
    name: 'adjudicateReferral',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'jobId', type: 'uint256' }],
    name: 'withdrawJob',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nextJobId',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nextReferralId',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'STAKE_AMOUNT',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'jobId', type: 'uint256' },
      { indexed: true, name: 'creator', type: 'address' },
      { indexed: false, name: 'bounty', type: 'uint256' },
    ],
    name: 'JobCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'referralId', type: 'uint256' },
      { indexed: true, name: 'jobId', type: 'uint256' },
      { indexed: true, name: 'referrer', type: 'address' },
      { indexed: false, name: 'claimHash', type: 'bytes32' },
    ],
    name: 'ReferralStaked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'referralId', type: 'uint256' },
      { indexed: true, name: 'candidate', type: 'address' },
    ],
    name: 'ReferralClaimed',
    type: 'event',
  },
] as const

const USDC_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// Contract addresses
const TALENT_STAKE_ADDRESS = envConfig.REFERRAL_CONTRACT_ADDRESS as Address
const USDC_ADDRESS = envConfig.USDC_CONTRACT_ADDRESS as Address

// Utility functions
export function formatAmount(amountInCents: number): string {
  return `$${(amountInCents / 100).toFixed(2)}`
}

export function parseAmount(dollarAmount: string | number): number {
  return Math.round(parseFloat(dollarAmount.toString()) * 100)
}

export function usdcToUnits(dollars: number): bigint {
  return parseUnits(dollars.toString(), 6)
}

export function unitsToUSDC(units: bigint): number {
  return Number(formatUnits(units, 6))
}

// Get clients for contract interactions
export async function getClients(walletProvider: any) {
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  })

  const walletClient = createWalletClient({
    chain: baseSepolia,
    transport: custom(walletProvider),
  })

  return { publicClient, walletClient }
}

// Contract interaction functions
export const contractActions = {
  /**
   * Create a new job with USDC escrow
   */
  async createJob({
    title,
    description,
    bountyAmount, // in dollars
    walletProvider,
    userAddress,
    userId,
  }: {
    title: string
    description: string
    bountyAmount: number
    walletProvider: any
    userAddress: Address
    userId: string
  }) {
    const { publicClient, walletClient } = await getClients(walletProvider)

    // Convert dollars to USDC units (6 decimals)
    const bountyWei = usdcToUnits(bountyAmount)

    // Step 1: Check USDC balance
    const balance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'balanceOf',
      args: [userAddress],
    })

    if (balance < bountyWei) {
      throw new Error(`Insufficient USDC balance. Required: ${bountyAmount} USDC`)
    }

    // Step 2: Check allowance
    const allowance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'allowance',
      args: [userAddress, TALENT_STAKE_ADDRESS],
    })

    // Step 3: Approve USDC if needed
    if (allowance < bountyWei) {
      const approveHash = await walletClient.writeContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [TALENT_STAKE_ADDRESS, bountyWei],
        account: userAddress,
      })

      // Wait for approval transaction
      await publicClient.waitForTransactionReceipt({ hash: approveHash })
    }

    // Step 4: Create job on contract
    const hash = await walletClient.writeContract({
      address: TALENT_STAKE_ADDRESS,
      abi: TALENT_STAKE_ABI,
      functionName: 'createJob',
      args: [title, description, bountyWei],
      account: userAddress,
    })

    // Wait for transaction
    const receipt = await publicClient.waitForTransactionReceipt({ hash })

    // Step 5: Get job ID from event
    let onchainId: number | null = null
    
    for (const log of receipt.logs) {
      try {
        if (log.address.toLowerCase() !== TALENT_STAKE_ADDRESS.toLowerCase()) {
          continue
        }
        
        const decoded = decodeEventLog({
          abi: TALENT_STAKE_ABI,
          data: log.data,
          topics: log.topics,
        })

        if (decoded.eventName === 'JobCreated') {
          onchainId = Number(decoded.args.jobId)
          break
        }
      } catch (e) {
        // Skip logs that don't match our ABI
        continue
      }
    }

    if (onchainId === null) {
      throw new Error('JobCreated event not found')
    }

    // Step 6: Get or create user profile
    // Use Privy user ID and wallet address
    const profile = await syncUtils.getOrCreateProfile(userAddress, userId)

    // Step 7: Save to Supabase
    const { data: jobData, error } = await supabaseHelpers.createJob({
      title,
      description,
      initial_bounty: Number(bountyWei),
      onchain_id: onchainId,
      creator_id: profile.id,
    })

    if (error) {
      console.error('Failed to save job to database:', error)
      throw new Error('Job created on blockchain but failed to save to database')
    }

    return {
      jobId: jobData.id,
      onchainId,
      transactionHash: hash,
    }
  },

  /**
   * Submit a referral with stake
   */
  async submitReferral({
    jobId,
    onchainJobId,
    pitch,
    walletProvider,
    userAddress,
  }: {
    jobId: string
    onchainJobId: number
    pitch: string
    walletProvider: any
    userAddress: Address
  }) {
    const { publicClient, walletClient } = await getClients(walletProvider)

    // Get stake amount (0.50 USDC)
    const stakeAmount = await publicClient.readContract({
      address: TALENT_STAKE_ADDRESS,
      abi: TALENT_STAKE_ABI,
      functionName: 'STAKE_AMOUNT',
    })

    // Step 1: Approve USDC
    const allowance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'allowance',
      args: [userAddress, TALENT_STAKE_ADDRESS],
    })

    if (allowance < stakeAmount) {
      const approveHash = await walletClient.writeContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [TALENT_STAKE_ADDRESS, stakeAmount],
        account: userAddress,
      })

      await publicClient.waitForTransactionReceipt({ hash: approveHash })
    }

    // Step 2: Stake referral
    const hash = await walletClient.writeContract({
      address: TALENT_STAKE_ADDRESS,
      abi: TALENT_STAKE_ABI,
      functionName: 'stakeReferral',
      args: [BigInt(onchainJobId), pitch],
      account: userAddress,
    })

    const receipt = await publicClient.waitForTransactionReceipt({ hash })

    // Step 3: Get referral ID and claim hash from event
    let onchainReferralId: number = 0
    let claimHash: string = '0x'
    
    for (const log of receipt.logs) {
      try {
        if (log.address.toLowerCase() !== TALENT_STAKE_ADDRESS.toLowerCase()) {
          continue
        }
        
        const decoded = decodeEventLog({
          abi: TALENT_STAKE_ABI,
          data: log.data,
          topics: log.topics,
        })

        if (decoded.eventName === 'ReferralStaked') {
          onchainReferralId = Number(decoded.args.referralId)
          claimHash = decoded.args.claimHash as string
          break
        }
      } catch (e) {
        // Skip logs that don't match our ABI
        continue
      }
    }
    
    if (!onchainReferralId || !claimHash || claimHash === '0x') {
      throw new Error('ReferralStaked event not found')
    }

    // Step 4: Save to Supabase
    const { data: referralData, error } = await supabaseHelpers.createReferral({
      job_id: jobId,
      pitch,
      claim_hash: claimHash,
      onchain_id: onchainReferralId,
    })

    if (error) {
      console.error('Failed to save referral to database:', error)
      throw new Error('Referral created on blockchain but failed to save to database')
    }

    // Step 5: Generate claim link
    const claimLink = `${window.location.origin}/claim/${claimHash}`

    return {
      referralId: referralData.id,
      onchainReferralId,
      claimHash,
      claimLink,
      transactionHash: hash,
    }
  },

  /**
   * Candidate claims a referral
   */
  async claimReferral({
    claimHash,
    walletProvider,
    userAddress,
  }: {
    claimHash: string
    walletProvider: any
    userAddress: Address
  }) {
    const { publicClient, walletClient } = await getClients(walletProvider)

    // Call contract claimReferral
    const hash = await walletClient.writeContract({
      address: TALENT_STAKE_ADDRESS,
      abi: TALENT_STAKE_ABI,
      functionName: 'claimReferral',
      args: [claimHash as `0x${string}`],
      account: userAddress,
    })

    await publicClient.waitForTransactionReceipt({ hash })

    // Update Supabase (will be handled by sync utilities)
    return { transactionHash: hash }
  },

  /**
   * Company adjudicates a referral
   */
  async adjudicateReferral({
    onchainReferralId,
    decision, // 0=pass, 1=spam, 2=hire
    walletProvider,
    userAddress,
  }: {
    onchainReferralId: number
    decision: 0 | 1 | 2
    walletProvider: any
    userAddress: Address
  }) {
    const { publicClient, walletClient } = await getClients(walletProvider)

    const hash = await walletClient.writeContract({
      address: TALENT_STAKE_ADDRESS,
      abi: TALENT_STAKE_ABI,
      functionName: 'adjudicateReferral',
      args: [BigInt(onchainReferralId), decision],
      account: userAddress,
    })

    await publicClient.waitForTransactionReceipt({ hash })

    return { transactionHash: hash }
  },

  /**
   * Company withdraws job
   */
  async withdrawJob({
    onchainJobId,
    walletProvider,
    userAddress,
  }: {
    onchainJobId: number
    walletProvider: any
    userAddress: Address
  }) {
    const { publicClient, walletClient } = await getClients(walletProvider)

    const hash = await walletClient.writeContract({
      address: TALENT_STAKE_ADDRESS,
      abi: TALENT_STAKE_ABI,
      functionName: 'withdrawJob',
      args: [BigInt(onchainJobId)],
      account: userAddress,
    })

    await publicClient.waitForTransactionReceipt({ hash })

    return { transactionHash: hash }
  },
}

