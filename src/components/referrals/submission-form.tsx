'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from '@/components/ui/alert-dialog'

interface FormData {
  candidateName: string
  candidateLinkedIn: string
  pitch: string
}

interface SubmissionFormProps {
  jobId: string
  jobTitle: string
  referralBonus: number // in USDC units
  commitmentFee: number // in USDC units
  onSuccess?: (claimLink: string) => void
}

export function SubmissionForm({ 
  jobId, 
  jobTitle, 
  referralBonus,
  commitmentFee,
  onSuccess 
}: SubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [claimLink, setClaimLink] = useState('')
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>()

  const feeDisplay = (commitmentFee / 1_000_000).toFixed(2)
  const bonusDisplay = (referralBonus / 1_000_000).toFixed(2)

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      // TODO: Implement smart contract integration
      // 1. Approve USDC
      // 2. Call smart contract stakeReferral
      // 3. Save to Supabase with claim hash
      // 4. Generate claim link
      
      // Temporary mock success
      await new Promise(resolve => setTimeout(resolve, 2000))
      const mockClaimLink = `${window.location.origin}/claim/mock-hash-${Date.now()}`
      setClaimLink(mockClaimLink)
      setShowSuccess(true)
      reset()
      
      if (onSuccess) {
        onSuccess(mockClaimLink)
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('Failed to submit referral. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(claimLink)
    alert('Claim link copied to clipboard!')
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Submit a Referral</CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            Refer someone great for <span className="font-semibold">{jobTitle}</span>
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Candidate Name */}
            <div className="space-y-2">
              <label htmlFor="candidateName" className="text-sm font-medium text-gray-900">
                Candidate Name *
              </label>
              <Input
                id="candidateName"
                placeholder="Jane Doe"
                {...register('candidateName', { 
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
                className={errors.candidateName ? 'border-red-500' : ''}
              />
              {errors.candidateName && (
                <p className="text-sm text-red-600">{errors.candidateName.message}</p>
              )}
            </div>

            {/* LinkedIn URL */}
            <div className="space-y-2">
              <label htmlFor="candidateLinkedIn" className="text-sm font-medium text-gray-900">
                LinkedIn or Profile URL *
              </label>
              <Input
                id="candidateLinkedIn"
                type="url"
                placeholder="https://linkedin.com/in/janedoe"
                {...register('candidateLinkedIn', { 
                  required: 'Profile URL is required',
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'Please enter a valid URL'
                  }
                })}
                className={errors.candidateLinkedIn ? 'border-red-500' : ''}
              />
              {errors.candidateLinkedIn && (
                <p className="text-sm text-red-600">{errors.candidateLinkedIn.message}</p>
              )}
            </div>

            {/* Pitch */}
            <div className="space-y-2">
              <label htmlFor="pitch" className="text-sm font-medium text-gray-900">
                Why are they a great fit? *
              </label>
              <Textarea
                id="pitch"
                rows={5}
                placeholder="Tell the company why this candidate would be perfect for the role..."
                {...register('pitch', { 
                  required: 'Pitch is required',
                  minLength: { value: 50, message: 'Pitch must be at least 50 characters' },
                  maxLength: { value: 500, message: 'Pitch must be less than 500 characters' }
                })}
                className={errors.pitch ? 'border-red-500' : ''}
              />
              {errors.pitch && (
                <p className="text-sm text-red-600">{errors.pitch.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Minimum 50 characters, maximum 500 characters
              </p>
            </div>

            {/* Fee Display */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Commitment Fee:</span>
                <span className="text-lg font-bold text-gray-900">${feeDisplay}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Potential Earnings (if hired):</span>
                <span className="text-lg font-bold text-green-600">${bonusDisplay}</span>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                The commitment fee prevents spam and is refunded if the company passes on your referral.
              </p>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : `Submit Referral & Pay $${feeDisplay}`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Referral Submitted! 🎉</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>Your referral has been submitted successfully.</p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900 mb-2">Next Step:</p>
                <p className="text-sm text-blue-800 mb-3">
                  Send this claim link to the candidate so they can accept the referral:
                </p>
                <div className="flex gap-2">
                  <Input 
                    value={claimLink} 
                    readOnly 
                    className="text-xs bg-white"
                  />
                  <Button onClick={copyLink} size="sm">Copy</Button>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

