# Changelog

Version numbers follow `x.y.z` where **x = major features**, **y = enhancements**, and **z = bug fixes / stability**.

## v6.0.0 · 2025-10-01
### Summary
- Added Contributions and Recommended Books modules across admin and public experiences.
- Introduced Vitest configuration, setup files, and homepage regression coverage.
- Updated homepage ordering to align with admin priorities.

### Key Changes
- **APIs**: `/api/contributions`, `/api/recommended-books`, and contribution detail routes.
- **Admin UI**: `src/app/boss/contributions/page.tsx` & `src/app/boss/recommended-books/page.tsx` with media gallery integration.
- **Public UI**: Contributions carousel, recommended books carousel, and modal bindings on `src/app/page.tsx`.
- **Components**: New `ContributionCard`, extended skeleton loaders, and localized content rendering.

### Verification Checklist
1. `npx prisma migrate deploy`
2. `npm run test`
3. Manual QA: `/boss/contributions`, `/boss/recommended-books`, homepage ordering & modals.

## v5.1.1 · 2025-09-30
### Summary
- Fixed highlight media upload endpoint usage and modal lifecycle issues.

### Key Changes
- Patched highlights admin page to point at the correct upload route.
- Improved modal destruction behaviour to prevent data loss and interaction glitches.

### Verification Checklist
1. Manual QA: `/boss/highlights` create/edit/delete flows.

## v5.1.0 · 2025-09-30
### Summary
- Enhanced Knowledge API with media support and structured data validation improvements.

### Key Changes
- Connected knowledge entries to media galleries and homepage assets.
- Hardened SEO structured data generation for Knowledge-driven content.

### Verification Checklist
1. `npm run lint`
2. `npm run build`
3. Manual QA: `/boss/knowledge` media attachment flows.

## v5.0.0 · 2025-09-30
### Summary
- Unified Education, Skills, and Certifications into the new Knowledge model with consolidated admin tooling.

### Key Changes
- Replaced legacy CRUD routes with `/api/knowledge` and `/api/upload/knowledge`.
- Delivered the Knowledge admin page with segmented filtering and multilingual fields.
- Updated homepage cards to consume the Knowledge schema end-to-end.

### Verification Checklist
1. `npx prisma migrate deploy`
2. Manual QA: `/boss/knowledge` CRUD, homepage Knowledge section.

## v4.2.0 · 2025-08-27
### Summary
- Shipped comprehensive upload error handling, localization upgrades, and UI polish for Experience & Highlight cards.

### Key Changes
- Added multilingual upload error handling hooks and surfaced messaging in admin forms.
- Refined experience/highlight layouts with cleaner date displays and localization fields.
- Added AVIF media validation and tightened dropdown responsiveness.

## v4.1.0 · 2025-08-18
### Summary
- Expanded operational tooling with the AIO configuration page, floating card performance tuning, and media management enhancements.

### Key Changes
- Introduced `/boss/aio` management for AI datasets and llm.txt.
- Optimized floating highlight/experience cards and media loading behaviour.
- Delivered the Media Management page with CRUD capabilities.

## v4.0.0 · 2025-08-03
### Summary
- Added Highlights management, footer configuration, and project documentation refresh.

### Key Changes
- Highlights CRUD page, footer configuration model/API/components, and expanded docs in `/docs`.
- Media cleanup utilities and scripts for blob URL maintenance.

## v3.0.0 · 2025-07-31
### Summary
- Delivered the Netflix-inspired public interface, client-side data hydration, and advanced media tooling.

### Key Changes
- Added Netflix-style UI components, responsive carousels, and skeleton loaders.
- Moved homepage fetching to client-side with resilient loading states.
- Created media management scripts and APIs for asset cleanup.

## v2.0.0 · 2025-07-30
### Summary
- Established the admin appearance customization suite and initial Ant Design integration.

### Key Changes
- Added appearance page with AntD registry integration and customizable theming.
- Introduced language switcher foundations for future localization work.

## v1.0.0 · 2025-07-30
### Summary
- Initial release with authentication, admin panel scaffolding, and migration to SQLite via Prisma.

### Key Changes
- Implemented authentication, admin layout, and CRUD foundations.
- Migrated persistence from Supabase to SQLite with Prisma migrations.
- Seeded baseline data and set up appearance configuration primitives.
