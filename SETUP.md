# Lyra Setup Guide

## 📋 Environment Variables Setup

### **Important:** Use `.env.local` not `.env`

Next.js recommends using `.env.local` for local development secrets. This file is automatically ignored by git.

Copy the template:
```bash
cp env.example .env.local
```

---

## 🔑 Getting Your API Keys

### **1. Supabase Keys**

Your project: `https://hyevthpqrioycsdkbkpo.supabase.co`

**To get your keys:**
1. Go to: https://supabase.com/dashboard/project/hyevthpqrioycsdkbkpo/settings/api
2. Copy these values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://hyevthpqrioycsdkbkpo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb... (starts with eyJ)
SUPABASE_SERVICE_ROLE_KEY=eyJhb... (starts with eyJ, different from anon key)
```

**⚠️ Important:** The service role key is sensitive - keep it secret!

---

### **2. Run Database Migrations**

Go to: https://supabase.com/dashboard/project/hyevthpqrioycsdkbkpo/editor

1. Click **"SQL Editor"** in left sidebar
2. Click **"New query"**
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and click **"Run"**

This creates all your tables, policies, and functions.

---

### **3. Privy Setup**

1. Go to: https://dashboard.privy.io
2. Create a new app (or use existing)
3. In **Settings**:
   - Add login methods (Email, Google, etc.)
   - Add **Base Sepolia** to supported networks
4. Copy your keys:

```bash
NEXT_PUBLIC_PRIVY_APP_ID=clxxxxx...
PRIVY_APP_SECRET=xxxxx...
```

---

### **4. Contract Deployment** (Optional for now)

You can build the UI first and deploy the contract later. When ready:

1. Get Base Sepolia ETH from faucet: https://www.coinbase.com/faucets/base-sepolia-faucet
2. Add your private key to `.env.local`
3. Run deployment script

---

## ✅ Your `.env.local` Should Look Like:

```bash
# Base Sepolia
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_BASE_SEPOLIA_CHAIN_ID=84532

# USDC
NEXT_PUBLIC_USDC_CONTRACT_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e

# Privy
NEXT_PUBLIC_PRIVY_APP_ID=clxxxxx...
PRIVY_APP_SECRET=xxxxx...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://hyevthpqrioycsdkbkpo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhbo...

# Contract (leave empty for now)
NEXT_PUBLIC_REFERRAL_CONTRACT_ADDRESS=
```

---

## 🚀 Next Steps

After setting up your `.env.local`:
1. Restart your dev server
2. Test Supabase connection
3. Test Privy authentication
4. Start building UI components!
