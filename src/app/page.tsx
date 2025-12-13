'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { JobCard } from '@/components/jobs/job-card'
import { EmptyState } from '@/components/ui/empty-state'
import { supabaseHelpers } from '@/lib/supabase'

export default function HomePage() {
  const { authenticated, login } = usePrivy()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadJobs()
  }, [])

  async function loadJobs() {
    try {
      const { data, error } = await supabaseHelpers.getJobs(20, 0)
      if (!error && data) {
        setJobs(data)
      }
    } catch (err) {
      console.error('Failed to load jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">
            Quality Referrals,
            <br />
            <span className="text-gray-600">Aligned Incentives</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect top talent with great opportunities. Earn rewards for successful referrals.
          </p>
          <div className="flex gap-4 justify-center">
            {authenticated ? (
              <>
                <Link href="/dashboard">
                  <Button size="lg">Go to Dashboard</Button>
                </Link>
                <Link href="/jobs/new">
                  <Button size="lg" variant="outline">
                    Post a Job
                  </Button>
                </Link>
              </>
            ) : (
              <Button size="lg" onClick={login}>
                Get Started
              </Button>
            )}
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">1. Companies Post Jobs</h3>
              <p className="text-gray-600 text-sm">
                Fund a referral bonus upfront. Only pay when you make a hire.
              </p>
            </div>

            <div className="text-center">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">2. Referrers Submit Candidates</h3>
              <p className="text-gray-600 text-sm">
                Pay a small commitment fee to prevent spam. Get refunded if not selected.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">3. Everyone Wins</h3>
              <p className="text-gray-600 text-sm">
                Successful hire? Referrer gets 80%, candidate gets 20% of the bonus.
              </p>
            </div>
          </div>
        </div>

        {/* Jobs Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Open Positions</h2>
            {authenticated && (
              <Link href="/jobs/new">
                <Button>Post a Job</Button>
              </Link>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12">
              <EmptyState
                title="No jobs posted yet"
                description="Be the first to post a job and start receiving referrals"
                actionLabel={authenticated ? 'Post a Job' : 'Sign In to Post'}
                onAction={() => {
                  if (authenticated) {
                    window.location.href = '/jobs/new'
                  } else {
                    login()
                  }
                }}
              />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={{
                    id: job.id,
                    title: job.title,
                    description: job.description,
                    referral_bonus: job.initial_bounty / 10000,
                    commitment_fee: 50, // $0.50
                    status: job.state as 'open' | 'closed',
                    company_name: job.creator?.company_name || 'Company',
                  }}
                  actionButton={
                    <Link href={`/jobs/${job.id}`}>
                      <Button className="w-full">View & Refer</Button>
                    </Link>
                  }
                  showStatus={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      {!authenticated && (
        <div className="bg-gray-900 text-white py-16 mt-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Join Lyra today and start connecting top talent with great opportunities
            </p>
            <Button size="lg" variant="outline" onClick={login} className="bg-white text-gray-900 hover:bg-gray-100">
              Create Account
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
