# Project Plan: cvFlix

This document outlines the comprehensive project plan for building cvFlix, a Netflix-inspired resume portfolio.

**Project Vision:** To create a visually compelling, modern, and interactive web application that presents a professional resume in the style of the Netflix user interface. The platform will be content-manageable through a secure admin panel, ensuring the portfolio remains up-to-date without requiring code changes.

---

## 1. Solution & Software Architecture

As the **Solution Architect**, my focus is on selecting the right technologies and designing a scalable, maintainable, and robust architecture that meets all project requirements.

### Technology Stack

*   **Frontend (Public & Admin):** **React** with **Next.js**.
    *   **Reasoning:** Next.js provides an excellent developer experience, server-side rendering (SSR) for fast page loads and SEO benefits, and a unified framework for both the public-facing site and the backend API.
*   **UI Framework (Public):** **Tailwind CSS**.
    *   **Reasoning:** To achieve the unique, custom look of Netflix, a utility-first CSS framework like Tailwind is ideal. It allows for rapid development of bespoke designs without being constrained by pre-defined components. We will use a carousel library like `embla-carousel-react` for the "rows".
*   **UI Framework (Admin):** **Ant Design**.
    *   **Reasoning:** As specified, Ant Design will be used for the `/boss` admin panel. It offers a rich set of high-quality, pre-built components, perfect for building a data-intensive and functional admin interface quickly.
*   **Backend:** **Next.js API Routes** with **Prisma ORM**.
    *   **Reasoning:** Leveraging Next.js API routes keeps the entire application within a single, cohesive monorepo. Prisma provides a type-safe database client that simplifies interactions with the database and accelerates backend development.
*   **Database:** **PostgreSQL**.
    *   **Reasoning:** A powerful, open-source, and reliable relational database that can handle the structured data of a resume effectively and scale if needed in the future.
*   **Authentication:** **NextAuth.js**.
    *   **Reasoning:** A complete open-source authentication solution for Next.js applications. It will be used to secure the `/boss` admin panel with a simple username and password (Credentials Provider).

### System Architecture

The application will be a single Next.js project, structured as follows:

1.  **Public-Facing App (`/`):**
    *   Rendered using Next.js with SSR or SSG for performance.
    *   UI built with React, styled with Tailwind CSS.
    *   Fetches data from the internal Next.js API.
    *   No authentication required.
2.  **Admin Panel (`/boss`):**
    *   A route-grouped section of the Next.js app.
    *   Secured by NextAuth.js, redirecting unauthenticated users to a login page.
    *   UI built with React and the Ant Design component library.
    *   Provides CRUD (Create, Read, Update, Delete) interfaces for all resume data.

### Data Model (Database Schema)

The data will be modeled to represent a professional resume, based on the provided CV.

*   **`User`**: Stores admin login credentials.
    *   `id`, `email`, `passwordHash`
*   **`Company`**: Represents a unique company.
    *   `id`, `name`, `logoUrl`
*   **`Experience`**: Represents a specific role or position.
    *   `id`, `title`, `startDate`, `endDate`, `description`, `companyId` (links to `Company`)
*   **`Accomplishment`**: Key achievements within an experience.
    *   `id`, `description`, `experienceId` (links to `Experience`)
*   **`Skill`**: A specific skill.
    *   `id`, `name`, `category` (e.g., "Technology", "Language")
*   **`Project`**: A project associated with an experience.
    *   `id`, `name`, `description`, `url`, `experienceId`
*   **`Education`**: Educational qualifications.
    *   `id`, `institution`, `degree`, `field`, `startDate`, `endDate`
*   **`Certification`**: Professional certifications.
    *   `id`, `name`, `issuer`, `issueDate`

---

## 2. Development Plan

As the **Software Engineer**, I will execute the development in logical phases to ensure a smooth workflow from backend to frontend.

*   **Phase 1: Project Scaffolding & Backend Setup (1 week)**
    1.  Initialize a new Next.js project with TypeScript.
    2.  Set up the PostgreSQL database and connect it using Prisma.
    3.  Define the database schema in `schema.prisma` and run the initial migration.
    4.  Build the API endpoints (`/api/...`) for all CRUD operations on the data models.
    5.  Integrate NextAuth.js and create the login/logout functionality for the `/boss` route.

