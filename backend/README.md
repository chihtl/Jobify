# Jobify Backend API

A comprehensive job portal backend API similar to ITViec, built with NestJS, MongoDB, and Mongoose. This system provides a complete solution for job seekers, companies, and administrators to manage job postings, applications, and user interactions.

## 🚀 Features

### Core Functionality

- **User Management**: Registration, authentication, and profile management for job seekers
- **Company Management**: Company registration, profile management, and job posting capabilities
- **Job Posts**: Advanced job posting system with search, filtering, and categorization
- **Applications**: Complete application management system with status tracking
- **Saved Jobs**: Job bookmarking functionality for users
- **Admin Panel**: Administrative controls and system-wide statistics

### Technical Features

- **Authentication**: JWT-based authentication with role-based access control
- **Search & Filter**: Advanced search with multiple filters (skills, location, salary, etc.)
- **Pagination**: Efficient pagination for all list endpoints
- **Validation**: Comprehensive input validation using class-validator
- **Documentation**: Auto-generated Swagger/OpenAPI documentation
- **Security**: Security best practices with configurable development mode
- **Database**: MongoDB with Mongoose ODM and optimized indexes

## 🛠️ Technology Stack

### Core Framework

- **NestJS**: Progressive Node.js framework for building efficient and scalable server-side applications
- **TypeScript**: Strongly typed programming language that builds on JavaScript

### Database

- **MongoDB**: NoSQL document database
- **Mongoose**: MongoDB object modeling for Node.js

### Authentication & Security

- **JWT**: JSON Web Tokens for stateless authentication
- **bcryptjs**: Password hashing library
- **Helmet**: Security middleware for Express
- **Throttling**: Rate limiting protection

### Validation & Documentation

- **class-validator**: Decorator-based validation library
- **class-transformer**: Plain object to class instance transformer
- **Swagger/OpenAPI**: API documentation and testing interface

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account or local MongoDB installation

## 🔧 Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd jobify-backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment Configuration**
   Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb+srv://buingoclam00:9u0XInvJB8rVauI3@cluster0.kfdzqg0.mongodb.net/jobify1?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_jwt_secret_here_change_in_production
JWT_EXPIRES_IN=7d

# Development settings
NODE_ENV=development
PORT=3000

