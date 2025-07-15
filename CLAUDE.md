# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern student grade management system built with Next.js 14, TypeScript, and Prisma ORM. The system supports manual score entry, Excel batch import, and comprehensive data visualization and analysis.

## Development Commands

### Basic Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

### Database Management
```bash
# Initialize database with migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Reset database and reseed
npm run db:reset

# Seed database with sample data
npm run db:seed

# View database in Prisma Studio
npx prisma studio
```

### Cloudflare Deployment
```bash
# Build for Cloudflare Pages
npm run cf:build

# Local development with Cloudflare Pages
npm run cf:dev
```

## Architecture

### Database Schema
The application uses SQLite with Prisma ORM and supports both local SQLite and Cloudflare D1 databases:

- **Student**: Student information linked to classes
- **Class**: Class/grade information
- **Exam**: Exam information with dates
- **Score**: Individual score records with unique constraint on (studentId, examId, subject)

**Important**: The unique constraint prevents duplicate scores for the same student, exam, and subject combination.

### Database Connection Pattern
The system uses a flexible database connection pattern in `src/lib/db.ts`:
- **Local development**: Uses SQLite with connection pooling
- **Cloudflare Pages**: Uses D1 database with adapter
- **Edge Runtime**: Automatically detects environment and uses appropriate connection

### API Routes Structure
All API routes are configured for Edge Runtime and follow this pattern:
```typescript
export async function GET(request: NextRequest, { env }: { env: any }) {
  const prisma = getDatabase(env);
  // ... route logic
}
```

### Key API Endpoints
- `/api/scores` - CRUD operations for scores
- `/api/students` - Student management
- `/api/classes` - Class management  
- `/api/exams` - Exam management
- `/api/analytics/student` - Student performance analytics
- `/api/analytics/class` - Class performance analytics

### Frontend Architecture
- **App Router**: Uses Next.js 14 App Router structure
- **UI Components**: Built with shadcn/ui and Radix UI primitives
- **Charts**: Uses Recharts for data visualization
- **Styling**: Tailwind CSS with custom theme support

### Component Organization
- `src/components/ui/` - Reusable UI components (buttons, inputs, charts)
- `src/components/` - Business logic components (forms, analytics)
- `src/app/` - Page components and API routes

## Subject System
The system supports three subjects with strict validation:
- 语文 (CHINESE)
- 数学 (MATH) 
- 英语 (ENGLISH)

## Data Import
Excel import functionality supports automatic creation of missing entities (classes, students, exams) and prevents duplicate score entries.

## Testing & Validation
- All score inputs are validated (0-100 range)
- Duplicate prevention at database level
- Comprehensive error handling for network and validation errors
- Real-time form validation on frontend

## Deployment Notes
- Uses Cloudflare Pages with D1 database binding
- All API routes configured for Edge Runtime
- Automatic environment detection for database connections
- Build process includes static optimization for Cloudflare

## Development Tips
- Use `npm run db:reset` to refresh database with sample data during development
- Check `prisma/seed.js` for sample data structure
- All forms include real-time validation and error handling
- Analytics components automatically update after score entry