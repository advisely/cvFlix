# resumeflex - Netflix-inspired Resume Portfolio

A modern, interactive web application that presents a professional resume in the style of the Netflix user interface. Built with Next.js 15, TypeScript, and featuring a comprehensive admin panel for content management.

## 🎯 Key Features

### Public Interface
- **Netflix-inspired UI** with dark theme and smooth animations
- **Responsive carousels** for browsing different content sections
- **Movie cards** for single work experiences
- **Series cards** for companies with multiple roles (with compound date display)
- **Contribution showcase** highlighting open-source, corporate, and community work with media modals
- **Recommended reading banner** presenting curated books with priority ordering
- **Multi-period experience support** showing compound dates (e.g., "2016 - 2018 - 2022")
- **Skeleton loading states** for smooth user experience
- **Automatic homepage refresh** that periodically pulls new data from the API
- Optional integration with libraries such as SWR or React Query if you prefer focus-triggered revalidation instead of polling
- **Mobile-first responsive design** that works on all devices

### Admin Panel (`/boss`)
- **Secure authentication** with NextAuth.js and bcrypt password hashing
- **Full CRUD operations** for all resume sections:
  - Work experiences with accomplishments and projects
  - Knowledge entries (education, certifications, skills, courses, awards) managed from a unified view with filtering
  - Career highlights and achievements
  - Contributions with multilingual support and media gallery integration
  - Recommended books with priority ordering and media attachments
- **Media upload system** supporting images and videos across all content types, including the Knowledge hub
- **Appearance customization**:
  - Logo configuration (text or image)
  - Navigation label customization
  - Background styling (color, gradient, or image)
  - Font family selection
- **Intuitive Ant Design interface** with modal forms and data tables

### Technical Features
- **Next.js 15** with app directory structure
- **TypeScript** for full type safety
- **SQLite database** with Prisma ORM
- **Tailwind CSS v4** for styling
- **Embla Carousel** for smooth scrolling
- **Server-side rendering** for optimal performance
- **RESTful API** with comprehensive endpoints

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/advisely/resumeflex.git
   cd resumeflex
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:4001"
   ```

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Public site: [http://localhost:4001](http://localhost:4001)
   - Admin panel: [http://localhost:4001/boss](http://localhost:4001/boss)

### Default Admin Credentials
- **Email:** admin@example.com
- **Password:** password

⚠️ **Important:** Change these credentials immediately after first login!

## 📁 Project Structure

```
resumeflex/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   ├── boss/              # Admin panel pages
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable UI components
│   └── lib/                   # Utility functions
├── prisma/                    # Database schema and migrations
├── public/                    # Static assets
└── docs/                      # Documentation
```

## 🛠 Available Scripts

- `npm run dev` - Start development server on port 4001
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed the database with initial data

## 📊 Database Schema

The application uses SQLite with Prisma ORM. Key models include:

- **User** - Admin authentication
- **Company** - Company information with logos
- **Experience** - Work experiences with accomplishments and projects
- **Knowledge** - Unified record for education, certifications, skills, courses, awards
- **Highlight** - Career achievements
- **NavbarConfig** - Appearance customization settings
- **Media** - File uploads linked to all content types

## 🎨 Customization

### Appearance Settings
Access the admin panel to customize:
- Logo (text or image)
- Navigation labels
- Background styles (solid color, gradient, or image)
- Font family
- Color schemes

### Content Management
All content can be managed through the admin panel:
- Add/edit/delete work experiences
- Upload and manage media files for experiences, highlights, and knowledge entries
- Maintain knowledge records across education, certifications, skills, courses, and awards
- Showcase career highlights

## 🔒 Security Features

- **Secure authentication** with NextAuth.js
- **Password hashing** using bcryptjs
- **Protected API routes** requiring authentication
- **Input validation** on all forms
- **SQL injection prevention** with Prisma
- **HTTPS enforcement** in production

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on every push to main

### Environment Variables for Production
```env
DATABASE_URL="file:./prod.db"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.com"
```

## 🧪 Testing

The application includes comprehensive testing:
- **Unit tests** for components and utilities
- **Integration tests** for API endpoints
- **End-to-end tests** for user workflows
- **Manual testing** across browsers and devices

## 📚 API Documentation

Comprehensive API documentation is available in [`docs/API_DOCS.md`](docs/API_DOCS.md).

Key endpoints:
- `GET /api/data` - Public resume data
- `POST /api/auth/login` - Admin authentication
- `GET /api/experiences` - Work experiences
- `GET /api/knowledge` - Unified knowledge entries (filterable by `kind`)
- `POST /api/upload/knowledge` - Media uploads for knowledge entries
- `GET /api/navbar-config` - Appearance settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Netflix** for the UI/UX inspiration
- **Next.js team** for the amazing framework
- **Ant Design** for the comprehensive component library
- **Prisma** for the excellent ORM
- **Vercel** for seamless deployment

## 📞 Support

For support, email support@resumeflex.com or create an issue in the GitHub repository.

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**
