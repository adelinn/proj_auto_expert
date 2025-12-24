# Frontend Integration Guide

## Base URL

**Development:** `http://localhost:5000`
**Production:** `https://your-backend-url.com`

## Health Check

```javascript
// Check if backend is alive
const response = await fetch('http://localhost:5000/health');
const data = await response.json();
// { status: 'OK', timestamp: '2024-01-01T00:00:00.000Z', environment: 'development' }
```

## CORS Configuration

Backend acceptă requesturi de la:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (Create React App)
- `http://localhost:4173` (Vite preview)

Configurează în `.env`:
