'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { syncUtils } from '@/lib/sync-utils'
import { CompanyDashboard } from '@/components/dashboard/company-dashboard'
import { ReferrerDashboard } from '@/components/dashboard/referrer-dashboard'

export default function DashboardPage() {
  const { user, authenticated, ready } = usePrivy()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    if (!ready) return

    if (!authenticated) {
      router.push('/')
      return
    }

    loadDashboard()
  }, [authenticated, ready, user])

  async function loadDashboard() {
    if (!user?.id) return

    try {
      const data = await syncUtils.getUserDashboard(user.id)
      setDashboardData(data)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!ready || loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <div className="text-lg text-gray-500">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Lyra</h1>
          <p className="text-gray-600 mb-6">
            Get started by posting a job or submitting a referral
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/jobs/new')}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
            >
              Post a Job
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Browse Jobs
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {dashboardData.userType === 'company' ? (
        <CompanyDashboard
          jobs={dashboardData.jobs}
          stats={dashboardData.stats.company}
        />
      ) : (
        <ReferrerDashboard
          referrals={dashboardData.referrals}
          stats={dashboardData.stats.referrer}
        />
      )}
    </div>
  )
}

