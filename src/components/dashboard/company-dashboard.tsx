'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { JobCard } from '@/components/jobs/job-card'
import { EmptyState } from '@/components/ui/empty-state'
import { formatAmount } from '@/lib/contract-actions'

interface CompanyDashboardProps {
  jobs: any[]
  stats: {
    openJobs: number
    totalReferrals: number
    totalSpent: number
  }
}

export function CompanyDashboard({ jobs, stats }: CompanyDashboardProps) {
  const openJobs = jobs.filter((job) => job.state === 'open')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Jobs</h1>
          <p className="text-gray-600 mt-1">Manage your job postings and review referrals</p>
        </div>
        <Link href="/jobs/new">
          <Button size="lg">Post New Job</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Open Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.openJobs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatAmount(stats.totalSpent / 10000)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Jobs */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Active Jobs</h2>
        {openJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <EmptyState
                title="No active jobs"
                description="Post your first job to start receiving referrals"
                actionLabel="Post a Job"
                onAction={() => (window.location.href = '/jobs/new')}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {openJobs.map((job) => (
              <JobCard
                key={job.id}
                job={{
                  id: job.id,
                  title: job.title,
                  description: job.description,
                  referral_bonus: job.initial_bounty / 10000,
                  commitment_fee: 50, // $0.50 default
                  status: 'open',
                  company_name: job.creator?.company_name,
                }}
                actionButton={
                  <Link href={`/jobs/${job.id}/manage`}>
                    <Button className="w-full">
                      Manage ({job.referrals?.length || 0} referrals)
                    </Button>
                  </Link>
                }
                showStatus={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Closed Jobs */}
      {jobs.filter((job) => job.state === 'closed').length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Closed Jobs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs
              .filter((job) => job.state === 'closed')
              .map((job) => (
                <JobCard
                  key={job.id}
                  job={{
                    id: job.id,
                    title: job.title,
                    description: job.description,
                    referral_bonus: job.initial_bounty / 10000,
                    commitment_fee: 50,
                    status: 'closed',
                    company_name: job.creator?.company_name,
                  }}
                  actionButton={
                    <Link href={`/jobs/${job.id}`}>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  }
                  showStatus={true}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

