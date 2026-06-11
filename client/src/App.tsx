import { Route, Routes } from "react-router";
import ChatPage from "@/pages/chatPage/ChatPage";
import LoginPage from "@/pages/loginPage/LoginPage";
import { ROUTES } from "@/const/common";
import { ConfigProvider } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import PublicRoute from "./components/PublicRoute/PublicRoute";

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <Routes>
      <Route
        path={ROUTES.HOME}
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.LOGIN}
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path={ROUTES.SIGNUP}
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            fontFamily: "'Montserrat', sans-serif",
            colorPrimary: "black",
            borderRadius: 10,
          },
        }}
      >
        <AppRoutes />
      </ConfigProvider>
    </QueryClientProvider>
  );
}
export default App;
