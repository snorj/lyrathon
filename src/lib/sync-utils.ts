import { supabase, supabaseAdmin } from './supabase'

/**
 * Sync utilities to keep Supabase in sync with smart contract events
 */

export const syncUtils = {
  /**
   * Update referral with candidate info after claim
   */
  async syncReferralClaim(claimHash: string, candidateAddress: string, candidateUserId: string) {
    const { data, error } = await supabase
      .from('referrals')
      .update({
        candidate_id: candidateUserId,
        state: 'submitted',
      })
      .eq('claim_hash', claimHash)
      .select()
      .single()

    if (error) {
      console.error('Failed to sync referral claim:', error)
      throw error
    }

    return data
  },

  /**
   * Update referral state after adjudication
   */
  async syncReferralAdjudication(
    referralId: string,
    decision: 0 | 1 | 2 // 0=rejected, 1=spam, 2=hired
  ) {
    const stateMap = {
      0: 'rejected' as const,
      1: 'spam' as const,
      2: 'hired' as const,
    }

    const { data, error } = await supabase
      .from('referrals')
      .update({
        state: stateMap[decision],
      })
      .eq('id', referralId)
      .select('*, job:jobs(*)')
      .single()

    if (error) {
      console.error('Failed to sync referral adjudication:', error)
      throw error
    }

    // If hired, close the job
    if (decision === 2 && data.job) {
      await supabase
        .from('jobs')
        .update({
          state: 'closed',
          closed_at: new Date().toISOString(),
        })
        .eq('id', data.job_id)
    }

    return data
  },

  /**
   * Update job state after withdrawal
   */
  async syncJobWithdrawal(jobId: string) {
    const { data, error } = await supabase
      .from('jobs')
      .update({
        state: 'closed',
        closed_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .select()
      .single()

    if (error) {
      console.error('Failed to sync job withdrawal:', error)
      throw error
    }

    // Refund all pending/submitted referrals
    await supabase
      .from('referrals')
      .update({ state: 'rejected' })
      .eq('job_id', jobId)
      .in('state', ['pending_claim', 'submitted'])

    return data
  },

  /**
   * Get or create profile by wallet address
   * Uses admin client to bypass RLS when creating profiles for Privy users
   */
  async getOrCreateProfile(walletAddress: string, userId: string) {
    // Check if profile exists
    let { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, create it using admin client (bypasses RLS and foreign key constraints)
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          wallet_address: walletAddress.toLowerCase(),
        })
        .select()
        .single()

      if (createError) {
        console.error('Failed to create profile:', createError)
        throw createError
      }

      profile = newProfile
    } else if (error) {
      console.error('Failed to get profile:', error)
      throw error
    }

    return profile
  },

  /**
   * Get user's dashboard data
   */
  async getUserDashboard(userId: string) {
    // Get user's jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select(
        `
        *,
        referrals (
          id,
          state,
          created_at
        )
      `
      )
      .eq('creator_id', userId)
      .order('created_at', { ascending: false })

    if (jobsError) {
      console.error('Failed to get user jobs:', jobsError)
    }

    // Get user's referrals
    const { data: referrals, error: referralsError } = await supabase
      .from('referrals')
      .select(
        `
        *,
        job:jobs (
          id,
          title,
          state,
          creator:profiles!jobs_creator_id_fkey (
            username,
            company_name
          )
        )
      `
      )
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false })

    if (referralsError) {
      console.error('Failed to get user referrals:', referralsError)
    }

    // Determine user type based on data
    const isCompany = (jobs?.length || 0) > 0
    const isReferrer = (referrals?.length || 0) > 0

    // Calculate stats
    const stats = {
      company: {
        openJobs: jobs?.filter((j) => j.state === 'open').length || 0,
        totalReferrals: jobs?.reduce((acc, j) => acc + (j.referrals?.length || 0), 0) || 0,
        totalSpent: jobs?.reduce((acc, j) => acc + j.initial_bounty, 0) || 0,
      },
      referrer: {
        activeReferrals: referrals?.filter((r) => r.state === 'submitted').length || 0,
        hiredCount: referrals?.filter((r) => r.state === 'hired').length || 0,
        totalEarned: 0, // Would need to calculate from contract events
      },
    }

    return {
      userType: isCompany ? ('company' as const) : ('referrer' as const),
      jobs: jobs || [],
      referrals: referrals || [],
      stats,
    }
  },

  /**
   * Get job with all referrals for management
   */
  async getJobForManagement(jobId: string, userId: string) {
    const { data: job, error } = await supabase
      .from('jobs')
      .select(
        `
        *,
        referrals (
          *,
          referrer:profiles!referrals_referrer_id_fkey (
            id,
            username,
            wallet_address
          ),
          candidate:profiles!referrals_candidate_id_fkey (
            id,
            username,
            wallet_address
          )
        )
      `
      )
      .eq('id', jobId)
      .eq('creator_id', userId) // Ensure user owns this job
      .single()

    if (error) {
      console.error('Failed to get job for management:', error)
      throw error
    }

    // Group referrals by state
    const groupedReferrals = {
      pendingClaim: job.referrals?.filter((r) => r.state === 'pending_claim') || [],
      submitted: job.referrals?.filter((r) => r.state === 'submitted') || [],
      rejected: job.referrals?.filter((r) => r.state === 'rejected') || [],
      spam: job.referrals?.filter((r) => r.state === 'spam') || [],
      hired: job.referrals?.filter((r) => r.state === 'hired') || [],
    }

    return {
      job,
      groupedReferrals,
    }
  },
}

