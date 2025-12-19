import { Navigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import Spinner from './Spinner';

export default function ProtectedRoute({ children }) {
  const { isLoading, isAuthenticated } = useAuth();

  // Wait for auth initialization to complete
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // After loading, check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const category = localStorage.getItem("userCategory");
  if (!category) {
    return <Navigate to="/signup" replace state={{ openCategory: true }} />;
  }

  return children;
}
