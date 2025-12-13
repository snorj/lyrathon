'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { ReferralStatusBadge } from '@/components/referrals/status-badge'
import { formatAmount } from '@/lib/contract-actions'
import { useState } from 'react'

interface ReferrerDashboardProps {
  referrals: any[]
  stats: {
    activeReferrals: number
    hiredCount: number
    totalEarned: number
  }
}

export function ReferrerDashboard({ referrals, stats }: ReferrerDashboardProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyClaimLink = (referralId: string, claimHash: string) => {
    const link = `${window.location.origin}/claim/${claimHash}`
    navigator.clipboard.writeText(link)
    setCopiedId(referralId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Your Referrals</h1>
        <p className="text-gray-600 mt-1">Track your submissions and earnings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Hired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.hiredCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Total Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatAmount(stats.totalEarned)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Browse Jobs CTA */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Looking for more opportunities?</h3>
              <p className="text-gray-600">Browse open positions and submit referrals</p>
            </div>
            <Link href="/">
              <Button size="lg">Browse Jobs</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Referrals List */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Your Submissions</h2>
        {referrals.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <EmptyState
                title="No referrals yet"
                description="Start browsing jobs and submit your first referral"
                actionLabel="Browse Jobs"
                onAction={() => (window.location.href = '/')}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {referrals.map((referral) => (
              <Card key={referral.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{referral.job?.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {referral.job?.creator?.company_name || 'Company'}
                      </CardDescription>
                    </div>
                    <ReferralStatusBadge status={referral.state} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Your pitch:</span> {referral.pitch}
                    </div>

                    {referral.state === 'pending_claim' && (
                      <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-amber-900">
                            Awaiting Candidate
                          </div>
                          <div className="text-xs text-amber-700 mt-1">
                            Send the claim link to your candidate
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyClaimLink(referral.id, referral.claim_hash)}
                        >
                          {copiedId === referral.id ? 'Copied!' : 'Copy Link'}
                        </Button>
                      </div>
                    )}

                    {referral.state === 'submitted' && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Under review by the company
                      </div>
                    )}

                    {referral.state === 'hired' && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-900">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Congratulations! Your referral was hired
                      </div>
                    )}

                    {referral.state === 'rejected' && (
                      <div className="text-sm text-gray-500">
                        Not selected for this position
                      </div>
                    )}

                    {referral.state === 'spam' && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-900">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        Marked as invalid by the company
                      </div>
                    )}

                    <div className="flex gap-4 text-xs text-gray-500 pt-2 border-t">
                      <div>
                        Submitted: {new Date(referral.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

