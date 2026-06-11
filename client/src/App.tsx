import { Navigate, Route, Routes } from "react-router";
import { useEffect } from "react";
import PageLoader from "@/components/PageLoader/PageLoader";
import ChatPage from "@/pages/chatPage/ChatPage";
import LoginPage from "@/pages/loginPage/LoginPage";
import { useAuthStore } from "@/store/useAuthStore";
import { ROUTES } from "@/const/common";
import { ConfigProvider } from "antd";

function App() {
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <PageLoader />;

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "'Montserrat', sans-serif",
          colorPrimary: "black",
          borderRadius: 10,
        },
      }}
    >
      <Routes>
        <Route
          path={ROUTES.HOME}
          element={authUser ? <ChatPage /> : <Navigate to={ROUTES.LOGIN} />}
        />
        <Route
          path={ROUTES.LOGIN}
          element={!authUser ? <LoginPage /> : <Navigate to={ROUTES.HOME} />}
        />
        <Route
          path={ROUTES.SIGNUP}
          element={!authUser ? <LoginPage /> : <Navigate to={ROUTES.HOME} />}
        />
      </Routes>
    </ConfigProvider>
  );
}
export default App;
