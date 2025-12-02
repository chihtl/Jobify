# Jobify Backend Development Prompt

## Project Overview
Create a job portal backend API similar to ITViec using NestJS, MongoDB, and Mongoose. The system should be scalable, maintainable, and follow best practices.

## Technology Stack
- **Core Framework**: NestJS
- **Database**: MongoDB with Mongoose
- **ODM**: @nestjs/mongoose + mongoose
- **Additional Required Packages**:
  ```bash
  npm install @nestjs/mongoose mongoose
  npm install @nestjs/jwt @nestjs/passport passport passport-jwt
  npm install @nestjs/config
  npm install helmet express-rate-limit
  npm install @nestjs/swagger swagger-ui-express
  npm install bcryptjs
  npm install class-validator class-transformer
  npm install @nestjs/throttler
  ```

## Database Configuration
```env
MONGODB_URI=mongodb+srv://buingoclam00:9u0XInvJB8rVauI3@cluster0.kfdzqg0.mongodb.net/jobify1?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
```

## Project Structure
```
src/
├── app.module.ts
├── main.ts
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   └── schemas/
│       └── base.schema.ts
├── config/
│   ├── database.config.ts
│   └── app.config.ts
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   └── dto/
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── schemas/
│   │   │   └── user.schema.ts
│   │   └── dto/
│   ├── companies/
│   ├── job-posts/
│   ├── applications/
│   ├── saved-jobs/
│   ├── admins/
│   ├── categories/
│   └── skills/
└── documentation/
    ├── database-design.md
    └── api-documentation.md
```

## Database Schema Design

### Base Schema
Create a base schema with automatic timestamps:
```typescript
// common/schemas/base.schema.ts
export abstract class BaseSchema {
  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}
```

### Database Tables/Collections

#### 1. Users Collection
```typescript
{
  _id: ObjectId (PK)
  name: string
  email: string (unique, required)
  passwordHash: string
  phone?: string
  avatarUrl?: string
  resumeUrl?: string
  createdAt: Date
  updatedAt: Date
}
```

#### 2. Companies Collection
```typescript
{
  _id: ObjectId (PK)
  name: string (required)
  email: string (unique, required)
  passwordHash: string
  logoUrl?: string
  websiteUrl?: string
  location?: string
  description?: string
  createdAt: Date
  updatedAt: Date
}
```

#### 3. Categories Collection
```typescript
{
  _id: ObjectId (PK)
  name: string (unique, required) // Backend, Frontend, DevOps, etc.
  description?: string
  createdAt: Date
  updatedAt: Date
}
```

#### 4. Skills Collection
```typescript
{
  _id: ObjectId (PK)
  name: string (unique, required) // React, Node.js, Java, etc.
  categoryId: ObjectId (FK -> categories)
  createdAt: Date
  updatedAt: Date
}
```

#### 5. Job Posts Collection
```typescript
{
  _id: ObjectId (PK)
  title: string (required)
  description: string (required)
  companyId: ObjectId (FK -> companies)
  categoryId: ObjectId (FK -> categories)
  skillIds: ObjectId[] (FK -> skills) // Many-to-many relationship
  location?: string
  salaryMin?: number
  salaryMax?: number
  jobType: enum ['full-time', 'part-time', 'contract', 'freelance']
  experienceLevel: enum ['entry', 'mid', 'senior', 'lead']
  isActive: boolean (default: true)
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

#### 6. Applications Collection
```typescript
{
  _id: ObjectId (PK)
  userId: ObjectId (FK -> users)
  jobPostId: ObjectId (FK -> job_posts)
  message?: string
  resumeUrl?: string // Override user's default resume
  status: enum ['pending', 'reviewed', 'accepted', 'rejected']
  createdAt: Date
  updatedAt: Date
}
```

#### 7. Saved Jobs Collection
```typescript
{
  _id: ObjectId (PK)
  userId: ObjectId (FK -> users)
  jobPostId: ObjectId (FK -> job_posts)
  savedAt: Date
}
```

#### 8. Admins Collection
```typescript
{
  _id: ObjectId (PK)
  email: string (unique, required)
  passwordHash: string
  role: enum ['superadmin', 'moderator']
  name?: string
  createdAt: Date
  updatedAt: Date
}
```

## Development Requirements

### 1. Authentication & Authorization (Placeholder Implementation)
- Implement JWT-based authentication structure
- Create role-based access control (RBAC) system
- **IMPORTANT**: For development phase, disable all authentication checks
- Allow unrestricted API access for data seeding
- Implement guards and decorators but make them return `true` initially

### 2. API Features Required

#### Users Module
- CRUD operations for users
- Profile management
- Password hashing with bcryptjs

#### Companies Module
- CRUD operations for companies
- Company profile management

#### Job Posts Module
- CRUD operations for job posts
- Search and filter functionality
- Pagination support
- Populate company and category data

#### Applications Module
- Apply for jobs
- Update application status
- Get applications by user/company

#### Saved Jobs Module
- Save/unsave jobs
- Get saved jobs for user

#### Categories & Skills Module
- Manage job categories
- Manage skills
- Associate skills with categories

#### Admin Module
- Admin user management
- System-wide statistics

### 3. Technical Requirements

#### Code Quality
- Use TypeScript strictly
- Implement proper DTOs with validation
- Use class-validator and class-transformer
- Follow NestJS best practices
- Implement proper error handling
- Use consistent naming conventions

#### API Documentation
- Implement Swagger/OpenAPI documentation
- Add proper API descriptions and examples
- Document all endpoints with request/response schemas

#### Security (Development Mode)
- Install security packages (helmet, rate limiting)
- Create security configurations but disable for development
- Prepare for production security implementation

#### Database
- Use Mongoose schemas with proper validation
- Implement database indexes for performance
- Use virtual populate for relationships
- Implement soft delete where appropriate

### 4. Folder Structure Best Practices
- Each module should have its own folder
- Separate concerns (controller, service, schema, dto)
- Use barrel exports (index.ts files)
- Common utilities in shared folders

### 5. Development Commands
Create the following npm scripts:
```json
{
  "start:dev": "nest start --watch",
  "build": "nest build",
  "seed": "ts-node src/seeds/index.ts"
}
```

### 6. Data Seeding
Create seed files for:
- Sample categories and skills
- Test companies
- Test users
- Sample job posts

## Special Instructions

1. **Authentication Bypass**: Implement all authentication/authorization logic but add a development flag to bypass checks
2. **Swagger Documentation**: Document all endpoints comprehensively
3. **Validation**: Use class-validator for all DTOs
4. **Error Handling**: Implement global exception filters
5. **Logging**: Add proper logging throughout the application
6. **Environment Config**: Use @nestjs/config for environment management
7. **Database Documentation**: Create detailed database design documentation in markdown files

## Deliverables Expected

1. Complete NestJS backend with all modules
2. Swagger API documentation
3. Database design documentation (markdown)
4. Seed data scripts
5. Environment configuration examples
6. README with setup instructions

## Development Phase Notes
- All APIs should be accessible without authentication initially
- Focus on core functionality and data structure
- Ensure code is ready for authentication implementation later
- Prioritize clean, maintainable, and scalable code structure