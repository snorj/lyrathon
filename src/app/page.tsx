'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { JobCard } from '@/components/jobs/job-card'
import { SubmissionForm } from '@/components/referrals/submission-form'
import { ReferralStatusBadge, ReferralStatus } from '@/components/referrals/status-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { PaymentConfirmModal } from '@/components/payments/confirm-modal'
import { Briefcase, Users, Award } from 'lucide-react'

export default function Home() {
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Demo job data
  const demoJob = {
    id: '1',
    title: 'Senior Full-Stack Engineer',
    description: 'Join our platform team building the next generation of our product...',
    initial_bounty: 5_000_000, // $5.00 in USDC units
    commitment_fee: 500_000, // $0.50
    state: 'open' as const,
    company_name: 'Acme Corp',
  }

  const handlePaymentConfirm = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    alert('Payment confirmed!')
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Quality Referrals, Guaranteed
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A professional referral platform where commitment fees ensure quality candidates and companies pay fair bonuses.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/jobs/new">Post a Job</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#components">View Components</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">
                Post Quality Jobs
              </h3>
              <p className="text-sm text-gray-600">
                Companies fund referral bonuses upfront and review candidates with confidence.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">
                Earn Fair Bonuses
              </h3>
              <p className="text-sm text-gray-600">
                Referrers pay small commitment fees to submit quality candidates and earn when hired.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-4">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">
                No Spam, Ever
              </h3>
              <p className="text-sm text-gray-600">
                Commitment fees prevent low-quality submissions, ensuring everyone's time is respected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Component Showcase */}
      <section id="components" className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Component Showcase
          </h2>

          <div className="space-y-16">
            {/* Job Card */}
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Job Card</h3>
              <div className="max-w-md">
                <JobCard 
                  job={demoJob}
                  showStatus={true}
                  actionButton={
                    <Button className="w-full" asChild>
                      <Link href="/jobs/1">View Details →</Link>
                    </Button>
                  }
                />
              </div>
            </div>

            {/* Status Badges */}
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Status Badges</h3>
              <div className="flex flex-wrap gap-3">
                <ReferralStatusBadge status="pending_claim" />
                <ReferralStatusBadge status="submitted" />
                <ReferralStatusBadge status="rejected" />
                <ReferralStatusBadge status="spam" />
                <ReferralStatusBadge status="hired" />
              </div>
            </div>

            {/* Empty State */}
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Empty State</h3>
              <div className="border rounded-lg p-8 bg-gray-50">
                <EmptyState 
                  title="No jobs posted yet"
                  description="Post your first job to start receiving quality referrals from your network."
                  actionLabel="Post a Job"
                  onAction={() => alert('Navigate to post job page')}
                  icon={Briefcase}
                />
              </div>
            </div>

            {/* Submission Form */}
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Referral Submission Form</h3>
              <div className="max-w-2xl">
                <SubmissionForm 
                  jobId={demoJob.id}
                  jobTitle={demoJob.title}
                  referralBonus={demoJob.initial_bounty}
                  commitmentFee={demoJob.commitment_fee}
                  onSuccess={(link) => alert(`Success! Claim link: ${link}`)}
                />
              </div>
            </div>

            {/* Payment Modal Demo */}
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Payment Confirmation Modal</h3>
              <Button onClick={() => setShowPaymentModal(true)}>
                Show Payment Modal
              </Button>
              <PaymentConfirmModal 
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onConfirm={handlePaymentConfirm}
                title="Confirm Commitment Fee"
                description="You're submitting a referral for Senior Full-Stack Engineer. This requires a commitment fee that will be refunded if the company passes or kept if marked as spam."
                amount={500_000}
                type="commitment"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join companies and referrers building quality connections.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
