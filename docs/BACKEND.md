# Backend Documentation

## Overview

The backend is an Express.js REST API built with Node.js, using MySQL database with Knex.js for query building. It features JWT authentication, comprehensive error logging, and Zod validation.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database (via Cloud SQL)
- **Knex.js** - SQL query builder
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcrypt** - Password hashing
- **Zod** - Schema validation
- **Pino** - Structured logging
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **express-rate-limit** - Rate limiting

## Project Structure

```
backend/
├── config/
│   └── db.js              # Database connection and migrations
├── controllers/
│   ├── authController.js  # Authentication logic
│   └── ... .js
├── middleware/            # Express Middlewares
│   ├── authMiddleware.js  # JWT verification
│   └── ... .js            # Other middlewares
├── repositories/
│   ├── useri.js           # User repository
│   ├── intrebari.js       # Questions repository
│   ├── teste.js           # Tests repository
│   ├── examene.js         # Exams repository
│   ├── chestionare.js     # Questionnaires repository
│   ├── raspunsuriQ.js     # Question answers repository
│   ├── raspunsuriXam.js   # Exam answers repository
│   ├── pozeQ.js           # Question images repository
│   └── zod.js             # Zod validation utilities
├── routes/
│   ├── authRoutes.js      # Authentication routes
│   ├── questions.js       # Questions API routes
│   └── ... .js            # Other routes
├── server/
│   └── logger.js          # Pino logger setup
├── migrations/            # Database migrations
├── test/                  # Test scripts
├── Dockerfile             # Container image
├── knexfile.js            # Knex configuration
└── server.js              # Application entry point
```

## Setup

### Prerequisites

- Node.js 24.x
- MySQL 8.0 (or Cloud SQL instance)
- Cloud SQL Proxy (for local development with Cloud SQL)

### Installation

```bash
cd backend
npm install
npm run install-cloudsql
```

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=db_admin
DB_PASSWORD=your_password
DB_NAME=auto_expert
# DB_SOCKET_PATH=/cloudsql/INSTANCE_CONNECTION_NAME  # For Cloud SQL from Cloud Run only

# JWT
JWT_SECRET=your-secret-key-min-32-chars

# CORS
CLIENT_ORIGIN=http://localhost:5173,http://localhost:3000

# Migrations
RUN_MIGRATIONS_ON_START=1  # Set to 1 to run migrations on startup

# Logging
LOG_LEVEL=info  # trace, debug, info, warn, error, fatal
```

### Database Setup

#### Local Development

1. Start MySQL server
2. Create database: `CREATE DATABASE auto_expert;`
3. Run migrations: `npm run migrate`

#### Cloud SQL (Production)

Authenticate with GCP:

```bash
gcloud auth application-default login
gcloud config set project auto-expert-479412
```

1. Use Cloud SQL Proxy for local connection:

   ```bash
   npm run dbp
   ```

2. Or set `DB_SOCKET_PATH` for Cloud Run integration

### Development

```bash
npm run dev
```

Starts server with nodemon (auto-reload on changes) at `http://localhost:5000`

### Production

```bash
npm start
```

## API Endpoints

### Authentication

#### `POST /api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "numele_utilizatorului",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here"
}
```

#### `POST /api/auth/login`
Login user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here"
}
```

### Questions API

#### `GET /api/questions`
Get all questions.

**Response:**
```json
[
  {
    "id": 1,
    "text": "Question text",
    "id_poza": null,
    "tipQ_1xR": 1
  }
]
```

#### `GET /api/questions/:id`
Get question by ID.

## Authentication

### JWT Tokens

- Tokens are issued on login/register
- Token payload: `{ user: { id, name } }`
- Login tokens expire in 15 hours
- Registration tokens expire in 39 hours
- Tokens must be sent in `Authorization` header: `Bearer <token>`

### Middleware

- **authMiddleware** - Verifies JWT token, adds `req.user`

### Protected Routes

Add authentication middleware to routes:

```javascript
import auth from '../middleware/authMiddleware.js';

router.get('/protected', auth, async (req, res) => {
  // req.user is available here
  res.json({ user: req.user });
});
```

## Data Validation

All repository functions use Zod for validation:

- **Input validation** - Validates user input at repository boundary (400 errors)
- **Database validation** - Validates data from database (500 errors indicate data corruption)
- **Type safety** - Ensures data types match schema

### Example

```javascript
import { parseInput, zId } from './zod.js';

export async function getById(id) {
  const safeId = parseInput(zId, id, "Invalid user id");
  const row = await db(TABLE).where(PK, safeId).first();
  return toPublic(row);
}
```

## Error Logging

Comprehensive error logging is implemented throughout:

- **Request-scoped logging** - Uses `req.log` when available
- **Structured logging** - Pino logger with context
- **Error levels**:
  - `error` - Critical failures
  - `warn` - Security issues, failed auth
  - `info` - Successful operations
- **Context included** - User IDs, request paths, error details

### Logging Examples

```javascript
const log = req?.log || logger;

// Error logging
log.error({ err, userId }, 'Error creating user');

// Warning logging
log.warn({ email }, 'Failed login attempt');

// Info logging
log.info({ userId, email }, 'User registered successfully');
```

## Security Features

- **Helmet** - Security headers
- **Rate limiting** - 200 requests per 15 minutes per IP
- **CORS** - Configured for specific origins
- **Password hashing** - bcrypt with salt rounds
- **JWT tokens** - Secure token-based authentication
- **Input validation** - Zod schema validation
- **SQL injection protection** - Knex.js parameterized queries

## Database

### Migrations

Migrations are managed with Knex.js:

```bash
# Run migrations
npm run migrate

# Or set RUN_MIGRATIONS_ON_START=1 to auto-run on startup
```

### Repository Pattern

All database operations go through repositories:

- **Separation of concerns** - Business logic in controllers, data access in repositories
- **Validation** - Zod schemas for input/output
- **Type safety** - Consistent data structures

### Tables

- `useri` - Users
- `intrebari` - Questions
- `teste` - Tests
- `examene` - Exams
- `chestionare` - Questionnaires
- `raspunsuriQ` - Question answers
- `raspunsuriXam` - Exam answers
- `pozeQ` - Question images
- `allowed_domains` - Allowed domains for URL validation

## Deployment

The backend is deployed to Google Cloud Run via GitHub Actions. See [GitHub Actions Documentation](./GITHUB_ACTIONS.md) for details.

### Docker

The backend includes a Dockerfile for containerization:

```bash
# Build image
docker build -t backend:latest ./backend

# Run container
docker run -p 5000:5000 --env-file .env backend:latest
```

### Cloud Run

- **Service name**: `backend-prod`
- **Region**: `europe-west4`
- **Min instances**: 0 (scales to zero)
- **Max instances**: 5
- **Timeout**: 600s
- **Memory**: 1Gi
- **CPU**: 1

## Testing

Test scripts are available in `test/` directory:

```bash
# Validate environment variables
npm run test-env

# Test URL validation
npm run test-links

# Test allowed domains
npm run test-db-allowed-domains
```

## Troubleshooting

### Database Connection Issues

1. Verify environment variables are set correctly
2. Check Cloud SQL Proxy is running (if using Cloud SQL)
3. Verify database credentials
4. Check network connectivity

### Authentication Errors

1. Verify `JWT_SECRET` is set
2. Check token expiration
3. Verify token format in Authorization header
4. Check user exists in database

### Migration Errors

1. Check database connection
2. Verify migration files are valid
3. Check for conflicting migrations
4. Review migration logs
