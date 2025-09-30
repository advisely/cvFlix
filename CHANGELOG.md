# Changelog

## Unreleased

### Summary
- Unified the admin experience around the Prisma `Knowledge` model and removed the legacy Education/Skills/Certifications flows.
- Added `/boss/knowledge` management UI with media uploads backed by `/api/knowledge` and `/api/upload/knowledge`.
- Refreshed homepage cards, shared utilities, and documentation to reflect the Knowledge taxonomy.

### Deliverables & Status
- **Knowledge API & Uploads**: `/api/knowledge` and `/api/upload/knowledge` now power all consolidated CRUD. *(Completed)*
- **Admin UI**: New `src/app/boss/knowledge/page.tsx` replaces the three legacy sections; sidebar updated. *(Completed)*
- **Public UI & Cards**: Homepage and card components consume the Knowledge response without `any` escapes. *(Completed)*
- **Docs**: `README.md`, `PLAN.md`, and `CHANGELOG.md` updated for the unified model rollout. *(Completed)*

### Considerations / Blockers
- Validate media migrations for existing deployments; ensure historical assets are linked to the new `knowledgeId` column.
- Audit third-party integrations (e.g., SEO generators) for any cached references to removed endpoints before deployment.

### Verification Checklist
1. `npx prisma migrate deploy`
2. `npm run lint`
3. `npm run build`
4. Manual QA: `/boss/knowledge` CRUD, media upload, homepage Knowledge section.

### Notes
- Use `PLAN.md` for remaining polish items (responsive tweaks, QA scenarios) prior to release tagging.
