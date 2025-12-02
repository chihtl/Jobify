# Database Design Documentation

## Overview

This document describes the database schema for the Jobify job portal system, designed to be similar to ITViec. The system uses MongoDB as the primary database with Mongoose for object modeling.

## Collections Structure

### 1. Users Collection

**Purpose**: Store job seekers' information

```typescript
{
  _id: ObjectId (PK)
  name: string (required)
  email: string (unique, required)
  passwordHash: string (required)
  phone?: string
  avatarUrl?: string
  resumeUrl?: string
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:

- `{ email: 1 }` (unique)
- `{ createdAt: -1 }`

### 2. Companies Collection

**Purpose**: Store company information and credentials

```typescript
{
  _id: ObjectId (PK)
  name: string (required)
  email: string (unique, required)
  passwordHash: string (required)
  logoUrl?: string
  websiteUrl?: string
  location?: string
  description?: string
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:

- `{ email: 1 }` (unique)
- `{ name: 1 }`
- `{ location: 1 }`

### 3. Categories Collection

**Purpose**: Job categories (Backend, Frontend, DevOps, etc.)

```typescript
{
  _id: ObjectId (PK)
  name: string (unique, required)
  description?: string
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:

- `{ name: 1 }` (unique)

### 4. Skills Collection

**Purpose**: Technical skills linked to categories

```typescript
{
  _id: ObjectId (PK)
  name: string (unique, required)
  categoryId: ObjectId (FK -> categories)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:

- `{ name: 1 }` (unique)
- `{ categoryId: 1 }`

**Virtual Population**: `category` field populated from Categories collection

### 5. Job Posts Collection

**Purpose**: Store job postings from companies

```typescript
{
  _id: ObjectId (PK)
  title: string (required)
  description: string (required)
  companyId: ObjectId (FK -> companies)
  categoryId: ObjectId (FK -> categories)
  skillIds: ObjectId[] (FK -> skills)
  location?: string
  salaryMin?: number
  salaryMax?: number
  jobType: enum ['full-time', 'part-time', 'contract', 'freelance']
  experienceLevel: enum ['entry', 'mid', 'senior', 'lead']
  isActive: boolean (default: true)
  expiresAt?: Date
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:

- `{ title: 'text', description: 'text' }` (text search)
- `{ companyId: 1 }`
- `{ categoryId: 1 }`
- `{ skillIds: 1 }`
- `{ location: 1 }`
- `{ jobType: 1 }`
- `{ experienceLevel: 1 }`
- `{ isActive: 1 }`
- `{ createdAt: -1 }`

**Virtual Populations**:

- `company` field populated from Companies collection
- `category` field populated from Categories collection
- `skills` field populated from Skills collection

### 6. Applications Collection

**Purpose**: Track job applications from users

```typescript
{
  _id: ObjectId (PK)
  userId: ObjectId (FK -> users)
  jobPostId: ObjectId (FK -> job_posts)
  message?: string
  resumeUrl?: string
  status: enum ['pending', 'reviewed', 'accepted', 'rejected']
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:

- `{ userId: 1, jobPostId: 1 }` (unique compound)
- `{ userId: 1 }`
- `{ jobPostId: 1 }`
- `{ status: 1 }`
- `{ createdAt: -1 }`

**Virtual Populations**:

- `user` field populated from Users collection
- `jobPost` field populated from Job Posts collection

### 7. Saved Jobs Collection

**Purpose**: Track jobs saved by users for later viewing

```typescript
{
  _id: ObjectId (PK)
  userId: ObjectId (FK -> users)
  jobPostId: ObjectId (FK -> job_posts)
  savedAt: Date (default: now)
}
```

**Indexes**:

- `{ userId: 1, jobPostId: 1 }` (unique compound)
- `{ userId: 1 }`
- `{ jobPostId: 1 }`
- `{ savedAt: -1 }`

**Virtual Populations**:

- `user` field populated from Users collection
- `jobPost` field populated from Job Posts collection

### 8. Admins Collection

**Purpose**: System administrators

```typescript
{
  _id: ObjectId (PK)
  email: string (unique, required)
  passwordHash: string (required)
  role: enum ['superadmin', 'moderator']
  name?: string
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:

- `{ email: 1 }` (unique)
- `{ role: 1 }`

## Relationships

### One-to-Many Relationships

1. **Categories → Skills**: One category has many skills
2. **Companies → Job Posts**: One company has many job posts
3. **Categories → Job Posts**: One category has many job posts
4. **Users → Applications**: One user has many applications
5. **Users → Saved Jobs**: One user has many saved jobs

### Many-to-Many Relationships

1. **Skills ↔ Job Posts**: Skills are referenced in job posts via skillIds array
2. **Users ↔ Job Posts (via Applications)**: Users can apply to multiple jobs, jobs can have multiple applicants
3. **Users ↔ Job Posts (via Saved Jobs)**: Users can save multiple jobs, jobs can be saved by multiple users

## Data Integrity Constraints

### Unique Constraints

- User emails must be unique
- Company emails must be unique
- Admin emails must be unique
- Category names must be unique
- Skill names must be unique
- User cannot apply to the same job twice
- User cannot save the same job twice

### Validation Rules

- Email fields must be valid email format
- Password minimum length: 6 characters
- Salary fields must be non-negative numbers
- Job type must be one of predefined enum values
- Experience level must be one of predefined enum values
- Application status must be one of predefined enum values

## Performance Considerations

### Indexing Strategy

- Text indexes on job post title and description for search functionality
- Compound indexes on frequently queried combinations
- Single field indexes on foreign key references
- Date indexes for time-based queries

### Aggregation Pipelines

- Used in Applications service for complex filtering by company
- Used for statistics generation
- Used for search suggestions in job posts

### Virtual Population

- Reduces need for manual joins
- Improves query performance for related data
- Maintains data consistency

## Security Considerations

### Password Security

- All passwords are hashed using bcryptjs with salt rounds = 10
- Original passwords are never stored in the database

### Data Privacy

- Password hashes are excluded from API responses
- Sensitive user data is protected by authentication guards

### Authorization

- Role-based access control for admin functions
- Authentication bypass available for development mode
- JWT tokens for stateless authentication

## Scalability Features

### Pagination

- All list endpoints support pagination
- Configurable page size with reasonable defaults and limits

### Soft Delete

- Job posts can be deactivated instead of deleted
- Maintains data integrity for applications and saved jobs

### Flexible Schema

- Optional fields allow for gradual feature rollout
- Schema can be extended without breaking existing functionality

## Migration Considerations

### Schema Updates

- New fields can be added as optional
- Existing data remains compatible
- Indexes can be added without downtime

### Data Migration

- Seed scripts provided for initial data population
- Foreign key relationships maintained during migrations
- Rollback procedures for schema changes
