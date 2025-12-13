import { Badge } from '@/components/ui/badge'

export type ReferralStatus = 
  | 'pending_claim'   // Gray   - "Awaiting Candidate"
  | 'submitted'       // Blue   - "Under Review"
  | 'rejected'        // Gray   - "Not Selected"
  | 'spam'            // Red    - "Marked Invalid"
  | 'hired'           // Green  - "Hired"

interface StatusConfig {
  label: string
  variant: 'default' | 'secondary' | 'outline' | 'destructive'
  className?: string
}

const STATUS_CONFIG: Record<ReferralStatus, StatusConfig> = {
  pending_claim: { 
    label: 'Awaiting Candidate', 
    variant: 'secondary' 
  },
  submitted: { 
    label: 'Under Review', 
    variant: 'default' 
  },
  rejected: { 
    label: 'Not Selected', 
    variant: 'outline' 
  },
  spam: { 
    label: 'Marked Invalid', 
    variant: 'destructive' 
  },
  hired: { 
    label: 'Hired', 
    variant: 'default', 
    className: 'bg-green-600 hover:bg-green-700 text-white' 
  },
}

interface ReferralStatusBadgeProps {
  status: ReferralStatus
}

export function ReferralStatusBadge({ status }: ReferralStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  
  return (
    <Badge 
      variant={config.variant} 
      className={config.className}
    >
      {config.label}
    </Badge>
  )
}

