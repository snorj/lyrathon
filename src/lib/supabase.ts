import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Helper functions for common operations
export const supabaseHelpers = {
  // Jobs
  async getJobs(limit = 50, offset = 0) {
    return supabase
      .from('jobs')
      .select(`
        *,
        creator:profiles!jobs_creator_id_fkey (
          username,
          avatar_url,
          reputation_score,
          company_name
        ),
        referrals:referrals(count)
      `)
      .eq('state', 'open')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
  },

  async getJobById(id: string) {
    return supabase
      .from('jobs')
      .select(`
        *,
        creator:profiles!jobs_creator_id_fkey (*),
        referrals (
          *,
          referrer:profiles!referrals_referrer_id_fkey (*),
          candidate:profiles!referrals_candidate_id_fkey (*)
        )
      `)
      .eq('id', id)
      .single()
  },

  async createJob(jobData: {
    title: string
    description: string
    initial_bounty: number
    onchain_id?: number
  }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    return supabase
      .from('jobs')
      .insert({
        ...jobData,
        creator_id: user.id,
      })
      .select()
      .single()
  },

  // Referrals
  async createReferral(referralData: {
    job_id: string
    pitch: string
    claim_hash: string
    onchain_id?: number
  }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    return supabase
      .from('referrals')
      .insert({
        ...referralData,
        referrer_id: user.id,
      })
      .select()
      .single()
  },

  async getReferralByClaimHash(claimHash: string) {
    return supabase
      .from('referrals')
      .select(`
        *,
        job:jobs (
          title,
          description,
          creator:profiles!jobs_creator_id_fkey (
            username,
            company_name
          )
        ),
        referrer:profiles!referrals_referrer_id_fkey (*)
      `)
      .eq('claim_hash', claimHash)
      .single()
  },

  // User profiles
  async getProfile(userId: string) {
    return supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
  },

  async updateProfile(userId: string, updates: Partial<{
    username: string
    avatar_url: string
    bio: string
    is_company: boolean
    company_name: string
  }>) {
    return supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
  },

  // Disputes
  async createDispute(disputeData: {
    job_id: string
    target_id: string
    reason: string
    evidence?: string
  }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    return supabase
      .from('disputes')
      .insert({
        ...disputeData,
        reporter_id: user.id,
      })
      .select()
      .single()
  },
}
