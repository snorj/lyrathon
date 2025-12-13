/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Optimize icon imports
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },
  
  // Webpack optimizations for faster builds
  webpack: (config, { isServer }) => {
    // Reduce module resolution time
    config.resolve.symlinks = false
    
    // Exclude heavy dependencies from server-side builds
    if (isServer) {
      config.externals.push({
        'viem': 'commonjs viem',
        '@privy-io/react-auth': 'commonjs @privy-io/react-auth',
      })
    }
    
    return config
  },
  
  // Turbopack (experimental) for faster dev builds
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
