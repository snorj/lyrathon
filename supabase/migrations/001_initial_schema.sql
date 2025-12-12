-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create enum types
create type job_state as enum ('draft', 'open', 'closed');
create type referral_state as enum ('pending_claim', 'submitted', 'rejected', 'spam', 'hired');

-- Users table (extends auth.users from Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  wallet_address text unique not null,
  username text,
  avatar_url text,
  bio text,
  reputation_score integer default 0,
  total_earnings bigint default 0, -- in wei/USDC smallest units
  is_company boolean default false,
  company_name text,
  dispute_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Jobs table
create table public.jobs (
  id uuid default uuid_generate_v4() primary key,
  onchain_id bigint unique, -- matches smart contract job ID
  creator_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  initial_bounty bigint not null, -- in USDC smallest units (6 decimals)
  accumulated_spam bigint default 0, -- confiscated stakes added to bounty
  state job_state default 'draft' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  closed_at timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Referrals table
create table public.referrals (
  id uuid default uuid_generate_v4() primary key,
  onchain_id bigint unique, -- matches smart contract referral ID
  job_id uuid references public.jobs(id) on delete cascade not null,
  referrer_id uuid references public.profiles(id) on delete cascade not null,
  candidate_id uuid references public.profiles(id) on delete set null, -- null until claimed
  pitch text not null,
  stake_amount bigint default 50000000 not null, -- 50 USDC in smallest units
  state referral_state default 'pending_claim' not null,
  claim_hash text unique, -- for secret claim links
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Dispute/Fraud reports table
create table public.disputes (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references public.jobs(id) on delete cascade not null,
  reporter_id uuid references public.profiles(id) on delete cascade not null, -- usually the hired candidate
  target_id uuid references public.profiles(id) on delete cascade not null, -- the company that withdrew
  reason text not null,
  evidence text, -- optional additional evidence
  status text default 'pending' check (status in ('pending', 'investigating', 'resolved', 'dismissed')),
  resolution text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  resolved_at timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Job views for analytics
create table public.job_views (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references public.jobs(id) on delete cascade not null,
  viewer_id uuid references public.profiles(id) on delete cascade,
  viewer_ip inet,
  user_agent text,
  viewed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index idx_jobs_creator_id on public.jobs(creator_id);
create index idx_jobs_state on public.jobs(state);
create index idx_jobs_created_at on public.jobs(created_at desc);
create index idx_referrals_job_id on public.referrals(job_id);
create index idx_referrals_referrer_id on public.referrals(referrer_id);
create index idx_referrals_candidate_id on public.referrals(candidate_id);
create index idx_referrals_state on public.referrals(state);
create index idx_referrals_claim_hash on public.referrals(claim_hash);
create index idx_disputes_job_id on public.disputes(job_id);
create index idx_disputes_reporter_id on public.disputes(reporter_id);
create index idx_disputes_target_id on public.disputes(target_id);
create index idx_profiles_wallet_address on public.profiles(wallet_address);
create index idx_job_views_job_id on public.job_views(job_id);
create index idx_job_views_viewed_at on public.job_views(viewed_at desc);

-- Row Level Security (RLS) policies

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.referrals enable row level security;
alter table public.disputes enable row level security;
alter table public.job_views enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Jobs policies
create policy "Jobs are viewable by everyone" on public.jobs
  for select using (true);

create policy "Authenticated users can create jobs" on public.jobs
  for insert with check (auth.uid() = creator_id);

create policy "Job creators can update their jobs" on public.jobs
  for update using (auth.uid() = creator_id);

-- Referrals policies
create policy "Referrals are viewable by job creator and referrer" on public.referrals
  for select using (
    auth.uid() = referrer_id or
    auth.uid() in (
      select creator_id from public.jobs where id = job_id
    )
  );

create policy "Authenticated users can create referrals" on public.referrals
  for insert with check (auth.uid() = referrer_id);

create policy "Job creators can update referral states" on public.referrals
  for update using (
    auth.uid() in (
      select creator_id from public.jobs where id = job_id
    )
  );

-- Disputes policies
create policy "Disputes are viewable by involved parties" on public.disputes
  for select using (
    auth.uid() = reporter_id or auth.uid() = target_id
  );

create policy "Authenticated users can create disputes" on public.disputes
  for insert with check (auth.uid() = reporter_id);

create policy "Disputes can be updated by admins only" on public.disputes
  for update using (auth.jwt() ->> 'role' = 'admin');

-- Job views policies
create policy "Job views are viewable by job creators" on public.job_views
  for select using (
    auth.uid() in (
      select creator_id from public.jobs where id = job_id
    )
  );

create policy "Anyone can insert job views" on public.job_views
  for insert with check (true);

-- Functions

-- Function to get total pot for a job
create or replace function get_job_total_pot(job_uuid uuid)
returns bigint as $$
  select coalesce(initial_bounty, 0) + coalesce(accumulated_spam, 0)
  from public.jobs
  where id = job_uuid;
$$ language sql stable;

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function update_updated_at_column();

create trigger update_jobs_updated_at before update on public.jobs
  for each row execute function update_updated_at_column();

create trigger update_referrals_updated_at before update on public.referrals
  for each row execute function update_updated_at_column();

create trigger update_disputes_updated_at before update on public.disputes
  for each row execute function update_updated_at_column();
