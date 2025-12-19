# Project Documentation

Welcome to the Auto Expert project documentation. This documentation covers all aspects of the application including frontend, backend, infrastructure, and CI/CD.

## Documentation Index

- **[Frontend Documentation](./FRONTEND.md)** - React application setup, components, and features
- **[Backend Documentation](./BACKEND.md)** - Express.js API, database, and authentication
- **[Infrastructure Documentation](./INFRASTRUCTURE.md)** - Terraform, GCP resources, and deployment
- **[GitHub Actions Documentation](./GITHUB_ACTIONS.md)** - CI/CD workflows and automation

## Quick Start

### Prerequisites

- Node.js
- npm or yarn
- Google Cloud SDK (for infrastructure)
- GitHub CLI (for infrastructure)
- Terraform >= 1.4.6 (for infrastructure)

### Local Development Setup

#### Frontend

```bash
cd frontend
npm install
cp .env.example .env  # Configure environment variables
npm run dev
```

#### Backend

```bash
cd backend
npm install
npm run install-cloudsql
cp .env.example .env  # Configure environment variables

# In separate terminals run the following two commands
npm run dbp
npm run dev
```

#### Infrastructure

```bash
cd infra
terraform init
terraform plan
terraform apply
```

## Project Overview

**Auto Expert** is an educational quiz application for driving license preparation. The application consists of:

- **Frontend**: React SPA with modern UI, Firebase Analytics, and cookie consent
- **Backend**: Express.js REST API with JWT authentication
- **Database**: MySQL 8.0 on Cloud SQL
- **Infrastructure**: GCP (Cloud Run, Firebase Hosting, Cloud SQL)
- **CI/CD**: GitHub Actions with automated deployments

## Architecture

```
┌─────────────────┐
│   Firebase      │
│   Hosting       │
│  (Frontend)     │
└────────┬────────┘
         │
         │ HTTPS
         │
┌────────▼────────┐
│   Cloud Run     │
│   (Backend)     │
└────────┬────────┘
         │
         │ Unix Socket
         │
┌────────▼────────┐
│   Cloud SQL     │
│   (MySQL)       │
└─────────────────┘
```

## Key Features

- **User Authentication**: JWT-based auth with secure password hashing
- **Quiz System**: Interactive quiz interface with multiple choice questions
- **Analytics**: Firebase Analytics with GDPR-compliant cookie consent
- **Responsive Design**: Mobile-first, glassy UI with Tailwind CSS
- **Security**: Rate limiting, CORS, Helmet, input validation
- **Logging**: Structured logging with Pino
- **CI/CD**: Automated deployments via GitHub Actions

## Environment Variables

### Frontend

See [Frontend Documentation](./FRONTEND.md#environment-variables)

### Backend

See [Backend Documentation](./BACKEND.md#environment-variables)

## Deployment

### Automatic Deployment

Deployments happen automatically via GitHub Actions when code is pushed to `main` branch.

### Manual Deployment

See individual documentation files for manual deployment instructions.

## Development Workflow

1. **Create feature branch**: `git checkout -b feature/my-feature`
2. **Make changes**: Develop and test locally
3. **Commit changes**: `git commit -m "Description"`
4. **Push to GitHub**: `git push origin feature/my-feature`
5. **Create Pull Request**: Review and merge to `main`
6. **Auto-deploy**: GitHub Actions deploys automatically

## Testing

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

### Backend

```bash
cd backend
npm run test-env
npm run test-links
npm run test-db-allowed-domains
```

## Troubleshooting

### Common Issues

1. **Port already in use**: Change PORT in `.env`
2. **Database connection failed**: Check Cloud SQL Proxy or connection string
3. **Authentication errors**: Verify JWT_SECRET is set
4. **Build failures**: Clear node_modules and reinstall

### Getting Help

- Check individual documentation files for specific issues
- Review GitHub Actions logs for deployment errors
- Check GCP Console for infrastructure issues
- Review application logs in Cloud Run or Firebase

## Contributing

1. Follow code style guidelines
2. Write tests for new features
3. Update documentation
4. Ensure all checks pass before merging

## License

See [LICENSE](../LICENSE) file.
