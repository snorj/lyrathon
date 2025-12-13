'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SubmissionForm } from '@/components/referrals/submission-form'
import { supabaseHelpers } from '@/lib/supabase'
import { formatAmount } from '@/lib/contract-actions'

export default function JobPage() {
  const params = useParams()
  const router = useRouter()
  const { authenticated, login, user } = usePrivy()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isOwnJob, setIsOwnJob] = useState(false)
  const [alreadyReferred, setAlreadyReferred] = useState(false)

  useEffect(() => {
    loadJob()
  }, [params.id, user])

  async function loadJob() {
    try {
      const { data, error: fetchError } = await supabaseHelpers.getJobById(params.id as string)

      if (fetchError || !data) {
        setError('Job not found')
        return
      }

      setJob(data)

      // Check if user is the job creator
      if (user?.id && data.creator_id === user.id) {
        setIsOwnJob(true)
      }

      // Check if user already submitted a referral
      if (user?.id && data.referrals) {
        const userReferral = data.referrals.find((r: any) => r.referrer_id === user.id)
        if (userReferral) {
          setAlreadyReferred(true)
        }
      }
    } catch (err) {
      console.error('Failed to load job:', err)
      setError('Failed to load job')
    } finally {
      setLoading(false)
    }
  }

  const handleReferralSuccess = (claimLink: string) => {
    // Refresh job data
    loadJob()
  }

  if (loading) {
    return (
      <div className="container max-w-4xl py-12">
        <div className="text-center text-gray-500">Loading job...</div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="container max-w-4xl py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'This job does not exist or has been removed'}</p>
            <Link href="/">
              <Button>Browse Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isClosed = job.state === 'closed'

  return (
    <div className="container max-w-4xl py-12 space-y-8">
      {/* Job Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
              {job.creator?.company_name && (
                <p className="text-lg text-gray-600">{job.creator.company_name}</p>
              )}
            </div>
            <Badge variant={isClosed ? 'secondary' : 'default'} className="text-sm px-3 py-1">
              {isClosed ? 'Closed' : 'Open'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-8">
            <div>
              <div className="text-sm text-gray-500 mb-1">Referral Bonus</div>
              <div className="text-3xl font-bold">
                {formatAmount(job.initial_bounty / 10000)}
              </div>
              <div className="text-xs text-gray-500 mt-1">80% referrer, 20% candidate</div>
            </div>
            <div className="border-l pl-8">
              <div className="text-sm text-gray-500 mb-1">Commitment Fee Required</div>
              <div className="text-xl font-semibold">{formatAmount(50)}</div>
              <div className="text-xs text-gray-500 mt-1">Prevents spam submissions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Description */}
      <Card>
        <CardHeader>
          <CardTitle>About the Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Referral Submission Section */}
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">Submit a Referral</h2>

        {/* Conditional rendering based on auth and job status */}
        {!authenticated ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-semibold mb-3">Sign In to Submit Referral</h3>
                <p className="text-gray-600 mb-6">
                  Create an account or sign in to submit a referral and earn the bonus
                </p>
                <Button onClick={login} size="lg">
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : isClosed ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-semibold mb-3">Position Closed</h3>
                <p className="text-gray-600 mb-6">
                  This position is no longer accepting referrals
                </p>
                <Link href="/">
                  <Button>Browse Other Jobs</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : isOwnJob ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-semibold mb-3">Your Job Posting</h3>
                <p className="text-gray-600 mb-6">
                  You can't submit referrals to your own job posting
                </p>
                <Link href={`/jobs/${job.id}/manage`}>
                  <Button>Manage This Job</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : alreadyReferred ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-semibold mb-3">Already Submitted</h3>
                <p className="text-gray-600 mb-6">
                  You've already submitted a referral for this position
                </p>
                <Link href="/dashboard">
                  <Button>View Your Referrals</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <SubmissionForm
            jobId={job.id}
            jobTitle={job.title}
            onchainJobId={job.onchain_id}
            referralBonus={job.initial_bounty / 10000}
            commitmentFee={50}
            onSuccess={handleReferralSuccess}
          />
        )}
      </div>
    </div>
  )
}

