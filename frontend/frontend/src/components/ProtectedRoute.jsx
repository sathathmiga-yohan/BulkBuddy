import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { getCurrentUser } from "../services/authservice";

export default function ProtectedRoute({
  children,
  allowedRoles = []
}) {
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkAuthentication = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setError(false);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const currentUser = await getCurrentUser();

        if (!cancelled) {
          setUser(currentUser);
          setError(false);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    checkAuthentication();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  if (loading) {
    return <p>Checking authentication...</p>;
  }

  if (!user || error) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
}