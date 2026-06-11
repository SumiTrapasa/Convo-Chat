import { Navigate } from "react-router";
import { useCheckAuth } from "@/hooks/useAuth";
import PageLoader from "@/components/PageLoader/PageLoader";
import { ROUTES } from "@/const/common";
import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectPath = ROUTES.LOGIN,
}) => {
  const { data: authUser, isLoading: isCheckingAuth } = useCheckAuth();

  if (isCheckingAuth) {
    return <PageLoader />;
  }

  if (!authUser) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