*   **Phase 2: Admin Panel (`/boss`) Development (1.5 weeks)**
    1.  Integrate Ant Design into the project.
    2.  Build the login page.
    3.  Create the main dashboard layout for the admin panel.
    4.  Develop forms and tables for managing each data entity (Experience, Education, Skills, etc.).
    5.  Connect the UI components to the backend API to make the panel fully functional.

*   **Phase 3: Data Population & Frontend Development (2 weeks)**
    1.  Use the newly built admin panel to populate the database with all information from the reference `Yassine_Boumiza-CV-2024.pdf`.
    2.  Begin building the public-facing UI components (`Carousel`, `MediaCard`, `Header`) with React and Tailwind CSS.
    3.  Fetch data from the API and display it on the main page.
    4.  Implement the core "Netflix" logic:
        *   Group experiences by company.
        *   Display single-role companies as "movies".
        *   Display multi-role companies as "series", which can be clicked to reveal details of each role.

*   **Phase 4: Responsive Design & Final Touches (1 week)**
    1.  Rigorously apply responsive design principles to ensure the application looks and works perfectly on desktop, tablet, and mobile devices.
    2.  Add subtle animations and transitions to enhance the user experience.
    3.  Optimize images, fonts, and other assets for performance.
    4.  Conduct a final code review and refactor where necessary.

---

## 3. DevOps & Deployment Plan

As the **DevOps Engineer**, my goal is to establish a seamless, automated pipeline for building, testing, and deploying cvFlix.

*   **Source Control:** **Git**, with the repository hosted on **GitHub**.
*   **Hosting:**
    *   **Application (Next.js):** **Vercel**. It's built by the creators of Next.js and offers a world-class, zero-configuration deployment experience.
    *   **Database (PostgreSQL):** **Supabase** or **Neon**. Both offer excellent, easy-to-use, and scalable managed PostgreSQL hosting with generous free tiers.
*   **CI/CD Pipeline (GitHub Actions & Vercel):**
    1.  **On Pull Request:** A GitHub Action will trigger to run linting (`ESLint`), type-checking (`tsc`), and all automated tests (unit, integration).
    2.  **On Merge to `main`:** Vercel will automatically pull the latest code, build the project, and deploy it to production.
*   **Environment Management:**
    *   **Local:** Use `.env.local` to store development database credentials and other secrets. This file will be listed in `.gitignore`.
    *   **Production:** Use Vercel's Environment Variables UI to securely store production database credentials, `NEXTAUTH_SECRET`, and other keys.

---

## 4. Security (SecOps) Plan

As the **Security Specialist**, I will ensure the application is secure, protecting both the admin's data and the integrity of the application.

*   **Authentication:** The `/boss` admin panel will be the primary focus. We will enforce strong password policies and use the secure authentication patterns provided by NextAuth.js.
*   **API Security:**
    *   All API routes that perform mutations (CUD) will be protected and require an active admin session.
    *   Input validation will be performed on all incoming API requests to prevent malicious data from being saved.
*   **Database Security:** Prisma helps prevent SQL injection by using parameterized queries. Direct SQL queries will be forbidden.
*   **Dependency Management:** We will use **GitHub's Dependabot** to automatically scan for vulnerabilities in our npm packages and create pull requests to update them.
*   **Transport Security:** The application will be served exclusively over **HTTPS**, which is handled automatically by Vercel.

---

## 5. Quality Assurance (QA) Plan

As the **QA Tester**, my responsibility is to ensure the application is bug-free, functional, and meets all user requirements.

*   **Unit & Integration Testing:**
    *   **Frameworks:** **Jest** and **React Testing Library**.
    *   **Coverage:** We will write tests for critical UI components (e.g., `MediaCard`), API endpoints, and utility functions to ensure they work as expected in isolation and together.
*   **End-to-End (E2E) Testing:**
    *   **Framework:** **Playwright**.
    *   **Scenarios:**
        1.  **Admin Flow:** `Login -> Create new experience -> Verify it appears on the public site -> Logout`.
        2.  **Public Flow:** `Visit site -> Navigate carousels -> Click on a "series" card -> Verify details expand`.
*   **Manual Testing:**
    *   **Cross-Browser Compatibility:** Test on the latest versions of Chrome, Firefox, and Safari.
    *   **Responsive Design Testing:** Manually verify the layout and functionality on a range of device viewports, from small mobile phones to large desktops.
    *   **User Acceptance Testing (UAT):** A final review to confirm that the project meets all the initial requirements and provides a great user experience.
