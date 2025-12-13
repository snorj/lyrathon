import { baseSepolia, base } from 'viem/chains'
import { envConfig } from './env-config'

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
