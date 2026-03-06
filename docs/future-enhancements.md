# Future Enhancements

_Last updated: 2026-02-23_

## 1) Purpose

This document tracks high-value future improvements for LearnHub.
It is organized to help planning by horizon, impact, and implementation effort.

---

## 2) Prioritization Legend

- **P0**: Critical foundation/production blockers
- **P1**: High-value product improvements
- **P2**: Quality and scale improvements
- **P3**: Nice-to-have enhancements

---

## 3) Near-Term Roadmap (0–4 weeks)

### P0 — Stabilization and correctness

1. **Add missing unauthorized page**
   - Create `/unauthorized` route used by middleware.
   - Provide role-aware navigation back to safe pages.

2. **Implement missing Prisma seed script**
   - Add `prisma/seed.ts` matching `prisma.config.ts`.
   - Support deterministic local setup for contributors.

3. **Fix stale route references**
   - Replace `/saved-courses` usage with `/saved`.
   - Update chat FAQ references to actual auth flow/routes.

4. **Environment bootstrap validation**
   - Add startup checks for required env vars.
   - Fail early with actionable error messages.

### P1 — Core UX improvements

5. **Course search performance upgrades**
   - Add indexed search strategy for title/category filtering.
   - Support pagination or incremental loading in large catalogs.

6. **Admin bulk actions**
   - Multi-select delete/archive for users/courses.
   - Add guardrails and confirmation summaries.

---

## 4) Mid-Term Roadmap (1–3 months)

### P1 — Product capabilities

1. **Course drafts and scheduling**
   - Schedule publish/unpublish windows.
   - Add draft preview links for admins.

2. **Lesson attachments and resources**
   - Support downloadable PDFs and supplemental files.
   - Track resource interactions by learner.

3. **Richer progress analytics**
   - Per-lesson drop-off analysis.
   - Time-to-completion and cohort comparisons.

4. **Notifications system**
   - In-app notifications for course updates.
   - Optional email summaries for enrolled students.

### P2 — Platform quality

5. **Structured API contracts**
   - Add `docs/api-contracts.md` with request/response schemas.
   - Standardize validation and error object shapes.

6. **Observability baseline**
   - Add request logging with correlation IDs.
   - Track auth errors, DB errors, and AI provider failures.

7. **Rate limiting for API routes**
   - Protect `/api/chat` and auth-sensitive endpoints.
   - Add per-IP/per-session throttling policies.

---

## 5) Long-Term Roadmap (3+ months)

### P2/P3 — Scale and ecosystem

1. **Multi-tenant institution support**
   - Isolate users/courses by organization.
   - Configure per-tenant auth domain and branding.

2. **Content versioning**
   - Keep historical lesson/course versions.
   - Roll back content safely.

3. **Advanced AI learning assistant**
   - Course-context retrieval (RAG) from lesson content.
   - Personalized recommendations based on progress.

4. **Mobile app/API readiness**
   - Prepare stable API boundaries for external clients.
   - Add token strategy and client versioning.

---

## 6) Security and Compliance Backlog

1. **RBAC hardening**
   - Centralize role checks in reusable guards.
   - Add automated tests for access boundaries.

2. **Audit logging**
   - Record admin actions (role changes, course deletes, publishes).
   - Include actor, target, timestamp, and diff summary.

3. **Secrets and key rotation policy**
   - Document rotation process for OAuth and AI provider keys.
   - Add operational runbook for incident response.

---

## 7) Performance Backlog

1. **Caching strategy**
   - Review `revalidatePath` granularity.
   - Introduce selective caching for course reads.

2. **Database index review**
   - Add/validate indexes for frequent filters and joins.
   - Benchmark enrollments/progress queries.

3. **Frontend bundle optimization**
   - Lazy-load heavy admin and chart modules.
   - Audit third-party package impact.

---

## 8) Developer Experience Backlog

1. **Testing foundation**
   - Add unit tests for critical server actions.
   - Add integration tests for auth, enroll, and progress flows.

2. **CI pipeline**
   - Run lint, type-check, and tests on pull requests.
   - Enforce migration consistency checks.

3. **Contribution standards**
   - Add coding guidelines and PR checklist.
   - Define migration, docs, and release requirements.

---

## 9) Suggested Execution Order

1. P0 stabilization items
2. P1 UX and product improvements
3. Observability + security baseline
4. Performance and scale enhancements

---

## 10) Update Policy

When an item is implemented:
- Move it to a changelog/release note.
- Add links to PRs/issues.
- Reassess remaining priorities based on usage data.
