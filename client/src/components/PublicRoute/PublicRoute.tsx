import { Navigate } from "react-router";
import { useCheckAuth } from "@/hooks/useAuth";
import PageLoader from "@/components/PageLoader/PageLoader";
import { ROUTES } from "@/const/common";
import React from "react";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { data: authUser, isLoading: isCheckingAuth } = useCheckAuth();

  if (isCheckingAuth) {
    return <PageLoader />;
  }

  if (authUser) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
