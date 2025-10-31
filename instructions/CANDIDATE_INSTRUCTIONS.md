# Token Consumption Monitor - Coding Test

## Overview

We're building a platform where users can have voice or video conversations with AI avatars. Users purchase tokens (think of them like minutes) and get charged based on how long they talk.

You've joined the team, and your task is to finish the billing system. The UI is done, the timer works, and the basic token calculation is already implemented. We need you to add the validation and safety checks.

## Setup

```bash
npm install
npx expo start
# Press 'w' to open in browser
```

## What's Already Built

✅ Complete UI with timer
✅ Token calculation (you can see tokens increasing in real-time)
✅ Session state management

## What You Need to Build

We need three safety features added to the session logic:

### 1. Prevent Sessions from Starting Without Enough Balance

Before a session starts, check if the user has enough tokens. If they don't have at least 1 minute of talk time at the avatar's rate, prevent the session from starting and show an alert.

**Current behavior:** Sessions always start, even with insufficient balance
**What we need:** Block the session and show "Insufficient balance to start session"

### 2. Warn Users When Running Low

Once the user has less than 1 minute of talk time remaining (based on their current balance and the avatar's rate), show them a warning banner.

**Current behavior:** No warning shown
**What we need:** Warning appears when < 1 minute remaining
**Important:** The warning should only appear once per session, not repeatedly

### 3. Auto-Terminate When Balance Runs Out

When the user's token balance is completely depleted, automatically end the session. Don't let them go into negative balance.

**Current behavior:** Session keeps running even at 0 balance
**What we need:** Session ends automatically when balance hits zero

---

## Testing Your Implementation

**Starting balance:** 4.0 tokens (refresh the page to reset)

Try these scenarios to verify your implementation:

### Scenario 1: Normal Session → Auto-Terminate

**Steps:**

1. Pick Sarah Chen ($2.00/min)
2. Start any session (video or voice)
3. Let it run for 2 minutes

**Expected behavior:**

- Tokens consumed increases every second
- Around 1:30 (when you've used 3.0 tokens), you see a "low balance" warning banner
- At exactly 2:00, the session auto-terminates (4.0 tokens used)
- Alert shows: "Session ended. Duration: 2m 0s, Tokens charged: 4.00"

### Scenario 2: Insufficient Balance → Can't Start

**Steps:**

1. Try to start a session with Dr. Emily Watson ($3.00/min)
2. Click "Start Session"

**Expected behavior:**

- Session refuses to start
- Alert immediately shows: "Insufficient balance to start session"
- You stay on the session screen, status shows "Ready to start"
- (You have 4.0 tokens but need at least 3.0 for 1 minute - too risky to allow)

### Scenario 3: Just Enough Balance → Auto-Terminate

**Steps:**

1. Pick Marcus Rivera ($1.50/min)
2. Start a session
3. Let it run until it stops automatically

**Expected behavior:**

- Session starts successfully
- Low balance warning appears around 2:00 (when 3.0 tokens consumed, 1.0 remaining = < 1 min)
- Session auto-terminates around 2:40 (160 seconds, 4.0 tokens fully consumed)
- Alert shows: "Session ended. Duration: 2m 40s, Tokens charged: 4.00"

---

## Submission Checklist

Before submitting, verify:

- [ ] App runs without errors: `npx expo start --web`
- [ ] **Scenario 1 passes:** Sarah Chen session auto-terminates at 2:00 with warning at ~1:30
- [ ] **Scenario 2 passes:** Dr. Emily Watson session refuses to start with alert
- [ ] **Scenario 3 passes:** Marcus Rivera session auto-terminates at ~2:40 with warning at ~2:00
- [ ] Code is clean and includes comments explaining your logic
- [ ] TypeScript types are used properly (no `any` types)
- [ ] Warning only appears once per session (doesn't spam)
- [ ] Balance never goes negative

## What We're Evaluating

1. **Correctness** (40%) - Do all 3 scenarios work as described?
2. **Code Quality** (30%) - Is it clean, readable, well-organized?
3. **Understanding** (20%) - Did you understand the existing code and add to it properly?
4. **Logic** (10%) - Are your calculations accurate?

---

## How to Submit

Choose one of these options:

**Option 1: GitHub Repository**

- Fork or clone this repository
- Make your changes
- Push to a public GitHub repository
- Share the repository link with us

**Option 2: Modified Files**

- Make your changes locally
- Send us the file(s) you modified
- Include any new files you created

---

## Tips

- Explore the codebase to understand how it works
- Look for TODO comments if you need guidance
- The timer updates every second - that's your opportunity to check things
- Refresh the page to reset balance to 4.0 tokens between tests
- Use the console to debug if needed

## Questions?

If you encounter setup issues:

- Ensure Node.js 18+ is installed
- Check that port 19006 is available
- Try clearing cache: `npx expo start -c --web`

Good luck! 🚀
