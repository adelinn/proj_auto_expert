# GitHub Actions Documentation

## Overview

GitHub Actions workflows automate the deployment of both frontend and backend to Google Cloud Platform. The workflows use Workload Identity Federation for secure authentication without storing service account keys.

## Workflows

### Frontend Deployment (`frontend.yml`)

Deploys the React frontend to Firebase Hosting.

**Trigger Conditions:**

- Push to `main` branch with changes in `frontend/` directory
- Manual workflow dispatch
- After backend deployment completes

**Workflow Steps:**

1. **Checkout** - Check out repository code
2. **Setup Node.js** - Install Node.js 22.x with npm cache
3. **Install Dependencies** - Run `npm ci`
4. **Lint** - Run ESLint
5. **Build** - Build production bundle with environment variables
6. **Test** - Run tests (if present)
7. **Authenticate** - Authenticate with GCP using Workload Identity
8. **Configure Firebase** - Create `.firebaserc` with site ID
9. **Deploy** - Deploy to Firebase Hosting

**Environment Variables Used:**

- `VITE_API_BASE_URL` - Set to `/api` for production
- `VITE_FIREBASE_CONFIG` - Firebase configuration (from GitHub vars)
- `VITE_GA_MEASUREMENT_ID` - Google Analytics ID (from GitHub vars)

**GitHub Variables Required:**

- `GCP_PROJECT_ID` - GCP project ID
- `FIREBASE_HOSTING_SITE_ID` - Firebase site ID
- `WIF_PROVIDER` - Workload Identity Provider
- `SA_EMAIL` - Service account email
- `FIREBASE_CONFIG` - Firebase config JSON string
- `FIREBASE_MEASUREMENT_ID` - Firebase Analytics measurement ID

### Backend Deployment (`backend.yml`)

Builds Docker image and deploys to Cloud Run.

**Trigger Conditions:**

- Push to `main` branch with changes in `backend/` directory
- Manual workflow dispatch

**Workflow Steps:**

1. **Checkout** - Check out repository code
2. **Authenticate** - Authenticate with GCP using Workload Identity
3. **Configure Docker** - Configure Docker for Artifact Registry
4. **Build & Push** - Build Docker image and push to Artifact Registry
5. **Deploy** - Deploy image to Cloud Run service

**Image Tagging:**

- Format: `{AR_BASEURL}/default:{GITHUB_SHA}`
- Uses commit SHA for versioning

**GitHub Variables Required:**

- `GCP_PROJECT_ID` - GCP project ID
- `GCP_REGION` - GCP region (e.g., `europe-west4`)
- `GCP_AR_BASEURL` - Artifact Registry base URL
- `GCP_CLOUDRUN_SA_EMAIL` - Cloud Run service account email
- `WIF_PROVIDER` - Workload Identity Provider
- `SA_EMAIL` - Service account email

## Setup

### Prerequisites

1. **GCP Project** with billing enabled
2. **Terraform** infrastructure deployed (creates service accounts and WIF)
3. **GitHub Repository** with Actions enabled

### Workload Identity Federation

Workload Identity Federation is configured by Terraform (`03_github_deployer.tf`). This allows GitHub Actions to authenticate to GCP without storing service account keys.

**Setup Process:**

1. Terraform creates Workload Identity Pool and Provider
2. Terraform creates service account with necessary permissions
3. Terraform outputs WIF provider and service account to GitHub variables

### GitHub Variables Configuration

These are set automatically by Terraform.

### Getting WIF Provider

After running Terraform:

```bash
cd infra
terraform output
```

Or check the GitHub Actions service account in GCP Console → IAM & Admin → Service Accounts.

## Workflow Details

### Frontend Workflow

**Concurrency:**

- Group: `frontend-{ref}`
- Cancel in progress: Yes (prevents multiple simultaneous deployments)

**Build Process:**

1. Installs dependencies with `npm ci` (clean install)
2. Runs linter
3. Builds with production environment variables
4. Runs tests (if configured)

**Deployment:**

- Uses Firebase CLI to deploy
- Deploys only hosting (not other Firebase services)
- Uses project ID from GitHub variable

### Backend Workflow

**Build Process:**

1. Authenticates with GCP
2. Configures Docker for Artifact Registry
3. Builds multi-stage Docker image
4. Tags with commit SHA
5. Pushes to Artifact Registry

**Deployment:**

- Uses `google-github-actions/deploy-cloudrun` action
- Deploys to `backend-prod` service
- Uses service account for Cloud Run
- Automatically updates traffic to new revision

## Environment Variables

### Frontend Build Environment

Set during build step:

```yaml
env:
  VITE_API_BASE_URL: /api
  VITE_GA_MEASUREMENT_ID: ${{ vars.FIREBASE_MEASUREMENT_ID }}
  VITE_FIREBASE_CONFIG: ${{ vars.FIREBASE_CONFIG }}
```

### Backend Build Environment

Set during build step:

```yaml
env:
  GCP_IMAGE_TAG: ${{ vars.GCP_AR_BASEURL }}/default:${{ github.sha }}
```

## Manual Deployment

### Frontend

1. Go to GitHub Actions tab
2. Select "Deploy frontend" workflow
3. Click "Run workflow"
4. Select branch (usually `main`)
5. Click "Run workflow"

### Backend

1. Go to GitHub Actions tab
2. Select "Deploy backend" workflow
3. Click "Run workflow"
4. Select branch (usually `main`)
5. Click "Run workflow"

## Troubleshooting

### Authentication Failures

**Error**: `Error: failed to get credentials`

**Solutions:**

1. Verify `WIF_PROVIDER` variable is correct
2. Check service account exists in GCP
3. Verify Workload Identity Pool is configured
4. Check service account has necessary permissions

### Build Failures

**Frontend:**

1. Check Node.js version compatibility
2. Verify all dependencies are in `package.json`
3. Check for linting errors
4. Verify environment variables are set

**Backend:**

1. Check Dockerfile is valid
2. Verify Docker build context
3. Check for build errors in logs
4. Verify Artifact Registry permissions

### Deployment Failures

**Firebase Hosting:**

1. Verify Firebase project is linked
2. Check `FIREBASE_HOSTING_SITE_ID` is correct
3. Verify service account has Firebase Hosting Admin role
4. Check Firebase project permissions

**Cloud Run:**

1. Verify image exists in Artifact Registry
2. Check service account has Cloud Run Admin role
3. Verify Cloud Run service exists
4. Check Cloud Run logs for errors

### Missing Variables

**Error**: `Variable not found`

**Solutions:**

1. Re-run the Terraform project

## Best Practices

1. **Use Variables, Not Secrets**: For non-sensitive config (project IDs, regions)
2. **Use Secrets for Sensitive Data**: Passwords, API keys, tokens
3. **Test Workflows**: Use workflow_dispatch to test before merging
4. **Monitor Deployments**: Check workflow runs regularly
5. **Review Logs**: Check workflow logs for errors
6. **Version Control**: Keep workflow files in version control
7. **Concurrency**: Use concurrency groups to prevent race conditions

## Workflow Dependencies

- **Frontend** can trigger after **Backend** completes
- Both workflows are independent and can run in parallel
- Frontend workflow checks for backend completion before running (if triggered by backend workflow)

## Security

- **No Service Account Keys**: Uses Workload Identity Federation
- **Least Privilege**: Service accounts have minimal required permissions
- **Secrets Management**: Sensitive data stored in GitHub Secrets
- **Audit Trail**: All deployments logged in GitHub Actions
