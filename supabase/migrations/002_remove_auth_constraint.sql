-- Migration to support Privy authentication
-- Removes the foreign key constraint and changes id from UUID to TEXT to support Privy DIDs

-- Step 1: Drop ALL existing RLS policies first (they reference the columns we need to change)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can update profiles" ON public.profiles;

DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON public.jobs;
DROP POLICY IF EXISTS "Authenticated users can create jobs" ON public.jobs;
DROP POLICY IF EXISTS "Job creators can update their jobs" ON public.jobs;
DROP POLICY IF EXISTS "Anyone can create jobs" ON public.jobs;
DROP POLICY IF EXISTS "Anyone can update their jobs" ON public.jobs;

DROP POLICY IF EXISTS "Referrals are viewable by job creator and referrer" ON public.referrals;
DROP POLICY IF EXISTS "Authenticated users can create referrals" ON public.referrals;
DROP POLICY IF EXISTS "Job creators can update referral states" ON public.referrals;
DROP POLICY IF EXISTS "Anyone can create referrals" ON public.referrals;
DROP POLICY IF EXISTS "Anyone can update referrals" ON public.referrals;

DROP POLICY IF EXISTS "Disputes are viewable by involved parties" ON public.disputes;
DROP POLICY IF EXISTS "Authenticated users can create disputes" ON public.disputes;
DROP POLICY IF EXISTS "Disputes can be updated by admins only" ON public.disputes;
DROP POLICY IF EXISTS "Anyone can create disputes" ON public.disputes;

DROP POLICY IF EXISTS "Job views are viewable by job creators" ON public.job_views;
DROP POLICY IF EXISTS "Anyone can insert job views" ON public.job_views;

-- Step 2: Drop foreign key references in other tables
ALTER TABLE public.jobs 
  DROP CONSTRAINT IF EXISTS jobs_creator_id_fkey;

ALTER TABLE public.referrals 
  DROP CONSTRAINT IF EXISTS referrals_referrer_id_fkey,
  DROP CONSTRAINT IF EXISTS referrals_candidate_id_fkey;

ALTER TABLE public.disputes 
  DROP CONSTRAINT IF EXISTS disputes_reporter_id_fkey,
  DROP CONSTRAINT IF EXISTS disputes_target_id_fkey;

ALTER TABLE public.job_views 
  DROP CONSTRAINT IF EXISTS job_views_viewer_id_fkey;

-- Step 3: Drop the foreign key constraint on profiles
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Step 4: Change id column type from UUID to TEXT in all tables
ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.jobs ALTER COLUMN creator_id TYPE TEXT;
ALTER TABLE public.referrals ALTER COLUMN referrer_id TYPE TEXT;
ALTER TABLE public.referrals ALTER COLUMN candidate_id TYPE TEXT;
ALTER TABLE public.disputes ALTER COLUMN reporter_id TYPE TEXT;
ALTER TABLE public.disputes ALTER COLUMN target_id TYPE TEXT;
ALTER TABLE public.job_views ALTER COLUMN viewer_id TYPE TEXT;

-- Step 5: Recreate foreign key constraints (without auth.users reference)
ALTER TABLE public.jobs 
  ADD CONSTRAINT jobs_creator_id_fkey 
  FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.referrals 
  ADD CONSTRAINT referrals_referrer_id_fkey 
  FOREIGN KEY (referrer_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT referrals_candidate_id_fkey 
  FOREIGN KEY (candidate_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.disputes 
  ADD CONSTRAINT disputes_reporter_id_fkey 
  FOREIGN KEY (reporter_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT disputes_target_id_fkey 
  FOREIGN KEY (target_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.job_views 
  ADD CONSTRAINT job_views_viewer_id_fkey 
  FOREIGN KEY (viewer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Step 6: Recreate RLS policies compatible with Privy auth
-- These policies are more permissive since we're not using auth.uid()
-- Authorization should be handled at the application level with Privy

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update profiles" ON public.profiles
  FOR UPDATE USING (true);

-- Jobs policies
CREATE POLICY "Jobs are viewable by everyone" ON public.jobs
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create jobs" ON public.jobs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update their jobs" ON public.jobs
  FOR UPDATE USING (true);

-- Referrals policies
CREATE POLICY "Referrals are viewable by everyone" ON public.referrals
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create referrals" ON public.referrals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update referrals" ON public.referrals
  FOR UPDATE USING (true);

-- Disputes policies
CREATE POLICY "Disputes are viewable by everyone" ON public.disputes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create disputes" ON public.disputes
  FOR INSERT WITH CHECK (true);

-- Job views policies
CREATE POLICY "Anyone can insert job views" ON public.job_views
  FOR INSERT WITH CHECK (true);

-- NOTE: These policies are permissive for development with Privy
-- In production, implement proper authorization:
-- 1. Use Privy JWT tokens for server-side validation
-- 2. Use service role key only on server-side
-- 3. Add middleware to validate wallet signatures