# Security settings (disabled in development)
ENABLE_AUTH=false
ENABLE_RATE_LIMITING=false
ENABLE_HELMET=false
```

4. **Start the application**

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

5. **Seed the database** (Optional)

```bash
npm run seed
```

## 📚 API Documentation

Once the application is running, you can access:

- **Swagger UI**: http://localhost:3000/api/docs
- **API Base URL**: http://localhost:3000/api/v1

### Available Endpoints

#### Authentication

- `POST /api/v1/auth/login` - login
- `POST /api/v1/auth/validate` - Validate JWT token
- `POST /api/v1/auth/refresh` - Refresh JWT token

#### Users

- `GET /api/v1/users` - Get all users (paginated)
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create new user
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

#### Companies

- `GET /api/v1/companies` - Get all companies (paginated)
- `GET /api/v1/companies/search` - Search companies
- `GET /api/v1/companies/:id` - Get company by ID
- `POST /api/v1/companies` - Create new company
- `PATCH /api/v1/companies/:id` - Update company
- `DELETE /api/v1/companies/:id` - Delete company

#### Job Posts

- `GET /api/v1/job-posts` - Get job posts (with advanced filtering)
- `GET /api/v1/job-posts/search-suggestions` - Get search suggestions
- `GET /api/v1/job-posts/company/:companyId` - Get jobs by company
- `GET /api/v1/job-posts/:id` - Get job post by ID
- `POST /api/v1/job-posts` - Create new job post
- `PATCH /api/v1/job-posts/:id` - Update job post
- `DELETE /api/v1/job-posts/:id` - Delete job post

#### Applications

- `GET /api/v1/applications` - Get applications (with filtering)
- `GET /api/v1/applications/user/:userId` - Get user's applications
- `GET /api/v1/applications/company/:companyId` - Get company's applications
- `POST /api/v1/applications` - Create new application
- `PATCH /api/v1/applications/:id/status` - Update application status
- `DELETE /api/v1/applications/:id` - Delete application

#### Saved Jobs

- `GET /api/v1/saved-jobs/user/:userId` - Get user's saved jobs
- `POST /api/v1/saved-jobs` - Save a job
- `POST /api/v1/saved-jobs/toggle` - Toggle save/unsave job
- `DELETE /api/v1/saved-jobs/unsave` - Unsave a job

## 🏗️ Project Structure

```
src/
├── app.module.ts              # Main application module
├── main.ts                    # Application entry point
├── common/                    # Shared utilities
│   ├── decorators/           # Custom decorators
│   ├── filters/              # Exception filters
│   ├── guards/               # Authentication/authorization guards
│   ├── interceptors/         # Response transformers
│   ├── pipes/                # Validation pipes
│   ├── schemas/              # Base schemas
│   ├── dto/                  # Common DTOs
│   └── enums/                # Enums and constants
├── config/                   # Configuration files
│   ├── app.config.ts         # Application config
│   ├── database.config.ts    # Database config
│   └── jwt.config.ts         # JWT config
├── modules/                  # Feature modules
│   ├── auth/                 # Authentication module
│   ├── users/                # User management
│   ├── companies/            # Company management
│   ├── categories/           # Job categories
│   ├── skills/               # Skills management
│   ├── job-posts/            # Job posting system
│   ├── applications/         # Application management
│   ├── saved-jobs/           # Saved jobs functionality
│   └── admins/               # Admin management
├── seeds/                    # Database seeding scripts
└── documentation/            # Project documentation
```

## 🔒 Security Features

### Development Mode

- Authentication can be disabled for easier development
- Rate limiting can be disabled
- Security headers can be disabled
- All APIs are accessible without authentication

### Production Mode

- JWT-based authentication required
- Role-based access control
- Rate limiting enabled
- Security headers enabled
- Password hashing with bcrypt

## 📊 Database Schema

The application uses MongoDB with the following collections:

- **users**: Job seekers' information
- **companies**: Company profiles and credentials
- **categories**: Job categories (Backend, Frontend, etc.)
- **skills**: Technical skills linked to categories
- **job_posts**: Job postings with advanced filtering
- **applications**: Job applications with status tracking
- **saved_jobs**: Bookmarked jobs by users
- **admins**: System administrators

For detailed schema information, see [Database Design Documentation](src/documentation/database-design.md).

## 🌱 Database Seeding

The application includes comprehensive seed data:

```bash
npm run seed
```

This will populate the database with:

- 10 job categories
- 60+ technical skills
- 8 sample users
- 8 sample companies
- 2 admin accounts
- 10 sample job posts

### Default Admin Accounts

- **Super Admin**: admin@jobify.com / admin123456
- **Moderator**: moderator@jobify.com / mod123456

## 🧪 Testing

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🚀 Deployment

### Environment Variables

Ensure all production environment variables are set:

- Set `NODE_ENV=production`
- Set `ENABLE_AUTH=true`
- Set `ENABLE_RATE_LIMITING=true`
- Set `ENABLE_HELMET=true`
- Use a strong `JWT_SECRET`

### Build and Deploy

```bash
npm run build
npm run start:prod
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Ensure all tests pass
6. Submit a pull request

## 📝 API Features

### Advanced Search & Filtering

- Full-text search on job titles and descriptions
- Filter by company, category, skills, location
- Salary range filtering
- Job type and experience level filtering
- Sort by various criteria

### Pagination

- All list endpoints support pagination
- Configurable page size with sensible defaults
- Total count and navigation information

### Response Format

All API responses follow a consistent format:

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": { ... }
}
```

For paginated responses:

```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## 🔧 Development Guidelines

### Code Style

- Use TypeScript strict mode
- Follow NestJS best practices
- Use proper DTOs for validation
- Implement comprehensive error handling
- Add Swagger documentation for all endpoints

### Database Guidelines

- Use proper indexes for performance
- Implement virtual population for relationships
- Use aggregation pipelines for complex queries
- Follow MongoDB naming conventions

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Check the API documentation at `/api/docs`
- Review the database design documentation
- Create an issue in the repository
