import { AuthButton } from '@/components/auth-button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 gap-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Lyra
        </h1>
        <p className="text-xl text-muted-foreground">
          Decentralized Referral Marketplace
        </p>
        <p className="text-sm text-muted-foreground max-w-md">
          Skin in the Game referral platform with gas-free transactions
        </p>
      </div>

      {/* Auth Test */}
      <div className="flex flex-col items-center gap-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Test Your Setup</h2>
          <p className="text-sm text-muted-foreground">
            Log in to verify Privy + Gas Sponsorship is working
          </p>
        </div>
        <AuthButton />
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mt-12">
        <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
          <h3 className="text-lg font-semibold mb-2">
            💰 Skin in the Game
          </h3>
          <p className="text-sm text-muted-foreground">
            Referrers stake money to ensure quality. No more spam.
          </p>
        </div>

        <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
          <h3 className="text-lg font-semibold mb-2">
            🔒 Trust Through Code
          </h3>
          <p className="text-sm text-muted-foreground">
            Smart contracts ensure bounties are paid and referrals are genuine.
          </p>
        </div>

        <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
          <h3 className="text-lg font-semibold mb-2">
            ⚡ No Middlemen
          </h3>
          <p className="text-sm text-muted-foreground">
            Direct connections between companies and talent through trusted networks.
          </p>
        </div>
      </div>
    </main>
  )
}
