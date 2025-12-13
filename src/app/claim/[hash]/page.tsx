'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabaseHelpers } from '@/lib/supabase'
import { contractActions, formatAmount } from '@/lib/contract-actions'
import { syncUtils } from '@/lib/sync-utils'

export default function ClaimPage() {
  const params = useParams()
  const router = useRouter()
  const { authenticated, login, user, ready } = usePrivy()
  const { wallets } = useWallets()
  const [referral, setReferral] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isClaiming, setIsClaiming] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadReferral()
  }, [params.hash])

  async function loadReferral() {
    try {
      const { data, error: fetchError } = await supabaseHelpers.getReferralByClaimHash(
        params.hash as string
      )

      if (fetchError || !data) {
        setError('Invalid or expired claim link')
        return
      }

      setReferral(data)
    } catch (err) {
      console.error('Failed to load referral:', err)
      setError('Failed to load referral information')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!user?.wallet?.address) {
      setError('Wallet not connected')
      return
    }

    setIsClaiming(true)
    setError('')

    try {
      const wallet = wallets.find(w => w.address === user.wallet.address)
      if (!wallet) {
        throw new Error('Wallet not found')
      }
      
      const provider = await wallet.getEthereumProvider()

      // Claim the referral on the smart contract
      await contractActions.claimReferral({
        claimHash: params.hash as string,
        walletProvider: provider,
        userAddress: user.wallet.address as `0x${string}`,
      })

      // Update Supabase with candidate info
      await syncUtils.syncReferralClaim(
        params.hash as string,
        user.wallet.address,
        user.id
      )

      setSuccess(true)
    } catch (err: any) {
      console.error('Failed to claim referral:', err)
      setError(err.message || 'Failed to accept referral. Please try again.')
    } finally {
      setIsClaiming(false)
    }
  }

  if (!ready || loading) {
    return (
      <div className="container max-w-2xl py-12">
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-2xl py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Invalid Link</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/">
              <Button>Browse Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!referral) {
    return null
  }

  // Check if already claimed
  if (referral.state !== 'pending_claim') {
    return (
      <div className="container max-w-2xl py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Already Claimed</h2>
            <p className="text-gray-600 mb-6">This referral has already been accepted</p>
            <Link href="/">
              <Button>Browse Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="container max-w-2xl py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Referral Accepted! 🎉</h2>
            <p className="text-gray-600 mb-6">
              Your profile has been submitted to the company for review. If you're hired, you'll
              earn 20% of the referral bonus.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <Button>View Dashboard</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Browse More Jobs</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Parse referral pitch for candidate info
  const pitchLines = referral.pitch.split('\n')
  const candidateName = pitchLines[0]?.replace('Candidate: ', '') || 'You'
  const profileUrl = pitchLines[1]?.replace('Profile: ', '')
  const pitch = pitchLines.slice(3).join('\n')

  return (
    <div className="container max-w-2xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">You've Been Referred! 🎯</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Job Info */}
          <div>
            <h3 className="text-xl font-bold mb-2">{referral.job?.title}</h3>
            {referral.job?.creator?.company_name && (
              <p className="text-lg text-gray-600">{referral.job.creator.company_name}</p>
            )}
          </div>

          <div className="border-t pt-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Your Potential Earnings</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatAmount((referral.job?.initial_bounty || 0) / 10000 * 0.2)}
                </div>
                <div className="text-xs text-gray-500 mt-1">20% of referral bonus if hired</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Referrer Earnings</div>
                <div className="text-2xl font-bold">
                  {formatAmount((referral.job?.initial_bounty || 0) / 10000 * 0.8)}
                </div>
                <div className="text-xs text-gray-500 mt-1">80% of referral bonus</div>
              </div>
            </div>
          </div>

          {/* Referrer Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Referred by</h4>
            <p className="text-sm text-blue-800">
              {referral.referrer?.username || 'A connection'} thinks you'd be perfect for this role
            </p>
          </div>

          {/* Pitch */}
          {pitch && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Why you're a great fit:</h4>
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                {pitch}
              </div>
            </div>
          )}

          {/* What Happens Next */}
          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-900 mb-3">What happens when you accept:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Your profile will be shared with the company for review
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                If hired, you'll automatically earn {formatAmount((referral.job?.initial_bounty || 0) / 10000 * 0.2)}
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Your referrer will earn {formatAmount((referral.job?.initial_bounty || 0) / 10000 * 0.8)}
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                No cost or commitment required from you
              </li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-900">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-6 border-t">
            {!authenticated ? (
              <div className="space-y-3">
                <Button onClick={login} size="lg" className="w-full">
                  Sign In to Accept Referral
                </Button>
                <p className="text-sm text-gray-500 text-center">
                  Create an account to continue
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={handleAccept}
                  size="lg"
                  className="w-full"
                  disabled={isClaiming}
                >
                  {isClaiming ? 'Accepting...' : 'Accept Referral'}
                </Button>
                <p className="text-sm text-gray-500 text-center">
                  This action is free and takes a few seconds
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

