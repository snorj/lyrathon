'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { contractActions, formatAmount } from '@/lib/contract-actions'
import { PaymentConfirmModal } from '@/components/payments/confirm-modal'

export default function NewJobPage() {
  const router = useRouter()
  const { user, authenticated, ready } = usePrivy()
  const { wallets } = useWallets()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    referralBonus: '5.00',
    commitmentFee: '0.50',
  })

  const [errors, setErrors] = useState({
    title: '',
    description: '',
    referralBonus: '',
  })

  const validateForm = () => {
    const newErrors = {
      title: '',
      description: '',
      referralBonus: '',
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required'
    } else if (formData.title.length > 100) {
      newErrors.title = 'Job title must be less than 100 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required'
    } else if (formData.description.trim().length < 1) {
      newErrors.description = 'Description must be at least 1 characters'
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters'
    }

    const bonus = parseFloat(formData.referralBonus)
    if (isNaN(bonus) || bonus < 0.01 || bonus > 1000) {
      newErrors.referralBonus = 'Referral bonus must be between $0.01 and $1000.00'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some((err) => err !== '')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!authenticated) {
      setError('Please sign in to post a job')
      return
    }

    if (validateForm()) {
      setShowPaymentModal(true)
    }
  }

  const handleConfirmPayment = async () => {
    if (!user?.wallet?.address) {
      setError('Wallet not connected')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Get wallet provider from Privy
      const wallet = wallets.find(w => w.address === user.wallet?.address)
      if (!wallet) {
        throw new Error('Wallet not found')
      }
      
      const provider = await wallet.getEthereumProvider()

      const result = await contractActions.createJob({
        title: formData.title,
        description: formData.description,
        bountyAmount: parseFloat(formData.referralBonus),
        walletProvider: provider,
        userAddress: user.wallet.address as `0x${string}`,
        userId: user.id,
      })

      // Success! Redirect to job page
      setShowPaymentModal(false)
      router.push(`/jobs/${result.jobId}`)
    } catch (err: any) {
      console.error('Failed to create job:', err)
      setError(err.message || 'Failed to create job. Please try again.')
      setShowPaymentModal(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!ready) {
    return (
      <div className="container max-w-2xl py-12">
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="container max-w-2xl py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
            <p className="text-gray-600 mb-6">
              You need to sign in to post a job
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Post a New Job</CardTitle>
          <p className="text-gray-600 mt-2">
            Create a job posting and fund the referral bonus to start receiving quality referrals
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Job Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g. Senior Full-Stack Engineer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Job Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the role, responsibilities, requirements, and what makes this opportunity great..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={8}
                className={errors.description ? 'border-red-500' : ''}
              />
              <div className="flex items-center justify-between text-sm">
                {errors.description ? (
                  <p className="text-red-500">{errors.description}</p>
                ) : (
                  <p className="text-gray-500">
                    {formData.description.trim().length} / 2000 characters
                  </p>
                )}
              </div>
            </div>

            {/* Referral Bonus */}
            <div className="space-y-2">
              <Label htmlFor="referralBonus">
                Referral Bonus <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  id="referralBonus"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="1000"
                  placeholder="5.00"
                  value={formData.referralBonus}
                  onChange={(e) =>
                    setFormData({ ...formData, referralBonus: e.target.value })
                  }
                  className={`pl-7 ${errors.referralBonus ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.referralBonus ? (
                <p className="text-sm text-red-500">{errors.referralBonus}</p>
              ) : (
                <p className="text-sm text-gray-500">
                  Amount paid to successful referrer (80% split) and candidate (20% split)
                </p>
              )}
            </div>

            {/* Commitment Fee Info */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg border border-gray-300">
                  <svg
                    className="w-5 h-5 text-gray-600"
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
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Commitment Fee</h4>
                  <p className="text-sm text-gray-600">
                    Referrers will pay a <span className="font-medium">${formData.commitmentFee}</span> commitment
                    fee to submit candidates. This prevents spam and ensures quality referrals.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-900">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : `Create Job & Fund ${formatAmount(parseFloat(formData.referralBonus) * 100)}`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Payment Confirmation Modal */}
      <PaymentConfirmModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handleConfirmPayment}
        title="Fund Referral Bonus"
        description={`You're creating "${formData.title}" with a referral bonus of ${formatAmount(parseFloat(formData.referralBonus) * 100)}. This amount will be held in escrow and paid out when you hire a referral.`}
        amount={parseFloat(formData.referralBonus) * 1_000_000}
        type="bonus"
      />
    </div>
  )
}

