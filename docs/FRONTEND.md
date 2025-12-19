# Frontend Documentation

## Overview

The frontend is a React application built with Vite, using Tailwind CSS for styling and React Router for navigation. It features a modern, glassy UI with Firebase Analytics integration and GDPR-compliant cookie consent.

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Headless UI** - Unstyled, accessible UI components
- **Heroicons** - SVG icon library
- **Firebase** - Analytics and hosting
- **Pino** - Structured logging (via backend API)

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   └── ... .jsx
│   ├── config/          # Configuration files
│   │   └── ... .js
│   ├── contexts/       # React contexts
│   │   └── ... .jsx
│   ├── hooks/           # Custom React hooks
│   │   └── ... .js
│   ├── pages/           # Page components
│   │   ├── Home.jsx
│   │   ├── LoginSignup.jsx
│   │   ├── PrivacyPolicy.jsx
│   │   └── Quiz.jsx
│   ├── utils/           # Utility functions
│   │   └── ... .js
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── public/              # Static assets
├── firebase.json        # Firebase hosting config
└── package.json
```

## Setup

### Prerequisites

- Node.js 22.x or higher
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Firebase Configuration (as JSON string)
VITE_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"...","measurementId":"..."}
```

To get Firebase config:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → General
4. Scroll to "Your apps" → Web app
5. Copy the `firebaseConfig` object and stringify it

### Development

```bash
npm run dev
```

Starts the development server at `http://localhost:5173`

### Build

```bash
npm run build
```

Creates production build in `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Key Features

### Authentication

- JWT-based authentication
- Token stored in `localStorage`
- Automatic token validation and refresh
- Protected routes with `ProtectedRoute` component
- Auth context (`AuthContext`) provides user data to all components

### Cookie Consent

- GDPR-compliant cookie banner
- Firebase Analytics only loads after consent
- Consent stored in `localStorage` (expires after 365 days)
- Can be revoked at any time

### Routing

- Public routes: `/login`, `/signup`, `/privacy-policy`
- Protected routes: `/home`, `/quiz/:id`
- Automatic redirects based on auth state

### Components

#### Reusable Components

- **Button** - Configurable button with icon support
- **Pin** - Icon button (check, x, or empty)
- **QuizOption** - Single quiz option with letter
- **QuizOptions** - Container for multiple quiz options
- **Spinner** - Loading spinner
- **CookieBanner** - Cookie consent banner

#### Page Components

- **Home** - Main dashboard page
- **LoginSignup** - Combined login/signup form
- **PrivacyPolicy** - Privacy policy page
- **Quiz** - Quiz taking interface

## API Integration

The frontend communicates with the backend API:

- **Base URL**: Configured via `VITE_API_BASE_URL`
- **Authentication**: JWT tokens sent in `Authorization` header
- **Endpoints**:
  - `POST /api/auth/login` - User login
  - `POST /api/auth/register` - User registration
  - `GET /api/questions` - Fetch questions
  - `POST /api/questions` - Create question
  - `PUT /api/questions/:id` - Update question
  - `DELETE /api/questions/:id` - Delete question

## Firebase Analytics

Firebase Analytics is integrated with cookie consent:

- Only initializes when user accepts cookies
- Automatically tracks page views on route changes
- Custom events can be tracked with `trackEvent()`
- Can be disabled when consent is revoked

### Usage

```javascript
import { trackEvent } from '../utils/analytics';

// Track custom event
trackEvent('button_click', { button_name: 'submit' });
```

## Styling

- **Tailwind CSS** - Utility-first CSS
- **Custom utilities** - `cn()` function for conditional classes
- **Glassy UI** - Backdrop blur effects throughout
- **Responsive** - Mobile-first design

## Development Guidelines

### Component Structure

```jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function MyComponent() {
  const { userData, isAuthenticated } = useAuth();
  
  return (
    <div className="...">
      {/* Component content */}
    </div>
  );
}
```

### Error Handling

- Use try-catch for async operations
- Display user-friendly error messages
- Log errors to console in development

### State Management

- Use React hooks (`useState`, `useEffect`) for local state
- Use `AuthContext` for authentication state
- Use `useCookieConsent` hook for cookie consent state

## Deployment

The frontend is deployed to Firebase Hosting via GitHub Actions. See [GitHub Actions Documentation](./GITHUB_ACTIONS.md) for details.

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy to Firebase
npx firebase deploy --only hosting --project "auto-expert-479412"
```

## Troubleshooting

### Firebase Analytics not working

1. Check that `VITE_FIREBASE_CONFIG` is set correctly
2. Verify Firebase project has Analytics enabled
3. Check browser console for errors
4. Ensure user has accepted cookies

### Authentication issues

1. Check that `VITE_API_BASE_URL` points to correct backend
2. Verify JWT token is stored in `localStorage`
3. Check browser console for API errors
4. Verify backend is running and accessible

### Build errors

1. Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
2. Clear Vite cache: `rm -rf node_modules/.vite`
3. Check for TypeScript/ESLint errors: `npm run lint`
