import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";

const PublicRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (isAuthenticated && user?.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
