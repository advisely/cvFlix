# resumeflex API Documentation

This document describes the comprehensive API endpoints available in the resumeflex application.

## 🔐 Authentication

All admin endpoints require authentication via NextAuth.js session.

### Authentication Endpoints
- `POST /api/auth/signin` - Authenticate admin user
- `POST /api/auth/signout` - Log out admin user
- `GET /api/auth/session` - Get current session information

## 🌐 Public Data Endpoints

### Resume Data
- `GET /api/data` - Get all resume data for the public site
  - **Returns:** Complete resume data including portfolio experiences (companies with experiences), education, certifications, skills, highlights, and navbar configuration
  - **Response Format:**
    ```json
    {
      "portfolioExperiences": [
        {
          "id": "string",
          "name": "string",
          "nameFr": "string",
          "logoUrl": "string",
          "experiences": [
            {
              "id": "string",
              "title": "string",
              "titleFr": "string",
              "startDate": "ISO date string",
              "endDate": "ISO date string (optional)",
              "description": "string",
              "descriptionFr": "string",
              "companyId": "string",
              "media": [...],
              "homepageMedia": [...],
              "cardMedia": [...],
              "dateRanges": [
                {
                  "id": "string",
                  "startDate": "ISO date string",
                  "endDate": "ISO date string (optional)",
                  "isCurrent": "boolean"
                }
              ]
            }
          ]
        }
      ],
      "educations": [...],
      "certifications": [...],
      "skills": [...],
      "highlights": [...],
      "navbarConfig": {
        "logoText": "string",
        "logoTextFr": "string",
        "logoFontFamily": "string",
        "workExperienceLabel": "string",
        "workExperienceLabelFr": "string",
        "backgroundColor": "string",
        "fontFamily": "string",
        ...
      }
    }
    ```

### Navbar Configuration
- `GET /api/navbar-config` - Get navbar and appearance configuration
  - **Returns:** Logo settings, navigation labels, background styles, font family

## 🔧 Admin Data Endpoints

### Companies
- `GET /api/companies` - Get all companies
- `POST /api/companies` - Create a new company
  - **Body:** `{ name: string, logoUrl?: string }`
- `PUT /api/companies/:id` - Update a company
- `DELETE /api/companies/:id` - Delete a company

### Experiences
- `GET /api/experiences` - Get all work experiences with related data
- `POST /api/experiences` - Create a new experience
  - **Body:**
    ```json
    {
      "title": "string",
      "startDate": "ISO date string",
      "endDate": "ISO date string (optional)",
      "description": "string",
      "companyId": "string",
      "accomplishments": ["string"],
      "projects": [
        {
          "name": "string",
          "description": "string",
          "url": "string (optional)"
        }
      ]
    }
    ```
- `PUT /api/experiences/:id` - Update an experience
- `DELETE /api/experiences/:id` - Delete an experience

### Education
- `GET /api/education` - Get all education entries
- `POST /api/education` - Create a new education entry
  - **Body:**
    ```json
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "startDate": "ISO date string",
      "endDate": "ISO date string (optional)"
    }
    ```
- `PUT /api/education/:id` - Update an education entry
- `DELETE /api/education/:id` - Delete an education entry

### Certifications
- `GET /api/certifications` - Get all certifications
- `POST /api/certifications` - Create a new certification
  - **Body:**
    ```json
    {
      "name": "string",
      "issuer": "string",
      "issueDate": "ISO date string"
    }
    ```
- `PUT /api/certifications/:id` - Update a certification
- `DELETE /api/certifications/:id` - Delete a certification

### Skills
- `GET /api/skills` - Get all skills organized by category
- `POST /api/skills` - Create a new skill
  - **Body:**
    ```json
    {
      "name": "string",
      "category": "string"
    }
    ```
- `PUT /api/skills/:id` - Update a skill
- `DELETE /api/skills/:id` - Delete a skill

