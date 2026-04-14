import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage"; // ✅ rename for clarity
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import Interview from "./pages/Interview";
import Result from "./pages/Result";
import InterviewReport from "./pages/InterviewReport";


import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BreathingBackground from "./components/ui/BreathingBackground";

import { useAuthStore } from "./store/authStore";
import { useAuthListener } from "./hooks/useAuthListener";
import ProtectedRoute from "./components/ProtectedRoute";

import { ThemeProvider, useTheme } from "./components/ui/ThemeContext";

function AppContent() {
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const loading = useAuthStore((state) => state.loading);

  useAuthListener();

  useEffect(() => {
    fetchUser();
  }, []);

  const { theme } = useTheme();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <>
      {/* 🌌 GLOBAL BACKGROUND */}
      <BreathingBackground theme={theme} />

      {/* 🌈 APP */}
      <div
        className={`relative z-10 min-h-screen flex flex-col ${
          theme === "light" ? "text-gray-900" : "text-white"
        }`}
      >
        <BrowserRouter>
          {/* 🔝 NAVBAR */}
          <Navbar />

          {/* 📄 MAIN */}
          <main className="flex-1 pt-28">
            <Routes>
              <Route path="/" element={<Home />} />

              {/* 🔐 AUTH PAGE */}
              <Route path="/auth" element={<AuthPage />} />

              {/* 🔒 PROTECTED */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="/quiz" element={<Quiz />} />
              <Route path="/interview/report/:id" element={<InterviewReport />} />
              <Route path="/result" element={<Result />} />
              <Route path="/interview" element={<Interview />} />
            </Routes>
          </main>

          {/* 🔻 FOOTER */}
          <Footer />
        </BrowserRouter>
      </div>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
