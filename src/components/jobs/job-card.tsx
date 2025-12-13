import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface JobCardProps {
  job: {
    id: string
    title: string
    description: string
    initial_bounty: number // in USDC units (6 decimals)
    commitment_fee?: number // in USDC units (6 decimals)
    state: 'open' | 'closed' | 'filled'
    company_name?: string
  }
  actionButton?: React.ReactNode
  showStatus?: boolean
}

export function JobCard({ job, actionButton, showStatus = false }: JobCardProps) {
  // Convert USDC units (6 decimals) to dollars
  const referralBonus = (job.initial_bounty / 1_000_000).toFixed(2)
  const commitmentFee = ((job.commitment_fee || 500_000) / 1_000_000).toFixed(2)

  const statusVariant = job.state === 'open' ? 'default' : 'secondary'
  const statusLabel = job.state === 'open' ? 'Open' : job.state === 'filled' ? 'Filled' : 'Closed'

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-1">{job.title}</CardTitle>
            {job.company_name && (
              <CardDescription className="text-base">{job.company_name}</CardDescription>
            )}
          </div>
          {showStatus && (
            <Badge variant={statusVariant} className="ml-4">
              {statusLabel}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <div className="text-sm text-gray-500 mb-1">Referral Bonus</div>
            <div className="text-2xl font-bold text-gray-900">${referralBonus}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Commitment Fee Required</div>
            <div className="text-sm font-medium text-gray-700">${commitmentFee}</div>
          </div>
        </div>
        {actionButton && <div className="pt-2">{actionButton}</div>}
      </CardContent>
    </Card>
  )
}

