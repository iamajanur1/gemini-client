import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainLayout>
            <HomePage />
          </MainLayout>
        }
      />
      <Route
        path="/chat/:chatId"
        element={
          <MainLayout>
            <ChatPage />
          </MainLayout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}