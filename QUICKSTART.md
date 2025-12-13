# Quick Start Guide - Lyra Phase 2

## 🎉 Phase 2 Complete!

All core UI components have been built and are ready to test.

---

## Prerequisites

Make sure you have:
- ✅ Node.js installed (v18+)
- ✅ Dependencies installed (`npm install`)
- ✅ Environment variables configured (`.env.local`)

---

## Run the Application

```bash
npm run dev
```

Then open: **http://localhost:3000**

---

## What You'll See

### 1. **Header Navigation**
- Top navigation with "Lyra" logo
- "Sign In" button (integrates with Privy)
- Dashboard and Post Job links (when signed in)

### 2. **Hero Section**
- Clean value proposition
- Call-to-action buttons
- Professional design (no crypto terms!)

### 3. **Feature Highlights**
- 3 feature cards explaining the platform
- Icons: Briefcase, Users, Award
- Clear, benefit-focused messaging

### 4. **Component Showcase**
Interactive demos of all 6 components:

#### a) Job Card
- Displays job title, company, bonuses
- Status badge
- Action button slot

#### b) Status Badges
- 5 different states (pending, submitted, rejected, spam, hired)
- Color-coded for quick recognition

#### c) Empty State
- Used when no data exists
- Optional icon and action button

#### d) Referral Submission Form
- 3 validated fields (name, LinkedIn, pitch)
- Shows fees and potential earnings
- Success modal with claim link

#### e) Payment Confirmation Modal
- Click "Show Payment Modal" button to test
- Clean payment confirmation UX
- No blockchain terminology

---

## Testing the Components

### Test Form Validation
1. Scroll to "Referral Submission Form"
2. Try submitting empty form → See validation errors
3. Fill in:
   - Name: "Jane Doe"
   - LinkedIn: "https://linkedin.com/in/janedoe"
   - Pitch: Write 50+ characters
4. Click submit → See success modal with claim link

### Test Status Badges
All 5 status states are displayed side-by-side:
- Awaiting Candidate (gray)
- Under Review (blue)
- Not Selected (outline)
- Marked Invalid (red)
- Hired (green)

### Test Payment Modal
1. Scroll to "Payment Confirmation Modal"
2. Click "Show Payment Modal"
3. See clean payment confirmation
4. Note "Free (sponsored)" transaction fee
5. Click "Confirm Payment" → See simulated success

### Test Empty State
- See example with Briefcase icon
- Notice clean, centered layout
- Action button included

---

## Component Locations

All components are in `src/components/`:

```
src/components/
├── layout/
│   └── header.tsx                 → Navigation header
├── jobs/
│   └── job-card.tsx              → Job display card
├── referrals/
│   ├── submission-form.tsx        → Referral form
│   └── status-badge.tsx           → Status indicator
├── payments/
│   └── confirm-modal.tsx          → Payment confirmation
└── ui/
    ├── empty-state.tsx            → Empty states
    └── label.tsx                  → Form labels
```

---

## Key Features Implemented

### ✅ Professional Design
- Clean, minimal aesthetic (like Stripe/Linear)
- Consistent spacing and typography
- Professional color palette

### ✅ No Crypto Terminology
- All amounts in dollars ($)
- "Commitment Fee" not "stake"
- "Referral Bonus" not "bounty"
- No mention of blockchain/wallets

### ✅ Responsive Design
- Works on mobile and desktop
- Proper breakpoints
- Touch-friendly buttons

### ✅ Form Validation
- Real-time validation
- Clear error messages
- Min/max length checks
- URL validation

### ✅ Type Safety
- Full TypeScript coverage
- Proper prop types
- No `any` types

---

## Next: Phase 3 - Complete Flows

**What's Coming**:
1. Dashboard page (role-based views)
2. Post job page with payment
3. Job detail + referral submission
4. Company management page
5. Candidate claim page
6. Smart contract integration
7. Supabase data sync

**Estimated Time**: 90-120 minutes

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Then restart
npm run dev
```

### Missing Dependencies
```bash
npm install
```

### TypeScript Errors
```bash
npm run build
```

### Privy Not Loading
Check `.env.local` has:
```
NEXT_PUBLIC_PRIVY_APP_ID=cmj3ipbgn0059i80dcm2hjc19
```

---

## Demo Flow

**Best way to showcase Phase 2**:

1. **Show the hero** → Clean, professional branding
2. **Sign in** → Privy modal appears
3. **Scroll down** → See feature highlights
4. **Component showcase** → All components interactive
5. **Test the form** → Shows validation and success flow
6. **Show payment modal** → Clean payment UX
7. **Point out** → Zero crypto terminology

---

## Architecture Notes

### Component Design
- Self-contained with clear props
- Composable and reusable
- Follows shadcn/ui patterns
- Client components marked with `'use client'`

### USDC Conversion
All components expect USDC units (6 decimals):
```typescript
// Contract uses: 500_000 = $0.50
// Components convert: 500_000 / 1_000_000 = 0.50
// Display: $0.50
```

### Data Flow (Phase 3)
```
User Action → 
  UI Component → 
    Contract Integration → 
      Smart Contract (onchain) → 
        Supabase Sync (offchain) → 
          UI Update
```

---

## Questions?

- **Implementation Plan**: See `context/IMPLEMENTATION_PLAN.md`
- **Phase 2 Summary**: See `context/PHASE2_COMPLETE.md`
- **Contract Details**: Address `0xe2410e8beDe86FcF8B141301792C449958E2ec1D` on Base Sepolia

---

## 🎉 Phase 2 Status: COMPLETE

All 6 core components built and ready for integration!

**Time to build Phase 3 and connect to the blockchain!** 🚀

