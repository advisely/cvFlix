# Implementation Plan: Knowledge Model Rollout (Post-Consolidation)

## Current State
- Prisma schema, migrations, and seed data now persist the unified `Knowledge` model with `KnowledgeKind` and `KnowledgeLevel` enums.
- Legacy `/api/education`, `/api/skills`, and `/api/certifications` routes have been removed in favour of `/api/knowledge` and `/api/upload/knowledge`.
- Admin sidebar points to the new `/boss/knowledge` page, delivering CRUD and media management across all knowledge types.
- Homepage cards (`EducationCard`, `CertificationCard`, `SkillCard`) consume the consolidated API response without `any` casts.

## Objectives
1. Harden the new Knowledge workflows through QA, data migration checks, and analytics.
2. Polish the UX (responsiveness, localization, and theming) to match the refreshed taxonomy.
3. Finalize documentation, operational runbooks, and deployment guidance for the Knowledge-centric release.

## Execution Roadmap

### Phase 1 – QA & Data Validation
- **Tasks**
  - Exercise CRUD flows on `/boss/knowledge`, including media uploads and filtering by `KnowledgeKind`.
  - Validate SEO and sitemap utilities (`src/app/api/seo/structured-data/generate/route.ts`, `src/components/seo/utils/sitemap-utils.ts`) now that they source `Knowledge` entries.
  - Audit production/staging databases to confirm historical Education/Skill/Certification rows were migrated into `Knowledge`.
- **Commands / Checks**
  - `npm run lint`
  - `npm run build`
  - Manual QA checklist (admin CRUD, homepage render, structured data generator).
- **Risks & Mitigations**
  - *Risk*: orphaned media references. *Mitigation*: run reports against `Media` where `knowledgeId` is null and re-associate as needed.
  - *Risk*: cached clients still calling removed endpoints. *Mitigation*: add HTTP 410 responses or redirects if required.

### Phase 2 – UX & Localization Polish
- **Tasks**
  - Review responsive layouts for the Knowledge table and modal; adjust columns and segmented filters for mobile.
  - Ensure translations exist for new labels (`Knowledge`, enum variants) in `LanguageContext` and UI copy.
  - Align theming (colors, icons) so Knowledge entries feel consistent with other sections.
- **Commands / Checks**
  - `npm run dev` + device toolbar inspection.
  - Localization diff audit.
- **Risks & Mitigations**
  - *Risk*: segmented control overflow on small screens. *Mitigation*: collapse into dropdown when viewport < 768px.

### Phase 3 – Deployment Readiness & Docs
- **Tasks**
  - Prepare release notes capturing Knowledge rollout, media handling changes, and admin UI updates.
  - Update customer-facing documentation/screenshots in `/docs` as needed (API docs, admin guide).
  - Coordinate rollout timeline and communicate migration expectations to stakeholders.
- **Commands / Checks**
  - `npm run build`
  - `npx prisma migrate deploy`
  - Proofread docs (`README.md`, `CHANGELOG.md`, `docs/*`).
- **Risks & Mitigations**
  - *Risk*: overlooked documentation references to removed endpoints. *Mitigation*: global search for `/api/education`, `/boss/education`, etc., prior to release.

## Dependencies & Coordination
- Confirm environments have applied the latest Prisma migrations (`npx prisma migrate deploy`).
- Coordinate with design/content teams for updated copy around certifications/awards inside Knowledge.
- Ensure support/QA teams receive the new admin workflow guide.

## Rollback Strategy
- Preserve the last deployment snapshot prior to Knowledge rollout.
- Maintain migration SQL backups; a rollback would involve restoring the database snapshot and redeploying the pre-Knowledge build.
- Feature-flag approach: consider gating the Knowledge UI via configuration to revert to read-only mode if issues arise.

## Communication Notes
- Share the Knowledge taxonomy (Education, Certification, Skill, Course, Award) with stakeholders.
- Provide admin training on filtering, media management, and the new segmented control.
- Highlight API contract changes for any external consumers.
