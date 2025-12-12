/**
 * Environment Configuration
 *
 * This file documents all required environment variables for the Lyra application.
 * Copy this to your .env.local file and fill in the actual values.
 */

export const envConfig = {
  // Base Sepolia Testnet
  BASE_SEPOLIA_RPC_URL: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
  BASE_SEPOLIA_CHAIN_ID: parseInt(process.env.NEXT_PUBLIC_BASE_SEPOLIA_CHAIN_ID || '84532'),

  // USDC Contract on Base Sepolia
  USDC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS || '0x036CbD53842c5426634e7929541eC2318f3dCF7e',

  // Privy Authentication
  PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  PRIVY_APP_SECRET: process.env.PRIVY_APP_SECRET || '',

  // Supabase Database
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // Smart Contract Addresses (to be filled after deployment)
  REFERRAL_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_REFERRAL_CONTRACT_ADDRESS || '',

  // Development
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;

/**
 * Required Environment Variables Template
 *
 * Copy this to your .env.local file:
 *
 * # Base Sepolia Testnet Configuration
 * NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
 * NEXT_PUBLIC_BASE_SEPOLIA_CHAIN_ID=84532
 *
 * # USDC Contract on Base Sepolia
 * NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
 *
 * # Privy Authentication
 * NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id-here
 * PRIVY_APP_SECRET=your-privy-app-secret-here
 *
 * # Supabase Database
 * NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
 * NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
 * SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
 *
 * # Smart Contract Addresses (to be filled after deployment)
 * NEXT_PUBLIC_REFERRAL_CONTRACT_ADDRESS=contract-address-after-deployment
 *
 * # Development
 * NODE_ENV=development
 */
