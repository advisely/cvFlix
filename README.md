# cvFlix - Netflix-inspired Resume Portfolio

This is a [Next.js](https://nextjs.org) project that presents a professional resume in the style of the Netflix user interface. The platform features a content-manageable admin panel for easy updates without requiring code changes.

## Key Features

- Netflix-inspired UI with dark theme
- Admin panel with full CRUD functionality for all resume sections
- Responsive design that works on all device sizes
- SQLite database with Prisma ORM
- Secure authentication with NextAuth.js
- Server-side rendering for fast page loads

## Project Structure

- `src/app/` - Main application pages and API routes
- `src/app/boss/` - Admin panel pages
- `src/components/` - Reusable UI components
- `src/lib/` - Utility functions and database client
- `prisma/` - Database schema and seed scripts

## Getting Started

First, install the dependencies:

```bash
npm install
```

Set up the database:

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:4001](http://localhost:4001) with your browser to see the public site.

Open [http://localhost:4001/boss](http://localhost:4001/boss) to access the admin panel.

Default admin credentials: admin@example.com / password

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
