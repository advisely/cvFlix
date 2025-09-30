# Changelog

## Unreleased

### Summary
- Documented remediation path after partial consolidation of Education/Skills/Certifications into a unified Knowledge model.
- Captured corrective actions required to restore schema integrity and proceed with the redesign.

### Deliverables & Status
- **PLAN.md**: Comprehensive execution roadmap covering baseline recovery through full Knowledge model rollout. *(Completed)*
- **CHANGELOG.md**: Tracks current remediation status and future milestones. *(Completed)*
- **Baseline Restoration**: Pending; schema and seed scripts must be reverted before new work begins. *(Pending)*
- **Knowledge Model Migration**: Planned; awaiting Phase 1 tasks from `PLAN.md`. *(Planned)*
- **API/UI Refactor**: Pending backend completion. *(Planned)*

### Considerations / Blockers
- **Schema corruption**: `prisma/schema.prisma` currently invalid; all subsequent Prisma commands will fail until reverted. *Action*: execute `git restore prisma/schema.prisma prisma/seed.ts` or reapply clean schema definitions.
- **Database alignment**: Once schema is fixed, run `npx prisma migrate reset --skip-generate --skip-seed` to realign `prisma/dev.db` with the restored baseline before new migrations.
- **Bootstrap admin**: Ensure `.env` includes `DEFAULT_ADMIN_EMAIL`/`DEFAULT_ADMIN_PASSWORD` for automatic admin provisioning in `src/lib/auth.ts`.

### Next Commands Checklist
1. `git status`
2. `git restore prisma/schema.prisma prisma/seed.ts`
3. `npx prisma migrate reset --skip-generate --skip-seed`
4. `npx prisma generate`
5. `npx prisma db seed`
6. `npm run dev`

### Notes
- Execute the roadmap in `PLAN.md` sequentially; do not begin Phase 1 until baseline recovery confirms successful `npm run dev` and `npx prisma db seed`.
