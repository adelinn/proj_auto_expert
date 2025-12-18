import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  try {
    const raw = localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    const category = localStorage.getItem("userCategory");
    if (!category) {
      return <Navigate to="/signup" replace state={{ openCategory: true }} />;
    }

    return children;
  } catch (err) {
    return <Navigate to="/login" replace />;
  }
}
