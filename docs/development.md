# Development Documentation

_Last updated: 2026-02-23_

## 1) Project Overview

LearnHub is a school-focused online course platform built with Next.js App Router.

### Core capabilities
- Student login via Google (school domain restricted)
- Browse published courses and categories
- Enroll in courses and track lesson completion
- Save/bookmark courses
- Student dashboard with progress and certificates
- Admin dashboard for user and course management
- AI chat assistant with provider fallback (Groq/Gemini/OpenAI + FAQ fallback)

---

## 2) Tech Stack

### Frontend + runtime
- Next.js `16.1.6` (App Router)
- React `19.2.3`
- TypeScript `5.x`
- Tailwind CSS `4`
- Radix/shadcn UI components

### Auth + data
- NextAuth `4.24.x`
- Prisma `7.3.x`
- PostgreSQL (`@prisma/adapter-pg` + `pg`)

### AI integration
- Vercel AI SDK (`ai`, `@ai-sdk/react`)
- Providers: `@ai-sdk/groq`, `@ai-sdk/google`, `@ai-sdk/openai`

---

## 3) Architecture (Current Implementation)

### App architecture
- App Router pages under `app/`
- Server Actions under `server/actions/` (primary business logic)
- Minimal REST endpoints under `app/api/`
- Shared Prisma client in `lib/prisma.ts`
- NextAuth options in `lib/auth.ts`

### Access control
- Middleware protects `/admin/**` and checks JWT role (`ADMIN`)
- Student/admin routing is decided in UI + server actions
- Server actions generally re-check authentication/authorization

### Data flow pattern
1. Page loads server component
2. Data fetched through server action(s)
3. Client components perform user actions (enroll, save, update)
4. Server actions mutate DB and call `revalidatePath(...)`

---

## 4) Main Directory Guide

- `app/` — routes and API handlers
- `components/contents/` — page-level UI containers
- `components/ui/` — reusable UI primitives
- `components/chat/` — chat widget UI
- `server/actions/` — business logic and DB operations
- `lib/` — auth, prisma singleton, utility helpers
- `prisma/schema.prisma` — data model
- `prisma/migrations/` — migration history
- `generated/prisma/` — Prisma client output (`provider = prisma-client`)
- `docs/` — requirements, system design, development docs

---

## 5) Route Inventory

### Pages
- `/` — landing page + featured courses + categories + chat launcher
- `/courses` — published course catalog
- `/courses/[id]` — course details, enroll, progress
- `/courses/[id]/lessons/[lessonId]` — lesson player (enrolled users)
- `/saved` — user saved courses
- `/dashboard` — student dashboard
- `/admin` — admin dashboard
- `/admin/courses/new` — create course
- `/admin/courses/[id]/edit` — edit/delete course

### API routes
- `/api/auth/[...nextauth]` — NextAuth handler
- `/api/categories` — category list (GET)
- `/api/chat` — AI streaming chat (POST)
- `/api/chat-faq` — no-API-key FAQ fallback (POST)

---

## 6) Server Actions Map

### Auth/session
- `server/actions/getSession.ts`
- `server/actions/auth.ts` (sign-up helper currently creates DB user only)

### Courses and categories
- `server/actions/course.ts`
  - create/update/delete/publish course
  - create/delete/get categories
  - get published courses

### Course detail + learning
- `server/actions/courseDetail.ts`
  - fetch course detail view state
  - enroll user
  - toggle lesson completion

### Lesson player
- `server/actions/lessonPlayer.ts`
  - fetch lesson player context
  - toggle completion from player

### Saved courses
- `server/actions/savedCourse.ts`
  - toggle save
  - check saved
  - list saved courses

### Dashboard and admin analytics
- `server/actions/dashboard.ts`
- `server/actions/dashboard-stat.ts`
- `server/actions/chart-stats.ts`

### User admin
- `server/actions/user.ts`
  - delete user
  - change role

---

## 7) Authentication & Authorization

