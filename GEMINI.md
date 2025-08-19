# Project Plan: cvFlix

## 1. Initial Project Summary (Completed)

### Objective
The initial objective was to build a complete, Netflix-inspired resume portfolio. This involved replacing Supabase with a local SQLite database, implementing secure admin authentication with NextAuth.js, building out full CRUD functionality for all content sections in a dedicated admin panel, and creating a responsive, Netflix-style public interface.

### Key Accomplishments
-   **Database Migration**: Successfully migrated from Supabase to SQLite with Prisma ORM.
-   **Secure Authentication**: Implemented a secure admin panel using NextAuth.js and `bcryptjs`.
-   **Full-Featured Admin Panel**: Delivered complete CRUD functionality for Experiences, Education, Certifications, Skills, Highlights, and Appearance Customization using Ant Design.
-   **Netflix-Style Frontend**: Built the public interface using Next.js, Tailwind CSS, and Embla Carousel to create a responsive, dark-themed, and interactive user experience.
-   **Comprehensive Media Management**: Integrated a system for uploading and associating media with all relevant content types.

### Initial Project Status: ✅ COMPLETED
The foundational cvFlix application was successfully completed, delivering a robust and fully functional portfolio platform.

---

## 2. Project: Highlights Enhancement (Completed)

This project transformed the "Highlights" section into a comprehensive professional experience management platform.

### Mission Statement
To evolve the highlights management system from basic text/image editing into a sophisticated showcase of professional experiences, featuring an enhanced UI/UX with floating cards and advanced media capabilities.

### Key Enhancements Delivered
-   **Floating Card Interface**: Implemented a modern, interactive UI where clicking a highlight reveals a floating card with detailed information, shadow effects, and smooth animations (`FloatingHighlightCard.tsx`).
-   **Expanded Data Model**: Enhanced the `Highlight` model to include a rich `description` field and distinct media associations for the homepage, the popup card, and the general gallery.
-   **Advanced Media Display**: Integrated image and video playback directly within the floating card.
-   **Professional Presentation**: Upgraded the admin panel to manage the new description field and the three distinct media types.

### Project Status: ✅ COMPLETED

---

## 3. Current Project: Experiences Enhancement

### Mission Statement
To upgrade the "Experiences" section to match the sophisticated functionality of "Highlights," creating a consistent and professional user experience across the portfolio. This involves implementing a floating card interface, detailed descriptions, and advanced media handling for each work experience.

### Audit Findings
- The `Experience` model in the database already includes a `description` field.
- The admin panel for Experiences allows for editing this `description`.
- However, the public-facing frontend currently displays Experiences using a simple `MovieCard` component that is not clickable and does not show the description or any advanced media.

### Proposed Enhancements
-   **Floating Card for Experiences**: Create a new `FloatingExperienceCard.tsx` component that displays the full details of an experience, including its description and associated media.
-   **Update Experience Card**: Modify the existing `MovieCard.tsx` (or create a new `ExperienceCard.tsx`) to trigger the floating card on click.
-   **Enhance Data Model**: Update the `Experience` model in `schema.prisma` to support distinct media types for the homepage and the floating card, similar to the `Highlight` model.
-   **Upgrade Admin UI**: Revise the Experiences admin page to allow separate media uploads for the homepage and the floating card.
-   **Update API**: Modify the backend API endpoints for Experiences to handle the new media associations.

### Project Status: 🟡 NOT STARTED

---

## 4. Core Technology & Architecture

The application is built on a modern, robust technology stack:

-   **Frontend**: **Next.js 15** with **React 19** and **TypeScript**.
-   **UI (Public)**: **Tailwind CSS v4** and **Embla Carousel**.
-   **UI (Admin)**: **Ant Design v5**.
-   **Backend**: **Next.js API Routes** with the **Prisma ORM**.
-   **Database**: **SQLite**.
-   **Authentication**: **NextAuth.js v4**.

The project follows a standard Next.js app directory structure, with a clear separation between the public-facing application (`src/app`), the admin panel (`src/app/boss`), shared components (`src/components`), and backend logic (`src/app/api`).
