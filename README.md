# LearnHub — Online Course Platform

LearnHub is a school-focused online learning platform where students can browse courses, enroll, track lesson progress, and save courses, while admins manage users and course content.

## Documentation

- Development guide: `docs/development.md`
- Integration guide: `docs/integration.md`
- Requirements: `docs/requirements.md`
- System design notes: `docs/system-design.md`

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Add environment variables in `.env.local` (see `docs/development.md`).

3. Run the app:

```bash
npm run dev
```

App URL: `http://localhost:3000`

## Scripts

- `npm run dev` — start local dev server
- `npm run build` — production build
- `npm run start` — run production server
- `npm run lint` — lint the project

## Tech Stack

- Next.js App Router + React + TypeScript
- Prisma + PostgreSQL
- NextAuth (Google OAuth)
- Tailwind + shadcn UI
