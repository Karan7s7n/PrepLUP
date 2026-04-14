"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../components/ui/ThemeContext";
import { supabase } from "../services/supabase"; // adjust path if needed
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [active, setActive] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const glass =
    theme === "light"
      ? "bg-white/20 border-white/20 text-gray-900"
      : "bg-gray-900/30 border-white/10 text-white";

  const inputStyle = `
    w-full px-4 py-3 rounded-xl 
    bg-transparent border 
    ${
      theme === "light"
        ? "border-gray-300 text-gray-900 placeholder-gray-500"
        : "border-white/20 text-white placeholder-white/50"
    }
    focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition
  `;

  // ✅ LOGIN
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      navigate("/dashboard");
    }
  };

  // ✅ SIGNUP
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Signup successful! Check your email.");
      setActive("login");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-6">
      <div
        className={`w-full max-w-md p-8 rounded-3xl backdrop-blur-xl border shadow-xl ${glass}`}
      >
        {/* Title */}
        <div className="overflow-hidden mb-6">
          <motion.div
            animate={{ x: active === "login" ? "0%" : "-50%" }}
            transition={{ duration: 0.5 }}
            className="flex w-[200%]"
          >
            <h2 className="w-1/2 text-3xl font-bold text-center">Login</h2>
            <h2 className="w-1/2 text-3xl font-bold text-center">Signup</h2>
          </motion.div>
        </div>

        {/* Toggle */}
        <div className="relative flex rounded-xl overflow-hidden border mb-6">
          <button
            onClick={() => setActive("login")}
            className={`w-1/2 py-2 z-10 ${
              active === "login" ? "text-white" : "opacity-70"
            }`}
          >
            Login
          </button>

          <button
            onClick={() => setActive("signup")}
            className={`w-1/2 py-2 z-10 ${
              active === "signup" ? "text-white" : "opacity-70"
            }`}
          >
            Signup
          </button>

          <motion.div
            animate={{ x: active === "login" ? "0%" : "100%" }}
            transition={{ duration: 0.4 }}
            className="absolute top-0 left-0 w-1/2 h-full bg-linear-to-r from-purple-500 via-violet-500 to-blue-500 rounded-xl"
          />
        </div>

        {/* Forms */}
        <div className="overflow-hidden">
          <motion.div
            animate={{ x: active === "login" ? "0%" : "-50%" }}
            transition={{ duration: 0.5 }}
            className="flex w-[200%]"
          >
            {/* LOGIN */}
            <form
              onSubmit={handleLogin}
              className="w-1/2 pr-4 space-y-4"
            >
              <input
                type="email"
                placeholder="Email Address"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputStyle}
              />

              <input
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputStyle}
              />

              <button
                disabled={loading}
                className="w-full py-3 rounded-xl bg-linear-to-r from-purple-500 via-violet-500 to-blue-500 text-white font-medium hover:opacity-90 transition"
              >
                {loading ? "Loading..." : "Login"}
              </button>

              <p className="text-center text-sm opacity-70">
                Not a member?{" "}
                <span
                  onClick={() => setActive("signup")}
                  className="text-purple-500 cursor-pointer"
                >
                  Signup now
                </span>
              </p>
            </form>

            {/* SIGNUP */}
            <form
              onSubmit={handleSignup}
              className="w-1/2 pl-4 space-y-4"
            >
              <input
                type="email"
                placeholder="Email Address"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputStyle}
              />

              <input
                type="password"
                placeholder="Password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputStyle}
              />

              <input
                type="password"
                placeholder="Confirm Password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputStyle}
              />

              <button
                disabled={loading}
                className="w-full py-3 rounded-xl bg-linear-to-r from-purple-500 via-violet-500 to-blue-500 text-white font-medium hover:opacity-90 transition"
              >
                {loading ? "Loading..." : "Signup"}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
