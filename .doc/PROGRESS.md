# Progress Log — momoyo-ai

## 2026/02/22

### ✅ Phase 1 - Environment Setup
- Created the Next.js project (momoyo-ai)
- Created the GitHub repository and pushed
- Wrote README.md (English and Japanese)
- Wrote IMPLEMENTATION_PLAN.md
- Wrote AGENT.md
- Set up the Neon database (through Vercel)
- Added Prisma, defined the schema and ran the first migration (init)
- Added `lib/prisma.ts` (PrismaClient singleton)
- Added the `DATABASE_URL` environment variable on Vercel

### 🚧 Phase 2 - Profile Page UI (in progress)
- Changed `app/page.tsx` to a single scrolling page
- Added empty components for each section
  - Hero / About / Career / Skills / Works / Booking / Contact
- Added `app/api/profile/route.ts`
  - A GET endpoint that returns the Profile table from the database
  - Planned to be called from Vapi function calling

### 📝 Next
- Add the `/api/career` endpoint
- Add the `/api/skills` endpoint
- Load profile, career and skills data into the database
- Build the UI later with v0

---

## 2026/02/28

### ✅ Google Calendar booking: implementation and fixes

#### Booking component
- `components/booking.tsx` failed to build (old and new code were mixed together)
- Rewrote it as a 4-step UI (calendar → time slots → form → confirmation)

#### Availability API (`app/api/booking/availability/route.ts`)
- **Problem 1**: the `googleapis` package crashed in Vercel's serverless runtime (bundle too large)
  - Fix: removed `googleapis` and called the REST API directly, with JWT auth signed by Node.js `crypto`
- **Problem 2**: the time zone offset was hard-coded to `+11:00`
  - Fix: switch between AEST (+10:00) and AEDT (+11:00) by date
- **Problem 3**: no slots were shown when the API returned an error
  - Fix: return slots even when the Google Calendar API fails (all shown as available)

#### Create API (`app/api/booking/create/route.ts`)
- **Problem 1**: replaced the `googleapis` dependency with REST + JWT in the same way
- **Problem 2**: 403 error on the `attendees` field
  - Cause: on a free Google account, a service account can't invite other users
  - Fix: removed `attendees` and put the booker's details in the event description
- **Problem 3**: 403 Calendar error
  - Cause: the service account had no write access to the calendar, plus the `attendees` limit
  - Fix: granted "Make changes to events" in the calendar's sharing settings and removed attendees

#### Vercel environment variables
- `GOOGLE_PRIVATE_KEY`: Vercel warned about "whitespace and return characters" → fixed by pasting it as one line
- `GOOGLE_CALENDAR_ID`: typo in the variable name (missing `G`) → fixed and redeployed
- A redeploy is needed after changing environment variables (saving them is not enough)

#### Header navigation
- Added a "Booking" link to `navLinks` in `components/header.tsx`

### ✅ AI assistant: booking from chat and voice

#### Booking inside the chat
- "Book a meeting on March 10" in the chat → time slot buttons → pick a time → fill in the form → booked, all inside the chat
- Date parser: understands "March 10", "3/10", "3月10日", "next Tuesday", "tomorrow" and "明日"
- A date plus a question ("What's free on March 10?", "3月10日空いてる？") shows slots even without a booking keyword

#### Voice improvements
- **Shorter replies**: much shorter greeting and slot announcements (anything over 150 characters is cut)
- **Interrupting**: an "Interrupt" button lets the visitor speak while the AI is talking
- **Speaking speed**: 1.0 → 1.15×
- **Voice → chat handoff**: say a date → the AI reads a short list of slots → switches to the Chat tab → shows the slot picker
- **Dates by voice**: "March 10" and "next Friday" also work in voice

#### Chat API (`app/api/chat/route.ts`)
- Added booking detection rules to the system prompt (it outputs the `[BOOKING_LINK]` tag)
- Added booking keyword detection to the fallback function too

---

## Notes
- The UI will be designed with v0 (works well with Next.js + Tailwind)
- Prisma commands only work with `npx` (Windows)
- Windows temp folder permission errors were fixed with `$env:TEMP = "C:\Temp"`

### Open issue
- With Vapi function calling, the tool shows "Completed" but the LLM can't use the data
  - Likely cause: Vapi isn't passing the tool response to the LLM correctly
  - Tried: wrapping the response, changing the model, changing the system prompt
  - Next: try Custom Functions, or a webhook with Vapi's Server URL

## Troubleshooting Vercel deployments

### Problem 1: Duplicate identifier
- Cause: merging the v0 UI duplicated imports and components in components/ui/
- Fix: removed the duplicate blocks and imports in components/ui/

### Problem 2: Prisma client missing
- Cause: prisma/schema.prisma and the migrations were not committed
- Fix: ran `npx prisma generate` and added a postinstall script to package.json:
  `"postinstall": "prisma generate"`

### Problem 3: Missing libraries
- Cause: Radix and other libraries used by the v0 UI were not installed
- Fix: installed them, e.g. `npm install @radix-ui/react-accordion`

### Problem 4: Windows temp folder permission error
- Cause: shadcn couldn't access the Temp folder
- Fix: changed the temp folder with `$env:TEMP = "C:\Temp"` before running it

### Problem 5: googleapis crashed on Vercel serverless (2026/02/28)
- Cause: the `googleapis` package is huge and hits the serverless bundle size limit
- Fix: call the Google Calendar API directly over REST with a hand-signed JWT (Node.js crypto)

### Problem 6: Google Calendar API 403 error (2026/02/28)
- Cause 1: on a free Google account, a service account can't add `attendees`
- Cause 2: typo in the `GOOGLE_CALENDAR_ID` variable name
- Fix: removed `attendees` (booker details go in the description), fixed the variable name and redeployed

## 2026/11 — Portfolio refresh

- Added RAG: BM25 retrieval over bilingual passages, with the sources shown under each answer
- Added conversation memory (the browser sends recent turns; the server validates and limits them)
- Made `lib/profile-data.ts` the single source for the page, the AI and the MCP tools
- Removed a test email API that could send mail to any address
- Added a rate limit and a message length limit to the chat API
- Greetings and "what can you do?" now get a self-introduction instead of a refusal
- Added tests (`npm test`) and GitHub Actions