### Highlights
- `GET /api/highlights` - Get all career highlights
- `POST /api/highlights` - Create a new highlight
  - **Body:**
    ```json
    {
      "title": "string",
      "company": "string",
      "startDate": "ISO date string"
    }
    ```
- `PUT /api/highlights/:id` - Update a highlight
- `DELETE /api/highlights/:id` - Delete a highlight

### Navbar Configuration
- `GET /api/navbar-config` - Get navbar and appearance settings
- `PUT /api/navbar-config` - Update navbar and appearance settings
  - **Body:**
    ```json
    {
      "logoText": "string",
      "logoImageUrl": "string (optional)",
      "useImageLogo": "boolean",
      "workExperienceLabel": "string",
      "careerSeriesLabel": "string",
      "educationLabel": "string",
      "certificationsLabel": "string",
      "skillsLabel": "string",
      "backgroundColor": "string",
      "backgroundType": "color|gradient|image",
      "backgroundImageUrl": "string (optional)",
      "gradientFrom": "string",
      "gradientTo": "string",
      "fontFamily": "string"
    }
    ```

## 📁 Media Upload Endpoints

### General Upload
- `POST /api/upload` - Upload media files
  - **Content-Type:** `multipart/form-data`
  - **Body:** FormData with `file` field
  - **Returns:** `{ url: string, type: string }`

### Content-Specific Uploads
- `POST /api/upload/experiences` - Upload media for experiences
- `POST /api/upload/education` - Upload media for education
- `POST /api/upload/certifications` - Upload media for certifications
- `POST /api/upload/skills` - Upload media for skills
- `POST /api/upload/highlights` - Upload media for highlights

### Media Management
- `GET /api/media` - Get all media files
- `DELETE /api/media/:id` - Delete a media file

## 🧹 Utility Endpoints

### Cleanup
- `POST /api/cleanup-blob-urls` - Clean up blob URLs and fix media references
  - **Returns:** Summary of cleanup operations performed

## 📊 Data Models

### User
```typescript
{
  id: string
  email: string
  passwordHash: string
}
```

### Company
```typescript
{
  id: string
  name: string
  logoUrl?: string
  experiences: Experience[]
}
```

### Experience
```typescript
{
  id: string
  title: string
  startDate: Date
  endDate?: Date
  description: string
  companyId: string
  company: Company
  accomplishments: Accomplishment[]
  projects: Project[]
  media: Media[]
}
```

### Accomplishment
```typescript
{
  id: string
  description: string
  experienceId: string
  experience: Experience
}
```

### Project
```typescript
{
  id: string
  name: string
  description: string
  url?: string
  experienceId: string
  experience: Experience
}
```

### Education
```typescript
{
  id: string
  institution: string
  degree: string
  field: string
  startDate: Date
  endDate?: Date
  media: Media[]
}
```

### Certification
```typescript
{
  id: string
  name: string
  issuer: string
  issueDate: Date
  media: Media[]
}
```

### Skill
```typescript
{
  id: string
  name: string
  category: string
  media: Media[]
}
```

### Highlight
```typescript
{
  id: string
  title: string
  company: string
  startDate: Date
  media: Media[]
  createdAt: Date
}
```

### NavbarConfig
```typescript
{
  id: string
  logoText: string
  logoImageUrl?: string
  useImageLogo: boolean
  workExperienceLabel: string
  careerSeriesLabel: string
  educationLabel: string
  certificationsLabel: string
  skillsLabel: string
  backgroundColor: string
  backgroundType: "color" | "gradient" | "image"
  backgroundImageUrl?: string
  gradientFrom: string
  gradientTo: string
  fontFamily: string
  createdAt: Date
  updatedAt: Date
}
```

### Media
```typescript
{
  id: string
  url: string
  type: string
  experienceId?: string
  educationId?: string
  skillId?: string
  certificationId?: string
  highlightId?: string
  createdAt: Date
  // Relations
  experience?: Experience
  education?: Education
  skill?: Skill
  certification?: Certification
  highlight?: Highlight
}
```

