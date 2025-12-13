'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ReferralStatusBadge } from '@/components/referrals/status-badge'
import { syncUtils } from '@/lib/sync-utils'
import { contractActions, formatAmount } from '@/lib/contract-actions'

export default function ManageJobPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = usePrivy()
  const { wallets } = useWallets()
  const [loading, setLoading] = useState(true)
  const [jobData, setJobData] = useState<any>(null)
  const [error, setError] = useState('')
  const [actionModal, setActionModal] = useState<{
    open: boolean
    type: 'pass' | 'spam' | 'hire' | 'withdraw' | null
    referral?: any
  }>({ open: false, type: null })
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadJobData()
    }
  }, [params.id, user])

  async function loadJobData() {
    try {
      const data = await syncUtils.getJobForManagement(params.id as string, user!.id)
      setJobData(data)
    } catch (err: any) {
      console.error('Failed to load job:', err)
      setError(err.message || 'Failed to load job or you do not have permission')
    } finally {
      setLoading(false)
    }
  }

  const handleAdjudicate = async (decision: 0 | 1 | 2) => {
    if (!actionModal.referral || !user?.wallet?.address) return

    setIsProcessing(true)
    try {
      const wallet = wallets.find(w => w.address === user.wallet.address)
      if (!wallet) {
        throw new Error('Wallet not found')
      }
      
      const provider = await wallet.getEthereumProvider()

      await contractActions.adjudicateReferral({
        onchainReferralId: actionModal.referral.onchain_id,
        decision,
        walletProvider: provider,
        userAddress: user.wallet.address as `0x${string}`,
      })

      // Update Supabase
      await syncUtils.syncReferralAdjudication(actionModal.referral.id, decision)

      // Reload data
      await loadJobData()
      setActionModal({ open: false, type: null })
    } catch (err: any) {
      console.error('Failed to adjudicate:', err)
      setError(err.message || 'Failed to process decision')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleWithdraw = async () => {
    if (!jobData?.job || !user?.wallet?.address) return

    setIsProcessing(true)
    try {
      const wallet = wallets.find(w => w.address === user.wallet.address)
      if (!wallet) {
        throw new Error('Wallet not found')
      }
      
      const provider = await wallet.getEthereumProvider()

      await contractActions.withdrawJob({
        onchainJobId: jobData.job.onchain_id,
        walletProvider: provider,
        userAddress: user.wallet.address as `0x${string}`,
      })

      // Update Supabase
      await syncUtils.syncJobWithdrawal(jobData.job.id)

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Failed to withdraw:', err)
      setError(err.message || 'Failed to withdraw job')
      setActionModal({ open: false, type: null })
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="container max-w-4xl py-12">
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    )
  }

  if (error || !jobData) {
    return (
      <div className="container max-w-4xl py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">{error || 'You do not have permission to manage this job'}</p>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { job, groupedReferrals } = jobData
  const totalPot = job.initial_bounty + (job.accumulated_spam || 0)
  const isClosed = job.state === 'closed'

  return (
    <div className="container max-w-5xl py-12 space-y-8">
      {/* Job Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <Badge variant={isClosed ? 'secondary' : 'default'}>
              {isClosed ? 'Closed' : 'Open'}
            </Badge>
          </div>
          <p className="text-gray-600">Manage referrals and make hiring decisions</p>
        </div>
        {!isClosed && (
          <Button
            variant="destructive"
            onClick={() => setActionModal({ open: true, type: 'withdraw' })}
          >
            Close & Withdraw
          </Button>
        )}
      </div>

      {/* Stats Card */}
      <Card>
        <CardContent className="py-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Total Referrals</div>
              <div className="text-2xl font-bold">
                {Object.values(groupedReferrals).flat().length}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Bonus Pool</div>
              <div className="text-2xl font-bold">{formatAmount(totalPot / 10000)}</div>
              <div className="text-xs text-gray-500 mt-1">
                Initial: {formatAmount(job.initial_bounty / 10000)} + Spam:{' '}
                {formatAmount((job.accumulated_spam || 0) / 10000)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Under Review</div>
              <div className="text-2xl font-bold">{groupedReferrals.submitted.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-900">
          {error}
        </div>
      )}

      {/* Under Review Section */}
      {groupedReferrals.submitted.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Under Review</h2>
          <div className="space-y-4">
            {groupedReferrals.submitted.map((referral: any) => (
              <Card key={referral.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {referral.pitch.split('\n')[0].replace('Candidate: ', '')}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {referral.pitch.split('\n')[1]?.replace('Profile: ', '')}
                      </CardDescription>
                    </div>
                    <ReferralStatusBadge status={referral.state} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-2">Referrer's Pitch:</div>
                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                      {referral.pitch.split('\n\n')[1] || referral.pitch}
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    Referred by: {referral.referrer?.username || 'Anonymous'}
                  </div>

                  {!isClosed && (
                    <div className="flex gap-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setActionModal({ open: true, type: 'pass', referral })
                        }
                      >
                        Pass (Refund)
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          setActionModal({ open: true, type: 'spam', referral })
                        }
                      >
                        Mark Spam
                      </Button>
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() =>
                          setActionModal({ open: true, type: 'hire', referral })
                        }
                      >
                        Hire This Candidate
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Awaiting Candidate Section */}
      {groupedReferrals.pendingClaim.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Awaiting Candidate Acceptance</h2>
          <div className="space-y-4">
            {groupedReferrals.pendingClaim.map((referral: any) => (
              <Card key={referral.id}>
                <CardContent className="py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Referred by: {referral.referrer?.username || 'Anonymous'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Waiting for candidate to accept the referral
                      </p>
                    </div>
                    <ReferralStatusBadge status={referral.state} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Decisions Section */}
      {(groupedReferrals.rejected.length > 0 ||
        groupedReferrals.spam.length > 0 ||
        groupedReferrals.hired.length > 0) && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Past Decisions</h2>
          <div className="space-y-4">
            {[...groupedReferrals.hired, ...groupedReferrals.rejected, ...groupedReferrals.spam].map(
              (referral: any) => (
                <Card key={referral.id} className="opacity-75">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {referral.pitch.split('\n')[0].replace('Candidate: ', '')}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Referred by: {referral.referrer?.username || 'Anonymous'}
                        </p>
                      </div>
                      <ReferralStatusBadge status={referral.state} />
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {Object.values(groupedReferrals).flat().length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-xl font-semibold mb-3">No Referrals Yet</h3>
            <p className="text-gray-600 mb-6">Share your job posting to start receiving referrals</p>
            <Link href={`/jobs/${job.id}`}>
              <Button>View Job Posting</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Modals */}
      <AlertDialog open={actionModal.open} onOpenChange={(open) => !isProcessing && setActionModal({ ...actionModal, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionModal.type === 'pass' && 'Pass on Referral'}
              {actionModal.type === 'spam' && 'Mark as Spam'}
              {actionModal.type === 'hire' && 'Hire Candidate'}
              {actionModal.type === 'withdraw' && 'Close Job & Withdraw'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionModal.type === 'pass' &&
                'The referral will be marked as rejected and the commitment fee will be refunded to the referrer.'}
              {actionModal.type === 'spam' &&
                'The referral will be marked as spam. The commitment fee will be kept and added to the bonus pool.'}
              {actionModal.type === 'hire' &&
                `You're hiring this candidate! The bonus pool of ${formatAmount(totalPot / 10000)} will be distributed: 80% to referrer, 20% to candidate.`}
              {actionModal.type === 'withdraw' &&
                `This will close the job and return ${formatAmount(totalPot / 10000)} to your wallet. All pending referrals will be refunded.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isProcessing}
              onClick={(e) => {
                e.preventDefault()
                if (actionModal.type === 'pass') handleAdjudicate(0)
                else if (actionModal.type === 'spam') handleAdjudicate(1)
                else if (actionModal.type === 'hire') handleAdjudicate(2)
                else if (actionModal.type === 'withdraw') handleWithdraw()
              }}
            >
              {isProcessing ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

