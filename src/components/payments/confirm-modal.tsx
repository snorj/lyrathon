'use client'

import { useState } from 'react'
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
import { Button } from '@/components/ui/button'

interface PaymentConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  title: string
  description: string
  amount: number // in USDC units (6 decimals)
  type: 'commitment' | 'bonus' | 'refund'
}

export function PaymentConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  amount,
  type,
}: PaymentConfirmModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const amountDisplay = (amount / 1_000_000).toFixed(2)

  const handleConfirm = async () => {
    setIsProcessing(true)
    setError(null)
    
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const getTypeColor = () => {
    switch (type) {
      case 'bonus':
        return 'text-green-600'
      case 'refund':
        return 'text-blue-600'
      case 'commitment':
      default:
        return 'text-gray-900'
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p className="text-gray-600">{description}</p>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Amount:</span>
                <span className={`text-2xl font-bold ${getTypeColor()}`}>
                  ${amountDisplay}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Transaction Fee:</span>
                <span className="text-xs font-medium text-gray-700">Free (sponsored)</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <p className="text-xs text-gray-500">
              This action will process instantly. You'll see the update in your dashboard immediately.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="min-w-[120px]"
          >
            {isProcessing ? 'Processing...' : 'Confirm Payment'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

