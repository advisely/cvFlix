# Implementation Plan: Knowledge Consolidation & Platform Stabilization

## Current State
- `prisma/schema.prisma` is partially modified; legacy models (`Education`, `Skill`, `Certification`) were removed without completing the new `Knowledge` model integration, leaving compilation errors.
- Frontend (`src/app/page.tsx`, `src/components/*Card.tsx`) and API routes (`src/app/api/education/*`, `.../skills/*`, `.../certifications/*`) still depend on the old models.
- Seed script `prisma/seed.ts` and media relations are inconsistent with the desired unified structure.

## Objectives
1. Restore a working baseline to unblock development.
2. Introduce a unified `Knowledge` data model replacing Education/Skills/Certifications.
3. Update backend API routes, seed data, and uploads to match the new schema.
4. Refactor admin and public UI to consume the consolidated data source.
5. Verify functionality through automated checks and manual QA.

## Execution Roadmap

### Phase 0 – Baseline Recovery
- **Tasks**
  - Revert unintended edits in `prisma/schema.prisma`, `prisma/seed.ts`, and any other partially modified files (`git status` to confirm scope).
  - Ensure Next.js app builds and seeds succeed with the legacy schema.
- **Commands**
  - `git status`
  - `git restore prisma/schema.prisma prisma/seed.ts` *(or reset specific files via version control)*
  - `npm install` *(if dependencies changed)*
  - `npx prisma generate`
  - `npm run dev`
- **Risks & Mitigations**
  - *Risk*: Local changes outside Git may be lost. *Mitigation*: Backup files before restoring if manual edits must be inspected.
  - *Risk*: Database drift. *Mitigation*: Run `npx prisma migrate reset` after reverting schema to realign the SQLite database.

### Phase 1 – Schema & Seed Design
- **Tasks**
  - Define `Knowledge`, `KnowledgeKind`, and `KnowledgeLevel` in `prisma/schema.prisma`.
  - Update `Media` relations and remove `Education`, `Skill`, `Certification` models cleanly.
  - Draft Prisma migration (`npx prisma migrate dev --name knowledge-consolidation`).
  - Adapt `prisma/seed.ts` to populate the new model with education/skill/certification entries mapped to `kind` values.
- **Commands**
  - `npx prisma format`
  - `npx prisma migrate dev --name knowledge-consolidation`
  - `npx prisma db seed`
- **Risks & Mitigations**
  - *Risk*: Historical data loss. *Mitigation*: Export existing tables before dropping (`sqlite3 prisma/dev.db ".dump"`).
  - *Risk*: Migration conflicts. *Mitigation*: Ensure working tree clean before running migration; review generated SQL.

### Phase 2 – Backend Adaptation
- **Tasks**
  - Replace `/api/education`, `/api/skills`, `/api/certifications` with a unified `/api/knowledge` route supporting filtering by `kind`.
  - Update upload endpoints (`src/app/api/upload/*`) to store media under `knowledgeId`.
  - Refactor shared data fetcher `src/app/api/data/route.ts` and `src/app/api/aio-config/route.ts` to use the consolidated model.
  - Adjust TypeScript types (`src/types/*`, per-route DTOs) accordingly.
- **Commands**
  - `npm run lint`
  - `npm run test` *(if test suite exists)*
- **Risks & Mitigations**
  - *Risk*: Client code still calling removed endpoints. *Mitigation*: Provide temporary redirects or refactor all consumers in Phase 3.
  - *Risk*: Type mismatches. *Mitigation*: Introduce shared TS interfaces that mirror Prisma types via `@prisma/client`.

### Phase 3 – Frontend & Admin UI
- **Tasks**
  - Update admin pages (`src/app/boss/education/page.tsx`, `/boss/skills`, `/boss/certifications`) to a combined `src/app/boss/knowledge/page.tsx` with filtering tabs.
  - Replace cards (`EducationCard`, `SkillCard`, `CertificationCard`) with a generic `KnowledgeCard`; adjust carousels in `src/app/page.tsx`.
  - Update navigation labels from `NavbarConfig` to reference "Knowledge" and localized variants.
  - Ensure media modals and uploads support the new data structure.
- **Commands**
  - `npm run lint`
  - `npm run dev` *(manual QA)*
- **Risks & Mitigations**
  - *Risk*: UX regression. *Mitigation*: Snapshot existing layout before changes; validate after refactor.
  - *Risk*: Localization gaps. *Mitigation*: Maintain `titleFr`, `descriptionFr`, etc., and adjust `LanguageContext` selectors.

### Phase 4 – QA & Documentation
- **Tasks**
  - Run lint/tests and manual smoke tests (login, admin CRUD, homepage sections).
  - Capture screenshots or notes for regression evidence.
  - Update `CHANGELOG.md`, README (if necessary), and communicate credential bootstrap logic.
- **Commands**
  - `npm run lint`
  - `npm run test`
  - `npm run dev` *(manual verification)*
- **Risks & Mitigations**
  - *Risk*: Missed regression. *Mitigation*: Use a checklist covering all affected routes and flows.

## Dependencies & Coordination
- Ensure `.env` includes `DEFAULT_ADMIN_EMAIL` / `DEFAULT_ADMIN_PASSWORD` for bootstrap.
- Confirm no other branches depend on legacy endpoints before removing them.
- Coordinate database migration timing if deployed environments exist.

## Rollback Strategy
- Keep migration reversible by exporting DB before running changes.
- Retain old route files temporarily under `legacy/` directory in case staged rollback is needed.
- If frontend refactor fails, redeploy legacy pages using feature flags in `NavbarConfig` to toggle visibility.

## Communication Notes
- Document new knowledge taxonomy for stakeholders (e.g., allowed `KnowledgeKind` values).
- Provide admin instructions for managing unified entries once UI is updated.
