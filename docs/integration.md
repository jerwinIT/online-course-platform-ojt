# Integration Documentation

_Last updated: 2026-02-23_

## 1) Purpose

This document describes all runtime integrations in LearnHub and how they connect:
- Authentication (Google + NextAuth + Prisma)
- Database (Prisma + PostgreSQL)
- AI chat providers (Groq/Gemini/OpenAI + FAQ fallback)
- Next.js middleware authorization
- Static media domain integration

---

## 2) Integration Map

### External services
- Google OAuth (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
- PostgreSQL database (`DATABASE_URL`)
- AI providers (one or more):
  - Groq (`GROQ_API_KEY`)
  - Gemini (`GEMINI_API_KEY` or `GOOGLE_GENERATIVE_AI_API_KEY`)
  - OpenAI (`OPENAI_API_KEY`)

### Internal integration points
- Auth configuration: `lib/auth.ts`
- Auth route bridge: `app/api/auth/[...nextauth]/route.ts`
- Admin guard middleware: `middleware.ts`
- Prisma client adapter: `lib/prisma.ts`
- Prisma runtime config: `prisma.config.ts`
- AI streaming API: `app/api/chat/route.ts`
- AI fallback FAQ API: `app/api/chat-faq/route.ts`
- Chat UI client: `components/chat/landing-chat.tsx`
- Image domain config: `next.config.ts`

---

## 3) Environment Variable Contract

Create `.env.local` with:

```env
# Core
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# AI providers (optional but recommended)
GROQ_API_KEY=""
GEMINI_API_KEY=""
GOOGLE_GENERATIVE_AI_API_KEY=""
OPENAI_API_KEY=""
```

Rules:
- `DATABASE_URL` is required for Prisma runtime and migrations.
- `NEXTAUTH_SECRET` must be present and match middleware JWT decoding.
- AI chat requires at least one provider key to use `/api/chat`.
- If no AI key is available, chat should fall back to `/api/chat-faq` from UI.

---

## 4) Auth Integration (Google + NextAuth + Prisma)

### Request path
1. Client triggers `signIn("google")` from UI.
2. NextAuth route (`/api/auth/[...nextauth]`) handles OAuth flow.
3. NextAuth uses `PrismaAdapter(prisma)` to persist user/session/account records.
4. `signIn` callback in `lib/auth.ts` enforces school domain.
5. `jwt` callback attaches user id + role to token.
6. `session` callback exposes id + role to client session object.

### Domain enforcement
- UI hint uses Google `hd` parameter (`g.batstate-u.edu.ph`).
- Hard enforcement is done in `signIn` callback by checking email domain.
- Only allowed domain signs in successfully.

### Critical dependencies
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `DATABASE_URL`

---

## 5) Admin Authorization Integration (Middleware)

### Protected scope
- Middleware matcher: `/admin/:path*`

### Flow
1. Middleware reads token via `getToken` from `next-auth/jwt`.
2. Token decode depends on `NEXTAUTH_SECRET`.
3. If no token: redirect to `/`.
4. If token role is not `ADMIN`: redirect to `/unauthorized`.
5. Otherwise: request continues.

### Notes
- The route `/unauthorized` is currently referenced but not present in app routes.
- If secret is missing/mismatched, all admin requests behave as unauthenticated.

---

## 6) Database Integration (Prisma + PostgreSQL)

### Runtime setup
- `lib/prisma.ts` creates `PrismaPg` adapter using `DATABASE_URL`.
- Prisma client import path: `@/generated/prisma/client`.
- In non-production, client is cached globally to avoid hot-reload reconnect storms.

### Migration/config setup
- `prisma.config.ts` reads env from dotenv and sets:
  - schema path: `prisma/schema.prisma`
  - migration path: `prisma/migrations`
  - seed command: `tsx prisma/seed.ts`

### Commands
```bash
npx prisma migrate dev --name <change_name>
npx prisma generate
npx prisma migrate status
```

### Integration warning
- `prisma.config.ts` references `prisma/seed.ts`, but that file is currently missing.

---

## 7) AI Chat Integration

### Primary streaming endpoint
- Route: `/api/chat` (`POST`)
- Request: `{ messages: UIMessage[] }`
- Response: streaming UI message response via Vercel AI SDK

### Provider selection order
1. Groq (`GROQ_API_KEY`) → `llama-3.3-70b-versatile`
2. Gemini (`GEMINI_API_KEY` or `GOOGLE_GENERATIVE_AI_API_KEY`) → `gemini-2.0-flash`
3. OpenAI (`OPENAI_API_KEY`) → `gpt-4o-mini`
4. No provider configured → `503` with `code: "NO_PROVIDER"`

### Fallback integration
- Chat UI detects provider/quota/config errors.
- UI can switch to simple mode and call `/api/chat-faq`.
- `/api/chat-faq` returns keyword-based canned responses.

### Operational behavior
- `/api/chat` requires provider key(s).
- `/api/chat-faq` works without provider keys.

---

## 8) Static Media Integration

Configured image domains in `next.config.ts`:
- `lh3.googleusercontent.com` (Google profile images)
- `cdn.example.com`
- `images.unsplash.com`

If a remote image source is missing from this list, Next.js image rendering will fail for that source.

---

## 9) Integration Verification Checklist

### Auth
- [ ] Google sign-in opens provider and returns to app
- [ ] Non-school domain account is rejected
- [ ] Session contains `user.id` and `user.role`
- [ ] Admin user can access `/admin`
- [ ] Non-admin is redirected from `/admin`

### Database
- [ ] App starts with valid `DATABASE_URL`
- [ ] `npx prisma generate` succeeds
- [ ] `npx prisma migrate status` succeeds

### AI Chat
- [ ] `/api/chat` returns streaming response with at least one provider key
- [ ] Without provider keys, `/api/chat` returns 503 + `NO_PROVIDER`
- [ ] UI can switch to FAQ mode and receive `/api/chat-faq` replies

### Images
- [ ] Google avatar images load correctly from `lh3.googleusercontent.com`

---

## 10) Common Integration Failures

### `401/redirect loops` on admin routes
- Check `NEXTAUTH_SECRET` is present and consistent.
- Confirm user role in DB is `ADMIN`.

### `No AI provider configured`
- Add one of: `GROQ_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`.

### Prisma runtime errors at startup
- Verify `DATABASE_URL` format and connectivity.
- Re-run `npx prisma generate`.

### OAuth works but user blocked
- Expected for non-`g.batstate-u.edu.ph` emails due to hard domain enforcement.

---

## 11) Integration Change Guidelines

When changing integrations:
1. Update this file (`docs/integration.md`).
2. Update setup instructions in `docs/development.md` if env/commands changed.
3. If docs file names move, update links in `README.md`.
4. Re-test checklist in Section 9 before merging.
