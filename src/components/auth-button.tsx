'use client'

import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'

export function AuthButton() {
  const { login, logout, authenticated, user, ready } = usePrivy()
  const [walletAddress, setWalletAddress] = useState<string>('')

  useEffect(() => {
    if (authenticated && user) {
      // Get the embedded wallet address from Privy
      const embeddedWallet = user.linkedAccounts?.find(
        (account: any) => account.type === 'wallet' && account.walletClient === 'privy'
      )
      if (embeddedWallet) {
        setWalletAddress(embeddedWallet.address)
      }
    }
  }, [authenticated, user])

  if (!ready) {
    return (
      <Button disabled>Loading...</Button>
    )
  }

  if (!authenticated) {
    return (
      <div className="space-y-4">
        <Button onClick={login} size="lg">
          Log In / Sign Up
        </Button>
        <p className="text-sm text-muted-foreground">
          Log in with email to create your smart wallet
        </p>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Connected! ✅</CardTitle>
        <CardDescription>Your smart wallet is ready</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Email:</span>
            <span className="text-sm">{user?.email?.address || 'N/A'}</span>
          </div>
          
          {walletAddress && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Wallet:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </code>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Network:</span>
            <Badge variant="secondary">Base Sepolia</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Gas Sponsorship:</span>
            <Badge variant="default">Enabled ⚡</Badge>
          </div>
        </div>

        <Button onClick={logout} variant="outline" className="w-full">
          Log Out
        </Button>
      </CardContent>
    </Card>
  )
}
