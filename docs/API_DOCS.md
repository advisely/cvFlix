# cvFlix API Documentation

This document describes the API endpoints available in the cvFlix application.

## Authentication

- `POST /api/auth/login` - Authenticate admin user
- `GET /api/auth/logout` - Log out admin user
- `GET /api/auth/session` - Get current session information

## Public Data Endpoints

- `GET /api/data` - Get all resume data for the public site
  - Returns: Companies with experiences, educations, certifications, and skills

## Admin Data Endpoints

### Companies
- `GET /api/companies` - Get all companies
- `POST /api/companies` - Create a new company
- `PUT /api/companies/:id` - Update a company
- `DELETE /api/companies/:id` - Delete a company

### Experiences
- `GET /api/experiences` - Get all experiences
- `POST /api/experiences` - Create a new experience
- `PUT /api/experiences/:id` - Update an experience
- `DELETE /api/experiences/:id` - Delete an experience

### Education
- `GET /api/education` - Get all education entries
- `POST /api/education` - Create a new education entry
- `PUT /api/education/:id` - Update an education entry
- `DELETE /api/education/:id` - Delete an education entry

### Certifications
- `GET /api/certifications` - Get all certifications
- `POST /api/certifications` - Create a new certification
- `PUT /api/certifications/:id` - Update a certification
- `DELETE /api/certifications/:id` - Delete a certification

### Skills
- `GET /api/skills` - Get all skills
- `POST /api/skills` - Create a new skill
- `PUT /api/skills/:id` - Update a skill
- `DELETE /api/skills/:id` - Delete a skill

## Data Models

### Company
- `id` (string) - Unique identifier
- `name` (string) - Company name
- `logoUrl` (string, optional) - URL to company logo

### Experience
- `id` (string) - Unique identifier
- `title` (string) - Job title
- `startDate` (DateTime) - Start date
- `endDate` (DateTime, optional) - End date
- `description` (string) - Job description
- `companyId` (string) - Reference to company

### Education
- `id` (string) - Unique identifier
- `degree` (string) - Degree name
- `school` (string) - School name
- `startDate` (DateTime) - Start date
- `endDate` (DateTime) - End date
- `description` (string) - Description

### Certification
- `id` (string) - Unique identifier
- `name` (string) - Certification name
- `issuer` (string) - Issuing organization
- `date` (DateTime) - Date issued
- `description` (string) - Description

### Skill
- `id` (string) - Unique identifier
- `name` (string) - Skill name
- `category` (string) - Skill category