## 🔒 Authentication & Authorization

### Session Management
- All admin endpoints require a valid NextAuth.js session
- Sessions are managed via HTTP-only cookies
- Session validation occurs on each protected API call

### Security Features
- **Password Hashing:** bcryptjs with salt rounds
- **CSRF Protection:** Built into NextAuth.js
- **Input Validation:** Comprehensive validation on all endpoints
- **SQL Injection Prevention:** Prisma ORM parameterized queries

## 📝 Error Handling

### Standard Error Responses
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details (optional)"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## 🚀 Rate Limiting

Currently, no rate limiting is implemented. For production deployment, consider implementing rate limiting for:
- Authentication endpoints
- Media upload endpoints
- Public API endpoints

## 📋 API Usage Examples

### Creating a New Experience
```javascript
const response = await fetch('/api/experiences', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Senior Software Engineer',
    startDate: '2023-01-01T00:00:00.000Z',
    endDate: '2024-01-01T00:00:00.000Z',
    description: 'Led development of key features...',
    companyId: 'company-id-here',
    accomplishments: [
      'Increased system performance by 40%',
      'Led team of 5 developers'
    ],
    projects: [
      {
        name: 'Project Alpha',
        description: 'Revolutionary new feature',
        url: 'https://project-alpha.com'
      }
    ]
  })
});

const experience = await response.json();
```

### Uploading Media
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/upload/experiences', {
  method: 'POST',
  body: formData
});

const { url, type } = await response.json();
```

### Fetching Public Data
```javascript
const response = await fetch('/api/data');
const resumeData = await response.json();

// Access different sections
const { companies, education, certifications, skills, highlights } = resumeData;
```

## 🔄 API Versioning

Currently, the API is unversioned. Future versions may implement versioning via:
- URL path versioning (`/api/v1/...`)
- Header versioning (`API-Version: 1.0`)
- Query parameter versioning (`?version=1.0`)

## 🔄 Multi-Period Experience Support

### Overview
The application supports multi-period experiences, allowing companies to have multiple employment periods with compound date displays.

### Data Structure
- **Legacy Support:** Single experiences with `startDate` and `endDate` fields
- **Multi-Period Support:** Experiences with `dateRanges` array containing multiple employment periods
- **Compound Display:** Shows all start years separated by dashes (e.g., "2016 - 2018 - 2022")

### API Response Enhancement
The `/api/data` endpoint now includes:
- `dateRanges` array for each experience when available
- Backward compatibility with legacy single-period experiences
- Enhanced portfolio experience structure with multi-period support

### Frontend Processing
- `convertCompaniesToMultiPeriodExperiences()` utility function processes raw API data
- `ProfessionalTimeline` component displays compound dates
- `ExperienceCard` component handles both single and multi-period experiences
- Automatic detection and conversion of multi-period data

### Example Multi-Period Experience
```json
{
  "id": "exp-123",
  "title": "Software Engineer",
  "company": {
    "name": "National Bank of Canada"
  },
  "dateRanges": [
    {
      "id": "range-1",
      "startDate": "2015-07-01T00:00:00.000Z",
      "endDate": "2016-07-29T00:00:00.000Z",
      "isCurrent": false
    },
    {
      "id": "range-2",
      "startDate": "2018-01-01T00:00:00.000Z",
      "endDate": "2019-03-29T00:00:00.000Z",
      "isCurrent": false
    },
    {
      "id": "range-3",
      "startDate": "2022-09-05T00:00:00.000Z",
      "endDate": null,
      "isCurrent": true
    }
  ]
}
```

This would display as "2015 - 2018 - 2022" in the portfolio section.

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

For questions or support regarding the API, please refer to the main project documentation or create an issue in the GitHub repository.
