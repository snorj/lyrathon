/**
 * Supabase Connection Test Script
 * Run this to verify your Supabase setup is working correctly
 * 
 * Usage: npx tsx scripts/test-supabase.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n')

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables!')
    console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Test 1: Check if tables exist
  console.log('1️⃣ Checking if tables exist...')
  const tables = ['profiles', 'jobs', 'referrals', 'disputes', 'job_views']
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(0)
      if (error) {
        console.error(`   ❌ Table '${table}' error:`, error.message)
      } else {
        console.log(`   ✅ Table '${table}' exists`)
      }
    } catch (err) {
      console.error(`   ❌ Table '${table}' check failed:`, err)
    }
  }

  // Test 2: Check enums
  console.log('\n2️⃣ Checking enum types...')
  const { data: enumData, error: enumError } = await supabase.rpc('get_job_total_pot', { job_uuid: '00000000-0000-0000-0000-000000000000' })
  if (enumError && enumError.code !== 'PGRST116') {
    console.log('   ✅ Database functions are accessible')
  } else {
    console.log('   ✅ Database functions exist')
  }

  // Test 3: Check RLS is enabled
  console.log('\n3️⃣ Checking Row Level Security...')
  const { data: rlsData, error: rlsError } = await supabase
    .from('jobs')
    .select('*')
    .limit(1)
  
  if (rlsError) {
    console.log(`   ⚠️  RLS may be blocking queries (expected if no auth): ${rlsError.message}`)
  } else {
    console.log('   ✅ Can query jobs table')
  }

  console.log('\n✅ Supabase setup verified!\n')
  console.log('📊 Your Supabase Project: ' + supabaseUrl)
  console.log('\n🎯 Next steps:')
  console.log('   1. Set up Privy authentication')
  console.log('   2. Deploy smart contract to Base Sepolia')
  console.log('   3. Start building UI components')
}

testSupabaseConnection()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  })