### Authentication
- Provider: Google OAuth (NextAuth)
- Domain enforcement in `lib/auth.ts`:
  - only `@g.batstate-u.edu.ph` is accepted at sign-in callback level
- Session strategy: JWT

### Authorization
- Middleware protects `/admin/:path*`
- `token.role` checked for `ADMIN`
- Many server actions also enforce role/ownership checks

### Role model
- `Role` enum in Prisma: `STUDENT`, `ADMIN`

---

## 8) Data Model Summary (Prisma)

### Core entities
- `User` (with role, sessions, accounts, saved courses)
- `Category`
- `Course`
- `Section`
- `Lesson`
- `Enrollment`
- `Progress`
- `CourseRating`
- `SavedCourse`

### Important relations
- Course belongs to Category and Admin creator
- Course has many Sections, Section has many Lessons
- Enrollment is unique per `(userId, courseId)`
- Progress is unique per `(userId, lessonId)`
- Rating is unique per `(userId, courseId)`
- SavedCourse is unique per `(userId, courseId)`

---

## 9) Environment Variables

Create `.env.local` with at least:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Optional AI providers (at least one for /api/chat)
GROQ_API_KEY=""
GEMINI_API_KEY=""
GOOGLE_GENERATIVE_AI_API_KEY=""
OPENAI_API_KEY=""
```

Notes:
- `DATABASE_URL` is required by Prisma adapter and migrations.
- `/api/chat` selects provider priority: Groq → Gemini → OpenAI.
- Without provider keys, the app can still use FAQ fallback via `/api/chat-faq`.

---

## 10) Local Development Setup

### Prerequisites
- Node.js 20+
- npm 10+
- PostgreSQL database

### Install and run
```bash
npm install
npm run dev
```

Open: `http://localhost:3000`

### Build/lint
```bash
npm run lint
npm run build
npm run start
```

---

## 11) Database Workflow

### Generate/apply migrations
```bash
npx prisma migrate dev --name <change_name>
```

### Regenerate Prisma client
```bash
npx prisma generate
```

### Migration status
```bash
npx prisma migrate status
```

### Reset local database
```bash
npx prisma migrate reset
```

---

## 12) Current Known Gaps / Inconsistencies

These were found by comparing current code paths and routes:

1. `prisma.config.ts` references seed script `tsx prisma/seed.ts`, but `prisma/seed.ts` is missing.
2. Middleware redirects non-admin users to `/unauthorized`, but this page route is not present.
3. Some stale path references still mention `/saved-courses`; active page route is `/saved`.
4. Chat FAQ copy references `/auth/login` and `/auth/signup`, but no corresponding `app/auth/**` routes exist in this workspace.
5. Keep this document as the source of truth when adding routes/actions, and update `README.md` links if documentation files are reorganized.

---

## 13) Recommended Development Workflow

1. Create/update feature logic in `server/actions/*` first.
2. Wire page-level server components in `app/**/page.tsx`.
3. Keep client-side interactivity in `components/contents/*` and `components/*`.
4. Revalidate affected routes after mutations using `revalidatePath`.
5. Run `npm run lint` and test critical flows:
   - sign in
   - browse courses
   - enroll
   - lesson progress
   - dashboard
   - admin course/user actions

---

## 14) Quick Troubleshooting

### Admin redirects unexpectedly
- Verify `NEXTAUTH_SECRET` exists and is identical across auth + middleware.
- Confirm user `role` in database is `ADMIN`.

### Prisma type/delegate mismatch
- Run `npx prisma generate`.
- Restart dev server after schema changes.

### Chat API unavailable
- Add at least one provider key (`GROQ_API_KEY`, `GEMINI_API_KEY`, or `OPENAI_API_KEY`).
- Use FAQ fallback in UI when quota/config errors occur.

---

## 15) Suggested Next Documentation Files

- `docs/api-contracts.md` — stable action/API payloads
- `docs/deployment.md` — production env/deploy checklist
- `docs/testing.md` — test plan for student/admin flows
