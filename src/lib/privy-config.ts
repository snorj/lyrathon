import { envConfig } from './env-config'

// Define chains inline to avoid importing entire viem/chains
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
} as const

const base = {
  id: 8453,
  name: 'Base',
  network: 'base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.base.org'] },
    public: { http: ['https://mainnet.base.org'] },
  },
  blockExplorers: {
    default: { name: 'Basescan', url: 'https://basescan.org' },
  },
  testnet: false,
} as const

export const privyConfig = {
  appId: envConfig.PRIVY_APP_ID,
  config: {
    // Appearance
    appearance: {
      theme: 'light',
      accentColor: '#676FFF',
      logo: undefined, // Add your logo URL here
    },
    // Login methods
    loginMethods: ['email', 'wallet'],
    // Embedded wallet configuration
    embeddedWallets: {
      createOnLogin: 'users-without-wallets',
      requireUserPasswordOnCreate: false,
    },
    // Supported chains
    supportedChains: [baseSepolia, base],
    // Default chain
    defaultChain: baseSepolia,
  },
}

// Wagmi configuration
export const wagmiChains = [baseSepolia, base] as const
