import React from 'react';

// Usage: <RequireAdmin user={user}>...</RequireAdmin>
export default function RequireAdmin({ user, children }) {
  if (!user?.isAdmin) {
    return <div style={{ color: 'red', margin: 40 }}>Admin access required.</div>;
  }
  return children;
}
